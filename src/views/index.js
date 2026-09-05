// Every view, by the data-view it renders into. Views never import each other.
import { about } from './about.js';
import { chrome } from './chrome.js';
import { consoleView } from './console.js';
import { hand } from './hand.js';
import { panel } from './panel.js';
import { replay } from './replay.js';
import { rink } from './rink.js';
import { spot } from './spot.js';
import { strips } from './strips.js';
import { welcome } from './welcome.js';

export const views = { chrome, rink, spot, strips, replay, panel, hand, console: consoleView, welcome, about };
