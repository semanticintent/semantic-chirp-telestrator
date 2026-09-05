// Tools flow one way: input → handler → new state → render(touches) → runner.play(sequence) → ack.
// This is the single path every caller uses: the scenario runner, the console (S3), WebMCP (S4), and the viewer's own touches.
import { initialState } from './state.js';
import { grammar, findMove, MoveError } from './grammar.js';
import { copy, fill } from './copy.js';
import { render } from './render.js';
import { play } from './motion/runner.js';

let state = initialState();
export const getState = () => state;

const describe = (name, input) => `${name} ${JSON.stringify(input)}`;

/** Make a move by name with a structured input. Returns the ack, or { error } with a line from copy.
 *  Every call, from any caller, lands in the transcript (state.log) and re-renders the console. */
export async function call(name, input = {}, line = describe(name, input)) {
  const move = findMove(name);
  let ack = null;
  if (!move) ack = { error: fill(copy.errors.unknownMove, { name }) };
  else {
    try {
      state = move.handler(state, input);
    } catch (e) {
      if (e instanceof MoveError) ack = { error: e.message };
      else throw e;
    }
  }
  ack ??= move.ack(state);
  state = { ...state, log: [...state.log, { line, ack }].slice(-200) };
  render(state, [...(ack.error ? [] : move.touches), 'console']);
  if (!ack.error && move.sequence) play(move.sequence);
  return ack;
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

export const run = (line) => { const { name, input } = parseLine(line); return call(name, input, line.trim()); };

/** A viewer's touch (open, close, drag) is a state change that is not a move. It renders chrome only. */
export function touch(fn) {
  state = fn(state);
  render(state, []);
}

export const moves = () => grammar.map((g) => g.name);
