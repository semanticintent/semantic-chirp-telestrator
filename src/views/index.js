// Every view, by the data-view it renders into. Views never import each other.
import { chrome } from './chrome.js';
import { rink } from './rink.js';
import { spot } from './spot.js';
import { strips } from './strips.js';

export const views = { chrome, rink, spot, strips };
