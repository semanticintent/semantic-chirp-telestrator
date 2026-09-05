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
  glyph: { warn: '!', stream: '↗', b2b: 'b2b' },
  windows: { rink: 'Rink', panel: 'Panel', hand: 'Games in hand', replay: 'Replay', console: 'Console' },
  errors: {
    noRoster: 'Cue a roster first.',
    unknownFixture: 'No fixture called "{name}".',
    unknownSkater: 'No skater on the ice called "{id}".',
    unknownMove: 'Unknown move "{name}".',
  },
};

export const fill = (template, vars) => template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));

/** Every leaf string in copy, for tests. */
export function leaves(node = copy, out = []) {
  for (const v of Object.values(node)) typeof v === 'string' ? out.push(v) : leaves(v, out);
  return out;
}
