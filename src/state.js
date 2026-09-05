// The whole show as one plain object. Nothing lives in the DOM that is not derivable from here.
export const WINDOWS = ['rink', 'panel', 'hand', 'replay', 'console'];

export function initialState() {
  return {
    read: null,      // the last Read (contracts/read.schema.json), or null
    ice: false,      // has read_ice revealed it
    circle: null,    // { id, reason|null } | null — persists until wipe() or the next circle()
    replay: null,    // { ids } | null (S2)
    windows: Object.fromEntries(WINDOWS.map((name, i) => [name, { open: name === 'rink', x: null, y: null, z: i }])),
  };
}

export const skater = (state, id) => state.read?.skaters.find((s) => s.id === id) ?? null;

export function open(state, name) {
  const z = Math.max(...Object.values(state.windows).map((w) => w.z)) + 1;
  return { ...state, windows: { ...state.windows, [name]: { ...state.windows[name], open: true, z } } };
}

export const close = (state, name) => ({ ...state, windows: { ...state.windows, [name]: { ...state.windows[name], open: false } } });

export const move = (state, name, x, y) => ({ ...state, windows: { ...state.windows, [name]: { ...state.windows[name], x, y } } });
