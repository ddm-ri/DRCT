/* ================================================================
   DRCT — GROUP BOOKING FLOW PROTOTYPE
   Vanilla JS, single-state app. No build step, no framework.
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
  function formatDateTime(d) {
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtMoney(n) { return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
  function get(path, obj) {
    return path.split('.').reduce(function (o, k) { return (o == null) ? o : o[k]; }, obj);
  }
  function set(path, value, obj) {
    var parts = path.split('.');
    var last = parts.pop();
    var target = parts.reduce(function (o, k) { return o[k]; }, obj);
    target[last] = value;
  }

  /* ----------------------------------------------------------------
     DATA
  ---------------------------------------------------------------- */
  var AIRLINES = [
    { id: 'lot', name: 'LOT Polish Airlines', code: 'LO', logo: 'assets/logos/lot-polish-airlines.svg',
      dep: '07:20', arr: '09:50', duration: '2h 30m', stops: 0, connection: null, connectionCode: null, layover: null, flightNo: 'LO 281', available: true },
    { id: 'airfrance', name: 'Air France', code: 'AF', logo: 'assets/logos/air-france.svg',
      dep: '12:25', arr: '14:50', duration: '2h 25m', stops: 0, connection: null, connectionCode: null, layover: null, flightNo: 'AF 1147', available: true },
    { id: 'lufthansa', name: 'Lufthansa', code: 'LH', logo: 'assets/logos/Lufthansa.svg',
      dep: '06:35', arr: '11:55', duration: '4h 20m', stops: 1, connection: 'Frankfurt', connectionCode: 'FRA', layover: '1h 15m', flightNo: 'LH 1338 / LH 1054', available: true },
    { id: 'klm', name: 'KLM', code: 'KL', logo: 'assets/logos/KLM.svg',
      dep: '09:10', arr: '14:35', duration: '4h 25m', stops: 1, connection: 'Amsterdam', connectionCode: 'AMS', layover: '2h 0m', flightNo: 'KL 1372 / KL 1233', available: true },
    { id: 'swiss', name: 'SWISS', code: 'LX', logo: 'assets/logos/SWISS.svg',
      dep: '10:40', arr: '16:05', duration: '4h 25m', stops: 1, connection: 'Zurich', connectionCode: 'ZRH', layover: '1h 45m', flightNo: 'LX 1548 / LX 792', available: true },
    { id: 'austrian', name: 'Austrian Airlines', code: 'OS', logo: 'assets/logos/austrian-airlines.svg',
      dep: '13:50', arr: '19:35', duration: '4h 45m', stops: 1, connection: 'Vienna', connectionCode: 'VIE', layover: '1h 30m', flightNo: 'OS 599 / OS 405', available: true },
    { id: 'iberia', name: 'Iberia', code: 'IB', logo: 'assets/logos/Iberia.svg',
      dep: '15:20', arr: '21:15', duration: '4h 55m', stops: 1, connection: 'Madrid', connectionCode: 'MAD', layover: '2h 10m', flightNo: 'IB 5352 / IB 3402', available: true },
    { id: 'ba', name: 'British Airways', code: 'BA', logo: 'assets/logos/british-airways.svg',
      dep: '08:15', arr: '13:40', duration: '4h 25m', stops: 1, connection: 'London Heathrow', connectionCode: 'LHR', layover: '1h 40m', flightNo: 'BA 838 / BA 304', available: false }
  ];

  function airlineById(id) { for (var i = 0; i < AIRLINES.length; i++) if (AIRLINES[i].id === id) return AIRLINES[i]; return null; }

  var AIRPORTS = [
    { city: 'Warsaw', name: 'Chopin Airport', code: 'WAW' },
    { city: 'Warsaw', name: 'Modlin Airport', code: 'WMI' },
    { city: 'Paris', name: 'Charles de Gaulle Intl', code: 'CDG' },
    { city: 'Paris', name: 'Orly Airport', code: 'ORY' },
    { city: 'Paris', name: 'Beauvais–Tillé Airport', code: 'BVA' },
    { city: 'London', name: 'Heathrow Airport', code: 'LHR' },
    { city: 'London', name: 'Gatwick Airport', code: 'LGW' },
    { city: 'London', name: 'Stansted Airport', code: 'STN' },
    { city: 'Frankfurt', name: 'Frankfurt Airport', code: 'FRA' },
    { city: 'Amsterdam', name: 'Schiphol Airport', code: 'AMS' },
    { city: 'Zurich', name: 'Zurich Airport', code: 'ZRH' },
    { city: 'Vienna', name: 'Vienna Intl Airport', code: 'VIE' },
    { city: 'Madrid', name: 'Adolfo Suárez Madrid–Barajas', code: 'MAD' },
    { city: 'New York', name: 'John F. Kennedy Intl', code: 'JFK' },
    { city: 'New York', name: 'Newark Liberty Intl', code: 'EWR' },
    { city: 'New York', name: 'LaGuardia Airport', code: 'LGA' },
    { city: 'Rome', name: 'Leonardo da Vinci–Fiumicino', code: 'FCO' },
    { city: 'Barcelona', name: 'Josep Tarradellas Barcelona-El Prat', code: 'BCN' },
    { city: 'Dubai', name: 'Dubai Intl Airport', code: 'DXB' },
    { city: 'Lisbon', name: 'Humberto Delgado Airport', code: 'LIS' }
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
  function airportNameByCode(code) {
    for (var i = 0; i < AIRPORTS.length; i++) if (AIRPORTS[i].code === code) return AIRPORTS[i].name;
    return code;
  }

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
    var a = airlineById(airlineId);
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
    groupsScreen: 'form',
    regular: { from: '', to: '', fromCode: '', toCode: '', departure: '', return: '', adults: 1, children: 0, infants: 0, paxOpen: false, searched: false },
    regularErrors: {},
    group: { from: '', to: '', fromCode: '', toCode: '', departure: '', return: '', pax: 10, paxOpen: false },
    groupErrors: {},
    groupSubmitState: 'idle',
    resultsQuery: null,
    groupFilter: 'all',
    selectedAirlineIds: [],
    requestDraft: null,
    builderStep: 1,
    builderErrors: {},
    builderSubmitState: 'idle',
    bookingsTab: 'booked',
    bookingsSelected: { type: 'regular', id: 'BR-9931' },
    groupRequests: [],
    regularBookings: [
      { id: 'BR-9931', passengerName: 'KATE LEAN MRS', from: 'Chopin Airport', fromCode: 'WAW', to: 'Charles de Gaulle Intl', toCode: 'CDG',
        departure: '2026-08-02', depTime: '12:25', arrTime: '14:50', pax: 2, ref: 'K4TQXP', airlineId: 'airfrance',
        fareName: 'Standard', fareCode: 'RS0BLA2', price: 486, currency: 'EUR' },
      { id: 'BR-9902', passengerName: 'JOHN CARTER MR', from: 'Charles de Gaulle Intl', fromCode: 'CDG', to: 'John F. Kennedy Intl', toCode: 'JFK',
        departure: '2026-08-14', depTime: '09:15', arrTime: '11:40', pax: 1, ref: 'M9PLRZ', airlineId: 'lot',
        fareName: 'Light', fareCode: 'EYQ2BAL', price: 612, currency: 'EUR' }
    ],
    currentOffer: null,
    declineModal: null,
    toasts: [],
    requestCounter: 1048,
    openPopover: null
  };
  window.__DRCT_STATE__ = state;

  /* ---- seed group requests (pre-existing, for demo variety) ---- */
  (function seed() {
    var c1 = addDays(TODAY, -3);
    var accepted1 = buildOfferData('lot', 18, c1);
    var accepted2 = buildOfferData('airfrance', 18, c1);
    var declined1 = buildOfferData('lufthansa', 18, c1);
    state.groupRequests.push({
      id: 'GR-1032', from: 'Warsaw Chopin', fromCode: 'WAW', to: 'John F. Kennedy Intl', toCode: 'JFK',
      departure: '2026-08-20', ret: '2026-08-27', pax: 18, createdAt: c1, dateFlexibility: '2', tripReason: 'sports',
      baggage: '18 sports bags, 23 kg each', comments: 'Team travelling together, prefer adjacent seating if possible.',
      offers: [
        Object.assign({ airlineId: 'lot', status: 'accepted', acceptedAt: addDays(c1, 1) }, accepted1),
        Object.assign({ airlineId: 'airfrance', status: 'accepted', acceptedAt: addDays(c1, 1) }, accepted2),
        Object.assign({ airlineId: 'lufthansa', status: 'declined', declineReason: 'Another airline was selected', declineComment: '' }, declined1)
      ]
    });

    var c2 = addDays(TODAY, -1);
    var review2 = buildOfferData('klm', 12, c2);
    var expired2 = buildOfferData('iberia', 12, addDays(TODAY, -9));
    expired2.acceptBy = addDays(TODAY, -2);
    state.groupRequests.push({
      id: 'GR-1041', from: 'Warsaw Chopin', fromCode: 'WAW', to: 'Charles de Gaulle Intl', toCode: 'CDG',
      departure: '2026-09-05', ret: '2026-09-09', pax: 12, createdAt: c2, dateFlexibility: 'exact', tripReason: 'business',
      baggage: '', comments: 'Prefer morning departure if the airline can accommodate.',
      offers: [
        Object.assign({ airlineId: 'klm', status: 'review' }, review2),
        { airlineId: 'swiss', status: 'calculating' },
        Object.assign({ airlineId: 'iberia', status: 'expired' }, expired2)
      ]
    });
  })();

  /* ----------------------------------------------------------------
     TOASTS
  ---------------------------------------------------------------- */
  var toastSeq = 1;
  function pushToast(opts) {
    var id = 'toast-' + (toastSeq++);
    var toast = { id: id, title: opts.title, text: opts.text || '', actionLabel: opts.actionLabel || null,
      onAction: opts.onAction || null, variant: opts.variant || 'default', timer: null };
    state.toasts.push(toast);
    if (opts.autoDismiss !== false) {
      toast.timer = setTimeout(function () { removeToast(id); }, opts.duration || 5000);
    }
    renderToasts();
    return id;
  }
  function removeToast(id) {
    state.toasts = state.toasts.filter(function (t) {
      if (t.id === id && t.timer) clearTimeout(t.timer);
      return t.id !== id;
    });
    renderToasts();
  }
  function renderToasts() {
    var host = document.getElementById('toastStack');
    host.innerHTML = state.toasts.map(function (t) {
      return '<div class="toast' + (t.variant === 'error' ? ' toast--error' : '') + '" data-toast-id="' + t.id + '">' +
        '<div class="toast__body">' +
          '<div class="toast__title">' + escapeHtml(t.title) + '</div>' +
          (t.text ? '<div class="toast__text">' + escapeHtml(t.text) + '</div>' : '') +
        '</div>' +
        (t.actionLabel ? '<button class="toast__action" data-action="toast-action" data-toast="' + t.id + '">' + escapeHtml(t.actionLabel) + '</button>' : '') +
        '<button class="toast__close" data-action="toast-close" data-toast="' + t.id + '" aria-label="Dismiss">&times;</button>' +
      '</div>';
    }).join('');
  }

  /* ----------------------------------------------------------------
     BACKGROUND OFFER TIMERS
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
            if (state.page === 'bookings' || (state.page === 'offer-details' && state.currentOffer && state.currentOffer.requestId === req.id)) {
              render();
            }
          }, delay);
        }
      });
    });
  }

  /* ----------------------------------------------------------------
     VALIDATION HELPERS
  ---------------------------------------------------------------- */
  function validateGroupForm() {
    var g = state.group, errs = {};
    if (!g.from.trim()) errs.from = 'This field is required.';
    if (!g.to.trim()) errs.to = 'This field is required.';
    if (!g.departure) errs.departure = 'This field is required.';
    if (!g.return) errs.return = 'This field is required.';
    if (g.departure && g.return) {
      var d = parseISO(g.departure), r = parseISO(g.return);
      if (r < d) errs.return = 'Return date cannot be before the departure date.';
    }
    if (g.pax < 10) errs.pax = 'Group requests require at least 10 passengers.';
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
     RENDER: ROOT
  ---------------------------------------------------------------- */
  function render() {
    renderHeader();
    var main = document.getElementById('main');
    if (state.page === 'search') main.innerHTML = renderSearchPage();
    else if (state.page === 'request-builder') main.innerHTML = renderRequestBuilder();
    else if (state.page === 'bookings') main.innerHTML = renderBookings();
    else if (state.page === 'offer-details') main.innerHTML = renderOfferDetails();
    renderStickyBar();
    renderStickyOfferActions();
    renderDeclineModal();
    renderToasts();
    scheduleTimers();
    if (state.openPopover && state.openPopover.type === 'airport') {
      var afInput = document.querySelector('[data-airport-input][data-field="' + state.openPopover.field + '"]');
      if (afInput) { afInput.focus(); var v = afInput.value; afInput.setSelectionRange(v.length, v.length); }
    }
    window.scrollTo(0, main.dataset.keepScroll ? window.scrollY : 0);
  }

  function renderHeader() {
    var isSearchArea = (state.page === 'search' || state.page === 'request-builder');
    var isBookingsArea = (state.page === 'bookings' || state.page === 'offer-details');
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
    if (state.searchTab === 'form') body = renderRegularForm();
    else if (state.searchTab === 'groups') body = (state.groupsScreen === 'results') ? renderGroupResults() : renderGroupForm();
    else body = '<div class="placeholder-panel">This section is not part of the Group Booking Flow prototype.<br>Use the <strong>FORM</strong> or <strong>GROUPS</strong> tab to continue.</div>';

    return '' +
      '<div class="page-head">' +
        '<div class="page-head__top">' +
          '<div><h1>' + title + '</h1><p class="page-head__desc">' + desc + '</p></div>' +
          '<div class="local-tabs">' + tabsHtml + '</div>' +
        '</div>' +
      '</div>' +
      body;
  }

  function calloutHtml(icon, text, variant, title) {
    return '<div class="callout' + (variant ? ' callout--' + variant : '') + '">' +
      '<div class="callout__icon">' + icon + '</div>' +
      '<div>' + (title ? '<div class="callout__title">' + escapeHtml(title) + '</div>' : '') +
      '<div class="callout__text">' + text + '</div></div></div>';
  }

  function warningBannerHtml(html) {
    return '<div class="warning-banner">' + html + '</div>';
  }

  function paxSummaryLabel(r) {
    var total = r.adults + r.children + r.infants;
    return total + (total === 1 ? ' passenger' : ' passengers');
  }

  function renderRegularForm() {
    var r = state.regular, e = state.regularErrors;
    var atMax = r.adults >= 9;
    return '' +
      '<div class="search-bar' + (Object.keys(e).length ? ' has-error' : '') + '">' +
        renderAirportField('regular.from', 'From', ' search-field--from' + (e.from ? ' is-invalid' : '')) +
        '<div class="search-field--swap" data-action="swap-regular" title="Swap origin and destination">' + swapIcon() + '</div>' +
        renderAirportField('regular.to', 'To', ' search-field--to' + (e.to ? ' is-invalid' : '')) +
        renderCalendarField('regular.departure', 'Departure', toISO(TODAY), false, e.departure) +
        renderCalendarField('regular.return', 'Return', r.departure || toISO(TODAY), true, e.return) +
        '<div class="search-field search-field--pax" data-action="toggle-pax-regular">' +
          '<label>Passengers</label><div class="search-field__pax-value">' + paxSummaryLabel(r) + '</div>' +
          (r.paxOpen ? renderRegularPaxPop(atMax) : '') +
        '</div>' +
        '<button class="btn btn-primary search-bar__submit" data-action="regular-search-submit">Search</button>' +
      '</div>' +
      (Object.keys(e).length ? '<div class="field-error" style="margin-top:8px">Please complete all required fields.</div>' : '') +
      '<div class="search-multicity">Search multi-city</div>' +
      (r.searched ? '<div class="placeholder-panel">Regular flight search results are outside the scope of this Group Booking Flow prototype.<br>Set passengers to <strong>9</strong> to explore the group fares entry point, or switch to the <strong>GROUPS</strong> tab.</div>' : '');
  }

  function renderRegularPaxPop(atMax) {
    var r = state.regular;
    return '<div class="pax-pop" data-action="noop">' +
      paxRow('Adults', 'Over 12 years old', 'regular', 'adults', r.adults, 1, 9) +
      paxRow('Children', 'From 2 to 12 years', 'regular', 'children', r.children, 0, 8) +
      paxRow('Infants', 'Up to 2 years, no seat', 'regular', 'infants', r.infants, 0, 8) +
      (atMax ? '<div class="group-cta-inline">' +
        '<div class="group-cta-inline__title">Looking for group rates?</div>' +
        '<div class="group-cta-inline__text">Request fares for 10 or more passengers.</div>' +
        '<button class="btn btn-tertiary btn-block btn-sm" data-action="try-group-fares">Try group fares</button>' +
      '</div>' : '') +
    '</div>';
  }

  function paxRow(label, sub, ns, key, val, min, max) {
    return '<div class="pax-row">' +
      '<div><div class="pax-row__label">' + label + '</div><div class="pax-row__sub">' + sub + '</div></div>' +
      '<div class="stepper">' +
        '<button class="stepper__btn' + (val > min ? ' is-active' : '') + '" data-action="pax-step" data-ns="' + ns + '" data-key="' + key + '" data-dir="-1" data-min="' + min + '" data-max="' + max + '" ' + (val <= min ? 'disabled' : '') + '>&minus;</button>' +
        '<span class="stepper__val">' + val + '</span>' +
        '<button class="stepper__btn' + (val < max ? ' is-active' : '') + '" data-action="pax-step" data-ns="' + ns + '" data-key="' + key + '" data-dir="1" data-min="' + min + '" data-max="' + max + '" ' + (val >= max ? 'disabled' : '') + '>+</button>' +
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
    return '<div class="search-field' + (extraClass || '') + '" data-action="open-airport-field" data-field="' + fieldKey + '">' +
      inner +
      (isOpen ? renderAirportPopover(fieldKey, state.openPopover.query) : '') +
    '</div>';
  }

  function renderAirportPopover(fieldKey, query) {
    return '<div class="field-pop field-pop--airport" data-action="noop">' +
      '<div class="field-pop__list">' + renderAirportGroups(query) + '</div>' +
    '</div>';
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

  function renderCalendarField(fieldKey, placeholder, minISO, isReturn, hasError) {
    var iso = get(fieldKey, state) || '';
    var isOpen = state.openPopover && state.openPopover.type === 'calendar' && state.openPopover.field === fieldKey;
    var inner = iso
      ? '<span class="field-value"><span class="field-value__name">' + formatFieldDate(iso) + '</span></span>'
      : '<span class="field-placeholder">' + escapeHtml(placeholder) + '</span>';
    return '<div class="search-field' + (hasError ? ' is-invalid' : '') + '" data-action="open-calendar-field" data-field="' + fieldKey + '" data-min="' + minISO + '" data-return="' + (isReturn ? '1' : '0') + '">' +
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
      '<div class="cal-grids">' +
        renderMonthGrid(y, m, fieldKey, selectedISO, minISO) +
        renderMonthGrid(ny, nm, fieldKey, selectedISO, minISO) +
      '</div>' +
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
        (disabled ? '' : ' data-action="select-date" data-field="' + fieldKey + '" data-date="' + iso + '"') +
        '>' + d + '</span>';
    }
    return '<div class="cal-grid">' +
      '<div class="cal-weekdays"><span>su</span><span>mo</span><span>tu</span><span>we</span><span>th</span><span>fr</span><span>sa</span></div>' +
      '<div class="cal-days">' + cells + '</div>' +
    '</div>';
  }

  function chevronSvg(dir) {
    var d = dir === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="' + d + '"></path></svg>';
  }

  /* ----- Group search form ----- */
  function renderGroupForm() {
    var g = state.group, e = state.groupErrors;
    if (state.groupSubmitState === 'loading') {
      return groupFormBar(g, e) + '<div class="search-multicity" style="visibility:hidden">.</div>';
    }
    if (state.groupSubmitState === 'error') {
      return groupFormBar(g, e) +
        '<div class="server-error-panel">' +
          '<div class="server-error-panel__icon">!</div>' +
          '<h3>We couldn’t load group search results</h3>' +
          '<p>Something went wrong on our end. Your search details have been kept — please try again.</p>' +
          '<div class="server-error-panel__actions">' +
            '<button class="btn btn-primary" data-action="group-search-submit">Retry</button>' +
          '</div>' +
        '</div>';
    }
    return groupFormBar(g, e) +
      (Object.keys(e).length ? '<div class="field-error" style="margin-top:10px">Please complete all required fields.</div>' : '');
  }

  function groupFormBar(g, e) {
    var loading = state.groupSubmitState === 'loading';
    return '<div class="search-bar' + (Object.keys(e).length ? ' has-error' : '') + '">' +
      renderAirportField('group.from', 'From', ' search-field--from' + (e.from ? ' is-invalid' : '')) +
      '<div class="search-field--swap" data-action="swap-group" title="Swap origin and destination">' + swapIcon() + '</div>' +
      renderAirportField('group.to', 'To', ' search-field--to' + (e.to ? ' is-invalid' : '')) +
      renderCalendarField('group.departure', 'Departure', toISO(TODAY), false, e.departure) +
      renderCalendarField('group.return', 'Return', g.departure || toISO(TODAY), true, e.return) +
      '<div class="search-field search-field--pax-total search-field--pax' + (e.pax ? ' is-invalid' : '') + '" data-action="toggle-pax-group">' +
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
          '<button class="stepper__btn' + (g.pax > 10 ? ' is-active' : '') + '" data-action="group-pax-step" data-dir="-1" ' + (g.pax <= 10 ? 'disabled' : '') + '>&minus;</button>' +
          '<span class="stepper__val">' + g.pax + '</span>' +
          '<button class="stepper__btn is-active" data-action="group-pax-step" data-dir="1">+</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ----- Group results ----- */
  function renderGroupResults() {
    var q = state.resultsQuery;
    var flights = AIRLINES.filter(function (a) {
      if (state.groupFilter === 'direct') return a.stops === 0;
      if (state.groupFilter === '1-stop') return a.stops <= 1;
      return true;
    });

    var cards = flights.length ? flights.map(renderFlightCard).join('') : '<div class="empty-note">No flights match this filter. Try a different filter.</div>';

    var g = state.group;
    return '' +
      '<div class="summary-bar">' +
        renderAirportField('group.from', 'From', '') +
        renderAirportField('group.to', 'To', '') +
        renderCalendarField('group.departure', 'Departure', toISO(TODAY), false) +
        renderCalendarField('group.return', 'Return', g.departure || toISO(TODAY), true) +
        '<div class="search-field search-field--pax-total search-field--pax" data-action="toggle-pax-group">' +
          '<span class="search-field__pax-value">' + g.pax + ' passengers</span>' +
          (g.paxOpen ? renderGroupPaxPop() : '') +
        '</div>' +
        '<div class="summary-field summary-field--btn">' +
          '<button class="btn btn-primary btn-sm" data-action="group-results-update-search">Update search</button>' +
        '</div>' +
      '</div>' +
      '<div style="margin-bottom:20px">' + warningBannerHtml('Group fares are requested directly from airlines. Final prices, flight details and conditions may differ from the options shown in search results.') + '</div>' +
      '<h2 class="section-subhead">Group flight options</h2>' +
      '<p>Select up to 3 airlines to request final group fares.</p>' +
      '<div class="filter-row">' +
        filterToggle('All flights', 'all') + filterToggle('Direct', 'direct') + filterToggle('Up to 1 connection', '1-stop') +
      '</div>' +
      '<div class="flight-card-list">' + cards + '</div>' +
      '<div style="height:70px"></div>';
  }

  function filterToggle(label, val) {
    return '<div class="filter-toggle' + (state.groupFilter === val ? ' active' : '') + '" data-action="set-group-filter" data-filter="' + val + '">' + label + '</div>';
  }

  function renderFlightCard(a) {
    var selected = state.selectedAirlineIds.indexOf(a.id) !== -1;
    var cls = 'flight-card' + (selected ? ' is-selected' : '') + (!a.available ? ' is-unavailable' : '');
    var cta;
    if (!a.available) {
      cta = '<button class="btn btn-secondary" disabled>Choose airline</button><div class="flight-card__unavailable-note">Group requests are unavailable for this airline.</div>';
    } else if (selected) {
      cta = '<button class="btn is-selected-btn" data-action="toggle-select-airline" data-airline="' + a.id + '">Selected</button>' +
        '<div class="flight-card__remove" data-action="toggle-select-airline" data-airline="' + a.id + '">Remove</div>';
    } else {
      cta = '<button class="btn btn-secondary" data-action="toggle-select-airline" data-airline="' + a.id + '">Choose airline</button>';
    }
    var fromCode = state.resultsQuery.fromCode || 'WAW', toCode = state.resultsQuery.toCode || 'CDG';
    return '<div class="' + cls + '" ' + (a.available ? 'data-action="toggle-select-airline" data-airline="' + a.id + '"' : '') + '>' +
      '<div class="flight-card__logo"><img src="' + a.logo + '" alt="' + a.name + '"></div>' +
      '<div class="flight-card__times"><div class="flight-card__times-main">' + a.dep + ' — ' + a.arr + '</div><div class="flight-card__times-sub">' + a.name + '</div></div>' +
      '<div class="flight-card__duration"><div class="flight-card__duration-val">' + a.duration + '</div><div class="flight-card__times-sub">' + fromCode + ' — ' + toCode + '</div></div>' +
      '<div class="flight-card__stops-col"><div class="flight-card__stops' + (a.stops === 0 ? ' is-direct' : '') + '">' + (a.stops === 0 ? 'Direct flight' : '1 connection') + '</div>' + (a.stops === 0 ? '' : '<div class="flight-card__times-sub">' + a.connectionCode + ' ' + a.layover + '</div>') + '</div>' +
      '<div class="flight-card__cta" data-action="noop">' + cta + '</div>' +
    '</div>';
  }

  /* ----------------------------------------------------------------
     RENDER: STICKY SELECTION BAR
  ---------------------------------------------------------------- */
  function renderStickyBar() {
    var host = document.getElementById('stickyBarHost');
    var visible = state.page === 'search' && state.searchTab === 'groups' && state.groupsScreen === 'results' && state.selectedAirlineIds.length > 0;
    if (!visible) { host.innerHTML = ''; return; }
    var chips = state.selectedAirlineIds.map(function (id) {
      var a = airlineById(id);
      return '<div class="sticky-bar__chip"><img src="' + a.logo + '" alt="">' + a.code + '</div>';
    }).join('');
    host.innerHTML = '<div class="sticky-bar is-visible">' +
      '<div class="sticky-bar__left">' +
        '<div class="sticky-bar__count">Selected airlines: ' + state.selectedAirlineIds.length + '/3</div>' +
        '<div class="sticky-bar__chips">' + chips + '</div>' +
      '</div>' +
      '<div class="sticky-bar__right">' +
        '<button class="btn btn-ghost" data-action="clear-all-selection">Clear all</button>' +
        '<button class="btn btn-primary" data-action="create-request">Create request</button>' +
      '</div>' +
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
      var a = airlineById(id);
      return '<div class="chip"><img src="' + a.logo + '" alt="">' + '<span>' + a.name + '</span>' +
        (d.airlineIds.length > 1 ? '<span class="chip__remove" data-action="remove-builder-airline" data-airline="' + id + '">&times;</span>' : '') +
      '</div>';
    }).join('');

    return '' +
      (e.general ? '<div class="form-alert">Please complete all required fields.</div>' : '') +
      '<div class="form-section">' +
        '<div class="form-section__title">Trip details</div>' +
        '<div class="form-section__desc">Route, dates and passenger count can still be edited.</div>' +
        '<div class="form-grid">' +
          renderAirportField('requestDraft.from', 'From', '') +
          renderAirportField('requestDraft.to', 'To', '') +
          renderCalendarField('requestDraft.departure', 'Departure', toISO(TODAY), false) +
          renderCalendarField('requestDraft.return', 'Return', d.departure || toISO(TODAY), true) +
        '</div>' +
        '<div class="field-group">' +
          '<div class="field-group__label">Passengers</div>' +
          '<div class="pax-total-field" style="max-width:220px;border:1px solid var(--border);border-radius:8px;padding:12px 16px">' +
            '<span class="pax-total-field__count">' + d.pax + ' passengers</span>' +
            '<div class="stepper">' +
              '<button class="stepper__btn' + (d.pax > 10 ? ' is-active' : '') + '" data-action="builder-pax-step" data-dir="-1" ' + (d.pax <= 10 ? 'disabled' : '') + '>&minus;</button>' +
              '<button class="stepper__btn is-active" data-action="builder-pax-step" data-dir="1">+</button>' +
            '</div>' +
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
      '</div>' +
      '<div class="form-actions">' +
        '<button class="btn btn-secondary" data-action="builder-back-to-results">Back to results</button>' +
        '<button class="btn btn-primary" data-action="builder-continue" ' + (isStep1Valid() ? '' : 'disabled') + '>Continue</button>' +
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
    var airlineNames = d.airlineIds.map(function (id) { return airlineById(id).name; }).join(', ');
    var flexLabel = FLEX_OPTIONS.filter(function (o) { return o.v === d.dateFlexibility; })[0];
    var reasonLabel = TRIP_REASONS.filter(function (o) { return o.v === d.tripReason; })[0];
    return '' +
      '<div class="form-section">' +
        '<div class="form-section__title">Additional details</div>' +
        '<div class="form-section__desc">Add any requirements that may affect the airline’s offer.</div>' +
        '<div class="field-group">' +
          '<div class="field-group__label">Baggage requirements</div>' +
          '<textarea class="textarea" data-field="requestDraft.baggage" placeholder="For example: 10 sports bags, 20 kg each">' + escapeHtml(d.baggage) + '</textarea>' +
        '</div>' +
        '<div class="field-group">' +
          '<div class="field-group__label">Additional comments</div>' +
          '<textarea class="textarea" data-field="requestDraft.comments" placeholder="Add preferred departure times, alternative airports or other important requirements">' + escapeHtml(d.comments) + '</textarea>' +
        '</div>' +
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
      '</div>' +
      '<div class="form-actions__note">By submitting this request, you understand that final fares and conditions will be confirmed by the airlines.</div>';
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
     RENDER: BOOKINGS
  ---------------------------------------------------------------- */
  function renderBookings() {
    var tabOrder = ['find', 'booked', 'inprogress', 'issued', 'groups'];
    var tabLabels = { find: 'Find', booked: 'Booked', inprogress: 'In progress', issued: 'Issued', groups: 'Groups' };
    var tabsHtml = tabOrder.map(function (t) {
      return '<div class="filter-toggle' + (state.bookingsTab === t ? ' active' : '') + '" data-action="set-bookings-tab" data-tab="' + t + '">' + tabLabels[t] + '</div>';
    }).join('');

    var items = bookingsListItems();
    var listHtml = items.length ? items.map(renderBookingListRow).join('') : '<div class="empty-note">No items in this view.</div>';

    return '' +
      '<div class="page-head"><h1>Bookings</h1></div>' +
      '<div class="bookings-tabs">' + tabsHtml + '</div>' +
      '<div class="bookings-layout">' +
        '<div class="bookings-list">' + listHtml + '</div>' +
        '<div class="bookings-detail">' + renderBookingDetailPanel() + '</div>' +
      '</div>';
  }

  function bookingsListItems() {
    if (state.bookingsTab === 'booked') {
      return state.regularBookings.map(function (b) { return { type: 'regular', id: b.id, data: b }; });
    }
    if (state.bookingsTab === 'groups') {
      var sorted = state.groupRequests.slice().sort(function (a, b) { return b.createdAt - a.createdAt; });
      return sorted.map(function (r) { return { type: 'group', id: r.id, data: r }; });
    }
    return [];
  }

  function groupOverallStatus(req) {
    var total = req.offers.length;
    var responded = req.offers.filter(function (o) { return o.status !== 'calculating'; }).length;
    var reviewCount = req.offers.filter(function (o) { return o.status === 'review'; }).length;
    var acceptedCount = req.offers.filter(function (o) { return o.status === 'accepted'; }).length;
    var calculatingCount = req.offers.filter(function (o) { return o.status === 'calculating'; }).length;
    var label, cls;
    if (reviewCount > 0) { label = 'Review required'; cls = 'review'; }
    else if (calculatingCount > 0) { label = 'Calculating'; cls = 'calculating'; }
    else if (acceptedCount > 0) { label = 'Accepted'; cls = 'accepted'; }
    else { label = 'Closed'; cls = 'closed'; }
    return { count: responded + ' of ' + total + ' responded', label: label, cls: cls, acceptedCount: acceptedCount };
  }

  function renderBookingListRow(item) {
    var sel = state.bookingsSelected;
    var selected = !!(sel && sel.type === item.type && sel.id === item.id);
    var top1, top2, bottom1, bottom2;
    if (item.type === 'regular') {
      var b = item.data;
      top1 = escapeHtml(b.passengerName);
      top2 = fmtMoney(b.price) + ' ' + b.currency;
      bottom1 = formatRowDate(b.departure, b.depTime) + ', ' + b.fromCode + '-' + b.toCode;
      bottom2 = 'Ref ' + b.ref;
    } else {
      var req = item.data, overall = groupOverallStatus(req);
      top1 = 'Group request #' + req.id;
      top2 = overall.count;
      bottom1 = req.fromCode + ' → ' + req.toCode + ' · ' + formatFieldDate(req.departure);
      bottom2 = overall.label;
    }
    return '<div class="booking-list-row' + (selected ? ' is-selected' : '') + '" data-action="select-booking" data-type="' + item.type + '" data-id="' + item.id + '">' +
      '<div class="booking-list-row__top"><span class="booking-list-row__name">' + top1 + '</span><span class="booking-list-row__price">' + top2 + '</span></div>' +
      '<div class="booking-list-row__bottom"><span>' + bottom1 + '</span><span>' + bottom2 + '</span></div>' +
    '</div>';
  }

  function renderBookingDetailPanel() {
    var sel = state.bookingsSelected;
    if (!sel) return '<div class="empty-note">Select a booking to see details.</div>';
    if (sel.type === 'regular') {
      var b = state.regularBookings.filter(function (x) { return x.id === sel.id; })[0];
      return b ? renderRegularBookingDetail(b) : '<div class="empty-note">Select a booking to see details.</div>';
    }
    var req = state.groupRequests.filter(function (x) { return x.id === sel.id; })[0];
    return req ? renderGroupBookingDetail(req) : '<div class="empty-note">Select a booking to see details.</div>';
  }

  function cityByAirportName(name) {
    for (var i = 0; i < AIRPORTS.length; i++) if (AIRPORTS[i].name === name) return AIRPORTS[i].city;
    return name;
  }

  function renderFlightSegmentRow(logo, depTime, depName, depCode, depDate, arrTime, arrName, arrCode, arrDate, captionHtml) {
    return '<div class="segment-row">' +
      '<div class="segment-row__logo"><img src="' + logo + '" alt=""></div>' +
      '<div class="segment-row__lines">' +
        '<div class="segment-row__line"><span class="segment-row__time">' + depTime + '</span><span class="segment-row__airport">' + escapeHtml(depName) + ', ' + depCode + '</span><span class="segment-row__date">' + formatFieldDate(depDate) + '</span></div>' +
        '<div class="segment-row__line"><span class="segment-row__time">' + arrTime + '</span><span class="segment-row__airport">' + escapeHtml(arrName) + ', ' + arrCode + '</span><span class="segment-row__date">' + formatFieldDate(arrDate) + '</span></div>' +
        '<div class="segment-row__caption">' + captionHtml + '</div>' +
      '</div>' +
    '</div>';
  }

  function renderRegularBookingDetail(b) {
    var a = airlineById(b.airlineId);
    var caption = a.name + ', ' + a.flightNo.split(' / ')[0] + ', duration ' + a.duration;
    var seg = renderFlightSegmentRow(a.logo, b.depTime, b.from, b.fromCode, b.departure, b.arrTime, b.to, b.toCode, b.departure, caption);
    var copyText = a.name + ' ' + a.flightNo.split(' / ')[0] + ', ' + b.fromCode + ' → ' + b.toCode + ', ' + formatFieldDate(b.departure) + ', ' + b.depTime + '-' + b.arrTime;
    return '' +
      '<div class="booking-detail__banner booking-detail__banner--accepted">Booked</div>' +
      '<div class="booking-detail__body">' +
        '<h2 class="booking-detail__heading">Flight to ' + escapeHtml(cityByAirportName(b.to)) + '</h2>' +
        '<p class="booking-detail__sub">On the way ' + a.duration + '</p>' +
        '<div class="segment-card" data-action="copy-option" data-copy="' + escapeHtml(copyText) + '">' +
          seg +
          '<div class="segment-card__copy">Click to copy option</div>' +
        '</div>' +
        '<div class="fare-box"><div class="fare-box__name">' + escapeHtml(b.fareName) + '</div><div class="fare-box__code">' + escapeHtml(b.fareCode) + '</div></div>' +
        '<div class="booking-detail__section"><h3>Adult</h3><p>' + escapeHtml(b.passengerName) + '</p></div>' +
        '<div class="price-total-row"><div class="price-total-row__label">Total</div><div class="price-total-row__value">' + fmtMoney(b.price * b.pax) + ' ' + b.currency + '</div></div>' +
      '</div>';
  }

  function renderGroupBookingDetail(req) {
    var overall = groupOverallStatus(req);
    var offersHtml = req.offers.map(function (o) { return renderGroupOfferRow(req, o); }).join('');
    return '' +
      '<div class="booking-detail__banner booking-detail__banner--' + overall.cls + '">' + overall.label + '</div>' +
      '<div class="booking-detail__body">' +
        '<h2 class="booking-detail__heading">' + req.fromCode + ' → ' + req.toCode + '</h2>' +
        '<p class="booking-detail__sub">' + formatFieldDate(req.departure) + ' – ' + formatFieldDate(req.ret) + ' · ' + req.pax + ' passengers · Group request #' + req.id + '</p>' +
        (overall.acceptedCount > 1 ? '<div style="margin:16px 0">' + warningBannerHtml('Multiple offers are currently accepted. Select one final offer before the hold deadlines expire.') + '</div>' : '') +
        '<div class="group-offer-list">' + offersHtml + '</div>' +
      '</div>';
  }

  function renderGroupOfferRow(req, o) {
    var a = airlineById(o.airlineId);
    var cardCls = 'group-offer-row';
    var statusPill, right, priceBlock = '';

    if (o.status === 'calculating') {
      cardCls += ' is-calculating';
      statusPill = statusPillHtml('calculating', 'Calculating');
      right = '<div class="offer-card__note">The airline is preparing a group offer.<br>Usually within 24 hours.</div>' +
        '<button class="btn btn-secondary btn-sm offer-card__cta" disabled>Waiting for offer</button>';
    } else if (o.status === 'review') {
      cardCls += ' is-review-required';
      statusPill = statusPillHtml('review', 'Review required');
      priceBlock = '<div class="offer-card__price">' + fmtMoney(o.total) + ' ' + o.currency + '</div><div class="offer-card__deadline">Deadline ' + formatDisplay(toISO(o.acceptBy)) + '</div>';
      right = '<button class="btn btn-primary btn-sm offer-card__cta" data-action="open-offer" data-request="' + req.id + '" data-airline="' + a.id + '">Review offer</button>';
    } else if (o.status === 'accepted') {
      statusPill = statusPillHtml('accepted', 'Accepted');
      priceBlock = '<div class="offer-card__price">' + fmtMoney(o.total) + ' ' + o.currency + '</div><div class="offer-card__deadline">Deposit due ' + formatDisplay(toISO(o.depositBy)) + '</div>';
      right = '<button class="btn btn-secondary btn-sm offer-card__cta" data-action="open-offer" data-request="' + req.id + '" data-airline="' + a.id + '">View offer</button>';
    } else if (o.status === 'declined') {
      cardCls += ' is-declined';
      statusPill = statusPillHtml('declined', 'Declined');
      right = (o.declineReason ? '<div class="offer-card__note">' + escapeHtml(o.declineReason) + '</div>' : '') +
        '<button class="btn btn-ghost btn-sm offer-card__cta" data-action="open-offer" data-request="' + req.id + '" data-airline="' + a.id + '">View details</button>';
    } else if (o.status === 'expired') {
      cardCls += ' is-expired';
      statusPill = statusPillHtml('expired', 'Expired');
      right = '<div class="offer-card__note">The response deadline has passed.</div>' +
        '<button class="btn btn-ghost btn-sm offer-card__cta" data-action="open-offer" data-request="' + req.id + '" data-airline="' + a.id + '">View details</button>';
    }

    var caption = a.stops === 0
      ? (a.name + ', ' + a.flightNo + ', duration ' + a.duration)
      : (a.name + ', ' + a.flightNo + ', duration ' + a.duration + ' · 1 connection via ' + escapeHtml(airportNameByCode(a.connectionCode)) + ' (' + a.connectionCode + '), layover ' + a.layover);
    var seg = renderFlightSegmentRow(a.logo, a.dep, req.from, req.fromCode, req.departure, a.arr, req.to, req.toCode, req.departure, caption);

    return '<div class="' + cardCls + '">' +
      seg +
      '<div class="group-offer-row__side">' +
        (priceBlock ? '<div class="group-offer-row__status">' + statusPill + priceBlock + '</div>' : '<div class="group-offer-row__status">' + statusPill + '</div>') +
        '<div class="group-offer-row__cta">' + right + '</div>' +
      '</div>' +
    '</div>';
  }

  function statusPillHtml(cls, label) {
    return '<div class="status-pill status-pill--' + cls + '"><span class="dot"></span>' + label + '</div>';
  }

  /* ----------------------------------------------------------------
     RENDER: OFFER DETAILS
  ---------------------------------------------------------------- */
  function renderOfferDetails() {
    var ref = state.currentOffer;
    var req = state.groupRequests.filter(function (r) { return r.id === ref.requestId; })[0];
    var o = req.offers.filter(function (x) { return x.airlineId === ref.airlineId; })[0];
    var a = airlineById(o.airlineId);
    var statusLabels = { calculating: 'Calculating', review: 'Review required', accepted: 'Accepted', declined: 'Declined', expired: 'Expired' };

    return '' +
      '<div class="page-head">' +
        '<h1>Group offer</h1>' +
        '<div class="offer-header">' +
          '<span>' + a.name + '</span><span class="offer-header__sep">•</span>' +
          '<span>Request #' + req.id + '</span><span class="offer-header__sep">•</span>' +
          '<span>' + statusLabels[o.status] + '</span>' +
          (o.acceptBy ? '<span class="offer-header__sep">•</span><span>Decision deadline: ' + formatDisplay(toISO(o.acceptBy)) + '</span>' : '') +
        '</div>' +
      '</div>' +

      '<div class="detail-block">' +
        '<div class="detail-block__title">Flight details</div>' +
        '<div class="detail-grid">' +
          detailRow('Route', req.fromCode + ' → ' + req.toCode) +
          detailRow('Airports', req.from + ' – ' + req.to) +
          detailRow('Departure', formatDisplay(req.departure) + ', ' + a.dep) +
          detailRow('Arrival', formatDisplay(req.departure) + ', ' + a.arr) +
          detailRow('Flight number(s)', a.flightNo) +
          detailRow('Connection', a.stops === 0 ? 'Direct flight' : '1 connection via ' + a.connection) +
        '</div>' +
      '</div>' +

      '<div class="detail-block">' +
        '<div class="detail-block__title">Price</div>' +
        '<div class="detail-grid">' +
          detailRow('Price per passenger', fmtMoney(o.perPax) + ' ' + o.currency) +
          detailRow('Passengers', req.pax + ' passengers') +
        '</div>' +
        '<div class="price-total-row"><div class="price-total-row__label">Total price</div><div class="price-total-row__value">' + fmtMoney(o.total) + ' ' + o.currency + '</div></div>' +
      '</div>' +

      '<div class="detail-block">' +
        '<div class="detail-block__title">Baggage</div>' +
        '<div class="detail-grid">' +
          detailRow('Included baggage', o.baggageIncluded) +
          detailRow('Additional baggage', o.baggageNote) +
        '</div>' +
      '</div>' +

      '<div class="detail-block">' +
        '<div class="detail-block__title">Deadlines</div>' +
        '<div class="detail-grid">' +
          detailRow('Accept offer by', formatDisplay(toISO(o.acceptBy))) +
          detailRow('Deposit payment by', formatDisplay(toISO(o.depositBy))) +
          (o.namesBy ? detailRow('Passenger names due by', formatDisplay(toISO(o.namesBy))) : '') +
        '</div>' +
      '</div>' +

      '<div class="detail-block">' +
        '<div class="detail-block__title">Fare conditions</div>' +
        '<ul class="conditions-list">' +
          '<li><b>Payment</b>' + o.conditions.payment + '</li>' +
          '<li><b>Changes</b>' + o.conditions.changes + '</li>' +
          '<li><b>Cancellations</b>' + o.conditions.cancellation + '</li>' +
          '<li><b>Passenger flexibility</b>' + o.conditions.flexibility + '</li>' +
          '<li><b>Other</b>' + o.conditions.other + '</li>' +
        '</ul>' +
      '</div>' +
      (o.status === 'declined' && o.declineReason ? '<div class="detail-block"><div class="detail-block__title">Decline reason</div><div class="detail-grid">' + detailRow('Reason', o.declineReason) + (o.declineComment ? detailRow('Comment', escapeHtml(o.declineComment)) : '') + '</div></div>' : '') +
      '<div style="height:70px"></div>';
  }

  function detailRow(label, value) {
    return '<div class="detail-row"><dt>' + label + '</dt><dd>' + value + '</dd></div>';
  }

  function renderStickyOfferActions() {
    var host = document.getElementById('offerActionsHost');
    if (state.page !== 'offer-details') { host.innerHTML = ''; return; }
    var ref = state.currentOffer;
    var req = state.groupRequests.filter(function (r) { return r.id === ref.requestId; })[0];
    var o = req.offers.filter(function (x) { return x.airlineId === ref.airlineId; })[0];
    var actions = '<button class="btn btn-ghost offer-sticky-actions__back" data-action="offer-back-to-bookings">Back to bookings</button>';
    if (o.status === 'review' || o.status === 'accepted') {
      actions += '<button class="btn btn-destructive" data-action="open-decline-modal">Decline</button>';
      actions += '<button class="btn btn-primary" data-action="accept-offer" ' + (o.status === 'accepted' ? 'disabled' : '') + '>' + (o.status === 'accepted' ? 'Offer accepted' : 'Accept offer') + '</button>';
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
     EVENT HANDLERS
  ---------------------------------------------------------------- */
  var POPOVER_ACTIONS = ['open-airport-field', 'select-airport', 'open-calendar-field', 'calendar-nav', 'select-date', 'calendar-skip-return', 'noop'];

  function onClick(e) {
    var el = e.target.closest('[data-action]');
    if (!el) {
      var pax = document.querySelector('.search-field--pax');
      if ((state.regular.paxOpen || state.group.paxOpen) && (!pax || !pax.contains(e.target))) {
        state.regular.paxOpen = false;
        state.group.paxOpen = false;
        render();
      } else if (state.openPopover) {
        state.openPopover = null;
        render();
      }
      return;
    }
    var action = el.dataset.action;
    if (state.openPopover && POPOVER_ACTIONS.indexOf(action) === -1) {
      state.openPopover = null;
    }

    switch (action) {
      case 'noop': break;

      case 'set-tab':
        state.searchTab = el.dataset.tab;
        state.regular.paxOpen = false;
        state.group.paxOpen = false;
        render();
        break;

      case 'toggle-pax-regular':
        state.regular.paxOpen = !state.regular.paxOpen;
        state.group.paxOpen = false;
        render();
        break;

      case 'toggle-pax-group':
        state.group.paxOpen = !state.group.paxOpen;
        state.regular.paxOpen = false;
        render();
        break;

      case 'pax-step': {
        var ns = el.dataset.ns, key = el.dataset.key, dir = +el.dataset.dir, min = +el.dataset.min, max = +el.dataset.max;
        var cur = state[ns][key];
        var next = Math.max(min, Math.min(max, cur + dir));
        state[ns][key] = next;
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

      case 'try-group-fares':
        state.group.from = state.regular.from;
        state.group.to = state.regular.to;
        state.group.departure = state.regular.departure;
        state.group.return = state.regular.return;
        state.group.pax = 10;
        state.regular.paxOpen = false;
        state.searchTab = 'groups';
        state.groupsScreen = 'form';
        render();
        break;

      case 'regular-search-submit': {
        var errs = {};
        if (!state.regular.from.trim()) errs.from = 1;
        if (!state.regular.to.trim()) errs.to = 1;
        if (!state.regular.departure) errs.departure = 1;
        state.regularErrors = errs;
        state.regular.searched = Object.keys(errs).length === 0;
        render();
        break;
      }

      case 'swap-group': {
        var tmpg = state.group.from; state.group.from = state.group.to; state.group.to = tmpg;
        var tmpgC = state.group.fromCode; state.group.fromCode = state.group.toCode; state.group.toCode = tmpgC;
        render();
        break;
      }

      case 'open-airport-field': {
        var afKey = el.dataset.field;
        if (state.openPopover && state.openPopover.type === 'airport' && state.openPopover.field === afKey) break;
        state.openPopover = { type: 'airport', field: afKey, query: get(afKey, state) || '' };
        state.regular.paxOpen = false;
        state.group.paxOpen = false;
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
        state.openPopover = {
          type: 'calendar', field: cfKey,
          calYear: base.getFullYear(), calMonth: base.getMonth(),
          minISO: el.dataset.min, isReturn: el.dataset.return === '1'
        };
        state.regular.paxOpen = false;
        state.group.paxOpen = false;
        render();
        break;
      }

      case 'calendar-nav': {
        var dirc = +el.dataset.dir;
        var mm = state.openPopover.calMonth + dirc;
        var yy = state.openPopover.calYear;
        if (mm < 0) { mm = 11; yy--; } else if (mm > 11) { mm = 0; yy++; }
        state.openPopover.calMonth = mm;
        state.openPopover.calYear = yy;
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
          state.openPopover = {
            type: 'calendar', field: retPath,
            calYear: parseISO(dIso).getFullYear(), calMonth: parseISO(dIso).getMonth(),
            minISO: dIso, isReturn: true
          };
        }
        render();
        break;
      }

      case 'calendar-skip-return': {
        set(el.dataset.field, '', state);
        state.openPopover = null;
        render();
        break;
      }

      case 'group-pax-step': {
        var dirg = +el.dataset.dir;
        state.group.pax = Math.max(10, state.group.pax + dirg);
        render();
        break;
      }

      case 'group-search-submit': {
        var gerrs = validateGroupForm();
        state.groupErrors = gerrs;
        if (Object.keys(gerrs).length) { render(); break; }
        state.groupSubmitState = 'loading';
        render();
        setTimeout(function () {
          var failTrigger = /fail/i.test(state.group.from) || /fail/i.test(state.group.to);
          if (failTrigger) {
            state.groupSubmitState = 'error';
            render();
            return;
          }
          state.groupSubmitState = 'idle';
          state.resultsQuery = {
            from: state.group.from, to: state.group.to,
            fromCode: state.group.fromCode || guessCode(state.group.from, 'WAW'),
            toCode: state.group.toCode || guessCode(state.group.to, 'CDG'),
            departure: state.group.departure, return: state.group.return, pax: state.group.pax
          };
          state.groupsScreen = 'results';
          state.groupFilter = 'all';
          render();
        }, 900);
        break;
      }

      case 'group-results-update-search': {
        var uErrs = validateGroupForm();
        if (Object.keys(uErrs).length) {
          pushToast({ title: 'Please complete all required fields', variant: 'error' });
          break;
        }
        state.resultsQuery = {
          from: state.group.from, to: state.group.to,
          fromCode: state.group.fromCode || guessCode(state.group.from, state.resultsQuery.fromCode),
          toCode: state.group.toCode || guessCode(state.group.to, state.resultsQuery.toCode),
          departure: state.group.departure, return: state.group.return, pax: state.group.pax
        };
        pushToast({ title: 'Search updated', text: 'Flight options refreshed for the new search.', duration: 2600 });
        render();
        break;
      }

      case 'set-group-filter':
        state.groupFilter = el.dataset.filter;
        render();
        break;

      case 'toggle-select-airline': {
        var aid = el.dataset.airline;
        var idx = state.selectedAirlineIds.indexOf(aid);
        if (idx !== -1) {
          state.selectedAirlineIds.splice(idx, 1);
        } else if (state.selectedAirlineIds.length >= 3) {
          pushToast({ title: 'You can select up to 3 airlines', text: 'Remove one of the selected airlines to choose another.', actionLabel: 'Got it' });
          break;
        } else {
          state.selectedAirlineIds.push(aid);
        }
        render();
        break;
      }

      case 'clear-all-selection':
        state.selectedAirlineIds = [];
        render();
        break;

      case 'create-request': {
        if (state.selectedAirlineIds.length === 0) break;
        var q = state.resultsQuery;
        state.requestDraft = {
          from: q.from, to: q.to, fromCode: q.fromCode, toCode: q.toCode,
          departure: q.departure, return: q.return, pax: q.pax,
          airlineIds: state.selectedAirlineIds.slice(),
          dateFlexibility: null, tripReason: null, baggage: '', comments: ''
        };
        state.builderStep = 1;
        state.builderErrors = {};
        state.builderSubmitState = 'idle';
        state.page = 'request-builder';
        render();
        break;
      }

      case 'builder-back-to-results':
        state.page = 'search';
        render();
        break;

      case 'remove-builder-airline': {
        var rid = el.dataset.airline;
        if (state.requestDraft.airlineIds.length > 1) {
          state.requestDraft.airlineIds = state.requestDraft.airlineIds.filter(function (id) { return id !== rid; });
          state.selectedAirlineIds = state.requestDraft.airlineIds.slice();
          render();
        }
        break;
      }

      case 'builder-pax-step': {
        var dirb = +el.dataset.dir;
        state.requestDraft.pax = Math.max(10, state.requestDraft.pax + dirb);
        render();
        break;
      }

      case 'set-flex':
        state.requestDraft.dateFlexibility = el.dataset.value;
        state.builderErrors.dateFlexibility = false;
        render();
        break;

      case 'set-reason':
        state.requestDraft.tripReason = el.dataset.value;
        state.builderErrors.tripReason = false;
        render();
        break;

      case 'builder-continue':
        if (!isStep1Valid()) {
          state.builderErrors = { general: true };
          render();
          break;
        }
        state.builderErrors = {};
        state.builderStep = 2;
        render();
        break;

      case 'builder-back-step1':
        state.builderStep = 1;
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
          var fail = /fail/i.test(d.comments) || /fail/i.test(d.baggage);
          if (fail) {
            state.builderSubmitState = 'error';
            render();
            return;
          }
          var id = 'GR-' + (state.requestCounter++);
          var createdAt = new Date();
          state.groupRequests.push({
            id: id, from: d.from, fromCode: d.fromCode || guessCode(d.from, 'WAW'),
            to: d.to, toCode: d.toCode || guessCode(d.to, 'CDG'),
            departure: d.departure, ret: d.return, pax: d.pax, createdAt: createdAt,
            dateFlexibility: d.dateFlexibility, tripReason: d.tripReason,
            baggage: d.baggage, comments: d.comments,
            offers: d.airlineIds.map(function (aid) { return { airlineId: aid, status: 'calculating' }; })
          });
          state.lastCreatedRequestId = id;
          state.builderSubmitState = 'success';
          render();
        }, 1200);
        break;
      }

      case 'goto-bookings-from-success':
        state.page = 'bookings';
        state.bookingsTab = 'groups';
        state.bookingsSelected = { type: 'group', id: state.lastCreatedRequestId };
        render();
        break;

      case 'set-bookings-tab': {
        state.bookingsTab = el.dataset.tab;
        var firstItem = bookingsListItems()[0];
        state.bookingsSelected = firstItem ? { type: firstItem.type, id: firstItem.id } : null;
        render();
        break;
      }

      case 'select-booking':
        state.bookingsSelected = { type: el.dataset.type, id: el.dataset.id };
        render();
        break;

      case 'copy-option': {
        var copyText = el.dataset.copy;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(copyText).then(function () {
            pushToast({ title: 'Copied to clipboard', duration: 2200 });
          }).catch(function () {
            pushToast({ title: 'Could not copy', variant: 'error', duration: 2200 });
          });
        }
        break;
      }

      case 'open-offer':
        state.currentOffer = { requestId: el.dataset.request, airlineId: el.dataset.airline };
        state.page = 'offer-details';
        render();
        break;

      case 'offer-back-to-bookings':
        state.page = 'bookings';
        render();
        break;

      case 'accept-offer': {
        var refA = state.currentOffer;
        var reqA = state.groupRequests.filter(function (r) { return r.id === refA.requestId; })[0];
        var offA = reqA.offers.filter(function (x) { return x.airlineId === refA.airlineId; })[0];
        var prevStatus = offA.status;
        offA.status = 'accepted';
        offA.acceptedAt = new Date();
        render();
        var toastId = pushToast({
          title: 'Offer accepted',
          text: 'The offer is now on hold. Check the payment deadline in the offer details.',
          actionLabel: 'Undo',
          duration: 5000
        });
        var toastObj = state.toasts.filter(function (t) { return t.id === toastId; })[0];
        if (toastObj) toastObj.onAction = function () {
          offA.status = prevStatus;
          render();
        };
        break;
      }

      case 'open-decline-modal':
        state.declineModal = { requestId: state.currentOffer.requestId, airlineId: state.currentOffer.airlineId, reason: '', comment: '', error: false };
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
        var reqD = state.groupRequests.filter(function (r) { return r.id === m.requestId; })[0];
        var offD = reqD.offers.filter(function (x) { return x.airlineId === m.airlineId; })[0];
        var prevStatusD = offD.status;
        offD.status = 'declined';
        offD.declineReason = m.reason;
        offD.declineComment = m.comment;
        state.declineModal = null;
        render();
        var toastIdD = pushToast({ title: 'Offer declined', actionLabel: 'Undo', duration: 5000 });
        var toastObjD = state.toasts.filter(function (t) { return t.id === toastIdD; })[0];
        if (toastObjD) toastObjD.onAction = function () {
          offD.status = prevStatusD;
          delete offD.declineReason;
          delete offD.declineComment;
          render();
        };
        break;
      }

      case 'toast-action': {
        var tid = el.dataset.toast;
        var t = state.toasts.filter(function (x) { return x.id === tid; })[0];
        if (t && t.onAction) t.onAction();
        removeToast(tid);
        break;
      }
      case 'toast-close':
        removeToast(el.dataset.toast);
        break;
    }
  }

  function guessCode(text, fallback) {
    if (!text) return fallback;
    var t = text.trim().toUpperCase();
    if (/^[A-Z]{3}$/.test(t)) return t;
    return t.slice(0, 3) || fallback;
  }

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
    if (!field) return;
    set(field, e.target.value, state);
    var fieldEl = e.target.closest('.search-field, .summary-field');
    if (fieldEl) fieldEl.classList.remove('is-invalid');
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

  /* ----------------------------------------------------------------
     INIT
  ---------------------------------------------------------------- */
  document.addEventListener('click', onClick);
  document.addEventListener('input', onInput);
  document.addEventListener('change', onChange);
  document.getElementById('navSearch').addEventListener('click', function () {
    state.page = 'search';
    render();
  });
  document.getElementById('navBookings').addEventListener('click', function () {
    state.page = 'bookings';
    render();
  });

  render();
})();
