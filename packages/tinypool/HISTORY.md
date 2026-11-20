# Tinypool history

No patch retired in the 2026-11-06 source observation. The process-worker hiding fix targets Tinypool 2.2.0, including transitive use through Oxfmt 0.74.0 and 0.76.0. Keep this package record after eventual retirement.

The [Oxfmt 0.79.0 follow-up](https://github.com/tinylibs/tinypool/pull/146#issuecomment-7037249650) records the package result on the open upstream PR.

On 2026-11-20, two frozen Aube 2.5.1 installations resolved Tinypool 2.2.0 from Oxfmt 0.79.0 on Windows x64 with Bun 1.4.2. Intercepting the first child-process fork observed piped stdio and the requested environment in both installs. The pristine release omitted `windowsHide`. The catalog bundle set it to `true`. In separate processes both installs ran the 41-to-42 worker, joined its exit on destruction and formatted JavaScript through Oxfmt. The check measures the fork option and process lifecycle. [Regression procedure](REGRESSION.md)
