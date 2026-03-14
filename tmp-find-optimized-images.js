const fetch = require('node-fetch');

(async () => {
  const res = await fetch('http://localhost:3000/api/products');
  const products = await res.json();
  const bad = products.filter(p => {
    const img = typeof p.image === 'string' ? p.image : '';
    const imgs = Array.isArray(p.images) ? p.images : [];
    return [img, ...imgs].some(x => typeof x === 'string' && x.includes('/optimized/'));
  });
  console.log('bad count', bad.length);
  console.log(bad.slice(0, 5).map(p => ({ id: p.id, name: p.name, image: p.image, images: p.images })));
})();
