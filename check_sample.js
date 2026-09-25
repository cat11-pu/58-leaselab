import fs from "node:fs";
import { acquire } from "./lease.js";
import { sweep } from "./reclaim.js";
import { render } from "./app.js";

// 验收断言：上面每条值收进 emit，最后与期望值逐项比对，不符就非零退出。
const __lines = [];
function emit(label, value) { __lines.push([String(label).replace(/ =$/, ""), value]); }


const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/lease.json", "utf8"));
let leases = {};
const granted = [];
for (const step of spec.steps || []) {
  const result = acquire(leases, step.holder, step.task, step.now, spec.ttl);
  leases = result.leases;
  granted.push(result.granted);
}
const cleaned = sweep(leases, spec.now, spec.progress || {});
const view = render(spec);

emit("每次申请是否授予 =", granted);
emit("每个任务的持有者 =", view.holders);
emit("租约世代号 =", view.epochs);
emit("回收的租约 =", cleaned.reclaimed);
emit("重复处理的次数 =", cleaned.replayed);
emit("当前时刻 =", spec.now);
emit("租约上限 =", spec.ttl);


// ---- 异常路径探针：真调用实现，看它报出什么码（不是从样例里抄）----
try {
  const bad = acquire({ t0: { holder: "h0", expiresAt: 10, epoch: 1 } }, "h1", "t0", 5, 5);
  emit("租约冲突的错误码", bad.granted ? "no-error" : (bad.code || "no-code"));
} catch (error) {
  emit("租约冲突的错误码", error.code || error.message);
}


// ---- 期望值（参考模型算出，与题面给的验收数值一致）----
const EXPECTED = {
  "每次申请是否授予": [
    true,
    false,
    true,
    true
  ],
  "每个任务的持有者": [
    [
      "t0",
      "h0"
    ],
    [
      "t1",
      "h1"
    ]
  ],
  "租约世代号": [
    1,
    2
  ],
  "回收的租约": [
    "t0"
  ],
  "重复处理的次数": 0,
  "当前时刻": 9,
  "租约上限": 4
};
let __bad = 0;
for (const [label, want] of Object.entries(EXPECTED)) {
  const found = __lines.find((pair) => pair[0] === label);
  if (!found) { __bad += 1; console.log("缺失验收项 " + label); continue; }
  const got = found[1];
  if (JSON.stringify(got) === JSON.stringify(want)) { console.log("一致 " + label + " = " + JSON.stringify(got)); }
  else { __bad += 1; console.log("不一致 " + label + " 期望 " + JSON.stringify(want) + " 实际 " + JSON.stringify(got)); }
}
console.log("验收项 " + (Object.keys(EXPECTED).length - __bad) + "/" + Object.keys(EXPECTED).length + " 通过");
process.exit(__bad === 0 ? 0 : 1);
