import streamDeck, { action, KeyUpEvent, KeyDownEvent, SingletonAction, WillAppearEvent, WillDisappearEvent, DidReceiveSettingsEvent } from "@elgato/streamdeck";
import { midiService } from "../midiservice";
import { buttonRegistry, ButtonConfig } from "../buttonregistry";

abstract class BaseMIDIBtn extends SingletonAction<MIDIBtnConfig> {

	private settings: MIDIBtnConfig = { id: "1" };
	protected readonly fixedType?: MIDIBtnType;

	override async onWillAppear(ev: WillAppearEvent<MIDIBtnConfig>) {
		this.settings = withActionType(ev.payload.settings, this.fixedType);

		buttonRegistry.registerContext(this.settings.id, ev.action);
		buttonRegistry.registerOrUpdateButton(this.settings, ev.action);
	}

	override async onWillDisappear(ev: WillDisappearEvent<MIDIBtnConfig>) {
		buttonRegistry.unregisterContext(ev.payload.settings.id, ev.action);
	}

	override async onKeyDown(ev: KeyDownEvent<MIDIBtnConfig>): Promise<void> {
		const settings = withActionType(ev.payload.settings, this.fixedType);
		const btn = buttonRegistry.getButton(settings.id, ev.action);
		const midiOutput = getMidiOut(btn, settings);

		if (settings.id == "fader") {
			await faders();
		}

		streamDeck.logger.debug(`Button pressed ${settings.id} (${btn?.type ?? settings.type})`);
		if (!midiOutput) {
			streamDeck.logger.warn(`MIDI output not configured in btn ${settings.id} (${btn?.type ?? settings.type})`);
			return;
		}
		midiService.sendNoteOn(midiOutput.note, midiOutput.channel);
	}

	override async onKeyUp(ev: KeyUpEvent<MIDIBtnConfig>): Promise<void> {
		const settings = withActionType(ev.payload.settings, this.fixedType);
		const btn = buttonRegistry.getButton(settings.id, ev.action);
		const midiOutput = getMidiOut(btn, settings);

		streamDeck.logger.debug(`Button released ${settings.id} (${btn?.type ?? settings.type})`);

		if (!midiOutput) return;
		midiService.sendNoteOff(midiOutput.note, midiOutput.channel);
	}

	override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<MIDIBtnConfig>) {
		buttonRegistry.unregisterContext(this.settings.id, ev.action);
		this.settings = withActionType(ev.payload.settings, this.fixedType);
		buttonRegistry.registerContext(this.settings.id, ev.action);
		buttonRegistry.registerOrUpdateButton(this.settings, ev.action);
	}
}

@action({ UUID: "com.flypiet.simmidi.midiautobtn" })
export class MIDIAutomaticButton extends BaseMIDIBtn {
	protected override readonly fixedType = "auto";
}

@action({ UUID: "com.flypiet.simmidi.midikorrybtn" })
export class MIDIKorryButton extends BaseMIDIBtn {
	protected override readonly fixedType = "korry";
}

/**
 * Settings for {@link SendMIDI}.
 */
type MIDIRule = {
	value: number;
	title?: string;
	image?: string;
	state?: number;
};

type MIDIBtnType = "auto" | "korry";

type MIDIBtnConfig = {
	id: string;
	type?: MIDIBtnType;
	channel?: number;
	notecontroller?: number;
	rules?: MIDIRule[];
};

function withActionType(settings: MIDIBtnConfig | undefined, fixedType?: MIDIBtnType): MIDIBtnConfig {
	const type = fixedType ?? normalizeActionType(settings?.type) ?? "auto";

	return {
		id: settings?.id ?? "1",
		...(settings ?? {}),
		type
	};
}

function normalizeActionType(type: unknown): MIDIBtnType | undefined {
	return type === "auto" || type === "korry" ? type : undefined;
}

function delay(ms: number) {
	return new Promise<void>(resolve => setTimeout(resolve, ms));
}

async function faders() {
	const NUM_FADERS = 16;
	const BASE_CONTROLLER = 16; // <- anpassen! erster Fader-CC
	const CHANNEL = 1;
	let t = 0;
	const SPEED = 0.05;      // Geschwindigkeit der Welle
	const PHASE_SHIFT = Math.PI / 4; // Versatz zwischen Fadern

	for (let rep = 0; rep < 200; rep++) {
		streamDeck.logger.debug("loop", rep);
		for (let i = 0; i < NUM_FADERS; i++) {
			const phase = t + i * PHASE_SHIFT;

			// Sinus von -1..1 auf 0..127 skalieren
			//const value = Math.round((Math.sin(phase) + 1) * 63.5);
			const value = Math.round((Math.sin(phase) + 1) * 50);

			const controller = BASE_CONTROLLER + i;

			midiService.sendCC(value, controller, CHANNEL);
			await delay(2);
		}

		t += SPEED;
	}
}

function getMidiOut(btn: ButtonConfig | undefined, settings: MIDIBtnConfig) {
	const note = toMidiNumber(btn?.notecontroller ?? settings.notecontroller);
	const channel = toMidiChannel(btn?.channel ?? settings.channel);
	const type = btn?.type ?? settings.type;

	if (note === undefined || channel === undefined) return undefined;
	if (type === "korry" && channel >= 16) return undefined;

	return { note, channel };
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
