# ref: pdf and document parsers

## .what

reference to research on document parse tools.

## .see

| topic | location |
|-------|----------|
| tool research (21 sources) | `.agent/repo=.this/role=pdfreader/briefs/research.pdf-to-markdown-ocr-tools.md` |
| howto (no GPU, APIs) | `.agent/repo=.this/role=pdfreader/briefs/howto.pdf-ocr-extraction.md` |
| Google Cloud setup | `.agent/repo=.this/role=pdfreader/briefs/howto.google-cloud-vision-setup.md` |

## .summary

for image-based PDFs (scanned documents, USPTO prosecution history):

**remote APIs (recommended for accuracy, no GPU needed)**:
- **Mistral OCR** — 99%+ accuracy, ~$1/1000 pages
- **Google Document AI** — 98% accuracy, $1.50/1000 pages
- **OCR.space** — FREE (500 req/day), 99% on clear text

**local options (no GPU)**:
- **marker (Docker, CPU)** — 90-95% accuracy, 30-60 sec/page
- **tesseract** — 85% accuracy, fast but less accurate

for PDFs with embedded text:
- **PyMuPDF4LLM** — 10x faster, no GPU needed

standard `pdftotext` fails on image-based PDFs — returns empty output.
