/* =====================================================================
   PAGES
   ===================================================================== */
const N1_URL='https://tom-rougeaud.github.io/fls/';
function legendHTML(cats){ return `<div class="legend">${(cats||DATA.categories.map(c=>c.id)).map(catChip).join('')}</div>`; }
function modProgress(m){ const n=m.mots.length, s=m.mots.filter(id=>U.seen[id]).length; return {n,s,pct:Math.round(100*s/Math.max(1,n))}; }
function modStars(id,k){ return [1,2,3].map(l=>U.stars[`${k||'mod'}:${id}:${l}`]||0); }
function chapScore(m){ const st=modStars(m.id).concat(modStars(m.id,'maths')); return st.reduce((a,b)=>a+b,0); }
function modCard(m){ const p=modProgress(m);
  return `<a class="modcard chapcard c-${m.cat}" href="#/chap/${m.id}"><span class="mi" aria-hidden="true">${m.icone}</span><span class="mk">Chapitre ${m.num}</span><h3>${esc(m.titre)}</h3><p>${esc(m.intro)}</p>
  <div class="pbar"><i style="width:${p.pct}%"></i></div><span class="small muted">${U.cs[m.id]?'📖 cours lu · ':''}${p.s} / ${p.n} mots · ${starStr(Math.round(chapScore(m)/6))}</span></a>`; }

/* ---------- Accueil ---------- */
function viewAccueil(){
  const d=new Date(); const idx=(d.getFullYear()*372+d.getMonth()*31+d.getDate())%N2.length; const w=N2[idx];
  const last=U.last&&MOD[U.last.mod]?U.last:null;
  return `<div class="stack">
  ${Store.ok()?'':'<div class="banner">⚠️ Ce navigateur ne garde pas les données. Ta progression sera perdue en fermant la page.</div>'}
  ${voiceBanner()}
  <section class="hero"><span class="lvl2">Niveau 2</span><h1>Bonjour ! 👋</h1><p>Ici, tu travailles les maths du collège en français facile. Pour chaque chapitre : un cours simple, une méthode pas à pas, les mots importants et des exercices comme au brevet.</p>
   <div class="steps"><div class="step"><span class="n">1</span>Je lis le cours</div><div class="step"><span class="n">2</span>J’apprends les mots</div><div class="step"><span class="n">3</span>Je m’entraîne comme au brevet</div></div>
   <div class="row" style="margin-top:1rem">${last?`<a class="btn go" href="#/chap/${last.mod}">▶ Reprendre : ${esc(MOD[last.mod].titre)}</a>`:`<a class="btn go" href="#/chap/${MODS[0].id}">▶ Commencer</a>`}<a class="btn alt" href="#/glossaire">🔎 Chercher un mot</a></div></section>
  <section class="card"><h2>Les couleurs des mots</h2><p class="muted small">Dans les cours, les mots importants sont en couleur. Touche un mot coloré pour voir sa fiche. Les verbes des consignes sont <b class="kv">en gras et soulignés</b>.</p>${legendHTML()}
   <p style="margin-top:0.75rem">Exemple : ${rich('**Calcule** l’[[image]] de 3 par la [[fonction]] f, puis [[arrondis|arrondir]] [[au dixième près|au-dixieme]].')}</p></section>
  ${spiralCard()}
  <section><h2>Les chapitres</h2><div class="grid">${MODS.map(modCard).join('')}</div></section>
  <section><h2>S’entraîner</h2><div class="grid">${trainCards()}</div></section>
  <section class="card c-${w.cat}"><h2>Le mot du jour</h2><div class="row"><div style="width:7.5rem;background:var(--tt);border-radius:1rem">${renderIll(w.ill,w.cat)}</div><div style="flex:1 1 14rem"><p class="wc-word" style="font-size:1.8rem"><span class="art">${esc(w.art||'')}</span> <span class="m">${esc(w.mot)}</span></p><p>${rich(w.def)}</p><a class="btn sm alt" href="#/mot/${w.id}">Voir la fiche</a></div></div></section>
  <section class="card n1card"><h2>Besoin des mots de base ?</h2><p class="small">Les mots plus simples (la somme, le triangle, entourer…) sont dans le <b>niveau 1</b>. Ils sont aussi dans le glossaire de cette appli, avec l’étiquette « niveau 1 ».</p><a class="btn sm alt" href="${N1_URL}" target="_blank" rel="noopener">Ouvrir Maths Allophones · niveau 1 ↗</a></section>
  </div>`;
}
function trainCards(){
  const bb=Object.keys(U.bp).length; return `<a class="modcard c-algo" href="#/brevet"><span class="mi">🎓</span><h3>Mon brevet blanc</h3><p>4 problèmes mélangés, comme le jour du brevet.</p><span class="small">${bb} problème${bb>1?'s':''} déjà fait${bb>1?'s':''}</span></a>
  <a class="modcard c-verbe" href="#/spirale"><span class="mi">🌀</span><h3>La spirale</h3><p>Des mots et des calculs des chapitres déjà vus, mélangés.</p></a>
  <a class="modcard c-nombre" href="#/revision"><span class="mi">🔁</span><h3>Révision</h3><p>Ce que je dois encore travailler : mots et calculs ratés.</p></a>`; }

/* ---------- Chapitres ---------- */
/* Livret papier : un PDF par chapitre (cours, méthodes, exercices, fiches des mots) et le livret complet */
function pdfChap(m){ const n=MODS.indexOf(m)+1; return `pdf/chapitre-${String(n).padStart(2,'0')}-${m.id}.pdf`; }
const PDF_LIVRET='pdf/livret-maths-allophones-niveau-2.pdf';
function viewChapitres(){ const doms=[...new Set(MODS.map(m=>m.domaine))];
  return `<div class="stack"><h1>📚 Les chapitres</h1><p class="lede">16 chapitres pour tout le collège, et surtout la 3ᵉ. Dans chaque chapitre : le cours, la méthode, les mots, les exercices.</p>
  <div class="card row" style="justify-content:space-between;align-items:center;gap:.75rem"><span>📄 <b>Le livret papier</b> : cours, méthodes, exercices, formulaire et glossaire, dans le même ordre que l’appli.</span><a class="btn sm go" href="${PDF_LIVRET}" target="_blank" rel="noopener" download>Télécharger le livret (PDF)</a></div>${legendHTML()}
  ${doms.map(d=>`<h2 class="domh">${esc(d)}</h2><div class="grid">${MODS.filter(m=>m.domaine===d).map(modCard).join('')}</div>`).join('')}</div>`; }
