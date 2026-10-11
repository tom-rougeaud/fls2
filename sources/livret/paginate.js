/* Mise en pages A4 : blocs répartis dans des pages fixes, jamais coupés.
   Auto-ajustement des textes (.fit), contrôle des débordements à droite. */
(async function () {
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  const MM = 96 / 25.4, PROF = document.body.classList.contains('prof');
  const flow = document.getElementById('flow'), out = document.getElementById('out');
  const res = { secs: {}, words: {}, num: {}, errors: [], warnings: [], pages: 0, notes: 0, fits: 0 };
  const tpl = id => document.getElementById(id).content.firstElementChild.cloneNode(true);
  function newPage(run, col, cols) {
    const p = document.createElement('div'); p.className = 'page' + (col ? ' c-' + col : '') + (run ? ' cont' : '');
    p.innerHTML = (run ? `<div class="run">${run}</div>` : '') + `<div class="inner${cols ? ' cols2' : ''}"></div><div class="foot"></div>`;
    out.appendChild(p); return p;
  }
  const inner = p => p.querySelector('.inner');
  const over = el => el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1;
  function free(el) {
    const kids = [...el.children]; const pb = parseFloat(getComputedStyle(el).paddingBottom);
    const bottom = el.getBoundingClientRect().bottom - pb;
    if (!kids.length) return bottom - el.getBoundingClientRect().top;
    const last = kids[kids.length - 1]; return bottom - last.getBoundingClientRect().bottom - parseFloat(getComputedStyle(last).marginBottom);
  }
  function fitAll(root) {
    root.querySelectorAll('.fit').forEach(el => {
      let fs = parseFloat(getComputedStyle(el).fontSize), k = 0; const min = fs * 0.55;
      const box = el.parentElement;
      const tooWide = () => el.scrollWidth > el.clientWidth + 0.5 || el.getBoundingClientRect().right > box.getBoundingClientRect().right + 0.5;
      while (tooWide() && fs > min && k < 60) { fs -= 0.4; el.style.fontSize = fs + 'px'; k++; }
      if (k) res.fits++;
      if (tooWide()) res.warnings.push('Texte trop long : ' + el.textContent.slice(0, 40));
    });
  }
  function addNotes(p) {
    const el = inner(p); if (el.classList.contains('cols2')) return; const f = free(el) / MM;
    if (f < 34) return;
    const n = tpl('notesTpl'); n.querySelector('.lines').innerHTML = '<i></i>'.repeat(Math.floor((f - 17) / 10));
    el.appendChild(n); if (over(el)) el.removeChild(n); else res.notes++;
  }
  for (const node of [...flow.children]) {
    if (node.classList.contains('page')) { out.appendChild(node); fitAll(node); continue; }
    const run = node.dataset.run, col = node.dataset.col, fill = node.dataset.fill === '1', cols = node.dataset.cols === '2';
    let p = newPage(null, col, false);
    res.secs[node.dataset.key] = out.children.length;
    const kids = [...node.children]; const fixed = [], queue = [];
    kids.forEach(k => (k.classList.contains('ex') ? queue : fixed).push(k));
    const place = blk => { const el = inner(p); el.appendChild(blk); fitAll(blk); if (over(el)) { el.removeChild(blk); return false; } return true; };
    let first = true;
    for (const blk of fixed) {
      if (cols && first && !blk.classList.contains('span')) { p = out.lastElementChild; }
      if (cols && !blk.classList.contains('span') && !inner(p).classList.contains('cols2') && !p._colbox) {
        // après l’en-tête pleine largeur : la suite en deux colonnes sur la même page
        const box = document.createElement('div'); box.className = 'colbox'; inner(p).appendChild(box);
        const h = (inner(p).getBoundingClientRect().bottom - parseFloat(getComputedStyle(inner(p)).paddingBottom)) - box.getBoundingClientRect().top;
        box.style.height = Math.max(0, h - 2) + 'px'; p._colbox = box;
      }
      first = false;
      const target = (cols && p._colbox) ? p._colbox : null;
      if (target) { target.appendChild(blk); fitAll(blk); if (target.scrollWidth <= target.clientWidth + 1) continue; target.removeChild(blk);
        const carry = []; while (target.lastElementChild && target.lastElementChild.classList.contains('kwn')) carry.unshift(target.removeChild(target.lastElementChild));
        p = newPage(run, col, true); carry.forEach(c => inner(p).appendChild(c)); inner(p).appendChild(blk); fitAll(blk); continue; }
      if (cols && inner(p).classList.contains('cols2')) { const el = inner(p); el.appendChild(blk); fitAll(blk); if (!over(el)) continue; el.removeChild(blk);
        const carry = []; while (el.lastElementChild && el.lastElementChild.classList.contains('kwn')) carry.unshift(el.removeChild(el.lastElementChild));
        p = newPage(run, col, true); carry.forEach(c => inner(p).appendChild(c)); inner(p).appendChild(blk); continue; }
      if (!place(blk)) { const el = inner(p), carry = [];
        while (el.lastElementChild && el.lastElementChild.classList.contains('kwn') && el.children.length > 1) carry.unshift(el.removeChild(el.lastElementChild));
        if (fill) addNotes(p);
        p = newPage(run, col, false); carry.forEach(c => inner(p).appendChild(c)); inner(p).appendChild(blk); fitAll(blk); if (over(inner(p))) res.errors.push('Débordement : ' + blk.textContent.slice(0, 50)); }
    }
    const WIN = 5;
    while (queue.length) {
      let done = false;
      for (let j = 0; j < Math.min(WIN, queue.length); j++) {
        const b = queue[j]; if (j > 0 && b.classList.contains('sais') && queue.length > 1) continue;
        if (place(b)) { queue.splice(j, 1); done = true; break; }
      }
      if (done) continue;
      const el = inner(p);
      if (!el.children.length) { const b = queue.shift(); el.appendChild(b); res.errors.push('Bloc trop grand pour une page : ' + (b.querySelector('.ext') || b).textContent.slice(0, 60)); continue; }
      // un titre (« Les exercices ») ne reste jamais seul en bas de page
      const carry = []; while (el.lastElementChild && el.lastElementChild.classList.contains('kwn') && el.children.length > 1) carry.unshift(el.removeChild(el.lastElementChild));
      if (fill) addNotes(p);
      p = newPage(run, col, false); carry.forEach(c => inner(p).appendChild(c));
    }
    if (fill) addNotes(p);
  }
  if (out.children.length % 2 === 1) { const last = document.createElement('div'); last.className = 'page'; last.innerHTML = '<div class="inner"><div class="blk notes"><h3>📝 Mes notes</h3><div class="lines">' + '<i></i>'.repeat(24) + '</div></div></div><div class="foot"></div>'; out.appendChild(last); }
  flow.remove();
  // numérotation des exercices par chapitre, dans l’ordre des pages
  let cur = null, k = 0;
  const pagesBySec = {}; const keys = Object.entries(res.secs).sort((a, b) => a[1] - b[1]);
  [...out.children].forEach((pg, i) => { let s = null; for (const [kk, v] of keys) if (v <= i + 1) s = kk; pg.dataset.sec = s || ''; });
  [...out.children].forEach(pg => { if (pg.dataset.sec !== cur) { cur = pg.dataset.sec; k = 0; } pg.querySelectorAll('.ex .num').forEach(nn => { k++; nn.textContent = k; const e = nn.closest('.ex').dataset.eid; if (e) res.num[e] = k; }); });
  [...out.children].forEach((p, i) => {
    const n = i + 1; p.classList.add(n % 2 ? 'odd' : 'even'); p.dataset.n = n;
    const f = p.querySelector('.foot'); if (f && n > 1) f.innerHTML = `<span>Maths Allophones · Niveau 2 // T. Rougeaud</span><b>${n}</b>`;
    const ls = p.querySelector('[data-lesson]'), rn = p.querySelector('.run'); if (ls && rn) { rn.textContent = ls.dataset.lesson; [...p.classList].filter(c => c.startsWith('c-')).forEach(c => p.classList.remove(c)); p.classList.add('c-' + ls.dataset.lcol); }
    p.querySelectorAll('[data-sec]').forEach(s => { if (!res.secs[s.dataset.sec]) res.secs[s.dataset.sec] = n; });
    p.querySelectorAll('[data-word]').forEach(w => { if (!res.words[w.dataset.word]) res.words[w.dataset.word] = n; });
  });
  document.querySelectorAll('[data-pageof]').forEach(s => { const v = res.secs[s.dataset.pageof]; if (v) s.textContent = v; else res.errors.push('Renvoi introuvable : ' + s.dataset.pageof); });
  document.querySelectorAll('[data-wordpage]').forEach(s => { const v = res.words[s.dataset.wordpage]; if (v) s.textContent = v; else res.errors.push('Page introuvable : ' + s.dataset.wordpage); });
  document.querySelectorAll('[data-numof]').forEach(s => { const v = res.num[s.dataset.numof]; if (v) s.textContent = v; else res.errors.push('Numéro introuvable : ' + s.dataset.numof); });
  // corrigé express : dans l’ordre des numéros d’exercice
  document.querySelectorAll('.cc').forEach(cc => { const ps = [...cc.querySelectorAll(':scope > p')]; ps.sort((x, y) => (+x.querySelector('.cn').textContent || 0) - (+y.querySelector('.cn').textContent || 0)).forEach(x => cc.appendChild(x)); });
  // contrôles : rien ne déborde, ni en bas ni à droite
  [...out.children].forEach((p, i) => { const el = p.querySelector('.inner'); if (el && over(el)) res.errors.push('Page ' + (i + 1) + ' déborde');
    if (PROF) return;
    p.querySelectorAll('.ex, .gcard, .az, .chead, .ghead').forEach(b => { const R = b.getBoundingClientRect();
      for (const d of b.querySelectorAll('span,b,i,p,div,li,td,svg,strong')) { if (d.closest('.prof-only')) continue; const r = d.getBoundingClientRect(); if (r.width && r.right > R.right + 0.5) { res.errors.push(`Page ${i + 1} : dépasse du cadre → « ${(d.textContent || d.tagName).trim().slice(0, 40)} »`); break; } } }); });
  res.pages = out.children.length; window.__result = res;
})();
