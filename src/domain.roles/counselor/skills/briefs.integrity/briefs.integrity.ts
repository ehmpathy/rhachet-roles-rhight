import { parseArgs } from 'node:util';
import { getOneBriefIntegrityReport } from '../../../../domain.operations/brief/getAllBriefsOnDisk';

/**
 * .what = CLI entry point for the brief integrity suite
 * .why = the peer rubrics are globbed to '**\/*.{ts,sh}', so no automated
 *        check reads a markdown brief. this makes the checks callable on
 *        demand, by a human or a hook, rather than only from a jest gate.
 */
const main = async (): Promise<void> => {
  const { values } = parseArgs({
    options: {
      path: { type: 'string' },
      severity: { type: 'string' },
      check: { type: 'string', multiple: true },
    },
    strict: true,
  });

  const root = values.path;
  const severity = values.severity ?? 'all';

  // ⚠️ the filter narrows what is REPORTED, never what is read. the whole
  // set is always scanned, because the cross-file check can only see the
  // set it is given — a filter that narrowed the read would leave it
  // silently weaker than it looks.
  const checksWanted = values.check ?? [];

  if (!root) {
    console.error('error: --path is required');
    process.exit(2);
  }

  if (!['all', 'blocker', 'nitpick'].includes(severity)) {
    console.error(
      `error: --severity must be one of: all, blocker, nitpick (got "${severity}")`,
    );
    process.exit(2);
  }

  const report = getOneBriefIntegrityReport({ root });

  const detected = checksWanted.length
    ? report.defects.filter((defect) => checksWanted.includes(defect.check))
    : report.defects;

  // ⚠️ these two are DIFFERENT NUMBERS and both are reported. `briefsReached`
  // is measured from the set that was READ; `briefsWithDefects` is derived
  // from the defects. only the first separates a clean corpus from an
  // unreached one — both of which yield zero defects — and that separation
  // is the whole reason this suite exists.
  const briefsWithDefects = new Set(detected.map((defect) => defect.path)).size;

  const defects =
    severity === 'all'
      ? detected
      : detected.filter((defect) => defect.severity === severity);

  const countByCheck: Record<string, number> = {};
  for (const defect of defects)
    countByCheck[defect.check] = (countByCheck[defect.check] ?? 0) + 1;

  console.log(
    JSON.stringify({
      root,
      severity,
      briefsReached: report.briefsReached,
      briefsWithDefects,
      blockers: detected.filter((defect) => defect.severity === 'blocker')
        .length,
      nitpicks: detected.filter((defect) => defect.severity === 'nitpick')
        .length,
      countByCheck,
      defects: defects.map((defect) => ({
        path: defect.path,
        check: defect.check,
        severity: defect.severity,
        line: defect.line,
        detail: defect.detail,
      })),
    }),
  );
};

main().catch((error) => {
  console.error('error:', error.message);
  process.exit(1);
});
