import streamDeck from "@elgato/streamdeck";

import { midiService } from "./midiservice";
import { MIDIAutomaticButton, MIDIKorryButton } from "./actions/midibtn";

function init() {
  midiService.init();
}

init();

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel("trace");

streamDeck.actions.registerAction(new MIDIAutomaticButton());
streamDeck.actions.registerAction(new MIDIKorryButton());

// Finally, connect to the Stream Deck.
streamDeck.connect();

/*
const profileTracker = new ProfileTracker();

profileTracker.onProfileChange = (profile) => {
  const config = configLoader.load(profile);
  midiDispatcher.rebind(config);
};
*/
