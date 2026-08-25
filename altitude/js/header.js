/* ================================================================
   ALTITUDE — HEADER
   Rendered from a single navigation config so every page carries an
   identical menu. Items are never dropped on the page they point to —
   the current page is marked active instead.

   To add a page: add it to NAV, then give that page's mount point a
   matching `data-page` value.
================================================================ */
(function () {
  'use strict';

  /* Swap `href` for real routes when wiring this into the app. */
  var NAV = [
    { id: 'requests', label: 'My requests', href: '#', icon: ALT_ICONS.listChecks },
    { id: 'wallet',   label: 'Wallet',      href: '#', icon: ALT_ICONS.wallet }
  ];

  var ACCOUNT = {
    email: 'ddm@drct.aero',
    signOutHref: '#'
  };

  var BRAND = { label: 'Altitude', href: '#' };

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function linkMarkup(item, activePage) {
    var isActive = item.id === activePage;

    return '' +
      '<a class="alt-nav__link' + (isActive ? ' is-active' : '') + '"' +
         ' href="' + esc(item.href) + '"' +
         ' data-page="' + esc(item.id) + '"' +
         (isActive ? ' aria-current="page"' : '') + '>' +
        item.icon +
        '<span class="alt-nav__label">' + esc(item.label) + '</span>' +
      '</a>';
  }

  function render(mount) {
    var activePage = mount.dataset.page || '';

    mount.innerHTML = '' +
      '<div class="alt-header__inner">' +

        '<a class="alt-logo" href="' + esc(BRAND.href) + '">' + esc(BRAND.label) + '</a>' +

        '<div class="alt-header__right">' +

          '<nav class="alt-nav" aria-label="Main">' +
            NAV.map(function (item) { return linkMarkup(item, activePage); }).join('') +
          '</nav>' +

          '<div class="alt-account" id="altAccount">' +
            '<button class="alt-account__button" type="button" id="altAccountButton"' +
                   ' aria-haspopup="menu" aria-expanded="false">' +
              ALT_ICONS.user +
              '<span class="alt-account__email">' + esc(ACCOUNT.email) + '</span>' +
              ALT_ICONS.chevronDown +
            '</button>' +

            '<div class="alt-account__menu" role="menu" id="altAccountMenu" hidden>' +
              '<p class="alt-account__meta">' +
                'Signed in as' +
                '<strong>' + esc(ACCOUNT.email) + '</strong>' +
              '</p>' +
              '<a class="alt-account__item" role="menuitem" href="' + esc(ACCOUNT.signOutHref) + '">' +
                ALT_ICONS.logOut + '<span>Sign out</span>' +
              '</a>' +
            '</div>' +

          '</div>' +

        '</div>' +
      '</div>';

    altPopup(
      mount.querySelector('#altAccount'),
      mount.querySelector('#altAccountButton'),
      mount.querySelector('#altAccountMenu')
    );
  }

  var mount = document.getElementById('altHeader');
  if (mount) render(mount);
})();
