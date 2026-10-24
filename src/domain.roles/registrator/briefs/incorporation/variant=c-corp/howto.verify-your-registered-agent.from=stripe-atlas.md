# howto.verify-your-registered-agent.from=stripe-atlas

## .what

a Delaware corporation formed through **Stripe Atlas** has a registered agent
Atlas assigned and bills yearly — and the founder has usually never seen its name.
this is how to find **who they are**, **whether they are still in place**, and
**why the answer does not come from Stripe**.

⚠️ **not legal advice.** every quote is pulled with bhrowser and embedded in
`refs/` beside this brief.

## ⛔ STRIPE PUBLISHES THE SERVICE AND THE PRICE — NEVER THE IDENTITY

measured: the signup docs page hits "registered agent" **18 times**; across every
Atlas page walked — sales, docs root, signup guide, Delaware franchise tax
support — the **agent's name appears zero times**. the probe ran a positive and a
negative control on every page, and both held (`instrumentHeld: true`).

| what Stripe publishes | what Stripe withholds |
|---|---|
| that you have an agent | **who the agent is** |
| what the agent costs | the agent's phone number |
| that the agent may contact you | how to reach the agent first |
| that you may cancel | whether the state's record still names them |

⇒ *"who is our registered agent?"* is a question for **Delaware's** record — free, authoritative, one minute.

## ✅ WHAT STRIPE *DOES* TELL YOU

> "**$500** one-time setup fee (includes government fees and **your first year
> of registered agent services**)"
>
> "Use Atlas to maintain your registered agent, which Delaware requires to run
> your business. **You can cancel anytime.** **$100** annually after your first
> year"
>
> — `refs/pulledAt=2026-08-30.stripe-atlas-pricing.txt`

> "To maintain good standing, Delaware requires that companies have a registered
> agent to receive official notices. The initial 500 USD setup fee includes one
> year of registered agent services, **which automatically renews each year for
> 100 USD**. **Your registered agent might contact you directly to share legal
> notices and official communications from Delaware.** **Your registered agent
> address isn’t a general purpose mail-forwarding address for your company and
> shouldn’t be listed as a company address.** You can separately use a virtual
> address service to receive general mail…"
>
> — `refs/pulledAt=2026-08-30.stripe-atlas-signup-docs.txt`

that last caution is also the statute, pulled independently:

> "**(2)** A registered agent **may not perform its duties or functions solely
> through the use of a virtual office, the retention by the agent of a mail
> forwarding service, or both.**"
>
> — 8 Del. C. § 132(b)(2), `refs/pulledAt=2026-08-30.de-title8-sc03-registered-agent.txt`

- the paragraph is numbered `(2)` in the source; `(b)` lives in the attribution, never inside the quote marks
- two independent sources, one fact: the agent's address is a real Delaware office, not a mail box

## ⭐ WHERE THE IDENTITY ACTUALLY LIVES — Delaware, free

> "The entity information provided on this website, **free of charge**, consists
> of the entity name, file number, incorporation/formation date, **registered
> agent name, address, phone number and residency**."
>
> — `refs/pulledAt=2026-08-23.de-entity-search.txt`

the state's record is also the one that governs — it is what a process server reads and what the Secretary of State mails to.

### ⛔ THIS IS A HUMAN ACT. do not automate it.

> "The Division of Corporations **strictly prohibits mining data**. Excessive and
> repeated searches that may have a negative impact on our systems and customer
> experience are also prohibited. **Use of automated tools in any form may
> result in the suspension of your access to utilize this service.**"

the suspension lands on **your access**, not on the tool. type the file number, read the screen.

### ⛔ AND IT IS THE *ENTITY* SEARCH — the AGENTS DIRECTORY cannot answer this

the Division also publishes a list of registered agents. it cannot answer *"what are MY agent's channels?"*:

1. **the rows carry no attribution.** links arrive in document order with no name attached; to tie one to an agent you must count positions between two neighbors — an inference that fails silently when an agent publishes no channel
2. **a commercial agent may not be listed at all.** the position-count then hands you a neighbor's channel and reads as success