const CTABS=[['cours','📖','Le cours'],['methode','🪜','La méthode'],['mots','🔤','Les mots'],['exos','🎯','Je m’entraîne']];
function viewChap(){
  const m=MOD[state.args[0]]; if(!m) return notFound(); const tab=CTABS.some(t=>t[0]===state.args[1])?state.args[1]:'cours';
  U.last={mod:m.id}; if(tab==='cours'||tab==='methode'){ U.cs[m.id]=1; } saveU();
  const i=MODS.indexOf(m), prev=MODS[i-1], next=MODS[i+1];
  let body=''; if(tab==='cours') body=coursHTML(m); else if(tab==='methode') body=methodeHTML(m); else if(tab==='mots') body=motsHTML(m); else body=exosHTML(m);
  return `<div class="stack c-${m.cat}">
  <p class="row"><a href="#/chapitres" class="btn sm alt">← Chapitres</a><button type="button" class="btn sm alt" data-act="print" data-mod="${m.id}">🖨️ Imprimer le cours</button><a class="btn sm go" href="${pdfChap(m)}" target="_blank" rel="noopener" download>📄 PDF du chapitre</a></p>
  <header class="chaphead"><span class="chapico" aria-hidden="true">${m.icone}</span><div><p class="mk-l">Chapitre ${m.num} · ${esc(m.domaine)} · ${esc(m.classe)}</p><h1>${esc(m.titre)}</h1><p class="lede">${esc(m.intro)}</p></div></header>
  <div class="card objs"><span class="lbl">🎯 Dans ce chapitre</span><ul>${(m.objectifs||[]).map(o=>`<li><span>${rich(o)}</span>${sayBtn(o,true)}</li>`).join('')}</ul></div>
  <nav class="ctabs" aria-label="Parties du chapitre">${CTABS.map(([id,ic,l])=>`<a href="#/chap/${m.id}/${id}" ${id===tab?'aria-current="page"':''}><span aria-hidden="true">${ic}</span> ${l}</a>`).join('')}</nav>
  ${body}
  <div class="row chapnav">${prev?`<a class="btn alt" href="#/chap/${prev.id}">← ${esc(prev.titre)}</a>`:''}<span style="flex:1"></span>${next?`<a class="btn alt" href="#/chap/${next.id}">${esc(next.titre)} →</a>`:''}</div>
  </div>`;
}
function lineHTML(t){ return `<p class="cl"><span>${rich(t)}</span>${sayBtn(t,true)}</p>`; }
function coursHTML(m){
  return `<div class="stack cours">${(m.cours||[]).map((c,k)=>`<section class="card cblock"><div class="cb-ill">${renderIll(c.ill,m.cat)}</div><div class="cb-txt"><h2><span class="cbn">${k+1}</span> ${esc(c.titre)} ${sayBtn(c.titre,true)}</h2>
    ${c.txt.map(lineHTML).join('')}${c.tab?tabHTML(c.tab):''}
    ${c.ex&&c.ex.length?`<div class="cex"><span class="lbl">Exemple${c.ex.length>1?'s':''}</span>${c.ex.map(lineHTML).join('')}</div>`:''}
    ${c.note?`<div class="note">⚠️ ${rich(c.note)} ${sayBtn(c.note,true)}</div>`:''}</div></section>`).join('')}
    <div class="card c-${m.cat} nextstep"><b>Et maintenant ?</b><div class="row"><a class="btn go" href="#/chap/${m.id}/methode">🪜 La méthode pas à pas</a><a class="btn alt" href="#/chap/${m.id}/mots">🔤 Les mots du chapitre</a></div></div></div>`; }
function methodeHTML(m){
  return `<div class="stack">${(m.methodes||[]).map((me,k)=>{ const ex=me.exemple;
    return `<section class="card meth"><h2>🪜 ${esc(me.titre)} ${sayBtn(me.titre,true)}</h2><ol class="msteps">${me.etapes.map(e=>`<li><span>${rich(e)}</span>${sayBtn(e,true)}</li>`).join('')}</ol>
    ${ex?`<div class="mex"><span class="lbl">Exemple résolu</span><div class="menonce"><span>${rich(ex.enonce)}</span>${sayBtn(ex.enonce,true)}</div>${ex.ill?`<div class="pfig">${renderIll(ex.ill,m.cat)}</div>`:''}
      <div class="mrows">${ex.etapes.map((e,i)=>`<div class="mrow"><span class="mn">${i+1}</span><span class="mt">${rich(e.t)} ${sayBtn(e.t,true)}</span>${e.c?`<span class="mc">${rich(e.c)}</span>`:''}</div>`).join('')}</div>
      <div class="mrep"><span>✍️ ${rich(ex.reponse)}</span>${sayBtn(ex.reponse,true)}</div></div>`:''}</section>`; }).join('')}
    <div class="card c-${m.cat} nextstep"><b>À toi !</b><div class="row"><a class="btn go" href="#/maths/${m.id}/2">🧮 Je calcule</a><a class="btn alt" href="#/maths/${m.id}/3">🎓 Comme au brevet</a></div></div></div>`; }
