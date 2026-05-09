import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

type PngImage = {
  width: number;
  height: number;
  data: Buffer;
};

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const crcTable = makeCrcTable();

export function composeKorryImageDataUrl(id: string, state: { upper: 0 | 1; lower: 0 | 1 }): string {
  const parts = getKorryImageNames(id, state);
  const imagesDir = "./images/korry";
  const lower = readPng(path.join(imagesDir, parts.lower));
  const upper = readPng(path.join(imagesDir, parts.upper));

  const image = stackAnnunciators(upper, lower);

  return `data:image/png;base64,${encodePng(image).toString("base64")}`;
}

function getKorryImageNames(id: string, state: { upper: 0 | 1; lower: 0 | 1 }) {
  const [lower, upper] = id.split(/[\\/]/);
  if (!lower || !upper) {
    throw new Error(`Korry id must use lower/upper, for example ON_blue/FAULT_amber: ${id}`);
  }

  return {
    lower: `${state.lower === 1 ? normalizeImageName(lower) : getGreyImageName(lower)}.png`,
    upper: `${state.upper === 1 ? normalizeImageName(upper) : getGreyImageName(upper)}.png`
  };
}

function normalizeImageName(name: string) {
  return name.replace(/\.png$/i, "");
}

function getGreyImageName(name: string) {
  const normalized = normalizeImageName(name);
  const separator = normalized.lastIndexOf("_");
  if (separator < 0) {
    throw new Error(`Korry annunciator image name must include a color suffix: ${name}`);
  }

  return `${normalized.slice(0, separator)}_grey`;
}

function readPng(filePath: string): PngImage {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Korry image not found: ${filePath}`);
  }

  const png = fs.readFileSync(filePath);
  if (!png.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error(`Not a PNG file: ${filePath}`);
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  const idatChunks: Buffer[] = [];

  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.toString("ascii", offset + 4, offset + 8);
    const data = png.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      const bitDepth = data.readUInt8(8);
      colorType = data.readUInt8(9);
      if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) {
        throw new Error(`Unsupported PNG format in ${filePath}. Expected 8-bit RGB or RGBA.`);
      }
    } else if (type === "IDAT") {
      idatChunks.push(data);
    } else if (type === "IEND") {
      break;
    }
  }

  const channels = colorType === 6 ? 4 : 3;
  const inflated = zlib.inflateSync(Buffer.concat(idatChunks));
  const data = unfilterScanlines(inflated, width, height, channels);

  if (channels === 4) {
    return { width, height, data };
  }

  const rgba = Buffer.alloc(width * height * 4);
  for (let src = 0, dst = 0; src < data.length; src += 3, dst += 4) {
    rgba[dst] = data[src];
    rgba[dst + 1] = data[src + 1];
    rgba[dst + 2] = data[src + 2];
    rgba[dst + 3] = 255;
  }

  return { width, height, data: rgba };
}

function unfilterScanlines(inflated: Buffer, width: number, height: number, channels: number) {
  const stride = width * channels;
  const output = Buffer.alloc(width * height * channels);
  let src = 0;

  for (let y = 0; y < height; y++) {
    const filter = inflated[src++];
    const rowStart = y * stride;
    const prevRowStart = rowStart - stride;

    for (let x = 0; x < stride; x++) {
      const raw = inflated[src++];
      const left = x >= channels ? output[rowStart + x - channels] : 0;
      const up = y > 0 ? output[prevRowStart + x] : 0;
      const upLeft = y > 0 && x >= channels ? output[prevRowStart + x - channels] : 0;

      if (filter === 0) output[rowStart + x] = raw;
      else if (filter === 1) output[rowStart + x] = (raw + left) & 255;
      else if (filter === 2) output[rowStart + x] = (raw + up) & 255;
      else if (filter === 3) output[rowStart + x] = (raw + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) output[rowStart + x] = (raw + paeth(left, up, upLeft)) & 255;
      else throw new Error(`Unsupported PNG filter: ${filter}`);
    }
  }

  return output;
}

function stackAnnunciators(upper: PngImage, lower: PngImage): PngImage {
  if (upper.width !== lower.width || upper.height !== lower.height) {
    throw new Error(`Korry annunciator image sizes differ. Upper is ${upper.width}x${upper.height}, lower is ${lower.width}x${lower.height}.`);
  }

  const width = upper.width;
  const stackedHeight = upper.height + lower.height;
  const height = Math.max(144, stackedHeight);
  const y = Math.floor((height - stackedHeight) / 2);
  const image: PngImage = {
    width,
    height,
    data: Buffer.alloc(width * height * 4)
  };

  compositeAt(image, upper, 0, y);
  compositeAt(image, lower, 0, y + upper.height);

  return image;
}

function compositeAt(base: PngImage, layer: PngImage, xOffset: number, yOffset: number) {
  if (xOffset < 0 || yOffset < 0 || xOffset + layer.width > base.width || yOffset + layer.height > base.height) {
    throw new Error(`Korry layer does not fit canvas. Canvas is ${base.width}x${base.height}, layer is ${layer.width}x${layer.height} at ${xOffset},${yOffset}.`);
  }

  for (let y = 0; y < layer.height; y++) {
    for (let x = 0; x < layer.width; x++) {
      const src = (y * layer.width + x) * 4;
      const dst = ((y + yOffset) * base.width + x + xOffset) * 4;
      const srcA = layer.data[src + 3] / 255;
      if (srcA === 0) continue;

      const dstA = base.data[dst + 3] / 255;
      const outA = srcA + dstA * (1 - srcA);

      base.data[dst] = blendChannel(layer.data[src], srcA, base.data[dst], dstA, outA);
      base.data[dst + 1] = blendChannel(layer.data[src + 1], srcA, base.data[dst + 1], dstA, outA);
      base.data[dst + 2] = blendChannel(layer.data[src + 2], srcA, base.data[dst + 2], dstA, outA);
      base.data[dst + 3] = Math.round(outA * 255);
    }
  }
}

function blendChannel(src: number, srcA: number, dst: number, dstA: number, outA: number) {
  if (outA === 0) return 0;
  return Math.round((src * srcA + dst * dstA * (1 - srcA)) / outA);
}

function encodePng(image: PngImage) {
  const stride = image.width * 4;
  const raw = Buffer.alloc((stride + 1) * image.height);

  for (let y = 0; y < image.height; y++) {
    const rawRow = y * (stride + 1);
    raw[rawRow] = 0;
    image.data.copy(raw, rawRow + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    PNG_SIGNATURE,
    pngChunk("IHDR", Buffer.concat([
      uint32(image.width),
      uint32(image.height),
      Buffer.from([8, 6, 0, 0, 0])
    ])),
    pngChunk("IDAT", zlib.deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0))
  ]);
}

function pngChunk(type: string, data: Buffer) {
  const typeBuffer = Buffer.from(type, "ascii");
  return Buffer.concat([
    uint32(data.length),
    typeBuffer,
    data,
    uint32(crc32(Buffer.concat([typeBuffer, data])))
  ]);
}

function uint32(value: number) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(value >>> 0, 0);
  return buffer;
}

function paeth(left: number, up: number, upLeft: number) {
  const p = left + up - upLeft;
  const pa = Math.abs(p - left);
  const pb = Math.abs(p - up);
  const pc = Math.abs(p - upLeft);
  if (pa <= pb && pa <= pc) return left;
  if (pb <= pc) return up;
  return upLeft;
}

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let i = 0; i < table.length; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
}

function crc32(buffer: Buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
