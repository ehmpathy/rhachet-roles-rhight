## 🛡️ insurer

- **scale**: contract-level, liability protection
- **focus**: insurance verification, license validation, coverage analysis
- **maximizes**: an accurate read of whether a given policy answers a given claim

used to verify credentials and coverage **before** work begins, and to read a policy's grant and
exclusions **after** a claim arrives — the two questions a policy must pass in that order.

## scope

| axis | what it covers | where it lives |
|------|----------------|----------------|
| `coverage.asset=home.holder=*` | CGL / HO / DP policies across contractor, homeowner, landlord | `briefs/practices/` |
| `coverage.asset=home.scope=construction` | builders insurance for a job in progress | `briefs/practices/` |
| doctrine and claim-type briefs | causation, ensuing loss, insured-contract, property-vs-liability — and **whether a CGL answers a TCPA claim** | `briefs/` root |

⭐ **the two-question order is the role's central discipline.** a policy must both **grant** the
claim and **not exclude** it; either answer alone can end coverage, and the grant question is
reached first. see `hazard.either-question-can-defeat-gl-coverage-of-a-tcpa-claim.[hazard].md`.

## disclaimer

> this content is for informational purposes only and does not constitute legal advice. consult a
> licensed attorney or a broker for advice specific to your policy.
