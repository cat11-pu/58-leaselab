// reclaim.js：回收已到期租约，统计同一世代被重复处理的次数
export function sweep(leases, now, progress) {
  const next = {};
  const reclaimed = [];
  let replayed = 0;
  for (const task of Object.keys(leases)) {
    const lease = leases[task];
    if (lease.expiresAt <= now) {
      reclaimed.push(task);
      const done = progress ? progress[task] : undefined;
      if (typeof done === "number" && lease.epoch < done) {
        replayed += 1;
      }
    } else {
      next[task] = lease;
    }
  }
  return { leases: next, reclaimed: reclaimed, replayed: replayed };
}