- measured: a whole-page read of the directory returned **509 links** and could attribute none to a named row
- ⇒ only a record keyed to **your file number** answers the question

## 🎯 WHY DELAWARE'S RECORD IS THE AUTHORITY — § 132

> "**(a)** Every corporation shall have and maintain in this State a registered
> agent…"
>
> "**(b) (1)** Every registered agent for a domestic corporation or a foreign
> corporation shall: … **c.** **Accept service of process and other
> communications directed to the corporations** for which it serves as
> registered agent **and forward same to the corporation**…; **d.** **Forward to
> the corporations** for which it serves as registered agent **the annual report
> required by § 502 of this title** or an electronic notification of same…"

- ⛔ read (b)(1)d against § 510: the annual report notice — and the void notice — reach you **through the agent**. if the agent cannot reach you, you learn of the risk only once the charter is void
- § 132(c): an agent for **more than 50 entities** is a *"commercial registered agent"* with extra statutory qualifications. an Atlas agent is one by definition

## 🚩 THE HAZARD NOBODY LOOKS FOR — your agent can RESIGN, and a VOID CORP IS NAMED

> "**§ 136(a)** The registered agent of a corporation, **including a corporation
> which has become void pursuant to § 510 of this title**, **may resign without
> appointing a successor** by filing a certificate of resignation with the
> Secretary of State, but such resignation shall not become effective until **30
> days** after the certificate is filed. The certificate … shall contain a
> statement that written notice of resignation was given to the corporation at
> least 30 days prior to the filing … **by mailing or delivering such notice to
> the corporation at its address last known to the registered agent**…"

§ 132(d) names the trigger:

> "**(d)** Every corporation … shall provide to its registered agent and update
> from time to time as necessary the name, business address and business
> telephone number of a natural person … **who is then authorized to receive
> communications from the registered agent.** Such person shall be deemed the
> **communications contact** for the corporation. … **If the corporation fails
> to provide the registered agent with a current communications contact, the
> registered agent may resign as the registered agent for such corporation
> pursuant to § 136 of this title.**"

```
your communications contact goes stale
  -> the agent MAY resign                        [§ 132(d), last sentence]
    -> notice goes to your LAST KNOWN address    [§ 136(a)]
      -> which is the stale one
        -> 30 days later you have no agent, and never heard
```

- a **void** corporation is named expressly in § 136(a) — void is no protection
- a Certificate of Revival must **state the agent's name** (§ 312(d)(2)), so loss of the agent blocks the cure for the void
- ⇒ update the communications contact in the same call that verifies the agent

### ⭐ AND THAT IS ALSO THE ANSWER TO "HOW DO I GET CONTACTED BY THEM?"

| you want | the instrument |
|---|---|
| to reach **them** | the phone number on Delaware's per-entity record |
| **them** to reach **you** | the § 132(d) **communications contact** |

§ 132(b)(1)c–d make the agent the conduit for process and the § 502 notice, and § 132(d) names the one person it delivers to. there is no second list or vendor preference field: update the contact and you are contactable; leave it stale and you are not.

### ⛔ EXCEPT FOR THE ONE NOTICE YOU MOST NEED — § 136 USES A DIFFERENT ROUTE

| what the agent sends | goes to |
|---|---|
| service of process, the § 502 notice, ordinary communications | the **§ 132(d) communications contact** |
| ⛔ the agent's own **resignation** notice | the corporation's **address last known to the registered agent** — § 136(a) |

- the notice that you are about to lose the agent does **not** go to the person you named — it goes to whatever address is on file, which in this scenario is the stale one
- ⇒ the § 132(d) update is the only act that keeps either route live. do it in the verify call
- ⛔ **do not route it through the vendor.** § 132(d) requires the corporation to provide the contact **to its registered agent**; a Stripe-side profile is Stripe's ledger — see *two facts that look like one*, below

