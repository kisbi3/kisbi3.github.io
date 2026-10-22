
(() => {
  'use strict';
  const root = document.getElementById('web-reading');
  if (!root) return;
  const sourcePages = Array.from(document.querySelectorAll('#pages > .page'));
  const indexById = new Map(sourcePages.map((p, i) => [p.id, i]));
  const targets = new Map(Array.from(root.querySelectorAll('[data-source-page]')).map(n => [n.dataset.sourcePage, n]));
  let printSnapshot = null;
  function hiddenByDetails(node) {
    for (let p = node.parentElement; p && p !== root; p = p.parentElement) {
      if (p.tagName === 'DETAILS' && !p.open) return true;
    }
    return false;
  }
  function targetForPage(id) {
    const node = targets.get(id) || root;
    for (let p = node; p && p !== root; p = p.parentElement) {
      if (p.tagName === 'DETAILS') p.open = true;
    }
    return node;
  }
  function activeIndex(fallback = 0) {
    if (!root.getClientRects().length) return fallback;
    const threshold = innerHeight * .35;
    let selected = fallback, bestTop = -Infinity;
    for (const [id, node] of targets) {
      if (hiddenByDetails(node) || !node.getClientRects().length) continue;
      const top = node.getBoundingClientRect().top;
      if (top <= threshold && top >= bestTop) { bestTop = top; selected = indexById.get(id); }
    }
    return Number.isInteger(selected) ? selected : fallback;
  }
  function preparePrint() {
    if (!printSnapshot) {
      printSnapshot = {
        details: Array.from(root.querySelectorAll('details')).map(d => [d, d.open]),
        scroll: scrollY
      };
    }
    root.querySelectorAll('details').forEach(d => { d.open = true; });
    // Both screen-time measurement and the print stylesheet use the same fixed reading width.
    const height = Math.ceil(root.getBoundingClientRect().height) + 48;
    document.getElementById('print-size').textContent = '@page{size:1280px ' + height + 'px;margin:0}';
    return {width: 1280, height};
  }
  function restorePrint() {
    if (!printSnapshot) return null;
    const snapshot = printSnapshot; printSnapshot = null;
    snapshot.details.forEach(([d, open]) => { d.open = open; });
    return snapshot.scroll;
  }
  function resetExport(copy) {
    copy.querySelectorAll('#web-reading details').forEach(d => d.removeAttribute('open'));
  }
  root.addEventListener('click', event => {
    const link = event.target.closest('a[data-web-page]');
    if (!link || !root.contains(link) || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const index = indexById.get(link.dataset.webPage);
    if (index === undefined || !window.Portfolio) return;
    event.preventDefault(); window.Portfolio.gotoPage(index);
  });
  const skip = document.querySelector('.skip-link');
  if (skip) skip.addEventListener('click', event => {
    if (!document.body.classList.contains('mode-web') || !window.Portfolio) return;
    event.preventDefault(); window.Portfolio.gotoPage(0);
    root.setAttribute('tabindex', '-1'); root.focus({preventScroll: true});
  });
  window.PortfolioWeb = {targetForPage, activeIndex, preparePrint, restorePrint, resetExport};
})();

