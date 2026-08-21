export type BookingUiCopy = {
  steps: { trip: string; party: string; schedule: string; details: string }
  onlineEyebrow: string
  title: string
  lead: string
  depositNow: string
  ofTotal: string
  chooseTrip: string
  upToQuads: string
  fromPerPerson: string
  howMany: string
  howManyHint: string
  drivers: string
  passengers: string
  chooseDate: string
  scheduleHint: string
  date: string
  startTime: string
  pickDateFirst: string
  checking: string
  noTimes: string
  freeQuads: string
  detailsTitle: string
  detailsHint: string
  tripLabel: string
  dateLabel: string
  peopleLabel: string
  firstName: string
  lastName: string
  phone: string
  back: string
  next: string
  toPaymentShort: string
  toPayment: string
  summary: string
  pickTrip: string
  duration: string
  quadsPassengers: string
  total: string
  onSite: string
  paySafe: string
  gearIncluded: string
  startPlace: string
  worthKnowing: string
  loadTripsError: string
  loadTimesError: string
  noTimesDay: string
  needSchedule: string
  needDetails: string
  reserveError: string
  connectionError: string
  faq: { q: string; a: string }[]
  checkout: {
    cancelled: string
    loadError: string
    payFail: string
    noUrl: string
    connection: string
    trip: string
    firstName: string
    lastName: string
    email: string
    emailHint: string
    method: string
    blik: string
    blikDesc: string
    transfer: string
    transferDesc: string
    testEnv: string
    phone: string
    afterPay: string
    confirmed: string
    seeConfirm: string
    holdExpired: string
    newDate: string
    payDeposit: string
    stepBooking: string
    stepPay: string
    stepDone: string
    depositLabel: string
    depositNow: string
    remainingLabel: string
    bookingHash: string
    accepted: string
    notFound: string
    driversPassengers: string
    backToBooking: string
    restOnSite: string
    holdExpiredLong: string
    fullPrice: string
    payDepositAmount: string
    changeDate: string
    arriveEarly: string
    cancelRule: string
  }
  thanks: {
    waiting: string
    waitingHint: string
    confirmed: string
    paidHint: string
    paidHintEmail: string
    bookingNo: string
    trip: string
    when: string
    people: string
    customer: string
    payment: string
    depositPaid: string
    remaining: string
    fullPrice: string
    home: string
    nextTitle: string
    next1: string
    next2: string
    next3: string
    next4: string
    next5: string
    syncError: string
    syncFail: string
    paymentFailed: string
    paymentFailedHint: string
    backToCheckout: string
  }
}