## ⚠️ STRIPE'S "MARCH 1st" IS CORRECT FOR A SMALL CHARTER AND INCOMPLETE FOR A LARGE ONE

> "**By March 1st of each year, you must file an annual franchise tax report and
> pay Delaware franchise taxes.**"
>
> — `refs/pulledAt=2026-08-30.stripe-atlas-signup-docs.txt`

> "Delaware franchise tax is due on **March 1st, 2026** and can be paid online
> through the state's website. All Delaware C Corporations are required to pay
> this tax and file an Annual Report to maintain good standing. The tax amount
> varies, but for many companies, **it's likely to be a few hundred dollars
> instead of thousands**."
>
> — `refs/pulledAt=2026-08-30.stripe-atlas-support-de-franchise-tax.txt`

- measured on those bytes: `June 1` ×0, `$5,000` ×0, `estimated` ×0 — the § 504(a) installment schedule is absent
- once the year's estimated liability reaches **$5,000**, the tax falls in four installments from **June 1** of the tax year (`delaware.franchise.tax.[howto].renew.md` § *⚠️ March 1 is the whole answer only BELOW $5,000*). a large-authorized-shares charter crosses that easily
- ⇒ a founder who calendars **March 1 alone** with such a charter has already missed three due dates and accrues § 504(c) interest on each
- Stripe's sentence is honestly hedged (*"for many companies"*, *"likely"*); the defect is in the reader's calendar

Atlas does flag the method that usually matters more than the deadline:

> "Delaware offers two methods of calculating your franchise tax, and **defaults
> to using one called the Authorized Shares method that often results in high
> tax bills.** Many Atlas companies can **lower the amount of their tax bill
> significantly** by calculating it online using the **Assumed Par Value
> Capital** method instead…"

see `howto.reduce-franchise-tax-for-delaware-corp-solofounder.md`. ⛔ compute no
figure by hand (`rule.forbid.hand-computed-figures`): `rhx franchise.tax.delaware`
for the election comparison, `rhx franchise.tax.delaware.accrue` for installments
and interest.

## .the procedure

```
1. READ WHAT YOU ALREADY HOLD — free, instant, no request to anyone
   the Filed Certificate of Incorporation names the agent AT FORMATION.
   Stripe's own support page tells you where it is:
     "Download your Filed Certificate of Incorporation in the
      Stripe Atlas Dashboard."
   ⚠️ this is the agent as of the formation date. it may be stale.

2. CHECK DELAWARE'S FREE ENTITY SEARCH — the authoritative, CURRENT answer
   search by FILE NUMBER, which you already have from step 1.
   returns: agent name, address, phone number, residency.
   ⛔ by hand. automated tools may suspend your access.
   ⛔ the ENTITY search, never the agents DIRECTORY — the directory
      cannot attribute a channel to a row, and may omit your agent.

3. COMPARE the two.
   they agree     -> the agent is unchanged since formation
   they disagree  -> the agent changed; the STATE's record governs

4. CALL THE AGENT, at the number Delaware published.
   confirm: (a) they still act for you
            (b) the account is current
            (c) update your § 132(d) communications contact       ⭐

   ⭐ (c) is the whole of "how do I get contacted by them?" — it is
      the only channel the statute gives them, and it is the same
      one sentence that closes the § 136 resignation chain.
```

- step 1 before step 2: the certificate is on disk and carries the file number the search needs
- step 4 is required if a filing is imminent:

> "Prior to submitting a document that appoints a Registered Agent, the submitter
> must contact the Registered Agent to verify they agree to act on behalf of the
> entity."
>
> — `refs/pulledAt=2026-08-30.de-submitting-a-request.txt`

a Certificate of Revival names the agent under § 312(d)(2), so it **is** such a document. see `howto.submit-a-certificate-of-revival.md`.

## ⛔ TWO FACTS THAT LOOK LIKE ONE

| the question | where the answer lives |
|---|---|
| is my **Atlas subscription** current? | Stripe |
| is my **agent of record** current? | ⭐ **Delaware** |

