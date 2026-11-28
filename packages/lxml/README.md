# lxml

## lxml-docx-namespace

The Windows document-extraction environment holds lxml at 6.1.3 on CPython
3.14.10. In lxml 6.2.0 a parser target without an `end_ns()` method receives
an empty namespace map in `start()` for an element declaring a namespace. Beautiful Soup 4.15.0
uses that map when serializing XML. MarkItDown 0.1.9 therefore loses the
WordprocessingML namespace while preparing DOCX input for Mammoth 1.13.0.
Mammoth then cannot find the document body. [Upstream bug 2178248](https://bugs.launchpad.net/lxml/+bug/2178248)

The hold covers the isolated document fixture. lxml recommends 6.2.0 for its
security fixes. Exercise the held version with local generated fixtures.
[Upstream release notes](https://github.com/lxml/lxml/blob/lxml-6.2.0/CHANGES.txt)

In a fresh Windows x86-64 venv, install the candidate alongside the selected
document-processing packages. This probe uses a single namespace declaration.
The expanded tag and its declared prefix must both reach the parser target.

```python
from lxml import etree


class Target:
    def start(self, tag, attributes, nsmap):
        assert tag == "{urn:catalog:doc}document"
        assert dict(nsmap) == {"w": "urn:catalog:doc"}

    def close(self):
        pass


etree.fromstring(
    b'<w:document xmlns:w="urn:catalog:doc"/>',
    etree.XMLParser(target=Target()),
)
```

Recheck when a published lxml release restores the map, or when a released
Beautiful Soup or MarkItDown update preserves the WordprocessingML namespace
through a different supported parser interface. Lift the document hold once
the preprocessed DOCX preserves its namespaced body and converts to the
expected text with the newer lxml. Also run the clean frozen install,
`pip check`, and the PDF, PPTX and XLSX conversions.
[Package history](HISTORY.md) · [Document environment](../../environments/document-extraction-pypi/requirements.lock)
