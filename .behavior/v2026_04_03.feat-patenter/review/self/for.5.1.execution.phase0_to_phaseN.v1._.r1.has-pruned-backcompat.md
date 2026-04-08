# review: has-pruned-backcompat

review for backwards compatibility that was not explicitly requested.

---

## findings

### no backwards compatibility concerns

this is a **new role**. there is no prior version to maintain compatibility with.

**what was built**:
- new `patenter` role (first version)
- new `patent.priors.search` skill (first version)
- new `patent.priors.fetch` skill (first version)
- new `patent.propose` skill (first version)
- new `getRhightRoleRegistry` (first version)

**backwards compat decisions reviewed**:

1. **exid format validation** — accepts multiple USPTO formats (US12345678A1, US20210234567A1, US7654321B2)
   - **why**: USPTO has multiple format variants. this is not backwards compat, it's correct domain model.

2. **API response shape** — scripts handle absent fields gracefully
   - **why**: USPTO API may return incomplete data. this is defensive code, not backwards compat.

3. **exit codes** — uses semantic exit codes (0=success, 1=malfunction, 2=constraint)
   - **why**: follows established rhachet convention. not backwards compat, just consistency.

---

## summary

| concern | present? | reason |
|---------|----------|--------|
| backwards compat | no | new role, no prior version |
| assumed "to be safe" compat | no | no legacy concerns |

**no backwards compat concerns found**. this is greenfield code.
