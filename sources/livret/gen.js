/* =====================================================================
   LIVRET « MATHS ALLOPHONES · NIVEAU 2 » — livret élève + version
   professeur (réponses en rouge sur les mêmes pages + corrigé express).
   Source : l’appli construite (dist/index.html), chargée dans jsdom :
   mêmes mots, mêmes dessins, mêmes générateurs de calculs.
   Usage : node gen.js  → build/eleve.html, build/prof.html, build/log.json
   ===================================================================== */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const load = require(path.join(ROOT, 'test', 'load'));
const dom = load({ noDB: true }); const WIN = dom.window, T = WIN.__T;
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist', 'data.json'), 'utf8'));
const QR = JSON.parse(fs.readFileSync(path.join(__dirname, 'build', 'qr.json'), 'utf8'));
const CATS = {}; DATA.categories.forEach(c => CATS[c.id] = c);
const W = T.W;
const MODS = T.MODS.map((m, i) => ({ ...m, n: i + 1, mots: T.WORDS.filter(w => w.mod === m.id && !w.n1) }));
const N2 = T.WORDS.filter(w => !w.n1);
const LOG = { errors: [], warnings: [], cross: [], calc: {} };
const err = m => LOG.errors.push(m), warn = m => LOG.warnings.push(m);

/* ---------- outils ---------- */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’']/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const TOK = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
const tokens = s => [...s.matchAll(TOK)].map(m => ({ raw: m[0], text: m[1], id: m[2] || slug(m[1]), idx: m.index }));
const FRAC = /\{\{([^{}/]+)\/([^{}]+)\}\}/g;
/* texte riche → HTML : mots du lexique colorés, verbes d’action, fractions */
function fmt(s, o = {}) {
  let h = esc(s == null ? '' : s);
  h = h.replace(TOK, (_, t, id) => { const w = W[id || slug(t)]; return (w && !o.noLex) ? `<b class="kc c-${w.cat}">${t}</b>` : t; });
  h = h.replace(/\*\*([^*]+)\*\*/g, o.noVerb ? '$1' : '<strong class="v">$1</strong>');
  h = h.replace(FRAC, '<span class="fr"><span class="fn">$1</span><span class="fd">$2</span></span>');
  return h;
}
const flat = s => String(s == null ? '' : s).replace(TOK, (_, t) => t).replace(/\*\*([^*]+)\*\*/g, '$1').replace(FRAC, '$1/$2');   // texte brut (réponses en rouge)
const lines = arr => (Array.isArray(arr) ? arr : arr ? [arr] : []);
function rng(seed) { let a = 0; for (const c of seed) a = (a * 31 + c.charCodeAt(0)) >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shuffle(arr, r) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function derange(arr, r) { if (arr.length < 2) return arr.slice(); for (let k = 0; k < 80; k++) { const s = shuffle(arr, r); if (s.every((x, i) => x !== arr[i])) return s; } return arr.slice(1).concat(arr[0]); }
const fullName = w => w.art ? (w.art === 'l’' ? 'l’' + w.mot : w.art + ' ' + w.mot) : w.mot;
const ART = w => w.art ? `<i>${esc(w.art)}</i>${w.art === 'l’' ? '' : ' '}` : '';
const ILL = (spec, cat) => T.renderIll(spec, cat);
const ill = (w, cls = '') => `<span class="il ${cls}">${ILL(w.ill, w.cat)}</span>`;
const qr = k => { if (!QR[k]) { err('QR manquant ' + k); return ''; } return QR[k].svg.replace(/width="(\d+)" height="(\d+)"/, 'viewBox="0 0 $1 $2"'); };
const LET = 'ABCDEFGHIJ';
const PERS = '';
/* tirages des générateurs reproductibles : on remplace Math.random de la page */
function seeded(seed, fn) { const old = WIN.Math.random; WIN.Math.random = rng(seed); try { return fn(); } finally { WIN.Math.random = old; } }

/* ---------- petits éléments, avec réponse pour la version professeur ---------- */
const H = {
  blank: (n, a = '') => `<span class="bl" style="min-width:${Math.max(2, n) * 0.62}em"${a !== '' ? ` data-a="${esc(a)}"` : ''}></span>`,
  lines: (n, a = '') => `<div class="lines">${Array.from({ length: n }, (_, i) => `<i${i === 0 && a ? ` data-a="${esc(a)}"` : ''}></i>`).join('')}</div>`,
  work: (a = '', h) => `<div class="work"${h ? ` style="height:${h}mm"` : ''}${a ? ` data-a="${esc(a)}"` : ''}></div>`,
  box: (t, ok) => `<span class="opt${ok ? ' ok' : ''}"><span class="box">☐</span> ${t}</span>`,
  frb: (a) => { const [n, d] = String(a).split('/'); return `<span class="frb"><i data-a="${esc(n)}"></i><hr><i data-a="${esc(d || '1')}"></i></span>`; },
  tab: t => `<table class="tbl">${t.map(row => `<tr>${row.map((c, i) => i === 0 ? `<th>${fmt(c)}</th>` : `<td>${fmt(c)}</td>`).join('')}</tr>`).join('')}</table>`
};

/* ---------- exercices ---------- */
const LV = { 1: ['👀', 'Je reconnais'], 2: ['🧩', 'Je comprends'], 3: ['✍️', 'J’écris'], calc: ['🧮', 'Je calcule'], brevet: ['🎓', 'Comme au brevet'], redige: ['📝', 'Je rédige'], parle: ['🗣️', 'Je parle'], defi: ['🏁', 'Défi'], sais: ['✅', 'Je sais'] };
const KEY = [];   // corrigé express : { sec, eid, title, corr }
let EXN = 0;
function ex(sec, lv, title, body, corr, cls = '') {
  const eid = 'e' + (++EXN); const [i, t] = LV[lv];
  if (corr != null) KEY.push({ sec, eid, title, corr });
  return `<div class="blk ex ${cls}" data-eid="${eid}"><div class="exh"><span class="num">·</span><span class="lv lv-${lv}">${i} ${t}</span><span class="ext">${title}</span></div><div class="exb">${body}</div></div>`;
}
const C = s => s.replace(/\*\*([^*]+)\*\*/g, '<strong class="v">$1</strong>');

/* 1. Le mot sous l’image (avec la banque de mots) */
function sousImage(words, r, max = 12) {
  const ws = []; for (const w of shuffle(words, r)) { if (ws.length >= max) break; if (ws.some(x => x.ill === w.ill)) continue; ws.push(w); }
  if (ws.length < 4) return null;
  const body = C(`<p class="cs">**Regarde** chaque image. **Écris** le bon mot dessous. Les mots sont dans le cadre.</p>`) + `<div class="bank">${shuffle(ws, r).map(w => `<span class="tag">${esc(w.mot)}</span>`).join('')}</div>
   <div class="sgrid">${ws.map(w => `<div class="sg">${ill(w, 'sg-ill')}${H.blank(10, w.mot)}</div>`).join('')}</div>`;
  return { body, corr: ws.map((w, i) => `${i + 1}. ${esc(w.mot)}`).join(' · ') };
}
/* 2. Mot ↔ définition */
function defs(words, r, n = 5) {
  const cands = words.filter(w => { const d = norm(flat(w.def)); const k = norm(w.mot).split(/[\s’']+/).filter(x => x.length > 3); return !d.includes(norm(w.mot)) && !k.some(x => d.includes(x.slice(0, Math.max(5, x.length - 2)))); });
  let pick = shuffle(cands, r).slice(0, n);
  if (pick.length < 4) pick = shuffle(words.filter(w => !norm(flat(w.def)).includes(norm(w.mot))), r).slice(0, n);
  if (pick.length < 3) return null;
  const right = derange(pick, r);
  const body = C(`<p class="cs">**Lis** les définitions. **Relie** chaque mot à sa définition.</p>`) + `<div class="rel rel-def">${pick.map((w, i) => `<div class="rl" data-a="→ ${right.indexOf(w) + 1}"><span class="rw c-${w.cat}"><span class="lab">${LET[i]}</span><span>${esc(fullName(w))}</span></span><span class="dot"></span></div><div></div><div class="rr"><span class="dot"></span><span class="rd"><span class="lab2">${i + 1}</span><span>${fmt(right[i].def, { noLex: true })}</span></span></div>`).join('')}</div>`;
  return { body, corr: pick.map((w, i) => `${LET[i]} → ${right.indexOf(w) + 1}`).join(' · ') };
}
/* 3. Je lis l’énoncé : QCM et vrai / faux de l’appli */
const enonce = txt => `<div class="enonce">${lines(txt).map(t => `<p>${fmt(t)}</p>`).join('')}</div>`;
function lisEnonce(items) {
  if (!items.length) return null;
  const body = C(`<p class="cs">**Lis** l’énoncé. **Coche** la bonne réponse.</p>`) + items.map((c, k) => {
    const opts = c.t === 'vf' ? `<div class="opts vfs">${H.box('Vrai', c.a === true)}${H.box('Faux', c.a === false)}</div>` : `<div class="opts">${c.o.map((o, i) => H.box(fmt(o), i === c.a)).join('')}</div>`;
    return `<div class="citem">${enonce(c.txt)}<p class="q">${k + 1}. ${fmt(c.q)}</p>${opts}</div>`; }).join('');
  return { body, corr: items.map((c, k) => `${k + 1}. ${c.t === 'vf' ? (c.a ? 'Vrai' : 'Faux') : fmt(c.o[c.a])} — ${fmt(c.exp || '')}`).join(' · ') };
}
/* 4. Je trouve la question et les données utiles */
const NUMRE = /−?\d+(?:[\u202f\u00a0 ]\d{3})*(?:,\d+(?:[\u202f\u00a0 ]\d{3})*)?(?:\/\d+)?/g;
const nkey = s => s.replace(/[   ]/g, '').replace(/−/g, '-');
function repere(items) {
  const q = items.find(c => c.t === 'question'), d = items.find(c => c.t === 'donnees');
  if (!q || !d) return null;
  const want = new Set(lines(d.a).map(nkey)); const found = new Set();
  const dtxt = esc(flat(d.txt)).replace(NUMRE, m => { const k = nkey(m); if (want.has(k) && !found.has(k)) { found.add(k); return `<span class="tg tg-c">${m}</span>`; } return m; });
  if (found.size !== want.size) err('données introuvables : ' + lines(d.a).join(',') + ' dans ' + flat(d.txt));
  const body = C(`<p class="cs">a. **Lis** l’énoncé. **Souligne** la phrase qui est la question.</p>`) +
    `<div class="enonce">${lines(q.txt).map((t, i) => `<span class="sent"><span class="tg${i === q.a ? ' tg-u' : ''}">${fmt(t)}</span></span>`).join(' ')}</div>` +
    C(`<p class="cs">b. **Lis** l’énoncé. **Entoure** les ${want.size === 2 ? 'deux ' : ''}données utiles : les nombres qui servent pour répondre.</p>`) + `<div class="enonce">${dtxt}</div>`;
  return { body, corr: `a. ${fmt(lines(q.txt)[q.a])} · b. ${lines(d.a).join(' et ')} — ${fmt(d.exp || '')}` };
}
/* 5. Le mot manquant (phrases des mots) */
function gapCands(w) {
  const res = [];
  for (const ph of w.ph || []) { const t = tokens(ph).filter(t => t.id === w.id); if (t.length !== 1) continue; const p = flat(ph); if (p.split(t[0].text).length - 1 !== 1) continue; res.push({ ph, tok: t[0] }); }
  return res;
}
const hint = s => [...s].map((c, i) => i === 0 ? c : (/[\s\-’']/.test(c) ? (c === ' ' ? '&nbsp;&nbsp;' : c) : '_')).join(' ');
function gaps(words, r, aide, bank) {
  const items = words.filter(w => gapCands(w).length).map(w => { const c = gapCands(w); return { w, g: c[Math.floor(r() * c.length)] }; });
  if (items.length < 3) return null;
  const line = x => `${fmt(x.g.ph.slice(0, x.g.tok.idx), { noLex: true })}${H.blank(Math.min(17, Math.max(6, x.g.tok.text.length + 1)), x.g.tok.text)}${fmt(x.g.ph.slice(x.g.tok.idx + x.g.tok.raw.length), { noLex: true })}`;
  const body = C(`<p class="cs">**Regarde** l’image. **Écris** le mot qui manque.${aide ? ' L’aide donne la première lettre.' : ''}</p>`) + (bank ? `<div class="bank">${shuffle(items.map(x => x.g.tok.text), r).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : '') +
    `<div class="gaps">${items.map(x => `<div class="gp">${ill(x.w, 'gp-ill')}<div><p class="gs">${line(x)}</p>${aide ? `<p class="hint"><span class="hl">aide :</span> ${hint(x.g.tok.text)}</p>` : ''}</div></div>`).join('')}</div>`;
  return { body, corr: items.map(x => esc(x.g.tok.text)).join(' · ') };
}
/* 6. Remets les mots dans l’ordre */
function toTags(ph) {
  let s = ph; const groups = [];
  s = s.replace(TOK, (_, t) => { if (/\s/.test(t)) { groups.push(t); return `§${groups.length - 1}§`; } return t; });
  s = flat(s);
  let tags = s.split(/ (?![?!:;»])/).map(t => t.replace(/§(\d+)§/g, (_, k) => groups[+k]));
  return tags;
}
function ordre(phrases, r) {
  const picks = phrases.filter(p => { const n = toTags(p).length; return n >= 4 && n <= 9; }).slice(0, 3);
  if (picks.length < 2) return null;
  const body = C(`<p class="cs">**Remets** les mots dans l’ordre. **Écris** la phrase.</p>`) + picks.map(p => { const tg = toTags(p); return `<div class="ord"><div class="bank">${derange(tg, r).map(t => `<span class="tag">${fmt(t, { noLex: true })}</span>`).join('')}</div>${H.lines(1, flat(p))}</div>`; }).join('');
  return { body, corr: picks.map((p, k) => `${k + 1}. ${fmt(p, { noLex: true })}`).join(' · ') + ' (un autre ordre correct est accepté)' };
}
/* 7. Je calcule : tirages des générateurs de l’appli */
function answerZone(q) {
  const a = T.answerShow(q), corr = lines(q.corr).map(flat).join(' ; ');
  if (q.type === 'qcm') return `<div class="opts">${q.o.map((o, i) => H.box(fmt(o), i === q.a)).join('')}</div>`;
  if (q.type === 'vf') return `<div class="opts vfs">${H.box('Vrai', q.a === true)}${H.box('Faux', q.a === false)}</div>`;
  if (q.type === 'frac') return `${H.work(corr)}<div class="ans"><span>Réponse :</span> ${H.frb(q.a)}</div>`;
  if (q.type === 'expr') return `${H.work(corr)}<div class="ans"><span>Réponse :</span>${H.blank(16, flat(a))}</div>`;
  return `${H.work(corr)}<div class="ans"><span>Réponse :</span>${H.blank(9, flat(a).replace(q.unit ? new RegExp('\\s*' + q.unit.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&') + '$') : /$^/, ''))}${q.unit ? `<span class="u">${esc(q.unit)}</span>` : ''}</div>`;
}
function calcCard(it, k) {
  const figs = [it.fig, ...it.qs.map(q => q.fig)].filter(Boolean); const tab = it.tab || it.qs.map(q => q.tab).find(Boolean);
  const scr = figs.some(f => /viewBox="0 0 2[5-9]\d/.test(f) || /viewBox="0 0 [3-9]\d\d/.test(f));
  const txtLen = [...lines(it.ctx), ...it.qs.map(q => q.q)].map(flat).join(' ').length;
  const wide = scr || !!tab || txtLen > 150 || it.qs.length > 1 || (it.qs[0].o && it.qs[0].o.map(flat).join('').length > 60);
  const qs = it.qs.map((q, i) => `${it.qs.length > 1 ? `<p class="ct"><b>${'abc'[i]}.</b> ${fmt(q.q)}</p>` : `<p class="ct">${fmt(q.q)}</p>`}${answerZone(q)}`).join('');
  const main = `<div class="cm"><div class="ct">${lines(it.ctx).map(t => `<p>${fmt(t)}</p>`).join('')}</div>${tab ? H.tab(tab) : ''}${qs}</div>`;
  return `<div class="calc${wide ? ' wide' : ''}${figs.length ? (scr ? ' hasscr' : ' hasfig') : ''}"><span class="calc-n">${k + 1}</span>${main}${figs.length ? `<div class="fig">${figs[0]}</div>` : ''}</div>`;
}
function calcBlock(m, d, seed, n) {
  const ids = m.calc; const out = [];
  seeded(seed, () => { for (let i = 0; out.length < n && i < n * 3; i++) { const id = ids[i % ids.length]; const it = T.makeCalc(id, d); if (it) out.push(it); } });
  if (!out.length) return null;
  LOG.calc[seed] = out.map(it => it.gen);
  const body = C(`<p class="cs">**Lis** bien. **Écris** ton calcul dans le cadre. **Écris** la réponse.</p>`) + `<div class="calcs">${out.map(calcCard).join('')}</div>`;
  return { body, corr: out.map((it, k) => `${k + 1}. ${it.qs.map(q => fmt(T.answerShow(q))).join(' ; ')}`).join(' · ') };
}
/* 8. Comme au brevet */
function brevet(b, cat) {
  const fig = b.fig ? `<div class="figr">${ILL(b.fig, cat)}</div>` : '';
  const qs = b.qs.map((q, i) => {
    let z = '';
    if (q.type === 'qcm') z = `<div class="opts" style="margin:1mm 0 0 8.4mm">${q.o.map((o, j) => H.box(fmt(o), j === q.a)).join('')}</div>`;
    else if (q.type === 'vf') z = `<div class="opts vfs" style="margin:1mm 0 0 8.4mm">${H.box('Vrai', q.a === true)}${H.box('Faux', q.a === false)}</div>`;
    else z = `<div class="pl"><span>Je calcule :</span>${H.lines(q.type === 'expr' ? 1 : 2, lines(q.corr).map(flat).join(' ; '))}</div>`;
    z += `<div class="pl"><span>Je réponds :</span>${H.lines(1, flat(q.rep))}</div>`;
    return `<div class="pq"><div class="pq-h"><span class="pq-n">${i + 1}</span><span class="pq-q">${fmt(q.q)}</span></div>${z}</div>`; }).join('');
  const pouce = b.qs.map((q, i) => (q.aide && q.aide.length) ? `<span><b>${i + 1}.</b> ${fmt(q.aide[0])}</span>` : '').join('');
  const body = `<div class="pbm">${fig}<div class="enonce">${lines(b.ctx).map(t => `<p>${fmt(t)}</p>`).join('')}</div>${b.tab ? H.tab(b.tab) : ''}${qs}${pouce ? `<div class="pouce"><b>💡 Coup de pouce</b> (si je bloque) : ${pouce}</div>` : ''}</div>`;
  return { body, corr: b.qs.map((q, i) => `${i + 1}. ${lines(q.corr).map(c => fmt(c)).join(' ; ')} → ${fmt(q.rep)}`).join(' · ') };
}
/* 9. Je rédige la phrase-réponse */
const VERBE = /\b(est|sont|mesure|mesurent|coûte|coûtent|vaut|valent|parcourt|dure|a|ont|fait|font|contient|reste|restent|gagne|paie|vient|viennent)\b|n’est/;
const REDIGE_OK = it => it && it.qs.length === 1 && it.qs[0].rep && VERBE.test(flat(it.qs[0].rep)) && flat(it.qs[0].rep).length > 14;
const solved = q => q.type === 'qcm' ? [`Réponse : ${q.o[q.a]}`] : q.type === 'vf' ? [(q.a ? 'Vrai. ' : 'Faux. ') + lines(q.corr).map(flat).join(' ; ')] : lines(q.corr);
function redige(m, seed) {
  const out = [];
  seeded(seed, () => { for (let i = 0; out.length < 3 && i < 90; i++) { const it = T.makeCalc(m.calc[i % m.calc.length], 1 + (i % 3)); if (REDIGE_OK(it) && !out.some(o => o.gen === it.gen)) out.push(it); } });
  const fromMeth = m.methodes.filter(me => me.exemple && me.exemple.reponse).map(me => ({ txt: me.exemple.enonce, calc: me.exemple.etapes.map(e => e.c), rep: me.exemple.reponse }));
  const items = out.map(it => ({ txt: lines(it.ctx).map(flat).join(' ') + ' ' + it.qs[0].q, calc: solved(it.qs[0]), rep: it.qs[0].rep })).concat(fromMeth).slice(0, 3);
  if (items.length < 2) return null;
  const body = C(`<p class="cs">Le calcul est fait. **Écris** la phrase-réponse, avec l’unité si elle existe.</p>`) +
    items.map((it, k) => `<div class="rdg"><p class="ct"><b>${k + 1}.</b> ${fmt(it.txt)}</p><p class="calcd">${it.calc.map(c => fmt(c)).join(' &nbsp;;&nbsp; ')}</p>${H.lines(1, flat(it.rep))}</div>`).join('') +
    C(`<p class="cs small">Pour bien commencer :</p>`) + `<ul class="starters"><li>Le résultat est …</li><li>La réponse est …</li><li>… mesure …</li><li>Donc …</li></ul>`;
  return { body, corr: items.map((it, k) => `${k + 1}. ${fmt(it.rep)}`).join(' · ') };
}
/* 10 bis. Mots mêlés (quand la grille de mots croisés est impossible) */
function motsMeles(words, r) {
  const N = Math.min(15, Math.max(12, ...words.map(w => CW(w.mot).length).filter(n => n <= 15))), ws = shuffle(words.filter(w => CW(w.mot).length >= 4 && CW(w.mot).length <= N), r).slice(0, 8);
  if (ws.length < 4) return null;
  for (let attempt = 0; attempt < 200; attempt++) {
    const g = Array.from({ length: N }, () => Array(N).fill(null)), put = [];
    let ok = true;
    for (const w of ws.slice().sort((a, b) => CW(b.mot).length - CW(a.mot).length)) {
      const s = CW(w.mot); let done = false;
      for (let t = 0; t < 300 && !done; t++) {
        const d = r() < .5 ? 0 : 1, x = Math.floor(r() * (N - (d ? 0 : s.length - 1))), y = Math.floor(r() * (N - (d ? s.length - 1 : 0)));
        let fit = true; for (let i = 0; i < s.length; i++) { const c = g[y + (d ? i : 0)][x + (d ? 0 : i)]; if (c && c !== s[i]) { fit = false; break; } }
        if (!fit) continue;
        for (let i = 0; i < s.length; i++) g[y + (d ? i : 0)][x + (d ? 0 : i)] = s[i];
        put.push({ w, x, y, d, s }); done = true; }
      if (!done) { ok = false; break; } }
    if (!ok) continue;
    const L = 'ABCDEFGHIJKLMNOPRSTUVZ', hit = new Set(); put.forEach(p => { for (let i = 0; i < p.s.length; i++) hit.add((p.y + (p.d ? i : 0)) + ',' + (p.x + (p.d ? 0 : i))); });
    const cells = g.map((row, y) => row.map((c, x) => `<span class="mm${hit.has(y + ',' + x) ? ' ok' : ''}">${c || L[Math.floor(r() * L.length)]}</span>`).join('')).join('');
    const body = C(`<p class="cs">**Cherche** les mots dans la grille. Ils sont écrits → ou ↓, sans accents. **Entoure**-les. **Coche** chaque mot trouvé.</p>`) +
      `<div class="mmw"><div class="mmg" style="grid-template-columns:repeat(${N},6.4mm)">${cells}</div><ul class="mml">${put.map(p => `<li>☐ ${esc(p.w.mot)}</li>`).join('')}</ul></div>`;
    LOG.cross.push('(mots mêlés) ' + put.map(p => p.s).join(' '));
    return { body, corr: put.map(p => `${p.s} ${p.d ? '↓' : '→'} ligne ${p.y + 1}, colonne ${p.x + 1}`).join(' · ') };
  }
  return null;
}
/* 10. Mots croisés */
const CW = s => norm(s).toUpperCase().replace(/[^A-Z]/g, '');
function crossword(words, r, max = 7) {
  const cands = words.filter(w => CW(w.mot).length >= 3 && CW(w.mot).length <= 13 && w.mot.split(/[\s\-’']+/).length <= 2)
    .filter(w => { const d = norm(flat(w.def)).replace(/[^a-z]/g, ''); const a = CW(w.mot).toLowerCase(); return !d.includes(a.slice(0, Math.min(5, a.length))); });
  if (cands.length < 4) return null;
  let best = null;
  for (let attempt = 0; attempt < 60; attempt++) {
    const order = shuffle(cands, r).slice(0, 14).sort((a, b) => CW(b.mot).length - CW(a.mot).length + (r() - .5) * 3);
    const grid = new Map(); const placed = [];
    const key = (x, y) => x + ',' + y; const at = (x, y) => grid.get(key(x, y));
    const put = (w, x, y, d) => { const s = CW(w.mot); for (let i = 0; i < s.length; i++) { const cx = x + (d ? 0 : i), cy = y + (d ? i : 0); const c = at(cx, cy); grid.set(key(cx, cy), { ch: s[i], h: (c && c.h) || !d, v: (c && c.v) || d }); } placed.push({ w, x, y, d, s }); };
    const fits = (s, x, y, d) => { let cross = 0;
      const bx = x - (d ? 0 : 1), by = y - (d ? 1 : 0), ax = x + (d ? 0 : s.length), ay = y + (d ? s.length : 0);
      if (at(bx, by) || at(ax, ay)) return -1;
      for (let i = 0; i < s.length; i++) { const cx = x + (d ? 0 : i), cy = y + (d ? i : 0); const c = at(cx, cy);
        if (c) { if (c.ch !== s[i] || (d ? c.v : c.h)) return -1; cross++; }
        else { const n1 = d ? at(cx - 1, cy) : at(cx, cy - 1), n2 = d ? at(cx + 1, cy) : at(cx, cy + 1); if (n1 || n2) return -1; } }
      return cross; };
    put(order[0], 0, 0, 0);
    for (const w of order.slice(1)) { if (placed.length >= max) break; const s = CW(w.mot); let opt = null;
      for (const p of placed) for (let i = 0; i < p.s.length; i++) for (let j = 0; j < s.length; j++) { if (p.s[i] !== s[j]) continue;
        const d = p.d ? 0 : 1; const px = p.x + (p.d ? 0 : i), py = p.y + (p.d ? i : 0); const x = px - (d ? 0 : j), y = py - (d ? j : 0);
        const c = fits(s, x, y, d); if (c > 0) { const xs = [...grid.keys()].map(k => +k.split(',')[0]).concat([x, x + (d ? 0 : s.length - 1)]), ys = [...grid.keys()].map(k => +k.split(',')[1]).concat([y, y + (d ? s.length - 1 : 0)]);
          const wdt = Math.max(...xs) - Math.min(...xs) + 1, hgt = Math.max(...ys) - Math.min(...ys) + 1; if (wdt > 15 || hgt > 13) continue;
          const sc = c * 10 - wdt * hgt * 0.05 + r(); if (!opt || sc > opt.sc) opt = { x, y, d, sc }; } }
      if (opt) put(w, opt.x, opt.y, opt.d); }
    if (placed.length >= 4 && (!best || placed.length > best.placed.length)) best = { grid, placed };
    if (best && best.placed.length >= max) break;
  }
  if (!best) return null;
  const { grid, placed } = best; const xs = [...grid.keys()].map(k => +k.split(',')[0]), ys = [...grid.keys()].map(k => +k.split(',')[1]);
  const x0 = Math.min(...xs), y0 = Math.min(...ys), Wd = Math.max(...xs) - x0 + 1, Hd = Math.max(...ys) - y0 + 1;
  const starts = [...new Set(placed.map(p => (p.y - y0) * 100 + (p.x - x0)))].sort((a, b) => a - b); const num = {}; starts.forEach((s, i) => num[s] = i + 1);
  const cell = 6.6; let cells = '';
  for (let y = 0; y < Hd; y++) for (let x = 0; x < Wd; x++) { const c = grid.get((x + x0) + ',' + (y + y0)); if (!c) continue; const n = num[y * 100 + x];
    cells += `<div class="cwc" style="left:${x * cell}mm;top:${y * cell}mm">${n ? `<span class="cwn">${n}</span>` : ''}<span class="cwl">${c.ch}</span></div>`; }
  const clue = p => `<li><b>${num[(p.y - y0) * 100 + (p.x - x0)]}.</b> ${fmt(p.w.def, { noLex: true })} <span class="cnt">(${p.s.length} lettres${/[\s\-’']/.test(p.w.mot) ? ', ' + p.w.mot.split(/[\s\-’']+/).length + ' mots' : ''})</span></li>`;
  const ord = arr => arr.sort((a, b) => num[(a.y - y0) * 100 + a.x - x0] - num[(b.y - y0) * 100 + b.x - x0]);
  const hz = ord(placed.filter(p => !p.d)), vt = ord(placed.filter(p => p.d));
  LOG.cross.push(placed.map(p => p.s).join(' '));
  const body = C(`<p class="cs">**Lis** les définitions. **Écris** les mots dans la grille, en majuscules et sans accents.</p>`) + `
  <div class="cw"><div class="cwg" style="width:${Wd * cell}mm;height:${Hd * cell}mm">${cells}</div>
  <div class="cwclues"><div><h4>→ Horizontalement</h4><ul>${hz.map(clue).join('')}</ul></div><div><h4>↓ Verticalement</h4><ul>${vt.map(clue).join('')}</ul></div></div></div>`;
  const nm = p => num[(p.y - y0) * 100 + p.x - x0];
  return { body, corr: '→ ' + hz.map(p => `${nm(p)}. ${p.s}`).join(', ') + ' · ↓ ' + vt.map(p => `${nm(p)}. ${p.s}`).join(', ') };
}
/* 11. Je parle */
function keyPhrases(words) {
  const all = []; words.forEach(w => (w.ph || []).forEach(p => all.push({ w, p, n: tokens(p).filter(t => W[t.id]).length })));
  const pick = []; const used = new Set();
  all.sort((a, b) => b.n - a.n || flat(a.p).length - flat(b.p).length).forEach(x => { if (pick.length < 4 && !used.has(x.w.id) && flat(x.p).length <= 70) { pick.push(x); used.add(x.w.id); } });
  return pick.map(x => `<li>${fmt(x.p)}</li>`).join('');
}
const parle = m => `<div class="parle"><div>
    ${C(`<p class="cs">🎧 **Scanne** le QR code. **Écoute** les mots du chapitre. **Répète** à voix haute.</p>`)}
    ${C(`<p class="cs">**Lis** ces phrases à voix haute, puis **lis**-les à ton voisin.</p>`)}<ol class="keys">${keyPhrases(m.mots)}</ol>
    ${C(`<p class="cs">**Explique** à ton voisin la méthode : <b>« ${esc(flat(m.methodes[0].titre))} »</b>. Ensuite, il t’**explique** une autre méthode du chapitre.</p>`)}
    <div class="amorces"><span>D’abord, je …</span><span>Ensuite, je …</span><span>Enfin, je …</span><span>Je sais que …</span><span>Donc …</span></div>
  </div><div class="qrbox">${qr(m.id + ':mots')}<span>🎧 Les mots<br>du chapitre</span></div></div>`;
const face = k => { const col = ['#1E7F45', '#E0A000', '#C2332A'][k]; const mouth = ['M14 25 Q20 31 26 25', 'M14 26 L26 26', 'M14 28 Q20 22 26 28'][k];
  return `<svg viewBox="0 0 40 40" class="face"><circle cx="20" cy="20" r="17" fill="#fff" stroke="${col}" stroke-width="3"/><circle cx="14" cy="16" r="2.4" fill="${col}"/><circle cx="26" cy="16" r="2.4" fill="${col}"/><path d="${mouth}" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round"/></svg>`; };
const jesais = m => C(`<p class="cs">**Entoure** le visage qui te va.</p>`) + `<table class="sais">${[...m.objectifs, 'Je sais lire et dire les mots du chapitre.', 'Je sais écrire une phrase-réponse.'].map(t => `<tr><td>${fmt(t)}</td><td>${face(0)}${face(1)}${face(2)}</td></tr>`).join('')}</table>`;

/* ---------- le cours et les méthodes ---------- */
function coursBlock(c, k, cat) {
  const il = c.ill ? `<div class="cb-ill">${ILL(c.ill, cat)}</div>` : '';
  return `<div class="blk cb${il ? '' : ' noill'}"><div class="cb-txt"><p class="cb-t"><span class="cb-n">${k + 1}</span>${fmt(c.titre)}</p>${c.txt.map(t => `<p>${fmt(t)}</p>`).join('')}
    ${c.tab ? H.tab(c.tab) : ''}${c.ex && c.ex.length ? `<div class="exm"><b>Exemple</b>${c.ex.map(t => `<p>${fmt(t)}</p>`).join('')}</div>` : ''}${c.note ? `<div class="att">⚠️ ${fmt(c.note)}</div>` : ''}</div>${il}</div>`;
}
function methodeBlock(me, k, cat) {
  const e = me.exemple;
  return `<div class="blk me"><p class="me-t"><span>Méthode ${k + 1}</span>${fmt(me.titre)}</p><ol class="steps">${me.etapes.map(s => `<li><span>${fmt(s)}</span></li>`).join('')}</ol>
   <div class="solved">${e.ill ? `<div class="ill">${ILL(e.ill, cat)}</div>` : ''}<h4>✔ Exemple résolu</h4><p class="en">${fmt(e.enonce)}</p>
   <div class="sv">${e.etapes.map(s => `<span class="t">${fmt(s.t)}</span><span class="c">${fmt(s.c)}</span>`).join('')}</div>
   <p class="rep">✅ <b>Réponse :</b> ${fmt(e.reponse)}</p></div></div>`;
}

/* ---------- un chapitre ---------- */
function chapter(m) {
  const r = rng('n2-' + m.id), sec = m.id, out = [], col = m.cat;
  const add = (lv, title, res, cls) => { if (res) out.push(ex(sec, lv, title, res.body, res.corr, cls)); else warn(`exercice absent : ${m.id} · ${title}`); };
  add(1, 'Les mots et les images', sousImage(m.mots, r));
  add(2, 'Le mot et sa définition', defs(m.mots, r));
  const qv = m.comprendre.filter(c => c.t === 'qcm' || c.t === 'vf');
  add(2, 'Je lis l’énoncé', lisEnonce(qv.slice(0, 3)));
  if (qv.length > 3) add(2, 'Je lis l’énoncé (suite)', lisEnonce(qv.slice(3, 6)));
  add(2, 'La question et les données', repere(m.comprendre));
  add(3, 'Le mot qui manque', gaps(shuffle(m.mots, r).slice(0, 6), r, true));
  const ordPh = m.comprendre.filter(c => c.t === 'ordre').map(c => c.phrase).concat(shuffle(m.mots.flatMap(w => (w.ph || []).filter(p => !/[«»;:]/.test(flat(p)))), r));
  add(3, 'Remets les mots dans l’ordre', ordre(ordPh, r));
  add('calc', 'Je m’entraîne · niveau 1', calcBlock(m, 1, 'c1-' + m.id, 4));
  add('calc', 'Je m’entraîne · niveau 2', calcBlock(m, 2, 'c2-' + m.id, 4));
  m.brevet.forEach(b => add('brevet', esc(flat(b.titre)), brevet(b, col)));
  add('redige', 'La phrase-réponse', redige(m, 'rd-' + m.id));
  out.push(ex(sec, 'parle', 'Je parle avec mon voisin', parle(m), null));
  { const cw = crossword(m.mots, r); if (cw) add('defi', 'Mots croisés', cw, 'defi'); else add('defi', 'Mots mêlés', motsMeles(m.mots, r), 'defi'); }
  out.push(ex(sec, 'sais', 'Mon bilan', jesais(m), null, 'sais'));
  const head = `<div class="blk chead kwn c-${col}"><div class="ch-txt"><div class="ch-k">Chapitre ${m.n} · ${esc(m.domaine)}</div><h2 class="fit">${m.icone} ${esc(m.titre)}</h2><p>${fmt(m.intro)}</p>
    <ul class="obj">${m.objectifs.map(o => `<li>${fmt(o)}</li>`).join('')}</ul>
    <p class="glink">📖 Les fiches des mots : glossaire, page <b data-pageof="g-${m.id}">…</b> · 🧮 Corrigés en ligne dans l’appli</p></div><div class="qrbox">${qr(m.id)}<span>📱 Le chapitre<br>dans l’appli</span></div></div>`;
  const chips = `<div class="blk mots"><h3>Les mots du chapitre</h3><div class="chips">${m.mots.map(w => `<span class="chip c-${w.cat}">${ART(w)}${esc(w.mot)}</span>`).join('')}</div></div>`;
  const cours = `<div class="blk sec-h kwn"><span class="ic">📘</span>Le cours</div>` + m.cours.map((c, k) => coursBlock(c, k, col)).join('');
  const meth = `<div class="blk sec-h kwn"><span class="ic">🧭</span>Les méthodes</div>` + m.methodes.map((me, k) => methodeBlock(me, k, col)).join('');
  const exh = `<div class="blk sec-h kwn"><span class="ic">✏️</span>Les exercices</div>`;
  return `<section class="sec" data-key="${m.id}" data-fill="1" data-run="Chapitre ${m.n} · ${esc(m.titre)}" data-col="${col}">${head}${chips}${cours}${meth}${exh}${out.join('')}</section>`;
}

/* ---------- révisions en spirale ---------- */
const REV = [{ upto: 4 }, { upto: 8 }, { upto: 12 }, { upto: 16 }];
function revision(rv, k) {
  const r = rng('rev2-' + k), mods = MODS.slice(0, rv.upto), recent = mods.slice(-4), sec = 'rev' + k, out = [];
  const add = (lv, title, res, cls) => { if (res) out.push(ex(sec, lv, title, res.body, res.corr, cls)); else warn('révision : exercice absent ' + title); };
  const pool = mods.flatMap(m => m.mots);
  const weighted = shuffle(pool, r).sort((a, b) => (mods.findIndex(m => m.id === a.mod) - mods.findIndex(m => m.id === b.mod)) * 0.3 + (r() - .5) * 4);
  add(1, 'Je me souviens : les mots et les images', sousImage(weighted, r, 8));
  add(2, 'Le mot et sa définition', defs(weighted.slice(8), r));
  add(3, 'Le mot qui manque', gaps(shuffle(pool, r).filter(w => gapCands(w).length).slice(0, 6), r, false, true));
  // calculs : un par chapitre (les 4 derniers en priorité), niveau 2
  const its = [];
  seeded('revc-' + k, () => { const chs = recent.concat(shuffle(mods.slice(0, -4), r)).slice(0, 8); chs.forEach(m => { const it = T.makeCalc(m.calc[Math.floor(Math.random() * m.calc.length)], 2); if (it) its.push(it); }); });
  [its.slice(0, 4), its.slice(4, 8)].forEach((part, j) => { if (part.length) out.push(ex(sec, 'calc', `Je calcule : un peu de tout${j ? ' (suite)' : ''}`, C(`<p class="cs">**Lis** bien. **Écris** ton calcul dans le cadre. **Écris** la réponse.</p>`) + `<div class="calcs">${part.map(calcCard).join('')}</div>`, part.map((it, i) => `${i + 1}. ${it.qs.map(q => fmt(T.answerShow(q))).join(' ; ')}`).join(' · '))); });
  add('defi', 'Mots croisés de révision', crossword(pool, r, 8), 'defi');
  out.push(ex(sec, 'parle', 'Je parle avec mon voisin', C(`<p class="cs">**Choisis** trois mots des chapitres 1 à ${rv.upto}. **Explique**-les à ton voisin sans les dire. Il **devine**. Ensuite, vous **changez** de rôle.</p>`) + `<div class="amorces"><span>C’est un mot de …</span><span>Ça sert à …</span><span>On l’utilise pour …</span><span>Par exemple, …</span><span>C’est le contraire de …</span></div>`, null));
  const head = `<div class="blk chead kwn c-brand"><div class="ch-txt"><div class="ch-k">Révision ${k}</div><h2 class="fit">🔁 Je révise</h2><p>Les chapitres 1 à ${rv.upto}. Je réactive ce que je sais déjà : les mots et les calculs.</p></div><div class="qrbox">${qr('home')}<span>📱 L’appli :<br>🔁 Spirale</span></div></div>`;
  return `<section class="sec" data-key="${sec}" data-fill="1" data-run="Révision ${k} · chapitres 1 à ${rv.upto}" data-col="brand">${head}${out.join('')}</section>`;
}

/* ---------- pages fixes ---------- */
const FAM = DATA.categories;
function cover() {
  const deco = ['fonction', 'hypotenuse', 'probabilite', 'puissance', 'equation', 'boucle'].map(id => W[id]).filter(Boolean).slice(0, 6).map((w, i) => `<span class="dc d${i}">${ILL(w.ill, w.cat)}</span>`).join('');
  return `<div class="page cover"><div class="inner"><div class="author">// Tom Rougeaud</div><div class="prof-only stamp">VERSION PROFESSEUR · avec les réponses</div>
  <div class="cv-panel">${deco}<div class="cv-k">Élèves allophones</div><div class="cv-title">MATHS</div><div class="cv-n2">Niveau 2 · A2 → B1</div><div class="cv-sub">Les maths de 3<sup>e</sup><br>en français facile</div><div class="cv-tome">Cours, méthodes, exercices et glossaire</div>
    <div class="cv-fam">${FAM.map(c => `<span class="fam c-${c.id}">${c.icone}</span>`).join('')}</div></div>
  <div class="cv-id"><div class="cv-classe">Classe : <b>UPE2A</b></div>
    <div class="cv-fields"><div><span>Prénom</span><i></i></div><div><span>Nom</span><i></i></div><div><span>Ma langue</span><i></i></div><div><span>Année scolaire</span><i></i></div></div>
    <div class="qrbox big">${qr('home')}<span>📱 L’appli<br>Maths Allophones 2</span></div></div></div></div>`;
}
function guidePage() {
  const P = [['📘', 'Le cours', 'Je lis les phrases du cours. Les mots en couleur sont dans le glossaire.'], ['🧭', 'Les méthodes', 'Je suis les étapes. Je regarde l’exemple résolu.'], ['🧩', 'Je comprends', 'Je lis l’énoncé. Je trouve la question et les données.'], ['🧮', 'Je m’entraîne', 'Je calcule. J’écris mon calcul, puis la réponse.'], ['🎓', 'Comme au brevet', 'Un problème en plusieurs questions. Le coup de pouce m’aide.'], ['📝', 'Je rédige', 'J’écris la phrase-réponse, avec l’unité.'], ['🗣️', 'Je parle', 'J’explique une méthode à mon voisin.'], ['✅', 'Je sais', 'Je regarde ce que je sais. J’entoure un visage.']];
  return `<div class="page"><div class="inner"><h1 class="pg-t">Mon livret : comment ça marche ?</h1>
  <div class="howto">${P.map(p => `<div class="hw"><span class="hi">${p[0]}</span><b>${p[1]}</b><span>${p[2]}</span></div>`).join('')}</div>
  <h2 class="pg-s">Les consignes</h2><p class="pg-p">${C('Le verbe de la consigne est **en gras et souligné**. Il dit ce que je dois faire : **Calcule**, **Justifie**, **Démontre**, **Résous**, **Développe**…')}</p>
  <h2 class="pg-s">Les couleurs des mots</h2><div class="legend">${FAM.map(c => `<span class="chip c-${c.id}">${c.icone} ${esc(c.nom)}</span>`).join('')}</div>
  <h2 class="pg-s">Le QR code 📱</h2>
  <div class="qrhow"><div class="qrbox">${qr('home')}<span>Essaie !</span></div><ol>
    ${C(`<li>**Ouvre** l’appareil photo du téléphone ou de la tablette, puis **vise** le QR code.</li><li>**Touche** le lien : l’appli s’ouvre sur le bon chapitre.</li><li>**Touche** 🔊 pour écouter le cours, les mots et les phrases.</li><li>Dans l’appli, les exercices sont corrigés tout de suite.</li>`)}</ol></div>
  </div></div>`;
}
const PHR = [
  ['🔁', 'Faire répéter', 'Tu peux répéter, s’il te plaît ?', 'Vous pouvez répéter, s’il vous plaît ?'],
  ['❓', 'Je ne comprends pas', 'Je ne comprends pas la question. Tu peux m’expliquer ?', 'Je ne comprends pas la consigne. Vous pouvez m’expliquer ?'],
  ['📖', 'Le sens d’un mot', 'Ça veut dire quoi, « … » ?', 'Que veut dire le mot « … », s’il vous plaît ?'],
  ['🧭', 'Demander la méthode', 'Tu as fait comment ?', 'Par quoi je commence, s’il vous plaît ?'],
  ['✅', 'Vérifier', 'Tu trouves combien ?', 'Est-ce que mon calcul est juste ?'],
  ['🙋', 'Proposer', 'Je pense que la réponse est …', 'Je propose de calculer …'],
  ['🤔', 'Ne pas être d’accord', 'Je ne suis pas d’accord, parce que …', 'Je ne suis pas sûr. Je pense que …'],
  ['🏁', 'J’ai fini', 'J’ai fini. Et toi ?', 'J’ai fini. Qu’est-ce que je fais maintenant ?']];
const JUST = [['Je sais que …', 'Je sais que ABC est rectangle en A.'], ['D’après l’énoncé, …', 'D’après l’énoncé, AB = 6 cm.'], ['J’utilise …', 'J’utilise le théorème de Pythagore.'], ['Je calcule …', 'Je calcule 6² + 8² = 100.'], ['Donc …', 'Donc BC = 10 cm.'], ['Car … / parce que …', 'C’est faux, car 2 × 3 = 6 et pas 5.'], ['Si … alors …', 'Si x = 4, alors 3x = 12.'], ['On en déduit que …', 'On en déduit que les droites sont parallèles.']];
function phrasesPage() {
  return `<div class="page"><div class="inner"><h1 class="pg-t">💬 Mes phrases pour la classe</h1>
  <p class="pg-p">${C('**Lis** ces phrases à voix haute. **Utilise**-les en classe. Avec un camarade, je dis <b>tu</b>. Avec le professeur, je dis <b>vous</b>.')}</p>
  <table class="phr2"><tr><th></th><th>👫 À un camarade <span>(tu)</span></th><th>🧑‍🏫 Au professeur <span>(vous)</span></th></tr>
  ${PHR.map(p => `<tr><td class="pk"><span>${p[0]}</span>${esc(p[1])}</td><td>${esc(p[2])}</td><td>${esc(p[3])}</td></tr>`).join('')}</table>
  <h2 class="pg-s">✍️ Pour justifier et rédiger</h2><p class="pg-p">${C('Au brevet, je dois **expliquer** ma réponse. J’utilise ces débuts de phrase.')}</p>
  <div class="jst">${JUST.map(j => `<div><b>${esc(j[0])}</b>${esc(j[1])}</div>`).join('')}</div></div></div>`;
}
function sommaire() {
  const row = (n, ic, t, key, cls) => `<div class="tc ${cls}"><span class="tn">${n}</span><span class="ti">${ic}</span><span class="tt">${esc(t)}</span><span class="tdots"></span><span class="tp" data-pageof="${key}">…</span></div>`;
  let rows = '';
  MODS.forEach(m => { rows += row(m.n, m.icone, m.titre, m.id, 'c-' + m.cat); const k = REV.findIndex(x => x.upto === m.n); if (k >= 0) rows += row('R', '🔁', `Révision ${k + 1} · chapitres 1 à ${REV[k].upto}`, 'rev' + (k + 1), 'c-brand rv'); });
  rows += row('F', '📏', 'Mon formulaire', 'form', 'c-brand') + row('G', '📖', 'Glossaire par chapitre', 'glo-intro', 'c-brand') + row('Z', '🔤', 'Glossaire de A à Z', 'az', 'c-brand') + row('+', '📝', 'Mes nouveaux mots', 'fin', 'c-brand');
  return `<div class="page"><div class="inner"><h1 class="pg-t">Sommaire</h1><div class="toc">${rows}</div></div></div>`;
}
const endPage = () => `<div class="page"><div class="inner" data-sec="fin"><h1 class="pg-t">📝 Mes nouveaux mots</h1><p class="pg-p">${C('**Écris** les mots nouveaux que tu apprends : en français, et dans ta langue.')}</p>
  <table class="nw"><tr><th>Le mot en français</th><th>Dans ma langue</th><th>Un dessin ou un exemple</th></tr>${Array.from({ length: 14 }, () => '<tr><td></td><td></td><td></td></tr>').join('')}</table></div></div>`;
const TPL = `<template id="notesTpl"><div class="blk notes"><h3>📝 Mes notes</h3><div class="lines"></div></div></template>`;

/* ---------- formulaire ---------- */
const F = require('./formulaire.js')(fmt);

/* ---------- glossaire ---------- */
function card(w, m) {
  const forms = w.cat === 'verbe' && w.f ? `<div class="forms">${w.f.c ? `<span><b>Consigne</b> ${esc(w.f.c)}</span>` : ''}${w.f.je ? `<span><b>${w.f.je.startsWith('il') ? 'Avec il' : 'Avec je'}</b> ${esc(w.f.je)}</span>` : ''}</div>` : '';
  const kp = (w.ph || []).map(p => { let out = '', last = 0; for (const t of tokens(p)) { out += fmt(p.slice(last, t.idx), { noLex: true }); out += t.id === w.id ? `<b class="kc c-${w.cat}">${esc(t.text)}</b>` : esc(t.text); last = t.idx + t.raw.length; } return `<li>${out + fmt(p.slice(last), { noLex: true })}</li>`; }).join('');
  const cat = CATS[w.cat];
  return `<div class="blk gcard c-${w.cat}" data-word="${w.id}"${m ? ` data-lesson="Glossaire · Chapitre ${m.n} · ${esc(m.titre)}" data-lcol="${m.cat}"` : ''}><div class="gc-ill">${ILL(w.ill, w.cat)}</div><div class="gc-b">
    <div class="gc-h"><span class="gc-w">${ART(w)}${esc(w.mot)}${w.sym ? ` <span class="sym">${esc(w.sym)}</span>` : ''}</span>${w.ctx ? `<span class="ctx">(${esc(w.ctx)})</span>` : ''}<span class="gc-cat">${cat.icone} ${esc(cat.nom)}</span></div>
    <p class="gc-def">${fmt(w.def, { noLex: true })}</p>${forms}<ul class="gc-ph">${kp}</ul>${w.dire && w.dire.length ? `<p class="dire">🗣️ On dit aussi : ${w.dire.map(d => fmt(d, { noLex: true })).join(' · ')}</p>` : ''}${w.note ? `<p class="note">💡 ${fmt(w.note, { noLex: true })}</p>` : ''}
    <div class="ml"><span>Dans ma langue :</span><i></i></div></div></div>`;
}
function guideG() {
  const s = W['hypotenuse'];
  return `<div class="page"><div class="inner" data-sec="glo-intro"><h1 class="pg-t">📖 Mon glossaire</h1>
  <p class="pg-p">Le glossaire a deux parties : <b>1.</b> les mots rangés <b>par chapitre</b> ; <b>2.</b> tous les mots rangés <b>de A à Z</b>.</p>
  <p class="pg-p">Les mots du niveau 1 (le matériel, les opérations, les figures…) sont dans le livret du niveau 1 et dans le glossaire de l’appli.</p>
  <h2 class="pg-s">Une fiche, c’est quoi ?</h2><div class="sample">${card(s).replace('class="blk gcard', 'class="gcard').replace(/ data-word="[^"]*"/, '')}</div>
  <ul class="annot"><li>🖼️ <b>L’image</b> aide à comprendre le mot.</li><li>🔤 <b>Le mot</b> avec son petit mot : le, la, l’.</li><li>📖 <b>La définition</b> explique le mot avec des mots simples.</li><li>💬 <b>Les phrases clés</b> : je les lis à voix haute.</li><li>🌍 <b>Dans ma langue</b> : j’écris le mot dans ma langue.</li><li>🗣️ <b>On dit aussi</b> : d’autres façons de dire.</li></ul>
  </div></div>`;
}
const gsecs = MODS.map(m => `<section class="sec glo" data-key="g-${m.id}" data-run="Glossaire · Chapitre ${m.n} · ${esc(m.titre)}" data-col="${m.cat}"><div class="blk ghead kwn c-${m.cat}"><div class="ch-txt"><div class="ch-k">Chapitre ${m.n} · ${m.mots.length} mots · exercices page <b data-pageof="${m.id}">…</b></div><h2 class="fit">${m.icone} ${esc(m.titre)}</h2></div><div class="qrbox">${qr(m.id + ':mots')}<span>🎧 Écoute</span></div></div>${m.mots.map(w => card(w, m)).join('')}</section>`).join('');
const sorted = N2.slice().sort((a, b) => norm(a.mot).replace(/[’'\-]/g, ' ').localeCompare(norm(b.mot).replace(/[’'\-]/g, ' '), 'fr') || a.mot.localeCompare(b.mot, 'fr'));
const letters = []; sorted.forEach(w => { const L = norm(w.mot)[0].toUpperCase(); let g = letters.find(x => x.L === L); if (!g) letters.push(g = { L, ws: [] }); g.ws.push(w); });
const azRow = w => { const m = MODS.find(x => x.id === w.mod); return `<div class="az c-${w.cat}"><div class="az-h"><b class="az-w">${esc(w.mot)}</b>${w.art ? ` <i>(${esc(w.art)})</i>` : ''}${w.ctx ? ` <i>· ${esc(w.ctx)}</i>` : ''}</div><div class="az-d">${fmt(w.def, { noLex: true })}</div><div class="az-r">${m.icone} ${esc(m.titre)} · fiche p. <span data-wordpage="${w.id}">…</span></div></div>`; };
const azSec = `<section class="sec az-sec" data-key="az" data-cols="2" data-run="Glossaire de A à Z" data-col="brand"><div class="blk ghead kwn c-brand span"><div class="ch-txt"><div class="ch-k">Tous les mots du niveau 2, dans l’ordre de l’alphabet</div><h2>🔤 Glossaire de A à Z</h2></div></div>
  ${letters.map(g => `<div class="blk az-l kwn"><span>${g.L}</span></div>` + g.ws.map(w => `<div class="blk azb">${azRow(w)}</div>`).join('')).join('')}</section>`;

/* ---------- assemblage ---------- */
let bodyMain = cover() + guidePage() + phrasesPage() + sommaire();
MODS.forEach(m => { bodyMain += chapter(m); const k = REV.findIndex(x => x.upto === m.n); if (k >= 0) bodyMain += revision(REV[k], k + 1); });
bodyMain += `<section class="sec" data-key="form" data-cols="2" data-run="Mon formulaire" data-col="brand">${F.html}</section>`;
bodyMain += guideG() + gsecs + azSec + endPage();

const secTitle = s => { const m = MODS.find(x => x.id === s); if (m) return `${m.icone} Chapitre ${m.n} · ${esc(m.titre)}`; const k = +s.slice(3); return `🔁 Révision ${k} · chapitres 1 à ${REV[k - 1].upto}`; };
const secCol = s => { const m = MODS.find(x => x.id === s); return m ? m.cat : 'brand'; };
const secs = [...new Set(KEY.map(k => k.sec))];
const keyBody = `<section class="sec corr" data-key="corr" data-run="Corrigé express" data-col="brand"><div class="blk chead kwn c-brand"><div class="ch-txt"><div class="ch-k">Version professeur</div><h2>✔️ Corrigé express</h2><p>Toutes les réponses, en bref. Les pages élèves de cette version portent déjà les réponses en rouge.</p></div></div>
  ${secs.map(s => `<div class="blk cc c-${secCol(s)}"><h3>${secTitle(s)} <small>(page <span data-pageof="${s}">…</span>)</small></h3>${KEY.filter(k => k.sec === s).map(k => `<p><b class="cn" data-numof="${k.eid}">·</b> <b>${k.title}</b> — ${k.corr}</p>`).join('')}</div>`).join('')}</section>`;

/* ---------- styles et document ---------- */
const STYLE = fs.readFileSync(path.join(ROOT, 'src', 'style.css'), 'utf8');
const rootVars = STYLE.match(/:root\{[^}]*\}/)[0];
const catVars = (STYLE.match(/\.c-[a-z]+\{--cc:[^}]*\}/g) || []).join('\n');
const FONTS = fs.readFileSync(path.join(ROOT, 'src', 'fonts.css'), 'utf8');
const CSS = fs.readFileSync(path.join(__dirname, 'print.css'), 'utf8'), PAG = fs.readFileSync(path.join(__dirname, 'paginate.js'), 'utf8');
const doc = (title, body, cls) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${FONTS}\n${rootVars}\n${catVars}\n${CSS}</style></head>
<body class="${cls}"><div id="flow">${body}</div><div id="out"></div>${TPL}<script>${PAG}</script></body></html>`;
fs.writeFileSync(path.join(__dirname, 'build', 'eleve.html'), doc('Maths Allophones · Niveau 2 — livret', bodyMain, 'eleve'));
fs.writeFileSync(path.join(__dirname, 'build', 'prof.html'), doc('Maths Allophones · Niveau 2 — version professeur', bodyMain + keyBody, 'prof'));
fs.writeFileSync(path.join(__dirname, 'build', 'log.json'), JSON.stringify({ ...LOG, chapitres: MODS.map(m => ({ id: m.id, n: m.n, titre: m.titre })) }, null, 1));
console.log('exercices :', EXN, '· erreurs :', LOG.errors.length, LOG.errors.slice(0, 10), '· avertissements :', LOG.warnings);
console.log('mots croisés :\n ' + LOG.cross.join('\n '));
