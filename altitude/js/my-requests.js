/* ================================================================
   ALTITUDE — MY REQUESTS
   One request-card system, two request types (upgrade / promo),
   filtered along two independent dimensions — request type and request
   status — each its own group in the filter panel.
================================================================ */
(function () {
  'use strict';

  var ICONS = ALT_ICONS;

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

  /* The card on file, as shown in the wallet. */
  var CARD = { brand: 'Mastercard', last4: '0076', holder: 'Tom Hanks' };

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

  var list       = document.getElementById('requestsList');
  var empty      = document.getElementById('requestsEmpty');
  var typeFilter = document.getElementById('typeFilter');
  var statusList = document.getElementById('statusFilter');
  var live       = document.getElementById('liveRegion');

  /* --------------------------------------------------------------
     HELPERS
  -------------------------------------------------------------- */
  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function matchesType(request, type) {
    return type === 'all' || request.type === type;
  }

  function matchesStatus(request, status) {
    return status === 'all' || STATES[request.state].group === status;
  }

  function countBy(type, status) {
    return REQUESTS.filter(function (request) {
      return matchesType(request, type) && matchesStatus(request, status);
    }).length;
  }

  /* --------------------------------------------------------------
     CONTEXTUAL ACTION (right side of the bottom row)
  -------------------------------------------------------------- */
  function actionMarkup(request) {
    var state = STATES[request.state];

    if (request.state === 'upgradeAvailable') {
      return '<button class="rq__cta" type="button" data-pay="' + esc(request.id) + '">' +
               'Pay ' + esc(request.amount) + '</button>';
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
     Each dimension counts against the other one's active value, so the
     numbers always describe what selecting that option would show.
  -------------------------------------------------------------- */
  function renderCounts() {
    ['all', 'upgrade', 'promo'].forEach(function (type) {
      typeFilter.querySelector('[data-count-type="' + type + '"]').textContent =
        countBy(type, activeStatus);
    });

    ['all', 'progress', 'action', 'done'].forEach(function (status) {
      statusList.querySelector('[data-count-status="' + status + '"]').textContent =
        countBy(activeType, status);
    });
  }

  function render() {
    var items = REQUESTS.filter(function (request) {
      return matchesType(request, activeType) && matchesStatus(request, activeStatus);
    });

    list.innerHTML = items.map(cardMarkup).join('');
    empty.hidden = items.length > 0;

    renderCounts();
  }

  /* --------------------------------------------------------------
     FILTERS
  -------------------------------------------------------------- */
  function bindFilter(group, attribute, apply) {
    group.addEventListener('click', function (event) {
      var option = event.target.closest('.filters__option');
      if (!option) return;

      apply(option.dataset[attribute]);

      Array.prototype.forEach.call(group.querySelectorAll('.filters__option'), function (node) {
        var isActive = node === option;
        node.classList.toggle('is-active', isActive);
        node.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      render();
    });
  }

  bindFilter(typeFilter, 'type', function (value) { activeType = value; });
  bindFilter(statusList, 'status', function (value) { activeStatus = value; });


  /* --------------------------------------------------------------
     PAYMENT CONFIRMATION
     Only upgrades reach this step — a promo code is never charged.
     Confirming moves the request on to the next state in its
     lifecycle, so the list reflects the payment straight away.
  -------------------------------------------------------------- */
  var payModal   = document.getElementById('payModal');
  var payContext = document.getElementById('payContext');
  var payPrice   = document.getElementById('payPrice');
  var payTotal   = document.getElementById('payTotal');
  var payCardOut = document.getElementById('payCard');
  var payNote    = document.getElementById('payNote');
  var payConfirm = document.getElementById('payConfirm');

  var pending = null;

  function openPayment(request) {
    pending = request;

    payContext.textContent = [
      AIRLINES[request.airline].name,
      request.pnr,
      request.passenger
    ].join(' · ');

    payPrice.textContent = request.amount;
    payTotal.textContent = request.amount;

    payCardOut.innerHTML = 'We’ll charge your <strong>' + esc(CARD.brand) +
      ' •••• ' + esc(CARD.last4) + '</strong> (' + esc(CARD.holder) + ').';

    payNote.textContent = 'One charge of ' + request.amount +
      '. Your card is charged by Stripe — we never see the number.';

    payConfirm.textContent = 'Pay ' + request.amount;
    payConfirm.disabled = false;

    payModal.showModal();
  }

  function closePayment() {
    pending = null;
    payModal.close();
  }

  list.addEventListener('click', function (event) {
    var button = event.target.closest('[data-pay]');
    if (!button) return;

    var request = REQUESTS.filter(function (item) {
      return item.id === button.dataset.pay;
    })[0];

    if (request) openPayment(request);
  });

  document.getElementById('payCancel').addEventListener('click', closePayment);
  document.getElementById('payClose').addEventListener('click', closePayment);

  /* Clicking the backdrop lands on the dialog itself, not the panel. */
  payModal.addEventListener('click', function (event) {
    if (event.target === payModal) closePayment();
  });

  payModal.addEventListener('close', function () { pending = null; });

  payConfirm.addEventListener('click', function () {
    if (!pending) return;

    var request = pending;

    payConfirm.disabled = true;
    payConfirm.textContent = 'Processing…';

    setTimeout(function () {
      request.state = 'upgradeProcessing';
      closePayment();
      render();
      live.textContent = 'Payment received. Your upgrade is now in progress.';
    }, 700);
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
