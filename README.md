
# SIM-Midi - A StreamDeck Plugin for MobiFlight

simmidi is a relatively easy way to connect your StreamDeck to Mobiflight (MF) via MIDI.
My goal was to design all panels for an Airbus A320 with the StreamDeck and replace them one-by-one with real hardware made the classical Arduino-Mobiflight-way. Therefore I have to define buttons in MF anyway - so later I can switch to real hardware.

A Tutorial with an example is provided in the tutorial folder (TODO).

# What to copy where
If you just want to use the plugin, put the content of the folder `com.flypiet.simmidi.sdPlugin` into your StreamDeck-Plugin folder - typically this is a folder in your User-Home-AppData-Roaming folder.

Just open 
```%appdata%\Elgato\StreamDeck\Plugins```
and copy the folder 
```com.flypiet.simmidi.sdPlugin``` 
to that folder.

Now restart StreamDeck App.


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