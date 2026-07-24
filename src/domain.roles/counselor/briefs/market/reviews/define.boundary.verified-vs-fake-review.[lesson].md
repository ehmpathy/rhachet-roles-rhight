# define.boundary.verified-vs-fake-review

## .what

the first redline that separates a lawful review from an unlawful one: the review reflects a **real,
verified transaction** with a **real reviewer** (lawful), or a **fake or invented reviewer or
experience** (unlawful, § 465.2). the element that splits the two is whether the reviewer actually
had the verified transaction or experience — whether the reviewer really bought the product,
dined at the restaurant, stayed at the hotel, or used the app.

## .why

- § 465.2 makes a review unlawful when it misrepresents that the reviewer exists, used the product
  or service, or had the experience — three independent ways a review can be fake or false
- an independent transaction check, run by whoever hosts or rewards a review, targets those three
  points; where no verified transaction sits behind a review, none of the three is guaranteed
- amazon's "verified purchase" badge is one market instance of a platform-side check that the
  reviewer really transacted — a case study, not a legal safe harbor

> **not legal advice.** informational groundwork for counsel to validate.

---

## the redline

```
        SAFE SIDE                       │   THE LINE    │        UNSAFE SIDE
─────────────────────────────────────────┼──────────────┼──────────────────────────────
 reviewer is a real person who had a     │              │  reviewer does not exist, or
 real, verified transaction              │ "the reviewer│  never had the purchase/experience
                                         │  exists" &   │
 the review reflects that actual         │ "used or had │  the review invents an
 experience                              │  experience" │  experience that did not happen
                                         │  & "the      │
 an independent check verifies the       │  reviewer's  │  no verified transaction sits
 transaction before any reward           │  experience" │  behind the review
```

**the element that splits the two:** did the reviewer have a **real, verified transaction or
experience**? if yes, the review is on the safe side of § 465.2. if the reviewer or the experience
is invented, it is a fake/false review.

---

## the statutory hook — § 465.2

the 2024 ftc rule names the three misrepresentations that make a review fake/false. verbatim,
16 cfr § 465.2(a):

> "It is an unfair or deceptive act or practice and a violation of this part for a business to write,
> create, or sell a consumer review, consumer testimonial, or celebrity testimonial that materially
> misrepresents, expressly or by implication:
> (1) That the reviewer or testimonialist exists;
> (2) That the reviewer or testimonialist used or otherwise had experience with the product,
> service, or business that is the subject of the review or testimonial; or
> (3) The reviewer's or testimonialist's experience with the product, service, or business that is
> the subject of the review or testimonial."

