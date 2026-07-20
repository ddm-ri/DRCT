/* ================================================================
   DRCT — BASE PRODUCT RECREATION
   Vanilla JS, single-state app. No build step, no framework.
   1:1 recreation of the existing product from reference screenshots.
================================================================ */

(function () {
  'use strict';

  var TODAY = new Date('2026-07-20T00:00:00');

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function toISO(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function addDays(d, n) { var r = new Date(d); r.setDate(r.getDate() + n); return r; }
  function parseISO(s) { if (!s) return null; var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function formatDisplay(s) {
    if (!s) return '';
    var d = parseISO(s);
    if (!d || isNaN(d.getTime())) return s;
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    return d.getDate() + ' ' + months[d.getMonth()] + ', ' + days[d.getDay()];
  }
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtMoney(n) {
    var neg = n < 0; n = Math.abs(n);
    var parts = n.toFixed(2).split('.');
    var intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    var dec = parts[1] === '00' ? '' : '.' + parts[1];
    return (neg ? '-' : '') + intPart + dec;
  }
  function get(path, obj) { return path.split('.').reduce(function (o, k) { return (o == null) ? o : o[k]; }, obj); }
  function set(path, value, obj) {
    var parts = path.split('.');
    var last = parts.pop();
    var target = parts.reduce(function (o, k) { return o[k]; }, obj);
    target[last] = value;
  }

  /* ----------------------------------------------------------------
     DATA
  ---------------------------------------------------------------- */
  var AIRLINES = {
    airfrance: { name: 'Air France', code: 'AF', logo: 'assets/logos/air-france.svg' },
    lot:       { name: 'LOT', code: 'LO', logo: 'assets/logos/lot-polish-airlines.svg' },
    lufthansa: { name: 'Lufthansa', code: 'LH', logo: 'assets/logos/Lufthansa.svg' },
    klm:       { name: 'KLM', code: 'KL', logo: 'assets/logos/KLM.svg' }
  };

  var AIRPORTS = [
    { city: 'Warsaw', name: 'Chopin Airport', code: 'WAW' },
    { city: 'Warsaw', name: 'Modlin Airport', code: 'WMI' },
    { city: 'Paris', name: 'Charles de Gaulle Intl', code: 'CDG' },
    { city: 'Paris', name: 'Orly Airport', code: 'ORY' },
    { city: 'Paris', name: 'Beauvais Airport', code: 'BVA' },
    { city: 'Paris', name: 'Chalons Vatry airport', code: 'XCR' },
    { city: 'Paris', name: 'Le Bourget Airport', code: 'LBG' },
    { city: 'Paris', name: 'Pontoise-Cormeilles Aerodrome Airport', code: 'POX' },
    { city: 'London', name: 'Heathrow Airport', code: 'LHR' },
    { city: 'London', name: 'Gatwick Airport', code: 'LGW' },
    { city: 'London', name: 'Stansted Airport', code: 'STN' },
    { city: 'Amsterdam', name: 'Amsterdam Airport', code: 'AMS' },
    { city: 'Frankfurt', name: 'Frankfurt Airport', code: 'FRA' },
    { city: 'Zurich', name: 'Zurich Airport', code: 'ZRH' },
    { city: 'Vienna', name: 'Vienna Intl Airport', code: 'VIE' },
    { city: 'Madrid', name: 'Adolfo Suarez Madrid-Barajas', code: 'MAD' },
    { city: 'Rome', name: 'Leonardo da Vinci-Fiumicino', code: 'FCO' },
    { city: 'Barcelona', name: 'Josep Tarradellas Barcelona-El Prat', code: 'BCN' },
    { city: 'Warsaw', name: 'Wawa Airport', code: 'YXZ' },
    { city: 'Warsaw', name: 'Wawoi Falls Airport', code: 'WAJ' }
  ];

  function searchAirports(query) {
    var q = query.trim().toLowerCase();
    if (!q) return [];
    var order = [], byCity = {};
    AIRPORTS.forEach(function (a) {
      var cityMatch = a.city.toLowerCase().indexOf(q) !== -1;
      var airportMatch = a.name.toLowerCase().indexOf(q) !== -1 || a.code.toLowerCase().indexOf(q) !== -1;
      if (!cityMatch && !airportMatch) return;
      if (!byCity[a.city]) { byCity[a.city] = { city: a.city, cityMatch: false, airports: [] }; order.push(a.city); }
      if (cityMatch) byCity[a.city].cityMatch = true;
      byCity[a.city].airports.push(a);
    });
    return order.slice(0, 5).map(function (c) { return byCity[c]; });
  }

  function formatFieldDate(iso) {
    if (!iso) return '';
    var d = parseISO(iso);
    if (!d || isNaN(d.getTime())) return '';
    var months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
    var days = ['sun','mon','tue','wed','thu','fri','sat'];
    return d.getDate() + ' ' + months[d.getMonth()] + ', ' + days[d.getDay()];
  }
  function formatRowDate(iso, time) {
    if (!iso) return '';
    var d = parseISO(iso);
    if (!d || isNaN(d.getTime())) return '';
    var months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
    return d.getDate() + ' ' + months[d.getMonth()] + (time ? ' ' + time : '');
  }
  function cityByAirportName(name) {
    for (var i = 0; i < AIRPORTS.length; i++) if (AIRPORTS[i].name === name) return AIRPORTS[i].city;
    return name;
  }

  /* Search-results flights (regular, non-group). WAW -> CDG unless noted. */
  var FLIGHTS = [
    { id: 'f1', airlineId: 'airfrance', dep: '12:25', arr: '14:50', duration: '2h 25m', stops: 0, flightNo: 'AF 1147',
      fares: [{ key: 'basic', name: 'Basic', price: 3327 }, { key: 'standard', name: 'Standard', price: 3921 }] },
    { id: 'f2', airlineId: 'lot', dep: '07:20', arr: '09:50', duration: '2h 30m', stops: 0, flightNo: 'LO 281',
      fares: [{ key: 'esaver', name: 'Economy Saver', price: 2904 }, { key: 'estandard', name: 'Economy Standard', price: 3237 }] },
    { id: 'f3', airlineId: 'lot', dep: '16:25', arr: '18:50', duration: '2h 25m', stops: 0, flightNo: 'LO 285',
      fares: [{ key: 'esaver', name: 'Economy Saver', price: 2904 }, { key: 'estandard', name: 'Economy Standard', price: 3237 }] },
    { id: 'f4', airlineId: 'airfrance', dep: '16:30', arr: '19:00', duration: '2h 30m', stops: 0, flightNo: 'AF 1153',
      fares: [{ key: 'basic', name: 'Basic', price: 3327 }, { key: 'standard', name: 'Standard', price: 3921 }] },
    { id: 'f5', airlineId: 'lufthansa', dep: '09:40', arr: '13:45', duration: '4h 5m', stops: 1, connectionCode: 'FRA', layover: '1h 0m', flightNo: 'LH 1338 / LH 1054',
      fares: [{ key: 'elight', name: 'Economy Light', price: 4599 }, { key: 'ecomfort', name: 'Economy Comfort', price: 5050 }] },
    { id: 'f6', airlineId: 'airfrance', dep: '06:05', arr: '08:45', duration: '2h 40m', stops: 0, flightNo: 'AF 1141',
      fares: [{ key: 'basic', name: 'Basic', price: 3390 }, { key: 'standard', name: 'Standard', price: 3975 }] },
    { id: 'f7', airlineId: 'klm', dep: '16:25', arr: '18:50', duration: '2h 25m', stops: 0, flightNo: 'KL 1801',
      fares: [{ key: 'esaver', name: 'Economy Saver', price: 323 }, { key: 'estandard', name: 'Economy Standard', price: 360 }] },
    { id: 'klm-connect', airlineId: 'klm', toParis: true, connecting: true,
      duration: '5h 20m', flightNo: 'KL 1314 / KL 1409',
      segments: [
        { dep: '12:25', depName: 'Warsaw Chopin Airport', depCode: 'WAW', arr: '14:30', arrName: 'Amsterdam Airport', arrCode: 'AMS', flightNo: 'KL 1314', duration: '2h 5m' },
        { dep: '16:30', depName: 'Amsterdam Airport', depCode: 'AMS', arr: '17:45', arrName: 'Charles de Gaulle Intl', arrCode: 'CDG', flightNo: 'KL 1409', duration: '1h 15m' }
      ],
      connection: '2h 0m',
      fares: [{ key: 'light', name: 'Light', price: 201.15 }, { key: 'standard', name: 'Standard', price: 243.15 }],
      fareTiers: [
        { key: 'light', name: 'Light', code: 'EYQ6BALA', baggage: '0PC', changes: '?', refund: '?', price: 201.15 },
        { key: 'standard', name: 'Standard', code: null, baggage: '1PC', changes: '?', refund: '?', price: 243.15 },
        { key: 'flex', name: 'Flex', code: null, baggage: '1PC', changes: '?', refund: '?', price: 324.15 },
        { key: 'bizstandard', name: 'Business standard', code: null, baggage: '2 X 32KG', changes: '?', refund: '?', price: 686.65 },
        { key: 'bizflex', name: 'Business flex', code: null, baggage: '2 X 32KG', changes: '?', refund: '?', price: 790.65 }
      ]
    }
  ];

  function flightById(id) { for (var i = 0; i < FLIGHTS.length; i++) if (FLIGHTS[i].id === id) return FLIGHTS[i]; return null; }

  function genericFareTiers(flight) {
    var base = flight.fares[0].price;
    return [
      { key: 'light', name: 'Light', code: 'EYQ6BALA', baggage: '0PC', changes: '?', refund: '?', price: round2(base * 0.62) },
      { key: 'standard', name: 'Standard', code: null, baggage: '1PC', changes: '?', refund: '?', price: round2(base * 0.75) },
      { key: 'flex', name: 'Flex', code: null, baggage: '1PC', changes: '?', refund: '?', price: round2(base) },
      { key: 'bizstandard', name: 'Business standard', code: null, baggage: '2 X 32KG', changes: '?', refund: '?', price: round2(base * 2.1) },
      { key: 'bizflex', name: 'Business flex', code: null, baggage: '2 X 32KG', changes: '?', refund: '?', price: round2(base * 2.45) }
    ];
  }
  function round2(n) { return Math.round(n * 100) / 100; }

  function airportNameByCode(code) {
    for (var i = 0; i < AIRPORTS.length; i++) if (AIRPORTS[i].code === code) return AIRPORTS[i].name;
    return code;
  }

  /* Airlines offering group fares (Group Search Results roster) */
  var GROUP_AIRLINES = [
    { id: 'lot', name: 'LOT Polish Airlines', code: 'LO', logo: 'assets/logos/lot-polish-airlines.svg',
      dep: '07:20', arr: '09:50', duration: '2h 30m', stops: 0, connectionCode: null, layover: null, flightNo: 'LO 281' },
    { id: 'airfrance', name: 'Air France', code: 'AF', logo: 'assets/logos/air-france.svg',
      dep: '12:25', arr: '14:50', duration: '2h 25m', stops: 0, connectionCode: null, layover: null, flightNo: 'AF 1147' },
    { id: 'lufthansa', name: 'Lufthansa', code: 'LH', logo: 'assets/logos/Lufthansa.svg',
      dep: '06:35', arr: '11:55', duration: '4h 20m', stops: 1, connectionCode: 'FRA', layover: '1h 15m', flightNo: 'LH 1338 / LH 1054' },
    { id: 'klm', name: 'KLM', code: 'KL', logo: 'assets/logos/KLM.svg',
      dep: '09:10', arr: '14:35', duration: '4h 25m', stops: 1, connectionCode: 'AMS', layover: '2h 0m', flightNo: 'KL 1372 / KL 1233' },
    { id: 'swiss', name: 'SWISS', code: 'LX', logo: 'assets/logos/SWISS.svg',
      dep: '10:40', arr: '16:05', duration: '4h 25m', stops: 1, connectionCode: 'ZRH', layover: '1h 45m', flightNo: 'LX 1548 / LX 792' },
    { id: 'austrian', name: 'Austrian Airlines', code: 'OS', logo: 'assets/logos/austrian-airlines.svg',
      dep: '13:50', arr: '19:35', duration: '4h 45m', stops: 1, connectionCode: 'VIE', layover: '1h 30m', flightNo: 'OS 599 / OS 405' },
    { id: 'iberia', name: 'Iberia', code: 'IB', logo: 'assets/logos/Iberia.svg',
      dep: '15:20', arr: '21:15', duration: '4h 55m', stops: 1, connectionCode: 'MAD', layover: '2h 10m', flightNo: 'IB 5352 / IB 3402' }
  ];
  function groupAirlineById(id) { for (var i = 0; i < GROUP_AIRLINES.length; i++) if (GROUP_AIRLINES[i].id === id) return GROUP_AIRLINES[i]; return null; }

  var TRIP_REASONS = [
    { v: 'business', l: 'Business' }, { v: 'sports', l: 'Sports' }, { v: 'education', l: 'Education' },
    { v: 'leisure', l: 'Leisure' }, { v: 'event', l: 'Event' }, { v: 'other', l: 'Other' }
  ];
  var FLEX_OPTIONS = [
    { v: 'exact', l: 'Exact dates' }, { v: '1', l: '± 1 day' }, { v: '2', l: '± 2 days' }, { v: '3', l: '± 3 days' }
  ];
  var DECLINE_REASONS = [
    'Price is too high', 'Flight option is unsuitable', 'Conditions are unsuitable',
    'Decision deadline was missed', 'Client cancelled the trip', 'Another airline was selected', 'Other'
  ];

  function buildOfferData(airlineId, pax, createdAt) {
    var a = groupAirlineById(airlineId);
    var perPax = 260 + (a.stops === 0 ? 90 : 0) + (a.id.length * 7 % 60);
    var total = perPax * pax;
    var acceptBy = addDays(createdAt, 3);
    var depositBy = addDays(acceptBy, 5);
    var namesBy = (['lot', 'klm', 'austrian'].indexOf(airlineId) !== -1) ? addDays(acceptBy, 9) : null;
    return {
      perPax: perPax, total: total, currency: 'EUR',
      acceptBy: acceptBy, depositBy: depositBy, namesBy: namesBy,
      baggageIncluded: a.stops === 0 ? '1 checked bag (23 kg) per passenger' : 'Cabin bag only',
      baggageNote: 'Additional bags available for 45 EUR each per passenger, subject to airline confirmation.',
      conditions: {
        payment: '50% deposit required within 5 days of offer acceptance. Balance due 30 days before departure.',
        changes: 'Date changes allowed up to 14 days before departure for a 75 EUR fee per passenger.',
        cancellation: 'Non-refundable after deposit payment. Full refund if the airline cancels the group offer.',
        flexibility: 'Group size may be reduced by up to 10% without penalty until 21 days before departure.',
        other: 'Full passenger name list must be submitted by the passenger names deadline, if applicable.'
      }
    };
  }

  /* ----------------------------------------------------------------
     STATE
  ---------------------------------------------------------------- */
  var state = {
    page: 'search',
    searchTab: 'form',
    searchScreen: 'form',
    searchLoading: false,
    regular: { from: '', to: '', fromCode: '', toCode: '', departure: '', return: '', adults: 1, children: 0, infants: 0, paxOpen: false },
    resultsQuery: null,
    aiQuery: 'Economy with a stopover in Madrid',
    groupAiQuery: 'Morning departures on Lufthansa or Lot',
    resultsFilters: { type: 'all', sort: 'optimal', bag: 'without' },
    currentOffer: null,
    offerDraft: null,
    offerLoading: false,
    bookingsTab: 'booked',
    bookingsSelected: null,
    bookings: [],
    pillToast: null,
    toasts: [],
    openPopover: null,

    /* ---- group booking flow ---- */
    groupsScreen: 'form',
    group: { from: '', to: '', fromCode: '', toCode: '', departure: '', return: '', pax: 10, paxOpen: false },
    groupErrors: {},
    groupSubmitState: 'idle',
    groupResultsQuery: null,
    groupFilter: 'all',
    airlineFilterOpen: false,
    selectedAirlineIds: [],
    requestDraft: null,
    builderStep: 1,
    builderErrors: {},
    builderSubmitState: 'idle',
    groupRequests: [],
    requestCounter: 1048,
    currentGroupOffer: null,
    declineModal: null,
    acceptProcessing: false
  };
  window.__DRCT_STATE__ = state;

  /* seed one example group request so Bookings demonstrates independent per-airline statuses */
  (function seedGroup() {
    var created = addDays(TODAY, -2);
    var reviewOffer = buildOfferData('lufthansa', 16, created);
    var acceptedOffer = buildOfferData('swiss', 16, created);
    state.groupRequests.push({
      id: 'GR-1032', from: 'Warsaw Chopin Airport', fromCode: 'WAW', to: 'John F. Kennedy Intl', toCode: 'JFK',
      departure: '2026-08-20', ret: '2026-08-27', pax: 16, createdAt: created, dateFlexibility: '2', tripReason: 'sports',
      baggage: '16 sports bags, 23 kg each', comments: 'Team travelling together, prefer adjacent seating if possible.',
      offers: [
        Object.assign({ airlineId: 'lufthansa', status: 'review' }, reviewOffer),
        { airlineId: 'lot', status: 'calculating' },
        Object.assign({ airlineId: 'swiss', status: 'accepted', acceptedAt: addDays(created, 1) }, acceptedOffer)
      ]
    });
  })();

  /* seed a completed "in progress" booking so Bookings has content on load */
  (function seed() {
    state.bookings.push({
      id: 'BK-1', passengerName: 'KATE LEAN MRS', status: 'inprogress',
      departure: '2026-07-28', depTime: '12:25', fromCode: 'WAW', toCode: 'AMS',
      price: 201.15, currency: 'EUR', till: 'till 21 jul 06:58',
      city: 'Amsterdam', totalDuration: '2h 5m',
      segments: [{ dep: '12:25', depName: 'Warsaw Chopin Airport', depCode: 'WAW', arr: '14:30', arrName: 'Amsterdam Airport', arrCode: 'AMS', flightNo: 'KL 1314', duration: '2h 5m', date: '2026-07-28' }],
      fareTier: { name: 'Light', code: 'EYQ6BALA', baggage: '0PC', changes: '?', refund: '?' },
      passengerFullName: 'KATE LEAN', contactEmail: '', contactPhone: '',
      airlineId: 'klm'
    });
    state.bookings.push({
      id: 'BK-2', passengerName: 'ELON MUSK', status: 'inprogress',
      departure: '2026-07-29', depTime: '12:25', fromCode: 'WAW', toCode: 'AMS',
      price: 201.15, currency: 'EUR', till: 'till 21 jul 09:00',
      city: 'Paris', totalDuration: '5h 20m',
      segments: [
        { dep: '12:25', depName: 'Warsaw Chopin Airport', depCode: 'WAW', arr: '14:30', arrName: 'Amsterdam Airport', arrCode: 'AMS', flightNo: 'KL 1314', duration: '2h 5m', date: '2026-07-29' },
        { dep: '16:30', depName: 'Amsterdam Airport', depCode: 'AMS', arr: '17:45', arrName: 'Charles de Gaulle Intl', arrCode: 'CDG', flightNo: 'KL 1409', duration: '1h 15m', date: '2026-07-29' }
      ],
      connection: '2h 0m',
      fareTier: { name: 'Light', code: 'EYQ6BALA', baggage: '0PC', changes: '?', refund: '?' },
      passengerFullName: 'ELON MUSK', contactEmail: 'DDM@DRCT.AERO', contactPhone: '684526545',
      airlineId: 'klm'
    });
    state.bookingsSelected = { kind: 'regular', id: 'BK-2' };
  })();

  /* ----------------------------------------------------------------
     TOASTS
  ---------------------------------------------------------------- */
  var toastSeq = 1;
  function pushToast(opts) {
    var id = 'toast-' + (toastSeq++);
    var toast = { id: id, title: opts.title, text: opts.text || '', actionLabel: opts.actionLabel || null, onAction: opts.onAction || null, timer: null };
    state.toasts.push(toast);
    if (opts.autoDismiss !== false) {
      toast.timer = setTimeout(function () { removeToast(id); }, opts.duration || 2600);
    }
    renderToasts();
    return id;
  }
  function removeToast(id) {
    state.toasts = state.toasts.filter(function (t) { if (t.id === id && t.timer) clearTimeout(t.timer); return t.id !== id; });
    renderToasts();
  }
  function renderToasts() {
    var host = document.getElementById('toastStack');
    host.innerHTML = state.toasts.map(function (t) {
      return '<div class="toast" data-toast-id="' + t.id + '">' +
        '<div class="toast__body"><div class="toast__title">' + escapeHtml(t.title) + '</div>' +
        (t.text ? '<div class="toast__text">' + escapeHtml(t.text) + '</div>' : '') + '</div>' +
        (t.actionLabel ? '<button class="toast__action" data-action="toast-action" data-toast="' + t.id + '">' + escapeHtml(t.actionLabel) + '</button>' : '') +
        '<button class="toast__close" data-action="toast-close" data-toast="' + t.id + '" aria-label="Dismiss">&times;</button>' +
      '</div>';
    }).join('');
  }

  /* ----------------------------------------------------------------
     BACKGROUND OFFER TIMERS (Group Request calculating -> review)
  ---------------------------------------------------------------- */
  function scheduleTimers() {
    state.groupRequests.forEach(function (req) {
      req.offers.forEach(function (offer) {
        if (offer.status === 'calculating' && !offer._scheduled) {
          offer._scheduled = true;
          var delay = 5000 + Math.random() * 6000;
          setTimeout(function () {
            if (offer.status !== 'calculating') return;
            var data = buildOfferData(offer.airlineId, req.pax, new Date());
            Object.assign(offer, data, { status: 'review' });
            if (state.page === 'bookings' || (state.page === 'group-offer-details' && state.currentGroupOffer && state.currentGroupOffer.requestId === req.id)) render();
          }, delay);
        }
      });
    });
  }

  /* ----------------------------------------------------------------
     RENDER: ROOT
  ---------------------------------------------------------------- */
  function render() {
    renderHeader();
    var main = document.getElementById('main');
    if (state.searchLoading) {
      main.innerHTML = '';
      main.appendChild(simpleLoadingEl());
    } else if (state.page === 'search') {
      main.innerHTML = renderSearchPage();
    } else if (state.page === 'offer-details') {
      main.innerHTML = renderOfferDetails();
    } else if (state.page === 'bookings') {
      main.innerHTML = renderBookings();
    } else if (state.page === 'request-builder') {
      main.innerHTML = renderRequestBuilder();
    } else if (state.page === 'group-offer-details') {
      main.innerHTML = renderGroupOfferDetails();
    }
    renderStickyBar();
    renderStickyOfferActions();
    renderDeclineModal();
    renderToasts();
    scheduleTimers();
    if (state.openPopover && state.openPopover.type === 'airport') {
      var afInput = document.querySelector('[data-airport-input][data-field="' + state.openPopover.field + '"]');
      if (afInput) { afInput.focus(); var v = afInput.value; afInput.setSelectionRange(v.length, v.length); }
    }
  }

  function simpleLoadingEl() {
    var el = document.createElement('div');
    el.className = 'simple-loading-overlay';
    el.innerHTML = '<div class="loader-dots"><span></span><span></span><span></span></div>';
    return el;
  }

  function renderHeader() {
    var isSearchArea = (state.page === 'search' || state.page === 'offer-details' || state.page === 'request-builder');
    var isBookingsArea = (state.page === 'bookings' || state.page === 'group-offer-details');
    document.getElementById('navSearch').className = 'app-header__link' + (isSearchArea ? ' active' : '');
    document.getElementById('navBookings').className = 'app-header__link' + (isBookingsArea ? ' active' : '');
  }

  /* ----------------------------------------------------------------
     RENDER: SEARCH PAGE
  ---------------------------------------------------------------- */
  function renderSearchPage() {
    var tabs = ['copilot', 'form', 'groups', 'terminal'];
    var labels = { copilot: 'Copilot', form: 'Form', groups: 'Groups', terminal: 'Terminal' };
    var tabsHtml = tabs.map(function (t) {
      return '<div class="local-tabs__tab' + (state.searchTab === t ? ' active' : '') + '" data-action="set-tab" data-tab="' + t + '">' + labels[t] + '</div>';
    }).join('');

    var title = 'Search', desc = 'Look for, book and issue tickets to any destination in the world.';
    if (state.searchTab === 'groups') {
      title = 'Group search';
      desc = 'Search flight options for groups of 10 or more passengers and request group fares from selected airlines.';
    }

    var body;
    if (state.searchTab === 'groups') {
      body = (state.groupsScreen === 'results') ? renderGroupResults() : renderGroupForm();
    } else if (state.searchTab !== 'form') {
      body = '<div class="empty-note" style="padding-top:60px">This section is not part of this recreation.<br>Use the <strong>FORM</strong> tab to continue.</div>';
    } else if (state.searchScreen === 'results') {
      body = renderResults();
    } else {
      body = renderRegularForm();
    }

    return '' +
      '<div class="page-head">' +
        '<div class="page-head__top">' +
          '<div><h1>' + title + '</h1><p class="page-head__desc">' + desc + '</p></div>' +
          '<div class="local-tabs">' + tabsHtml + '</div>' +
        '</div>' +
      '</div>' +
      body;
  }

  function paxSummaryLabel(r) {
    var total = r.adults + r.children + r.infants;
    return total + (total === 1 ? ' passenger' : ' passengers');
  }

  function renderRegularForm() {
    var r = state.regular;
    return '' +
      '<div class="search-bar">' +
        renderAirportField('regular.from', 'From', ' search-field--from') +
        '<div class="search-field--swap" data-action="swap-regular" title="Swap origin and destination">' + swapIcon() + '</div>' +
        renderAirportField('regular.to', 'To', ' search-field--to') +
        renderCalendarField('regular.departure', 'Departure', toISO(TODAY), false) +
        renderCalendarField('regular.return', 'Return', r.departure || toISO(TODAY), true) +
        '<div class="search-field search-field--pax' + (r.paxOpen ? ' is-active' : '') + '" data-action="toggle-pax-regular">' +
          '<label>Passengers</label><div class="search-field__pax-value">' + paxSummaryLabel(r) + '</div>' +
          (r.paxOpen ? renderRegularPaxPop() : '') +
        '</div>' +
        '<button class="btn btn-primary search-bar__submit" data-action="regular-search-submit">Search</button>' +
      '</div>' +
      '<div class="search-multicity">Search multi-city</div>';
  }

  function renderRegularPaxPop() {
    var r = state.regular;
    var atMax = r.adults >= 9;
    return '<div class="pax-pop" data-action="noop">' +
      paxRow('Adults', 'Over 12 years old', 'adults', r.adults, 1, 9) +
      paxRow('Children', 'From 2 to 12 years', 'children', r.children, 0, 8) +
      paxRow('Infants', 'Up to 2 years, no seat', 'infants', r.infants, 0, 8) +
      (atMax ? '<div class="group-cta-inline">' +
        '<div class="group-cta-inline__title">Looking for group rates?</div>' +
        '<div class="group-cta-inline__text">Request fares for 10 or more passengers.</div>' +
        '<button class="btn btn-tertiary btn-sm" style="padding-left:0;padding-right:0" data-action="try-group-fares">Try group fares</button>' +
      '</div>' : '') +
    '</div>';
  }

  function paxRow(label, sub, key, val, min, max) {
    return '<div class="pax-row">' +
      '<div><div class="pax-row__label">' + label + '</div><div class="pax-row__sub">' + sub + '</div></div>' +
      '<div class="stepper">' +
        '<button class="stepper__btn" data-action="pax-step" data-key="' + key + '" data-dir="-1" data-min="' + min + '" data-max="' + max + '">&minus;</button>' +
        '<span class="stepper__val">' + val + '</span>' +
        '<button class="stepper__btn" data-action="pax-step" data-key="' + key + '" data-dir="1" data-min="' + min + '" data-max="' + max + '">+</button>' +
      '</div></div>';
  }

  function swapIcon() {
    return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.71967 2.21967C9.42678 2.51256 9.42678 2.98744 9.71967 3.28033L10.4393 4H3.75C3.33579 4 3 4.33579 3 4.75C3 5.16421 3.33579 5.5 3.75 5.5H10.4393L9.71967 6.21967C9.42678 6.51256 9.42678 6.98744 9.71967 7.28033C10.0126 7.57322 10.4874 7.57322 10.7803 7.28033L12.7803 5.28033C13.0732 4.98744 13.0732 4.51256 12.7803 4.21967L10.7803 2.21967C10.4874 1.92678 10.0126 1.92678 9.71967 2.21967ZM6.28033 8.71967C6.57322 9.01256 6.57322 9.48744 6.28033 9.78033L5.56066 10.5H12.25C12.6642 10.5 13 10.8358 13 11.25C13 11.6642 12.6642 12 12.25 12H5.56066L6.28033 12.7197C6.57322 13.0126 6.57322 13.4874 6.28033 13.7803C5.98744 14.0732 5.51256 14.0732 5.21967 13.7803L3.21967 11.7803C2.92678 11.4874 2.92678 11.0126 3.21967 10.7197L5.21967 8.71967C5.51256 8.42678 5.98744 8.42678 6.28033 8.71967Z" fill="currentColor"></path></svg>';
  }

  /* ----------------------------------------------------------------
     AIRPORT COMBOBOX FIELD (From / To)
  ---------------------------------------------------------------- */
  function renderAirportField(fieldKey, placeholder, extraClass) {
    var name = get(fieldKey, state) || '';
    var code = get(fieldKey + 'Code', state) || '';
    var isOpen = state.openPopover && state.openPopover.type === 'airport' && state.openPopover.field === fieldKey;
    var inner;
    if (isOpen) {
      inner = '<input type="text" class="field-input" data-airport-input data-field="' + fieldKey + '" value="' + escapeHtml(state.openPopover.query) + '" placeholder="' + escapeHtml(placeholder) + '" autocomplete="off">';
    } else if (name) {
      inner = '<span class="field-value"><span class="field-value__name">' + escapeHtml(name) + '</span>' + (code ? '<span class="field-value__code">' + escapeHtml(code) + '</span>' : '') + '</span>';
    } else {
      inner = '<span class="field-placeholder">' + escapeHtml(placeholder) + '</span>';
    }
    return '<div class="search-field' + (extraClass || '') + (isOpen ? ' is-active' : '') + '" data-action="open-airport-field" data-field="' + fieldKey + '">' +
      inner +
      (isOpen ? renderAirportPopover(fieldKey, state.openPopover.query) : '') +
    '</div>';
  }

  function renderAirportPopover(fieldKey, query) {
    return '<div class="field-pop field-pop--airport" data-action="noop"><div class="field-pop__list">' + renderAirportGroups(query) + '</div></div>';
  }

  function renderAirportGroups(query) {
    var q = (query || '').trim();
    if (!q) return '<div class="field-pop__hint">Start typing a city or airport</div>';
    var groups = searchAirports(q);
    if (!groups.length) return '<div class="field-pop__hint">No matches found</div>';
    return groups.map(function (g) {
      var rows = '';
      if (g.cityMatch) rows += airportRowHtml(g.city, g.airports[0].code, false);
      g.airports.slice(0, 4).forEach(function (a) { rows += airportRowHtml(a.name, a.code, true); });
      return rows;
    }).join('');
  }

  function airportRowHtml(name, code, indented) {
    return '<div class="airport-row' + (indented ? ' airport-row--sub' : '') + '" data-action="select-airport" data-name="' + escapeHtml(name) + '" data-code="' + code + '">' +
      '<span>' + escapeHtml(name) + '</span><span class="airport-row__code">' + code + '</span></div>';
  }

  /* ----------------------------------------------------------------
     CALENDAR FIELD (Departure / Return)
  ---------------------------------------------------------------- */
  var MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function renderCalendarField(fieldKey, placeholder, minISO, isReturn) {
    var iso = get(fieldKey, state) || '';
    var isOpen = state.openPopover && state.openPopover.type === 'calendar' && state.openPopover.field === fieldKey;
    var inner = iso
      ? '<span class="field-value"><span class="field-value__name">' + formatFieldDate(iso) + '</span></span>'
      : '<span class="field-placeholder">' + escapeHtml(placeholder) + '</span>';
    return '<div class="search-field' + (isOpen ? ' is-active' : '') + '" data-action="open-calendar-field" data-field="' + fieldKey + '" data-min="' + minISO + '" data-return="' + (isReturn ? '1' : '0') + '">' +
      inner +
      (isOpen ? renderCalendarPopover(fieldKey, iso, minISO, isReturn) : '') +
    '</div>';
  }

  function renderCalendarPopover(fieldKey, selectedISO, minISO, isReturn) {
    var op = state.openPopover;
    var y = op.calYear, m = op.calMonth;
    var nm = m + 1, ny = y;
    if (nm > 11) { nm = 0; ny++; }
    return '<div class="field-pop field-pop--calendar' + (isReturn ? ' field-pop--calendar-right' : '') + '" data-action="noop">' +
      '<div class="cal-head">' +
        '<span class="cal-head__title">Choose date</span>' +
        (isReturn ? '<span class="cal-head__skip" data-action="calendar-skip-return" data-field="' + fieldKey + '">Without a return flight</span>' : '') +
      '</div>' +
      '<div class="cal-nav-row">' +
        '<button class="cal-nav" data-action="calendar-nav" data-dir="-1" aria-label="Previous month">' + chevronSvg('left') + '</button>' +
        '<span class="cal-month-title">' + MONTH_NAMES[m] + '</span>' +
        '<span class="cal-month-title">' + MONTH_NAMES[nm] + '</span>' +
        '<button class="cal-nav" data-action="calendar-nav" data-dir="1" aria-label="Next month">' + chevronSvg('right') + '</button>' +
      '</div>' +
      '<div class="cal-grids">' + renderMonthGrid(y, m, fieldKey, selectedISO, minISO) + renderMonthGrid(ny, nm, fieldKey, selectedISO, minISO) + '</div>' +
    '</div>';
  }

  function renderMonthGrid(y, m, fieldKey, selectedISO, minISO) {
    var first = new Date(y, m, 1);
    var startDow = first.getDay();
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var minD = minISO ? parseISO(minISO) : null;
    var cells = '';
    for (var i = 0; i < startDow; i++) cells += '<span class="cal-cell cal-cell--pad"></span>';
    for (var d = 1; d <= daysInMonth; d++) {
      var iso = y + '-' + pad(m + 1) + '-' + pad(d);
      var dateObj = new Date(y, m, d);
      var disabled = minD && dateObj < minD;
      var selected = iso === selectedISO;
      cells += '<span class="cal-cell' + (disabled ? ' is-disabled' : '') + (selected ? ' is-selected' : '') + '"' +
        (disabled ? '' : ' data-action="select-date" data-field="' + fieldKey + '" data-date="' + iso + '"') + '>' + d + '</span>';
    }
    return '<div class="cal-grid"><div class="cal-weekdays"><span>su</span><span>mo</span><span>tu</span><span>we</span><span>th</span><span>fr</span><span>sa</span></div>' +
      '<div class="cal-days">' + cells + '</div></div>';
  }

  function chevronSvg(dir) {
    var d = dir === 'left' ? 'M15 18l-6-6 6-6' : (dir === 'down' ? 'M6 9l6 6 6-6' : 'M9 18l6-6-6-6');
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="' + d + '"></path></svg>';
  }

  /* ----------------------------------------------------------------
     RENDER: SEARCH RESULTS
  ---------------------------------------------------------------- */
  function guessCode(text, fallback) {
    if (!text) return fallback;
    var t = text.trim().toUpperCase();
    if (/^[A-Z]{3}$/.test(t)) return t;
    return t.slice(0, 3) || fallback;
  }

  function renderResults() {
    var q = state.resultsQuery;
    var r = state.regular;

    var rows = [];
    FLIGHTS.forEach(function (f, idx) {
      rows.push(renderResultRow(f));
      if (idx === 1 || idx === 5) rows.push(renderAltOptionsRow());
    });

    return '' +
      '<div class="search-bar">' +
        renderAirportField('regular.from', 'From', ' search-field--from') +
        '<div class="search-field--swap" data-action="swap-regular" title="Swap origin and destination">' + swapIcon() + '</div>' +
        renderAirportField('regular.to', 'To', ' search-field--to') +
        renderCalendarField('regular.departure', 'Departure', toISO(TODAY), false) +
        renderCalendarField('regular.return', 'Return', r.departure || toISO(TODAY), true) +
        '<div class="search-field search-field--pax' + (r.paxOpen ? ' is-active' : '') + '" data-action="toggle-pax-regular">' +
          '<label>Passengers</label><div class="search-field__pax-value">' + paxSummaryLabel(r) + '</div>' +
          (r.paxOpen ? renderRegularPaxPop() : '') +
        '</div>' +
        '<button class="btn btn-primary search-bar__submit" data-action="regular-search-submit">Search</button>' +
      '</div>' +
      '<div class="ai-filters-band">' +
        '<div class="ai-filters-band__icon">&#10022;</div>' +
        '<div class="ai-filters-band__label">AI Filters</div>' +
        '<div class="ai-filters-band__info">i</div>' +
        '<input class="ai-filters-band__query" data-field="aiQuery" value="' + escapeHtml(state.aiQuery) + '">' +
        '<div class="ai-filters-band__cta" data-action="noop">Filter flights</div>' +
      '</div>' +
      '<div class="results-filter-row">' +
        '<div class="rf-group rf-group--type">' +
          resultFilterToggle('All flights', 'type', 'all') + resultFilterToggle('Direct', 'type', 'direct') + resultFilterToggle('Up to 1 connection', 'type', '1stop') +
        '</div>' +
        '<div class="rf-group rf-group--sort">' +
          resultFilterToggle('Cheapest', 'sort', 'cheapest') + resultFilterToggle('Fastest', 'sort', 'fastest') + resultFilterToggle('Optimal', 'sort', 'optimal') +
        '</div>' +
        '<div class="rf-group rf-group--bag">' +
          resultFilterToggle('Without baggage', 'bag', 'without') + resultFilterToggle('With baggage', 'bag', 'with') +
        '</div>' +
      '</div>' +
      rows.join('') +
      '<div style="height:60px"></div>';
  }

  function resultFilterToggle(label, group, val) {
    var active = state.resultsFilters[group] === val;
    return '<div class="filter-toggle' + (active ? ' active' : '') + '" data-action="set-result-filter" data-group="' + group + '" data-value="' + val + '">' + label + '</div>';
  }

  function renderResultRow(f) {
    var a = AIRLINES[f.airlineId];
    var timesMain = f.connecting ? (f.segments[0].dep + ' — ' + f.segments[f.segments.length - 1].arr) : (f.dep + ' — ' + f.arr);
    var fromCode = f.connecting ? f.segments[0].depCode : 'WAW';
    var toCode = f.connecting ? f.segments[f.segments.length - 1].arrCode : 'CDG';
    var stopsLabel = f.connecting ? '1 connection' : (f.stops === 0 ? 'Direct flight' : '1 connection');
    var stopsSub = (!f.connecting && f.stops === 1) ? f.connectionCode + ' ' + f.layover : '';
    var faresHtml = f.fares.map(function (fr) {
      return '<div class="fare-price-box" data-action="open-offer" data-flight="' + f.id + '" data-fare="' + fr.key + '">' +
        '<div class="fare-price-box__name">' + escapeHtml(fr.name) + '</div>' +
        '<div class="fare-price-box__price">' + fmtMoney(fr.price) + '<span class="cur">EUR</span></div>' +
      '</div>';
    }).join('');
    return '<div class="result-row-wrap"><div class="result-row">' +
      '<div class="result-row__logo"><img src="' + a.logo + '" alt="' + a.name + '"></div>' +
      '<div class="result-row__times"><div class="result-row__times-main">' + timesMain + '</div><div class="result-row__sub">' + a.name + '</div></div>' +
      '<div class="result-row__duration"><div class="result-row__duration-val">' + f.duration + '</div><div class="result-row__sub">' + fromCode + ' — ' + toCode + '</div></div>' +
      '<div class="result-row__stops"><div>' + stopsLabel + '</div>' + (stopsSub ? '<div class="result-row__sub">' + stopsSub + '</div>' : '') + '</div>' +
      '<div class="result-row__fares">' + faresHtml + '</div>' +
    '</div></div>';
  }

  function renderAltOptionsRow() {
    return '<div class="alt-options-row">' +
      '<div class="alt-options-row__icon">😍</div>' +
      '<div><div class="alt-options-row__title">We have found alternative options</div><div class="alt-options-row__sub">Check flight options from nearby airports</div></div>' +
      '<div class="alt-options-row__side">from <b>1 149</b> EUR<span class="alt-options-row__choose" data-action="noop">Choose</span></div>' +
    '</div>';
  }

  /* ----------------------------------------------------------------
     VALIDATION HELPERS (group flow)
  ---------------------------------------------------------------- */
  function validateGroupForm() {
    var g = state.group, errs = {};
    if (!g.from.trim()) errs.from = 1;
    if (!g.to.trim()) errs.to = 1;
    if (!g.departure) errs.departure = 1;
    if (!g.return) errs.return = 1;
    if (g.departure && g.return && parseISO(g.return) < parseISO(g.departure)) errs.return = 1;
    if (g.pax < 10) errs.pax = 1;
    return errs;
  }

  function isStep1Valid() {
    var d = state.requestDraft;
    if (!d) return false;
    if (!d.from.trim() || !d.to.trim() || !d.departure || !d.return) return false;
    if (parseISO(d.return) < parseISO(d.departure)) return false;
    if (d.pax < 10) return false;
    if (d.airlineIds.length < 1) return false;
    if (!d.dateFlexibility || !d.tripReason) return false;
    return true;
  }

  /* ----------------------------------------------------------------
     RENDER: GROUP SEARCH FORM
  ---------------------------------------------------------------- */
  function renderGroupForm() {
    var g = state.group, e = state.groupErrors;
    if (state.groupSubmitState === 'loading') {
      return groupFormBar(g, e) +
        '<div class="info-note"><div class="info-note__icon">i</div><div class="info-note__text">Searching group flight options…</div></div>';
    }
    if (state.groupSubmitState === 'error') {
      return groupFormBar(g, e) +
        '<div class="server-error-panel">' +
          '<div class="server-error-panel__icon">!</div>' +
          '<h3>We couldn’t load group search results</h3>' +
          '<p>Something went wrong on our end. Your search details have been kept — please try again.</p>' +
          '<div class="server-error-panel__actions"><button class="btn btn-primary" data-action="group-search-submit">Retry</button></div>' +
        '</div>';
    }
    return groupFormBar(g, e) +
      (Object.keys(e).length ? '<div class="field-error" style="margin-top:10px">Please complete all required fields.</div>' : '') +
      '<div class="notice-banner"><b>Group results are indicative.</b> Final price and conditions will be confirmed directly by the airline.</div>';
  }

  function groupFormBar(g, e) {
    var loading = state.groupSubmitState === 'loading';
    return '<div class="search-bar' + (Object.keys(e).length ? ' has-error' : '') + '">' +
      renderAirportField('group.from', 'From', ' search-field--from' + (e.from ? ' is-invalid' : '')) +
      '<div class="search-field--swap" data-action="swap-group" title="Swap origin and destination">' + swapIcon() + '</div>' +
      renderAirportField('group.to', 'To', ' search-field--to' + (e.to ? ' is-invalid' : '')) +
      renderCalendarField('group.departure', 'Departure', toISO(TODAY), false) +
      renderCalendarField('group.return', 'Return', g.departure || toISO(TODAY), true) +
      '<div class="search-field search-field--pax-total search-field--pax' + (g.paxOpen ? ' is-active' : '') + (e.pax ? ' is-invalid' : '') + '" data-action="toggle-pax-group">' +
        '<span class="search-field__pax-value">' + g.pax + ' passengers</span>' +
        (g.paxOpen ? renderGroupPaxPop() : '') +
      '</div>' +
      '<button class="btn btn-primary search-bar__submit" data-action="group-search-submit" ' + (loading ? 'disabled' : '') + '>' +
        (loading ? '<span class="spinner"></span> Searching' : 'Search') +
      '</button>' +
    '</div>';
  }

  function renderGroupPaxPop() {
    var g = state.group;
    return '<div class="pax-pop" data-action="noop">' +
      '<div class="pax-row" style="border-top:none">' +
        '<div><div class="pax-row__label">Passengers</div><div class="pax-row__sub">Group of 10 or more</div></div>' +
        '<div class="stepper">' +
          '<button class="stepper__btn' + (g.pax <= 10 ? ' is-muted' : '') + '" data-action="group-pax-step" data-dir="-1">&minus;</button>' +
          '<span class="stepper__val">' + g.pax + '</span>' +
          '<button class="stepper__btn" data-action="group-pax-step" data-dir="1">+</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ----------------------------------------------------------------
     RENDER: GROUP SEARCH RESULTS
  ---------------------------------------------------------------- */
  function renderGroupResults() {
    var flights = GROUP_AIRLINES.filter(function (a) {
      if (state.groupFilter === 'direct') return a.stops === 0;
      if (state.groupFilter === '1stop') return a.stops <= 1;
      return true;
    });
    var g = state.group;
    var rowsHtml = flights.length ? flights.map(renderGroupResultRow).join('') : '<div class="empty-note">No flights match this filter. Try a different filter.</div>';

    return '' +
      '<div class="search-bar">' +
        renderAirportField('group.from', 'From', ' search-field--from') +
        '<div class="search-field--swap" data-action="swap-group" title="Swap origin and destination">' + swapIcon() + '</div>' +
        renderAirportField('group.to', 'To', ' search-field--to') +
        renderCalendarField('group.departure', 'Departure', toISO(TODAY), false) +
        renderCalendarField('group.return', 'Return', g.departure || toISO(TODAY), true) +
        '<div class="search-field search-field--pax-total search-field--pax' + (g.paxOpen ? ' is-active' : '') + '" data-action="toggle-pax-group">' +
          '<span class="search-field__pax-value">' + g.pax + ' passengers</span>' +
          (g.paxOpen ? renderGroupPaxPop() : '') +
        '</div>' +
        '<button class="btn btn-primary search-bar__submit" data-action="group-search-submit">Search</button>' +
      '</div>' +
      '<div class="ai-filters-band">' +
        '<div class="ai-filters-band__icon">&#10022;</div>' +
        '<div class="ai-filters-band__label">AI Filters</div>' +
        '<div class="ai-filters-band__info">i</div>' +
        '<input class="ai-filters-band__query" data-field="groupAiQuery" value="' + escapeHtml(state.groupAiQuery) + '">' +
        '<div class="ai-filters-band__cta" data-action="noop">Filter flights</div>' +
      '</div>' +
      '<div class="results-filter-row">' +
        '<div class="rf-group rf-group--type">' +
          groupFilterToggle('All flights', 'all') + groupFilterToggle('Direct', 'direct') + groupFilterToggle('Up to 1 connection', '1stop') +
        '</div>' +
        '<div class="rf-group rf-group--bag rf-group--airlines">' +
          '<div class="filter-toggle filter-airline-trigger' + (state.airlineFilterOpen ? ' active' : '') + '" data-action="toggle-airline-filter">' +
            'Airlines' + (state.selectedAirlineIds.length ? ' (' + state.selectedAirlineIds.length + ')' : '') +
            chevronSvg('down') +
          '</div>' +
          (state.airlineFilterOpen ? renderAirlineFilterDropdown() : '') +
        '</div>' +
      '</div>' +
      rowsHtml +
      '<div style="height:90px"></div>';
  }

  function groupFilterToggle(label, val) {
    return '<div class="filter-toggle' + (state.groupFilter === val ? ' active' : '') + '" data-action="set-group-filter" data-filter="' + val + '">' + label + '</div>';
  }

  function renderAirlineFilterDropdown() {
    var atMax = state.selectedAirlineIds.length >= 3;
    var rows = GROUP_AIRLINES.map(function (a) {
      var checked = state.selectedAirlineIds.indexOf(a.id) !== -1;
      var disabled = !checked && atMax;
      return '<div class="filter-airline-row' + (checked ? ' is-checked' : '') + (disabled ? ' is-disabled' : '') + '" data-action="toggle-select-airline" data-airline="' + a.id + '">' +
        '<div class="filter-airline-row__check">' + (checked ? checkSvg() : '') + '</div>' +
        '<div class="filter-airline-row__logo"><img src="' + a.logo + '" alt=""></div>' +
        '<div class="filter-airline-row__name">' + escapeHtml(a.name) + '</div>' +
      '</div>';
    }).join('');
    return '<div class="field-pop filter-airline-pop" data-action="noop">' + rows + '</div>';
  }

  function checkSvg() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  }

  function renderGroupResultRow(a) {
    var selected = state.selectedAirlineIds.indexOf(a.id) !== -1;
    var q = state.groupResultsQuery;
    var fromCode = (q && q.fromCode) || 'WAW', toCode = (q && q.toCode) || 'CDG';
    var cta = selected ? '<div class="group-select-badge">Selected</div>' : '';
    return '<div class="result-row-wrap"><div class="result-row' + (selected ? ' is-group-selected' : '') + '">' +
      '<div class="result-row__logo"><img src="' + a.logo + '" alt="' + a.name + '"></div>' +
      '<div class="result-row__times"><div class="result-row__times-main">' + a.dep + ' — ' + a.arr + '</div><div class="result-row__sub">' + a.name + '</div></div>' +
      '<div class="result-row__duration"><div class="result-row__duration-val">' + a.duration + '</div><div class="result-row__sub">' + fromCode + ' — ' + toCode + '</div></div>' +
      '<div class="result-row__stops"><div>' + (a.stops === 0 ? 'Direct flight' : '1 connection') + '</div>' + (a.stops === 1 ? '<div class="result-row__sub">' + a.connectionCode + ' ' + a.layover + '</div>' : '') + '</div>' +
      '<div class="group-select-col" data-action="noop">' + cta + '</div>' +
    '</div></div>';
  }

  /* ----------------------------------------------------------------
     RENDER: STICKY SELECTION BAR (Group Search Results)
  ---------------------------------------------------------------- */
  function renderStickyBar() {
    var host = document.getElementById('stickyBarHost');
    var visible = state.page === 'search' && state.searchTab === 'groups' && state.groupsScreen === 'results' && state.selectedAirlineIds.length > 0;
    if (!visible) { host.innerHTML = ''; return; }
    var chips = state.selectedAirlineIds.map(function (id) {
      var a = groupAirlineById(id);
      return '<div class="sticky-bar__chip"><img src="' + a.logo + '" alt="">' + a.code + '</div>';
    }).join('');
    host.innerHTML = '<div class="sticky-bar is-visible">' +
      '<div class="sticky-bar__left">' +
        '<div class="sticky-bar__count">Selected airlines: ' + state.selectedAirlineIds.length + '/3</div>' +
        '<div class="sticky-bar__chips">' + chips + '</div>' +
      '</div>' +
      '<div class="sticky-bar__right"><button class="btn btn-primary" data-action="create-request">Create request</button></div>' +
    '</div>';
  }

  /* ----------------------------------------------------------------
     RENDER: REQUEST BUILDER
  ---------------------------------------------------------------- */
  function renderRequestBuilder() {
    if (state.builderSubmitState === 'success') return renderBuilderSuccess();
    var d = state.requestDraft;
    var steps = '<div class="progress-steps">' +
      progressStep(1, 'Trip details') + '<div class="progress-connector' + (state.builderStep > 1 ? ' is-done' : '') + '"></div>' +
      progressStep(2, 'Additional details') +
    '</div>';
    return '' +
      '<div class="page-head"><h1>Create group fare request</h1><p class="page-head__desc">Review the trip details and add the information airlines need to prepare group offers.</p></div>' +
      steps +
      (state.builderStep === 1 ? renderBuilderStep1(d) : renderBuilderStep2(d));
  }

  function progressStep(n, label) {
    var cls = 'progress-step' + (state.builderStep === n ? ' is-active' : (state.builderStep > n ? ' is-done' : ''));
    var dot = state.builderStep > n ? '✓' : n;
    return '<div class="' + cls + '"><div class="progress-step__dot">' + dot + '</div>' + label + '</div>';
  }

  function renderBuilderStep1(d) {
    var e = state.builderErrors;
    var chips = d.airlineIds.map(function (id) {
      var a = groupAirlineById(id);
      return '<div class="chip"><img src="' + a.logo + '" alt="">' + '<span>' + a.name + '</span>' +
        (d.airlineIds.length > 1 ? '<span class="chip__remove" data-action="remove-builder-airline" data-airline="' + id + '">&times;</span>' : '') +
      '</div>';
    }).join('');

    return '' +
      (e.general ? '<div class="field-error" style="margin-bottom:16px">Please complete all required fields.</div>' : '') +
      '<div class="section-title" style="margin-top:0">Trip details</div>' +
      '<div class="section-desc">Route, dates and passenger count can still be edited.</div>' +
      '<div class="search-bar">' +
        renderAirportField('requestDraft.from', 'From', ' search-field--from') +
        '<div class="search-field--swap" data-action="swap-builder" title="Swap origin and destination">' + swapIcon() + '</div>' +
        renderAirportField('requestDraft.to', 'To', ' search-field--to') +
        renderCalendarField('requestDraft.departure', 'Departure', toISO(TODAY), false) +
        renderCalendarField('requestDraft.return', 'Return', d.departure || toISO(TODAY), true) +
        '<div class="search-field search-field--pax-total search-field--pax' + (d.paxOpen ? ' is-active' : '') + '" data-action="toggle-pax-builder">' +
          '<span class="search-field__pax-value">' + d.pax + ' passengers</span>' +
          (d.paxOpen ? renderBuilderPaxPop() : '') +
        '</div>' +
      '</div>' +

      '<div class="field-group">' +
        '<div class="field-group__label">Selected airlines</div>' +
        '<div class="chip-list">' + chips + '</div>' +
      '</div>' +
      '<div class="field-group">' +
        '<div class="field-group__label">Date flexibility <span class="field-group__required">*</span></div>' +
        '<div class="pill-group">' + FLEX_OPTIONS.map(function (o) {
          return '<div class="pill' + (d.dateFlexibility === o.v ? ' is-selected' : '') + (e.dateFlexibility ? ' is-invalid' : '') + '" data-action="set-flex" data-value="' + o.v + '">' + o.l + '</div>';
        }).join('') + '</div>' +
      '</div>' +
      '<div class="field-group">' +
        '<div class="field-group__label">Trip reason <span class="field-group__required">*</span></div>' +
        '<div class="pill-group">' + TRIP_REASONS.map(function (o) {
          return '<div class="pill' + (d.tripReason === o.v ? ' is-selected' : '') + (e.tripReason ? ' is-invalid' : '') + '" data-action="set-reason" data-value="' + o.v + '">' + o.l + '</div>';
        }).join('') + '</div>' +
      '</div>' +
      '<div class="form-actions">' +
        '<button class="btn btn-secondary" data-action="builder-back-to-results">Back to results</button>' +
        '<button class="btn btn-primary" data-action="builder-continue" ' + (isStep1Valid() ? '' : 'disabled') + '>Continue</button>' +
      '</div>';
  }

  function renderBuilderPaxPop() {
    var d = state.requestDraft;
    return '<div class="pax-pop" data-action="noop">' +
      '<div class="pax-row" style="border-top:none">' +
        '<div><div class="pax-row__label">Passengers</div><div class="pax-row__sub">Group of 10 or more</div></div>' +
        '<div class="stepper">' +
          '<button class="stepper__btn' + (d.pax <= 10 ? ' is-muted' : '') + '" data-action="builder-pax-step" data-dir="-1">&minus;</button>' +
          '<span class="stepper__val">' + d.pax + '</span>' +
          '<button class="stepper__btn" data-action="builder-pax-step" data-dir="1">+</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function renderBuilderStep2(d) {
    if (state.builderSubmitState === 'error') {
      return '<div class="server-error-panel">' +
        '<div class="server-error-panel__icon">!</div>' +
        '<h3>We couldn’t submit your request</h3>' +
        '<p>Your information has been saved. Try submitting again.</p>' +
        '<div class="server-error-panel__actions">' +
          '<button class="btn btn-primary" data-action="submit-request">Retry</button>' +
          '<button class="btn btn-secondary" data-action="builder-error-back">Back to form</button>' +
        '</div>' +
      '</div>';
    }
    var submitting = state.builderSubmitState === 'submitting';
    var airlineNames = d.airlineIds.map(function (id) { return groupAirlineById(id).name; }).join(', ');
    var flexLabel = FLEX_OPTIONS.filter(function (o) { return o.v === d.dateFlexibility; })[0];
    var reasonLabel = TRIP_REASONS.filter(function (o) { return o.v === d.tripReason; })[0];
    return '' +
      '<div class="section-title" style="margin-top:0">Additional details</div>' +
      '<div class="section-desc">Add any requirements that may affect the airline’s offer.</div>' +
      '<div class="field-group" style="margin-top:0">' +
        '<div class="field-group__label">Baggage requirements</div>' +
        '<textarea class="textarea" data-field="requestDraft.baggage" placeholder="For example: 10 sports bags, 20 kg each">' + escapeHtml(d.baggage) + '</textarea>' +
      '</div>' +
      '<div class="field-group">' +
        '<div class="field-group__label">Additional comments</div>' +
        '<textarea class="textarea" data-field="requestDraft.comments" placeholder="Add preferred departure times, alternative airports or other important requirements">' + escapeHtml(d.comments) + '</textarea>' +
      '</div>' +
      '<div class="summary-box">' +
        '<div class="summary-box__title">Request summary</div>' +
        '<dl>' +
          summaryRow('Route', escapeHtml(d.from) + ' → ' + escapeHtml(d.to)) +
          summaryRow('Dates', formatDisplay(d.departure) + ' – ' + formatDisplay(d.return)) +
          summaryRow('Date flexibility', flexLabel ? flexLabel.l : '—') +
          summaryRow('Passengers', d.pax + ' passengers') +
          summaryRow('Selected airlines', airlineNames) +
          summaryRow('Trip reason', reasonLabel ? reasonLabel.l : '—') +
        '</dl>' +
      '</div>' +
      '<div class="form-actions">' +
        '<button class="btn btn-secondary" data-action="builder-back-step1" ' + (submitting ? 'disabled' : '') + '>Back</button>' +
        '<button class="btn btn-primary" data-action="submit-request" ' + (submitting ? 'disabled' : '') + '>' +
          (submitting ? '<span class="spinner"></span> Submitting' : 'Submit request') +
        '</button>' +
      '</div>';
  }

  function summaryRow(label, value) {
    return '<div class="summary-box__row"><dt>' + label + '</dt><dd>' + value + '</dd></div>';
  }

  function renderBuilderSuccess() {
    return '<div class="success-panel">' +
      '<div class="success-panel__icon">✓</div>' +
      '<h2>Group fare request submitted</h2>' +
      '<p>We’ll show each airline’s response in Bookings. Calculation may take up to 24 hours.</p>' +
      '<button class="btn btn-primary" data-action="goto-bookings-from-success">View in bookings</button>' +
    '</div>';
  }

  /* ----------------------------------------------------------------
     RENDER: GROUP OFFER DETAILS
  ---------------------------------------------------------------- */
  function groupOfferLookup(ref) {
    var req = state.groupRequests.filter(function (r) { return r.id === ref.requestId; })[0];
    var o = req.offers.filter(function (x) { return x.airlineId === ref.airlineId; })[0];
    return { req: req, o: o, a: groupAirlineById(o.airlineId) };
  }

  function renderGroupOfferDetails() {
    var found = groupOfferLookup(state.currentGroupOffer);
    var req = found.req, o = found.o, a = found.a;
    var statusLabels = { calculating: 'Calculating', review: 'Review required', accepted: 'Accepted', declined: 'Declined' };

    var caption = a.stops === 0
      ? (a.name + ', ' + a.flightNo + ', duration ' + a.duration)
      : (a.name + ', ' + a.flightNo + ', duration ' + a.duration + ' · 1 connection via ' + escapeHtml(airportNameByCode(a.connectionCode)) + ' (' + a.connectionCode + '), layover ' + a.layover);
    var seg = renderSegRow(a.logo, a.dep, req.from, req.fromCode, a.arr, req.to, req.toCode, caption);

    return '' +
      '<div class="back-link" data-action="offer-back-to-bookings">&larr; Back to bookings</div>' +
      '<h1 class="offer-flight-heading">' + a.name + '</h1>' +
      '<div class="offer-header">' +
        '<span>Request #' + req.id + '</span><span class="offer-header__sep">•</span>' +
        '<span>' + statusLabels[o.status] + '</span>' +
        (o.acceptBy ? '<span class="offer-header__sep">•</span><span>Decision deadline: ' + formatDisplay(toISO(o.acceptBy)) + '</span>' : '') +
      '</div>' +
      '<div class="segment-card" data-action="copy-option" style="margin-top:20px">' + seg + '<div class="segment-card__copy">Click to copy option</div></div>' +

      '<div class="section-title">Price</div>' +
      '<div class="detail-grid">' +
        detailRow('Price per passenger', o.perPax ? fmtMoney(o.perPax) + ' ' + o.currency : '—') +
        detailRow('Passengers', req.pax + ' passengers') +
      '</div>' +
      (o.total ? '<div class="price-summary"><div class="price-summary__row is-total"><span>Total price</span><span>' + fmtMoney(o.total) + ' ' + o.currency + '</span></div></div>' : '') +

      '<div class="section-title">Baggage</div>' +
      '<div class="detail-grid">' +
        detailRow('Included baggage', o.baggageIncluded || '—') +
        detailRow('Additional baggage', o.baggageNote || '—') +
      '</div>' +

      '<div class="section-title">Deadlines</div>' +
      '<div class="detail-grid">' +
        detailRow('Accept offer by', o.acceptBy ? formatDisplay(toISO(o.acceptBy)) : '—') +
        detailRow('Deposit payment by', o.depositBy ? formatDisplay(toISO(o.depositBy)) : '—') +
        (o.namesBy ? detailRow('Passenger names due by', formatDisplay(toISO(o.namesBy))) : '') +
      '</div>' +

      (o.conditions ? '<div class="section-title">Fare conditions</div><ul class="conditions-list">' +
        '<li><b>Payment</b>' + o.conditions.payment + '</li>' +
        '<li><b>Changes</b>' + o.conditions.changes + '</li>' +
        '<li><b>Cancellations</b>' + o.conditions.cancellation + '</li>' +
        '<li><b>Passenger flexibility</b>' + o.conditions.flexibility + '</li>' +
        '<li><b>Other</b>' + o.conditions.other + '</li>' +
      '</ul>' : '') +

      (o.status === 'declined' && o.declineReason ? '<div class="section-title">Decline reason</div><div class="detail-grid">' + detailRow('Reason', escapeHtml(o.declineReason)) + (o.declineComment ? detailRow('Comment', escapeHtml(o.declineComment)) : '') + '</div>' : '') +
      '<div style="height:90px"></div>';
  }

  function detailRow(label, value) {
    return '<div class="detail-row"><dt>' + label + '</dt><dd>' + value + '</dd></div>';
  }

  function renderStickyOfferActions() {
    var host = document.getElementById('offerActionsHost');
    if (state.page !== 'group-offer-details') { host.innerHTML = ''; return; }
    var found = groupOfferLookup(state.currentGroupOffer);
    var o = found.o;
    var actions = '<button class="btn btn-ghost offer-sticky-actions__back" data-action="offer-back-to-bookings">Back to bookings</button>';
    if (o.status === 'review' || o.status === 'accepted') {
      actions += '<button class="btn btn-destructive" data-action="open-decline-modal">Decline</button>';
      actions += '<button class="btn btn-primary" data-action="accept-offer" ' + (o.status === 'accepted' || state.acceptProcessing ? 'disabled' : '') + '>' +
        (state.acceptProcessing ? '<span class="spinner"></span> Processing' : (o.status === 'accepted' ? 'Offer accepted' : 'Accept offer')) + '</button>';
    }
    host.innerHTML = '<div class="offer-sticky-actions">' + actions + '</div>';
  }

  /* ----------------------------------------------------------------
     RENDER: DECLINE MODAL
  ---------------------------------------------------------------- */
  function renderDeclineModal() {
    var host = document.getElementById('modalHost');
    if (!state.declineModal) { host.innerHTML = ''; return; }
    var m = state.declineModal;
    host.innerHTML = '<div class="modal-overlay" data-action="close-decline-modal-overlay">' +
      '<div class="modal" data-action="noop">' +
        '<h2>Decline offer</h2>' +
        '<p class="modal__desc">Tell us why this offer does not work for your client.</p>' +
        '<label class="field-label">Reason <span class="field-group__required">*</span></label>' +
        '<select class="select-native' + (m.error ? ' is-invalid' : '') + '" data-field="declineModal.reason">' +
          '<option value="" ' + (!m.reason ? 'selected' : '') + '>Select a reason</option>' +
          DECLINE_REASONS.map(function (r) { return '<option value="' + escapeHtml(r) + '" ' + (m.reason === r ? 'selected' : '') + '>' + r + '</option>'; }).join('') +
        '</select>' +
        (m.error ? '<div class="field-error">Please select a reason.</div>' : '') +
        '<div class="field-group">' +
          '<label class="field-label">Comment (optional)</label>' +
          '<textarea class="textarea" data-field="declineModal.comment" placeholder="Add more context for your team">' + escapeHtml(m.comment) + '</textarea>' +
        '</div>' +
        '<div class="modal__actions">' +
          '<button class="btn btn-secondary" data-action="close-decline-modal">Cancel</button>' +
          '<button class="btn btn-destructive-solid" data-action="confirm-decline">Decline offer</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ----------------------------------------------------------------
     RENDER: OFFER DETAILS
  ---------------------------------------------------------------- */
  function renderOfferDetails() {
    var f = flightById(state.currentOffer.flightId);
    var a = AIRLINES[f.airlineId];
    var d = state.offerDraft;
    var tiers = f.fareTiers || genericFareTiers(f);
    var selectedTier = tiers.filter(function (t) { return t.key === d.fareTier; })[0] || tiers[0];

    var destCity = f.connecting ? cityByAirportName(f.segments[f.segments.length - 1].arrName) : 'Paris';
    var totalDuration = f.connecting ? f.duration : f.duration;

    var segHtml;
    if (f.connecting) {
      segHtml = f.segments.map(function (s, i) {
        var row = renderSegRow(a.logo, s.dep, s.depName, s.depCode, s.arr, s.arrName, s.arrCode, a.name + ', ' + s.flightNo + ', duration ' + s.duration);
        return (i > 0 ? '<div class="segment-connection">Connection ' + f.connection + '</div>' : '') + row;
      }).join('');
    } else {
      segHtml = renderSegRow(a.logo, f.dep, 'Warsaw Chopin Airport', 'WAW', f.arr, 'Charles de Gaulle Intl', 'CDG', a.name + ', ' + f.flightNo + ', duration ' + f.duration);
    }

    var tiersHtml = tiers.map(function (t) {
      var sel = t.key === d.fareTier;
      return '<div class="fare-tier-card' + (sel ? ' is-selected' : '') + '" data-action="select-fare-tier" data-tier="' + t.key + '">' +
        '<div class="fare-tier-card__name">' + t.name + '</div>' +
        (t.code ? '<div class="fare-tier-card__code">' + t.code + '</div>' : '') +
        '<div class="fare-tier-card__rules" data-action="noop">Fare rules</div>' +
        '<div class="fare-tier-card__attrs">' +
          '<div class="fare-tier-card__attr"><span>Baggage</span><span>' + t.baggage + '</span></div>' +
          '<div class="fare-tier-card__attr"><span>Changes</span><span>' + t.changes + '</span></div>' +
          '<div class="fare-tier-card__attr"><span>Refund</span><span>' + t.refund + '</span></div>' +
        '</div>' +
        '<div class="fare-tier-card__price">' + fmtMoney(t.price) + ' EUR</div>' +
      '</div>';
    }).join('');

    var content = '' +
      '<div class="back-link" data-action="back-to-results">&larr; Back to results</div>' +
      '<h1 class="offer-flight-heading">Flight to ' + escapeHtml(destCity) + '</h1>' +
      '<p class="offer-flight-sub">On the way ' + totalDuration + '</p>' +
      '<div class="segment-card" data-action="copy-option">' + segHtml + '<div class="segment-card__copy">Click to copy option</div></div>' +

      '<div class="section-title">Fare</div>' +
      '<div class="fare-tier-grid">' + tiersHtml + '</div>' +

      '<div class="section-title">Ancillaries</div>' +
      '<div class="section-desc">Book additional services for a comfortable journey of passengers.</div>' +
      '<div class="ancillary-grid">' +
        '<div class="ancillary-card"><div class="ancillary-card__top"><span class="ancillary-card__name">Baggage</span><span class="ancillary-card__price">from 40 EUR</span></div><div class="ancillary-card__desc">Book additional baggage</div></div>' +
        '<div class="ancillary-card"><div class="ancillary-card__top"><span class="ancillary-card__name">Seats</span><span class="ancillary-card__price">from 0 EUR</span></div><div class="ancillary-card__desc">Book your passengers\' favorite seats</div></div>' +
      '</div>' +

      '<div class="section-title">Adult</div>' +
      '<div class="section-desc">Enter the data in Latin as specified in the document.</div>' +
      '<div class="adult-form-grid">' +
        '<div><span class="field-caption">Last name</span><input class="text-field" data-field="offerDraft.lastName" value="' + escapeHtml(d.lastName) + '"></div>' +
        '<div><span class="field-caption">First name</span><input class="text-field" data-field="offerDraft.firstName" value="' + escapeHtml(d.firstName) + '"></div>' +
        '<div><span class="field-caption">Gender</span><div class="gender-toggle">' +
          '<div class="gender-toggle__opt' + (d.gender === 'M' ? ' is-selected' : '') + '" data-action="set-gender" data-value="M">M</div>' +
          '<div class="gender-toggle__opt' + (d.gender === 'F' ? ' is-selected' : '') + '" data-action="set-gender" data-value="F">F</div>' +
        '</div></div>' +
        '<div><span class="field-caption">Date of birth</span><input class="text-field" data-field="offerDraft.dob" placeholder="DD.MM.YYYY" value="' + escapeHtml(d.dob) + '"></div>' +
      '</div>' +

      '<div class="fare-recap-box">' +
        '<div class="fare-recap-box__name">' + selectedTier.name + '</div>' +
        (selectedTier.code ? '<div class="fare-recap-box__code">' + selectedTier.code + '</div>' : '') +
        '<div class="fare-recap-box__rules" data-action="noop">Fare rules</div>' +
        '<div class="fare-recap-box__attrs">' +
          '<div class="fare-recap-box__attr"><span>Baggage</span><span>' + selectedTier.baggage + '</span></div>' +
          '<div class="fare-recap-box__attr"><span>Changes</span><span>' + selectedTier.changes + '</span></div>' +
          '<div class="fare-recap-box__attr"><span>Refund</span><span>' + selectedTier.refund + '</span></div>' +
        '</div>' +
      '</div>' +

      '<div class="recap-block"><div class="recap-block__label">Adult</div><div class="recap-block__value">' + escapeHtml((d.lastName + ' ' + d.firstName).trim() || '—') + '</div></div>' +

      '<div class="section-title">Contact information</div>' +
      '<div class="section-desc">Enter passenger\'s contact information</div>' +
      '<div class="adult-form-grid" style="grid-template-columns:repeat(2,1fr);max-width:640px">' +
        '<div><span class="field-caption">Email</span><input class="text-field" data-field="offerDraft.email" value="' + escapeHtml(d.email) + '"></div>' +
        '<div><span class="field-caption">Phone number</span><input class="text-field" data-field="offerDraft.phone" value="' + escapeHtml(d.phone) + '"></div>' +
      '</div>' +

      '<div class="price-summary">' +
        '<div class="price-summary__row"><span>Adult</span><span>' + fmtMoney(selectedTier.price) + ' EUR</span></div>' +
        '<div class="price-summary__row is-total"><span>Total</span><span>' + fmtMoney(selectedTier.price) + ' EUR</span></div>' +
      '</div>' +
      '<div style="max-width:640px;margin-top:20px"><div class="btn-outline-block" data-action="submit-book">Book</div></div>' +
      '<div style="height:60px"></div>';

    if (state.offerLoading) {
      return '<div class="ghost-loading-wrap"><div class="ghost-loading-wrap__content">' + content + '</div>' +
        '<div class="ghost-loading-wrap__loader"><div class="loader-dots"><span></span><span></span><span></span></div></div></div>';
    }
    return content;
  }

  function renderSegRow(logo, depTime, depName, depCode, arrTime, arrName, arrCode, captionHtml) {
    return '<div class="segment-row">' +
      '<div class="segment-row__logo"><img src="' + logo + '" alt=""></div>' +
      '<div class="segment-row__lines">' +
        '<div class="segment-row__line"><span class="segment-row__time">' + depTime + '</span><span class="segment-row__airport">' + escapeHtml(depName) + ', ' + depCode + '</span></div>' +
        '<div class="segment-row__line"><span class="segment-row__time">' + arrTime + '</span><span class="segment-row__airport">' + escapeHtml(arrName) + ', ' + arrCode + '</span></div>' +
        '<div class="segment-row__caption">' + captionHtml + '</div>' +
      '</div>' +
    '</div>';
  }

  /* ----------------------------------------------------------------
     RENDER: BOOKINGS
  ---------------------------------------------------------------- */
  function renderBookings() {
    var tabOrder = ['find', 'booked', 'inprogress', 'issued'];
    var tabLabels = { find: 'Find', booked: 'Booked', inprogress: 'In progress', issued: 'Issued' };
    var tabsHtml = tabOrder.map(function (t) {
      return '<div class="filter-toggle' + (state.bookingsTab === t ? ' active' : '') + '" data-action="set-bookings-tab" data-tab="' + t + '">' + tabLabels[t] + '</div>';
    }).join('');

    var items = bookingsListItems();
    var listHtml = items.length ? items.map(renderBookingListRow).join('') : '<div class="empty-note">No items in this view.</div>';

    var pillHtml = state.pillToast
      ? '<div class="pill-toast"><span>' + escapeHtml(state.pillToast.text) + '</span><span class="pill-toast__close" data-action="dismiss-pill-toast">&times;</span></div>'
      : '';

    return '' +
      '<div class="page-head"><div class="page-head__top" style="align-items:center"><h1>Bookings</h1>' + pillHtml + '</div></div>' +
      '<div class="bookings-tabs">' + tabsHtml + '</div>' +
      '<div class="bookings-layout">' +
        '<div class="bookings-list">' + listHtml + '</div>' +
        '<div class="bookings-detail">' + renderBookingDetailPanel() + '</div>' +
      '</div>';
  }

  function bookingsListItems() {
    var items = [];
    if (state.bookingsTab === 'booked') {
      state.bookings.forEach(function (b) { items.push({ kind: 'regular', data: b }); });
      items = items.concat(groupRowsForStatuses(['accepted']));
    } else if (state.bookingsTab === 'inprogress') {
      state.bookings.filter(function (b) { return b.status === 'inprogress'; }).forEach(function (b) { items.push({ kind: 'regular', data: b }); });
      items = items.concat(groupRowsForStatuses(['calculating', 'review', 'declined']));
    } else if (state.bookingsTab === 'issued') {
      state.bookings.filter(function (b) { return b.status === 'issued'; }).forEach(function (b) { items.push({ kind: 'regular', data: b }); });
    }
    return items;
  }

  function groupRowsForStatuses(statuses) {
    var rows = [];
    state.groupRequests.forEach(function (req) {
      var matching = req.offers.filter(function (o) { return statuses.indexOf(o.status) !== -1; });
      if (!matching.length) return;
      rows.push({ kind: 'group-header', request: req });
      matching.forEach(function (o) { rows.push({ kind: 'group', request: req, offer: o }); });
    });
    return rows;
  }

  function statusPillHtml(cls, label) {
    return '<div class="status-pill status-pill--' + cls + '"><span class="dot"></span>' + label + '</div>';
  }

  function renderBookingListRow(item) {
    if (item.kind === 'group-header') {
      var hr = item.request;
      return '<div class="booking-group-header">Group request #' + hr.id + ' · ' + hr.fromCode + ' → ' + hr.toCode + ' · ' + hr.pax + ' passengers</div>';
    }
    if (item.kind === 'group') {
      var o = item.offer, req = item.request, a = groupAirlineById(o.airlineId);
      var statusLabels = { calculating: 'Calculating', review: 'Review required', accepted: 'Accepted', declined: 'Declined' };
      var sel = state.bookingsSelected && state.bookingsSelected.kind === 'group' && state.bookingsSelected.requestId === req.id && state.bookingsSelected.airlineId === o.airlineId;
      var priceHtml = o.total ? fmtMoney(o.total) + ' ' + o.currency : '';
      return '<div class="booking-list-row' + (sel ? ' is-selected' : '') + '" data-action="select-booking" data-kind="group" data-request="' + req.id + '" data-airline="' + o.airlineId + '">' +
        '<div class="booking-list-row__top"><span class="booking-list-row__name">' + escapeHtml(a.name) + '</span><span class="booking-list-row__price">' + priceHtml + '</span></div>' +
        '<div class="booking-list-row__bottom"><span>' + formatFieldDate(req.departure) + ' – ' + formatFieldDate(req.ret) + '</span>' + statusPillHtml(o.status, statusLabels[o.status]) + '</div>' +
      '</div>';
    }
    var b = item.data;
    var selected = state.bookingsSelected && state.bookingsSelected.kind === 'regular' && state.bookingsSelected.id === b.id;
    return '<div class="booking-list-row' + (selected ? ' is-selected' : '') + '" data-action="select-booking" data-kind="regular" data-id="' + b.id + '">' +
      '<div class="booking-list-row__top"><span class="booking-list-row__name">' + escapeHtml(b.passengerName) + '</span><span class="booking-list-row__price">' + fmtMoney(b.price) + ' ' + b.currency + '</span></div>' +
      '<div class="booking-list-row__bottom"><span>' + formatRowDate(b.departure, b.depTime) + ', ' + b.fromCode + '-' + b.toCode + '</span><span>' + escapeHtml(b.till) + '</span></div>' +
    '</div>';
  }

  function renderGroupBookingSummary(req, o) {
    var a = groupAirlineById(o.airlineId);
    var statusLabels = { calculating: 'Calculating', review: 'Review required', accepted: 'Accepted', declined: 'Declined' };
    var body;
    if (o.status === 'calculating') {
      body = '<div class="booking-detail__section"><p class="desc">The airline is preparing a group offer. Usually within 24 hours.</p></div>';
    } else if (o.status === 'review') {
      body = '<div class="price-summary" style="align-items:flex-start"><div class="price-summary__row is-total"><span>Total price</span><span>' + fmtMoney(o.total) + ' ' + o.currency + '</span></div></div>' +
        '<div class="booking-detail__section"><p class="desc">Decision deadline: ' + formatDisplay(toISO(o.acceptBy)) + '</p></div>' +
        '<button class="btn btn-primary" style="margin-top:16px" data-action="open-group-offer" data-request="' + req.id + '" data-airline="' + a.id + '">Review offer</button>';
    } else if (o.status === 'accepted') {
      body = '<div class="price-summary" style="align-items:flex-start"><div class="price-summary__row is-total"><span>Total price</span><span>' + fmtMoney(o.total) + ' ' + o.currency + '</span></div></div>' +
        '<div class="booking-detail__section"><p class="desc">Deposit due ' + formatDisplay(toISO(o.depositBy)) + '</p></div>' +
        '<button class="btn btn-secondary" style="margin-top:16px" data-action="open-group-offer" data-request="' + req.id + '" data-airline="' + a.id + '">View offer</button>';
    } else {
      body = (o.declineReason ? '<div class="booking-detail__section"><p class="desc">' + escapeHtml(o.declineReason) + '</p></div>' : '') +
        '<button class="btn btn-ghost" style="margin-top:16px" data-action="open-group-offer" data-request="' + req.id + '" data-airline="' + a.id + '">View details</button>';
    }
    return '<div class="booking-detail__banner booking-detail__banner--' + o.status + '">' + statusLabels[o.status] + '</div>' +
      '<div class="booking-detail__body">' +
        '<h2 class="offer-flight-heading">' + req.fromCode + ' → ' + req.toCode + '</h2>' +
        '<p class="offer-flight-sub">' + formatFieldDate(req.departure) + ' – ' + formatFieldDate(req.ret) + ' · ' + req.pax + ' passengers · Group request #' + req.id + '</p>' +
        '<div class="segment-row" style="margin-top:4px">' +
          '<div class="segment-row__logo"><img src="' + a.logo + '" alt=""></div>' +
          '<div class="segment-row__lines"><div class="segment-row__line"><span class="segment-row__airport">' + escapeHtml(a.name) + '</span></div></div>' +
        '</div>' +
        body +
      '</div>';
  }

  function renderBookingDetailPanel() {
    var sel = state.bookingsSelected;
    if (!sel) return '<div class="empty-note">Select a booking to see details.</div>';
    if (sel.kind === 'group') {
      var req = state.groupRequests.filter(function (r) { return r.id === sel.requestId; })[0];
      var o = req && req.offers.filter(function (x) { return x.airlineId === sel.airlineId; })[0];
      return (req && o) ? renderGroupBookingSummary(req, o) : '<div class="empty-note">Select a booking to see details.</div>';
    }
    var b = state.bookings.filter(function (x) { return x.id === sel.id; })[0];
    if (!b) return '<div class="empty-note">Select a booking to see details.</div>';
    var a = AIRLINES[b.airlineId];
    var bannerLabel = { inprogress: 'In Progress', booked: 'Booked', issued: 'Issued' }[b.status] || 'In Progress';

    var segHtml = b.segments.map(function (s, i) {
      var row = renderSegRowDated(a.logo, s.dep, s.depName, s.depCode, s.date, s.arr, s.arrName, s.arrCode, s.date, a.name + ', ' + s.flightNo + ', duration ' + s.duration);
      return (i > 0 ? '<div class="segment-connection">Connection ' + b.connection + '</div>' : '') + row;
    }).join('');

    return '' +
      '<div class="booking-detail__banner booking-detail__banner--' + b.status + '">' + bannerLabel + '</div>' +
      '<div class="booking-detail__body">' +
        '<h2 class="offer-flight-heading">Flight to ' + escapeHtml(b.city) + '</h2>' +
        '<p class="offer-flight-sub">On the way ' + b.totalDuration + '</p>' +
        '<div class="segment-card" data-action="copy-option">' + segHtml + '<div class="segment-card__copy">Click to copy option</div></div>' +
        '<div class="fare-box">' +
          '<div class="fare-box__name">' + b.fareTier.name + '</div>' +
          (b.fareTier.code ? '<div class="fare-box__code">' + b.fareTier.code + '</div>' : '') +
          '<div class="fare-box__rules" data-action="noop">Fare rules</div>' +
          '<div class="fare-box__attrs">' +
            '<div class="fare-box__attr"><span>Baggage</span><span>' + b.fareTier.baggage + '</span></div>' +
            '<div class="fare-box__attr"><span>Changes</span><span>' + b.fareTier.changes + '</span></div>' +
            '<div class="fare-box__attr"><span>Refund</span><span>' + b.fareTier.refund + '</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="booking-detail__section"><h3>Adult</h3><p>' + escapeHtml(b.passengerFullName) + '</p></div>' +
        '<div class="booking-detail__section"><h3>Contact information</h3><p class="desc">Enter passenger\'s contact information</p>' +
          '<div class="adult-form-grid" style="grid-template-columns:repeat(2,1fr);max-width:640px">' +
            '<div><span class="field-caption">Email</span><input class="text-field" data-field="__noop" value="' + escapeHtml(b.contactEmail) + '"></div>' +
            '<div><span class="field-caption">Phone number</span><input class="text-field" data-field="__noop" value="' + escapeHtml(b.contactPhone) + '"></div>' +
          '</div>' +
        '</div>' +
        '<div class="price-summary">' +
          '<div class="price-summary__row"><span>Adult</span><span>' + fmtMoney(b.price) + ' EUR</span></div>' +
          '<div class="price-summary__row is-total"><span>Total</span><span>' + fmtMoney(b.price) + ' EUR</span></div>' +
        '</div>' +
      '</div>';
  }

  function renderSegRowDated(logo, depTime, depName, depCode, depDate, arrTime, arrName, arrCode, arrDate, captionHtml) {
    return '<div class="segment-row">' +
      '<div class="segment-row__logo"><img src="' + logo + '" alt=""></div>' +
      '<div class="segment-row__lines">' +
        '<div class="segment-row__line"><span class="segment-row__time">' + depTime + '</span><span class="segment-row__airport">' + escapeHtml(depName) + ', ' + depCode + '</span><span class="segment-row__date">' + formatFieldDate(depDate) + '</span></div>' +
        '<div class="segment-row__line"><span class="segment-row__time">' + arrTime + '</span><span class="segment-row__airport">' + escapeHtml(arrName) + ', ' + arrCode + '</span><span class="segment-row__date">' + formatFieldDate(arrDate) + '</span></div>' +
        '<div class="segment-row__caption">' + captionHtml + '</div>' +
      '</div>' +
    '</div>';
  }

  /* ----------------------------------------------------------------
     EVENT HANDLERS
  ---------------------------------------------------------------- */
  var POPOVER_ACTIONS = ['open-airport-field', 'select-airport', 'open-calendar-field', 'calendar-nav', 'select-date', 'calendar-skip-return', 'noop'];

  function closeAllPaxPops() {
    state.regular.paxOpen = false;
    state.group.paxOpen = false;
    if (state.requestDraft) state.requestDraft.paxOpen = false;
  }

  function anyPaxOpen() {
    return state.regular.paxOpen || state.group.paxOpen || (state.requestDraft && state.requestDraft.paxOpen);
  }

  var AIRLINE_FILTER_ACTIONS = ['toggle-airline-filter', 'toggle-select-airline', 'noop'];

  function onClick(e) {
    var el = e.target.closest('[data-action]');
    if (!el) {
      var pax = document.querySelector('.search-field--pax');
      if (anyPaxOpen() && (!pax || !pax.contains(e.target))) { closeAllPaxPops(); render(); return; }
      if (state.airlineFilterOpen) { state.airlineFilterOpen = false; render(); return; }
      if (state.openPopover) { state.openPopover = null; render(); }
      return;
    }
    var action = el.dataset.action;
    if (state.openPopover && POPOVER_ACTIONS.indexOf(action) === -1) state.openPopover = null;
    if (state.airlineFilterOpen && AIRLINE_FILTER_ACTIONS.indexOf(action) === -1) state.airlineFilterOpen = false;

    switch (action) {
      case 'noop': break;

      case 'set-tab':
        state.searchTab = el.dataset.tab;
        closeAllPaxPops();
        state.openPopover = null;
        render();
        break;

      case 'toggle-pax-regular': {
        var wasOpenR = state.regular.paxOpen;
        closeAllPaxPops();
        state.regular.paxOpen = !wasOpenR;
        render();
        break;
      }

      case 'pax-step': {
        var key = el.dataset.key, dir = +el.dataset.dir, min = +el.dataset.min, max = +el.dataset.max;
        state.regular[key] = Math.max(min, Math.min(max, state.regular[key] + dir));
        state.regular.paxOpen = true;
        render();
        break;
      }

      case 'swap-regular': {
        var tmp = state.regular.from; state.regular.from = state.regular.to; state.regular.to = tmp;
        var tmpC = state.regular.fromCode; state.regular.fromCode = state.regular.toCode; state.regular.toCode = tmpC;
        render();
        break;
      }

      case 'open-airport-field': {
        var afKey = el.dataset.field;
        if (state.openPopover && state.openPopover.type === 'airport' && state.openPopover.field === afKey) break;
        state.openPopover = { type: 'airport', field: afKey, query: get(afKey, state) || '' };
        closeAllPaxPops();
        render();
        break;
      }

      case 'select-airport': {
        var selField = state.openPopover.field;
        set(selField, el.dataset.name, state);
        set(selField + 'Code', el.dataset.code, state);
        state.openPopover = null;
        render();
        break;
      }

      case 'open-calendar-field': {
        var cfKey = el.dataset.field;
        if (state.openPopover && state.openPopover.type === 'calendar' && state.openPopover.field === cfKey) break;
        var curIso = get(cfKey, state);
        var base = curIso ? parseISO(curIso) : TODAY;
        state.openPopover = { type: 'calendar', field: cfKey, calYear: base.getFullYear(), calMonth: base.getMonth(), minISO: el.dataset.min, isReturn: el.dataset.return === '1' };
        closeAllPaxPops();
        render();
        break;
      }

      case 'calendar-nav': {
        var dirc = +el.dataset.dir;
        var mm = state.openPopover.calMonth + dirc, yy = state.openPopover.calYear;
        if (mm < 0) { mm = 11; yy--; } else if (mm > 11) { mm = 0; yy++; }
        state.openPopover.calMonth = mm; state.openPopover.calYear = yy;
        render();
        break;
      }

      case 'select-date': {
        var dfKey = el.dataset.field, dIso = el.dataset.date;
        set(dfKey, dIso, state);
        state.openPopover = null;
        if (dfKey.indexOf('.departure') !== -1) {
          var ns = dfKey.split('.')[0];
          var retPath = ns + '.return';
          var retVal = get(retPath, state);
          if (retVal && parseISO(retVal) < parseISO(dIso)) set(retPath, '', state);
          state.openPopover = { type: 'calendar', field: retPath, calYear: parseISO(dIso).getFullYear(), calMonth: parseISO(dIso).getMonth(), minISO: dIso, isReturn: true };
        }
        render();
        break;
      }

      case 'calendar-skip-return':
        set(el.dataset.field, '', state);
        state.openPopover = null;
        render();
        break;

      case 'regular-search-submit': {
        state.searchLoading = true;
        render();
        setTimeout(function () {
          var r = state.regular;
          state.resultsQuery = {
            fromCode: r.fromCode || guessCode(r.from, 'WAW'),
            toCode: r.toCode || guessCode(r.to, 'CDG'),
            departure: r.departure || toISO(TODAY)
          };
          state.searchLoading = false;
          state.searchScreen = 'results';
          render();
        }, 700);
        break;
      }

      case 'set-result-filter':
        state.resultsFilters[el.dataset.group] = el.dataset.value;
        render();
        break;

      case 'open-offer': {
        var flight = flightById(el.dataset.flight);
        var fareKey = el.dataset.fare;
        state.currentOffer = { flightId: flight.id };
        state.offerDraft = { fareTier: fareKey, lastName: 'ELON', firstName: 'MUSK', gender: 'M', dob: '28.06.1988', email: 'DDM@DRCT.AERO', phone: '684526545' };
        state.page = 'offer-details';
        window.scrollTo(0, 0);
        render();
        break;
      }

      case 'back-to-results':
        state.page = 'search';
        window.scrollTo(0, 0);
        render();
        break;

      case 'select-fare-tier':
        state.offerDraft.fareTier = el.dataset.tier;
        render();
        break;

      case 'set-gender':
        state.offerDraft.gender = el.dataset.value;
        render();
        break;

      case 'copy-option':
        pushToast({ title: 'Copied to clipboard', duration: 1800 });
        break;

      /* ---------------- GROUP BOOKING FLOW ---------------- */

      case 'try-group-fares':
        state.group.from = state.regular.from;
        state.group.to = state.regular.to;
        state.group.fromCode = state.regular.fromCode;
        state.group.toCode = state.regular.toCode;
        state.group.departure = state.regular.departure;
        state.group.return = state.regular.return;
        state.group.pax = 10;
        state.regular.paxOpen = false;
        state.searchTab = 'groups';
        state.groupsScreen = 'form';
        render();
        break;

      case 'swap-group': {
        var tmpg = state.group.from; state.group.from = state.group.to; state.group.to = tmpg;
        var tmpgC = state.group.fromCode; state.group.fromCode = state.group.toCode; state.group.toCode = tmpgC;
        render();
        break;
      }

      case 'toggle-pax-group': {
        var wasOpenG = state.group.paxOpen;
        closeAllPaxPops();
        state.group.paxOpen = !wasOpenG;
        render();
        break;
      }

      case 'group-pax-step':
        state.group.pax = Math.max(10, state.group.pax + (+el.dataset.dir));
        state.group.paxOpen = true;
        render();
        break;

      case 'group-search-submit': {
        var gerrs = validateGroupForm();
        state.groupErrors = gerrs;
        if (Object.keys(gerrs).length) { render(); break; }
        state.groupSubmitState = 'loading';
        render();
        setTimeout(function () {
          state.groupSubmitState = 'idle';
          var g = state.group;
          state.groupResultsQuery = {
            from: g.from, to: g.to,
            fromCode: g.fromCode || guessCode(g.from, 'WAW'),
            toCode: g.toCode || guessCode(g.to, 'CDG'),
            departure: g.departure, return: g.return, pax: g.pax
          };
          state.groupsScreen = 'results';
          state.groupFilter = 'all';
          render();
        }, 800);
        break;
      }

      case 'set-group-filter':
        state.groupFilter = el.dataset.filter;
        render();
        break;

      case 'toggle-airline-filter':
        state.airlineFilterOpen = !state.airlineFilterOpen;
        render();
        break;

      case 'toggle-select-airline': {
        var aid = el.dataset.airline;
        var idx = state.selectedAirlineIds.indexOf(aid);
        if (idx !== -1) {
          state.selectedAirlineIds.splice(idx, 1);
        } else if (state.selectedAirlineIds.length >= 3) {
          pushToast({ title: 'You can select up to 3 airlines', text: 'Remove one of the selected airlines to choose another.' });
          break;
        } else {
          state.selectedAirlineIds.push(aid);
        }
        render();
        break;
      }

      case 'create-request': {
        if (state.selectedAirlineIds.length === 0) break;
        var q = state.groupResultsQuery;
        state.requestDraft = {
          from: q.from, to: q.to, fromCode: q.fromCode, toCode: q.toCode,
          departure: q.departure, return: q.return, pax: q.pax, paxOpen: false,
          airlineIds: state.selectedAirlineIds.slice(),
          dateFlexibility: null, tripReason: null, baggage: '', comments: ''
        };
        state.builderStep = 1;
        state.builderErrors = {};
        state.builderSubmitState = 'idle';
        state.page = 'request-builder';
        window.scrollTo(0, 0);
        render();
        break;
      }

      case 'swap-builder': {
        var tmpb = state.requestDraft.from; state.requestDraft.from = state.requestDraft.to; state.requestDraft.to = tmpb;
        var tmpbC = state.requestDraft.fromCode; state.requestDraft.fromCode = state.requestDraft.toCode; state.requestDraft.toCode = tmpbC;
        render();
        break;
      }

      case 'toggle-pax-builder': {
        var wasOpenB = state.requestDraft.paxOpen;
        closeAllPaxPops();
        state.requestDraft.paxOpen = !wasOpenB;
        render();
        break;
      }

      case 'builder-pax-step':
        state.requestDraft.pax = Math.max(10, state.requestDraft.pax + (+el.dataset.dir));
        state.requestDraft.paxOpen = true;
        render();
        break;

      case 'remove-builder-airline': {
        var rid = el.dataset.airline;
        if (state.requestDraft.airlineIds.length > 1) {
          state.requestDraft.airlineIds = state.requestDraft.airlineIds.filter(function (id) { return id !== rid; });
        }
        render();
        break;
      }

      case 'set-flex':
        state.requestDraft.dateFlexibility = el.dataset.value;
        render();
        break;

      case 'set-reason':
        state.requestDraft.tripReason = el.dataset.value;
        render();
        break;

      case 'builder-continue':
        if (!isStep1Valid()) { state.builderErrors = { general: 1 }; render(); break; }
        state.builderErrors = {};
        state.builderStep = 2;
        window.scrollTo(0, 0);
        render();
        break;

      case 'builder-back-to-results':
        state.page = 'search';
        window.scrollTo(0, 0);
        render();
        break;

      case 'builder-back-step1':
        state.builderStep = 1;
        window.scrollTo(0, 0);
        render();
        break;

      case 'builder-error-back':
        state.builderSubmitState = 'idle';
        render();
        break;

      case 'submit-request': {
        state.builderSubmitState = 'submitting';
        render();
        setTimeout(function () {
          var d = state.requestDraft;
          var failTrigger = /fail/i.test(d.baggage) || /fail/i.test(d.comments);
          if (failTrigger) {
            state.builderSubmitState = 'error';
            render();
            return;
          }
          var reqId = 'GR-' + (state.requestCounter++);
          state.groupRequests.push({
            id: reqId, from: d.from, to: d.to, fromCode: d.fromCode, toCode: d.toCode,
            departure: d.departure, ret: d.return, pax: d.pax, createdAt: new Date(),
            dateFlexibility: d.dateFlexibility, tripReason: d.tripReason, baggage: d.baggage, comments: d.comments,
            offers: d.airlineIds.map(function (id) { return { airlineId: id, status: 'calculating' }; })
          });
          state.builderSubmitState = 'success';
          render();
        }, 900);
        break;
      }

      case 'goto-bookings-from-success':
        state.page = 'bookings';
        state.bookingsTab = 'inprogress';
        state.bookingsSelected = null;
        window.scrollTo(0, 0);
        render();
        break;

      case 'open-group-offer':
        state.currentGroupOffer = { requestId: el.dataset.request, airlineId: el.dataset.airline };
        state.page = 'group-offer-details';
        window.scrollTo(0, 0);
        render();
        break;

      case 'offer-back-to-bookings':
        state.page = 'bookings';
        window.scrollTo(0, 0);
        render();
        break;

      case 'accept-offer': {
        var acceptFound = groupOfferLookup(state.currentGroupOffer);
        var acceptOffer = acceptFound.o;
        state.acceptProcessing = true;
        render();
        setTimeout(function () {
          state.acceptProcessing = false;
          acceptOffer.status = 'accepted';
          acceptOffer.acceptedAt = new Date();
          render();
          pushToast({
            title: 'Offer accepted', text: acceptFound.a.name + ' — request #' + acceptFound.req.id,
            actionLabel: 'Undo', duration: 5000,
            onAction: function () { acceptOffer.status = 'review'; delete acceptOffer.acceptedAt; render(); }
          });
        }, 700);
        break;
      }

      case 'open-decline-modal':
        state.declineModal = { requestId: state.currentGroupOffer.requestId, airlineId: state.currentGroupOffer.airlineId, reason: '', comment: '', error: false };
        render();
        break;

      case 'close-decline-modal':
      case 'close-decline-modal-overlay':
        state.declineModal = null;
        render();
        break;

      case 'confirm-decline': {
        var m = state.declineModal;
        if (!m.reason) { m.error = true; render(); break; }
        var declineFound = groupOfferLookup({ requestId: m.requestId, airlineId: m.airlineId });
        var declineOffer = declineFound.o;
        declineOffer.status = 'declined';
        declineOffer.declineReason = m.reason;
        declineOffer.declineComment = m.comment;
        state.declineModal = null;
        render();
        pushToast({
          title: 'Offer declined', text: declineFound.a.name + ' — request #' + declineFound.req.id,
          actionLabel: 'Undo', duration: 5000,
          onAction: function () { declineOffer.status = 'review'; delete declineOffer.declineReason; delete declineOffer.declineComment; render(); }
        });
        break;
      }

      case 'toast-action': {
        var tid = el.dataset.toast;
        var t = state.toasts.filter(function (x) { return x.id === tid; })[0];
        if (t && t.onAction) t.onAction();
        removeToast(tid);
        break;
      }

      /* ------------------------------------------------------ */

      case 'submit-book': {
        state.offerLoading = true;
        render();
        setTimeout(function () {
          var f = flightById(state.currentOffer.flightId);
          var a = AIRLINES[f.airlineId];
          var d = state.offerDraft;
          var tiers = f.fareTiers || genericFareTiers(f);
          var selectedTier = tiers.filter(function (t) { return t.key === d.fareTier; })[0] || tiers[0];
          var newId = 'BK-' + (state.bookings.length + 1);
          var segs = f.connecting ? f.segments.map(function (s) { return Object.assign({}, s, { date: state.resultsQuery.departure || toISO(TODAY) }); })
            : [{ dep: f.dep, depName: 'Warsaw Chopin Airport', depCode: 'WAW', arr: f.arr, arrName: 'Charles de Gaulle Intl', arrCode: 'CDG', flightNo: f.flightNo, duration: f.duration, date: state.resultsQuery.departure || toISO(TODAY) }];
          state.bookings.unshift({
            id: newId, passengerName: (d.lastName + ' ' + d.firstName).trim().toUpperCase() || 'PASSENGER',
            status: 'inprogress', departure: segs[0].date, depTime: segs[0].dep, fromCode: segs[0].depCode, toCode: segs[segs.length - 1].arrCode,
            price: selectedTier.price, currency: 'EUR', till: 'till ' + formatRowDate(addDaysStr(segs[0].date, -8), '09:00'),
            city: f.connecting ? cityByAirportName(segs[segs.length - 1].arrName) : 'Paris',
            totalDuration: f.connecting ? f.duration : f.duration,
            segments: segs, connection: f.connection || null,
            fareTier: { name: selectedTier.name, code: selectedTier.code, baggage: selectedTier.baggage, changes: selectedTier.changes, refund: selectedTier.refund },
            passengerFullName: (d.lastName + ' ' + d.firstName).trim(), contactEmail: d.email, contactPhone: d.phone,
            airlineId: f.airlineId
          });
          state.offerLoading = false;
          state.page = 'bookings';
          state.bookingsTab = 'booked';
          state.bookingsSelected = { kind: 'regular', id: newId };
          state.pillToast = { text: 'The booking creation is in progress' };
          window.scrollTo(0, 0);
          render();
        }, 1300);
        break;
      }

      case 'set-bookings-tab':
        state.bookingsTab = el.dataset.tab;
        render();
        break;

      case 'select-booking':
        if (el.dataset.kind === 'group') {
          state.bookingsSelected = { kind: 'group', requestId: el.dataset.request, airlineId: el.dataset.airline };
        } else {
          state.bookingsSelected = { kind: 'regular', id: el.dataset.id };
        }
        render();
        break;

      case 'dismiss-pill-toast':
        state.pillToast = null;
        render();
        break;

      case 'toast-close':
        removeToast(el.dataset.toast);
        break;
    }
  }

  function addDaysStr(iso, n) { return toISO(addDays(parseISO(iso), n)); }

  function onInput(e) {
    if (e.target.hasAttribute('data-airport-input')) {
      var afField = e.target.dataset.field;
      var query = e.target.value;
      set(afField, query, state);
      set(afField + 'Code', '', state);
      if (state.openPopover) state.openPopover.query = query;
      var listEl = document.querySelector('.field-pop--airport .field-pop__list');
      if (listEl) listEl.innerHTML = renderAirportGroups(query);
      return;
    }
    var field = e.target.dataset.field;
    if (!field || field === '__noop') return;
    set(field, e.target.value, state);
  }

  function onChange(e) {
    var field = e.target.dataset.field;
    if (!field) return;
    set(field, e.target.value, state);
    if (field === 'declineModal.reason') {
      state.declineModal.error = false;
      var sel = e.target;
      sel.classList.remove('is-invalid');
      var errBox = sel.parentElement.querySelector('.field-error');
      if (errBox) errBox.remove();
    }
  }

  document.addEventListener('click', onClick);
  document.addEventListener('input', onInput);
  document.addEventListener('change', onChange);
  document.getElementById('navSearch').addEventListener('click', function () {
    state.page = 'search';
    window.scrollTo(0, 0);
    render();
  });
  document.getElementById('navBookings').addEventListener('click', function () {
    state.page = 'bookings';
    window.scrollTo(0, 0);
    render();
  });

  render();
})();
