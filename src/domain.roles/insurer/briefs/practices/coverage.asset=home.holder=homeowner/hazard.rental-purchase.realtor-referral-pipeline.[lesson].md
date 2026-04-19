# hazard.rental-purchase.realtor-referral-pipeline

## .scope

**this hazard applies to:**
- investors who buy property with intent to rent it out
- buyers who go through the standard closing process (realtor → lender → insurance referral → title → close)

**this hazard does NOT apply to:**
- homeowners who buy a primary residence (HO-3 is correct for them)
- homeowners who later convert their primary residence to a rental (see `risk.ho-policy-on-rental-property.[lesson].md`)
- investors who explicitly request landlord insurance and are given the wrong policy (agent error, different problem)

---

## .what

when you buy an **investment property intended for rental**, the realtor's insurance referral often sells you a homeowners policy (HO-3) instead of a landlord policy (DP-3). no one in the transaction verifies the policy type matches the property use.

## .why

this is a systemic gap that affects the majority of rental property investors.

---

## the statistics

> **"the majority of rental properties are written as homeowner's policies rather than rental dwelling policies."**
>
> — [Trust ETC](https://www.trustetc.com/blog/costs-wrong-rental-property-insurance/)

| statistic | value | source |
|-----------|-------|--------|
| rentals with wrong policy type | **majority** | [Trust ETC](https://www.trustetc.com/blog/costs-wrong-rental-property-insurance/) |
| claims closed without payment (2024) | **42%** | [insurance.com](https://www.insurance.com/home-insurance/which-home-insurance-company-denies-the-most-claims/) |
| claims closed without payment (2023) | **39%** | [insurance.com](https://www.insurance.com/home-insurance/which-home-insurance-company-denies-the-most-claims/) |
| claims closed without payment (2004) | **25.7%** | [insurance.com](https://www.insurance.com/home-insurance/which-home-insurance-company-denies-the-most-claims/) |
| residential properties underinsured | **70%** | [Richey Insurance](https://richeyinsurance.com/landlord-insurance-statistics/) |

> **"once a misrepresentation is identified, a thorough investigation by the claims adjuster—such as obtaining tax filings, rental permits, prior insurance applications, and housing inspections..."**
>
> — [Dick Law Firm](https://www.dicklawfirm.com/blog/2023/august/what-happens-if-i-fail-to-disclose-rental-activi/)

---

## the hazard

### the referral pipeline has no safety check

| party | checks policy type? |
|-------|---------------------|
| realtor | no |
| lender | no — only verifies insurance exists |
| insurance agent | should, often doesn't |
| title company | no |
| escrow | no |

investment buyers receive the same insurance referral as primary residence buyers. no one adjusts for use case.

### RESPA does not protect investment buyers

the Real Estate Settlement Procedures Act protects owner-occupant homebuyers. it does not apply to:

- investment properties
- cash sales
- commercial real estate

**investment property buyers have fewer protections than primary residence buyers.**

### insurers verify at claim time, not purchase time

insurers do not check tax records when you buy the policy. they check **after** you file a claim.

the perverse incentive:
1. insurer collects premiums from misrepresented policies
2. insurer can deny claims when discovered
3. no obligation to verify upfront

---

## the conclusions

### HO-3 on rental is worse than no insurance

see `risk.ho-on-rental-worse-than-no-insurance.[lesson].md`

| factor | no insurance | HO-3 on rental |
|--------|--------------|----------------|
| annual premium | $0 | ~$1,500 wasted |
| claim payout | $0 | $0 (denied) |
| fraud risk | none | yes |
| CLUE damage | none | 7-year record |

### when HO-3 pays on rentals: almost never

see `ref.ho3-dp3-claim-scenarios-matrix.[ref].md`

18 case law entries confirm: HO-3 claims on rental properties are denied for:
- owner-occupancy violation
- material misrepresentation
- business activity exclusion
- vacancy clause (30-60 days)

narrow exceptions exist only for ambiguous applications or 1-2 boarders in owner-occupied homes.

### the policy type decision tree

see `define.homeowner-vs-landlord-insurance.[lesson].md`

| use | policy |
|-----|--------|
| you live there | HO-3 |
| tenants live there | DP-3 |
| short-term rental | STR policy |
| mixed (duplex) | HO-3 + DP-3 |

---

## who is at risk

| profile | exposure |
|---------|----------|
| first-time investor | doesn't know HO ≠ DP |
| realtor referral buyer | trusted the pipeline |
| house hacker | bought primary, now rents rooms |
| accidental landlord | inherited, now rents |

---

## prevention

1. **never trust the referral** — verify policy type yourself
2. **read your declarations page** — look for "owner-occupied" language
3. **disclose rental intent** — even if not asked
4. **get DP-3 before first tenant** — see `howto.find-landlord-insurance.[lesson].md`

---

## see also

- `evidence.anecdotal.rental-purchase-wrong-insurance.[ref].md` — real cases: $1.6M fire, $25K STR loss, UK landlord denials
- `hazard.rental-purchase.systemic-silence.[lesson].md` — why no party warns you
- `risk.ho-on-rental-worse-than-no-insurance.[lesson].md` — why wrong insurance is worse than none
- `risk.ho-policy-on-rental-property.[lesson].md` — detailed coverage gaps
- `define.homeowner-vs-landlord-insurance.[lesson].md` — when to use HO vs DP
- `ref.ho3-dp3-claim-scenarios-matrix.[ref].md` — 18 case law entries on denials
- `howto.find-landlord-insurance.[lesson].md` — how to get correct coverage

---

## sources

1. [Trust ETC - 4 Costly Consequences of Having the Wrong Rental Property Insurance](https://www.trustetc.com/blog/costs-wrong-rental-property-insurance/)
2. [Insurance.com - Which Home Insurance Company Denies Most Claims](https://www.insurance.com/home-insurance/which-home-insurance-company-denies-the-most-claims/)
3. [Richey Insurance - Landlord Insurance Statistics 2026](https://richeyinsurance.com/landlord-insurance-statistics/)
4. [Dick Law Firm - What Happens if I Fail to Disclose Rental Activities](https://www.dicklawfirm.com/blog/2023/august/what-happens-if-i-fail-to-disclose-rental-activi/)
5. [NAR - Following RESPA Rules](https://www.nar.realtor/ae/manage-your-association/association-policy/following-respa-rules)
6. [BiggerPockets - Landlords vs Homeowners Insurance](https://www.biggerpockets.com/forums/95/topics/1175124-landlords-vs-homeowners-insurance)

