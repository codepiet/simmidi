import streamDeck from "@elgato/streamdeck";
import { WebMidi } from "webmidi";
import fs from "node:fs";
import path from "node:path";
import { buttonRegistry } from "./buttonregistry";

const HEALTH_CHECK_INTERVAL_MS = 10_000;
const RECONNECT_THROTTLE_MS = 2_000;
const MISSING_DEVICE_LOG_INTERVAL_MS = 30_000;

class MidiService {
  private input: any = null;
  private output: any = null;
  private midiDeviceName: string | null = null;
  private reconnectPromise: Promise<boolean> | null = null;
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private webMidiListenersBound = false;
  private lastReconnectAttempt = 0;
  private lastMissingDeviceLog = 0;

  private readonly handleMidiMessage = (e: any) => {
    const data = getMidiData(e);
    if (!data || data.length < 3) return;

    const status = data[0];
    const command = status >> 4;
    if (command !== 0xb) return;

    const channel = (status & 0x0f) + 1;
    const cc = data[1];
    const value = data[2];

    streamDeck.logger.debug("midi cc message", channel, cc, value);
    buttonRegistry.handleCC(value, channel, cc);
  };

  async init() {
    try {
      await this.ensureWebMidiEnabled();
      this.midiDeviceName = this.loadMidiDeviceName();
      this.logPorts();
      await this.reconnect("startup", true);
      this.bindWebMidiListeners();
      this.startHealthCheck();
    } catch (err) {
      streamDeck.logger.error("WebMidi error:", err);
    }
  }

  sendCC(value: number, controller: number, channel: number) {
    this.send("control change", output => {
      output.sendControlChange(controller, value, { channels: channel });
    });
  }

  sendNoteOn(note: number, channel: number, velocity = 127) {
    this.send("note on", output => {
      output.sendNoteOn(note, {
        channels: channel,
        velocity
      });
    });
  }

  sendNoteOff(note: number, channel: number) {
    this.send("note off", output => {
      output.sendNoteOff(note, {
        channels: channel
      });
    });
  }

  private send(label: string, action: (output: any) => void) {
    const output = this.getReadyOutput(label);
    if (!output) return;

    try {
      action(output);
    } catch (err) {
      streamDeck.logger.error(`MIDI ${label} failed; reconnecting output`, err);
      this.output = null;
      void this.reconnect(`send failed: ${label}`);
    }
  }

  private getReadyOutput(label: string) {
    if (this.isPortReady(this.output)) return this.output;

    streamDeck.logger.warn(`MIDI output not ready for ${label}; reconnecting output`);
    this.output = null;
    void this.reconnect(`output not ready: ${label}`);
    return null;
  }

  private startHealthCheck() {
    if (this.healthCheckTimer) return;

    this.healthCheckTimer = setInterval(() => {
      if (!this.isPortReady(this.input) || !this.isPortReady(this.output)) {
        void this.reconnect("health check");
      }
    }, HEALTH_CHECK_INTERVAL_MS);
  }

  private async reconnect(reason: string, immediate = false): Promise<boolean> {
    if (this.reconnectPromise) return this.reconnectPromise;

    const now = Date.now();
    const waitMs = immediate ? 0 : Math.max(0, RECONNECT_THROTTLE_MS - (now - this.lastReconnectAttempt));
    this.lastReconnectAttempt = now + waitMs;

    this.reconnectPromise = this.reconnectAfterDelay(reason, waitMs).finally(() => {
      this.reconnectPromise = null;
    });

    return this.reconnectPromise;
  }

  private async reconnectAfterDelay(reason: string, waitMs: number) {
    if (waitMs > 0) await delay(waitMs);

    try {
      await this.ensureWebMidiEnabled();
      this.midiDeviceName = this.loadMidiDeviceName();

      if (!this.midiDeviceName) {
        streamDeck.logger.warn("MIDI device name is not configured");
        this.clearInput();
        this.output = null;
        return false;
      }

      const input = WebMidi.inputs.find(port => port.name === this.midiDeviceName);
      const output = WebMidi.outputs.find(port => port.name === this.midiDeviceName);

      const inputReady = await this.connectInput(input, reason);
      const outputReady = await this.connectOutput(output, reason);

      if (!input || !output) {
        this.logMissingDevice(reason);
      }

      if (inputReady || outputReady) {
        streamDeck.logger.info(
          `MIDI status for "${this.midiDeviceName}" (${reason}): ` +
          `input ${inputReady ? "ready" : "not ready"}, output ${outputReady ? "ready" : "not ready"}`
        );
      }

      return inputReady && outputReady;
    } catch (err) {
      streamDeck.logger.error(`MIDI reconnect failed (${reason})`, err);
      return false;
    }
  }