let LS={mod:null,i:0,mode:'one'};
function motsHTML(m){
  if(LS.mod!==m.id){ LS.mod=m.id; LS.i=0; }
  const ws=m.mots.map(id=>W[id]); if(!ws.length) return '<p class="muted">Pas de mot dans ce chapitre.</p>'; LS.i=Math.min(LS.i,ws.length-1); const cats=[...new Set(ws.map(w=>w.cat))];
  const body=LS.mode==='one'?`${wordCard(ws[LS.i])}
   <div class="lesson-nav c-${ws[LS.i].cat}"><button type="button" class="btn alt" data-act="lprev" ${LS.i===0?'disabled':''}>← Avant</button>
   <div class="dotsbar" role="group" aria-label="Mots du chapitre">${ws.map((w,i)=>`<button type="button" data-act="lgo" data-i="${i}" class="${U.seen[w.id]?'seen':''}" aria-current="${i===LS.i}" aria-label="Mot ${i+1} : ${esc(w.mot)}"></button>`).join('')}</div>
   ${LS.i<ws.length-1?`<button type="button" class="btn go" data-act="lnext">Après →</button>`:`<a class="btn go" href="#/exo/${m.id}/1">Je m’entraîne →</a>`}</div>
   <p class="small muted" style="text-align:center">Mot ${LS.i+1} sur ${ws.length}</p>`
   :`<div class="stack">${ws.map(wordCard).join('')}</div>`;
  return `<div class="stack">${legendHTML(cats)}<div class="row" style="justify-content:space-between"><div class="toggle" role="group" aria-label="Affichage"><button type="button" data-act="lmode" data-m="one" aria-pressed="${LS.mode==='one'}">Un mot à la fois</button><button type="button" data-act="lmode" data-m="list" aria-pressed="${LS.mode==='list'}">Tous les mots</button></div><span class="small muted">${ws.length} mots</span></div>${body}</div>`; }
const MLEVELS={1:{nom:'Je comprends l’énoncé',ico:'📄',desc:'Je lis, je trouve la question et les données utiles.'},2:{nom:'Je calcule',ico:'🧮',desc:'Des calculs guidés, avec de l’aide et la correction.'},3:{nom:'Comme au brevet',ico:'🎓',desc:'Des problèmes à plusieurs questions, et je rédige la réponse.'}};
function exosHTML(m){
  return `<div class="stack"><section class="card"><h2>🔢 Les maths du chapitre</h2><div class="levels">${[1,2,3].map(l=>`<a class="lvl" href="#/maths/${m.id}/${l}"><b>${MLEVELS[l].ico} ${MLEVELS[l].nom} ${starStr(U.stars[`maths:${m.id}:${l}`])}</b><span>${MLEVELS[l].desc}</span></a>`).join('')}</div></section>
  <section class="card"><h2>🔤 Les mots du chapitre</h2><div class="levels">${[1,2,3].map(l=>`<a class="lvl" href="#/exo/${m.id}/${l}"><b>${LEVELS[l].ico} ${LEVELS[l].nom} ${starStr(U.stars[`mod:${m.id}:${l}`])}</b><span>${LEVELS[l].desc}</span></a>`).join('')}</div></section></div>`; }

function formsHTML(w){ if(w.cat!=='verbe'||!w.f) return ''; const c=(w.f.c||'').split(' · ');
  return `<div class="forms"><div><b>Infinitif</b>${esc(w.mot)}</div>${c[0]?`<div><b>Consigne</b>${esc(c[0])}${c[1]?' · '+esc(c[1]):''}</div>`:''}<div><b>${w.f.je.startsWith('il')?'Avec il / ils':'Avec je'}</b>${esc(w.f.je)}</div></div>`; }
function wordCard(w){
  seen(w.id); const fav=U.fav.includes(w.id);
  return `<article class="wcard c-${w.cat} pop-in" aria-labelledby="t-${w.id}">
  <div class="wc-ill">${renderIll(w.ill,w.cat)}</div>
  <div>
   <div class="wc-meta">${catChip(w.cat)}${genreChip(w)}${w.n1?`<span class="chip plain">niveau 1</span>`:''}${w.ctx?`<span class="chip plain">sens : ${esc(w.ctx)}</span>`:''}</div>
   <div class="wc-head"><h2 class="wc-word" id="t-${w.id}">${w.art?`<span class="art">${esc(w.art)}</span>${w.art.endsWith('’')?'':' '}`:''}<span class="m">${esc(w.mot)}</span>${w.sym?`<span class="sym" aria-label="symbole">${esc(w.sym)}</span>`:''}</h2>
    <div class="wc-act">${sayBtn(speakText(w))}<button type="button" class="fav" data-act="fav" data-id="${w.id}" aria-pressed="${fav}" aria-label="${fav?'Retirer de mon carnet':'Ajouter à mon carnet'}">${fav?'♥':'♡'}</button></div></div>
   ${formsHTML(w)}
   <span class="lbl">Ce que ça veut dire</span><div class="def">${rich(w.def)} ${sayBtn(w.def,true)}</div>
   ${w.note?`<div class="note" style="margin-bottom:0.75rem">⚠️ ${rich(w.note)}</div>`:''}
   <span class="lbl">Je réutilise ces phrases</span>
   <ul class="phr">${w.ph.map(p=>`<li><span>${rich(p)}</span>${sayBtn(p,true)}</li>`).join('')}</ul>
   ${w.dire&&w.dire.length?`<span class="lbl">On peut aussi dire</span><ul class="phr dire">${w.dire.map(p=>`<li><span>${esc(p)}</span>${sayBtn(p,true)}</li>`).join('')}</ul>`:''}
   <div class="mine"><div><label for="cp-${w.id}">✍️ J’écris le mot</label><input class="inp" id="cp-${w.id}" data-copy="${w.id}" autocomplete="off" autocapitalize="off" spellcheck="false" lang="fr" placeholder="${esc(w.mot)}"></div>
   <div><label for="tr-${w.id}">🌍 Dans ma langue</label><input class="inp" id="tr-${w.id}" data-tr="${w.id}" autocomplete="off" value="${esc(U.tr[w.id]||'')}" placeholder="J’écris le mot dans ma langue"></div></div>
   ${w.n1?`<p class="small muted" style="margin-top:.6rem">Ce mot vient du niveau 1. <a href="${N1_URL}#/mot/${w.id}" target="_blank" rel="noopener">Le revoir dans le niveau 1 ↗</a></p>`:`<p class="small muted" style="margin-top:.6rem"><a href="#/chap/${w.mod}">${MOD[w.mod].icone} Chapitre ${MOD[w.mod].num} : ${esc(MOD[w.mod].titre)}</a></p>`}
  </div></article>`;
}
function viewMot(){ const w=W[state.args[0]]; if(!w) return notFound();
  return `<div class="stack"><p class="row"><button type="button" class="btn sm alt" data-act="back">← Retour</button>${MOD[w.mod]?`<a class="btn sm alt" href="#/chap/${w.mod}/mots">${MOD[w.mod].icone} ${esc(MOD[w.mod].titre)}</a>`:''}</p>${wordCard(w)}</div>`; }

