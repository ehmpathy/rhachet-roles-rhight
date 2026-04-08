# research: pdf to markdown/text extraction tools

## .what

comprehensive research on tools that extract text and markdown from image-based (scanned) PDFs via OCR.

## .why

USPTO prosecution documents (office actions, applicant responses) are image-based PDFs with no embedded text. standard tools like `pdftotext` return empty output. we need OCR-capable tools.

---

## tool categories

| category | tools | use case |
|----------|-------|----------|
| PDF → markdown (ML) | marker, MinerU, docling, pdf-craft | structured output with layout |
| PDF → markdown (native) | PyMuPDF4LLM | PDFs with embedded text only |
| OCR engines | Surya, PaddleOCR, tesseract, EasyOCR | raw text extraction |
| searchable PDF creation | OCRmyPDF | add text layer to scanned PDFs |
| vision-language models | GOT-OCR2, Florence-2, MonkeyOCR | end-to-end document parse |

---

## recommendation

**for USPTO prosecution documents: marker or MinerU**

both handle:
- scanned/image-based PDFs
- complex layouts (columns, tables)
- legal document structure

marker is faster. MinerU has higher accuracy on benchmarks.

---

## detailed analysis

### marker

**source**: [github.com/VikParuchuri/marker](https://github.com/VikParuchuri/marker)

| metric | value |
|--------|-------|
| speed | 122 pages/min on H100 GPU |
| comparison | 4x faster than nougat |
| output | markdown with images |
| GPU required | yes (or CPU with slower speed) |

**how it works**:
1. Surya OCR for text detection and recognition
2. layout analysis via ML models
3. table extraction
4. LaTeX equation conversion

**install**:
```bash
pip install marker-pdf
marker_single input.pdf output.md
```

**strengths**:
- fast on GPU hardware
- good table and equation support
- active maintenance (36k+ GitHub stars)

**weaknesses**:
- requires GPU for optimal speed
- large model downloads (~2GB)

---

### MinerU

**source**: [github.com/opendatalab/MinerU](https://github.com/opendatalab/MinerU)

| metric | value |
|--------|-------|
| English F1 | 0.945 |
| Chinese F1 | 0.965 |
| benchmark rank | #1 on OmniDocBench (most categories) |
| output | markdown, JSON |

**how it works**:
1. PDF-Extract-Kit for layout detection
2. PaddleOCR or Surya for text recognition
3. table structure recognition
4. formula detection

**install**:
```bash
pip install magic-pdf
magic-pdf -p input.pdf -o output_dir
```

**strengths**:
- highest accuracy on benchmarks
- excellent multilingual support
- handles complex layouts

**weaknesses**:
- slower than marker
- heavier dependencies

---

### docling

**source**: [github.com/DS4SD/docling](https://github.com/DS4SD/docling)

| metric | value |
|--------|-------|
| table extraction | 97.9% accuracy |
| speed | 481ms/page on L4 GPU |
| output | markdown, JSON, DocX |

**how it works**:
1. DocLayNet model for layout analysis
2. TableFormer for table structure
3. EasyOCR integration for scanned PDFs

**install**:
```bash
pip install docling
docling input.pdf --output output.md
```

**strengths**:
- IBM Research backed
- excellent table extraction
- multiple output formats

**weaknesses**:
- newer project, less community adoption
- requires GPU for optimal performance

---

### PyMuPDF4LLM

**source**: [github.com/pymupdf/PyMuPDF](https://github.com/pymupdf/PyMuPDF)

| metric | value |
|--------|-------|
| speed | 10x faster than ML alternatives |
| GPU required | no |
| output | markdown |

**limitations**: only works on PDFs with embedded text. does NOT handle scanned/image PDFs.

**install**:
```bash
pip install pymupdf4llm
```

**use case**: fast extraction when you know the PDF has embedded text. not suitable for USPTO prosecution documents.

---

### OCRmyPDF

**source**: [github.com/ocrmypdf/OCRmyPDF](https://github.com/ocrmypdf/OCRmyPDF)

| metric | value |
|--------|-------|
| purpose | add searchable text layer to PDFs |
| OCR engine | tesseract (default) |
| output | searchable PDF |

**how it works**:
1. detect pages that need OCR
2. run tesseract on image pages
3. embed invisible text layer
4. output searchable PDF

**install**:
```bash
pip install ocrmypdf
ocrmypdf input.pdf output.pdf
```

**use case**: make scanned PDFs searchable, then use `pdftotext` on the result. good for archival. slower pipeline than direct markdown extraction.

---

## OCR engine comparison

### Surya

**source**: [github.com/VikParuchuri/surya](https://github.com/VikParuchuri/surya)

| metric | value |
|--------|-------|
| accuracy | 97.41% on benchmark |
| handwritten text | 87.16% accuracy |
| languages | 90+ |
| speed | fast on GPU |

used by marker internally. excellent general-purpose OCR.

---

### PaddleOCR

**source**: [github.com/PaddlePaddle/PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR)

| metric | value |
|--------|-------|
| accuracy | 92.96% on benchmark |
| size | lightweight (~10MB models) |
| languages | 80+ |

best lightweight option. used by MinerU internally.

---

### tesseract

**source**: [github.com/tesseract-ocr/tesseract](https://github.com/tesseract-ocr/tesseract)

| metric | value |
|--------|-------|
| accuracy | 85-90% (varies by document quality) |
| languages | 100+ |
| GPU required | no |

oldest and most widely deployed. good baseline but outperformed by ML alternatives.

---

### EasyOCR

**source**: [github.com/JaidedAI/EasyOCR](https://github.com/JaidedAI/EasyOCR)

| metric | value |
|--------|-------|
| accuracy | ~90% |
| languages | 80+ |
| install | simple pip install |

easy to use but slower and less accurate than Surya or PaddleOCR.

---

### RapidOCR

**source**: [github.com/RapidAI/RapidOCR](https://github.com/RapidAI/RapidOCR)

| metric | value |
|--------|-------|
| accuracy | comparable to PaddleOCR |
| speed | optimized for CPU |
| GPU required | no |

good choice when GPU is unavailable. based on PaddleOCR models.

---

## vision-language models

### GOT-OCR2

**source**: [github.com/Ucas-HaoranWei/GOT-OCR2.0](https://github.com/Ucas-HaoranWei/GOT-OCR2.0)

end-to-end OCR via vision transformer. 580M parameters. handles formatted output (markdown, LaTeX) directly.

### Florence-2

**source**: [huggingface.co/microsoft/Florence-2-large](https://huggingface.co/microsoft/Florence-2-large)

Microsoft vision-language model. can extract text with spatial awareness. 770M parameters.

### MonkeyOCR

**source**: [github.com/echo840/MonkeyOCR](https://github.com/echo840/MonkeyOCR)

document-oriented VLM. good for complex layouts. newer project.

---

## benchmark sources

| benchmark | what it measures | leader |
|-----------|------------------|--------|
| OmniDocBench | document parse accuracy | MinerU |
| fast360 OCR Arena | speed + accuracy | varies by task |
| DocLayNet | layout detection | docling |
| TableBank | table extraction | docling |

---

## decision matrix

| scenario | recommended tool | why |
|----------|------------------|-----|
| USPTO prosecution docs | marker or MinerU | handles image PDFs, legal layout |
| high accuracy required | MinerU | best benchmark scores |
| fast extraction | marker | 4x faster than alternatives |
| no GPU available | RapidOCR + manual | CPU-optimized |
| make PDFs searchable | OCRmyPDF | adds text layer |
| PDFs with embedded text | PyMuPDF4LLM | 10x faster, no OCR needed |
| multilingual documents | MinerU | best CJK support |

---

## install recommendations

### marker (GPU available)

```bash
pip install marker-pdf
marker_single input.pdf output.md
```

### MinerU (highest accuracy)

```bash
pip install magic-pdf
magic-pdf -p input.pdf -o output_dir
```

### RapidOCR (no GPU)

```bash
pip install rapidocr-onnxruntime
```

---

## sources

1. [marker GitHub](https://github.com/VikParuchuri/marker) — 36k+ stars, speed benchmarks
2. [MinerU GitHub](https://github.com/opendatalab/MinerU) — OmniDocBench results
3. [docling GitHub](https://github.com/DS4SD/docling) — IBM Research, table benchmarks
4. [PyMuPDF4LLM docs](https://pymupdf.readthedocs.io/en/latest/pymupdf4llm/) — speed comparison
5. [OCRmyPDF GitHub](https://github.com/ocrmypdf/OCRmyPDF) — searchable PDF creation
6. [Surya GitHub](https://github.com/VikParuchuri/surya) — accuracy benchmarks
7. [PaddleOCR GitHub](https://github.com/PaddlePaddle/PaddleOCR) — lightweight OCR
8. [tesseract GitHub](https://github.com/tesseract-ocr/tesseract) — baseline OCR
9. [EasyOCR GitHub](https://github.com/JaidedAI/EasyOCR) — ease of use
10. [RapidOCR GitHub](https://github.com/RapidAI/RapidOCR) — CPU optimization
11. [GOT-OCR2 GitHub](https://github.com/Ucas-HaoranWei/GOT-OCR2.0) — VLM approach
12. [Florence-2 HuggingFace](https://huggingface.co/microsoft/Florence-2-large) — Microsoft VLM
13. [MonkeyOCR GitHub](https://github.com/echo840/MonkeyOCR) — document VLM
14. [OmniDocBench paper](https://arxiv.org/abs/2405.12571) — benchmark methodology
15. [fast360 OCR Arena](https://huggingface.co/spaces/fast360/OCR-Arena) — live benchmark
16. [DocLayNet paper](https://arxiv.org/abs/2206.01062) — layout detection benchmark
17. [pdf-craft GitHub](https://github.com/ArtificialZeng/pdf-craft) — alternative tool
18. [marker vs nougat comparison](https://github.com/VikParuchuri/marker#benchmarks) — speed data
19. [MinerU accuracy report](https://github.com/opendatalab/MinerU#evaluation) — F1 scores
20. [docling table benchmarks](https://github.com/DS4SD/docling#benchmarks) — 97.9% accuracy
21. [Surya handwritten benchmark](https://github.com/VikParuchuri/surya#benchmarks) — 87.16% accuracy

---

## conclusion

for USPTO prosecution documents (image-based PDFs):

1. **marker** — fastest option with GPU, good accuracy
2. **MinerU** — highest accuracy, slower
3. **OCRmyPDF** — if you need searchable PDFs for archival

avoid PyMuPDF4LLM for scanned PDFs — it only works with embedded text.
