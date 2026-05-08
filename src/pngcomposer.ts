import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

type PngImage = {
  width: number;
  height: number;
  data: Buffer;
};

type KorryImageParts = {
  base: string;
  lower: string;
  upper: string;
};

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const crcTable = makeCrcTable();

export function composeKorryImageDataUrl(id: string, state: { upper: 0 | 1; lower: 0 | 1 }): string {
  const parts = getKorryImageParts(id);
  const imagesDir = "./images/korry";
  const base = readPng(path.join(imagesDir, parts.base));

  if (state.lower === 1) {
    overlayIfPresent(base, path.join(imagesDir, parts.lower));
  }

  if (state.upper === 1) {
    overlayIfPresent(base, path.join(imagesDir, parts.upper));
  }

  return `data:image/png;base64,${encodePng(base).toString("base64")}`;
}

function getKorryImageParts(id: string): KorryImageParts {
  const [lower, upper] = id.split(/[\\/]/);
  if (!lower || !upper) {
    throw new Error(`Korry id must use lower/upper, for example ON_blue/FAULT_amber: ${id}`);
  }

  return {
    base: `${stripKorryColor(lower)}_${stripKorryColor(upper)}.png`,
    lower: `L_${lower}.png`,
    upper: `U_${upper}.png`
  };
}

function stripKorryColor(name: string) {
  return name.split("_")[0];
}

function overlayIfPresent(base: PngImage, filePath: string) {
  if (!fs.existsSync(filePath)) return;

  const layer = readPng(filePath);
  composite(base, layer);
}

function readPng(filePath: string): PngImage {
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

function composite(base: PngImage, layer: PngImage) {
  if (base.width !== layer.width || base.height !== layer.height) {
    throw new Error(`Korry image sizes differ. Base is ${base.width}x${base.height}, layer is ${layer.width}x${layer.height}.`);
  }

  for (let i = 0; i < base.data.length; i += 4) {
    const srcA = layer.data[i + 3] / 255;
    if (srcA === 0) continue;

    const dstA = base.data[i + 3] / 255;
    const outA = srcA + dstA * (1 - srcA);

    base.data[i] = blendChannel(layer.data[i], srcA, base.data[i], dstA, outA);
    base.data[i + 1] = blendChannel(layer.data[i + 1], srcA, base.data[i + 1], dstA, outA);
    base.data[i + 2] = blendChannel(layer.data[i + 2], srcA, base.data[i + 2], dstA, outA);
    base.data[i + 3] = Math.round(outA * 255);
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
