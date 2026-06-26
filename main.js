/* ================================================================
   DRCT LANDING PAGE — INTERACTIONS
================================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------------------------------------------------------------
     MOBILE MENU
  --------------------------------------------------------------- */
  var menuToggle  = document.getElementById('menuToggle');
  var mobileMenu  = document.getElementById('mobileMenu');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      menuToggle.classList.toggle('active', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  /* ---------------------------------------------------------------
     FAQ ACCORDION
  --------------------------------------------------------------- */
  var faqItems = document.querySelectorAll('#faqList li');

  faqItems.forEach(function (item) {
    var heading = item.querySelector('h3');
    if (!heading) return;

    function toggle() {
      var isActive = item.classList.contains('active');
      faqItems.forEach(function (el) {
        el.classList.remove('active');
        var h = el.querySelector('h3');
        if (h) h.setAttribute('aria-expanded', 'false');
      });
      if (!isActive) {
        item.classList.add('active');
        heading.setAttribute('aria-expanded', 'true');
      }
    }

    heading.addEventListener('click', toggle);
    heading.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  /* ---------------------------------------------------------------
     ONE-PLACE TABS (desktop accordion)
  --------------------------------------------------------------- */
  var options = document.querySelectorAll('.one-place__option');

  options.forEach(function (opt) {
    opt.addEventListener('click', function () {
      var idx = parseInt(opt.dataset.index, 10);

      // Toggle: if already active, close it
      var alreadyActive = opt.classList.contains('active');
      options.forEach(function (o) {
        o.classList.remove('active');
        var span = o.querySelector('span');
        if (span) span.classList.remove('active');
      });

      if (!alreadyActive) {
        opt.classList.add('active');
        var span = opt.querySelector('span');
        if (span) span.classList.add('active');
        updateOnePlaceMock(idx);
      }
    });
  });

  function updateOnePlaceMock(idx) {
    var mock = document.querySelector('.one-place__screenshot-wrap .drct-mock');
    if (!mock) return;

    var configs = [
      {
        tabs: ['Search', 'Bookings', 'Reports'],
        activeTab: 0,
        rows: [
          { airline: 'LH', flight: 'LH 900', extra: '07:00 – 09:45', price: '€ 189', ndc: true, active: true },
          { airline: 'LH', flight: 'LH 924', extra: '10:15 – 13:00', price: '€ 245', ndc: false },
          { airline: 'LH', flight: 'LH 938', extra: '14:30 – 17:10', price: '€ 164', ndc: false },
        ]
      },
      {
        tabs: ['Search', 'Bookings', 'Reports'],
        activeTab: 1,
        rows: [
          { airline: 'LH', flight: 'WRSXYZ', extra: 'LHR → FRA 15 Feb', price: 'Confirmed', ndc: true, active: true },
          { airline: 'BA', flight: 'KFMNPQ', extra: 'LGW → CDG 18 Feb', price: 'Ticketed', ndc: false },
        ]
      },
      {
        tabs: ['Search', 'Bookings', 'Admin'],
        activeTab: 2,
        rows: [
          { airline: '', flight: 'Active users', extra: '', price: '3', ndc: false, active: true },
          { airline: '', flight: 'Agency balance', extra: '', price: '$2,400', ndc: true },
          { airline: '', flight: 'Subagents', extra: '', price: '2 linked', ndc: false },
        ]
      },
      {
        tabs: ['Changes', 'Refunds', 'Voids'],
        activeTab: 0,
        rows: [
          { airline: 'LH', flight: 'WRSXYZ', extra: 'Date change', price: 'Available', ndc: true, active: true },
          { airline: 'BA', flight: 'KFMNPQ', extra: 'Void', price: '18h left', ndc: false },
          { airline: 'EK', flight: 'TQPWMN', extra: 'Refund', price: 'Pending', ndc: false },
        ]
      }
    ];

    var cfg = configs[idx] || configs[0];
    var tabsHtml = cfg.tabs.map(function (t, i) {
      return '<li class="drct-mock__tab' + (i === cfg.activeTab ? ' active' : '') + '">' + t + '</li>';
    }).join('');

    var rowsHtml = cfg.rows.map(function (r) {
      var active = r.active ? ' active-row' : '';
      var priceClass = r.ndc ? ' drct-mock__price--ndc' : '';
      var ndcBadge = r.ndc ? '<em>NDC</em>' : '';
      var airlineHtml = r.airline ? '<span class="drct-mock__airline">' + r.airline + '</span>' : '';
      var timeHtml = r.extra ? '<span class="drct-mock__time">' + r.extra + '</span>' : '<span class="drct-mock__time"></span>';
      return '<div class="drct-mock__result' + active + '">'
        + airlineHtml
        + '<span class="drct-mock__flight">' + r.flight + '</span>'
        + timeHtml
        + '<span class="drct-mock__price' + priceClass + '">' + r.price + ' ' + ndcBadge + '</span>'
        + '</div>';
    }).join('');

    mock.innerHTML =
      '<div class="drct-mock__bar"><ul class="drct-mock__tabs">' + tabsHtml + '</ul></div>' +
      '<div class="drct-mock__search drct-mock__search--' + idx + '" style="display:' + (idx === 0 ? 'flex' : 'none') + ';">' +
        '<div class="drct-mock__field"><span>From</span><strong>London LHR</strong></div>' +
        '<div class="drct-mock__field"><span>To</span><strong>Frankfurt FRA</strong></div>' +
        '<div class="drct-mock__field"><span>Date</span><strong>15 Feb</strong></div>' +
      '</div>' +
      '<div class="drct-mock__results">' + rowsHtml + '</div>';
  }

  /* ---------------------------------------------------------------
     ONE-PLACE CAROUSEL (mobile)
  --------------------------------------------------------------- */
  var carouselTrack = document.getElementById('carouselTrack');
  var carouselDots  = document.querySelectorAll('#carouselNav span');
  var currentSlide  = 0;
  var totalSlides   = carouselDots.length;

  function goToSlide(idx) {
    if (!carouselTrack) return;
    currentSlide = idx;
    carouselTrack.style.transform = 'translateX(-' + (idx * 100) + '%)';
    carouselTrack.style.transition = 'transform 0.3s ease';
    carouselDots.forEach(function (d, i) {
      d.classList.toggle('active', i === idx);
    });
  }

  carouselDots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      goToSlide(parseInt(dot.dataset.slide, 10));
    });
  });

  // Swipe support for mobile carousel
  if (carouselTrack) {
    var touchStartX = 0;
    carouselTrack.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    carouselTrack.addEventListener('touchend', function (e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        if (diff > 0 && currentSlide < totalSlides - 1) goToSlide(currentSlide + 1);
        else if (diff < 0 && currentSlide > 0) goToSlide(currentSlide - 1);
      }
    }, { passive: true });
  }

  /* ---------------------------------------------------------------
     SAVINGS CALCULATOR
  --------------------------------------------------------------- */
  var slider            = document.getElementById('savingsSlider');
  var dot               = document.getElementById('savingsDot');
  var trackFill         = document.getElementById('savingsTrackFill');
  var amountDesktop     = document.getElementById('savingsAmountDesktop');
  var ticketsDesktop    = document.getElementById('savingsTicketsDesktop');
  var amountMobile      = document.getElementById('savingsAmountMobile');
  var ticketsMobile     = document.getElementById('savingsTicketsMobile');
  var tooltipDesktop    = document.getElementById('savingsTooltipDesktop');

  function calcSavings(tickets) {
    // Rough estimate: ~$2 avg saving per NDC ticket
    return Math.round(tickets * 2);
  }

  function formatNumber(n) {
    return n.toLocaleString('en-US');
  }

  function updateSavings() {
    if (!slider) return;
    var val    = parseInt(slider.value, 10);
    var saving = calcSavings(val);
    var label  = '$' + formatNumber(saving);

    if (amountDesktop)  amountDesktop.textContent  = label;
    if (ticketsDesktop) ticketsDesktop.textContent  = formatNumber(val);
    if (amountMobile)   amountMobile.textContent    = label;
    if (ticketsMobile)  ticketsMobile.textContent   = formatNumber(val);

    // Move custom dot
    updateDotPosition();
  }

  function updateDotPosition() {
    if (!slider || !dot) return;
    var min   = parseInt(slider.min, 10);
    var max   = parseInt(slider.max, 10);
    var val   = parseInt(slider.value, 10);
    var pct   = (val - min) / (max - min);          // 0..1
    var trackW = slider.offsetWidth;
    var pad    = 20;                                  // matches CSS padding: 0 20px
    var usable = trackW - pad * 2;
    var leftPx = pad + pct * usable;

    dot.style.left = leftPx + 'px';

    // Update filled track width
    if (trackFill) {
      trackFill.style.width = (leftPx - pad) + 'px';
    }

    // Also move desktop tooltip to follow dot on wide screens
    if (tooltipDesktop && window.innerWidth > 1024) {
      tooltipDesktop.style.marginLeft = Math.max(0, leftPx - 130) + 'px';
    }
  }

  if (slider) {
    slider.addEventListener('input', updateSavings);
    slider.addEventListener('change', updateSavings);
    // Init
    updateSavings();
    window.addEventListener('resize', updateDotPosition);
  }

  /* ---------------------------------------------------------------
     TERMINAL DEMO
  --------------------------------------------------------------- */
  var termInput   = document.getElementById('terminalCommand');
  var popover     = document.getElementById('terminalPopover');
  var popCmd      = document.getElementById('popoverCommand');
  var popResult   = document.getElementById('popoverResult');
  var resultArea  = document.getElementById('terminalResultArea');
  var changePnr   = document.getElementById('changePnr');

  var demoData = {
    'FQD LON/LH/D15FEB': {
      result: '01 Y EUR 245.00 NDC Q EUR 0.00\n02 M EUR 189.00 NDC Q EUR 0.00\n03 B EUR 164.00 NDC Q EUR 0.00\n04 K EUR 129.00 NDC Q EUR 0.00'
    },
    'FQD JFK/BA/D20MAR': {
      result: '01 F USD 4120.00 NDC Q USD 0.00\n02 J USD 2890.00 NDC Q USD 0.00\n03 Y USD  890.00 NDC Q USD 0.00\n04 H USD  645.00 NDC Q USD 0.00'
    },
    'FQD CDG/AF/D08APR': {
      result: '01 P EUR 3200.00 NDC Q EUR 0.00\n02 C EUR 1890.00 NDC Q EUR 0.00\n03 Y EUR  345.00 NDC Q EUR 0.00\n04 B EUR  220.00 NDC Q EUR 0.00'
    },
    'FQD DXB/EK/D12MAR': {
      result: '01 F USD 8900.00 NDC Q USD 0.00\n02 J USD 4200.00 NDC Q USD 0.00\n03 Y USD  780.00 NDC Q USD 0.00\n04 M USD  540.00 NDC Q USD 0.00'
    }
  };

  function runCommand(cmd) {
    var cmdUpper = cmd.trim().toUpperCase();
    if (termInput) termInput.value = cmdUpper;

    var data = demoData[cmdUpper];
    if (!data) return;

    if (popCmd)    popCmd.textContent    = '> ' + cmdUpper;
    if (popResult) popResult.textContent = data.result;

    if (resultArea) {
      resultArea.innerHTML =
        '<div class="terminal-result has-command">'
        + '<i>&gt;<span>' + cmdUpper + '</span></i>'
        + '<p>' + escHtml(data.result) + '</p>'
        + '</div>';
    }

    if (popover) {
      setTimeout(function () {
        popover.classList.add('active');
      }, 400);
    }
  }

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // Clickable preset commands
  document.querySelectorAll('.terminal-commands li').forEach(function (li) {
    li.addEventListener('click', function () {
      var cmd = li.dataset.cmd;
      if (cmd) runCommand(cmd);
    });
  });

  // Type and Enter in input
  if (termInput) {
    termInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        runCommand(termInput.value);
      }
    });
  }

  // "Try another itinerary" resets the demo
  if (changePnr) {
    changePnr.addEventListener('click', function (e) {
      e.preventDefault();
      if (popover) popover.classList.remove('active');
      if (termInput) termInput.value = '';
      if (resultArea) resultArea.innerHTML = '';
    });
  }

  /* ---------------------------------------------------------------
     TESTIMONIALS SLIDER
  --------------------------------------------------------------- */
  var tcTrack   = document.getElementById('tcTrack');
  var tcLabel   = document.getElementById('tcNavLabel');
  var tcCards   = document.querySelectorAll('.tc-card');
  var tcNames   = ['Lufthansa', 'Emirates'];
  var tcIndex   = 0;
  var tcTotal   = tcCards.length;

  function goToTc(idx) {
    tcIndex = (idx + tcTotal) % tcTotal;
    if (tcTrack) tcTrack.style.transform = 'translateX(-' + (tcIndex * 100) + '%)';
    if (tcLabel) tcLabel.textContent = tcNames[tcIndex];
  }

  var tcPrev    = document.getElementById('tcPrev');
  var tcNext    = document.getElementById('tcNext');
  var tcNavPrev = document.getElementById('tcNavPrev');
  var tcNavNext = document.getElementById('tcNavNext');

  if (tcPrev)    tcPrev.addEventListener('click',    function () { goToTc(tcIndex - 1); });
  if (tcNext)    tcNext.addEventListener('click',    function () { goToTc(tcIndex + 1); });
  if (tcNavPrev) tcNavPrev.addEventListener('click', function () { goToTc(tcIndex - 1); });
  if (tcNavNext) tcNavNext.addEventListener('click', function () { goToTc(tcIndex + 1); });

  /* ---------------------------------------------------------------
     BENEFITS — SHOW MORE / HIDE
  --------------------------------------------------------------- */
  var benefitsToggle = document.getElementById('benefitsToggle');
  var benefitItems   = document.querySelectorAll('.benefit__item');
  var showingAll     = false;

  // Only hide items when a toggle button exists (grid layout shows all)
  if (benefitsToggle) {
    benefitItems.forEach(function (item, i) {
      if (i >= 3) item.classList.add('hidden');
    });
    benefitsToggle.addEventListener('click', function (e) {
      e.preventDefault();
      showingAll = !showingAll;
      benefitItems.forEach(function (item, i) {
        if (i >= 3) item.classList.toggle('hidden', !showingAll);
      });
      benefitsToggle.textContent = showingAll ? 'Hide' : 'View more';
    });
  }

  /* ---------------------------------------------------------------
     COOKIE BANNER
  --------------------------------------------------------------- */
  var cookieBanner = document.getElementById('cookieBanner');
  var cookieAccept = document.getElementById('cookieAccept');

  if (cookieBanner && !localStorage.getItem('drct-cookie')) {
    cookieBanner.style.display = 'flex';
  }
  if (cookieAccept) {
    cookieAccept.addEventListener('click', function () {
      localStorage.setItem('drct-cookie', 'true');
      if (cookieBanner) cookieBanner.style.display = 'none';
    });
  }

  /* ---------------------------------------------------------------
     HERO PARALLAX — airlines and chips drift opposite each other
     on mouse movement, creating depth without explicit connectors
  --------------------------------------------------------------- */
  var heroEl  = document.querySelector('.hero-centered');
  var alWrap  = document.querySelector('.hc-al-wrap');
  var chipWrap = document.querySelector('.hc-chips');

  if (heroEl && alWrap && chipWrap) {
    heroEl.addEventListener('mousemove', function (e) {
      var rect = heroEl.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width  - 0.5) * 8;
      var y = ((e.clientY - rect.top)  / rect.height - 0.5) * 5;

      alWrap.style.transition  = 'none';
      chipWrap.style.transition = 'none';
      alWrap.style.transform   = 'translate(' + (-x * 0.42) + 'px,' + (-y * 0.32) + 'px)';
      chipWrap.style.transform  = 'translate(' + ( x * 0.42) + 'px,' + (-y * 0.32) + 'px)';
    });

    heroEl.addEventListener('mouseleave', function () {
      var ease = 'transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)';
      alWrap.style.transition  = ease;
      chipWrap.style.transition = ease;
      alWrap.style.transform   = '';
      chipWrap.style.transform  = '';
    });
  }

  /* ---------------------------------------------------------------
     DEMO LINKS (Typeform placeholder)
  --------------------------------------------------------------- */
  document.querySelectorAll('[data-demo]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      // In production this opens the Typeform popup
      // Here we just prevent navigation
      alert('Demo request form would open here.');
    });
  });

});
