// Turn the measurements for one page into a single comparable score. No browser needed.
//
// This is a mechanical floor, not a verdict on taste: it counts what the scripts can see
// (machine-made tells, accessibility and state problems, drift, overflow). A page can score 100
// and still be boring. Always look at the screenshots too.

export const WEIGHTS = {
  tellKind: 3, // each distinct kind of tell found
  tellExtra: 0.25, // each further instance beyond the first of a kind (capped below)
  tellExtraCap: 10,
  checkProblem: 2, // each contrast, target, name, focus or layout-shift problem (distinct by kind and place)
  driftFlag: 2,
  sideways: 10, // a page that scrolls sideways at any standard width
  consoleError: 5,
};

export function score({ tells = [], checks = [], drift, shoot = [] }) {
  const kinds = new Map();
  for (const t of tells) kinds.set(t.tell, (kinds.get(t.tell) || 0) + 1);
  const extras = Math.min(WEIGHTS.tellExtraCap, [...kinds.values()].reduce((a, n) => a + (n - 1), 0) * WEIGHTS.tellExtra);
  const tellPenalty = kinds.size * WEIGHTS.tellKind + extras;

  const seen = new Set();
  for (const c of checks) for (const p of c.problems) seen.add(`${p.kind}|${p.where}`);
  const checkPenalty = seen.size * WEIGHTS.checkProblem;

  const driftPenalty = (drift?.flags?.length || 0) * WEIGHTS.driftFlag;
  const sidewaysPenalty = shoot.some((s) => s.sideways) ? WEIGHTS.sideways : 0;
  const errorPenalty = shoot.some((s) => s.errors?.length) ? WEIGHTS.consoleError : 0;

  const penalty = tellPenalty + checkPenalty + driftPenalty + sidewaysPenalty + errorPenalty;
  return {
    score: Math.max(0, Math.round(100 - penalty)),
    breakdown: {
      tellKinds: kinds.size,
      tellInstances: tells.length,
      checkProblems: seen.size,
      driftFlags: drift?.flags?.length || 0,
      sideways: sidewaysPenalty > 0,
      consoleErrors: errorPenalty > 0,
    },
    tellList: [...kinds.keys()],
    checkList: [...seen],
    driftList: drift?.flags || [],
  };
}
