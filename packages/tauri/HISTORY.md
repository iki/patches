# Tauri history

No lifetime fix has been retired. Unguarded CLI 2.12.1 failed 10/160 observed launches. Unguarded 2.12.3 and 2.12.4 each completed 160/160, and guarded acceptance included native launches plus rejection/cleanup. No resolving upstream change was identified; passing timing samples alone do not establish resolution. The JavaScript native callback mechanism was unchanged in the recorded 2.12.3 → 2.12.4 upgrade.

Unrelated reports [#14472](https://github.com/tauri-apps/tauri/issues/14472) and [#16366](https://github.com/tauri-apps/tauri/issues/16366) do not establish this callback-lifetime defect or its repair. Current reproduction and human contributor coordination remain necessary before proposing an upstream change.
