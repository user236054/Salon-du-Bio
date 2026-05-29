// Simple client-side visit counter and visitor info logger
// Include this script on public pages to increment the counter.
(function(){
  try {
    const keyCount = 'site_visit_count';
    const keyVisitors = 'site_visitors';

    const count = Number(localStorage.getItem(keyCount) || 0) + 1;
    localStorage.setItem(keyCount, String(count));

    const visitors = JSON.parse(localStorage.getItem(keyVisitors) || '[]');
    const visitor = {
      ts: Date.now(),
      path: location.pathname + location.search,
      ua: navigator.userAgent || null,
      lang: navigator.language || null,
      platform: navigator.platform || null,
      screen: { w: screen.width, h: screen.height },
    };
    visitors.push(visitor);
    // keep last 1000 visitors to avoid unbounded growth
    if (visitors.length > 1000) visitors.splice(0, visitors.length - 1000);
    localStorage.setItem(keyVisitors, JSON.stringify(visitors));
  } catch (e) {
    console.warn('visit-counter error', e);
  }
})();
