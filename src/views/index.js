// Every view, by the data-view it renders into. Views never import each other.
import { chrome } from './chrome.js';
import { consoleView } from './console.js';
import { hand } from './hand.js';
import { panel } from './panel.js';
import { replay } from './replay.js';
import { rink } from './rink.js';
import { spot } from './spot.js';
import { strips } from './strips.js';

export const views = { chrome, rink, spot, strips, replay, panel, hand, console: consoleView };
