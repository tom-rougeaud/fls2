// Parcours complet de l’appli dans jsdom : toutes les pages, tous les chapitres,
// toutes les séries d’exercices, en répondant juste (par clics simulés).
const load=require('./load'); const dom=load({noDB:true}); const w=dom.window, d=w.document, T=w.__T;
let fails=0; const f=m=>{ fails++; console.log('✗',m); };
const go=h=>{ w.location.hash=h; w.dispatchEvent(new w.HashChangeEvent('hashchange')); };
const main=()=>d.getElementById('main').innerHTML;
const click=el=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const submit=form=>form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
const strip=s=>String(s).replace(/\{\{([^{}]+)\/([^{}]+)\}\}/g,'$1/$2').replace(/<[^>]+>/g,'');
function checkPage(h){ go(h); const m=main(); if(/Oups|Page introuvable/.test(m)) f('page en erreur '+h); if(/undefined|NaN|\[object/.test(m.replace(/data-[a-z]+="[^"]*"/g,''))) f('undefined/NaN dans '+h+' : '+(m.match(/.{40}(undefined|NaN|\[object).{40}/)||[''])[0]); return m; }
['#/','#/chapitres','#/entrainement','#/glossaire','#/carnet','#/parametres','#/a-propos','#/confidentialite','#/contact','#/studio','#/spirale','#/lecons','#/lecon/relatifs','#/mot/hypotenuse','#/mot/somme'].forEach(checkPage); go('#/nimportequoi'); if(!/introuvable/.test(main())) f('404');
// glossaire : tous les modes
go('#/glossaire'); ['az','cat','mod'].forEach(mode=>{ click(d.querySelector(`[data-act="gmode"][data-m="${mode}"]`)); if(!d.querySelectorAll('#gres .grow').length) f('glossaire vide '+mode); });
click(d.querySelector('[data-act="gn1"][data-v="1"]')); if(d.querySelectorAll('#gres .grow').length<300) f('glossaire + niveau 1');
const gq=d.getElementById('gq'); gq.value='hypoténuse'; gq.dispatchEvent(new w.Event('input',{bubbles:true})); if(!/hypoténuse/.test(d.getElementById('gres').innerHTML)) f('recherche glossaire');
// chaque chapitre, chaque onglet ; chaque mot du chapitre en mode « un mot à la fois »
T.MODS.forEach(m=>{ ['','/cours','/methode','/mots','/exos'].forEach(t=>checkPage('#/chap/'+m.id+t));
  go('#/chap/'+m.id+'/mots'); for(let i=0;i<m.mots.length-1;i++){ const b=d.querySelector('[data-act="lnext"]'); if(!b){ f('lnext absent '+m.id); break; } click(b); }
  if(!T.U.cs[m.id]) f('cours non marqué lu '+m.id); });
// bulles de définition : chaque mot coloré d’un cours ouvre sa fiche
go('#/chap/fonctions/cours'); const lex=d.querySelectorAll('#main .lex'); if(lex.length<10) f('peu de mots colorés'); click(lex[0]); if(d.getElementById('pop').hidden) f('bulle non ouverte');
// ---- répondre juste à un item de la série en cours ----
function answerWord(q){ const z=d.getElementById('qzone');
  if(q.type==='qcm'||q.type==='tiles'){ click(z.querySelector(`[data-act="opt"][data-v="${q.ans}"]`)); return; }
  if(q.type==='vf'){ click(z.querySelector(`[data-act="vf"][data-v="${q.ans?1:0}"]`)); return; }
  if(q.type==='match'){ q.left.forEach(id=>{ click(z.querySelector(`[data-act="mpick"][data-side="w"][data-id="${id}"]`)); click(z.querySelector(`[data-act="mpick"][data-side="r"][data-id="${id}"]`)); }); return; }
  if(q.type==='order'){ const used=new Set(); q.target.split(' ').forEach(tk=>{ const i=q.tiles.findIndex((t,j)=>t===tk&&!used.has(j)); used.add(i); click(d.querySelector(`#qzone [data-act="ord-add"][data-i="${i}"]`)); }); click(d.querySelector('#qzone [data-act="ord-check"]')); return; }
  if(q.type==='write'){ const fm=z.querySelector('form[data-form="w"]'); fm.elements.namedItem('a').value=q.expect[0]; submit(fm); return; }
  if(q.type==='sentence'){ const fm=z.querySelector('form[data-form="s"]'); fm.elements.namedItem('a').value=T.plain(q.model); submit(fm); return; }
  f('type inconnu '+q.type); }
function answerProb(it){ for(let k=0;k<it.qs.length;k++){ const q=it.qs[k]; const z=d.getElementById('qzone');
    if(q.type==='num'||q.type==='expr'){ const fm=z.querySelector('#pqcur form'); if(!fm||!fm.elements.namedItem('a')){ f('formulaire absent '+(it.gen||it.bid)+' k='+k+' '+(z.querySelector('#pqcur')||{outerHTML:'pas de #pqcur'}).outerHTML.slice(0,300)); return; } fm.elements.namedItem('a').value=q.type==='num'?strip(T.answerShow(q)):T.answerShow(q); submit(fm); }
    else if(q.type==='frac'){ const fm=z.querySelector('#pqcur form'); const [n,dd]=String(q.a).split('/'); fm.elements.namedItem('n').value=n; fm.elements.namedItem('d').value=dd; submit(fm); }
    else if(q.type==='qcm') click(z.querySelector(`#pqcur [data-act="popt"][data-v="${q.a}"]`));
    else if(q.type==='vf') click(z.querySelector(`#pqcur [data-act="popt"][data-v="${q.a?1:0}"]`));
    else if(q.type==='pick') click(z.querySelector(`#pqcur [data-act="ppick"][data-v="${q.a}"]`));
    else if(q.type==='pickn'){ q.toks.forEach((t,i)=>{ if(t.n&&q.want.includes(t.t.replace(/[{}\s  ]/g,'').replace(/−/g,'-'))&&!q.sel.includes(i)) click(z.querySelector(`#pqcur [data-act="ptok"][data-i="${i}"]`)); }); click(z.querySelector('#pqcur [data-act="pickok"]')); }
    else if(q.type==='ordre'){ const used=new Set(); q.target.split(' ').forEach(tk=>{ const i=q.tiles.findIndex((t,j)=>t===tk&&!used.has(j)); used.add(i); click(d.querySelector(`#pqcur [data-act="pord-add"][data-i="${i}"]`)); }); click(d.querySelector('#pqcur [data-act="pord-ok"]')); }
    if(!(q.st&&q.st.done&&q.st.good)) { f(`question non réussie ${it.gen||it.bid||it.mod} [${q.type}] ${strip(q.q)} : ${d.getElementById('fb').textContent.slice(0,120)}`); return; }
    if(k<it.qs.length-1){ const nb=d.querySelector('#qnext [data-act="pnext"]'); if(!nb){ f('bouton question suivante absent'); return; } click(nb); } } }
function playSeries(h,label){ go(h); let guard=0;
  while(T.Q&&T.Q.i<T.Q.items.length&&guard++<60){ const q=T.Q.items[T.Q.i]; if(q.type==='prob') answerProb(q); else answerWord(q);
    const nx=d.querySelector('#qnext [data-act="qnext"]'); if(!nx){ f(`${label} : pas de bouton suivant (item ${T.Q.i}, ${q.type}) ${d.getElementById('fb').textContent.slice(0,100)}`); return; } click(nx); }
  const m=main(); if(!/Voir|Recommencer/.test(m)) f(label+' : pas d’écran de fin'); if(T.Q.ok!==T.Q.tot) f(`${label} : ${T.Q.ok}/${T.Q.tot}`); return T.Q.tot; }
let tot=0;
T.MODS.forEach(m=>{ [1,2,3].forEach(l=>{ tot+=playSeries(`#/maths/${m.id}/${l}`,`maths ${m.id} ${l}`); tot+=playSeries(`#/exo/${m.id}/${l}`,`mots ${m.id} ${l}`); if(T.U.stars[`maths:${m.id}:${l}`]!==3) f('étoiles '+m.id+l); }); });
tot+=playSeries('#/spirale','spirale'); tot+=playSeries('#/brevet','brevet'); tot+=playSeries('#/revision','révision');
// une mauvaise réponse puis l’aide puis la correction
go('#/maths/equations/2'); let it=T.Q.items[0]; const q=it.qs[0];
if(q.type==='num'){ const fm=d.querySelector('#pqcur form'); fm.elements.namedItem('a').value='123456'; submit(fm); if(!d.querySelector('#pqcur .paide')) f('aide non affichée après erreur'); fm&&(d.querySelector('#pqcur form').elements.namedItem('a').value='654321'); submit(d.querySelector('#pqcur form')); if(!(q.st&&q.st.done&&!q.st.ok)) f('correction après 2 erreurs'); if(!/Correction/.test(main())) f('correction absente'); }
// export du carnet
checkPage('#/carnet'); if(!/brevet blanc/i.test(main())) f('carnet : ligne brevet');
console.log(`${tot} questions jouées.`, fails?`${fails} problèmes`:'Parcours OK'); process.exit(fails?1:0);
