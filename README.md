# SIM-Midi – A StreamDeck Plugin for MobiFlight

SIM-Midi provides an easy and flexible way to connect your StreamDeck to MobiFlight via MIDI.

The original goal of this project was to build all Airbus A320 panels using StreamDeck devices first, and later replace them step-by-step with real hardware built using the classic Arduino + MobiFlight workflow.  
This approach allows all button logic to be defined inside MobiFlight from the beginning, making the later transition to physical hardware seamless.

There are already several excellent plugins available for communicating with MSFS2024, such as PilotsDeck, AxisAndOhs, and existing MIDI plugins.  
However, my primary focus was simplicity:

- easy button configuration
- native MobiFlight workflows
- no payware dependencies

This is especially important because I use the setup on many different computers together with my students.

Most of the complexity is hidden inside the MobiFlight MIDI board configuration, so the actual setup process inside the StreamDeck application remains straightforward and easy to maintain.

A tutorial and working example are included in the `mobiflight` folder.  
Please read the [example documentation](doc/doc.md).

---

# A Huge THANK YOU

A special thanks goes to Guenseli, who created the fantastic [Icon Collection](https://de.flightsim.to/addon/6543/icon-pack-for-elgato-streamdeck) for Airbus and many other aircraft.

Many icons used in this project are based on his work. Some of them have been renamed or slightly modified for use inside this plugin, especially the Korry-style images.

Please note:

> These icons remain the intellectual property of Guenseli and are **not** part of the open-source license of this repository.

---

# Installation

If you only want to use the plugin, copy the folder

```text
com.flypiet.simmidi.sdPlugin
```

into your StreamDeck plugin directory.

Typically this folder is located at:

```text
%appdata%\Elgato\StreamDeck\Plugins
```

After copying the plugin, restart the StreamDeck application.

To use the included buttons (`MIDI Automatic Button` and `MIDI Korry Button`), please refer to the documentation:

[Documentation](doc/doc.md)

---

# Developers

## Source Code

The source code is located inside the `src` folder.

During development, it is recommended to create a symbolic link from

```text
com.flypiet.simmidi.sdPlugin
```

to your StreamDeck plugin directory:

```text
%appdata%\Elgato\StreamDeck\Plugins
```

This plugin was developed with a combination of sweat, caffeine, and OpenAI Codex.

### Important Files

- `midibtn.ts`  
  Core implementation of the buttons. Internally, both button types are merged into a single class with slightly different attributes.

- `pngcomposer.ts`  
  Handles overlaying PNG graphics and generating combined image URLs.

- `midiservice.ts`  
  Provides the connection to a virtual MIDI device (for example using loopMIDI by Tobias Erichsen).

- `buttonregistry.ts`  
  Registers buttons and distributes incoming MIDI messages to them.

---

# Building the Plugin

Install the StreamDeck tools and required npm modules (TODO).

## Compile

```bash
npm run build
```

## Restart the Plugin

```bash
streamdeck restart com.flypiet.simmidi
```

---

# MIDI CC Simulator

For quick testing without MobiFlight or MSFS running, you can send repeating MIDI CC messages directly from the command line.

## List Available MIDI Ports

```powershell
npm run midi:sim -- --list
```

## Send Values `0`, `1`, `2` Once Per Second

```powershell
npm run midi:sim -- --device StreamDeck --controller 42
```

## Run the Korry Annunciator Sequence

This sequence sends:

1. lower light only
2. upper light only
3. both lights on
4. both lights off

```powershell
npm run midi:sim -- --device StreamDeck --controller 42 --channel 1 --korry
```

## Environment Variables

The same settings can also be configured through environment variables:

```powershell
$env:SIMMIDI_DEVICE="StreamDeck"
$env:SIMMIDI_CONTROLLER="42"
npm run midi:sim
```

## Optional Settings

- `--channel 1` or `SIMMIDI_CHANNEL`
- `--interval 1000` or `SIMMIDI_INTERVAL_MS`
- `--values 0,1,2` or `SIMMIDI_VALUES`
- `--korry` or `SIMMIDI_KORRY=1`

