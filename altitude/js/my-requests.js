/* ================================================================
   ALTITUDE — MY REQUESTS
   One request-card system, two request types (upgrade / promo),
   filtered along two independent dimensions:
     - type   -> segmented tabs
     - status -> dropdown
================================================================ */
(function () {
  'use strict';

  /* --------------------------------------------------------------
     ICONS (Lucide-style, inline so the page stays self-contained)
  -------------------------------------------------------------- */
  var ICONS = {
    loaderCircle:
      '<svg class="ico ico--spin" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M21 12a9 9 0 1 1-6.22-8.56" opacity=".95"/>' +
      '<path d="M3 12a9 9 0 0 1 .35-2.5" opacity=".25"/></svg>',

    refreshCw:
      '<svg class="ico ico--spin" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M20 11a8 8 0 0 0-13.6-4.6L3.5 9"/><path d="M3.5 4.5V9H8"/>' +
      '<path d="M4 13a8 8 0 0 0 13.6 4.6l2.9-2.6"/><path d="M20.5 19.5V15H16"/></svg>',

    badgeCheck:
      '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M12 2.6l2.2 1.9 2.9-.3 1.1 2.7 2.6 1.3-.6 2.9.6 2.9-2.6 1.3-1.1 2.7-2.9-.3L12 21.4l-2.2-1.9-2.9.3-1.1-2.7L3.2 15l.6-2.9-.6-2.9 2.6-1.3 1.1-2.7 2.9.3z"/>' +
      '<path d="M8.6 12.2l2.3 2.3 4.5-4.6"/></svg>',

    clock:
      '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">' +
      '<circle cx="12" cy="13" r="8"/><path d="M12 9.2V13l2.4 1.6"/><path d="M9 2.5h6"/></svg>',

    copy:
      '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">' +
      '<rect x="9" y="9" width="11" height="11" rx="2.5"/>' +
      '<path d="M5.5 15H5a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 5 3.5h8.5A1.5 1.5 0 0 1 15 5v.5"/></svg>',

    check:
      '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
  };

  /* --------------------------------------------------------------
     AIRLINE MARKS
     Placeholder roundels — swap `mark` for the real asset
     (`<img src="...">`) when wiring this into the app.
  -------------------------------------------------------------- */
  var AIRLINES = {
    TK: {
      name: 'Turkish Airlines',
      mark:
        '<svg viewBox="0 0 40 40" aria-hidden="true">' +
        '<circle cx="20" cy="20" r="20" fill="#e81932"/>' +
        '<path fill="#fff" d="M27.4 12.6c-4.9-1.1-9.5 1.3-11.2 5.6-1.6 4.2.4 8.7 4.6 10.6-5.9-.3-9.9-4.6-9.9-10 0-6 4.9-10.4 10.9-9.9 2.1.2 4 1 5.6 2.3z"/>' +
        '<path fill="#fff" d="M24.6 19.7l3.4-1.1-2.1 2.9 2.1 2.9-3.4-1.1-2.1 2.9v-3.6l-3.4-1.1 3.4-1.1v-3.6z"/></svg>'
    },
    A3: {
      name: 'Aegean Airlines',
      mark:
        '<svg viewBox="0 0 40 40" aria-hidden="true">' +
        '<circle cx="20" cy="20" r="20" fill="#00337f"/>' +
        '<path fill="#fff" d="M20.6 10.4l8.6 19.2h-4.6l-1.7-4H16l3.1-3.7h2.2l-1.9-4.5-6.2 12.2H8.6z"/></svg>'
    }
  };

  /* --------------------------------------------------------------
     STATUS DEFINITIONS
     `group` maps every state onto the status filter dimension.
  -------------------------------------------------------------- */
  var STATES = {
    /* --- Upgrade lifecycle --- */
    pricing: {
      group: 'progress',
      tone: 'progress',
      icon: ICONS.loaderCircle,
      title: 'Pricing in progress',
      description: 'We’re still pricing this request. You’ll be able to pay as soon as the final upgrade price is confirmed.'
    },
    upgradeAvailable: {
      group: 'action',
      tone: 'action',
      icon: ICONS.badgeCheck,
      title: 'Upgrade available',
      description: 'Your upgrade price has been confirmed. Complete the payment to continue with your request.'
    },
    upgradeProcessing: {
      group: 'progress',
      tone: 'progress',
      icon: ICONS.refreshCw,
      title: 'Upgrade in progress',
      description: 'Your payment was received. We’re confirming the upgrade with the airline.'
    },
    upgradeConfirmed: {
      group: 'done',
      tone: 'done',
      icon: ICONS.badgeCheck,
      title: 'Upgrade confirmed',
      description: 'Your upgrade has been confirmed. You can view the updated booking details in your request.'
    },

    /* --- Promo code lifecycle --- */
    promoProcessing: {
      group: 'progress',
      tone: 'progress',
      icon: ICONS.loaderCircle,
      title: 'Promo code in progress',
      description: 'We’re preparing your promo code. No action is required from you.'
    },
    promoReady: {
      group: 'done',
      tone: 'done',
      icon: ICONS.badgeCheck,
      title: 'Promo code ready',
      description: 'Your promo code is ready to use.'
    }
  };

  var TYPE_LABELS = { upgrade: 'Upgrade', promo: 'Promo code' };

  var WAITING_NOTE = 'Usually takes up to 30 min';

  /* --------------------------------------------------------------
     DATA
     A realistic mix of both request types.
  -------------------------------------------------------------- */
  var REQUESTS = [
    { id: 'r1', type: 'upgrade', airline: 'TK', passenger: 'SMITH', pnr: 'BAE567', state: 'pricing' },
    { id: 'r2', type: 'upgrade', airline: 'TK', passenger: 'SMITH', pnr: 'BAE567', state: 'upgradeAvailable', amount: '€40.00' },
    { id: 'r3', type: 'promo',   airline: 'TK', passenger: 'SMITH', pnr: 'BAE567', state: 'promoReady', code: 'ALTITUDE20' },
    { id: 'r4', type: 'upgrade', airline: 'TK', passenger: 'SMITH', pnr: 'BAE567', state: 'upgradeProcessing' },
    { id: 'r5', type: 'promo',   airline: 'A3', passenger: 'HANKS', pnr: 'DFG123', state: 'promoProcessing' },
    { id: 'r6', type: 'upgrade', airline: 'TK', passenger: 'SMITH', pnr: 'BAE567', state: 'upgradeConfirmed', amount: '€40.00' }
  ];

  /* --------------------------------------------------------------
     STATE
  -------------------------------------------------------------- */
  var activeType = 'all';
  var activeStatus = 'all';

  var list        = document.getElementById('requestsList');
  var empty       = document.getElementById('requestsEmpty');
  var tabs        = document.getElementById('typeTabs');
  var filter      = document.getElementById('statusFilter');
  var filterBtn   = document.getElementById('statusFilterButton');
  var filterLabel = document.getElementById('statusFilterLabel');
  var filterMenu  = document.getElementById('statusFilterMenu');
  var live        = document.getElementById('liveRegion');

  /* --------------------------------------------------------------
     HELPERS
  -------------------------------------------------------------- */
  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function matchesStatus(request) {
    return activeStatus === 'all' || STATES[request.state].group === activeStatus;
  }

  function matchesType(request, type) {
    return type === 'all' || request.type === type;
  }

  function visibleRequests() {
    return REQUESTS.filter(function (request) {
      return matchesType(request, activeType) && matchesStatus(request);
    });
  }

  /* --------------------------------------------------------------
     CONTEXTUAL ACTION (right side of the bottom row)
  -------------------------------------------------------------- */
  function actionMarkup(request) {
    var state = STATES[request.state];

    if (request.state === 'upgradeAvailable') {
      return '<button class="rq__cta" type="button">Pay ' + esc(request.amount) + '</button>';
    }

    if (request.state === 'upgradeConfirmed') {
      return '<div class="rq__paid">' +
               '<span class="rq__paid-label">Total paid</span>' +
               '<span class="rq__paid-value">' + esc(request.amount) + '</span>' +
             '</div>';
    }

    if (request.state === 'promoReady') {
      return '<div class="rq__promo">' +
               '<span class="rq__code">' + esc(request.code) + '</span>' +
               '<button class="rq__copy" type="button" data-copy="' + esc(request.code) + '">' +
                 ICONS.copy + '<span class="rq__copy-text">Copy</span>' +
               '</button>' +
             '</div>';
    }

    if (state.group === 'progress') {
      return '<span class="rq__meta">' + ICONS.clock + WAITING_NOTE + '</span>';
    }

    return '';
  }

  /* --------------------------------------------------------------
     CARD
  -------------------------------------------------------------- */
  function cardMarkup(request) {
    var state = STATES[request.state];
    var airline = AIRLINES[request.airline];

    return '' +
      '<article class="rq" role="listitem" data-id="' + esc(request.id) + '">' +
        '<div class="rq__top">' +
          '<div class="rq__identity">' +
            '<span class="rq__logo">' + airline.mark + '</span>' +
            '<span class="rq__airline">' + esc(airline.name) + '</span>' +
            '<span class="rq__sep" aria-hidden="true">·</span>' +
            '<span class="rq__type">' + esc(TYPE_LABELS[request.type]) + '</span>' +
          '</div>' +
          '<div class="rq__booking">' +
            '<div class="rq__field">' +
              '<span class="rq__label">Passenger</span>' +
              '<span class="rq__value">' + esc(request.passenger) + '</span>' +
            '</div>' +
            '<div class="rq__field">' +
              '<span class="rq__label">PNR</span>' +
              '<span class="rq__value">' + esc(request.pnr) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="rq__bottom">' +
          '<div class="rq__status">' +
            '<span class="rq__icon rq__icon--' + state.tone + '">' + state.icon + '</span>' +
            '<div class="rq__statustext">' +
              '<h3 class="rq__statustitle">' + esc(state.title) + '</h3>' +
              '<p class="rq__statusdesc">' + esc(state.description) + '</p>' +
            '</div>' +
          '</div>' +
          '<div class="rq__action">' + actionMarkup(request) + '</div>' +
        '</div>' +
      '</article>';
  }

  /* --------------------------------------------------------------
     RENDER
  -------------------------------------------------------------- */
  function renderCounts() {
    ['all', 'upgrade', 'promo'].forEach(function (type) {
      var node = tabs.querySelector('[data-count="' + type + '"]');
      if (!node) return;
      node.textContent = REQUESTS.filter(function (request) {
        return matchesType(request, type) && matchesStatus(request);
      }).length;
    });
  }

  function render() {
    var items = visibleRequests();

    list.innerHTML = items.map(cardMarkup).join('');
    empty.hidden = items.length > 0;

    renderCounts();
  }

  /* --------------------------------------------------------------
     TYPE TABS
  -------------------------------------------------------------- */
  tabs.addEventListener('click', function (event) {
    var tab = event.target.closest('.segmented__tab');
    if (!tab || tab.dataset.type === activeType) return;

    activeType = tab.dataset.type;

    Array.prototype.forEach.call(tabs.querySelectorAll('.segmented__tab'), function (node) {
      var isActive = node === tab;
      node.classList.toggle('is-active', isActive);
      node.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    render();
  });

  tabs.addEventListener('keydown', function (event) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;

    var nodes = Array.prototype.slice.call(tabs.querySelectorAll('.segmented__tab'));
    var index = nodes.indexOf(document.activeElement);
    if (index === -1) return;

    event.preventDefault();
    var next = nodes[(index + (event.key === 'ArrowRight' ? 1 : nodes.length - 1)) % nodes.length];
    next.focus();
    next.click();
  });

  /* --------------------------------------------------------------
     STATUS DROPDOWN
  -------------------------------------------------------------- */
  function openMenu() {
    filterMenu.hidden = false;
    filterBtn.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    filterMenu.hidden = true;
    filterBtn.setAttribute('aria-expanded', 'false');
    Array.prototype.forEach.call(filterMenu.children, function (node) {
      node.classList.remove('is-focused');
    });
  }

  filterBtn.addEventListener('click', function () {
    if (filterMenu.hidden) { openMenu(); } else { closeMenu(); }
  });

  filterMenu.addEventListener('click', function (event) {
    var option = event.target.closest('[role="option"]');
    if (!option) return;

    activeStatus = option.dataset.status;
    filterLabel.textContent = option.querySelector('span').textContent;

    Array.prototype.forEach.call(filterMenu.children, function (node) {
      node.setAttribute('aria-selected', node === option ? 'true' : 'false');
    });

    closeMenu();
    filterBtn.focus();
    render();
  });

  document.addEventListener('click', function (event) {
    if (!filterMenu.hidden && !filter.contains(event.target)) closeMenu();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !filterMenu.hidden) {
      closeMenu();
      filterBtn.focus();
    }
  });

  /* --------------------------------------------------------------
     COPY PROMO CODE — secondary utility action
  -------------------------------------------------------------- */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      var field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();

      try {
        document.execCommand('copy') ? resolve() : reject();
      } catch (error) {
        reject(error);
      } finally {
        document.body.removeChild(field);
      }
    });
  }

  list.addEventListener('click', function (event) {
    var button = event.target.closest('[data-copy]');
    if (!button) return;

    var code = button.dataset.copy;

    copyText(code).then(function () {
      var label = button.querySelector('.rq__copy-text');
      var icon = button.querySelector('.ico');

      if (button.dataset.timer) clearTimeout(Number(button.dataset.timer));

      button.classList.add('is-copied');
      label.textContent = 'Copied';
      icon.outerHTML = ICONS.check;
      live.textContent = 'Promo code ' + code + ' copied';

      button.dataset.timer = setTimeout(function () {
        button.classList.remove('is-copied');
        button.querySelector('.rq__copy-text').textContent = 'Copy';
        button.querySelector('.ico').outerHTML = ICONS.copy;
        delete button.dataset.timer;
      }, 1800);
    }).catch(function () {
      live.textContent = 'Could not copy the promo code';
    });
  });

  /* --------------------------------------------------------------
     INIT
  -------------------------------------------------------------- */
  render();
})();