a renewed Atlas charge is evidence about Stripe's ledger, not about the Secretary of State's record. a § 136 resignation is filed with Delaware, not Stripe. ⇒ **check the state.**

## .enforcement

- an agent identity asserted from a vendor page = **blocker** (they do not
  publish it; the finding is measured)
- an agent status inferred from a subscription charge = **blocker** (§ 136
  resignation is filed with the state, not the vendor)
- the Delaware entity search driven by an automated tool = **blocker** (the page
  states the penalty is suspension of **your** access)
- a filing that names an agent, submitted with no prior contact = **blocker**
  (the Division's own requirement)
- a franchise-tax calendar built from "March 1" alone, for a charter whose
  estimated liability reaches $5,000 = **blocker** (§ 504(a))
- a zero-hit needle reported as a finding with no proven control = **blocker**
- an agent channel taken from the agents **directory** rather than the
  per-entity record = **blocker** (the directory cannot attribute a row, and a
  wrong attribution reads as a successful lookup)
- a communications contact updated with the **vendor** instead of the **agent** =
  **blocker** (§ 132(d) names the agent as the recipient)
- a § 132(d) communications contact left stale = **nitpick**, and the cheapest
  blocker-in-waiting on this page

## .sources

every quote was pulled with **bhrowser**, headful, per
`rule.require.bhrowser-citations`. every url was **earned by navigation** from a
company or agency root, per `rule.forbid.guessed-urls`, and the bytes are
embedded beside this brief per `rule.require.embed-source-bytes`.

| what | ref | note |
|---|---|---|
| Atlas pricing page | `refs/pulledAt=2026-08-30.stripe-atlas-pricing.txt` | the $500 / $100 / cancel-anytime terms |
| Atlas signup docs | `refs/pulledAt=2026-08-30.stripe-atlas-signup-docs.txt` | 18 hits on "registered agent", **0** on any agent name |
| Atlas franchise-tax support | `refs/pulledAt=2026-08-30.stripe-atlas-support-de-franchise-tax.txt` | `March 1` ×2, `June 1` ×0, `$5,000` ×0 |
| 8 Del. C. ch. 1, subch. III — §§ 131–136 | `refs/pulledAt=2026-08-30.de-title8-sc03-registered-agent.txt` | pulled **whole** — see below |
| Delaware entity search | `refs/pulledAt=2026-08-23.de-entity-search.txt` | the free-of-charge field list, and the automation prohibition |
| Submitting a Request | `refs/pulledAt=2026-08-30.de-submitting-a-request.txt` | the prior-contact requirement |

the playbooks are committed and re-runnable, under `registrator/briefs/refs/`:

- `stripe-atlas-registered-agent.nav.play.ts` — the apex-root walk
- `stripe-atlas-registered-agent.docs.play.ts` — the docs walk
- `promote.source-bytes.js` — the promotion, with a refusal guard

### the container rule

- a slice of subchapter III to § 132 alone reads as a complete answer and omits § 136 — where an agent may resign from a void corporation on notice to a stale address. the unit of retrieval is the container
- the promotion refuses on a missed slice marker, and the bounded result was checked against controls that must fail (it carries § 132(c), and neither the table-of-contents line nor § 134)
- the file is stamped `pulledAt=`, not `effectiveAt=`: delcode states its vintage as a chain of session laws (`85 Del. Laws, c. 48, § 6`), never an effective date. a stamp is a claim about the bytes

## .see also

- `howto.submit-a-certificate-of-revival.md` — where the prior-contact
  requirement and § 312(d)(2) bind
- `delaware.franchise.tax.[howto].renew.md` — the § 504(a) installment schedule
  Stripe omits
- `howto.reduce-franchise-tax-for-delaware-corp-solofounder.md` — the Assumed Par
  Value election Stripe correctly flags
- `delaware.franchise.tax.delinquency.md` — § 510, and the notice that arrives
  through the agent
- `rule.forbid.guessed-urls` — why every url above was walked rather than typed
