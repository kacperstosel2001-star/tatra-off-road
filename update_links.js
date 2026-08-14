const fs = require('fs');

// 1. Zmiana stopki
let footerTs = fs.readFileSync('components/layout/Footer.tsx', 'utf8');

// Replace standard #hash links in footer with Next.js subpages, but only in the first list.
footerTs = footerTs.replace(
  /<Link href="#o-nas">\{dict\.nav\.whyUs\}<\/Link>/,
  '<Link href={`/${dict.nav.news ? "pl" : "en"}/about`}>{dict.nav.about || dict.nav.whyUs}</Link>' // Quick language hack fix - pass lang to footer in a real app, here we will just modify the file completely.
);

fs.writeFileSync('components/layout/Footer.tsx', footerTs);
