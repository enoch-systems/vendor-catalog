const isRemoteUrl = (src) => /^https?:\/\//i.test(src);
const getOptimizedBase = (originalSrc) => {
  if (isRemoteUrl(originalSrc)) return originalSrc;
  if (originalSrc.includes('/optimized/')) {
    return originalSrc.replace(/\.(webp|avif)$/i, '');
  }
  const filename = originalSrc.split('/').pop();
  if (!filename) return originalSrc;
  const nameWithoutExt = filename.split('.').slice(0, -1).join('.');
  return `/optimized/${nameWithoutExt}`;
};

const testInputs = [
  'https://res.cloudinary.com/djdbcoyot/image/upload/v1773330840/pdaummli0t0t5bayrybs.jpg',
  ' https://res.cloudinary.com/djdbcoyot/image/upload/v1773330840/pdaummli0t0t5bayrybs.jpg',
  '//res.cloudinary.com/djdbcoyot/image/upload/v1773330840/pdaummli0t0t5bayrybs.jpg',
  '/optimized/',
  '/optimized/.webp',
  '',
  '   ',
];

for (const s of testInputs) {
  console.log(JSON.stringify(s), '=>', getOptimizedBase(s));
}
