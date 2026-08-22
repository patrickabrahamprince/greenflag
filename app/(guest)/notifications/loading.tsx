// See app/(guest)/discover/loading.tsx for why this exists -- overrides the root
// app/loading.tsx fallback so this route's own getCached()-backed state
// isn't preempted by a mismatched skeleton flash on every navigation.
export default function Loading() {
  return null;
}
