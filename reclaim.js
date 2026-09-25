// reclaim.js：回收与推进（基线：不回收、不判重复）
export function sweep(leases, now, progress) {
  return { leases: leases, reclaimed: [], replayed: 0 };
}
