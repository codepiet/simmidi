#!/usr/bin/env node

import { WebMidi } from "webmidi";

const DEFAULT_INTERVAL_MS = 1000;
const DEFAULT_CHANNEL = 1;
const DEFAULT_VALUES = [0, 1, 2];

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

try {
  await WebMidi.enable();

  if (options.list) {
    printPorts();
    await WebMidi.disable();
    process.exit(0);
  }

  const deviceName = options.device ?? readEnv("SIMMIDI_DEVICE", "MIDI_DEVICE");
  const controller = readNumberOption(
    options.controller ?? readEnv("SIMMIDI_CONTROLLER", "SIMMIDI_CC", "MIDI_CC"),
    "controller",
    0,
    127
  );
  const channel = readNumberOption(
    options.channel ?? readEnv("SIMMIDI_CHANNEL", "MIDI_CHANNEL") ?? DEFAULT_CHANNEL,
    "channel",
    1,
    16
  );
  const intervalMs = readNumberOption(
    options.interval ?? readEnv("SIMMIDI_INTERVAL_MS") ?? DEFAULT_INTERVAL_MS,
    "interval",
    1
  );
  const korry = options.korry ?? readBooleanEnv("SIMMIDI_KORRY");
  const values = readValues(options.values ?? readEnv("SIMMIDI_VALUES") ?? DEFAULT_VALUES.join(","));

  if (!deviceName) {
    fail("Missing MIDI device. Set SIMMIDI_DEVICE or pass --device <name>.");
  }

  if (controller === null) {
    fail("Missing MIDI controller. Set SIMMIDI_CONTROLLER or pass --controller <0-127>.");
  }

  const output = WebMidi.outputs.find(port => port.name === deviceName);
  if (!output) {
    fail(
      `MIDI output "${deviceName}" not found.\n` +
      `Available outputs: ${formatPortNames(WebMidi.outputs)}`
    );
  }

  await output.open();

  if (korry && channel >= 16) {
    fail("Korry mode needs a base channel between 1 and 15 because upper uses channel + 1.");
  }

  let stopped = false;
  const stop = async () => {
    stopped = true;
    await output.close();
    await WebMidi.disable();
    process.exit(0);
  };

  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);

  if (korry) {
    console.log(
      `Sending Korry MIDI CC ${controller} to "${output.name}" every ${intervalMs}ms: ` +
      `lower on channel ${channel}, upper on channel ${channel + 1}.`
    );
    console.log("Press Ctrl+C to stop.");

    while (!stopped) {
      sendControlChange(output, controller, 1, channel, "lower on");
      sendControlChange(output, controller, 0, channel + 1, "upper off");
      await delay(intervalMs);
      if (stopped) break;

      sendControlChange(output, controller, 0, channel, "lower off");
      sendControlChange(output, controller, 1, channel + 1, "upper on");
      await delay(intervalMs);
      if (stopped) break;

      sendControlChange(output, controller, 1, channel, "lower on");
      sendControlChange(output, controller, 1, channel + 1, "upper on");
      await delay(intervalMs);
      if (stopped) break;

      sendControlChange(output, controller, 0, channel, "lower off");
      sendControlChange(output, controller, 0, channel + 1, "upper off");
      await delay(intervalMs);
    }
  } else {
  console.log(
    `Sending MIDI CC ${controller} on channel ${channel} to "${output.name}" ` +
    `every ${intervalMs}ms with values ${values.join(", ")}.`
  );
  console.log("Press Ctrl+C to stop.");

  let index = 0;
  const sendNext = () => {
    const value = values[index % values.length];
    sendControlChange(output, controller, value, channel);
    index += 1;
  };

  sendNext();
  const timer = setInterval(sendNext, intervalMs);

  const stopNormal = async () => {
    clearInterval(timer);
    await stop();
  };

  process.removeListener("SIGINT", stop);
  process.removeListener("SIGTERM", stop);
  process.once("SIGINT", stopNormal);
  process.once("SIGTERM", stopNormal);
  }
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}