export const BOOKING_UI_PL: BookingUiCopy = {
  steps: { trip: 'Wyprawa', party: 'Uczestnicy', schedule: 'Termin', details: 'Dane' },
  onlineEyebrow: 'Rezerwacja online',
  title: 'Zarezerwuj wyprawę',
  lead: '4 krótkie kroki. Zaliczkę opłacisz bezpiecznie online — resztę na miejscu.',
  depositNow: 'Zaliczka teraz',
  ofTotal: 'z',
  chooseTrip: 'Wybierz wyprawę',
  upToQuads: 'do 4 quadow',
  fromPerPerson: 'od / 1 os.',
  howMany: 'Ilu jedziecie?',
  howManyHint: '1 kierowca = 1 quad. Pasażer jedzie z tyłu (cena 2 os. na quadzie).',
  drivers: 'Kierowcy (quady)',
  passengers: 'Pasażerowie',
  chooseDate: 'Wybierz termin',
  scheduleHint: 'Godziny uwzględniają zajętość z Google Calendar i wolne quady.',
  date: 'Data',
  startTime: 'Godzina startu',
  pickDateFirst: 'Najpierw wybierz datę — pokażemy wolne godziny.',
  checking: 'Sprawdzamy dostępność…',
  noTimes: 'Brak wolnych godzin tego dnia. Wybierz inną datę albo zmniejsz liczbę quadow.',
  freeQuads: 'wolne',
  detailsTitle: 'Dane rezerwującego',
  detailsHint: 'Potwierdzenie i kontakt w sprawie wyprawy.',
  tripLabel: 'Wyprawa',
  dateLabel: 'Termin',
  peopleLabel: 'Uczestnicy',
  firstName: 'Imię',
  lastName: 'Nazwisko',
  phone: 'Telefon',
  back: 'Wstecz',
  next: 'Dalej',
  toPaymentShort: 'Do płatności',
  toPayment: 'Przejdź do płatności',
  summary: 'Podsumowanie',
  pickTrip: 'Wybierz wyprawę',
  duration: 'Czas',
  quadsPassengers: 'Quady / pasażerowie',
  total: 'Razem',
  onSite: 'Na miejscu',
  paySafe: 'Bezpieczna płatność CashBill (BLIK / przelew)',
  gearIncluded: 'Kask, briefing i przewodnik w cenie',
  startPlace: 'Start: okolice Nowego Targu / Podhale',
  worthKnowing: 'Warto wiedzieć',
  loadTripsError: 'Nie udało się załadować wypraw.',
  loadTimesError: 'Nie udało się pobrać dostępnych godzin.',
  noTimesDay: 'Brak wolnych godzin na ten dzień przy wybranej liczbie quadow.',
  needSchedule: 'Wybierz datę i dostępną godzinę.',
  needDetails: 'Uzupełnij imię, nazwisko i telefon.',
  reserveError: 'Nie udało się zarezerwować.',
  connectionError: 'Błąd połączenia. Spróbuj ponownie.',
  faq: [
    {
      q: 'Nie ma wolnego terminu online?',
      a: 'Zadzwoń — często jesteśmy na miejscu i znajdziemy wcześniejszy start albo zwolnione miejsce, nawet jeśli online nic nie widać.',
    },
    {
      q: 'Co obejmuje cena?',
      a: 'Quad, paliwo, kask, briefing i opiekę przewodnika na trasie.',
    },
    {
      q: 'Jak działa zaliczka?',
      a: 'Online płacisz tylko zaliczkę (BLIK/przelew). Resztę dopłacasz na miejscu przed startem.',
    },
    {
      q: 'Anulowanie',
      a: 'Zmiana terminu lub anulacja minimum 24h przed startem — oddzwonimy i pomożemy.',
    },
    {
      q: 'Wymagania',
      a: 'Prawo jazdy kat. B dla kierowcy. Pasażer od 10 lat (z opiekunem). Sportowe obuwie.',
    },
  ],
  checkout: {
    cancelled: 'Płatność została anulowana. Możesz spróbować ponownie.',
    loadError: 'Nie udało się pobrać rezerwacji.',
    payFail: 'Płatność nieudana.',
    noUrl: 'CashBill nie zwrócił adresu płatności.',
    connection: 'Błąd połączenia.',
    trip: 'Wyprawa',
    firstName: 'Imię',
    lastName: 'Nazwisko',
    email: 'E-mail',
    emailHint: 'Na ten adres wyślemy potwierdzenie rezerwacji.',
    method: 'Metoda płatności',
    blik: 'BLIK',
    blikDesc: 'Szybka płatność kodem BLIK',
    transfer: 'Przelew bankowy',
    transferDesc: 'Płatność przelewem / szybkim przelewem',
    testEnv: ' (środowisko testowe)',
    phone: 'Telefon',
    afterPay: 'Po płatności dostaniesz potwierdzenie',
    confirmed: 'Rezerwacja potwierdzona',
    seeConfirm: 'Zobacz potwierdzenie →',
    holdExpired: 'Czas na płatność minął',
    newDate: 'Wybierz nowy termin',
    payDeposit: 'Opłać zaliczkę',
    stepBooking: '1. Rezerwacja',
    stepPay: '2. Płatność',
    stepDone: '3. Potwierdzenie',
    depositLabel: 'Zaliczka',
    depositNow: 'Zaliczka teraz',
    remainingLabel: 'Do zapłaty na miejscu',
    bookingHash: 'Rezerwacja #{id}',
    accepted: 'Zaliczka przyjęta. Numer #{id}.',
    notFound: 'Nie znaleziono rezerwacji.',
    driversPassengers: '{drivers} kier. / {passengers} pas.',
    backToBooking: 'Wróć do rezerwacji',
    restOnSite: 'Resztę ({amount} zł) zapłacisz na miejscu przed startem.',
    holdExpiredLong: 'Czas na płatność minął — zarezerwuj termin ponownie.',
    fullPrice: 'Cena pełna',
    payDepositAmount: 'Zapłać zaliczkę {amount} zł',
    changeDate: 'Zmień termin',
    arriveEarly: 'Przyjedź 10–15 min przed startem',
    cancelRule: 'Anulacja / zmiana: min. 24h wcześniej',
  },
  thanks: {
    waiting: 'Czekamy na potwierdzenie',
    waitingHint:
      'Płatność mogła jeszcze nie dojść do CashBill. Odśwież za chwilę albo zadzwoń — potwierdzimy ręcznie.',
    confirmed: 'Rezerwacja potwierdzona',
    paidHint: 'Zaliczka została opłacona. Na miejscu zapłacisz resztę przed startem wyprawy.',
    paidHintEmail: 'Zaliczka została opłacona — potwierdzenie wysłaliśmy na {email}. Na miejscu zapłacisz resztę przed startem wyprawy.',
    bookingNo: 'Numer rezerwacji',
    trip: 'Wyprawa',
    when: 'Termin',
    people: 'Uczestnicy',
    customer: 'Klient',
    payment: 'Płatność',
    depositPaid: 'Zaliczka opłacona',
    remaining: 'Reszta na miejscu',
    fullPrice: 'Cena pełna',
    home: 'Strona główna',
    nextTitle: 'Co dalej?',
    next1: 'Zapisz numer rezerwacji #{id}.',
    next2: 'Bądź 15 minut wcześniej na miejscu.',
    next3: 'Kierowca musi mieć prawo jazdy kat. B.',
    next4: 'Na miejscu dopłacisz {amount} zł i dostaniesz briefing.',
    next5: 'Zmiana / anulacja: zadzwoń min. 24h wcześniej.',
    syncError: 'Nie udało się potwierdzić płatności.',
    syncFail: 'Błąd połączenia podczas potwierdzania płatności.',
    paymentFailed: 'Płatność nieudana',
    paymentFailedHint: 'Transakcja nie została zakończona. Możesz wrócić do kasy i spróbować ponownie.',
    backToCheckout: 'Wróć do kasy',
  },
}

