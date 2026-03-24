/**
 * Shared formatting for catalog price ranges (USD).
 * products.json uses priceLow / priceHigh instead of fixed prices.
 */
function formatPriceRange(p) {
  if (!p) return 'Contact for quote';
  const lo = p.priceLow;
  const hi = p.priceHigh;
  if (lo == null && hi == null) return 'Contact for quote';
  if (lo != null && hi != null) {
    if (lo === hi) return `$${lo.toLocaleString()}`;
    if (lo === 0) return `Free–$${hi.toLocaleString()}`;
    return `$${lo.toLocaleString()}–$${hi.toLocaleString()}`;
  }
  const single = lo ?? hi;
  return `$${single.toLocaleString()}`;
}

function formatCategorySlug(slug) {
  if (!slug) return '';
  return String(slug)
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
