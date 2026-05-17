
# SIM-Midi - A StreamDeck Plugin for MobiFlight

simmidi is a relatively easy way to connect your StreamDeck to Mobiflight (MF) via MIDI.
My goal was to design all panels for an Airbus A320 with the StreamDeck and replace them one-by-one with real hardware made the classical Arduino-Mobiflight-way. Therefore I have to define buttons in MF anyway - so later I can switch to real hardware.

There are a few plugins for communicating with MSFS2024 - here I'll mention PilotsDeck and the AxisAndOhs Plugin. There is a MIDI Plugin, too. But - my goal was an easy way to configure the buttons. And I did not want to have payware - because I am using this on many Computers with my students. Of course there is a lot of work in the mobiflight-midiboard file - but you as a user will not see that. So the configuration of the buttons in the StreamDeck App should be easy - and the configuration in Mobiflight should be as ever.

A Tutorial with an example is provided in the mobiflight folder. Please read the [exampleDocumentation](doc/doc.md).

# A huge THANK YOU to...

Guenseli has made a large [IconCollection](https://de.flightsim.to/addon/6543/icon-pack-for-elgato-streamdeck) for Airbus and many other aircraft. I used many of his icons - you'll find a few of them in the images folder, often renamed. My Korry images are based on Guenselis Icons.

# What to copy where
If you just want to use the plugin, put the content of the folder `com.flypiet.simmidi.sdPlugin` into your StreamDeck-Plugin folder - typically this is a folder in your User-Home-AppData-Roaming folder.

Just open 
```%appdata%\Elgato\StreamDeck\Plugins```
and copy the folder 
```com.flypiet.simmidi.sdPlugin``` 
to that folder.

Now restart StreamDeck App.

For using the provided buttons (MIDI Automatic Button and MIDI Korry Button), go to the
[Documentation](doc/doc.md)



# DEVELOPERS

## The Code
You'll find the code in src - best practice is to put a symlink for `com.flypiet.simmidi.sdPlugin` in your `%appdata%\Elgato\StreamDeck\Plugins` folder.

The plugin is developed with sweat and OpenAI's Codex.

- midibtn.ts - the code base for the buttons. Internally the two buttons are merged into one class with slightly different attributes
- pngcomposer.ts - code for overlaying two png-graphics and provide one graphic-URL.
- midiservice.ts - connection to a virtual midi device (use e.g. loopMidi by Tobias Erichsen)
- buttonregistry.ts - buttons must be registered to be notified of incoming messages

## To build the plugin

install streamdeck tools and necessary npm-modules (TODO)

**compile:**
```npm run build```

**restart plugin in streamdeck with:**
```streamdeck restart com.flypiet.simmidi```

## MIDI CC simulator

For quick tests without MobiFlight and the simulator running, you can send repeating MIDI CC messages from the command line.

List available MIDI ports:
```powershell
npm run midi:sim -- --list
```

Send values `0`, `1`, `2` once per second:
```powershell
npm run midi:sim -- --device StreamDeck --controller 42
```

Run the Korry annunciator sequence. This sends lower only, upper only, both on, then both off:
```powershell
npm run midi:sim -- --device StreamDeck --controller 42 --channel 1 --korry
```

The same settings can be provided through environment variables:
```powershell
$env:SIMMIDI_DEVICE="StreamDeck"
$env:SIMMIDI_CONTROLLER="42"
npm run midi:sim
```

Optional settings:
- `--channel 1` or `SIMMIDI_CHANNEL`
- `--interval 1000` or `SIMMIDI_INTERVAL_MS`
- `--values 0,1,2` or `SIMMIDI_VALUES`
- `--korry` or `SIMMIDI_KORRY=1`
