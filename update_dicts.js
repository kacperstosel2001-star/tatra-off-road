const fs = require('fs');
const langs = ['pl', 'en', 'de'];

const additions = {
  pl: {
    nav: { news: "Aktualności", privacy: "Polityka prywatności", about: "O nas", contact: "Kontakt" },
    news: { eyebrow: "Nasz Blog", headline: "Aktualności i Poradniki", readMore: "Czytaj więcej", back: "Wróć do aktualności", published: "Opublikowano" },
    breadcrumbs: { home: "Strona główna" }
  },
  en: {
    nav: { news: "News", privacy: "Privacy Policy", about: "About Us", contact: "Contact" },
    news: { eyebrow: "Our Blog", headline: "News & Guides", readMore: "Read more", back: "Back to news", published: "Published" },
    breadcrumbs: { home: "Home" }
  },
  de: {
    nav: { news: "Neuigkeiten", privacy: "Datenschutz", about: "Über uns", contact: "Kontakt" },
    news: { eyebrow: "Unser Blog", headline: "Neuigkeiten & Ratgeber", readMore: "Weiterlesen", back: "Zurück zu Neuigkeiten", published: "Veröffentlicht" },
    breadcrumbs: { home: "Startseite" }
  }
};

for (const lang of langs) {
  const path = `dictionaries/${lang}.json`;
  let data = JSON.parse(fs.readFileSync(path, 'utf8'));
  
  data.nav = { ...data.nav, ...additions[lang].nav };
  data.news = additions[lang].news;
  data.breadcrumbs = additions[lang].breadcrumbs;
  
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}
console.log('Dictionaries updated.');
