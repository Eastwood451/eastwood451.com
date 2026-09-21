# Shared homepage ordering

Drag cards with a mouse. On touch, hold for 420 ms (moving first keeps normal scrolling), or choose Organisér, then drag. Færdig exits edit mode. Tab to a card in edit mode and use arrows/Home/End; Alt+arrows also works outside edit mode. Escape cancels an active drag.

The owner explicitly chose a public, shared order, not per-user preferences. The homepage's existing browser password gate is unchanged and is not server authentication. All visitors can read/write the order via `/api/app-order`.

Storage: Cloudflare R2, using the existing MATH_PREVIEWS binding and the single reserved key `eastwood-home/app-order-v1.json`. No preview objects, database records, or credentials are modified. The endpoint cannot accept a storage key from a request. There is no localStorage fallback: failure to save is shown explicitly with retry.

GET returns order and an R2 ETag revision. PUT requires that revision (null for first write) and uses an atomic R2 conditional put. A stale write returns 409 plus the latest order; the client displays it and asks the visitor to repeat their move. Requests and responses are uncached. The API bounds and validates the payload, accepts only GET/PUT and checks same-origin writes (CSRF protection, not authentication).

Card IDs are their literal href attributes. Stale IDs are ignored, new cards are appended, and duplicate stored IDs cannot remove cards. Order refreshes on page load and return to the page, without interrupting a drag or unsaved edits. It is shared persistence, not live collaborative streaming.

Run API regression tests: `node --test tests/app-order.test.mjs`.
