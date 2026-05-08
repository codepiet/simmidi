import streamDeck from "@elgato/streamdeck";
import { WebMidi } from "webmidi";
import fs from "node:fs";
import path from "node:path";
import { buttonRegistry } from "./buttonregistry";

class MidiService {
  private output: any = null;

  async init() {
    try {
      await WebMidi.enable();

      streamDeck.logger.debug("=== MIDI OUTPUTS ===");
      WebMidi.outputs.forEach((output, index) => {
        streamDeck.logger.debug(`${index}: ${output.name}`);
      });

      streamDeck.logger.debug("=== MIDI INPUTS ===");
      WebMidi.inputs.forEach((input, index) => {
        streamDeck.logger.debug(`${index}: ${input.name}`);
      });
      
      const configPath = path.join(__dirname, "../config.json");
      let midiDeviceName: string | null = null;

      try {
        const raw = fs.readFileSync(configPath, "utf-8");
        const config = JSON.parse(raw);
        midiDeviceName = config.midiDevice;
      } catch (e) {
        streamDeck.logger.error("could not load config", e);
      }

      streamDeck.logger.debug("MIDI ready");
      this.output = WebMidi.outputs.find(o => o.name === midiDeviceName);
      streamDeck.logger.debug("using MIDI output: ", this.output?.name);
      const input = WebMidi.inputs.find(o => o.name === midiDeviceName);
      streamDeck.logger.debug("using MIDI input: ", input?.name);

      input?.addListener("controlchange", e => {
        const channel = e.message.channel;
        const cc = e.controller.number;
        const value = Math.round(Number(e.value) * 127);

        streamDeck.logger.debug("control message", channel, cc, value);

        buttonRegistry.handleCC(value, channel, cc);
      });
    } catch (err) {
      streamDeck.logger.error("WebMidi error:", err);
    }

  }

  sendCC(value: number, controller: number, channel: number) {
    if (!this.output) return;

    this.output.sendControlChange(controller, value, { channels: channel });
  }

  sendNoteOn(note: number, channel: number, velocity = 127) {
    //streamDeck.logger.debug("OUTPUT", this.output?.name);
    if (!this.output) return;

    this.output.sendNoteOn(note, {
      channels: channel,
      velocity
    });
  }

  sendNoteOff(note: number, channel: number) {
    //streamDeck.logger.debug("OUTPUT", this.output?.name);
    if (!this.output) return;

    this.output.sendNoteOff(note, {
      channels: channel
    });
  }
}

export const midiService = new MidiService();
