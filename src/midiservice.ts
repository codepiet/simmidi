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

  private readonly handleControlChange = (e: any) => {
    const channel = e.message.channel;
    const cc = e.controller.number;
    const value = Math.round(Number(e.value) * 127);

    streamDeck.logger.debug("control message", channel, cc, value);

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
      streamDeck.logger.error(`MIDI ${label} failed; reconnecting`, err);
      this.markDisconnected();
      void this.reconnect(`send failed: ${label}`);
    }
  }

  private getReadyOutput(label: string) {
    if (this.isPortReady(this.output)) return this.output;

    streamDeck.logger.warn(`MIDI output not ready for ${label}; reconnecting`);
    void this.reconnect(`output not ready: ${label}`);
    return null;
  }

  private startHealthCheck() {
    if (this.healthCheckTimer) return;

    this.healthCheckTimer = setInterval(() => {
      if (!this.isConnectionHealthy()) {
        void this.reconnect("health check");
      }
    }, HEALTH_CHECK_INTERVAL_MS);
  }

  private isConnectionHealthy() {
    return this.isPortReady(this.input) && this.isPortReady(this.output);
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
        this.markDisconnected();
        return false;
      }

      const input = WebMidi.inputs.find(port => port.name === this.midiDeviceName);
      const output = WebMidi.outputs.find(port => port.name === this.midiDeviceName);

      if (!input || !output) {
        this.logMissingDevice(reason);
        this.markDisconnected();
        return false;
      }

      await this.openPort(input, "input");
      await this.openPort(output, "output");

      if (!this.isPortReady(input) || !this.isPortReady(output)) {
        streamDeck.logger.warn(
          `MIDI device "${this.midiDeviceName}" found but not ready ` +
          `(input: ${describePort(input)}, output: ${describePort(output)})`
        );
        this.markDisconnected();
        return false;
      }

      this.bindInput(input);
      this.output = output;

      streamDeck.logger.info(`MIDI connected to "${this.midiDeviceName}" (${reason})`);
      return true;
    } catch (err) {
      streamDeck.logger.error(`MIDI reconnect failed (${reason})`, err);
      this.markDisconnected();
      return false;
    }
  }

  private bindInput(input: any) {
    if (this.input === input && input.hasListener?.("controlchange", this.handleControlChange)) return;

    this.unbindInput();
    this.input = input;
    this.input.addListener("controlchange", this.handleControlChange);
    streamDeck.logger.debug("using MIDI input: ", this.input.name);
  }

  private unbindInput() {
    if (!this.input) return;

    try {
      this.input.removeListener?.("controlchange", this.handleControlChange);
    } catch (err) {
      streamDeck.logger.warn("could not remove MIDI input listener", err);
    }
  }

  private markDisconnected() {
    this.unbindInput();
    this.input = null;
    this.output = null;
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

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

function describePort(port: any) {
  return `state=${port?.state ?? "unknown"}, connection=${port?.connection ?? "unknown"}`;
}

function formatPortNames(ports: any[]) {
  return ports.map(port => port.name).join(", ") || "none";
}
