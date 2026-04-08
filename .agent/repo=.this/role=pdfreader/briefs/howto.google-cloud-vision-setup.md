# howto: google cloud vision setup

## .what

setup guide for Google Cloud Vision API credentials for OCR extraction.

## .why

Google Cloud Vision provides 95.8% accuracy on scanned documents with enterprise-grade reliability.

---

## keyrack

| key | type |
|-----|------|
| `GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS` | JSON |

retrieve:
```bash
rhx keyrack get --key GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS --env test --owner ehmpath --json | jq -r '.grant.key.secret'
```

---

## setup

### 1. create project

1. go to https://console.cloud.google.com/projectcreate
2. name: `patent-ocr` (or your project name)
3. click Create

### 2. enable Vision API

1. go to https://console.cloud.google.com/apis/library/vision.googleapis.com
2. click Enable

### 3. create service account

1. go to https://console.cloud.google.com/iam-admin/serviceaccounts
2. click "+ Create Service Account"
3. name: `rhachet-roles-rhight-prep` (or your service account name)
4. click "Create and Continue"
5. role: search "Cloud Vision API User", select it
6. click Done

### 4. download credentials JSON

1. click the service account you just created
2. go to "Keys" tab
3. click "Add Key" → "Create new key"
4. select JSON → Create
5. saves JSON file to Downloads

### 5. store in keyrack

```bash
# copy the JSON content
cat ~/Downloads/*.json | pbcopy  # macOS

# store in keyrack
rhx keyrack fill --owner ehmpath --env test
# paste the full JSON for GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS

# delete the downloaded file
rm ~/Downloads/*.json
```

---

## usage

### OCR a local PDF

```bash
# convert PDF page to image
pdftoppm document.pdf page -png -r 300

# get credentials from keyrack
SA_JSON=$(rhx keyrack get --key GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS --env test --owner ehmpath --json | jq -r '.grant.key.secret')
echo "$SA_JSON" > /tmp/sa-creds.json
export GOOGLE_APPLICATION_CREDENTIALS=/tmp/sa-creds.json

# OCR the image
curl -s "https://vision.googleapis.com/v1/images:annotate" \
  -H "Authorization: Bearer $(gcloud auth application-default print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [{
      "image": {"content": "'$(base64 -w0 page-1.png)'"},
      "features": [{"type": "DOCUMENT_TEXT_DETECTION"}]
    }]
  }' | jq -r '.responses[0].fullTextAnnotation.text'

# clean up
rm /tmp/sa-creds.json
```

---

## cost

| tier | cost per 1000 pages | cost per page |
|------|---------------------|---------------|
| first 1000/month | FREE | $0.000 |
| 1001 - 5M | $1.50 | $0.0015 |
| 5M+ | $0.60 | $0.0006 |

---

## troubleshoot

| error | fix |
|-------|-----|
| `PERMISSION_DENIED` | verify service account has `cloudvision.user` role |
| `INVALID_ARGUMENT` | check base64 encode (use `-w0` flag) |
| `RESOURCE_EXHAUSTED` | rate limit hit, add delay between requests |
| `NOT_FOUND` | verify project ID and API enabled |

---

## sources

### official documentation
- [Cloud Vision API docs](https://cloud.google.com/vision/docs)
- [Vision API cost](https://cloud.google.com/vision/pricing) — verified: $1.50/1000 units, first 1000/month free

### accuracy benchmarks (independent)
- [AIMultiple OCR Comparison 2025](https://aimultiple.com/ocr-software) — Google Cloud Vision: 95.8% accuracy
- [Nanonets OCR Benchmark](https://nanonets.com/blog/ocr-software-best-ocr-software/) — Google ranked #1 for complex layouts
- [BusinessWareTech OCR Review](https://businesswaretech.com/google-cloud-vision-ocr-review/) — 87.8% on STROIE benchmark (scanned documents)