/* ---------- Entraînement ---------- */
function viewEntrainement(){
  return `<div class="stack"><h1>🎯 S’entraîner</h1><p class="lede">Choisis un chapitre, ou une révision mélangée. Commence par « Je comprends l’énoncé » : on avance pas à pas.</p>
  ${spiralCard()}<div class="grid">${trainCards()}</div>
  <h2>Par chapitre</h2>
  <div class="stack">${MODS.map(m=>`<div class="card c-${m.cat} trainrow" style="border-left:0.5rem solid var(--cc)"><h3>${m.icone} ${m.num}. ${esc(m.titre)}</h3>
    <div class="levels sm3">${[1,2,3].map(l=>`<a class="lvl" href="#/maths/${m.id}/${l}"><b>${MLEVELS[l].ico} ${MLEVELS[l].nom} ${starStr(U.stars[`maths:${m.id}:${l}`])}</b></a>`).join('')}<a class="lvl" href="#/chap/${m.id}/exos"><b>🔤 Les mots ${starStr(Math.round(modStars(m.id).reduce((a,b)=>a+b,0)/3))}</b></a></div></div>`).join('')}</div></div>`;
}
function ensureSeries(key,cfg){ if(!Q||Q.key!==key||Q.stale||Q.i>=Q.items.length) startSeries({key,...cfg}); }
function viewExo(){
  const m=MOD[state.args[0]], lv=+state.args[1]; if(!m||![1,2,3].includes(lv)) return notFound();
  const pool=m.mots.map(id=>W[id]);
  ensureSeries(`mod:${m.id}:${lv}`,{title:`${m.titre} · mots · ${LEVELS[lv].nom}`,back:`#/chap/${m.id}/exos`,starsKey:`mod:${m.id}:${lv}`,nextHref:lv<3?`#/exo/${m.id}/${lv+1}`:null,make:()=>makeModItems(pool,lv)});
  return viewSeries();
}
function viewMaths(){
  const m=MOD[state.args[0]], lv=+state.args[1]; if(!m||![1,2,3].includes(lv)) return notFound();
  U.last={mod:m.id}; saveU();
  ensureSeries(`maths:${m.id}:${lv}`,{title:`${m.titre} · ${MLEVELS[lv].nom}`,back:`#/chap/${m.id}/exos`,starsKey:`maths:${m.id}:${lv}`,nextHref:lv<3?`#/maths/${m.id}/${lv+1}`:null,make:()=>lv===1?makeCompItems(m):lv===2?makeCalcItems(m):makeBrevetItems(m)});
  return viewSeries();
}
function viewBrevet(){ ensureSeries('brevet',{title:'Mon brevet blanc',back:'#/entrainement',starsKey:'brevet',make:makeBrevetBlanc}); return viewSeries(); }
function viewRevision(){ ensureSeries('rev',{title:'Révision',back:'#/entrainement',starsKey:null,make:makeRevItems}); return viewSeries(); }

/* ---------- Glossaire ---------- */
let G={q:'',mode:'az',n1:false};
function viewGlossaire(){
  return `<div class="stack"><h1>🔎 Glossaire</h1><p class="lede">Les ${N2.length} mots du niveau 2${G.n1?`, et ${RAPPELS.length} mots de base du niveau 1`:''}. Cherche un mot, ou ouvre une lettre, une famille ou un chapitre.</p>
  <div class="search"><span class="ico" aria-hidden="true">🔎</span><input id="gq" class="inp" type="search" placeholder="Chercher : médiane, hypoténuse, factoriser…" aria-label="Chercher un mot" value="${esc(G.q)}" autocomplete="off" lang="fr"></div>
  <div class="row"><div class="toggle" role="group" aria-label="Classer"><button type="button" data-act="gmode" data-m="az" aria-pressed="${G.mode==='az'}">De A à Z</button><button type="button" data-act="gmode" data-m="cat" aria-pressed="${G.mode==='cat'}">Par famille</button><button type="button" data-act="gmode" data-m="mod" aria-pressed="${G.mode==='mod'}">Par chapitre</button></div>
  <div class="toggle" role="group" aria-label="Niveau"><button type="button" data-act="gn1" data-v="0" aria-pressed="${!G.n1}">Niveau 2</button><button type="button" data-act="gn1" data-v="1" aria-pressed="${G.n1}">+ mots du niveau 1</button></div></div>
  <div id="gres"></div></div>`;
}
function gRow(w){ return `<a class="grow c-${w.cat}" href="#/mot/${w.id}"><span class="gi" aria-hidden="true">${renderIll(w.ill,w.cat)}</span><span><span class="ga">${esc(w.art||'')}</span> <span class="gw">${esc(w.mot)}</span>${w.n1?' <span class="ga">· niv. 1</span>':''}${U.tr[w.id]?`<br><span class="gt">${esc(U.tr[w.id])}</span>`:''}</span><span class="gd">${esc(plain(w.def))}</span></a>`; }
function sortKey(w){ return fold(w.mot.toLowerCase()).replace(/^[^a-z]+/,''); }
function drawGloss(){
  const box=document.getElementById('gres'); if(!box) return; const q=fold(G.q.trim().toLowerCase()); const pool=G.n1||q?WORDS:N2;
  if(q){ const res=pool.filter(w=>fold((w.mot+' '+plain(w.def)+' '+(U.tr[w.id]||'')+' '+(w.sym||'')).toLowerCase()).includes(q))
      .sort((a,b)=>(fold(a.mot.toLowerCase()).startsWith(q)?0:1)-(fold(b.mot.toLowerCase()).startsWith(q)?0:1)||(a.n1?1:0)-(b.n1?1:0)||sortKey(a).localeCompare(sortKey(b),'fr'));
    box.innerHTML=res.length?`<p class="small muted">${res.length} résultat${res.length>1?'s':''}</p><div class="acc-b" style="padding:0">${res.map(gRow).join('')}</div>`:`<div class="card"><p>Aucun mot trouvé pour « ${esc(G.q)} ». Vérifie l’orthographe, ou essaie un autre mot.</p></div>`; return; }
  let groups=[];
  if(G.mode==='az'){ const by={}; pool.forEach(w=>{ const l=sortKey(w)[0].toUpperCase(); (by[l]=by[l]||[]).push(w); }); groups=Object.keys(by).sort().map(l=>({t:l,ws:by[l].sort((a,b)=>sortKey(a).localeCompare(sortKey(b),'fr'))})); }
  else if(G.mode==='cat') groups=DATA.categories.map(c=>({t:`${c.icone} ${c.nom}`,ws:pool.filter(w=>w.cat===c.id).sort((a,b)=>sortKey(a).localeCompare(sortKey(b),'fr')),cls:'c-'+c.id})).filter(g=>g.ws.length);
  else { groups=MODS.map(m=>({t:`${m.icone} ${m.num}. ${m.titre}`,ws:m.mots.map(id=>W[id]),cls:'c-'+m.cat})); if(G.n1) groups.push({t:'📘 Mots de base du niveau 1',ws:RAPPELS.slice().sort((a,b)=>sortKey(a).localeCompare(sortKey(b),'fr'))}); }
  box.innerHTML=groups.map(g=>`<details class="acc ${g.cls||''}"><summary><span style="${g.cls?'color:var(--cc)':''}">${esc(g.t)}</span><span class="cnt">${g.ws.length} mot${g.ws.length>1?'s':''}</span><span class="car" aria-hidden="true">›</span></summary><div class="acc-b">${g.ws.map(gRow).join('')}</div></details>`).join('');
}

