/* ================================================================
   ALTITUDE — POPUP
   Shared open/close behaviour for the header account menu and the
   status filter: outside click, Escape, focus return, and a single
   open popup at a time.
================================================================ */
var altPopup = (function () {
  'use strict';

  var instances = [];

  function closeOthers(current) {
    instances.forEach(function (instance) {
      if (instance !== current) instance.close();
    });
  }

  document.addEventListener('click', function (event) {
    instances.forEach(function (instance) {
      if (instance.isOpen() && !instance.root.contains(event.target)) instance.close();
    });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;

    instances.forEach(function (instance) {
      if (!instance.isOpen()) return;
      instance.close();
      instance.trigger.focus();
    });
  });

  return function create(root, trigger, panel) {
    var instance = {
      root: root,
      trigger: trigger,
      panel: panel,
      isOpen: function () { return !panel.hidden; },
      open: function () {
        closeOthers(instance);
        panel.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
      },
      close: function () {
        panel.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
      },
      toggle: function () {
        if (instance.isOpen()) { instance.close(); } else { instance.open(); }
      }
    };

    trigger.addEventListener('click', instance.toggle);
    instances.push(instance);

    return instance;
  };
})();
