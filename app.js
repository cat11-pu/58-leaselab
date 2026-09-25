// app.js：渲染结果
import { acquire } from "./lease.js";
import { sweep } from "./reclaim.js";

export function render(spec) {
  let leases = {};
  for (const step of spec.steps || []) {
    const result = acquire(leases, step.holder, step.task, step.now, spec.ttl);
    leases = result.leases;
  }
  const cleaned = sweep(leases, spec.now, spec.progress || {});
  return { leases: leases, reclaimed: cleaned.reclaimed, replayed: cleaned.replayed,
           holders: Object.keys(leases).map((task) => [task, leases[task].holder]),
           epochs: Object.keys(leases).map((task) => leases[task].epoch) };
}
