// lease.js：租约状态（基线：不记到期时间、永远持有）
export function acquire(leases, holder, task, now, ttl) {
  const next = Object.assign({}, leases);
  next[task] = { holder: holder, expiresAt: now + ttl, epoch: 1 };
  return { leases: next, granted: true };
}
