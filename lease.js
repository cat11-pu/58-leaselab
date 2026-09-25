// lease.js：租约状态（按任务键 O(1) 索引；到期才可易主，易主世代号加一）
export const E_LEASE_HELD = "E_LEASE_HELD";

export function acquire(leases, holder, task, now, ttl) {
  const current = leases[task];
  if (!current) {
    leases[task] = { holder: holder, expiresAt: now + ttl, epoch: 1 };
    return { leases: leases, granted: true };
  }
  if (current.holder === holder) {
    current.expiresAt = now + ttl;
    return { leases: leases, granted: true };
  }
  if (now < current.expiresAt) {
    return { leases: leases, granted: false, code: E_LEASE_HELD };
  }
  leases[task] = { holder: holder, expiresAt: now + ttl, epoch: current.epoch + 1 };
  return { leases: leases, granted: true };
}
