import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import type { BriefIntegrityDefect } from '../../domain.objects/brief/BriefIntegrityDefect';
import { asBriefAnatomy } from './asBriefAnatomy';
import { getAllDefectsOfBriefSet } from './getAllDefectsOfBriefSet';
import { getAllDefectsOfOneBrief } from './getAllDefectsOfOneBrief';

/**
 * .what = read every brief under a root directory
 * .why = the checks are pure; this is the one place that touches a disk,
 *        so the checks stay unit-testable and this stays integration-tested
 */
export const getAllBriefsOnDisk = (input: {
  root: string;
}): { path: string; content: string }[] => {
  const paths = getAllMarkdownPaths({ dir: input.root }).filter((path) =>
    path.includes('/briefs/'),
  );
  return paths.map((path) => ({
    path: relative(input.root, path),
    content: readFileSync(path, 'utf8'),
  }));
};

/**
 * .what = run every integrity check over every brief under a root
 * .why = the single entrypoint a gate (or a skill) calls
 *
 * ⭐ .why it returns a REPORT and not a bare defect list — the whole reason
 *    this suite exists is that a check which cannot reach its subject passes
 *    forever. so `briefsReached` must be measured from the set that was READ,
 *    never derived from the defects found: a clean corpus and an unreached
 *    corpus both yield zero defects, and only the read-count tells them apart.
 *    a caller handed a bare `BriefIntegrityDefect[]` has no way back to that
 *    number, so the shape itself has to carry it.
 */
export const getOneBriefIntegrityReport = (input: {
  root: string;
}): { briefsReached: number; defects: BriefIntegrityDefect[] } => {
  const briefs = getAllBriefsOnDisk({ root: input.root });

  const defectsPerBrief = briefs.flatMap((brief) => {
    const anatomy = asBriefAnatomy({ content: brief.content });

    // only the disk can say whether a see-also target opens
    const dirOfBrief = dirname(join(input.root, brief.path));
    const seeAlsoTargetsAbsent = anatomy.seeAlsoTargets.filter(
      ({ target }) => !existsSync(resolve(dirOfBrief, target)),
    );

    return getAllDefectsOfOneBrief({
      path: brief.path,
      content: brief.content,
      seeAlsoTargetsAbsent,
      isPublishedPath: isPublishedPath({
        absolute: join(input.root, brief.path),
      }),
    });
  });

  return {
    // ⛔ MEASURED from the set that was READ. never derive this from the
    // defects: an earlier form did, and `briefsReached` then equalled
    // `briefsWithDefects` by construction (173 === 173), so the number could
    // not tell a clean corpus from an unreached one. the clamp for this is
    // `clean briefs were read, not only defective ones` — a STRICT
    // INEQUALITY, because a floor (`> 100`) passes under the defect too.
    briefsReached: briefs.length,
    defects: [...defectsPerBrief, ...getAllDefectsOfBriefSet({ briefs })],
  };
};

/**
 * .what = whether a brief's absolute path ships to consumers
 * .why = the package's `files` carries `dist`, and `dist` is built by an
 *        rsync out of `src/` that globs '**\/briefs/**\/*.md'. so a file
 *        under a `src/` segment is packaged, and one outside it (e.g. under
 *        `.agent/`) is not.
 *
 * ⚠️ .the bound this does NOT cover — stated so it is not mistaken for one.
 *    this answers "does it ship to npm consumers", NOT "is it private". the
 *    git repo is public, so a file outside `src/` is still world-readable on
 *    the forge. a brief that must not be seen at all belongs in neither tree.
 */
export const isPublishedPath = (input: { absolute: string }): boolean =>
  input.absolute.split(sep).includes('src');

/**
 * .what = every markdown file under a directory, recursively
 */
const getAllMarkdownPaths = (input: { dir: string }): string[] =>
  readdirSync(input.dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(input.dir, entry.name);
    if (entry.isDirectory()) return getAllMarkdownPaths({ dir: path });
    return entry.name.endsWith('.md') ? [path] : [];
  });