/* ---------- Carnet ---------- */
function viewCarnet(){
  const favs=U.fav.map(id=>W[id]).filter(Boolean);
  const trs=Object.keys(U.tr).filter(id=>W[id]&&U.tr[id]);
  const seenN=N2.filter(w=>U.seen[w.id]).length;
  const mastered=N2.filter(w=>U.m[w.id]&&U.m[w.id][0]>=2&&U.m[w.id][0]>U.m[w.id][1]).length;
  const calcOk=Object.values(U.mx).reduce((a,v)=>a+v[0],0);
  return `<div class="stack"><h1>📒 Mon carnet</h1>
  <div class="grid"><div class="card"><h3>📖 ${MODS.filter(m=>U.cs[m.id]).length} / ${MODS.length}</h3><p class="muted small">chapitres ouverts</p></div><div class="card"><h3>👀 ${seenN} / ${N2.length}</h3><p class="muted small">mots découverts</p></div><div class="card"><h3>✅ ${mastered}</h3><p class="muted small">mots bien réussis</p></div><div class="card"><h3>🧮 ${calcOk}</h3><p class="muted small">questions de maths réussies</p></div><div class="card"><h3>✍️ ${U.phrases.length}</h3><p class="muted small">phrases écrites</p></div></div>
  <section class="card"><h2>♥ Mes mots</h2>${favs.length?`<div class="acc-b" style="padding:0">${favs.map(gRow).join('')}</div>`:'<p class="muted">Pas encore de mot. Sur une fiche, touche ♡ pour garder un mot ici.</p>'}</section>
  <section class="card"><h2>🌍 Mes mots dans ma langue</h2>${trs.length?`<div class="scroll-x"><table class="tbl"><tr><th>Français</th><th>Ma langue</th></tr>${trs.map(id=>`<tr><td><a href="#/mot/${id}" class="lexb c-${W[id].cat}">${esc(fullName(W[id]))}</a></td><td>${esc(U.tr[id])}</td></tr>`).join('')}</table></div>`:'<p class="muted">Sur chaque fiche, tu peux écrire le mot dans ta langue.</p>'}</section>
  <section class="card"><h2>✍️ Mes phrases</h2>${U.phrases.length?`<ul class="phr">${U.phrases.map((p,i)=>`<li><span>${esc(p.t)} <span class="small muted">· ${esc(W[p.id]?W[p.id].mot:'')} · ${esc(p.d)}</span></span><button type="button" class="say sm" data-act="delph" data-i="${i}" aria-label="Supprimer cette phrase">🗑️</button></li>`).join('')}</ul>`:'<p class="muted">Les phrases écrites dans les exercices « J’écris » apparaîtront ici.</p>'}</section>
  <section class="card"><h2>📊 Ma progression</h2><div class="scroll-x"><table class="tbl"><tr><th>Chapitre</th><th>Cours</th><th>Mots vus</th><th>Mots</th><th>Énoncé</th><th>Calcul</th><th>Brevet</th></tr>
   ${MODS.map(m=>{ const p=modProgress(m); const ws=modStars(m.id), ms=modStars(m.id,'maths'); return `<tr><td>${m.icone} <a href="#/chap/${m.id}">${esc(m.titre)}</a></td><td>${U.cs[m.id]?'✅':'—'}</td><td>${p.s}/${p.n}</td><td>${starStr(Math.max(...ws))}</td>${ms.map(s=>`<td>${starStr(s)}</td>`).join('')}</tr>`; }).join('')}
   <tr><td>🎓 Brevet blanc</td><td colspan="5"></td><td>${starStr(U.stars.brevet)}</td></tr></table></div></section>
  <section class="card"><h2>💾 Mes données</h2><p class="small muted">Tout reste dans ce navigateur. Pour changer d’appareil, exporte un fichier puis importe-le sur l’autre appareil. Le professeur peut aussi lire ce fichier.</p>
   <div class="row"><button type="button" class="btn" data-act="export">⬇️ Exporter</button><label class="btn alt" for="importF">⬆️ Importer<input type="file" id="importF" accept="application/json,.json" class="sr"></label><button type="button" class="btn alt" data-act="wipe">🗑️ Effacer</button></div></section>
  </div>`;
}

