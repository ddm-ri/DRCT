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

  /* The home route. The brand always links here, so in the top-bar
     layouts it is dropped from the menu — an item sitting directly above
     the page's own H1 just repeats it. A sidebar has room for it. */
  var HOME = 'requests';

  var ACCOUNT = {
    email: 'ddm@drct.aero',
    signOutHref: '#'
  };

  var BRAND = { label: 'Altitude', href: '#', title: 'My requests' };

  /* Menu placement. One of:
       'sidebar' — fixed left rail, account pinned to the bottom (default)
       'right'   — top bar, menu grouped with the account
       'left'    — top bar, menu next to the brand
       'center'  — top bar, menu centred
     Below 900px every layout falls back to the compact top bar. */
  var LAYOUT = 'right';

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function linkMarkup(item, activePage) {
    if (item.id === HOME && LAYOUT !== 'sidebar') return '';

    var isActive = item.id === activePage;
    var isHome = item.id === HOME;

    return '' +
      '<a class="alt-nav__link' + (isActive ? ' is-active' : '') +
                                  (isHome ? ' alt-nav__link--home' : '') + '"' +
         ' href="' + esc(item.href) + '"' +
         ' data-page="' + esc(item.id) + '"' +
         ' title="' + esc(item.label) + '"' +
         (isActive ? ' aria-current="page"' : '') + '>' +
        item.icon +
        '<span class="alt-nav__label">' + esc(item.label) + '</span>' +
      '</a>';
  }

  function render(mount) {
    var activePage = mount.dataset.page || '';

    mount.classList.add('alt-header--nav-' + LAYOUT);
    document.body.classList.add('alt-layout-' + LAYOUT);

    mount.innerHTML = '' +
      '<div class="alt-header__inner">' +

        '<a class="alt-logo" href="' + esc(BRAND.href) + '"' +
           ' title="' + esc(BRAND.title) + '" aria-label="' + esc(BRAND.label) + '">' +
          '<span class="alt-logo__mark" aria-hidden="true">' + esc(BRAND.label.charAt(0)) + '</span>' +
          '<span class="alt-logo__word" aria-hidden="true">' + esc(BRAND.label) + '</span>' +
        '</a>' +

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
