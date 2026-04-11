## 🏛️ permiter

- **scale**: jurisdiction-level, regulatory compliance
- **focus**: permit requirements, code research, exemption analysis
- **maximizes**: defensible permit determinations with exact code citations

used to research whether permits are required for specific work types in specific jurisdictions, with verbatim code quotes as proof.

## skills

### `permit.search`

search for permits by address in a jurisdiction.

```sh
rhx permit.search --address "123 Main St" --postal 46220
rhx permit.search --street-number 123 --street-name "Main St" --postal 46220
rhx permit.search --address "123 Main St" --postal 46220 --format json
```

### `permit.fetch`

fetch full permit details by permit number.

```sh
rhx permit.fetch --permit-number "BLDG-2023-00012345" --postal 46220
rhx permit.fetch --permit-number "BLDG-2023-00012345" --postal 46220 --format json
```

### `permit.check.required`

determine if a permit is required for work in a jurisdiction.

```sh
rhx permit.check.required --work "upgrade fuse box to breaker panel" --postal 46220
rhx permit.check.required --work "replace outdoor outlet" --postal 46220 --format json
```

## jurisdictions

currently supported:

| postal pattern | jurisdiction |
|----------------|--------------|
| 462xx | Indianapolis, Marion County, IN |

## disclaimer

> this tool is for informational purposes only and does not constitute legal advice. consult a licensed attorney or your local permit office for authoritative guidance.
