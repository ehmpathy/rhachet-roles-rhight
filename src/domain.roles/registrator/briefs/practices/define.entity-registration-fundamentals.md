# define.entity-registration-fundamentals

## .what

core concepts for entity registration and maintenance — one vocabulary for the
hierarchy of state and federal duties.

---

## the fundamental purpose

registration grants the power to sign with legal recognition.

| without registration | with registration |
|---|---|
| signatures have no legal authority | signatures bind the entity |
| contracts aren't enforceable against the entity | contracts are enforceable |
| the entity cannot act in its own name | the entity can seal deals |

---

## entity types

| type | formation doc | owners | liability | taxation |
|------|---------------|--------|-----------|----------|
| LLC | articles of organization | members | limited | pass-through by default; may elect corporate |
| corporation | articles of incorporation | shareholders | limited | corporate tax, then a second tax on dividends **when distributed** |
| LP | certificate of limited partnership | general + limited partners | limited for LPs | pass-through |
| LLP | registration statement | partners | limited | pass-through |
| sole prop | none (default) | owner | unlimited | pass-through |

### ⛔ an S-corp is not an entity type

this table's axis is **what you register with the state**. an S-corp has no
formation doc of its own — it is a **federal tax election** made *after*
formation, by an LLC or a corporation that already exists:

```
state registration  ->  the entity            (this table)
federal election    ->  how it is taxed       (a SECOND, separate choice)
```

a row like *"S-Corp | articles + S election"* occupies two axes at once. every
cell can be true and the table still wrong, because it offers a registration
choice you cannot register.

### the eligibility limit

the shorthand *"shareholders (≤100)"* errs in both directions:

| the shorthand | §1361 |
|---|---|
| "≤100" | a **family** counts as **one** — a common ancestor and every lineal descendant, 6 generations, §1361(c)(1) |
| (implied) individuals only | (b)(1)(B)'s own parenthesis admits an **estate**, a **(c)(2) trust**, and a **(c)(6) organization**; (b)(1)(C) bars a **nonresident alien**, which is a residency test |
| (unstated) | one class of stock — but stock that votes and stock that does not, both **common**, is one class, §1361(c)(4) |

full treatment: `incorporation/variant=c-corp/compare.s-corp-vs-c-corp-tax-election.md`

---

## registration lifecycle

| phase | action | authority |
|-------|--------|-----------|
| formation | file articles | state (secretary of state) |
| federal id | obtain EIN | IRS |
| maintenance | annual report + franchise tax | state |
| status | certificate of good standing | state |
| dissolution | file dissolution | state |

---

## state vs federal

| domain | state | federal |
|--------|-------|---------|
| creates entity | ✓ | ✗ |
| maintains status | ✓ (franchise tax, annual report) | ✗ |
| taxes income | varies | ✓ (1120, 1065, etc.) |
| assigns ID | state entity number | EIN |

federal registration (EIN) does not create the entity — state formation does.

---

## good standing

an entity is in "good standing" when:
- formation documents are on file
- franchise tax is current
- annual reports are filed
- registered agent is designated

without good standing:
- cannot obtain certificate of status
- may lose authority to transact
- contracts may be voidable
- liability shield may be pierced

---

## key dates

| what you file | deadline | penalty |
|---------------|----------|---------|
| delaware **annual report** | **March 1** · 8 Del. C. §502 | **$200** per year · §502(c) |
| delaware **franchise tax** | ⚠️ **March 1 only below $5,000** — see below · §504(a) | **1.5% per month** from **each** due date · §504(c) |
| california statement of information | 🚩 **unverified** — and ⚠️ **"then annually" is a corporation rule**; an LLC files **biennially** | 🚩 **unverified** |
| federal tax return (C-corp) | 🚩 **unverified** — and the calendar-year date **moved** for tax years after 2015 | 🚩 **unverified** |

### ⛔ the Delaware report and tax are TWO deadlines

§502 puts the report on March 1 unconditionally; §504(a) does not put the tax there — at an estimated **$5,000** or more it falls in four installments, the first on **June 1 of the tax year**.

- a 10,000,000-share startup charter is billed **$85,165.00** by default — seventeen times the trigger
- even on the elected assumed-par-value method, the tax crosses $5,000 at a Series A balance sheet ($9.6M assets → $4,800; $10M → $5,200, both from `rhx franchise.tax.delaware`)
- the schedule: `registrator/…/delaware.franchise.tax.[howto].renew.md` § *⚠️ March 1 is the whole answer only BELOW $5,000*
- two sanctions, two sections: the **$200** is §502(c)'s penalty on the *report*; the **1.5%/month** is §504(c)'s interest on the *tax*

### 🚩 the California and federal rows are unsourced

none of the `.sources` below (SBA, a lender's blog, two Secretary-of-State formation FAQs, a payroll vendor) publishes a California fee schedule or a federal penalty rate.

- **California**: verify against the California Secretary of State's own fee schedule, and split the corporation and LLC cadences
- **federal**: the calendar-year C-corp due date moved for tax years after 2015, so an undated statement cannot hold for every year. see `accountant/briefs/income-tax/federal/`
- a flag is not a correction — the figures may be right; only their absent source is established

---

## terminology

| term | definition |
|------|------------|
| articles | formation document filed with state |
| certificate | state-issued proof of formation or status |
| registered agent | designated recipient of legal process |
| franchise tax | annual fee for privilege of entity status |
| EIN | employer identification number (federal tax ID) |
| good standing | entity is compliant with state requirements |
| foreign qualification | registration to do business in another state |

---

## .sources

### entity formation

> "How and where you need to register depends on your business structure and business location."
>
> — [U.S. Small Business Administration: Register Your Business](https://www.sba.gov/business-guide/launch-your-business/register-your-business)

> "Generally speaking, all corporations, limited liability companies and limited liability partnerships need to register with their state."
>
> — [Nav: How to Register Your Business with the Secretary of State](https://www.nav.com/blog/register-business-secretary-state-23857/)

> "Corporations, LLCs, and LPs are formed by filing a certificate of formation with the secretary of state."
>
> — [Texas Secretary of State: Formation of Texas Entities FAQs](https://www.sos.state.tx.us/corp/formationfaqs.shtml)

### good standing

> "A certificate of legal existence (which is called a certificate of good standing in some states) verifies that a business entity is registered with the office and is up-to-date with the filing obligations of the Secretary of State."
>
> — [Connecticut Secretary of State: Certificate of Legal Existence](https://business.ct.gov/knowledge-base/articles/sots/certificates-of-legal-existence)

> "The certificate confirms that the business entity has complied with all state requirements for registration and has paid all necessary fees and taxes."
>
> — [Gusto: What's a Certificate of Good Standing?](https://gusto.com/resources/articles/start-business/certificate-good-standing)

### further reading

- [California Secretary of State: Starting a Business – Entity Types](https://www.sos.ca.gov/business-programs/business-entities/starting-business/types)
- [Justia: Business Formation Laws and Forms: 50-State Survey](https://www.justia.com/business-operations/business-forms-50-state-resources/)
- [Colorado Secretary of State: Certificate of Good Standing FAQ](https://www.sos.state.co.us/pubs/business/FAQs/certGoodStanding.html)
