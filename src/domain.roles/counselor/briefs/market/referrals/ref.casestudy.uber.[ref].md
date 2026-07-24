# ref.casestudy.uber

## .what

Uber's rider referral program — a reference implementation of a lawful "refer a friend" reward. it
illustrates the outside-the-ban side of the referral-selling redlines.

## .why

- Uber runs a two-sided referral reward at national scale, lawfully
- it lacks the referral-selling elements — a worked example of a program outside the ban
- it is a case study on the **outside-the-ban side** of the link-vs-names and marketing-bonus redlines

> **not legal advice.** informational groundwork; program terms change — verify current terms.

## .status

**in use** — active as of last-verified 2026-07-12 (reduced/varied over the years).
**source**: [Uber referral program rules (US)](https://www.uber.com/legal/en/document/?name=referral-program-rules&country=united-states&lang=en)

---

## the mechanic — two asymmetric triggers

| side | when the reward vests | form |
|------|-----------------------|------|
| referred friend | **immediately** — discount on first use | discount, shown in the invitation |
| referrer | **deferred** — after the friend completes a qualified first trip | Uber account credit |

Uber's own rules describe the referee discount verbatim:

> "For rides, bike or scooter users, or those who order with Uber Eats (where such service is
> available), referees/invitees may get a discount the first time they use the Uber applications
> and/or websites."

and the referrer trigger, verbatim:

> "As long as you and your referee/invitee follow these Rules... you should receive your Referral
> Reward after your referee/invitee uses your link or code to sign up with Uber and/or to activate
> the referral offer, and complete the requirements."

the credit itself is capped in value, verbatim:

> "Referral Rewards in the form of Uber credits are not transferable, have no cash value, and may
> expire."

Uber's own help center restates the two-sided trigger plainly:

> "To earn referral rewards, a referee must complete a first trip with the referral code."

> "Referral rewards will be auto-added to the referrer's Uber account."

