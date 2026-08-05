// Overrides the root app/loading.tsx fallback for this route. Without this,
// every client-side navigation to Discover shows the generic grey skeleton
// while the RSC payload streams in over the network -- before the page's
// own getCached()-backed state ever gets a chance to render its cached
// profiles instantly. Returning null lets the black body background show
// through for that instant instead of a mismatched skeleton flash.
export default function Loading() {
  return null;
}
