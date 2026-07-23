document.addEventListener('DOMContentLoaded', function () {

  /* ---------------- Mobile menu ---------------- */
  var menuToggle = document.getElementById('menuToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      menuToggle.classList.toggle('active');
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menuToggle.classList.remove('active');
        mobileMenu.classList.remove('open');
      });
    });
  }

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------------- Animated stepper (How it works) ---------------- */
  var stepper = document.getElementById('stepper');
  if (stepper) {
    var items = Array.prototype.slice.call(stepper.querySelectorAll('.stepper__item'));
    var railFill = stepper.querySelector('.stepper__rail-fill');
    var current = 0;
    var autoplay = true;
    var timer;

    function setStep(idx) {
      current = idx;
      items.forEach(function (item, i) {
        item.classList.toggle('active', i <= idx);
      });
      if (railFill) {
        var pct = items.length > 1 ? (idx / (items.length - 1)) * 100 : 0;
        railFill.style.width = pct + '%';
      }
    }

    function tick() {
      if (!autoplay) return;
      current = (current + 1) % items.length;
      setStep(current);
    }

    setStep(0);
    timer = setInterval(tick, 2200);

    items.forEach(function (item, i) {
      item.addEventListener('click', function () {
        autoplay = false;
        clearInterval(timer);
        setStep(i);
      });
    });
  }

  /* ---------------- Request form: airline "other" reveal ---------------- */
  var airlineSelect = document.getElementById('airlineSelect');
  var manualField = document.getElementById('manualAirlineField');
  if (airlineSelect && manualField) {
    airlineSelect.addEventListener('change', function () {
      var show = airlineSelect.value === 'other';
      manualField.classList.toggle('show', show);
      var input = manualField.querySelector('input');
      if (input) input.required = show;
    });
  }

  var upgradeForm = document.getElementById('upgradeForm');
  if (upgradeForm) {
    upgradeForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = upgradeForm.querySelector('.form-submit-btn');
      if (!btn) return;
      var original = btn.textContent;
      btn.textContent = 'Checking availability…';
      btn.setAttribute('disabled', 'disabled');
      setTimeout(function () {
        btn.textContent = 'Request received ✓';
        setTimeout(function () {
          btn.textContent = original;
          btn.removeAttribute('disabled');
        }, 2600);
      }, 1200);
    });
  }

  /* ---------------- FAQ accordion ---------------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item.open').forEach(function (other) {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-a').style.maxHeight = null;
        }
      });
      if (isOpen) {
        item.classList.remove('open');
        a.style.maxHeight = null;
      } else {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---------------- Dashboard tab switching ---------------- */
  var dashNavButtons = document.querySelectorAll('.dash-nav button[data-panel]');
  var dashPanels = document.querySelectorAll('.dash-panel');
  if (dashNavButtons.length && dashPanels.length) {
    dashNavButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        dashNavButtons.forEach(function (b) { b.classList.remove('active'); });
        dashPanels.forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        var target = document.getElementById(btn.dataset.panel);
        if (target) target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

});
