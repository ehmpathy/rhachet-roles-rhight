# howto: keyrack in CI

## .what

keyrack automatically forwards environment variables that match key names.

## .why

- in CI, secrets are injected as env vars (e.g., `GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS`)
- keyrack detects matched env vars and returns them
- no code changes needed between local dev and CI

## .how it works

```
local dev:
  rhx keyrack unlock --owner ehmpath --env test
    → credentials stored in OS secure vault
  rhx keyrack get --key ehmpathy.test.GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS
    → returns secret from vault

CI:
  env var: GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS=<secret>
  rhx keyrack get --key ehmpathy.test.GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS
    → detects env var, returns it directly
```

## .the pattern

always use keyrack:

```bash
# correct: always go through keyrack
keyrack_json=$(rhx keyrack get --key ehmpathy.test.MY_API_KEY --json)
```

never check env vars directly:

```bash
# wrong: bypasses keyrack
if [[ -n "$MY_API_KEY" ]]; then
  # use env var directly
fi
```

## .key match rules

keyrack matches env vars by key name suffix:

| keyrack key | matched env var |
|-------------|-----------------|
| `ehmpathy.test.USPTO_ODP_API_KEY` | `USPTO_ODP_API_KEY` |
| `ehmpathy.test.GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS` | `GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS` |

## .ci setup

in GitHub workflows, inject secrets as env vars:

```yaml
env:
  USPTO_ODP_API_KEY: ${{ secrets.USPTO_ODP_API_KEY }}
  GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS: ${{ secrets.GOOGLE_CLOUD_RHIGHT_SERVICE_ACCOUNT_CREDS }}
```

keyrack will detect and return them automatically.

## .see also

- howto.keyrack.[lesson].md - local usage
