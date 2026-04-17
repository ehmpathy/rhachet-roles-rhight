# define.license-lifecycle

## .what

a license moves through defined states from issuance to expiration or revocation.

## .lifecycle states

```
                    ┌─────────────┐
                    │   applied   │
                    └──────┬──────┘
                           │ exam passed
                           ▼
┌──────────┐         ┌─────────────┐
│ rejected │◄────────│   active    │◄──────────┐
└──────────┘         └──────┬──────┘           │
                           │                   │
           ┌───────────────┼───────────────┐   │
           │               │               │   │
           ▼               ▼               ▼   │
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  suspended  │ │   expired   │ │   renewed   │
    └──────┬──────┘ └──────┬──────┘ └─────────────┘
           │               │
           │               │ reinstatement
           │               ▼
           │        ┌─────────────┐
           │        │ reinstated  │──────────────►active
           │        └─────────────┘
           │
           ▼
    ┌─────────────┐
    │   revoked   │
    └─────────────┘
```

## .state definitions

| state | what it means | can practice? | path forward |
|-------|---------|---------------|--------------|
| **applied** | application submitted, exam pending | no | pass exam |
| **active** | valid, in good standing | yes | maintain via renewal |
| **expired** | failed to renew before deadline | no | reinstatement (fees, CE) |
| **suspended** | temporarily revoked for violation | no | clear violation |
| **revoked** | permanently terminated | no | reapply (if allowed) |
| **inactive** | voluntary pause (some states) | no | reactivation |

## .renewal requirements

to maintain **active** status, most licenses require:

| requirement | typical | purpose |
|-------------|---------|---------|
| **fee** | $50-500 annually or biennially | fund the board |
| **CE credits** | 10-40 hours per cycle | maintain competency |
| **no violations** | clean record | accountability |

### renewal cycle

| profession | typical cycle |
|------------|---------------|
| medical | 2 years |
| legal | 1-3 years |
| contractor | 1-2 years |
| real estate | 2-4 years |

## .disciplinary actions

boards can take action for violations:

| action | severity | typical cause |
|--------|----------|---------------|
| **letter of concern** | low | minor issue, first offense |
| **fine** | medium | violation of rules |
| **probation** | medium | practice under supervision |
| **suspension** | high | serious violation, temporary |
| **revocation** | highest | egregious violation, permanent |

### common violations

- practice without valid license
- fraud or misrepresentation
- malpractice or negligence
- criminal conviction
- substance abuse
- failure to meet CE requirements

## .verification relevance

when you verify a license, you check:

1. **status** — is it active, expired, suspended, revoked?
2. **expiration date** — when does it need renewal?
3. **disciplinary history** — any actions on record?

an "active" status with no disciplinary history is the green light.

## .sources

### expiration vs suspension vs revocation

> "Licenses expire when professionals fail to renew them before the end of a licensing period... While expiration and cancellation are administrative in nature, suspension and revocation are serious disciplinary actions."
>
> — [License Suspension, Revocation, Expiration, The Law Place](https://www.thelawplace.com/faqs/whats-the-difference-between-professional-license-suspension-revocation-and-expiration-in-florida/)

### revocation

> "Revocation is the most severe penalty... resulting in the permanent termination of your license. This action is reserved for the most serious offenses."
>
> — [Don't Let Your License Expire, Real Estate School](https://www.realestateschool.org/wa/104-don't-let-your-washington-real-estate-license-expire:-a-broker's-guide-to-renewal-and-reinstatement-blog)

### CE requirements

> "Professional license holders are required to complete a certain number of continuing education credits or hours to renew their licenses. Failure to meet these continuing education requirements can result in the suspension or revocation of the professional license."
>
> — [Professional License Application and Renewal in Utah, State Regs Today](https://www.stateregstoday.com/government-forms/professional-license-application-and-renewal-in-utah)

## .see also

- define.what-licenses-mean — what active status guarantees
- howto.verify-licenses — how to check these states