**source**: [16 cfr § 465.2](https://www.law.cornell.edu/cfr/text/16/465.2)

each of the three prongs is a way to fail. an independent verification step targets all three at
once: it confirms the reviewer is a real person (prong 1) who had a real, completed transaction (prong 2)
and thus can speak to a real experience (prong 3). absent such a step, any of the three can fail.

---

## why "purported consumer" makes the redline sharp

the rule's scope reaches beyond real customers. § 465.1 defines a consumer review to include a
**purported** consumer's evaluation. verbatim:

> "a consumer's evaluation, or a purported consumer's evaluation, of a product, service, or business
> that is submitted by the consumer or purported consumer and that is published to a website or
> platform dedicated in whole or in part to receiving and displaying such evaluations."

**source**: [16 cfr § 465.1](https://www.law.cornell.edu/cfr/text/16/465.1)

because a **purported** reviewer is in scope, the line is not "did anyone post this" but "was there a
real transaction behind it." a fabricated reviewer is squarely inside the rule — so a
verified-transaction check is the safeguard that speaks to all three prongs.

---

## a market instance — "verified purchase" as one platform-side signal

one market approach to the same problem is a platform-side check: amazon labels a review "verified
purchase" only when amazon itself confirms the reviewer transacted. verbatim, from amazon's own
trust page:

> "The review is validated by Amazon, where we check if the review bought the item on Amazon and paid
> a price available to most Amazon shoppers. If we confirm both, we label the review as Verified
> Purchase."

and amazon frames the badge's purpose, verbatim:

> "When a reviewer submits a review for a product they purchased, the review is identified with a
> ['Verified Purchase'] badge. This helps customers identify reviews by other customers that bought
> the product from the Amazon store, compared to others who may have purchased the product elsewhere."

**source**: [how amazon maintains a trusted review experience (amazon)](https://trustworthyshopping.aboutamazon.com/how-amazon-maintains-a-trusted-review-experience)

amazon's platform-side check confirms a real transaction sat behind the review before the badge
attaches. the badge is amazon's evidence that prong 2 of § 465.2 is satisfied — the reviewer really
bought the product. it is a design example, not a legal safe harbor; any actor's own verification must
stand on its own facts.

---

## safe vs unsafe — worked rows

| scenario | real reviewer? | verified transaction? | § 465.2 side |
|----------|----------------|-----------------------|--------------|
| a shopper bought the product, the purchase was verified, then reviewed | yes | yes | LAWFUL |
| staff write a five-star review of the restaurant under a made-up name | no (invented) | no | UNLAWFUL (prong 1) |
| a real person reviews a hotel stay that never happened | yes | no | UNLAWFUL (prong 2) |
| a real user exaggerates a real app session into a fabricated ordeal | yes | yes-but | UNLAWFUL (prong 3) |
| ai-generated review of a nonexistent customer | no | no | UNLAWFUL (prongs 1–3) |

only the first row clears all three prongs. a verify-before-reward step is what places a review on
that first row; its absence leaves each prong open.

---

## the ban framed by counsel

a law-firm summary of the rule draws the same three-part line, verbatim:

> "The final rule addresses reviews and testimonials that misrepresent that they are by someone who
> does not exist, such as AI-generated fake reviews, or who did not have actual experience with the
> business or its products or services, or that misrepresent the experience of the person giving it."

**source**: [ftc bans fake reviews and testimonials (fourscore)](https://www.fourscorelaw.com/resources/ftc-bans-fake-reviews-and-testimonials)

another firm frames the breadth of the fake-review ban, verbatim:

> "The Final Rule forbids businesses from creating, buying, selling or disseminating fake or false
> reviews or testimonials."

**source**: [ftc finalizes rule on consumer reviews (goodwin)](https://www.goodwinlaw.com/en/insights/publications/2024/09/alerts-practices-cldr-ftc-finalizes-rule-on-consumer-reviews)

the "does not exist" and "did not have actual experience" language maps prong-for-prong onto what a
verification step is designed to prevent.

---

## the adjacent line — insider reviews (§ 465.5)

a verified transaction is necessary but not the whole picture. even a real reviewer with a real
transaction can cross a **different** line if that reviewer is an insider who hides the relationship. verbatim,
16 cfr § 465.5(a):

> "It is an unfair or deceptive act or practice and a violation of this part for an officer or
> manager of a business to write or create a consumer review or consumer testimonial about the
> business or one of the products or services it sells that fails to have a clear and conspicuous
> disclosure of the officer's or manager's material relationship to the business"

**source**: [16 cfr § 465.5](https://www.law.cornell.edu/cfr/text/16/465.5)

so the redline is two-layered: (1) the reviewer had a real, verified transaction (§ 465.2), and (2) if the
reviewer is an insider, the relationship is disclosed (§ 465.5). this brief draws layer one; § 465.5
is layer two.

---

## the statutory teeth

the wrong is unlawful under the ftc act, and a rule violation carries civil penalties. verbatim,
15 u.s.c. § 45(a)(1):

> "Unfair methods of competition in or affecting commerce, and unfair or deceptive acts or practices
> in or affecting commerce, are hereby declared unlawful."

**source**: [15 u.s.c. § 45](https://www.law.cornell.edu/uscode/text/15/45)

a fake review is not a soft violation — the goodwin analysis notes the rule "authorizes the FTC to
seek civil penalties of up to $51,744 per violation." ([goodwin](https://www.goodwinlaw.com/en/insights/publications/2024/09/alerts-practices-cldr-ftc-finalizes-rule-on-consumer-reviews))

---

## the honest gap

- **verification proves the transaction, not the honesty of the words.** prong 3 (the reviewer's
  *experience*) can still be misrepresented by a real customer; verification cannot catch an
  exaggerated account of a real transaction.
- **the § 465.2 line is necessary but not sufficient.** a verified review can still trip § 465.4
  (sentiment-conditioned reward) or § 465.5 (undisclosed insider). this brief draws only the
  fake-vs-real line.
- **amazon's badge is a design example, not a legal safe harbor.** one actor's verification does not
  immunize another; each actor's controls must stand on their own facts.
- **the ftc.gov primary pages 403-block automated fetch**, so the penalty and ban framings here rest
  on law-firm secondaries; the § 465.x and § 45 text is quoted from the codified cfr / u.s. code on
  cornell, and amazon's badge language from amazon's own trust page.

---

## key takeaways

| question | answer |
|----------|--------|
| what splits safe from fake? | whether the reviewer had a real, verified transaction/experience |
| which prong does verification protect? | all three of § 465.2 (reviewer exists / used it / real experience) |
| what is the market analogue? | amazon's "verified purchase" platform-side check |
| is verified-purchase-only enough? | no — § 465.4/.5/.7 still apply |
| what does a fake review cost? | up to ~$51,744 per violation |

## .see also

- `ref.ftc-part-465-review-rule.[ref].md` — the full part 465 text, section by section
- `ref.casestudy.amazon-vine.[ref].md` — a disclosed, sentiment-blind incentivized-review case study (§ 465.4)
- `ref.casestudy.amazon-early-reviewer.[ref].md` — a discontinued reward-per-review case study

## .publishability

☀️ **fullsun** (share) — generic public-law boundary; no client identity, neutral both-sides voice.

## .sources

1. [16 cfr § 465.2 — fake/false reviews](https://www.law.cornell.edu/cfr/text/16/465.2) — the three-part misrepresentation test (reviewer exists / used it / real experience)
2. [16 cfr § 465.1 — definitions](https://www.law.cornell.edu/cfr/text/16/465.1) — "purported consumer" brings fabricated reviews into scope
3. [16 cfr § 465.5 — insider reviews](https://www.law.cornell.edu/cfr/text/16/465.5) — the adjacent line: a real reviewer who is an undisclosed insider
4. [15 u.s.c. § 45 — ftc act § 5](https://www.law.cornell.edu/uscode/text/15/45) — declares unfair or deceptive acts unlawful; the rule's statutory anchor
5. [how amazon maintains a trusted review experience (amazon)](https://trustworthyshopping.aboutamazon.com/how-amazon-maintains-a-trusted-review-experience) — "verified purchase": amazon validates the reviewer bought the item before it labels the review
6. [ftc bans fake reviews and testimonials (fourscore)](https://www.fourscorelaw.com/resources/ftc-bans-fake-reviews-and-testimonials) — the rule targets reviews by someone who does not exist or who lacked actual experience
7. [ftc finalizes rule on consumer reviews (goodwin)](https://www.goodwinlaw.com/en/insights/publications/2024/09/alerts-practices-cldr-ftc-finalizes-rule-on-consumer-reviews) — the rule forbids creation/purchase/sale/dissemination of fake reviews; up to $51,744 per violation

## .date researched

2026-07-12
