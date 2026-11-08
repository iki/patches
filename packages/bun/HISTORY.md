# Bun and Undici history

No dispatcher workaround has been retired. Recorded transitions were Undici 8.12.1/Wrangler 4.151.0 → 8.12.2/4.151.1 → 8.12.3/4.153.0 → 8.12.4/4.158.0. Matching Miniflare pins moved from 5.20261012.1-beta through 5.20261023.0-beta to 5.20261104.0-beta. These package upgrades did not resolve Bun's dispatcher defects; installed-package resolution and global-fetch routing remain separate fixes.

The source observations include loopback rejection of the unpatched shim/global-fetch paths and successful installed Undici dispatch. They are dated evidence, not fresh validation by catalog curation. See the related [Workers SDK history](../workers-sdk/HISTORY.md).