function parseArgs(args) {
  const parsed = {};

  for (let i = 0; i < args.length; i += 1) {
    const { name: arg, value } = splitOption(args[i]);
    const next = () => value ?? args[++i];

    switch (arg) {
      case "--device":
      case "-d":
        parsed.device = next();
        break;
      case "--controller":
      case "--cc":
      case "-c":
        parsed.controller = next();
        break;
      case "--channel":
      case "-n":
        parsed.channel = next();
        break;
      case "--interval":
      case "-i":
        parsed.interval = next();
        break;
      case "--values":
      case "-v":
        parsed.values = next();
        break;
      case "--korry":
      case "-k":
        rejectValue(arg, value);
        parsed.korry = true;
        break;
      case "--list":
      case "-l":
        rejectValue(arg, value);
        parsed.list = true;
        break;
      case "--help":
      case "-h":
        rejectValue(arg, value);
        parsed.help = true;
        break;
      default:
        fail(`Unknown option: ${arg}`);
    }
  }

  return parsed;
}

function sendControlChange(output, controller, value, channel, label = "") {
  output.sendControlChange(controller, value, { channels: channel });
  const suffix = label ? ` (${label})` : "";
  console.log(`${new Date().toLocaleTimeString()} ch ${channel} CC ${controller} = ${value}${suffix}`);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function splitOption(arg) {
  const equalsIndex = arg.indexOf("=");
  if (equalsIndex === -1) return { name: arg, value: undefined };

  return {
    name: arg.slice(0, equalsIndex),
    value: arg.slice(equalsIndex + 1)
  };
}

function readBooleanEnv(...names) {
  const value = readEnv(...names);
  if (value === undefined) return false;

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function rejectValue(arg, value) {
  if (value !== undefined) fail(`${arg} does not accept a value.`);
}

function readEnv(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (typeof value === "string" && value.trim() !== "") return value.trim();
  }

  return undefined;
}

function readNumberOption(value, label, min, max = Number.MAX_SAFE_INTEGER) {
  const number = Number(value);

  if (value === undefined || value === null || value === "") return null;
  if (!Number.isInteger(number) || number < min || number > max) {
    fail(`${label} must be an integer between ${min} and ${max}.`);
  }

  return number;
}

function readValues(raw) {
  const values = String(raw)
    .split(",")
    .map(value => readNumberOption(value.trim(), "value", 0, 127));

  if (values.length === 0 || values.some(value => value === null)) {
    fail("values must be a comma-separated list of MIDI values between 0 and 127.");
  }

  return values;
}

function printPorts() {
  console.log("=== MIDI OUTPUTS ===");
  WebMidi.outputs.forEach((output, index) => {
    console.log(`${index}: ${output.name}`);
  });

  console.log("\n=== MIDI INPUTS ===");
  WebMidi.inputs.forEach((input, index) => {
    console.log(`${index}: ${input.name}`);
  });
}

function formatPortNames(ports) {
  return ports.map(port => port.name).join(", ") || "none";
}

function printHelp() {
  console.log(`
MIDI CC simulator

Usage:
  npm run midi:sim -- --device StreamDeck --controller 42

Options:
  -d, --device <name>       MIDI output name. Env: SIMMIDI_DEVICE or MIDI_DEVICE
  -c, --controller <0-127>  MIDI CC controller. Env: SIMMIDI_CONTROLLER, SIMMIDI_CC or MIDI_CC
  -n, --channel <1-16>      MIDI channel. Default: 1. Env: SIMMIDI_CHANNEL
  -i, --interval <ms>       Send interval. Default: 1000. Env: SIMMIDI_INTERVAL_MS
  -v, --values <list>       Comma-separated values. Default: 0,1,2. Env: SIMMIDI_VALUES
  -k, --korry               Korry sequence: lower on, upper on, both off. Env: SIMMIDI_KORRY=1
  -l, --list                List available MIDI ports
  -h, --help                Show this help
`.trim());
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
