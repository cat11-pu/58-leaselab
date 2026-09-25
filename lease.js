// lease.js：租约状态（到期时间 + 世代号；冲突报 E_LEASE_HELD）
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
  if (current.expiresAt <= now) {
    leases[task] = { holder: holder, expiresAt: now + ttl, epoch: current.epoch + 1 };
    return { leases: leases, granted: true };
  }
  return { leases: leases, granted: false, code: E_LEASE_HELD };
}
