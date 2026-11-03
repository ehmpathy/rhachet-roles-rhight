# F1 — drop each rhight role's self-boot `onBoot` hook

- **the fork**: the boot install failed because rhachet 1.50.1's `repo introspect` refuses hooks that boot their own role ("briefs reach a session via the brain dir boot.md render"). options: (a) delete the hooks, as the error's hint says; (b) pin rhachet back to 1.47.3.
- **taken**: (a) for all 7 roles that carried one (accountant, counselor, insurer, licenser, patenter, permiter, transcriber). counselor is not in the registry, but it carried the same redundant hook. **why at the time**: (b) undoes the upgrade the boot ran; boot.md already renders these roles.
- **rework**: clean — re-add a 6-line block per role.
- **confidence**: 95%. low only because no session-level check shows briefs still arrive. the `rhx upgrade` output lists all rhight roles in the boot render.
- **where**: `src/domain.roles/*/get*Role.ts` → `onBoot: []`.
- **follow-up (i007)**: the hook removal leans on rhachet ≥ 1.50.1, so `package.json` declares `peerDependencies: { "rhachet": ">=1.50.1" }`, as the sibling role packages declare theirs; `pnpm install --frozen-lockfile --offline` holds.
