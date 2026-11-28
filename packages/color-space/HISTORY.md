# color-space history

## 2026-11-20

The public npm latest tag selected 3.6.0. On Windows x64, Bun 1.4.5 and Aube 2.10.1 stopped the three-member workspace solve with exit 23 and `ERR_AUBE_TRUST_DOWNGRADE`. Aube found a provenance attestation for 3.0.0 and reported no trust evidence for 3.6.0. The public npm metadata includes an attestation URL for 3.5.0 and omits that field for 3.6.0. Restoring the existing 3.5.0 pin let the same workspace resolve and install frozen. Keep 3.5.0 until a candidate passes both checks with the default policy. [Published release](https://registry.npmjs.org/color-space/3.6.0) · [Upstream](https://github.com/colorjs/color-space)

## 2026-11-28

Aube 2.11.0 rejected the current 3.6.0 release with `ERR_AUBE_TRUST_DOWNGRADE` in a clean single-package solve on Windows x64. The npm metadata still omits an attestation for that release. The full workspace installed frozen with 3.5.0 under the default policy. [Registry metadata](https://registry.npmjs.org/color-space/3.6.0)