  private async connectInput(input: any, reason: string) {
    if (!input) {
      this.clearInput();
      return false;
    }

    try {
      await this.openPort(input, "input");

      if (!this.isPortReady(input)) {
        streamDeck.logger.warn(`MIDI input "${input.name}" not ready (${reason}): ${describePort(input)}`);
        this.clearInput();
        return false;
      }

      this.bindInput(input);
      return true;
    } catch (err) {
      streamDeck.logger.error(`MIDI input reconnect failed (${reason})`, err);
      this.clearInput();
      return false;
    }
  }

  private async connectOutput(output: any, reason: string) {
    if (!output) {
      this.output = null;
      return false;
    }

    try {
      await this.openPort(output, "output");

      if (!this.isPortReady(output)) {
        streamDeck.logger.warn(`MIDI output "${output.name}" not ready (${reason}): ${describePort(output)}`);
        this.output = null;
        return false;
      }

      this.output = output;
      streamDeck.logger.debug("using MIDI output: ", this.output.name);
      return true;
    } catch (err) {
      streamDeck.logger.error(`MIDI output reconnect failed (${reason})`, err);
      this.output = null;
      return false;
    }
  }

  private bindInput(input: any) {
    if (this.input === input && input.hasListener?.("midimessage", this.handleMidiMessage)) return;

    this.clearInput();
    this.input = input;
    this.input.addListener("midimessage", this.handleMidiMessage);
    streamDeck.logger.debug("using MIDI input: ", this.input.name);
  }

  private clearInput() {
    if (!this.input) return;

    try {
      this.input.removeListener?.("midimessage", this.handleMidiMessage);
    } catch (err) {
      streamDeck.logger.warn("could not remove MIDI input listener", err);
    } finally {
      this.input = null;
    }
  }

  private bindWebMidiListeners() {
    if (this.webMidiListenersBound) return;

    WebMidi.addListener("connected", (e: any) => {
      streamDeck.logger.info(`MIDI port connected: ${e.port?.name ?? "unknown"}`);
      void this.reconnect("port connected");
    });

    WebMidi.addListener("disconnected", (e: any) => {
      streamDeck.logger.warn(`MIDI port disconnected: ${e.port?.name ?? "unknown"}`);
      void this.reconnect("port disconnected");
    });

    WebMidi.addListener("portschanged", () => {
      void this.reconnect("ports changed");
    });

    this.webMidiListenersBound = true;
  }

  private async ensureWebMidiEnabled() {
    if (WebMidi.enabled) return;
    await WebMidi.enable();
  }

  private async openPort(port: any, type: "input" | "output") {
    if (port.connection === "open") return;

    streamDeck.logger.debug(`opening MIDI ${type}: ${port.name}`);
    await port.open();
  }

  private isPortReady(port: any) {
    return Boolean(port && port.state === "connected" && port.connection === "open");
  }

  private loadMidiDeviceName() {
    const configPath = path.join(__dirname, "../config.json");

    try {
      const raw = fs.readFileSync(configPath, "utf-8");
      const config = JSON.parse(raw);
      return typeof config.midiDevice === "string" && config.midiDevice.trim() !== ""
        ? config.midiDevice
        : null;
    } catch (e) {
      streamDeck.logger.error("could not load config", e);
      return null;
    }
  }

  private logPorts() {
    streamDeck.logger.debug("=== MIDI OUTPUTS ===");
    WebMidi.outputs.forEach((output, index) => {
      streamDeck.logger.debug(`${index}: ${output.name} (${describePort(output)})`);
    });

    streamDeck.logger.debug("=== MIDI INPUTS ===");
    WebMidi.inputs.forEach((input, index) => {
      streamDeck.logger.debug(`${index}: ${input.name} (${describePort(input)})`);
    });
  }

  private logMissingDevice(reason: string) {
    const now = Date.now();
    if (now - this.lastMissingDeviceLog < MISSING_DEVICE_LOG_INTERVAL_MS) return;

    this.lastMissingDeviceLog = now;
    streamDeck.logger.warn(
      `MIDI device "${this.midiDeviceName}" not found (${reason}). ` +
      `Available inputs: ${formatPortNames(WebMidi.inputs)}; outputs: ${formatPortNames(WebMidi.outputs)}`
    );
  }
}

export const midiService = new MidiService();

function getMidiData(e: any): number[] | undefined {
  if (Array.isArray(e.message?.data)) return e.message.data;
  if (Array.isArray(e.rawData)) return Array.from(e.rawData);
  if (Array.isArray(e.data)) return Array.from(e.data);
  if (e.message?.data instanceof Uint8Array) return Array.from(e.message.data);
  if (e.rawData instanceof Uint8Array) return Array.from(e.rawData);
  if (e.data instanceof Uint8Array) return Array.from(e.data);

  return undefined;
}

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

function describePort(port: any) {
  return `state=${port?.state ?? "unknown"}, connection=${port?.connection ?? "unknown"}`;
}

function formatPortNames(ports: any[]) {
  return ports.map(port => port.name).join(", ") || "none";
}
