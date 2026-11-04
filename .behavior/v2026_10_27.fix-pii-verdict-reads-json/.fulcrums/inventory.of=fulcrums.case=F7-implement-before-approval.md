# F7 — implement before the vision is approved

- **the fork**: `1.vision` gates on human approval; the wish sets a 12:00 CT deadline for a green pr. options: (a) wait idle for approval; (b) build the cure and clamp now, on the vision as written.
- **taken**: (b). **why**: the wish pins the design tightly (json source, three named clamp cases), so approval is unlikely to move it; the code is unstaged-reversible.
- **rework**: clean — the diff is one function and its tests.
- **confidence**: 88%. the route's order is a stated bound, and this acts ahead of it.
