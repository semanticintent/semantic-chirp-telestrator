// Every static string the interface shows. Views may show a string from here or a string from the read. Nothing else.
// Templates use {name} slots; fill() puts read values into them. The no-opinions test knows about both.
export const copy = {
  brand: 'CHIRP',
  rink: {
    title: 'My rink',
    subEmpty: 'Cue a roster to load the board',
    subBefore: 'Lineup before the ice is read',
    subAfter: 'Ice read for the next {days} days',
  },
  legend: {
    fresh: 'fresh ice: the schedule is on his side',
    chewed: 'chewed up: light week, or a back-to-back',
    badges: 'Badges:',
    flag: 'flag',
    stream: 'stream candidate',
  },
  strips: {
    bench: 'Bench',
    ir: 'Injured reserve',
    benchEmpty: 'Nobody on the bench.',
    irEmpty: 'Nobody in the box.',
  },
  glyph: { warn: '!', stream: '↗', b2b: 'b2b', game: 'G' },
  replay: {
    title: 'Replay',
    sub: 'run it back',
    pts: '{pts} projected pts',
    empty: 'Run it back on a skater and his week shows up here.',
  },
  panel: {
    empty: 'Nothing read yet. Run read_ice, or let your agent call it.',
    start: 'Start', sit: 'Sit', ir: 'IR', stream: 'Stream',
    why: 'why',
  },
  hand: {
    empty: 'Run the ice to see the edge.',
    you: 'You', opp: 'Opp',
  },
  siteTools: {
    none: 'Site tools: not available in this browser',
    on: 'Site tools: {n} registered',
    fixture: 'fixtures',
    live: 'live · {url}',
  },
  console: {
    paste: 'Paste a lineup',
    pasteGo: 'Cue it',
    pasted: 'cue_roster (pasted lineup)',
    ready: 'Talkback ready. One move per line.',
    hint: 'Moves:',
    placeholder: 'read_ice',
    run: 'Run',
  },
  windows: { rink: 'Rink', panel: 'Panel', hand: 'Games in hand', replay: 'Replay', console: 'Console' },
  errors: {
    noRoster: 'Cue a roster first.',
    unknownFixture: 'No fixture called "{name}".',
    unknownSkater: 'No skater on the ice called "{id}".',
    unknownId: 'No skater in the read called "{id}".',
    sameSkater: 'Split needs two different skaters.',
    unknownWindow: 'No window called "{view}". Try rink, panel, hand, replay, or console.',
    needsRoster: 'Give cue_roster a fixture name, or a pasted lineup when an analyst is configured.',
    noAnalyst: 'No analyst is configured. Load a fixture with cue_roster <fixture>, or open the page with ?analyst=<url>.',
    analystDown: 'The analyst did not answer at {url}.',
    badRead: 'The analyst returned something the screen cannot draw: {why}.',
    unknownMove: 'Unknown move "{name}".',
  },
};

export const fill = (template, vars) => template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));

/** Every leaf string in copy, for tests. */
export function leaves(node = copy, out = []) {
  for (const v of Object.values(node)) typeof v === 'string' ? out.push(v) : leaves(v, out);
  return out;
}