/* ---------- Paramètres ---------- */
function ob(k,v,label){ return `<button type="button" class="ob" data-act="set" data-k="${k}" data-v="${v}" aria-pressed="${String(S[k])===String(v)}">${label}</button>`; }
function voiceBanner(){
  if(!S.nvBanner||nvEnabled().length||S.moteur==='appareil') return '';
  return `<div class="banner voice-banner"><b>🎧 Une voix plus naturelle ?</b> Installe la voix française de l’appli (≈ 63 Mo, une seule fois, puis elle marche sans internet). Si elle est déjà installée pour le niveau 1, elle marche aussi ici. <span class="row" style="margin-top:.5rem"><a class="btn sm go" href="#/parametres">Installer la voix</a><button type="button" class="btn sm alt" data-act="nv-hide">Plus tard</button></span></div>`;
}
function spiralCard(){
  const {seenW,due,chaps}=spiralState();
  if(seenW.length<4&&!chaps.length) return `<section class="card spiral"><h2>🌀 Ma spirale</h2><p class="muted">La spirale mélange les mots et les calculs des chapitres déjà vus, pour ne pas oublier. Ouvre un premier chapitre pour la lancer.</p></section>`;
  return `<section class="card spiral"><div class="row" style="justify-content:space-between"><div><h2 style="margin:0">🌀 Ma spirale du jour</h2><p class="muted small" style="margin:.3rem 0 0">${due.length} mot${due.length>1?'s':''} à revoir · ${chaps.length} chapitre${chaps.length>1?'s':''} mélangé${chaps.length>1?'s':''}. Ce qui est réussi revient plus tard, ce qui est raté revient vite.</p></div><a class="btn go" href="#/spirale">🌀 Lancer la spirale</a></div></section>`;
}
function viewSpirale(){
  const {seenW,chaps}=spiralState();
  if(seenW.length<4&&!chaps.length) return `<div class="stack"><h1>🌀 La spirale</h1><div class="card"><p>La spirale mélange les mots et les calculs des chapitres que tu as déjà vus. Commence par ouvrir au moins un chapitre.</p><a class="btn go" href="#/chapitres">Voir les chapitres</a></div></div>`;
  ensureSeries('spirale',{title:'Spirale · révision mélangée',back:'#/entrainement',starsKey:null,make:makeSpiralItems}); return viewSeries();
}
const NVP={};
function nvRows(){ return NV.map(v=>{ const inst=Neural.installed[v.id], on=(S.nv||[]).includes(v.id), pr=NVP[v.id];
  return `<div class="nv-row"><div><b>${esc(v.nom)}</b><br><span class="small muted">≈ ${v.mo} Mo · ${inst?(on?'installée, utilisée':'installée, pas utilisée'):'pas installée'}</span>${pr!=null?`<div class="pbar" style="margin-top:.3rem"><i style="width:${pr}%"></i></div><span class="small">${pr} %</span>`:''}</div>
  <div class="row">${inst?`<button type="button" class="btn sm alt" data-act="nv-test" data-id="${v.id}">▶ Tester</button><button type="button" class="btn sm alt" data-act="nv-toggle" data-id="${v.id}">${on?'Ne plus utiliser':'Utiliser'}</button><button type="button" class="btn sm alt" data-act="nv-del" data-id="${v.id}">Supprimer</button>`:`<button type="button" class="btn sm go" data-act="nv-install" data-id="${v.id}" ${pr!=null?'disabled':''}>⬇️ Installer</button>`}</div></div>`; }).join(''); }