export const BOOKING_UI_EN: BookingUiCopy = {
  steps: { trip: 'Tour', party: 'Riders', schedule: 'Date', details: 'Details' },
  onlineEyebrow: 'Online booking',
  title: 'Book your tour',
  lead: '4 short steps. Pay the deposit securely online — the rest on site.',
  depositNow: 'Deposit now',
  ofTotal: 'of',
  chooseTrip: 'Choose a tour',
  upToQuads: 'up to 4 quads',
  fromPerPerson: 'from / 1 pers.',
  howMany: 'How many of you?',
  howManyHint: '1 driver = 1 quad. A passenger rides on the back (2-person price per quad).',
  drivers: 'Drivers (quads)',
  passengers: 'Passengers',
  chooseDate: 'Choose a date',
  scheduleHint: 'Times reflect Google Calendar availability and free quads.',
  date: 'Date',
  startTime: 'Start time',
  pickDateFirst: 'Pick a date first — we will show free times.',
  checking: 'Checking availability…',
  noTimes: 'No free times that day. Pick another date or fewer quads.',
  freeQuads: 'free',
  detailsTitle: 'Your details',
  detailsHint: 'Confirmation and contact for the tour.',
  tripLabel: 'Tour',
  dateLabel: 'Date',
  peopleLabel: 'Riders',
  firstName: 'First name',
  lastName: 'Last name',
  phone: 'Phone',
  back: 'Back',
  next: 'Next',
  toPaymentShort: 'To payment',
  toPayment: 'Continue to payment',
  summary: 'Summary',
  pickTrip: 'Choose a tour',
  duration: 'Duration',
  quadsPassengers: 'Quads / passengers',
  total: 'Total',
  onSite: 'On site',
  paySafe: 'Secure CashBill payment (BLIK / transfer)',
  gearIncluded: 'Helmet, briefing and guide included',
  startPlace: 'Start: near Nowy Targ / Podhale',
  worthKnowing: 'Good to know',
  loadTripsError: 'Could not load tours.',
  loadTimesError: 'Could not load available times.',
  noTimesDay: 'No free times that day for the selected number of quads.',
  needSchedule: 'Choose a date and an available time.',
  needDetails: 'Enter first name, last name and phone.',
  reserveError: 'Could not complete the reservation.',
  connectionError: 'Connection error. Please try again.',
  faq: [
    {
      q: 'Nothing free online?',
      a: 'Call us — we’re often on site and can check an earlier start or a newly freed spot, even if the calendar looks full.',
    },
    {
      q: 'What is included?',
      a: 'Quad, fuel, helmet, briefing and a guide on the trail.',
    },
    {
      q: 'How does the deposit work?',
      a: 'Online you pay only the deposit (BLIK/transfer). The rest is paid on site before the start.',
    },
    {
      q: 'Cancellation',
      a: 'Change or cancel at least 24 hours before the start — we’ll call back and help.',
    },
    {
      q: 'Requirements',
      a: 'Category B licence for the driver. Passenger from age 10 (with a guardian). Sports footwear.',
    },
  ],
  checkout: {
    cancelled: 'Payment was cancelled. You can try again.',
    loadError: 'Could not load the booking.',
    payFail: 'Payment failed.',
    noUrl: 'CashBill did not return a payment URL.',
    connection: 'Connection error.',
    trip: 'Tour',
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    emailHint: 'We’ll send the booking confirmation to this address.',
    method: 'Payment method',
    blik: 'BLIK',
    blikDesc: 'Fast payment with a BLIK code',
    transfer: 'Bank transfer',
    transferDesc: 'Pay by bank / instant transfer',
    testEnv: ' (test environment)',
    phone: 'Phone',
    afterPay: 'After payment you will get a confirmation',
    confirmed: 'Booking confirmed',
    seeConfirm: 'See confirmation →',
    holdExpired: 'Payment time expired',
    newDate: 'Choose a new date',
    payDeposit: 'Pay deposit',
    stepBooking: '1. Booking',
    stepPay: '2. Payment',
    stepDone: '3. Confirmation',
    depositLabel: 'Deposit',
    depositNow: 'Deposit now',
    remainingLabel: 'Pay on site',
    bookingHash: 'Booking #{id}',
    accepted: 'Deposit received. Number #{id}.',
    notFound: 'Booking not found.',
    driversPassengers: '{drivers} drv. / {passengers} pas.',
    backToBooking: 'Back to booking',
    restOnSite: 'You will pay the remaining {amount} zł on site before the start.',
    holdExpiredLong: 'Payment time expired — book a new slot.',
    fullPrice: 'Full price',
    payDepositAmount: 'Pay deposit {amount} zł',
    changeDate: 'Change date',
    arriveEarly: 'Arrive 10–15 min before the start',
    cancelRule: 'Cancel / change: at least 24h in advance',
  },
  thanks: {
    waiting: 'Waiting for confirmation',
    waitingHint:
      'Payment may not have reached CashBill yet. Refresh in a moment or call us — we’ll confirm manually.',
    confirmed: 'Booking confirmed',
    paidHint: 'The deposit is paid. You will settle the rest on site before the start.',
    paidHintEmail:
      'The deposit is paid — we sent confirmation to {email}. You will settle the rest on site before the start.',
    bookingNo: 'Booking number',
    trip: 'Tour',
    when: 'Date',
    people: 'Riders',
    customer: 'Customer',
    payment: 'Payment',
    depositPaid: 'Deposit paid',
    remaining: 'Remaining on site',
    fullPrice: 'Full price',
    home: 'Home',
    nextTitle: 'What’s next?',
    next1: 'Save booking number #{id}.',
    next2: 'Arrive 15 minutes early.',
    next3: 'The driver must hold a category B licence.',
    next4: 'On site you pay the remaining {amount} zł and get a briefing.',
    next5: 'Change / cancel: call at least 24h in advance.',
    syncError: 'Could not confirm the payment.',
    syncFail: 'Connection error while confirming payment.',
    paymentFailed: 'Payment failed',
    paymentFailedHint: 'The transaction was not completed. You can return to checkout and try again.',
    backToCheckout: 'Back to checkout',
  },
}

export function bookingUi(lang?: string): BookingUiCopy {
  return lang === 'en' ? BOOKING_UI_EN : BOOKING_UI_PL
}
