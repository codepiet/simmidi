# SIM-Midi - A StreamDeck Plugin for MobiFlight

simmidi is a relatively easy way to connect your StreamDeck to Mobiflight (MF) via MIDI.
My goal was to design all panels for an Airbus A320 with the StreamDeck and replace them one-by-one with real hardware made the classical Arduino-Mobiflight-way. Therefore I have to define buttons in MF anyway - so later I can switch to real hardware.

There are a few plugins for communicating with MSFS2024 - here I'll mention PilotsDeck and the AxisAndOhs Plugin. There is a MIDI Plugin, too. But - my goal was an easy way to configure the buttons. And I did not want to have payware - because I am using this on many Computers with my students. Of course there is a lot of work in the mobiflight-midiboard file - but you as a user will not see that. So the configuration of the buttons in the StreamDeck App should be easy - and the configuration in Mobiflight should be as ever.

A Tutorial with an example is provided in the mobiflight folder. Please read the [exampleDocumentation](doc/doc.md).

# A huge THANK YOU to...

Guenseli has made a large [IconCollection](https://de.flightsim.to/addon/6543/icon-pack-for-elgato-streamdeck) for Airbus and many other aircraft. I used many of his icons - you'll find a few of them in the images folder, often renamed. My Korry images are based on Guenselis Icons. So I have included some of his work in the plugin BUT please be adviced that this is HIS intellectual property and is NOT open source.

# What to copy where
If you just want to use the plugin, put the content of the folder com.flypiet.simmidi.sdPlugin into your StreamDeck-Plugin folder - typically this is a folder in your User-Home-AppData-Roaming folder.

Just open 
%appdata%\Elgato\StreamDeck\Plugins

and copy the folder 
com.flypiet.simmidi.sdPlugin
 
to that folder.

Now restart StreamDeck App.

For using the provided buttons (MIDI Automatic Button and MIDI Korry Button), go to the
[Documentation](doc/doc.md)



# DEVELOPERS

## The Code
You'll find the code in src - best practice is to put a symlink for com.flypiet.simmidi.sdPlugin in your %appdata%\Elgato\StreamDeck\Plugins folder.

The plugin is developed with sweat and OpenAI's Codex.

- midibtn.ts - the code base for the buttons. Internally the two buttons are merged into one class with slightly different attributes
- pngcomposer.ts - code for overlaying two png-graphics and provide one graphic-URL.
- midiservice.ts - connection to a virtual midi device (use e.g. loopMidi by Tobias Erichsen)
- buttonregistry.ts - buttons must be registered to be notified of incoming messages

## To build the plugin

install streamdeck tools and necessary npm-modules (TODO)

**compile:**
npm run build


**restart plugin in streamdeck with:**
streamdeck restart com.flypiet.simmidi


## MIDI CC simulator

For quick tests without MobiFlight and the simulator running, you can send repeating MIDI CC messages from the command line.

List available MIDI ports:
powershell
npm run midi:sim -- --list


Send values 0, 1, 2 once per second:
powershell
npm run midi:sim -- --device StreamDeck --controller 42


Run the Korry annunciator sequence. This sends lower only, upper only, both on, then both off:
powershell
npm run midi:sim -- --device StreamDeck --controller 42 --channel 1 --korry


The same settings can be provided through environment variables:
powershell
$env:SIMMIDI_DEVICE="StreamDeck"
$env:SIMMIDI_CONTROLLER="42"
npm run midi:sim


Optional settings:
- --channel 1 or SIMMIDI_CHANNEL
- --interval 1000 or SIMMIDI_INTERVAL_MS
- --values 0,1,2 or SIMMIDI_VALUES
- --korry or SIMMIDI_KORRY=1

Klar — hier ist eine sprachlich überarbeitete, etwas professionellere und flüssigere Version deines README-Texts, ohne den persönlichen Charakter zu verlieren:

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

