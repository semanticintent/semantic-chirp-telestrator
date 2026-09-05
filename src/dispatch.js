// Tools flow one way: input → handler → new state → render(touches) → runner.play(sequence) → ack.
// This is the single path every caller uses: the scenario runner, the console (S3), WebMCP (S4), and the viewer's own touches.
import { initialState } from './state.js';
import { grammar, findMove, MoveError } from './grammar.js';
import { copy, fill } from './copy.js';
import { render } from './render.js';
import { play } from './motion/runner.js';

let state = initialState();
export const getState = () => state;

/** Make a move by name with a structured input. Returns the ack, or { error } with a line from copy. */
export async function call(name, input = {}) {
  const move = findMove(name);
  if (!move) return { error: fill(copy.errors.unknownMove, { name }) };
  try {
    state = move.handler(state, input);
  } catch (e) {
    if (e instanceof MoveError) return { error: e.message };
    throw e;
  }
  render(state, move.touches);
  if (move.sequence) play(move.sequence);
  return move.ack(state);
}

/** Parse one line of a scenario or console script: `circle zary 2 games, back-to-back`. */
export function parseLine(line) {
  const [name, ...args] = line.trim().split(/\s+/);
  const move = findMove(name);
  const input = {};
  move?.positional.forEach((spec, i) => {
    const key = spec.replace(/(\[\]|\.\.\.)$/, '');
    const value = spec.endsWith('...') ? args.slice(i).join(' ') : args[i];
    if (value === undefined || value === '') return;
    input[key] = spec.endsWith('[]') ? [value] : move.input[key]?.startsWith('number') ? Number(value) : value;
  });
  return { name, input };
}

export const run = (line) => { const { name, input } = parseLine(line); return call(name, input); };

/** A viewer's touch (open, close, drag) is a state change that is not a move. It renders chrome only. */
export function touch(fn) {
  state = fn(state);
  render(state, []);
}

export const moves = () => grammar.map((g) => g.name);
