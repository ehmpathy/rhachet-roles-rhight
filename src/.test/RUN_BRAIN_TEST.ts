/**
 * .what = true only when a human or a job names the live-brain tier: `BRAIN_LIVE=true`
 * .why  = a live-brain test bills a real model call. the pii gate is a safety
 *         guard, so its real brain runs at commit, and ci runs its stubbed
 *         suite instead; a live test runs only when targeted, never on every
 *         ci push (bulletin live-brain-tests-three-tiers)
 *
 * .note = target it: `BRAIN_LIVE=true rhx git.repo.test --what integration --mode apply --scope pii.scan.via.brain.live`
 */
export const RUN_BRAIN_TEST = process.env.BRAIN_LIVE === 'true';
