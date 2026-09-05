// docs/grammar.md, derived from the grammar. One source of truth per fact: this never describes a tool the array does not.
export function grammarDoc(grammar) {
  const rows = grammar.map((g) => {
    const input = Object.entries(g.input).map(([k, t]) => `\`${k}: ${t}\``).join(', ') || '—';
    return `| ${g.move} | \`${g.name}\` | ${input} | ${g.touches.join(', ')} | ${g.sequence ? `\`${g.sequence}\`` : '—'} | ${g.description} |`;
  });
  return [
    '# The grammar',
    '',
    '*Generated from `src/grammar.js` by `npm run docs:grammar`. Do not edit; a test fails if this file drifts.*',
    '',
    'Every move is one thing an analyst would do with a pen in hand. Each returns a structured ack of what it drew.',
    '',
    '| Move | Tool | Input | Touches | Sequence | On screen |',
    '|---|---|---|---|---|---|',
    ...rows,
    '',
    `${grammar.length} moves. Producer verbs (\`ready\`, \`roll\`, \`caption\`, \`layer\`) are designed but not built.`,
    '',
  ].join('\n');
}
