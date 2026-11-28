# lxml history

## 2026-11-28

Verified the `lxml-docx-namespace` hold on Windows x86-64 using CPython
3.14.10, MarkItDown 0.1.9, Beautiful Soup 4.15.0 and Mammoth 1.13.0. The
input was a generated DOCX with a namespaced body and one paragraph.
Each row below used the same input and command, with the parser wheel
selected before importing the document stack.

| Remaining document dependencies | lxml 6.1.3 | lxml 6.2.0 |
|---|---|---|
| 2026-11-20 lock | Paragraph text extracted | DOCX conversion failed |
| 2026-11-28 solve | Paragraph text extracted | DOCX conversion failed |

To repeat either comparison, install its document lock in two fresh venvs.
Replace only the lxml pin with 6.2.0 in the second copy. Run the parser probe
from the package README and use MarkItDown to convert the same one-paragraph
DOCX in both environments. [2026-11-20 lock](https://github.com/iki/patches/blob/5246238c70ae3d2fad828e1440b155992061b091/environments/document-extraction-pypi/requirements.lock) · [Current lock](../../environments/document-extraction-pypi/requirements.lock)

With 6.1.3, the intermediate XML retained the namespace declaration and
`w:body`. With 6.2.0, the output contained unqualified `document` and
`body` and Mammoth raised `ValueError`. A second probe using lxml alone
showed that `start_ns()` received the prefix and URI in both versions.
Only 6.1.3 supplied that binding in the map passed to `start()` on a target
without `end_ns()`. Adding an empty `end_ns()` method restored the namespace
map on 6.2.0. This matches the existing upstream report.
[Upstream bug 2178248](https://bugs.launchpad.net/lxml/+bug/2178248)

The fresh 38-wheel document environment passed `pip check` with 6.1.3,
converted DOCX, PDF, PPTX and XLSX to their expected text, and passed the PDF
round trip and Markdown rendering probes.

| Published CPython 3.14 Windows x86-64 wheel | SHA-256 |
|---|---|
| lxml 6.1.3 | `66299564c046bc7e0cc5de5106601eae907e9fa5904cd68a323380a8502f7861` |
| lxml 6.2.0 | `9f26ec085582ed756abd3acd4c305a2c34b2542d0cddc40ec692d2caf462fda6` |

The 6.2.0 release includes security fixes. The 6.1.3 fixture records the
compatibility failure and its passing control. [6.1.3 release files](https://pypi.org/project/lxml/6.1.3/#files) · [6.2.0 release files](https://pypi.org/project/lxml/6.2.0/#files) · [Release notes](https://github.com/lxml/lxml/blob/lxml-6.2.0/CHANGES.txt)
