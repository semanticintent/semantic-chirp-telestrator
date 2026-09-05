// Formation: where each slot stands on the rink. Layout only; nothing here reads a value from the analyst.
export const FORMATION = {
  'L1-LW': [700, 120], 'L1-C': [700, 235], 'L1-RW': [700, 350],
  'L2-LW': [560, 120], 'L2-C': [560, 235], 'L2-RW': [560, 350],
  'D1-a': [400, 165], 'D1-b': [400, 305], 'D2-a': [270, 165], 'D2-b': [270, 305],
  'G': [110, 235],
};

/** Map of skater id → {x, y} for everyone with a spot in the formation. Bench and IR have none. */
export function place(read) {
  const spots = new Map();
  const pairs = { D1: 0, D2: 0 };
  for (const s of read?.skaters ?? []) {
    let key;
    if (s.slot === 'G') key = 'G';
    else if (s.slot === 'D1' || s.slot === 'D2') key = `${s.slot}-${pairs[s.slot]++ === 0 ? 'a' : 'b'}`;
    else if (s.slot === 'L1' || s.slot === 'L2') key = `${s.slot}-${s.pos}`;
    const xy = key && FORMATION[key];
    if (xy) spots.set(s.id, { x: xy[0], y: xy[1] });
  }
  return spots;
}
