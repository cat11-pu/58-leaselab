// reclaim.js：回收与推进（回收已到期租约；世代落后于已记录进度的视为重复处理）
export function sweep(leases, now, progress) {
  const next = {};
  const reclaimed = [];
  let replayed = 0;
  for (const task of Object.keys(leases)) {
    const lease = leases[task];
    const seen = progress && typeof progress[task] === "number" ? progress[task] : 0;
    if (seen > lease.epoch) {
      replayed += 1;
    }
    if (lease.expiresAt <= now) {
      reclaimed.push(task);
    } else {
      next[task] = lease;
    }
  }
  return { leases: next, reclaimed: reclaimed, replayed: replayed };
}
