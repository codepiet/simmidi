import streamDeck from "@elgato/streamdeck";
import { composeKorryImageDataUrl } from "./pngcomposer";

export interface ButtonConfig {
  id: string;

  type?: "auto" | "korry";

  channel?: number;
  notecontroller?: number;
}

type KorryState = {
  upper: 0 | 1;
  lower: 0 | 1;
};

type KorryPart = keyof KorryState;

type MidiIn = {
  channel: number;
  controller: number;
  korryPart?: KorryPart;
};

export class ButtonRegistry {
  private buttons = new Map<string, ButtonConfig>();

  // Mapping: internal button key -> StreamDeck contexts
  private contexts = new Map<string, Set<any>>();

  private korryStates = new Map<string, KorryState>();

  // Wird von den MIDI-Button-Actions aufgerufen.
  registerContext(buttonId: string, context: any) {
    const key = getButtonKey(buttonId, context);
    if (!this.contexts.has(key)) {
      this.contexts.set(key, new Set());
    }

    this.contexts.get(key)!.add(context);
  }

  unregisterContext(buttonId: string, context: any) {
    this.contexts.get(getButtonKey(buttonId, context))?.delete(context);
  }

  registerOrUpdateButton(partial: Partial<ButtonConfig>, context?: any) {
    if (!partial.id) return;

    const key = getButtonKey(partial.id, context);
    const existing = this.buttons.get(key) ?? this.buttons.get(partial.id);

    const btn: ButtonConfig = {
      ...(existing ?? {}),
      ...partial
    } as ButtonConfig;

    this.buttons.set(key, btn);

    if (btn.type === "korry") {
      void this.updateKorryImage(key, btn);
    }
  }

  // 👉 MIDI kommt hier zentral rein
  handleCC(value: number, channel?: number, controller?: number) {
    streamDeck.logger.debug("------------------------------------------###");
    for (const [key, btn] of this.buttons.entries()) {
      //streamDeck.logger.debug("checking btn:", id);

      const midiInputs = getMidiIns(btn);

      for (const midiInput of midiInputs) {
        if (midiInput.channel === channel && midiInput.controller === controller) {
          streamDeck.logger.debug("found btn for this event:", key);
          this.applyState(key, btn, value, midiInput.korryPart);
        }
      }
    }
    streamDeck.logger.debug("------------------------------------------###");
  }

  private applyState(key: string, btn: ButtonConfig, value: number, korryPart?: KorryPart) {
    const type = btn.type;
    if (type == "auto") {
      const image = "images/" + btn.id + value + ".png";
      const contexts = this.contexts.get(key);
      if (!contexts) return;

      streamDeck.logger.debug("contexts is not empty:", contexts.size, " entries");

      for (const ctx of contexts) {
        streamDeck.logger.debug("setting new auto image in", key, image);
        ctx.setImage(image);
      }
    } else if (type === "korry") {
      if (!korryPart) {
        streamDeck.logger.warn("Korry event without upper/lower part", key, value);
        return;
      }

      const partValue = parseKorryPartValue(value);
      if (partValue === undefined) {
        streamDeck.logger.warn("unsupported Korry value", key, value);
        return;
      }

      const state = {
        ...this.getKorryState(key),
        [korryPart]: partValue
      };

      this.korryStates.set(key, state);
      streamDeck.logger.debug("MIDIKorry state", key, " / lower: ", state.lower, " / upper: ", state.upper);
      void this.updateKorryImage(key, btn);
    }

  }

  getButton(id: string, context?: any): ButtonConfig | undefined {
    return this.buttons.get(getButtonKey(id, context)) ?? this.buttons.get(id);
  }

  getKorryState(id: string): KorryState {
    return this.korryStates.get(id) ?? { upper: 0, lower: 0 };
  }

  private async updateKorryImage(key: string, btn: ButtonConfig) {
    const contexts = this.contexts.get(key);
    if (!contexts || btn.type !== "korry") return;

    try {
      const image = composeKorryImageDataUrl(btn.id, this.getKorryState(key));
      for (const ctx of contexts) {
        await ctx.setImage(image);
      }
    } catch (err) {
      streamDeck.logger.error("could not compose Korry image", key, err);
    }
  }
}

export const buttonRegistry = new ButtonRegistry();

function getMidiIns(btn: ButtonConfig): MidiIn[] {
  const type = btn.type;

  if (type === "auto") {
    const controller = toMidiNumber(btn.notecontroller);
    const channel = toMidiChannel(btn.channel);
    return controller === undefined || channel === undefined ? [] : [{ channel, controller }];
  }

  if (type === "korry") {
    const controller = toMidiNumber(btn.notecontroller);
    const channel = toMidiChannel(btn.channel);
    return controller === undefined || channel === undefined || channel >= 16 ? [] : [
      { channel, controller, korryPart: "lower" },
      { channel: channel + 1, controller, korryPart: "upper" }
    ];
  }

  return [];
}

function toMidiNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toMidiChannel(value: unknown): number | undefined {
  const parsed = toMidiNumber(value);
  if (parsed === undefined || !Number.isInteger(parsed) || parsed < 1 || parsed > 16) return undefined;

  return parsed;
}

function parseKorryPartValue(value: number): 0 | 1 | undefined {
  if (!Number.isFinite(value) || value < 0 || value > 127) return undefined;

  return value > 0 ? 1 : 0;
}

function getButtonKey(buttonId: string, context?: any) {
  return typeof context?.id === "string" ? context.id : buttonId;
}
