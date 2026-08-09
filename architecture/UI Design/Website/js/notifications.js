/* ============================================================
   TransportSeva - Shared notification bell dropdown + full
   "All Notifications" listing page engine.
   Works across Admin / Customer / Transporter / Company portals.
   ============================================================ */
(function(){
  var STORAGE_KEY = 'ts_notif_read_ids';

  // Sample notification dataset (id, icon symbol, i18n keys, relative time, default state)
  var NOTIFS = [
    { id:'n1', icon:'i-doc',     titleKey:'notif.n1.title', descKey:'notif.n1.desc', time:'5 mins ago',   defaultUnread:true  },
    { id:'n2', icon:'i-wallet',  titleKey:'notif.n2.title', descKey:'notif.n2.desc', time:'1 hour ago',   defaultUnread:true  },
    { id:'n3', icon:'i-box',     titleKey:'notif.n3.title', descKey:'notif.n3.desc', time:'3 hours ago',  defaultUnread:true  },
    { id:'n4', icon:'i-bell',    titleKey:'notif.n4.title', descKey:'notif.n4.desc', time:'Yesterday',    defaultUnread:true  },
    { id:'n5', icon:'i-headset', titleKey:'notif.n5.title', descKey:'notif.n5.desc', time:'2 days ago',   defaultUnread:false },
    { id:'n6', icon:'i-shield',  titleKey:'notif.n6.title', descKey:'notif.n6.desc', time:'3 days ago',   defaultUnread:false },
    { id:'n7', icon:'i-truck',   titleKey:'notif.n7.title', descKey:'notif.n7.desc', time:'4 days ago',   defaultUnread:false },
    { id:'n8', icon:'i-tag',     titleKey:'notif.n8.title', descKey:'notif.n8.desc', time:'1 week ago',   defaultUnread:false }
  ];

  function dict(){
    var lang = 'en';
    try{ lang = document.documentElement.getAttribute('lang') === 'hi' ? 'hi' : 'en'; }catch(e){}
    return (window.TS_I18N && window.TS_I18N[lang]) || {};
  }
  function t(key, fallback){
    var d = dict();
    return d[key] !== undefined ? d[key] : (fallback || key);
  }

  function getReadIds(){
    var stored = null;
    try{ stored = JSON.parse(localStorage.getItem(STORAGE_KEY)); }catch(e){}
    if(stored === null){
      stored = NOTIFS.filter(function(n){ return !n.defaultUnread; }).map(function(n){ return n.id; });
      saveReadIds(stored);
    }
    return stored;
  }
  function saveReadIds(ids){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); }catch(e){} }
  function isRead(id){ return getReadIds().indexOf(id) > -1; }
  function markRead(id){
    var ids = getReadIds();
    if(ids.indexOf(id) === -1){ ids.push(id); saveReadIds(ids); }
    refreshAll();
  }
  function markAllRead(){
    saveReadIds(NOTIFS.map(function(n){ return n.id; }));
    refreshAll();
  }
  function unreadCount(){
    return NOTIFS.filter(function(n){ return !isRead(n.id); }).length;
  }

  function translateScope(root){
    var d = dict();
    root.querySelectorAll('[data-i18n]').forEach(function(el){
      var key = el.getAttribute('data-i18n');
      if(d[key] !== undefined){ el.innerHTML = d[key]; }
    });
  }

  /* ---------------- Bell dropdown ---------------- */
  var panelEl = null;
  var badgeEl = null;

  function buildItemHTML(n, forPage){
    var unread = !isRead(n.id);
    if(forPage){
      return (
        '<div class="notif-page-item' + (unread ? ' unread' : '') + '" data-id="' + n.id + '">' +
          '<div class="notif-page-icon"><svg class="icon"><use href="#' + n.icon + '"/></svg></div>' +
          '<div class="notif-page-body">' +
            '<div class="notif-page-title"><span data-i18n="' + n.titleKey + '">' + t(n.titleKey) + '</span>' + (unread ? '<span class="notif-page-dot"></span>' : '') + '</div>' +
            '<div class="notif-page-desc" data-i18n="' + n.descKey + '">' + t(n.descKey) + '</div>' +
            '<div class="notif-page-time">' + n.time + '</div>' +
          '</div>' +
          '<div class="notif-page-actions">' +
            (unread ? '<button type="button" class="notif-page-mark" data-mark="' + n.id + '" data-i18n="notif.markRead">' + t('notif.markRead', 'Mark as read') + '</button>' : '') +
          '</div>' +
        '</div>'
      );
    }
    return (
      '<div class="notif-item' + (unread ? ' unread' : '') + '" data-id="' + n.id + '">' +
        '<div class="notif-item-icon"><svg class="icon"><use href="#' + n.icon + '"/></svg></div>' +
        '<div class="notif-item-body">' +
          '<div class="notif-item-title" data-i18n="' + n.titleKey + '">' + t(n.titleKey) + '</div>' +
          '<div class="notif-item-desc" data-i18n="' + n.descKey + '">' + t(n.descKey) + '</div>' +
          '<div class="notif-item-time">' + n.time + '</div>' +
        '</div>' +
        (unread ? '<button type="button" class="notif-item-dot" data-mark="' + n.id + '" aria-label="Mark as read"></button>' : '<span class="notif-item-dot"></span>') +
      '</div>'
    );
  }

  function renderPanelList(){
    if(!panelEl) return;
    var listEl = panelEl.querySelector('.notif-list');
    if(NOTIFS.length === 0){
      listEl.innerHTML = '<div class="notif-empty" data-i18n="notif.empty">' + t('notif.empty', "You're all caught up!") + '</div>';
      return;
    }
    listEl.innerHTML = NOTIFS.slice(0, 5).map(function(n){ return buildItemHTML(n, false); }).join('');
  }

  function updateBadge(){
    if(!badgeEl) return;
    var count = unreadCount();
    badgeEl.style.display = count > 0 ? 'block' : 'none';
  }

  function updateMarkAllBtn(){
    if(!panelEl) return;
    var btn = panelEl.querySelector('.notif-markall');
    if(!btn) return;
    btn.disabled = unreadCount() === 0;
  }

  function closePanel(){ if(panelEl) panelEl.classList.remove('open'); }
  function togglePanel(){ if(panelEl) panelEl.classList.toggle('open'); }

  function buildDropdown(){
    var bellBtn = document.querySelector('.topbar-actions .icon-btn');
    if(!bellBtn || bellBtn.querySelector('use[href="#i-bell"]') === null) return;
    if(bellBtn.closest('.notif-wrap')) return; // already built

    badgeEl = bellBtn.querySelector('.badge-dot');

    var wrap = document.createElement('div');
    wrap.className = 'notif-wrap';
    bellBtn.parentNode.insertBefore(wrap, bellBtn);
    wrap.appendChild(bellBtn);

    panelEl = document.createElement('div');
    panelEl.className = 'notif-panel';
    panelEl.id = 'tsNotifPanel';
    panelEl.innerHTML =
      '<div class="notif-panel-head">' +
        '<h4 data-i18n="notif.title">' + t('notif.title', 'Notifications') + '</h4>' +
        '<button type="button" class="notif-markall" data-i18n="notif.markAllRead">' + t('notif.markAllRead', 'Mark all as read') + '</button>' +
      '</div>' +
      '<div class="notif-list"></div>' +
      '<a class="notif-viewall" href="notifications.html" data-i18n="notif.viewAll">' + t('notif.viewAll', 'View all notifications') + '</a>';
    wrap.appendChild(panelEl);

    renderPanelList();
    updateBadge();
    updateMarkAllBtn();

    bellBtn.addEventListener('click', function(e){
      e.stopPropagation();
      togglePanel();
    });
    panelEl.addEventListener('click', function(e){
      e.stopPropagation();
      var markBtn = e.target.closest('[data-mark]');
      if(markBtn){ markRead(markBtn.getAttribute('data-mark')); return; }
      var item = e.target.closest('.notif-item');
      if(item && item.classList.contains('unread')){ markRead(item.getAttribute('data-id')); }
      var markAll = e.target.closest('.notif-markall');
      if(markAll && !markAll.disabled){ markAllRead(); }
    });
    document.addEventListener('click', function(e){
      if(panelEl && panelEl.classList.contains('open') && !wrap.contains(e.target)){ closePanel(); }
    });
  }

  /* ---------------- Full listing page ---------------- */
  var pageListEl = null;
  var pageFilter = 'all';

  function renderPageList(){
    if(!pageListEl) return;
    var items = pageFilter === 'unread' ? NOTIFS.filter(function(n){ return !isRead(n.id); }) : NOTIFS;
    if(items.length === 0){
      pageListEl.innerHTML = '<div class="notif-empty" data-i18n="notif.empty">' + t('notif.empty', "You're all caught up!") + '</div>';
      return;
    }
    pageListEl.innerHTML = items.map(function(n){ return buildItemHTML(n, true); }).join('');
  }

  function buildPage(){
    pageListEl = document.getElementById('notifPageList');
    if(!pageListEl) return;

    var markAllBtn = document.getElementById('notifMarkAllBtn');
    var tabAll = document.getElementById('notifTabAll');
    var tabUnread = document.getElementById('notifTabUnread');

    renderPageList();
    if(markAllBtn) markAllBtn.disabled = unreadCount() === 0;

    pageListEl.addEventListener('click', function(e){
      var markBtn = e.target.closest('[data-mark]');
      if(markBtn){ markRead(markBtn.getAttribute('data-mark')); }
    });
    if(markAllBtn){
      markAllBtn.addEventListener('click', function(){
        if(!markAllBtn.disabled) markAllRead();
      });
    }
    if(tabAll && tabUnread){
      tabAll.addEventListener('click', function(){
        pageFilter = 'all';
        tabAll.classList.add('active'); tabUnread.classList.remove('active');
        renderPageList();
      });
      tabUnread.addEventListener('click', function(){
        pageFilter = 'unread';
        tabUnread.classList.add('active'); tabAll.classList.remove('active');
        renderPageList();
      });
    }
  }

  function refreshAll(){
    renderPanelList();
    updateBadge();
    updateMarkAllBtn();
    renderPageList();
    var markAllBtn = document.getElementById('notifMarkAllBtn');
    if(markAllBtn) markAllBtn.disabled = unreadCount() === 0;
    translateScope(document);
  }

  document.addEventListener('DOMContentLoaded', function(){
    buildDropdown();
    buildPage();
    // Re-translate newly injected nodes for the currently active language
    translateScope(document);
    var sw = document.getElementById('langSwitch');
    if(sw){ sw.addEventListener('click', function(){ setTimeout(function(){ refreshAll(); }, 0); }); }
  });
})();
