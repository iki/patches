# Process-worker hiding regression

Verify the actual installed Tinypool 2.2.0 selected by the consuming formatter,
including transitive resolution. Before any real process launch, intercept fork
in an isolated Bun process, import that exact module and construct a process
worker. Assert one intercepted call, windowsHide:true after the options spread,
stdio:pipe and preserved environment entries. Reject missing/ambiguous package
versions and do not infer hiding from source text alone.

Then run a real private worker with a deterministic 41→42 task, await destruction
and confirmed cleanup, and run the actual formatter. Keep the consumer's owned
process boundary, existing deadlines and fixture isolation. Original consumer
regression source remains with its owner; this procedural record is not a claim
that the catalog contains or executed that harness. The independent upstream
source expression and attribution are linked from README.md and UPSTREAM.md.