**source**: [Uber referral program rules (US)](https://www.uber.com/legal/en/document/?name=referral-program-rules&country=united-states&lang=en);
[Uber Help — refer-a-friend program (riders)](https://help.uber.com/riders/article/refer-a-friend-program?nodeId=4d918571-17ab-4d8f-8967-2be24bea8800)

---

## why it's outside the ban (element by element)

| referral-selling element | Uber | element present? |
|--------------------------|------|------------------|
| names of prospective purchasers | referrer shares a **link/code**; friend self-selects | ❌ absent (link, not names) |
| inducement for the referrer's own sale | current user earns via referral; no purchase required | ❌ absent (promo bonus) |
| chance/drawing (FL lottery) | reward is **guaranteed** to every qualified referrer | ❌ absent (no chance) |
| contingent on later event | yes — friend's first trip | present, but not sufficient alone |

Uber has the contingency (element 4) but lacks elements 3 and 2 (and has no chance element), so it
sits outside the referral-selling ban.

### element 1 — link, not a name list

the indiana statute frames the trap around a consumer who hands over prospect names. verbatim,
Indiana Code § 24-5-0.5-3 makes it a deceptive act to promise:

> "That the consumer will receive a rebate, discount, or other benefit as an inducement for entering
> into a sale or lease in return for giving the supplier the names of prospective consumers or
> otherwise helping the supplier to enter into other consumer transactions, if earning the benefit,
> rebate, or discount is contingent upon the occurrence of an event subsequent to the time the
> consumer agrees to the purchase or lease."

Uber never collects a prospect name list. the referrer shares a code; the friend self-selects.
independent case-study analysis of Uber's mechanics confirms the code-first design, verbatim:

> "Refer your friends to sign up for Uber using your code, and the two of you will each enjoy a
> referral reward in credits."

### element 3 — guaranteed reward, no lottery

Florida frames the ban as a lottery when the reward turns on a later event tied to buyer-supplied
names. verbatim, Fla. Stat. § 849.0915 reaches "the buyer's providing the seller with the names of
prospective purchasers" where:

> "earning the rebate or discount is contingent upon the occurrence of an event subsequent to the
> time the buyer agrees to buy"

and declares such a scheme:

> "a lottery if earning the rebate or discount is contingent upon the occurrence of an event
> subsequent to the time the buyer agrees to buy"

Uber's reward is guaranteed to every qualified referrer — there is no drawing and no chance element,
so the lottery framing does not attach.

---

## terms that reinforce the "genuine referral" character

| provision | verbatim / summary | source |
|-----------|--------------------|--------|
| new-user only | referee "must (a) be a new Uber user of that service or a user who has not used the Uber service within a certain period of time" | referral rules |
| no self-referral | "Your friends, family, and other people you know (but not yourself) may be eligible to be referees/invitees" | referral rules |
| cap | "Referrers are limited to payouts in connection with a combined total of 10 referral offers" | referral rules |
| no cash value / expires | credits "are not transferable, have no cash value, and may expire" | referral rules |
| right to modify | "Uber reserves the right to change, end, or pause, in whole or in part, any referral program... at any time for any reason" | referral rules |

---

## the FTC overlay — disclose the material connection

a referrer who earns a reward for a public post has a **material connection** to Uber that must be
disclosed. verbatim, 16 CFR § 255.5:

> "When there exists a connection between the endorser and the seller of the advertised product that
> might materially affect the weight or credibility of the endorsement, and that connection is not
> reasonably expected by the audience, such connection must be disclosed clearly and conspicuously."

the same rule names the reward form directly, verbatim:

> "monetary payment or the provision of free or discounted products (including products unrelated to
> the endorsed product) to an endorser, regardless of whether the advertiser requires an endorsement
> in return."

this is why several programs restrict where a referrer may post. DoorDash forfeits credit when:

> "The Referrer posted the Referral Link on a publicly accessible website such as, but not limited
> to, Google, Craigslist, Twitter, and RetailMeNot"

---

## comparative outside-the-ban references

two more national programs use the same code-first, two-sided, guaranteed-reward shape.

### DoorDash — new-customer + cap + qualified-order trigger

verbatim, DoorDash's referral terms restrict the referee to a new user:

> "The New User has not previously registered on the DoorDash platform."

the code-first share, verbatim:

> "The Referrer provides the Referrer's unique referral link... directly to the New User through
> email, text, or the Share Your Link option."

the deferred trigger and the cap, verbatim:

> "A Referrer will receive Referral Credit for each 'Qualified Referral,' which occurs when all of
> the following conditions are met" — one condition is that the New User "places an order on the
> DoorDash platform with a certain minimum subtotal."

> "A Referrer can only receive Referral Credit in connection with the following number of Qualified
> Referrals: 10 Qualified Referrals if the Referrer is located in the United States or Canada."

**source**: [DoorDash consumer referral terms](https://help.doordash.com/consumers/s/referral-terms-english?language=en_US)

### Dropbox — link-first, two-sided, auto-fulfilled

Dropbox pays bonus storage rather than money, but the shape matches. verbatim analysis of the
program:

> "Existing users get a unique invite link. They share it via email, copy-paste, or (in earlier
> versions) social media."

> "When the friend signs up, both sides get 500MB of bonus storage. Users can keep earning up to
> 16GB on a Basic plan and 32GB on a Plus plan."

and the reward fulfills without a claim step, verbatim:

> "The reward fulfills automatically. No manual approval, no claim form."

**source**: [Dropbox referral program analysis (Referral Rock)](https://referralrock.com/blog/dropbox-referral-program/)

---

## the attributes that place Uber outside the ban

| Uber feature | the element it renders absent |
|--------------|------------------------------|
| link/code share | names-of-prospects (no roster is collected) |
| earn via referral, not purchase | own-purchase inducement (no purchase required to earn) |
| guaranteed reward | chance (no drawing; the FL lottery leg is absent) |
| account credit, non-transferable | keeps the reward a non-cash marketing credit, not a cash payout |
| new-customer + no-self-referral + cap | anti-fraud terms that keep the reward a genuine referral |
| disclose material connection | the FTC 16 CFR 255.5 duty that attaches to any paid endorsement |

## .publishability

☀️ **fullsun** (share) — third-party case study of a public program; no client identity, neutral both-sides voice.

## .see also

- `define.referral-reward-vs-referral-selling.[lesson].md`
- `define.boundary.link-vs-names-of-prospects.[lesson].md`
- `define.boundary.marketing-bonus-vs-purchase-inducement.[lesson].md`
- `ref.casestudy.doordash.[ref].md` (planned — not yet authored)
- `ref.casestudy.chase-card.[ref].md` (planned — not yet authored)

## .sources

1. [Uber referral program rules (US)](https://www.uber.com/legal/en/document/?name=referral-program-rules&country=united-states&lang=en) — referee discount, referrer trigger, new-user rule, no-self-referral, 10-offer cap, no-cash-value credits, right to modify
2. [Uber Help — refer-a-friend program (riders)](https://help.uber.com/riders/article/refer-a-friend-program?nodeId=4d918571-17ab-4d8f-8967-2be24bea8800) — two-sided trigger: referee completes first trip, reward auto-added to referrer
3. [Indiana Code § 24-5-0.5-3 (referral-selling deceptive act)](https://codes.findlaw.com/in/title-24-trade-regulation/in-code-sect-24-5-0-5-3/) — names-of-prospects + contingent-on-later-event elements
4. [Florida Statutes § 849.0915 (referral selling as lottery)](https://www.flsenate.gov/Laws/Statutes/2025/849.0915) — buyer-supplied names + contingency = lottery
5. [16 CFR § 255.5 — disclosure of material connections](https://www.law.cornell.edu/cfr/text/16/255.5) — reward creates a material connection that must be disclosed
6. [DoorDash consumer referral terms](https://help.doordash.com/consumers/s/referral-terms-english?language=en_US) — new-customer rule, unique-link share, qualified-order trigger, 10-referral cap, public-posting forfeit
7. [Dropbox referral program analysis (Referral Rock)](https://referralrock.com/blog/dropbox-referral-program/) — link-first, two-sided, auto-fulfilled storage reward
8. [Uber referral program case study (ReferralCandy)](https://www.referralcandy.com/blog/uber-referral-program) — code-based, two-sided rider credit design

## .date researched

2026-07-12
