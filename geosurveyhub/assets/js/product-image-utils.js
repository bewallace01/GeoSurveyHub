/**
 * Resolve catalog product images. Default: assets/images/products/{id}.jpg
 * Optional JSON field `image`: path under assets/images/ (e.g. products/my-shot.jpg).
 * Bump IMG_VER after replacing product JPEGs so browsers fetch new files.
 */
(function (global) {
  const IMG_VER = "20260355";
  const CATEGORY_FALLBACK = {
    drones: '../assets/images/panel-mountain-aerial.jpg',
    sensors: '../assets/images/panel-data-tech.jpg',
    lidar: '../assets/images/panel-topo-map.jpg',
    'gnss-rtk': '../assets/images/panel-field-engineering.jpg',
    trucks: '../assets/images/panel-field-engineering.jpg',
    computers: '../assets/images/panel-data-tech.jpg',
    'total-stations': '../assets/images/panel-field-engineering.jpg',
    other: '../assets/images/hero-earth.jpg',
  };

  function productImageUrl(product) {
    if (!product || !product.id) return CATEGORY_FALLBACK.other + "?v=" + IMG_VER;
    if (product.image) {
      const rel = String(product.image).replace(/^\/+/, '');
      return '../assets/images/' + rel + (rel.indexOf('?') === -1 ? '?v=' + IMG_VER : '');
    }
    return '../assets/images/products/' + encodeURIComponent(product.id) + '.jpg?v=' + IMG_VER;
  }

  function productImageFallback(product) {
    const cat = product && product.category;
    const base = CATEGORY_FALLBACK[cat] || CATEGORY_FALLBACK.other;
    return base + (base.indexOf('?') === -1 ? '?v=' + IMG_VER : '');
  }

  global.productImageUrl = productImageUrl;
  global.productImageFallback = productImageFallback;
})(typeof window !== 'undefined' ? window : globalThis);
