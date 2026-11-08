# cf and Cloudflare Config history

Cloudflare Config 0.26.0 → 0.27.0 → 0.28.1 → 0.30.2 did not establish Bun module-hook support. The independently retained validated prebuilt-output interface remains useful.

The account-API/config coupling defect was resolved in published [cf 1.0.0-beta.27](https://github.com/cloudflare/cf/releases/tag/cf%401.0.0-beta.27), which contains [PR #372](https://github.com/cloudflare/cf/pull/372), commit d4a5d173803daca22f69ea8cc441b281078b94f6, closing [issue #207](https://github.com/cloudflare/cf/issues/207). A controlled loopback API test observed one request, explicit account/compliance settings, and no evaluation of a deliberately throwing config. [Verified follow-up](https://github.com/cloudflare/cf/pull/372#issuecomment-6685381465).

The historical [worker activation adapter](https://github.com/iki/cf/commit/6ce83dc92afba5f354002643c4260c6e59bb93b6), based on 6808c0f8449e0dfe9d2c41ef0143485265432ed1, remains reusable evidence. Supported scoped HTTP integration is no longer classified as a bypass of that resolved defect. The Bun config-loading workaround remains independent. These observations were recorded by 2026-11-06; catalog curation changes no remote resources.
