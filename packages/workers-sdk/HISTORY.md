# Workers SDK history

Wrangler 4.153.0 incorporated [PR #15846](https://github.com/cloudflare/workers-sdk/pull/15846), merge a88cac4d880629a4ad68f7173b3353941bea6081, with an explicit Bun rejection. The local capability regression first rejected 503 instead of 200, then passed local HTTP, direct dispatch, replacement/unregistered-fetch rejection and shutdown after the independent verified-fetch patch.

The 4.153.0 fork head [1c0977d](https://github.com/iki/workers-sdk/commit/1c0977d2f5485af9a65562f8fafeaa6b3a4124de) was superseded by the recorded 4.158.0 version, preserving guard semantics. [Availability discussion](https://github.com/cloudflare/workers-sdk/issues/15717#issuecomment-6453015355) and [4.158.0 follow-up](https://github.com/cloudflare/workers-sdk/issues/15717#issuecomment-6685718214) retain observed results. Upstream declined Bun support; no duplicate PR was opened.

The reviewed [PR #16645](https://github.com/cloudflare/workers-sdk/pull/16645) was closed/unmerged; its bundler interception conflicts with external Undici imports. It does not replace the verified adapter. Statuses are source observations through 2026-11-06.
