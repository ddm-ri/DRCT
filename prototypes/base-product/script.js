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
    resultsFilters: { type: 'all', sort: 'optimal', bag: 'without' },
    currentOffer: null,
    offerDraft: null,
    offerLoading: false,
    bookingsTab: 'booked',
    bookingsSelected: null,
    bookings: [],
    pillToast: null,
    toasts: [],
    openPopover: null
  };
  window.__DRCT_STATE__ = state;

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
    state.bookingsSelected = 'BK-2';
  })();

  /* ----------------------------------------------------------------
     TOASTS
  ---------------------------------------------------------------- */
  var toastSeq = 1;
  function pushToast(opts) {
    var id = 'toast-' + (toastSeq++);
    var toast = { id: id, title: opts.title, text: opts.text || '', timer: null };
    state.toasts.push(toast);
    toast.timer = setTimeout(function () { removeToast(id); }, opts.duration || 2600);
    renderToasts();
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
        '<button class="toast__close" data-action="toast-close" data-toast="' + t.id + '" aria-label="Dismiss">&times;</button>' +
      '</div>';
    }).join('');
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
    }
    renderToasts();
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
    var isSearchArea = (state.page === 'search' || state.page === 'offer-details');
    document.getElementById('navSearch').className = 'app-header__link' + (isSearchArea ? ' active' : '');
    document.getElementById('navBookings').className = 'app-header__link' + (state.page === 'bookings' ? ' active' : '');
  }

  /* ----------------------------------------------------------------
     RENDER: SEARCH PAGE
  ---------------------------------------------------------------- */
  function renderSearchPage() {
    var tabs = ['copilot', 'form', 'terminal'];
    var labels = { copilot: 'Copilot', form: 'Form', terminal: 'Terminal' };
    var tabsHtml = tabs.map(function (t) {
      return '<div class="local-tabs__tab' + (state.searchTab === t ? ' active' : '') + '" data-action="set-tab" data-tab="' + t + '">' + labels[t] + '</div>';
    }).join('');

    var body;
    if (state.searchTab !== 'form') {
      body = '<div class="empty-note" style="padding-top:60px">This section is not part of this recreation.<br>Use the <strong>FORM</strong> tab to continue.</div>';
    } else if (state.searchScreen === 'results') {
      body = renderResults();
    } else {
      body = renderRegularForm();
    }

    return '' +
      '<div class="page-head">' +
        '<div class="page-head__top">' +
          '<div><h1>Search</h1><p class="page-head__desc">Look for, book and issue tickets to any destination in the world.</p></div>' +
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
    return '<div class="pax-pop" data-action="noop">' +
      paxRow('Adults', 'Over 12 years old', 'adults', r.adults, 1, 9) +
      paxRow('Children', 'From 2 to 12 years', 'children', r.children, 0, 8) +
      paxRow('Infants', 'Up to 2 years, no seat', 'infants', r.infants, 0, 8) +
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
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>';
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
    var d = dir === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6';
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
    if (state.bookingsTab === 'booked') return state.bookings;
    if (state.bookingsTab === 'inprogress') return state.bookings.filter(function (b) { return b.status === 'inprogress'; });
    if (state.bookingsTab === 'issued') return state.bookings.filter(function (b) { return b.status === 'issued'; });
    return [];
  }

  function renderBookingListRow(b) {
    var selected = state.bookingsSelected === b.id;
    return '<div class="booking-list-row' + (selected ? ' is-selected' : '') + '" data-action="select-booking" data-id="' + b.id + '">' +
      '<div class="booking-list-row__top"><span class="booking-list-row__name">' + escapeHtml(b.passengerName) + '</span><span class="booking-list-row__price">' + fmtMoney(b.price) + ' ' + b.currency + '</span></div>' +
      '<div class="booking-list-row__bottom"><span>' + formatRowDate(b.departure, b.depTime) + ', ' + b.fromCode + '-' + b.toCode + '</span><span>' + escapeHtml(b.till) + '</span></div>' +
    '</div>';
  }

  function renderBookingDetailPanel() {
    var b = state.bookings.filter(function (x) { return x.id === state.bookingsSelected; })[0];
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

  function onClick(e) {
    var el = e.target.closest('[data-action]');
    if (!el) {
      var pax = document.querySelector('.search-field--pax');
      if (state.regular.paxOpen && (!pax || !pax.contains(e.target))) { state.regular.paxOpen = false; render(); }
      else if (state.openPopover) { state.openPopover = null; render(); }
      return;
    }
    var action = el.dataset.action;
    if (state.openPopover && POPOVER_ACTIONS.indexOf(action) === -1) state.openPopover = null;

    switch (action) {
      case 'noop': break;

      case 'set-tab':
        state.searchTab = el.dataset.tab;
        state.regular.paxOpen = false;
        render();
        break;

      case 'toggle-pax-regular':
        state.regular.paxOpen = !state.regular.paxOpen;
        render();
        break;

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
        state.regular.paxOpen = false;
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
        state.regular.paxOpen = false;
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
          state.bookingsSelected = newId;
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
        state.bookingsSelected = el.dataset.id;
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

  document.addEventListener('click', onClick);
  document.addEventListener('input', onInput);
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