function viewParametres(){
  const voices=sysVoices(); const nRec=(Bank.rows||[]).filter(c=>c.actif).length, nN1=(Bank.srows||[]).length;
  return `<div class="stack"><h1>⚙️ Paramètres</h1><p class="lede">Règle l’affichage et les voix.</p>
  <div class="card"><h2>🔊 Les voix</h2>
   <p class="small muted">L’appli choisit toujours la meilleure voix disponible : d’abord la voix du professeur, puis la voix naturelle installée, puis la voix de l’appareil. Une phrase est toujours dite en entier, d’un seul son.</p>
   <div class="set"><h3>1. La voix du professeur</h3>${DB.ok()?`<p>${nRec?`✅ ${nRec} enregistrement${nRec>1?'s':''} du niveau 2.`:'Aucun enregistrement du niveau 2 pour l’instant.'} ${nN1?`Et ${nN1} enregistrement${nN1>1?'s':''} du niveau 1, utilisés quand le texte est le même.`:''} ${DB.online?'':'<span class="small muted">(hors ligne : liste gardée sur cet appareil)</span>'}</p>
     <div class="opts-row">${ob('voixProf',true,'Utiliser la voix du professeur')}${ob('voixProf',false,'Ne pas l’utiliser')}</div>
     <div class="opts-row" style="margin-top:.5rem">${ob('voixN1',true,'Utiliser aussi les voix du niveau 1')}${ob('voixN1',false,'Seulement le niveau 2')}</div>
     ${nRec+nN1?`<p style="margin-top:.6rem"><button type="button" class="btn sm alt" data-act="prof-offline">⬇️ Garder ces voix pour le hors-ligne</button> <span class="small muted" id="profOff"></span></p>`:''}`:'<p class="small muted">La base de données n’est pas encore reliée.</p>'}</div>
   <div class="set"><h3>2. La voix naturelle (sur l’appareil)</h3><p class="small muted">Une voix française de synthèse neuronale, bien plus naturelle. Téléchargée une seule fois depuis Hugging Face, puis gardée sur cet appareil : elle marche ensuite sans internet. Elle est partagée avec le niveau 1.</p>
     <div class="nv-list" id="nvList">${nvRows()}</div>
     <div class="opts-row" style="margin-top:.6rem">${ob('alterner',false,'Une seule voix')}${ob('alterner',true,'Alterner les voix installées')}</div></div>
   <div class="set"><h3>3. La voix de l’appareil</h3>${TTS.ok?`<label for="voiceSel" class="lbl">Voix française</label><select id="voiceSel" class="inp"><option value="">Automatique (la plus naturelle)</option>${voices.map(v=>`<option value="${esc(v.voiceURI)}" ${S.voice===v.voiceURI?'selected':''}>${esc(v.name)}${rankVoice(v)>=10?' ★':''}${v.localService?' · sur l’appareil':' · en ligne'}</option>`).join('')}</select>
     <p class="small muted">★ = voix naturelle. Dans Microsoft Edge, les voix « Online (Natural) » sont excellentes. Sur iPad et iPhone : Réglages › Accessibilité › Contenu énoncé › Voix › Français, télécharger une voix « améliorée ».</p>
     <div class="opts-row">${ob('varier',true,'Varier un peu la voix')}${ob('varier',false,'Toujours pareil')}</div>`:'<p class="muted">Pas de voix sur ce navigateur.</p>'}</div>
   <div class="set"><h3>Qui parle ?</h3><div class="opts-row">${ob('moteur','auto','La meilleure voix disponible')}${ob('moteur','appareil','Seulement la voix de l’appareil')}</div></div>
   <div class="set"><h3>Vitesse</h3><div class="opts-row">${ob('rate',0.6,'🐢 Très lente')}${ob('rate',0.75,'Lente')}${ob('rate',0.9,'Normale')}${ob('rate',1.05,'Rapide')}</div></div>
   <button type="button" class="btn sm alt" data-act="say" data-t="Bonjour ! Calcule l’image de 3 par la fonction f. Bravo, c’est juste !">▶ Tester la voix</button></div>
  <div class="card"><h2>📣 Les commentaires du match</h2><p class="small muted">Après chaque réponse, un commentaire comme au football : « Et c’est le but ! », « Trois de suite ! »…</p>
   <div class="opts-row">${ob('comment',true,'Afficher les commentaires')}${ob('comment',false,'Pas de commentaires')}</div>
   <div class="opts-row" style="margin-top:.5rem">${ob('commentVoix',true,'Les dire à voix haute')}${ob('commentVoix',false,'Seulement écrits')}</div></div>
  <div class="card"><h2>👀 L’affichage</h2>
   <div class="set"><h3>Zoom</h3><p class="small muted">Aussi en haut à droite de l’écran (A− / A+).</p><div class="opts-row">${ob('zoom',0.9,'90 %')}${ob('zoom',1,'100 %')}${ob('zoom',1.2,'120 %')}${ob('zoom',1.4,'140 %')}${ob('zoom',1.7,'170 %')}${ob('zoom',2,'200 %')}</div></div>
   <div class="set"><h3>Couleur du fond</h3><div class="opts-row">${ob('theme','clair','☀️ Clair')}${ob('theme','creme','📜 Crème')}${ob('theme','sombre','🌙 Sombre')}</div></div>
   <div class="set"><h3>Espace entre les lettres et les lignes</h3><div class="opts-row">${ob('espace',false,'Normal')}${ob('espace',true,'Plus d’espace')}</div></div>
   <div class="set"><h3>Couleurs</h3><div class="opts-row">${ob('contraste',false,'Contraste normal')}${ob('contraste',true,'Contraste fort')}</div><div class="opts-row" style="margin-top:.5rem">${ob('dalto',false,'Couleurs normales')}${ob('dalto',true,'Couleurs pour daltoniens')}</div></div>
   <button type="button" class="btn alt" data-act="resetset">Remettre les réglages par défaut</button></div>
  <div class="card"><h2>🎙️ Espace professeur</h2><p class="small muted">Enregistrer sa voix pour les mots, le cours, les méthodes, les énoncés et les commentaires. Réservé au professeur (connexion).</p><a class="btn" href="#/studio">Ouvrir le studio</a></div>
  </div>`;
}
function viewApropos(){ const nT=(()=>{ try{ return studioItems().length; }catch(e){ return 0; } })(); return `<div class="stack prose"><h1>💬 À propos</h1>
  <p><b>Maths Allophones · Niveau 2</b> aide les élèves allophones qui parlent déjà un peu français (niveau A2 vers B1) à suivre le cours de mathématiques du collège, et surtout de 3ᵉ, et à réussir les exercices du brevet.</p>
  <h2>Ce qu’il y a dans l’appli</h2><ul>
  <li><b>${MODS.length} chapitres</b> qui couvrent le programme du collège : nombres, calcul littéral, fonctions, statistiques et probabilités, grandeurs et mesures, géométrie, algorithmique.</li>
  <li>Pour chaque chapitre : un <b>cours en français facile</b> (inspiré du FALC : phrases courtes, une idée par phrase, des exemples), une <b>méthode pas à pas</b> avec un exemple résolu, et les <b>mots importants</b>.</li>
  <li><b>${N2.length} mots</b> du niveau 2, chacun avec une image, une définition simple, des phrases à réutiliser et sa prononciation. Les ${RAPPELS.length} mots de base du niveau 1 sont aussi là, en rappel.</li>
  <li>Trois sortes d’exercices de maths : <b>je comprends l’énoncé</b> (trouver la question, les données utiles, le sens d’un mot), <b>je calcule</b> (des calculs tirés au hasard, avec de l’aide et la correction), <b>comme au brevet</b> (des problèmes à plusieurs questions, et une phrase-réponse à rédiger).</li>
  <li>Un <b>livret papier</b> en PDF, dans le même ordre que l’appli : le cours, les méthodes, des exercices à faire sur papier, un formulaire pour le brevet et le glossaire, avec des QR codes qui ouvrent le bon chapitre. Il se télécharge en entier (page Chapitres) ou chapitre par chapitre.</li>
  <li>Les verbes des consignes sont <b class="kv">en gras et soulignés</b>. Un chapitre entier explique les consignes du brevet : justifier, démontrer, en déduire, valeur exacte ou approchée…</li>
  <li>La <b>voix du professeur</b> (${nT} textes à enregistrer, plusieurs prises qui tournent) ; sinon une voix naturelle de synthèse. Une phrase est toujours dite en entier : jamais de sons assemblés. Les enregistrements du niveau 1 sont réutilisés quand le texte est le même.</li>
  <li>Des <b>commentaires comme au football</b>, la <b>spirale</b> (mots et calculs des chapitres déjà vus), un <b>brevet blanc</b>, un glossaire, un carnet, le zoom et des réglages d’affichage.</li></ul>
  <h2>Auteur et licence</h2><p>Conçu par Tom Rougeaud, professeur de mathématiques-sciences, avec l’aide de Claude (Anthropic). Licence <a href="https://creativecommons.org/licenses/by-nc/4.0/deed.fr" rel="noopener" target="_blank">CC BY-NC 4.0</a>. Le <a href="${N1_URL}" target="_blank" rel="noopener">niveau 1</a> travaille le vocabulaire de base.</p>
  <h2>Logiciels utilisés</h2><p class="small">Voix naturelle : Piper (MIT), phonémiseur espeak-ng (GPL-3), ONNX Runtime Web (MIT), voix française SIWIS (CC BY 4.0) et Tom. Encodage MP3 du studio : LAME / lamejs (LGPL). Polices : Andika et Inter (SIL Open Font License), intégrées dans la page. Ces fichiers sont dans le dossier <code>vendor/</code> avec leurs licences. Les blocs de programmation sont dessinés dans l’esprit de Scratch (projet du MIT) ; Scratch est une marque du MIT, qui n’est pas lié à cette appli.</p>
  <h2>Modifier le contenu</h2><p>Tout le contenu (chapitres, mots, exercices) est dans un seul bloc de données dans <code>index.html</code> (<code>id="mm-data"</code>). Les sources lisibles sont dans le dépôt GitHub.</p>
  <p class="small muted">Version 1 · ${esc(today())}</p></div>`; }
