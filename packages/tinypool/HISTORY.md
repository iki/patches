# Tinypool history

No patch retired in the 2026-11-06 source observation. The process-worker hiding fix targets Tinypool 2.2.0, including transitive use through Oxfmt 0.74.0 and 0.76.0. Keep this package record after eventual retirement.

The [Oxfmt 0.79.0 follow-up](https://github.com/tinylibs/tinypool/pull/146#issuecomment-7037249650) records the package result on the open upstream PR.

On 2026-11-20, two frozen Aube 2.5.1 installations resolved Tinypool 2.2.0 from Oxfmt 0.79.0 on Windows x64 with Bun 1.4.2. Intercepting the first child-process fork observed piped stdio and the requested environment in both installs. The pristine release omitted `windowsHide`. The catalog bundle set it to `true`. In separate processes both installs ran the 41-to-42 worker, joined its exit on destruction and formatted JavaScript through Oxfmt. The check measures the fork option and process lifecycle. [Regression procedure](REGRESSION.md)

The refreshed profiles select Oxfmt 0.79.0. From that formatter's own package, the process-worker probe resolved Tinypool 2.2.0 on Windows x64 with Bun 1.4.5 and 1.4.2. In each pristine installation the intercepted fork omitted `windowsHide`. Each patched installation set `windowsHide: true`. All four preserved piped stdio and the supplied environment entry, completed the 41-to-42 task in a separate process, reaped the worker and formatted stdin with Oxfmt. The existing bundle applies to both runtime pairings. [Process-worker procedure](REGRESSION.md) · [Tinypool bundle](../../patches/tinypool@2.2.0.patch)
