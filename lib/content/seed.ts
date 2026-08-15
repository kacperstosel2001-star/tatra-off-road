import type { Payload } from 'payload'

const DEFAULT_BG =
  'https://images.unsplash.com/photo-1698154050417-8a472a92ac78?fm=jpg&q=80&w=2400&auto=format&fit=crop'

async function collectionEmpty(payload: Payload, slug: string) {
  const result = await payload.find({ collection: slug as any, limit: 1, depth: 0 })
  return result.totalDocs === 0
}

const SAMPLE_NEWS_POSTS = [
  {
    title: 'Nowe Can-Am Outlander 2025 już we flocie!',
    slug: 'nowe-can-am-outlander-2025',
    excerpt:
      'Do naszej floty dołączyły właśnie najnowsze modele Can-Am Outlander 2025. Sprawdź, co się zmieniło i dlaczego warto je przetestować.',
    content:
      '<p>W tym sezonie stawiamy na najwyższą jakość i niezawodność. Modele Can-Am Outlander z rocznika 2025 charakteryzują się ulepszonym zawieszeniem oraz jeszcze wydajniejszym układem chłodzenia.</p><p>Zapraszamy na jazdę próbną — rezerwacja online zajmuje kilka minut, a przewodnik prowadzi całą trasę.</p>',
    publishedAt: '2026-06-15T10:00:00.000Z',
    imageUrl:
      'https://images.unsplash.com/photo-1678554834127-71311e4a8024?fm=jpg&q=80&w=1400&auto=format&fit=crop',
    meta: {
      title: 'Nowe Can-Am Outlander 2025 | Tatra Off-Road',
      description: 'Najnowsze modele Can-Am we flocie Tatra Off-Road.',
    },
  },
  {
    title: 'Jak ubrać się na wyprawę quadami w górach?',
    slug: 'jak-ubrac-sie-na-wyprawe-quadami',
    excerpt:
      'Przygotowanie do wyprawy to klucz do udanej zabawy. Zebraliśmy najważniejsze wskazówki dotyczące stroju w zależności od pory roku.',
    content:
      '<p>Niezależnie od pogody, zawsze zalecamy wygodne buty z twardą podeszwą oraz długie spodnie. Dostarczamy kaski, kominiarki i gogle.</p><p>Latem sprawdzą się oddychające warstwy, zimą — ciepła kurtka i rękawice. Na miejscu zawsze masz briefing przed startem.</p>',
    publishedAt: '2026-05-20T14:30:00.000Z',
    imageUrl:
      'https://images.unsplash.com/photo-1596395356956-61b6cb4ec678?fm=jpg&q=80&w=1400&auto=format&fit=crop',
    meta: {
      title: 'Jak ubrać się na wyprawę quadami? | Blog Tatra Off-Road',
      description: 'Poradnik: jak dobrać strój na wycieczkę quadami w górach.',
    },
  },
  {
    title: 'Bezpieczeństwo na szlaku — co warto wiedzieć',
    slug: 'bezpieczenstwo-na-szlaku',
    excerpt:
      'Kask, briefing i tempo grupy to podstawa. Opisujemy, jak dbamy o bezpieczeństwo na każdej trasie.',
    content:
      '<p>Przed startem każdy uczestnik dostaje sprzęt ochronny i krótkie szkolenie. Jedziemy tylko legalnymi trasami, a przewodnik dostosowuje tempo do grupy.</p><p>Ubezpieczenie NNW jest wliczone w pakiet — dzięki temu możesz skupić się na widokach i adrenaliny.</p>',
    publishedAt: '2026-07-02T09:00:00.000Z',
    imageUrl:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?fm=jpg&q=80&w=1400&auto=format&fit=crop',
    meta: {
      title: 'Bezpieczeństwo na szlaku | Tatra Off-Road',
      description: 'Jak wygląda bezpieczeństwo na wyprawach quadowych Tatra Off-Road.',
    },
  },
  {
    title: 'Najlepsze trasy Podhala na lato 2026',
    slug: 'najlepsze-trasy-podhala-lato-2026',
    excerpt:
      'Lasy, grzbiety i widoki na Tatry — zestawienie tras, które najczęściej wybieracie w sezonie letnim.',
    content:
      '<p>Latem najczęściej rezerwujecie trasy leśne wokół Zębu oraz dłuższe wyprawy z panoramą Tatr. Dopasowujemy dystans do pogody i poziomu grupy.</p><p>Jeśli jedziesz pierwszy raz, polecamy krótszy pakiet intro — potem łatwo wrócić na dłuższy szlak.</p>',
    publishedAt: '2026-07-18T11:00:00.000Z',
    imageUrl:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?fm=jpg&q=80&w=1400&auto=format&fit=crop',
    meta: {
      title: 'Najlepsze trasy Podhala 2026 | Tatra Off-Road',
      description: 'Polecane trasy quadowe na Podhalu w sezonie letnim.',
    },
  },
  {
    title: 'Wyprawa firmowa — integracja na quadach',
    slug: 'wyprawa-firmowa-integracja-na-quadach',
    excerpt:
      'Szukacie nietuzinkowej integracji? Opisujemy, jak wygląda dzień firmowy z Can-Am i przewodnikiem.',
    content:
      '<p>Organizujemy pakiety dla zespołów: briefing, wspólna trasa, przerwa kawowa i zdjęcia z wyprawy. Sprzęt 1- i 2-osobowy, tempo dopasowane do grupy.</p><p>Rezerwację firmową najłatwiej ustalić telefonicznie albo przez formularz online — pomożemy dobrać termin i liczbę quadów.</p>',
    publishedAt: '2026-08-01T08:30:00.000Z',
    imageUrl:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?fm=jpg&q=80&w=1400&auto=format&fit=crop',
    meta: {
      title: 'Integracja firmowa na quadach | Tatra Off-Road',
      description: 'Wyprawy quadowe dla firm na Podhalu — Can-Am i przewodnik.',
    },
  },
  {
    title: 'Sezon zimowy: quady po śniegu na Podhalu',
    slug: 'sezon-zimowy-quady-po-sniegu',
    excerpt:
      'Zimą trasy wyglądają zupełnie inaczej. Sprawdź, kiedy jeździmy i jak przygotować się do śnieżnej przygody.',
    content:
      '<p>Przy odpowiedniej pokrywie śnieżnej wyruszamy na wybrane odcinki z większym naciskiem na bezpieczeństwo i krótsze dystanse.</p><p>Ciepły strój to must-have — resztę ochrony zapewniamy na miejscu. Terminy zimowe znikają szybko, więc warto rezerwować z wyprzedzeniem.</p>',
    publishedAt: '2026-01-12T12:00:00.000Z',
    imageUrl:
      'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?fm=jpg&q=80&w=1400&auto=format&fit=crop',
    meta: {
      title: 'Quady zimą na Podhalu | Tatra Off-Road',
      description: 'Zimowe wyprawy quadowe Tatra Off-Road — przygotowanie i trasy.',
    },
  },
] as const