function viewConfidentialite(){ return `<div class="stack prose"><h1>🔒 Confidentialité</h1>
  <p>Cette application est faite pour des élèves, souvent mineurs. Elle ne collecte <b>aucune donnée personnelle sur les élèves</b>.</p>
  <h2>Pas de compte élève</h2><p>Les élèves n’ont ni inscription ni mot de passe. Aucun cookie, aucune statistique, aucune publicité.</p>
  <h2>Ce qui est gardé sur l’appareil de l’élève</h2><ul><li>les chapitres ouverts, les mots vus, les réussites, les étoiles et la spirale ;</li><li>les mots du carnet, les mots écrits « dans ma langue » et les phrases écrites ;</li><li>les réglages ;</li><li>la voix naturelle, si elle a été installée.</li></ul>
  <p>Ces données ne quittent jamais l’appareil. Le bouton <b>Effacer</b> du carnet supprime tout. Sur un ordinateur partagé, pensez à effacer en fin de séance. Les données du niveau 1 et du niveau 2 sont séparées.</p>
  <h2>La voix du professeur (base de données)</h2><p>Les enregistrements de la voix du professeur sont stockés dans sa base Supabase. L’appli les télécharge pour les faire écouter : l’hébergeur Supabase voit alors une connexion technique (adresse IP), comme pour tout site web. Rien de ce que l’élève fait ou écrit n’y est envoyé. Seul le professeur, connecté, peut ajouter ou supprimer des enregistrements.</p>
  <h2>La voix naturelle</h2><p>Si on clique sur « Installer », le fichier de voix (≈ 63 Mo) est téléchargé une fois depuis Hugging Face (service qui héberge ces voix libres), qui voit alors une connexion technique. Ensuite, la voix fonctionne sur l’appareil, sans rien envoyer. Le texte lu n’est jamais transmis.</p>
  <h2>La voix de l’appareil</h2><p>Certaines voix « en ligne » du navigateur (voix Google dans Chrome, voix « Online » dans Edge) envoient le texte lu au fabricant. Seuls les textes de l’appli sont lus, jamais ce que l’élève écrit.</p>
  <h2>Hébergement</h2><p>Sur GitHub Pages, l’hébergeur peut enregistrer des informations techniques de connexion, selon sa propre politique.</p>
  <h2>Contact</h2><p>Voir la page <a href="#/contact">Contact</a>.</p></div>`; }
function viewContact(){ return `<div class="stack prose"><h1>✉️ Contact</h1><p>Maths Allophones est conçu par Tom Rougeaud, professeur de mathématiques-sciences.</p>
  <p>Pour une question, une remarque ou une idée d’exercice, passez par mon casier de ressources :</p><p><a class="btn" href="https://tom-rougeaud.github.io/casier/" target="_blank" rel="noopener">Ouvrir le casier</a></p></div>`; }
function notFound(){ return `<div class="card"><h1>Page introuvable</h1><p><a class="btn" href="#/">Retour à l’accueil</a></p></div>`; }

/* ---------- Fiche à imprimer : le cours, la méthode et les mots ---------- */
function printModule(id){
  const m=MOD[id]; const root=document.getElementById('print-root');
  root.innerHTML=`<h1>${m.num}. ${esc(m.titre)} — Maths Allophones · Niveau 2</h1><p>Nom : ............................................ Date : ................</p>
  <h2>Le cours</h2>${m.cours.map(c=>`<div class="pblock"><div class="pill">${renderIll(c.ill,m.cat)}</div><div><h3>${esc(c.titre)}</h3>${c.txt.map(t=>`<p>${rich(t,false)}</p>`).join('')}${c.tab?tabHTML(c.tab):''}${(c.ex||[]).length?`<p><i>Exemple :</i> ${c.ex.map(t=>rich(t,false)).join('<br>')}</p>`:''}${c.note?`<p>⚠️ ${rich(c.note,false)}</p>`:''}</div></div>`).join('')}
  <h2>La méthode</h2>${m.methodes.map(me=>`<div class="pblock"><div><h3>${esc(me.titre)}</h3><ol>${me.etapes.map(e=>`<li>${rich(e,false)}</li>`).join('')}</ol>${me.exemple?`<p><b>Exemple :</b> ${rich(me.exemple.enonce,false)}</p><ol>${me.exemple.etapes.map(e=>`<li>${rich(e.t,false)} ${e.c?`<b>${rich(e.c,false)}</b>`:''}</li>`).join('')}</ol><p><b>${rich(me.exemple.reponse,false)}</b></p>`:''}</div></div>`).join('')}
  <h2>Les mots</h2><table><tr><th style="width:6.5625rem">Image</th><th>Le mot</th><th>Ce que ça veut dire</th><th>Une phrase</th><th style="width:20%">Dans ma langue</th></tr>
  ${m.mots.map(i=>{ const w=W[i]; return `<tr><td>${renderIll(w.ill,w.cat)}</td><td class="w">${esc(fullName(w))}${w.sym?' ('+esc(w.sym)+')':''}</td><td>${rich(w.def,false)}</td><td>${rich(w.ph[0],false)}</td><td class="blank">${esc(U.tr[i]||'')}</td></tr>`; }).join('')}</table>
  <p style="font-size:9pt">Maths Allophones · Niveau 2 · Tom Rougeaud · CC BY-NC 4.0</p>`;
  try{ window.print(); }catch(e){ toast('Impression impossible sur cet appareil.'); }
}
