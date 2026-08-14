const fs = require('fs');

// 1. types/payload.ts
let payloadTs = fs.readFileSync('types/payload.ts', 'utf8');
if (!payloadTs.includes('NewsDTO')) {
  payloadTs += `
export interface NewsDTO {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  image: string;
  author: string;
  meta: MetaDTO;
}
`;
  fs.writeFileSync('types/payload.ts', payloadTs);
}

// 2. repositories/content.repository.ts
let repoTs = fs.readFileSync('repositories/content.repository.ts', 'utf8');
if (!repoTs.includes('getNews')) {
  repoTs = repoTs.replace(
    /getReviews\(\): Promise<ReviewDTO\[\]>;/,
    'getReviews(): Promise<ReviewDTO[]>;\n  getNews(): Promise<NewsDTO[]>;\n  getNewsBySlug(slug: string): Promise<NewsDTO | null>;'
  );
  fs.writeFileSync('repositories/content.repository.ts', repoTs);
}

// 3. services/content.service.ts
let serviceTs = fs.readFileSync('services/content.service.ts', 'utf8');
if (!serviceTs.includes('getNews(')) {
  serviceTs = serviceTs.replace(
    /import \{ .* \} from "..\/types\/payload";/,
    'import { GlobalSettingsDTO, ConfigDTO, TourDTO, FleetDTO, ReviewDTO, NewsDTO } from "../types/payload";'
  );
  serviceTs = serviceTs.replace(
    /async getReviews/,
    `async getNews(): Promise<NewsDTO[]> {
    return [
      {
        id: "1",
        title: "Nowe Can-Am Outlander 2025 już we flocie!",
        slug: "nowe-can-am-outlander-2025",
        excerpt: "Do naszej floty dołączyły właśnie najnowsze modele Can-Am Outlander 2025. Sprawdź, co się zmieniło i dlaczego warto je przetestować.",
        content: "<p>W tym sezonie stawiamy na najwyższą jakość i niezawodność. Modele Can-Am Outlander z rocznika 2025 charakteryzują się ulepszonym zawieszeniem oraz jeszcze wydajniejszym układem chłodzenia, co przekłada się na maksymalny komfort jazdy po trudnych tatrzańskich szlakach.</p><p>Zapraszamy do rezerwacji – poczuj różnicę na własnej skórze!</p>",
        publishedAt: "2026-06-15T10:00:00Z",
        image: "https://images.unsplash.com/photo-1678554834127-71311e4a8024?fm=jpg&q=80&w=1400&auto=format&fit=crop",
        author: "Tatra Off-Road Team",
        meta: { title: "Nowe Can-Am Outlander 2025 | Tatra Off-Road", description: "Najnowsze modele Can-Am we flocie Tatra Off-Road. Sprawdź, dlaczego to najlepszy sprzęt na trasy." }
      },
      {
        id: "2",
        title: "Jak ubrać się na wyprawę quadami w górach?",
        slug: "jak-ubrac-sie-na-wyprawe-quadami",
        excerpt: "Przygotowanie do wyprawy to klucz do udanej zabawy. Zebraliśmy najważniejsze wskazówki dotyczące stroju w zależności od pory roku.",
        content: "<p>Niezależnie od pogody, zawsze zalecamy wygodne buty z twardą podeszwą oraz długie spodnie. Dostarczamy kaski, kominiarki i gogle, ale warto pamiętać o własnych rękawicach.</p><p>W sezonie jesienno-zimowym absolutną koniecznością jest bielizna termoaktywna i warstwa wiatroszczelna. Na szlakach bywa wietrznie, a prędkość na quadzie potęguje uczucie chłodu.</p>",
        publishedAt: "2026-05-20T14:30:00Z",
        image: "https://images.unsplash.com/photo-1596395356956-61b6cb4ec678?fm=jpg&q=80&w=1400&auto=format&fit=crop",
        author: "Tatra Off-Road Team",
        meta: { title: "Jak ubrać się na wyprawę quadami? | Blog Tatra Off-Road", description: "Poradnik: Jak odpowiednio dobrać strój na wycieczkę quadami w górach. Pory roku, sprzęt i bezpieczeństwo." }
      }
    ];
  }

  async getNewsBySlug(slug: string): Promise<NewsDTO | null> {
    const news = await this.getNews();
    return news.find(n => n.slug === slug) || null;
  }

  async getReviews`
  );
  fs.writeFileSync('services/content.service.ts', serviceTs);
}

console.log('Content services updated.');
