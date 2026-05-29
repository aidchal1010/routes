// A setTimeout manager that can freeze every pending timer at once and resume each
// from its *remaining* time (not its original duration). Used by the causal motion
// system so a global pause halts the spawn/dispatch chain in lockstep with the
// framer-motion vehicle animations.
//
// Factory (not a class) so the `wrapped` callback closes over `records`/`paused`
// directly — recursive re-scheduling (retries, the spawn loop) never deals with `this`.

type Record = {
  callback: () => void;
  delay: number;
  remaining: number;
  startTime: number;
  handle: ReturnType<typeof setTimeout> | null;
};

export type PausableTimeouts = {
  set: (callback: () => void, delay: number) => number;
  clear: (id: number) => void;
  pauseAll: () => void;
  resumeAll: () => void;
  clearAll: () => void;
};

export function createPausableTimeouts(): PausableTimeouts {
  const records = new Map<number, Record>();
  let nextId = 1;
  let paused = false;

  const start = (id: number, record: Record, delay: number) => {
    record.startTime = Date.now();
    record.delay = delay;
    record.handle = setTimeout(() => {
      // Self-clean before invoking so a callback that re-schedules itself
      // (retries, spawn loop) registers a fresh record cleanly.
      records.delete(id);
      record.callback();
    }, delay);
  };

  const set = (callback: () => void, delay: number): number => {
    const id = nextId++;
    const record: Record = {
      callback,
      delay,
      remaining: delay,
      startTime: Date.now(),
      handle: null,
    };
    records.set(id, record);
    if (!paused) start(id, record, delay);
    // If paused, leave handle null with remaining=delay; resumeAll() will start it.
    return id;
  };

  const clear = (id: number) => {
    const record = records.get(id);
    if (!record) return;
    if (record.handle !== null) clearTimeout(record.handle);
    records.delete(id);
  };

  const pauseAll = () => {
    if (paused) return;
    paused = true;
    for (const record of [...records.values()]) {
      if (record.handle === null) continue;
      clearTimeout(record.handle);
      record.handle = null;
      record.remaining = Math.max(0, record.delay - (Date.now() - record.startTime));
    }
  };

  const resumeAll = () => {
    if (!paused) return;
    paused = false;
    for (const [id, record] of [...records.entries()]) {
      start(id, record, record.remaining);
    }
  };

  const clearAll = () => {
    for (const record of records.values()) {
      if (record.handle !== null) clearTimeout(record.handle);
    }
    records.clear();
  };

  return { set, clear, pauseAll, resumeAll, clearAll };
}
