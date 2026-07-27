(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------------------------
     Header scroll state
  -------------------------------------------------------------- */
  var header = document.getElementById('siteHeader');
  var lastScrolled = false;
  function onScroll() {
    var scrolled = window.scrollY > 12;
    if (scrolled !== lastScrolled) {
      header.classList.toggle('is-scrolled', scrolled);
      lastScrolled = scrolled;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --------------------------------------------------------------
     Mobile menu
  -------------------------------------------------------------- */
  var menuToggle = document.getElementById('menuToggle');
  var mobileMenu = document.getElementById('mobileMenu');

  function closeMenu() {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    mobileMenu.classList.remove('is-open');
  }
  function openMenu() {
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close menu');
    mobileMenu.classList.add('is-open');
  }
  menuToggle.addEventListener('click', function () {
    var isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });
  mobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* --------------------------------------------------------------
     Smooth in-page navigation (only for links pointing at real IDs)
  -------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href').slice(1);
      var target = id && document.getElementById(id);
      e.preventDefault();
      if (target) {
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });

  /* --------------------------------------------------------------
     Scroll reveal
  -------------------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal-up');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* --------------------------------------------------------------
     Cursor-follow glow (desktop pointer only)
  -------------------------------------------------------------- */
  var cursorGlow = document.getElementById('cursorGlow');
  var hero = document.getElementById('hero');
  var supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (supportsHover && !reduceMotion && cursorGlow && hero) {
    var raf = null;
    var targetX = 0, targetY = 0;

    hero.addEventListener('mousemove', function (e) {
      targetX = e.clientX;
      targetY = e.clientY + window.scrollY;
      cursorGlow.classList.add('is-active');
      if (!raf) {
        raf = requestAnimationFrame(function () {
          cursorGlow.style.transform = 'translate(' + targetX + 'px,' + targetY + 'px)';
          raf = null;
        });
      }
    });
    hero.addEventListener('mouseleave', function () {
      cursorGlow.classList.remove('is-active');
    });
  }

  /* --------------------------------------------------------------
     Slight parallax tilt on form card (desktop only)
  -------------------------------------------------------------- */
  var formCard = document.getElementById('bookingForm');
  if (supportsHover && !reduceMotion && formCard) {
    formCard.addEventListener('mousemove', function (e) {
      var rect = formCard.getBoundingClientRect();
      var relX = (e.clientX - rect.left) / rect.width - 0.5;
      var relY = (e.clientY - rect.top) / rect.height - 0.5;
      formCard.style.transform =
        'rotateX(' + (relY * -1.2) + 'deg) rotateY(' + (relX * 1.2) + 'deg)';
    });
    formCard.addEventListener('mouseleave', function () {
      formCard.style.transform = '';
    });
  }

  /* --------------------------------------------------------------
     Airline combobox
  -------------------------------------------------------------- */
  var AIRLINES = [
    'Turkish Airlines',
    'Qatar Airways',
    'LOT Polish Airlines',
    'Aegean Airlines',
    'Lufthansa',
    'Emirates',
    'British Airways',
    'Air France',
    'Swiss International Air Lines',
    'Iberia',
    'Austrian Airlines',
    'Brussels Airlines'
  ];

  var airlineInput = document.getElementById('airlineInput');
  var airlineListbox = document.getElementById('airlineListbox');
  var airlineCombobox = document.getElementById('airlineCombobox');
  var airlineField = airlineInput.closest('.field');
  var activeIndex = -1;
  var currentOptions = [];
  var airlineValid = false;

  function renderOptions(query) {
    var q = (query || '').trim().toLowerCase();
    currentOptions = AIRLINES.filter(function (name) {
      return name.toLowerCase().indexOf(q) !== -1;
    });

    airlineListbox.innerHTML = '';
    activeIndex = -1;

    if (!currentOptions.length) {
      var empty = document.createElement('li');
      empty.className = 'combobox__option-empty';
      empty.textContent = 'No airlines match your search';
      airlineListbox.appendChild(empty);
      return;
    }

    currentOptions.forEach(function (name, i) {
      var li = document.createElement('li');
      li.className = 'combobox__option';
      li.id = 'airline-option-' + i;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      li.textContent = name;
      li.addEventListener('mousedown', function (e) {
        e.preventDefault();
        selectAirline(name);
      });
      airlineListbox.appendChild(li);
    });
  }

  function openListbox() {
    airlineCombobox.classList.add('is-open');
    airlineInput.setAttribute('aria-expanded', 'true');
    airlineListbox.hidden = false;
  }
  function closeListbox() {
    airlineCombobox.classList.remove('is-open');
    airlineInput.setAttribute('aria-expanded', 'false');
    airlineInput.removeAttribute('aria-activedescendant');
    activeIndex = -1;
    setTimeout(function () { airlineListbox.hidden = true; }, 180);
  }

  function selectAirline(name) {
    airlineInput.value = name;
    airlineValid = true;
    clearFieldError(airlineField, 'airlineError');
    closeListbox();
    airlineInput.focus();
  }

  function updateActiveOption() {
    var options = airlineListbox.querySelectorAll('.combobox__option');
    options.forEach(function (opt, i) {
      var active = i === activeIndex;
      opt.classList.toggle('is-active', active);
      opt.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    if (activeIndex >= 0 && options[activeIndex]) {
      airlineInput.setAttribute('aria-activedescendant', options[activeIndex].id);
      options[activeIndex].scrollIntoView({ block: 'nearest' });
    } else {
      airlineInput.removeAttribute('aria-activedescendant');
    }
  }

  airlineInput.addEventListener('input', function () {
    airlineValid = false;
    renderOptions(airlineInput.value);
    openListbox();
  });

  airlineInput.addEventListener('focus', function () {
    renderOptions(airlineInput.value);
    openListbox();
  });

  airlineInput.addEventListener('keydown', function (e) {
    var isOpen = airlineCombobox.classList.contains('is-open');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) { renderOptions(airlineInput.value); openListbox(); return; }
      activeIndex = Math.min(activeIndex + 1, currentOptions.length - 1);
      updateActiveOption();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      updateActiveOption();
    } else if (e.key === 'Enter') {
      if (isOpen && activeIndex >= 0 && currentOptions[activeIndex]) {
        e.preventDefault();
        selectAirline(currentOptions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      closeListbox();
    } else if (e.key === 'Tab') {
      closeListbox();
    }
  });

  document.addEventListener('click', function (e) {
    if (!airlineCombobox.contains(e.target)) closeListbox();
  });

  /* --------------------------------------------------------------
     Upload dropzone
  -------------------------------------------------------------- */
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var dropzoneFile = document.getElementById('dropzoneFile');
  var dropzoneFilename = document.getElementById('dropzoneFilename');
  var dropzoneRemove = document.getElementById('dropzoneRemove');

  function setFile(file) {
    if (!file) return;
    dropzoneFilename.textContent = file.name;
    dropzone.hidden = true;
    dropzoneFile.hidden = false;
  }
  function clearFile() {
    fileInput.value = '';
    dropzone.hidden = false;
    dropzoneFile.hidden = true;
  }

  dropzone.addEventListener('click', function () { fileInput.click(); });
  dropzone.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });
  fileInput.addEventListener('change', function () {
    if (fileInput.files && fileInput.files[0]) setFile(fileInput.files[0]);
  });
  dropzoneRemove.addEventListener('click', function (e) {
    e.stopPropagation();
    clearFile();
  });

  ['dragenter', 'dragover'].forEach(function (evt) {
    dropzone.addEventListener(evt, function (e) {
      e.preventDefault();
      dropzone.classList.add('is-dragover');
    });
  });
  ['dragleave', 'drop'].forEach(function (evt) {
    dropzone.addEventListener(evt, function (e) {
      e.preventDefault();
      dropzone.classList.remove('is-dragover');
    });
  });
  dropzone.addEventListener('drop', function (e) {
    var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) {
      fileInput.files = e.dataTransfer.files;
      setFile(file);
    }
  });

  /* --------------------------------------------------------------
     Form validation + fake submit
  -------------------------------------------------------------- */
  var form = document.getElementById('bookingForm');
  var lastNameInput = document.getElementById('lastNameInput');
  var pnrInput = document.getElementById('pnrInput');
  var submitBtn = document.getElementById('submitBtn');
  var lastNameField = lastNameInput.closest('.field');
  var pnrField = pnrInput.closest('.field');

  function setFieldError(field, errorId, message) {
    field.classList.add('has-error');
    var errorEl = document.getElementById(errorId);
    errorEl.textContent = message;
  }
  function clearFieldError(field, errorId) {
    field.classList.remove('has-error');
    document.getElementById(errorId).textContent = '';
  }

  [lastNameInput, pnrInput].forEach(function (input) {
    input.addEventListener('input', function () {
      var field = input.closest('.field');
      var errorId = input.id === 'lastNameInput' ? 'lastNameError' : 'pnrError';
      if (input.value.trim()) clearFieldError(field, errorId);
    });
  });

  function showStatus(message) {
    var existing = document.getElementById('formStatus');
    if (existing) existing.remove();
    var status = document.createElement('p');
    status.id = 'formStatus';
    status.className = 'booking-form__status';
    status.setAttribute('role', 'status');
    status.textContent = message;
    form.appendChild(status);
    requestAnimationFrame(function () { status.classList.add('is-visible'); });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var valid = true;

    if (!airlineValid || !airlineInput.value.trim()) {
      setFieldError(airlineField, 'airlineError', 'Please select an airline from the list.');
      valid = false;
    } else {
      clearFieldError(airlineField, 'airlineError');
    }

    if (!lastNameInput.value.trim()) {
      setFieldError(lastNameField, 'lastNameError', 'Please enter your last name.');
      valid = false;
    } else {
      clearFieldError(lastNameField, 'lastNameError');
    }

    if (!pnrInput.value.trim()) {
      setFieldError(pnrField, 'pnrError', 'Please enter your booking reference.');
      valid = false;
    } else {
      clearFieldError(pnrField, 'pnrError');
    }

    if (!valid) {
      var firstError = form.querySelector('.has-error .field__input, .has-error .combobox__input');
      if (firstError) firstError.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');
    submitBtn.querySelector('.btn__label').textContent = 'Checking upgrades...';

    setTimeout(function () {
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
      submitBtn.querySelector('.btn__label').textContent = 'Check upgrades';
      showStatus('Upgrade options found for ' + airlineInput.value + ' — a member of our team will follow up shortly.');
    }, 1400);
  });
})();