async function ensureNewsPosts(payload: Payload) {
  let created = 0
  for (const post of SAMPLE_NEWS_POSTS) {
    const existing = await payload.find({
      collection: 'news-posts',
      where: { slug: { equals: post.slug } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.totalDocs > 0) continue

    await payload.create({
      collection: 'news-posts',
      locale: 'pl',
      overrideAccess: true,
      data: {
        ...post,
        author: 'Tatra Off-Road Team',
        active: true,
      } as any,
    })
    created += 1
  }
  if (created > 0) {
    payload.logger.info(`Seeded ${created} sample news posts`)
  }
}

export async function seedSiteContent(payload: Payload) {
  try {
    if (await collectionEmpty(payload, 'features')) {
      const features = [
        {
          title: 'Can-Am 2025',
          description:
            'Jako jedyni w regionie oferujemy najnowsze modele Can-Am. Moc, komfort i niezawodność — zarówno dla początkujących, jak i tych, którzy jeździli już wcześniej.',
          iconName: 'star',
          sortOrder: 1,
        },
        {
          title: 'Znamy każdy szlak',
          description:
            'Nie ruszamy przypadkowymi drogami. Legalne, zaplanowane trasy przez lasy podhalańskie i grzbiety — dopasowane do pogody, pory roku i grupy.',
          iconName: 'map',
          sortOrder: 2,
        },
        {
          title: 'Bezpieczeństwo bez kompromisów',
          description:
            'Kask, ochraniacze, briefing przed startem i przewodnik pilnujący grupy przez cały czas. Ubezpieczenie NNW jest wliczone w każdy pakiet.',
          iconName: 'shield',
          sortOrder: 3,
        },
        {
          title: 'Pakiety dla każdego',
          description:
            'Pierwszy raz na quadzie, weekendowa jazda z partnerem czy integracja firmowa — mamy dopasowany pakiet, długość trasy i tempo.',
          iconName: 'users',
          sortOrder: 4,
        },
      ]
      for (const doc of features) {
        await payload.create({ collection: 'features', data: doc as any, locale: 'pl' })
      }
    }

    if (await collectionEmpty(payload, 'fleet-vehicles')) {
      await payload.create({
        collection: 'fleet-vehicles',
        locale: 'pl',
        data: {
          name: 'Can-Am Outlander',
          type: 'Solo Ride',
          badge: '1-osobowy',
          power: '82 KM',
          drive: '4x4',
          seats: '1',
          year: '2025',
          imageUrl:
            'https://images.unsplash.com/photo-1678554834127-71311e4a8024?fm=jpg&q=80&w=1400&auto=format&fit=crop',
          sortOrder: 1,
          active: true,
        } as any,
      })
      await payload.create({
        collection: 'fleet-vehicles',
        locale: 'pl',
        data: {
          name: 'Can-Am Outlander MAX',
          type: 'Duo Ride',
          badge: '2-osobowy',
          power: '91 KM',
          drive: '4x4',
          seats: '2',
          year: '2025',
          imageUrl:
            'https://images.unsplash.com/photo-1653859465778-58b3e964cadc?fm=jpg&q=80&w=1400&auto=format&fit=crop',
          sortOrder: 2,
          active: true,
        } as any,
      })
    }

    if (await collectionEmpty(payload, 'tour-routes')) {
      const routes = [
        {
          title: 'Las Podhalański',
          difficulty: 'Łatwa',
          routeNum: 'TRASA 01',
          description: 'Leśne ścieżki i błotniste odcinki tuż za Zębem. Idealna na pierwszą jazdę quadem.',
          distance: '8 km',
          duration: '1 godz.',
          imageUrl:
            'https://images.unsplash.com/photo-1515007507252-fc11563a273e?fm=jpg&q=80&w=1200&auto=format&fit=crop',
          sortOrder: 1,
        },
        {
          title: 'Szlak Górski',
          difficulty: 'Średnia',
          routeNum: 'TRASA 02',
          description: 'Wyraźne podjazdy i widoki na Tatry — dla tych, którzy chcą poczuć teren pod kołami.',
          distance: '14 km',
          duration: '2 godz.',
          imageUrl:
            'https://images.unsplash.com/photo-1654274860285-a3aeec2e594b?fm=jpg&q=80&w=1200&auto=format&fit=crop',
          sortOrder: 2,
        },
        {
          title: 'Trasa Panoramiczna',
          difficulty: 'Panoramiczna',
          routeNum: 'TRASA 03',
          description: 'Najlepsza o zachodzie słońca — grzbiety, polany i widok na całe Podhale.',
          distance: '18 km',
          duration: '2,5 godz.',
          imageUrl:
            'https://images.unsplash.com/photo-1489731300081-a03b0ce82303?fm=jpg&q=80&w=1200&auto=format&fit=crop',
          sortOrder: 3,
        },
      ]
      for (const doc of routes) {
        await payload.create({ collection: 'tour-routes', data: { ...doc, active: true } as any, locale: 'pl' })
      }
    }

    if (await collectionEmpty(payload, 'process-steps')) {
      const steps = [
        {
          stepNum: '01',
          title: 'Rezerwacja',
          description: 'Dzwonisz lub wysyłasz zapytanie. Ustalamy termin, pakiet i liczbę osób.',
          iconName: 'phone',
          sortOrder: 1,
        },
        {
          stepNum: '02',
          title: 'Briefing',
          description: 'Na miejscu dostajesz kask i ochraniacze. Instruktor pokazuje obsługę quada.',
          iconName: 'shield',
          sortOrder: 2,
        },
        {
          stepNum: '03',
          title: 'Wyprawa',
          description: 'Jedziemy w grupie, w tempie dopasowanym do uczestników. Przewodnik pilnuje trasy.',
          iconName: 'map',
          sortOrder: 3,
        },
        {
          stepNum: '04',
          title: 'Pamiątki',
          description: 'Wracamy do bazy, robimy zdjęcia i podsumowujemy wyprawę przy kawie.',
          iconName: 'camera',
          sortOrder: 4,
        },
      ]
      for (const doc of steps) {
        await payload.create({ collection: 'process-steps', data: { ...doc, active: true } as any, locale: 'pl' })
      }
    }

    if (await collectionEmpty(payload, 'reviews')) {
      const reviews = [
        {
          author: 'Michał K.',
          location: 'Kraków · Sierpień 2026',
          rating: 5,
          content:
            'Super przygoda. Wypożyczyłem quada pierwszy raz i było świetnie — maszyny w świetnym stanie, obsługa miła i profesjonalna. Na pewno wrócę.',
          sortOrder: 1,
        },
        {
          author: 'Kasia W.',
          location: 'Warszawa · Lipiec 2026',
          rating: 5,
          content:
            'Mega zabawa z ekipą. Trasy różnorodne, quady mocne, a wszystko dobrze zorganizowane od pierwszego telefonu. Polecam każdemu.',
          sortOrder: 2,
        },
        {
          author: 'Tomasz P.',
          location: 'Gdańsk · Czerwiec 2026',
          rating: 5,
          content:
            'Wszystko na plus — sprzęt zadbany, obsługa konkretna i pomocna. Świetny sposób, żeby zobaczyć Podhale z innej strony.',
          sortOrder: 3,
        },
      ]
      for (const doc of reviews) {
        await payload.create({ collection: 'reviews', data: { ...doc, active: true } as any, locale: 'pl' })
      }
    }

    if (await collectionEmpty(payload, 'faq-items')) {
      const faqs = [
        {
          question: 'Ile lat trzeba mieć, żeby jechać?',
          answer:
            'Kierowcą quada może być osoba pełnoletnia z ważnym prawem jazdy kat. B. Pasażerem może zostać każdy — dla dzieci wymagana jest zgoda i obecność opiekuna.',
          sortOrder: 1,
        },
        {
          question: 'Czy trzeba mieć doświadczenie?',
          answer:
            'Nie. Każda wyprawa zaczyna się od briefingu bezpieczeństwa i krótkiego treningu na placu — jedziesz w tempie, w którym czujesz się pewnie.',
          sortOrder: 2,
        },
        {
          question: 'Co jest wliczone w cenę?',
          answer:
            'Kask, ochraniacze, paliwo, ubezpieczenie NNW oraz opieka doświadczonego przewodnika przez całą trasę. Wystarczy przyjechać w wygodnym, zakrytym obuwiu.',
          sortOrder: 3,
        },
        {
          question: 'Co jeśli pada deszcz?',
          answer:
            'Jeździmy w każdych warunkach poza sytuacjami zagrażającymi bezpieczeństwu — deszcz i błoto to część przygody. W razie odwołania z naszej strony proponujemy inny termin lub zwrot.',
          sortOrder: 4,
        },
        {
          question: 'Jak wygląda płatność?',
          answer:
            'Online wpłacasz zaliczkę (BLIK / przelew). Resztę płacisz na miejscu gotówką lub kartą. Na życzenie wystawiamy fakturę VAT.',
          sortOrder: 5,
        },
        {
          question: 'Ile osób może jechać jednocześnie?',
          answer:
            'Standardowo prowadzimy grupy do 4 quadów jednocześnie. Dla grup firmowych dopasowujemy termin i dodatkowych przewodników.',
          sortOrder: 6,
        },
        {
          question: 'Co zabrać ze sobą?',
          answer:
            'Zakryte obuwie sportowe lub trekkingowe, wygodne ubranie odpowiednie do pogody, ewentualnie zapasową koszulkę. Resztę mamy na miejscu.',
          sortOrder: 7,
        },
      ]
      for (const doc of faqs) {
        await payload.create({ collection: 'faq-items', data: { ...doc, active: true } as any, locale: 'pl' })
      }
    }

    if (await collectionEmpty(payload, 'gallery-items')) {
      const gallery = [
        {
          caption: 'Trasa górska · Podhale',
          layout: '2x2',
          imageUrl:
            'https://images.unsplash.com/photo-1654274860285-a3aeec2e594b?fm=jpg&q=80&w=1600&auto=format&fit=crop',
          sortOrder: 1,
        },
        {
          caption: 'Leśny odcinek',
          layout: '1x1',
          imageUrl:
            'https://images.unsplash.com/photo-1701602078164-89eaa64496db?fm=jpg&q=80&w=800&auto=format&fit=crop',
          sortOrder: 2,
        },
        {
          caption: 'Start wyprawy',
          layout: '1x1',
          imageUrl:
            'https://images.unsplash.com/photo-1515007507252-fc11563a273e?fm=jpg&q=80&w=800&auto=format&fit=crop',
          sortOrder: 3,
        },
        {
          caption: 'Tatry z góry',
          layout: '1x2',
          imageUrl:
            'https://images.unsplash.com/photo-1698154050417-8a472a92ac78?fm=jpg&q=80&w=800&auto=format&fit=crop',
          sortOrder: 4,
        },
        {
          caption: 'Akcja',
          layout: '1x1',
          imageUrl:
            'https://images.unsplash.com/photo-1489731300081-a03b0ce82303?fm=jpg&q=80&w=800&auto=format&fit=crop',
          sortOrder: 5,
        },
        {
          caption: 'Duo Ride',
          layout: '2x1',
          imageUrl:
            'https://images.unsplash.com/photo-1496521061024-90e1c1221555?fm=jpg&q=80&w=1400&auto=format&fit=crop',
          sortOrder: 6,
        },
        {
          caption: 'Can-Am 2025',
          layout: '1x1',
          imageUrl:
            'https://images.unsplash.com/photo-1678554834127-71311e4a8024?fm=jpg&q=80&w=800&auto=format&fit=crop',
          sortOrder: 7,
        },
        {
          caption: 'Grupa na trasie',
          layout: '3x1',
          imageUrl:
            'https://images.unsplash.com/photo-1575677155757-b5eb75df3a4e?fm=jpg&q=80&w=1600&auto=format&fit=crop',
          sortOrder: 8,
        },
      ]
      for (const doc of gallery) {
        await payload.create({ collection: 'gallery-items', data: { ...doc, active: true } as any, locale: 'pl' })
      }
    }

    await ensureNewsPosts(payload)

    const home = await payload.findGlobal({ slug: 'home-page', locale: 'pl' })
    if (!(home as any)?.hero?.headline) {
      await payload.updateGlobal({
        slug: 'home-page',
        locale: 'pl',
        data: {
          seo: {
            title: 'Tatra Off-Road — Wyprawy quadami po Podhalu',
            description:
              'Wyprawy quadowe Can-Am w okolicach Zębu i Nowego Targu. Rezerwacja online, żywy kalendarz, zaliczka BLIK.',
          },
        hero: {
          mediaType: 'image',
          headline: 'Najlepsza',
          highlightWord: 'przygoda',
          subheadline: 'w terenie',
          lead: 'Wyprawy quadami Can-Am przez lasy i szlaki Podhala. Legalne trasy, doświadczeni przewodnicy, sprzęt 2025.',
          primaryCtaLabel: 'Zarezerwuj online',
          secondaryCtaLabel: 'Zobacz ceny',
          badges: [
            { label: 'Can-Am 2025' },
            { label: 'Ocena 4.9/5' },
            { label: 'Legalne trasy' },
            { label: 'Doświadczeni przewodnicy' },
          ],
          stats: [
            { value: '8+', label: 'Lat na trasie' },
            { value: '1200+', label: 'Wypraw' },
            { value: '100%', label: 'Legalnych szlaków' },
          ],
          bgImageUrl: DEFAULT_BG,
          bookingPanel: {
            eyebrow: 'Szybka Rezerwacja',
            title: 'Start w 4 krokach',
            steps: [
              { iconName: 'clock', text: 'Wybierz wyprawę 1h lub 2h' },
              { iconName: 'users', text: 'Podaj liczbę quadow i pasażerów' },
              { iconName: 'map', text: 'Weź wolny termin z kalendarza' },
              { iconName: 'shield', text: 'Opłać zaliczkę BLIK / przelew' },
            ],
            buttonLabel: 'Sprawdź dostępność',
            finePrint: 'Zaliczka online · reszta na miejscu · potwierdzenie od razu',
          },
        },
        marqueePhrases: [
          { text: 'Can-Am Outlander 2025' },
          { text: 'Podhale & Tatry' },
          { text: 'Trasy leśne' },
          { text: 'Trasy górskie' },
          { text: 'Kask w cenie' },
          { text: 'Doświadczeni przewodnicy' },
        ],
        ctaBanner: {
          eyebrow: 'Gotowy?',
          titleLine1: 'Twoja trasa czeka',
          titleHighlight: 'tuż za rogiem',
          description:
            'Ostatnie wolne terminy w tym miesiącu. Zadzwoń lub zarezerwuj online — potwierdzenie w 30 minut.',
          bgImageUrl: DEFAULT_BG,
        },
      } as any,
      })
    }

    const site = await payload.findGlobal({ slug: 'site-settings', locale: 'pl' })
    if (!(site as any)?.email) {
      await payload.updateGlobal({
        slug: 'site-settings',
        locale: 'pl',
        data: {
          address: 'Ul. Świętej Anny 39, 34-521 Ząb',
          phones: [{ number: '+48 888 254 223' }, { number: '+48 530 198 735' }],
          email: 'tatraoffroad@gmail.com',
          whatsapp: '+48 888 254 223',
          hours: 'Wyprawy codziennie, 8:00–20:00, po rezerwacji',
        } as any,
      })
    }

    const flota = await payload.findGlobal({ slug: 'flota-page', locale: 'pl' })
    if (!(flota as any)?.header?.title) {
      await payload.updateGlobal({
        slug: 'flota-page',
        locale: 'pl',
        data: {
          seo: {
            title: 'Flota Quadów Can-Am 2025 | Tatra Off-Road',
            description: 'Zobacz naszą flotę Can-Am Outlander 2025 na Podhalu.',
          },
          header: {
            title: 'Flota Quadów Can-Am 2025',
            description:
              'Najnowszy sprzęt off-road w sercu Podhala. Maszyny Can-Am Outlander to gwarancja niezawodności, mocy oraz maksymalnego komfortu.',
          },
          equipment: {
            eyebrow: 'Wyposażenie i Bezpieczeństwo',
            title: 'Standard premium\nw cenie wyprawy',
            description:
              'Każdy uczestnik wyprawy otrzymuje kompletny pakiet ochronny najwyższej klasy.',
            items: [
              {
                title: 'Atestowane Kaski',
                description: 'Atestowane kaski ECE 22.06 z goglami przeciwpyłowymi.',
                iconName: 'shield',
              },
              {
                title: 'Ochraniacze i Rękawice',
                description: 'Ergonomiczne ochraniacze oraz antypoślizgowe rękawice off-road.',
                iconName: 'sparkles',
              },
              {
                title: 'Paliwo w cenie',
                description: 'Maszyny podstawiamy zatankowane — zero dopłat na stacji.',
                iconName: 'fuel',
              },
              {
                title: 'Serwis i homologacja',
                description: 'Regularny serwis i pełna homologacja każdego quada.',
                iconName: 'wrench',
              },
            ],
          },
          cta: {
            title: 'Gotowy na jazdę?',
            description: 'Wybierz termin i zarezerwuj quada online.',
            buttonLabel: 'Zarezerwuj',
          },
        } as any,
      })
    }

    const trasy = await payload.findGlobal({ slug: 'trasy-page', locale: 'pl' })
    if (!(trasy as any)?.header?.title) {
      await payload.updateGlobal({
        slug: 'trasy-page',
        locale: 'pl',
        data: {
          seo: {
            title: 'Trasy quadowe Podhale | Tatra Off-Road',
            description: 'Legalne trasy leśne i górskie w okolicach Zębu.',
          },
          header: {
            title: 'Nasze trasy',
            description: 'Od łatwych leśnych pętli po panoramiczne grzbiety z widokiem na Tatry.',
          },
        } as any,
      })
    }

    const cennik = await payload.findGlobal({ slug: 'cennik-page', locale: 'pl' })
    if (!(cennik as any)?.header?.title) {
      await payload.updateGlobal({
        slug: 'cennik-page',
        locale: 'pl',
        data: {
          seo: {
            title: 'Cennik wypraw quadowych | Tatra Off-Road',
            description: 'Aktualne ceny wypraw Can-Am — zaliczka online, reszta na miejscu.',
          },
          header: {
            title: 'Cennik',
            description: 'Ceny za quada. Zaliczka online, reszta płatna na miejscu.',
          },
        } as any,
      })
    }

    const about = await payload.findGlobal({ slug: 'about-page', locale: 'pl' })
    if (!(about as any)?.header?.title) {
      await payload.updateGlobal({
        slug: 'about-page',
        locale: 'pl',
        data: {
          seo: {
            title: 'O nas | Tatra Off-Road',
            description: 'Kim jesteśmy i jak prowadzimy wyprawy quadowe na Podhalu.',
          },
          header: {
            title: 'O nas',
            description: 'Lokalna ekipa, legalne trasy i Can-Am 2025.',
          },
        } as any,
      })
    }

    const contact = await payload.findGlobal({ slug: 'contact-page', locale: 'pl' })
    if (!(contact as any)?.header?.title) {
      await payload.updateGlobal({
        slug: 'contact-page',
        locale: 'pl',
        data: {
          seo: {
            title: 'Kontakt | Tatra Off-Road',
            description: 'Zadzwoń lub napisz — Ząb, Podhale.',
          },
          header: {
            title: 'Kontakt',
            description: 'Jesteśmy dostępni codziennie po rezerwacji.',
          },
        } as any,
      })
    }

    payload.logger.info('Site content seed completed (PL defaults).')
  } catch (error) {
    payload.logger.error({ err: error }, 'Site content seed failed')
  }
}

export async function seedFirstAdmin(payload: Payload) {
  const adminEmail = (process.env.PAYLOAD_ADMIN_EMAIL || process.env.ADMIN_EMAIL || '').trim()
  const adminPassword = process.env.PAYLOAD_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || ''

  if (!adminEmail || !adminPassword) {
    payload.logger.warn(
      'PAYLOAD_ADMIN_EMAIL / PAYLOAD_ADMIN_PASSWORD not set — admin will not be created from env',
    )
    return
  }

  try {
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: adminEmail } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.totalDocs > 0) {
      payload.logger.info(`Admin already exists: ${adminEmail}`)
      return
    }

    await payload.create({
      collection: 'users',
      data: {
        email: adminEmail,
        password: adminPassword,
        name: 'Admin',
      } as any,
      overrideAccess: true,
    })
    payload.logger.info(`Created admin from env: ${adminEmail}`)
  } catch (error) {
    payload.logger.error({ err: error }, `Failed to create admin ${adminEmail}`)
  }
}
