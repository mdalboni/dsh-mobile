let cordisCtx = null;

function collapseSidebar() {
  const toggle = document.querySelector('button[data-sidebar-toggle]');
  if (toggle) {
    toggle.click();
    return;
  }
  if (cordisCtx?.layout?.toggleSidebar) {
    cordisCtx.layout.toggleSidebar();
  }
}

function initMobileAdaptations() {
  if (typeof document === 'undefined') return;

  // 1. Ensure virtual keyboard resizes content instead of visual panning
  const meta = document.querySelector('meta[name="viewport"]');
  if (meta && !meta.content.includes('interactive-widget')) {
    meta.content += ', interactive-widget=resizes-content';
  }

  // 2. Prevent window/body scroll displacement into black void
  if (typeof window !== 'undefined') {
    const clampWindowScroll = () => {
      if (window.scrollY !== 0 || window.scrollX !== 0) {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener('scroll', clampWindowScroll, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('scroll', clampWindowScroll, { passive: true });
    }
  }

  // 3. Auto-retract sidebar when clicking in conversation area or selecting a session on mobile
  if (!document.documentElement.dataset.dshMobileDismiss) {
    document.documentElement.dataset.dshMobileDismiss = 'true';
    document.addEventListener('click', (event) => {
      if (typeof window.matchMedia === 'function' && !window.matchMedia('(max-width: 768px)').matches) return;
      const frame = document.querySelector('[class*="_frame"], [data-dsh-frame]');
      if (!frame || frame.hasAttribute('data-sidebar-collapsed')) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('[data-sidebar-opener], [data-sidebar-toggle], [role="dialog"], [role="menu"]')) return;

      const sidebar = frame.querySelector('[class*="_sidebarCol"], [data-pane="sidebar"], aside');
      if (sidebar && !sidebar.contains(target)) {
        // ponytail: click outside sidebar auto-collapses; upgrade to swipe gestures if requested
        collapseSidebar();
      } else if (target.closest('[class*="sessionRow"], [data-dsh-part="sidebar-entry"], [role="treeitem"]')) {
        requestAnimationFrame(() => {
          if (!frame.hasAttribute('data-sidebar-collapsed')) {
            collapseSidebar();
          }
        });
      }
    }, true);
  }

  // 4. Viewport lock and overscroll containment
  const STYLE_ID = 'dsh-mobile-styles';
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
html, body {
  height: 100% !important;
  width: 100% !important;
  overflow: hidden !important;
  overscroll-behavior: none !important;
}

[data-conversation-scroll] {
  overscroll-behavior-y: contain !important;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 768px) {
  textarea, input {
    font-size: 16px !important;
  }
}
`;
    document.head.appendChild(style);
  }
}

initMobileAdaptations();

if (typeof window !== 'undefined' && window.__ModuleLoader__) {
  window.__ModuleLoader__.load({
    id: 'dsh-mobile',
    factory() {
      return {
        apply(ctx) {
          cordisCtx = ctx;
          initMobileAdaptations();
        }
      };
    }
  });
}
