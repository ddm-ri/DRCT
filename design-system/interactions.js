/* ================================================================
   DRCT DESIGN SYSTEM — INTERACTIONS
   Generic vanilla-JS behaviors for the components in components.css.
   No build step, no dependencies. Include once per page; each
   behavior wires itself up from data-attributes / class hooks, so
   it's safe to include even on pages that don't use every component.
================================================================ */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initAccordion();
    initMobileMenu();
    initMegaMenu();
    initSegmented();
    initRangeSlider();
    initTestimonial();
  });

  /* ---------------------------------------------------------------
     ACCORDION — .accordion__item, toggled via .accordion__trigger
     Add `data-accordion-group` on a shared parent to auto-close
     siblings (FAQ behavior); omit it to let items open independently.
  --------------------------------------------------------------- */
  function initAccordion() {
    document.querySelectorAll('.accordion__item').forEach(function (item) {
      var trigger = item.querySelector('.accordion__trigger');
      if (!trigger) return;

      trigger.addEventListener('click', function () {
        var wasOpen = item.classList.contains('is-open');
        var group = item.closest('[data-accordion-group]');

        if (group) {
          group.querySelectorAll('.accordion__item').forEach(function (el) {
            el.classList.remove('is-open');
          });
        }
        item.classList.toggle('is-open', !wasOpen);
      });
    });
  }

  /* ---------------------------------------------------------------
     MOBILE MENU — [data-menu-toggle] flips .is-open on the target
     referenced by its `data-menu-toggle` attribute value (an id).
  --------------------------------------------------------------- */
  function initMobileMenu() {
    document.querySelectorAll('[data-menu-toggle]').forEach(function (btn) {
      var target = document.getElementById(btn.getAttribute('data-menu-toggle'));
      if (!target) return;

      btn.addEventListener('click', function () {
        var open = target.classList.toggle('is-open');
        btn.classList.toggle('is-active', open);
        document.body.style.overflow = open ? 'hidden' : '';
      });
    });
  }

  /* ---------------------------------------------------------------
     MEGA MENU — .nav-item containing a .mega-menu, opened on hover
     (desktop) or click (touch), matching a short close delay so the
     menu survives the gap between trigger and panel.
  --------------------------------------------------------------- */
  function initMegaMenu() {
    var items = document.querySelectorAll('.nav-item');
    if (!items.length) return;

    var closeTimer;

    function closeAll() {
      items.forEach(function (it) { it.classList.remove('is-open'); });
    }

    items.forEach(function (item) {
      item.addEventListener('mouseenter', function () {
        clearTimeout(closeTimer);
        closeAll();
        item.classList.add('is-open');
      });
      item.addEventListener('mouseleave', function () {
        closeTimer = setTimeout(closeAll, 150);
      });

      var trigger = item.querySelector('.nav-item__trigger, .navbar__link');
      if (trigger) {
        trigger.addEventListener('click', function (e) {
          if (!item.querySelector('.mega-menu')) return;
          e.preventDefault();
          var isOpen = item.classList.contains('is-open');
          closeAll();
          item.classList.toggle('is-open', !isOpen);
        });
      }
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav-item')) closeAll();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll();
    });
  }

  /* ---------------------------------------------------------------
     SEGMENTED CONTROL — .segmented > .segmented__btn
     Toggles `.is-active`; pairs with [data-panel] targets sharing
     the button's `data-target` attribute for tab-style panel swaps.
  --------------------------------------------------------------- */
  function initSegmented() {
    document.querySelectorAll('.segmented').forEach(function (group) {
      var btns = group.querySelectorAll('.segmented__btn');
      btns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          btns.forEach(function (b) { b.classList.remove('is-active'); });
          btn.classList.add('is-active');

          var targetSelector = btn.getAttribute('data-target');
          if (!targetSelector) return;
          document.querySelectorAll('[data-panel]').forEach(function (panel) {
            panel.classList.toggle('is-active', panel.getAttribute('data-panel') === targetSelector);
          });
        });
      });
    });
  }

  /* ---------------------------------------------------------------
     RANGE SLIDER — .range-slider wrapping .range-slider__input,
     optionally with .range-slider__fill / .range-slider__bubble.
  --------------------------------------------------------------- */
  function initRangeSlider() {
    document.querySelectorAll('.range-slider').forEach(function (wrap) {
      var input = wrap.querySelector('.range-slider__input');
      var fill = wrap.querySelector('.range-slider__fill');
      var bubble = wrap.querySelector('.range-slider__bubble');
      if (!input) return;

      function update() {
        var min = Number(input.min) || 0;
        var max = Number(input.max) || 100;
        var pct = (Number(input.value) - min) / (max - min);
        var trackWidth = input.offsetWidth - 40; // 20px padding each side
        var x = 20 + pct * trackWidth;

        if (fill) fill.style.width = (x - 20) + 'px';
        if (bubble) bubble.style.left = x + 'px';

        wrap.dispatchEvent(new CustomEvent('range:update', { detail: { value: Number(input.value), pct: pct } }));
      }

      input.addEventListener('input', update);
      window.addEventListener('resize', update);
      update();
    });
  }

  /* ---------------------------------------------------------------
     TESTIMONIAL SLIDER — .testimonial[data-index] siblings inside
     a [data-testimonial-wrap], stepped by .testimonial__dot buttons
     and auto-advanced every 6s (paused on hover).
  --------------------------------------------------------------- */
  function initTestimonial() {
    document.querySelectorAll('[data-testimonial-wrap]').forEach(function (wrap) {
      var slides = wrap.querySelectorAll('.testimonial');
      var dots = wrap.querySelectorAll('.testimonial__dot');
      if (!slides.length) return;

      var idx = 0;
      var timer;

      function go(next) {
        idx = (next + slides.length) % slides.length;
        slides.forEach(function (s, i) { s.classList.toggle('is-active', i === idx); });
        dots.forEach(function (d, i) { d.classList.toggle('is-active', i === idx); });
      }

      function startAuto() {
        stopAuto();
        timer = setInterval(function () { go(idx + 1); }, 6000);
      }
      function stopAuto() { clearInterval(timer); }

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () { go(i); startAuto(); });
      });
      wrap.addEventListener('mouseenter', stopAuto);
      wrap.addEventListener('mouseleave', startAuto);

      go(0);
      startAuto();
    });
  }
})();
