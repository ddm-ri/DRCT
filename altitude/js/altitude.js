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

  /* ---------------- Animated step tiles (How it works) ---------------- */
  var stepsGrid = document.getElementById('stepsGrid');
  if (stepsGrid) {
    var tiles = Array.prototype.slice.call(stepsGrid.querySelectorAll('.step-tile'));
    var current = 0;
    var autoplay = true;
    var timer;

    function setActive(idx) {
      current = idx;
      tiles.forEach(function (tile, i) {
        tile.classList.toggle('active', i === idx);
      });
    }

    function tick() {
      if (!autoplay) return;
      setActive((current + 1) % tiles.length);
    }

    setActive(0);
    timer = setInterval(tick, 1900);

    tiles.forEach(function (tile, i) {
      tile.addEventListener('click', function () {
        autoplay = false;
        clearInterval(timer);
        setActive(i);
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

});
