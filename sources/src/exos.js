/* =====================================================================
   EXERCICES — moteur commun (séries de questions)
   ===================================================================== */
let Q=null;
const LEVELS={1:{nom:'Je reconnais',desc:'Je regarde, j’écoute, je choisis.',ico:'👀'},2:{nom:'Je comprends',desc:'J’associe, je complète, je range les mots.',ico:'🧩'},3:{nom:'J’écris',desc:'J’écris les mots et des phrases.',ico:'✍️'}};
const PRAISE=['Bravo !','Super !','Très bien !','C’est juste !','Bien joué !'];
const COMFORT=['Ce n’est pas grave.','On continue !'];
/* ---------- Le commentateur (comme un match de foot) ---------- */
const Comm={hist:{},queued:{},
  pick(ev){ const pool=commentPool(ev); if(!pool.length) return ''; const h=this.hist[ev]||[]; let c=pool.filter(t=>!h.includes(t)); if(!c.length) c=pool; const t=c[Math.floor(Math.random()*c.length)]; h.push(t); while(h.length>Math.max(0,Math.min(4,pool.length-1))) h.shift(); this.hist[ev]=h; return t; },
  peek(ev){ if(!this.queued[ev]) this.queued[ev]=this.pick(ev); return this.queued[ev]; },
  take(ev){ const t=this.queued[ev]||this.pick(ev); delete this.queued[ev]; return t; }
};
function commentEvent(good,correct,presque){
  if(!correct){ Q.streak=0; Q.lastWrong=true; return 'faux'; }
  if(!good){ Q.streak=0; Q.lastWrong=false; return 'remontee'; }
  Q.streak=(Q.streak||0)+1; let ev='juste';
  if(Q.streak===8) ev='serie8'; else if(Q.streak===5) ev='serie5'; else if(Q.streak===3) ev='serie3'; else if(Q.lastWrong) ev='remontee'; else if(presque) ev='presque';
  Q.lastWrong=false; return ev; }
function commentSay(t){ if(t&&S.comment&&S.commentVoix) speak(t); }
const PROMPTS=['Quel est ce mot ?','Écoute. Quel mot entends-tu ?','Quelle image va avec ce mot ?','Vrai ou faux ?','Relie chaque mot à son image.','Relie chaque mot à sa définition.','Complète la phrase avec le bon mot.','Remets les mots dans l’ordre pour faire la phrase.','Écris ce verbe (à l’infinitif).','Écris ce mot.','Dictée : écoute et écris le mot.','Écris le mot manquant.','Écris une phrase avec ces mots.','Que veut dire ce mot dans la phrase ?','Je rédige la phrase-réponse : remets les mots dans l’ordre.','Touche la phrase qui est la question.','Touche les données utiles, puis valide.','Lis l’énoncé, puis réponds.'];
function qp(t){ return `<div class="qprompt"><span>${esc(t)}</span> ${sayBtn(t,true)}</div>`; }
function starStr(n){ n=n||0; return `<span class="stars" aria-label="${n} étoile${n>1?'s':''} sur 3">${'★'.repeat(n)}${'☆'.repeat(3-n)}</span>`; }
const SR_INT=[0,1,2,4,7,15,30];
function srUpdate(id,ok){ const s=U.sr[id]||{b:0,d:0}; if(ok){ s.b=Math.min(6,s.b+1); s.d=Date.now()+SR_INT[s.b]*864e5; } else { s.b=1; s.d=Date.now(); } s.t=Date.now(); U.sr[id]=s; }
function rec(id,ok){ if(!id) return; const m=U.m[id]||[0,0]; m[ok?0:1]++; U.m[id]=m; srUpdate(id,ok); saveU(); }
/* ---------- La spirale : on mélange les leçons déjà vues pour ne pas oublier ----------
   Des mots (révision espacée) et des calculs des chapitres déjà ouverts. */
function spiralState(){ const seenW=WORDS.filter(w=>U.seen[w.id]); const now=Date.now();
  const due=seenW.filter(w=>{ const s=U.sr[w.id]; return !s||s.d<=now; }); const mods=[...new Set(seenW.map(w=>w.mod).filter(m=>MOD[m]))];
  const chaps=MODS.filter(m=>U.cs[m.id]||mods.includes(m.id));
  return {seenW,due,mods,chaps}; }
function makeSpiralItems(){
  const {seenW,due,chaps}=spiralState(); const dk=w=>((U.sr[w.id]||{}).d)||0;
  let pool=shuffle(due).sort((a,b)=>dk(a)-dk(b)); if(pool.length<8) pool=pool.concat(seenW.filter(w=>!pool.includes(w)).sort((a,b)=>dk(a)-dk(b)));
  const by={}; pool.forEach(w=>(by[w.mod]=by[w.mod]||[]).push(w)); const ms=shuffle(Object.keys(by)); const chosen=[]; let k=0; const nW=chaps.length?7:10;
  while(chosen.length<nW&&ms.some(m=>by[m].length)){ const m=ms[k%ms.length]; if(by[m].length) chosen.push(by[m].shift()); k++; }
  const base=seenW.length>=4?seenW:WORDS;
  const items=chosen.map((w,i)=>{ const b=(U.sr[w.id]||{b:0}).b; const t=b<=1?['img2word','word2img','vf','audio2word']:b<=3?['tiles','order','matchImg','matchDef']:['writeWord','writeGap','dictee'];
    let q=null; for(let j=0;j<t.length&&!q;j++) q=GEN[t[(i+j)%t.length]](w,base); return q||GEN.img2word(w,base); });
  /* calculs : d’abord ceux qui ont été ratés */
  const gens=chaps.flatMap(m=>m.calc.map(g=>({g,m:m.id}))); const sc=x=>{ const r=U.mx[x.g]; return r?(r[1]-r[0]):0.5; };
  const picks=shuffle(gens).sort((a,b)=>sc(b)-sc(a)).slice(0,10-items.length);
  picks.forEach(x=>{ const it=makeCalc(x.g,2); if(it){ it.mod=x.m; items.splice(rnd(1,items.length),0,it); } });
  return items;
}
function startSeries(cfg){ Q={...cfg,items:cfg.make(),i:0,ok:0,tot:0,missed:[],gmiss:[],stale:false,streak:0}; }
function viewSeries(){
  return `<div class="quiz"><p class="row" style="justify-content:space-between"><a href="${Q.back}" class="btn sm alt">← Retour</a><span class="chip plain">${esc(Q.title)}</span></p><div id="qzone"></div></div>`;
}
function itemCat(q){ return q.w?q.w.cat:(q.cat||(q.mod&&MOD[q.mod]?MOD[q.mod].cat:(q.gen&&GEN2MOD[q.gen]?MOD[GEN2MOD[q.gen]].cat:'nombre'))); }
function drawQ(){
  const z=document.getElementById('qzone'); if(!z||!Q) return;
  if(Q.i>=Q.items.length){ z.innerHTML=endHTML(); commentSay(Q.endComment); return; }
  const q=Q.items[Q.i]; const cat=itemCat(q);
  z.innerHTML=`<div class="qtop"><span class="small muted">${Q.i+1} / ${Q.items.length}</span><div class="pbar c-${cat}"><i style="width:${Math.round(100*Q.i/Q.items.length)}%"></i></div><span class="small">✅ ${Q.ok}</span></div>
  <div class="qcard c-${cat} pop-in">${R[q.type].html(q)}<div id="fb" class="fb" role="status" aria-live="polite"></div><div class="qnext" id="qnext"></div></div>`;
  if(R[q.type].after) R[q.type].after(q);
  let intro='';
  if(Q.i===0&&S.comment) intro=Comm.take(Q.key==='spirale'?'spirale':(q.type==='prob'&&q.brevet?'brevet':'debut'));
  else if(q.type==='prob'&&q.brevet&&S.comment) intro=Comm.take('brevet');
  else if(Q.i===Q.items.length-1&&Q.items.length>2&&S.comment) intro=Comm.take('derniere');
  if(intro){ const f=document.getElementById('fb'); if(f){ f.className='fb intro'; f.innerHTML=`<span class="com">📣 ${esc(intro)}</span>`; } }
  if(q.autoSay) setTimeout(()=>speak(q.autoSay),intro?150:250); else if(intro) commentSay(intro);
  /* prépare la voix des prochains textes (aucun assemblage : chaque texte est synthétisé entier) */
  if(S.comment&&S.commentVoix) nvPrefetch(['juste','faux',Q.streak===2?'serie3':null,Q.streak===4?'serie5':null].filter(Boolean).map(ev=>Comm.peek(ev)));
  nvPrefetch([q.autoSay,q.say,q.prompt].filter(Boolean));
  const f=z.querySelector('input.inp,textarea.inp'); if(f&&q.type!=='prob'){ try{ f.focus({preventScroll:true}); }catch(e){} }
}
function fb(kind,msg,extra,comment){ const f=document.getElementById('fb'); if(!f) return; f.className='fb '+kind; f.innerHTML=(comment?`<span class="com">📣 ${esc(comment)}</span>`:'')+(msg?`<span class="msg">${esc(msg)}</span>`:'')+(extra||''); live((comment?comment+' ':'')+(msg||'')); }
function showNext(label){ const n=document.getElementById('qnext'); if(!n) return; n.innerHTML=`<button type="button" class="btn go" data-act="qnext">${label||'Continuer →'}</button>`; const b=n.querySelector('button'); try{ b.focus({preventScroll:true}); }catch(e){} }
function finish(q,correct,msg,extra,presque){
  if(q.fin) return; q.fin=true;
  const good=correct&&!q.err; Q.tot++; if(good) Q.ok++; else if(q.w) Q.missed.push(q.w.id);
  if(q.w) rec(q.w.id,good);
  const ev=commentEvent(good,correct,presque); const c=S.comment?Comm.take(ev):'';
  fb(correct?(presque?'mid':'ok'):'ko',msg||'',extra,c); commentSay(c); Q.lastEv=ev;
  document.querySelectorAll('#qzone .opt, #qzone .tile, #qzone .mit').forEach(b=>b.disabled=true);
  showNext(Q.i===Q.items.length-1?'Voir mon résultat →':'Continuer →');
}
function endHTML(){
  const tot=Math.max(1,Q.tot); const r=Q.ok/tot; const st=r>=0.85?3:r>=0.55?2:1;
  if(Q.starsKey){ U.stars[Q.starsKey]=Math.max(U.stars[Q.starsKey]||0,st); saveU(); }
  const msg=st===3?'Magnifique ! Tu maîtrises ce travail.':st===2?'Très bon travail ! Continue comme ça.':'Bravo, tu as fini ! Recommence pour gagner des étoiles.';
  Q.endComment=S.comment?Comm.take('fin'+st):'';
  const miss=[...new Set(Q.missed)].map(id=>W[id]).filter(Boolean);
  const gm=[...new Set(Q.gmiss)].map(g=>GEN2MOD[g]).filter(Boolean); const cm=[...new Set(gm)].map(id=>MOD[id]);
  return `<div class="qcard result pop-in"><div class="big">${st===3?'🏆':st===2?'🌟':'💪'}</div>${Q.endComment?`<p class="com big-com">📣 ${esc(Q.endComment)}</p>`:''}<h2>${esc(msg)}</h2><p>${starStr(st)}</p><p class="muted">${Q.ok} bonne${Q.ok>1?'s':''} réponse${Q.ok>1?'s':''} du premier coup sur ${tot}.</p>
  ${miss.length?`<p class="lbl" style="margin-top:0.875rem">Mots à revoir</p><div class="missed">${miss.map(w=>`<a class="chip c-${w.cat}" href="#/mot/${w.id}">${esc(fullName(w))}</a>`).join('')}</div>`:''}
  ${cm.length?`<p class="lbl" style="margin-top:0.875rem">Méthodes à revoir</p><div class="missed">${cm.map(m=>`<a class="chip c-${m.cat}" href="#/chap/${m.id}/methode">${m.icone} ${esc(m.titre)}</a>`).join('')}</div>`:''}
  <div class="row" style="justify-content:center;margin-top:0.75rem"><button type="button" class="btn go" data-act="again">🔁 Recommencer</button>${Q.nextHref?`<a class="btn" href="${Q.nextHref}">Niveau suivant →</a>`:''}<a class="btn alt" href="${Q.back}">Retour</a></div></div>`;
}

/* ---------- Rendus des types de question ---------- */
const R={
  qcm:{ html:q=>`${qp(q.prompt)}${q.show||''}<div class="opts">${q.opts.map(o=>`<button type="button" class="opt${q.imgOpts?' img':''}" data-act="opt" data-v="${esc(o.v)}">${o.html}</button>`).join('')}</div>` },
  vf:{ html:q=>`${qp('Vrai ou faux ?')}<div class="qill">${renderIll(q.w.ill,q.w.cat)}</div><p class="qbig" style="font-size:1.4rem">${esc(q.stmt)} ${sayBtn(q.stmt,true)}</p><div class="opts"><button type="button" class="opt" data-act="vf" data-v="1">✓ Vrai</button><button type="button" class="opt" data-act="vf" data-v="0">✗ Faux</button></div>` },
  match:{ html:q=>`${qp(q.mode==='img'?'Relie chaque mot à son image.':'Relie chaque mot à sa définition.')}<p class="small muted">Touche un mot, puis ce qui va avec.</p>
    <div class="match"><div class="mcol">${q.left.map(id=>`<button type="button" class="mit" data-act="mpick" data-side="w" data-id="${id}" aria-pressed="false">${esc(fullName(W[id]))}</button>`).join('')}</div>
    <div class="mcol">${q.right.map(id=>`<button type="button" class="mit${q.mode==='img'?' img':''}" data-act="mpick" data-side="r" data-id="${id}" aria-pressed="false" aria-label="${q.mode==='img'?'Image':'Définition'}">${q.mode==='img'?renderIll(W[id].ill,W[id].cat):esc(maskIn(plain(W[id].def),W[id]))}</button>`).join('')}</div></div>` },
  tiles:{ html:q=>`${qp('Complète la phrase avec le bon mot.')}<p class="sentence" id="gapS">${gapHTML(q.ph,q.tok)}</p><div class="tiles">${q.opts.map(o=>`<button type="button" class="tile" data-act="opt" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div>` },
  order:{ html:q=>`${qp('Remets les mots dans l’ordre pour faire la phrase.')}${q.w?`<div class="qill" style="max-width:10.625rem">${renderIll(q.w.ill,q.w.cat)}</div>`:''}
    <div class="ordline" id="ordline">${q.built.map((t,i)=>`<button type="button" class="tile" data-act="ord-del" data-i="${i}">${esc(q.tiles[t])}</button>`).join('')}</div>
    <div class="tiles">${q.tiles.map((t,i)=>`<button type="button" class="tile${q.built.includes(i)?' used':''}" data-act="ord-add" data-i="${i}">${esc(t)}</button>`).join('')}</div>
    <div class="qnext"><button type="button" class="btn alt sm" data-act="ord-reset">Effacer</button><button type="button" class="btn sm" data-act="ord-check">Vérifier</button></div>` },
  write:{ html:q=>`${qp(q.prompt)}${q.show||''}
    <form class="wform" data-form="w" autocomplete="off"><div class="row"><input class="inp" name="a" aria-label="Ta réponse" autocapitalize="off" autocorrect="off" spellcheck="false" lang="fr" ${q.inputmode?`inputmode="${q.inputmode}"`:''} placeholder="${q.copy?'Recopie ici':'Écris ici'}"><button class="btn" type="submit">Valider</button></div>${q.inputmode?'':kbd()}</form>` },
  sentence:{ html:q=>`${qp('Écris une phrase avec ces mots.')}<div class="qill" style="max-width:10.625rem">${renderIll(q.w.ill,q.w.cat)}</div>
    <div class="req" id="req">${q.req.map(r=>`<span class="chip c-${W[r].cat}" data-r="${r}">${esc(W[r].mot)}</span>`).join('')}</div>
    <form class="wform" data-form="s" autocomplete="off"><textarea class="inp" name="a" rows="2" aria-label="Ta phrase" lang="fr" spellcheck="false" placeholder="Je …"></textarea>${kbd()}
    <div class="row"><button class="btn" type="submit">Valider ma phrase</button><button type="button" class="btn alt" data-act="model">Voir un modèle</button></div></form>` },
  op:{ html:q=>opHTML(q) },
  geste:{ html:q=>gesteHTML(q) }
};
function gapHTML(ph,tok,fill){ return rich(ph.slice(0,tok.index))+`<span class="gap">${fill?esc(fill):'…'}</span>`+rich(ph.slice(tok.index+tok.len)); }

/* ---------- Générateurs (leçons) ---------- */
function distinctMot(list){ const seenM=new Set(); return list.filter(x=>{ const k=fold(x.mot.toLowerCase()); if(seenM.has(k)) return false; seenM.add(k); return true; }); }
function others(w,pool,n,filter){
  const ok=x=>x.id!==w.id&&x.ill!==w.ill&&fold(x.mot.toLowerCase())!==fold(w.mot.toLowerCase())&&(!filter||filter(x));
  let c=distinctMot(shuffle(pool.filter(ok)));
  if(c.length<n) c=distinctMot(c.concat(shuffle(N2.filter(x=>ok(x)&&x.cat===w.cat))));
  if(c.length<n) c=distinctMot(c.concat(shuffle(WORDS.filter(x=>ok(x)&&x.cat===w.cat))));
  if(c.length<n) c=distinctMot(c.concat(shuffle(N2.filter(ok))));
  return c.slice(0,n);
}
function verbForms(w){ const f=w.f||{}; const c=(f.c||'').split(' · '); const je=(f.je||'').split(' · ')[0].replace(/^(je |j’|il |ils )/,''); return {inf:w.mot,tu:c[0]||'',vous:c[1]||'',je}; }
function cap(s,like){ return like&&like[0]!==like[0].toLowerCase()?s[0].toUpperCase()+s.slice(1):s; }
function formLike(tokText,w,x){
  if(w.cat==='verbe'){ if(x.cat!=='verbe') return null; const fw=verbForms(w),fx=verbForms(x); const t=tokText.toLowerCase();
    for(const k of ['je','tu','vous','inf']) if(fw[k]&&fw[k].toLowerCase()===t) return fx[k]?cap(fx[k].toLowerCase(),tokText):null; return null; }
  if(tokText.toLowerCase()===w.mot.toLowerCase()) return cap(x.mot,tokText);
  if(tokText.toLowerCase()===(w.mot+'s').toLowerCase()) return cap(/[sxz]$/.test(x.mot)?x.mot:x.mot+'s',tokText);
  return null;
}
function phraseCands(w){ const c=[]; w.ph.forEach(ph=>tokens(ph).forEach(t=>{ if(t.id===w.id) c.push({ph,tok:t}); })); return c; }
function stmtFor(x){
  if(x.cat==='verbe') return `Cette image montre le verbe « ${x.mot} ».`;
  if(x.art==='le signe') return `C’est le signe ${x.mot}.`;
  if(x.g==='mpl'||x.g==='fpl') return `Ce sont des ${x.mot}.`;
  if(x.g) return `C’est ${indef(x)} ${x.mot}.`;
  return `Cette image montre « ${x.mot} ».`;
}
const GEN={
  img2word:(w,pool)=>({type:'qcm',w,prompt:'Quel est ce mot ?',show:`<div class="qill">${renderIll(w.ill,w.cat)}</div>`,opts:shuffle([w,...others(w,pool,3)]).map(x=>({v:x.id,html:esc(fullName(x))})),ans:w.id,answerTxt:fullName(w),say:speakText(w)}),
  audio2word:(w,pool)=>canSpeak()?({type:'qcm',w,prompt:'Écoute. Quel mot entends-tu ?',show:`<div style="text-align:center;margin-bottom:0.75rem"><button type="button" class="btn go" data-act="say" data-t="${esc(speakText(w))}">🔊 Écouter encore</button></div>`,opts:shuffle([w,...others(w,pool,3)]).map(x=>({v:x.id,html:esc(fullName(x))})),ans:w.id,answerTxt:fullName(w),autoSay:speakText(w),say:speakText(w)}):null,
  word2img:(w,pool)=>({type:'qcm',w,imgOpts:true,prompt:'Quelle image va avec ce mot ?',show:`<p class="qbig">${esc(fullName(w))} ${sayBtn(speakText(w),true)}</p>`,opts:shuffle([w,...others(w,pool,3)]).map(x=>({v:x.id,html:renderIll(x.ill,x.cat)})),ans:w.id,answerTxt:fullName(w),say:speakText(w)}),
  vf:(w,pool)=>{ const truth=Math.random()<0.5; const x=truth?w:others(w,pool,1)[0]; return {type:'vf',w,stmt:stmtFor(x),ans:truth,answerTxt:stmtFor(w)}; },
  matchImg:(w,pool)=>{ const ids=[w,...others(w,pool,3)].map(x=>x.id); return {type:'match',mode:'img',w,left:shuffle(ids),right:shuffle(ids),sel:{},done:[],errs:0}; },
  matchDef:(w,pool)=>{ const ids=[w,...others(w,pool,3)].map(x=>x.id); return {type:'match',mode:'def',w,left:shuffle(ids),right:shuffle(ids),sel:{},done:[],errs:0}; },
  tiles:(w,pool)=>{ const cands=shuffle(phraseCands(w)); for(const c of cands){ const filt=x=>w.g?x.g===w.g:(w.cat==='verbe'?x.cat==='verbe':!x.g);
      let ds=others(w,pool,12,filt).map(x=>formLike(c.tok.text,w,x)).filter(Boolean);
      ds=[...new Set(ds.filter(d=>d.toLowerCase()!==c.tok.text.toLowerCase()))].slice(0,3);
      if(ds.length===3) return {type:'tiles',w,ph:c.ph,tok:c.tok,opts:shuffle([c.tok.text,...ds]),ans:c.tok.text,answerTxt:c.tok.text}; }
    return null; },
  order:(w)=>{ for(const ph of shuffle(w.ph)){ const t=plain(ph).split(/\s+/).filter(Boolean); if(t.length<3||t.length>10) continue;
      let sh=shuffle(t.map((_,i)=>i)); let k=0; while(sh.every((v,i)=>t[v]===t[i])&&k++<10) sh=shuffle(sh);
      return {type:'order',w,ph,target:t.join(' '),tiles:sh.map(i=>t[i]),built:[]}; } return null; },
  writeWord:(w)=>({type:'write',w,prompt:w.cat==='verbe'?'Écris ce verbe (à l’infinitif).':'Écris ce mot.',show:`<div class="qill">${renderIll(w.ill,w.cat)}</div>${w.art&&w.art!=='le signe'?`<p class="qbig" style="font-size:1.4rem">${esc(w.art)}${w.art.endsWith('’')?'':' '}<span class="gap">…</span></p>`:''}`,expect:[w.mot],hint:hintOf(w.mot),say:speakText(w)}),
  dictee:(w)=>canSpeak()?({type:'write',w,prompt:'Dictée : écoute et écris le mot.',show:`<div style="text-align:center;margin-bottom:0.625rem"><button type="button" class="btn go" data-act="say" data-t="${esc(speakText(w))}">🔊 Écouter</button></div>`,expect:[w.mot],hint:hintOf(w.mot),autoSay:speakText(w),say:speakText(w)}):null,
  writeGap:(w)=>{ const c=pick(phraseCands(w)); if(!c) return null; const help=w.cat==='verbe'?`<p class="small muted">Aide : le verbe <b>${esc(w.mot)}</b>${w.f&&w.f.je?` · ${esc(w.f.je)}`:''}</p>`:`<div class="qill" style="max-width:9.375rem">${renderIll(w.ill,w.cat)}</div>`;
    return {type:'write',w,prompt:'Écris le mot manquant.',show:`${help}<p class="sentence">${gapHTML(c.ph,c.tok)}</p>`,expect:[c.tok.text],hint:hintOf(c.tok.text),ph:c.ph,say:plain(c.ph)}; },
  sentence:(w)=>{ const c=phraseCands(w); if(!c.length) return null; const ph=pick(c).ph; const req=[w.id]; const o=tokens(ph).map(t=>t.id).filter(id=>id!==w.id&&W[id]); if(o.length) req.push(pick(o)); return {type:'sentence',w,req,model:ph}; }
};
function hintOf(s){ return s.split('').map((c,i)=>i===0?c:(/[\s\-’']/.test(c)?c:'_')).join(' '); }

function makeModItems(pool,lv){
  const types=lv===1?['img2word','word2img','vf','audio2word']:lv===2?['matchImg','tiles','order','matchDef']:['writeWord','writeGap','dictee'];
  const N=lv===2?7:8; let targets=[]; while(targets.length<N) targets=targets.concat(shuffle(pool)); targets=targets.slice(0,N);
  const off=rnd(0,types.length-1), items=[];
  targets.forEach((w,i)=>{ let q=null; for(let k=0;k<types.length&&!q;k++) q=GEN[types[(i+off+k)%types.length]](w,pool); items.push(q||GEN.img2word(w,pool)); });
  if(lv===3){ const c=pool.filter(x=>x.ph.length); for(const x of shuffle(c)){ const s=GEN.sentence(x,pool); if(s){ items.push(s); break; } } }
  return items;
}
function revisionPool(){
  let p=WORDS.filter(w=>{ const m=U.m[w.id]; return m&&m[1]>0&&m[1]>=m[0]; });
  if(p.length<6) p=p.concat(WORDS.filter(w=>U.seen[w.id]&&!p.includes(w)));
  if(p.length<6) p=p.concat(sample(N2.filter(w=>!p.includes(w)),6-p.length));
  return p;
}
function makeRevItems(){ const pool=sample(revisionPool(),12); const all=['img2word','word2img','vf','tiles','order','writeWord','writeGap','dictee','audio2word'];
  const items=pool.slice(0,7).map((w,i)=>{ let q=null; for(let k=0;k<all.length&&!q;k++) q=GEN[all[(i*2+k)%all.length]](w,pool); return q||GEN.img2word(w,pool); });
  makeRevMaths().forEach(it=>items.splice(rnd(1,items.length),0,it)); return items; }

/* ---------- Réponses ---------- */
function onOpt(btn){
  const q=Q.items[Q.i]; if(q.fin) return;
  if(q.type==='op') return opChoice(q,btn.dataset.v);
  const ok=btn.dataset.v===String(q.ans);
  document.querySelectorAll('#qzone [data-act="opt"]').forEach(b=>{ if(b.dataset.v===String(q.ans)) b.classList.add('is-ok'); else if(b===btn) b.classList.add('is-ko'); });
  if(q.type==='tiles'){ const g=document.querySelector('#gapS .gap'); if(g) g.textContent=q.ans; }
  if(ok) finish(q,true,'',q.type==='tiles'?`<span class="ans">${rich(q.ph,false)} ${sayBtn(plain(q.ph),true)}</span>`:(q.say?` ${sayBtn(q.say,true)}`:''));
  else finish(q,false,'La bonne réponse :',`<span class="ans">${esc(q.answerTxt)} ${q.say?sayBtn(q.say,true):''}</span>`);
}
function onVF(v){ const q=Q.items[Q.i]; if(q.fin) return; const ok=(v==='1')===q.ans;
  document.querySelectorAll('#qzone [data-act="vf"]').forEach(b=>{ if((b.dataset.v==='1')===q.ans) b.classList.add('is-ok'); else b.classList.add('is-ko'); });
  finish(q,ok,ok?'':'La bonne phrase :',q.ans?'':`<span class="ans">${esc(q.answerTxt)}</span>`); }
function onMatch(btn){
  const q=Q.items[Q.i]; if(q.fin) return; const id=btn.dataset.id, side=btn.dataset.side; if(q.done.includes(id)) return;
  q.sel[side]=q.sel[side]===id?null:id;
  document.querySelectorAll(`#qzone [data-act="mpick"][data-side="${side}"]`).forEach(b=>b.setAttribute('aria-pressed',b.dataset.id===q.sel[side]?'true':'false'));
  if(q.sel.w&&q.sel.r){
    const a=q.sel.w,b=q.sel.r; q.sel={};
    const els=[...document.querySelectorAll('#qzone [data-act="mpick"]')].filter(e=>(e.dataset.side==='w'&&e.dataset.id===a)||(e.dataset.side==='r'&&e.dataset.id===b));
    if(a===b){ q.done.push(a); els.forEach(e=>{ e.classList.add('done'); e.disabled=true; e.setAttribute('aria-pressed','false'); }); speak(speakText(W[a]));
      if(q.done.length===q.left.length) finish(q,q.errs<=1,q.errs===0?'Tout est juste du premier coup.':q.errs===1?'Une seule erreur.':'Terminé ! Refais-le pour faire moins d’erreurs.'); }
    else { q.errs++; if(q.errs>1) q.err=true; els.forEach(e=>{ e.classList.add('bad'); e.setAttribute('aria-pressed','false'); }); setTimeout(()=>els.forEach(e=>e.classList.remove('bad')),700); fb('mid','Ce n’est pas la bonne paire. Essaie encore.'); }
  }
}
function redrawOrder(q){ const z=document.querySelector('#qzone .qcard'); if(!z) return; const keep=document.getElementById('fb').outerHTML+document.getElementById('qnext').outerHTML; z.innerHTML=R.order.html(q)+keep; }
function onOrder(act,i){
  const q=Q.items[Q.i]; if(q.fin) return;
  if(act==='ord-add'&&!q.built.includes(+i)) q.built.push(+i);
  if(act==='ord-del') q.built.splice(+i,1);
  if(act==='ord-reset') q.built=[];
  if(act==='ord-check'){
    const got=q.built.map(k=>q.tiles[k]).join(' ');
    if(got===q.target) return finish(q,true,'',`<span class="ans">${rich(q.ph,false)} ${sayBtn(plain(q.ph),true)}</span>`);
    q.tries=(q.tries||0)+1; q.err=true;
    if(q.tries===1){ fb('mid','Pas encore. Le début de la phrase :',`<span class="ans">${esc(q.target.split(' ').slice(0,2).join(' '))} …</span>`); return; }
    return finish(q,false,'Voici la phrase :',`<span class="ans">${rich(q.ph,false)} ${sayBtn(plain(q.ph),true)}</span>`);
  }
  redrawOrder(q);
}
function onWrite(form){
  const q=Q.items[Q.i]; if(q.fin) return; const inp=form.querySelector('[name=a]'); let val=inp.value;
  if(q.type==='op') return opWrite(q,form);
  if(!val.trim()){ fb('mid','Écris ta réponse dans la case.'); return; }
  if(q.numeric) val=val.replace(/[\s  .]/g,'');
  const show=`<span class="ans">${esc(q.expect[0])} ${q.say?sayBtn(q.say,true):''}</span>`;
  const extra=q.explain?`<span class="ans small">${esc(q.explain)}</span>`:(q.ph?`<span class="ans">${rich(q.ph,false)}</span>`:'');
  const r=check(val,q.expect);
  if(q.copy){ if(r!=='ko'&&r!=='near') return finish(q,false,'Bien recopié ! Tu le sauras la prochaine fois.',show); fb('ko','Recopie exactement la réponse :',show); inp.value=''; return; }
  if(r==='ok') return finish(q,true,'',show+extra);
  if(r==='accent') return finish(q,true,'Regarde bien les accents :',show,true);
  if(r==='tiret') return finish(q,true,'Regarde bien les traits d’union et les espaces :',show,true);
  q.tries=(q.tries||0)+1; q.err=true;
  if(q.tries===1){ fb('mid',r==='near'?'Presque ! Une lettre n’est pas juste. Essaie encore.':'Pas encore. Essaie encore avec cette aide :',`<span class="ans hint">${esc(q.hint||'')}</span>`); inp.select(); return; }
  q.copy=true; fb('ko','Voici la bonne réponse. Recopie-la pour continuer :',show); inp.value=''; inp.placeholder='Recopie ici'; inp.focus();
}
function lexForms(id){ const w=W[id]; const f=new Set([w.mot]); if(w.cat==='verbe'){ const v=verbForms(w); [v.je,v.tu,v.vous].forEach(x=>x&&f.add(x)); if(w.mot.length>=6) f.add(w.mot.slice(0,-2)); }
  else { f.add(w.mot+'s'); f.add(w.mot+'x'); }
  WORDS.forEach(x=>x.ph.forEach(ph=>tokens(ph).forEach(t=>{ if(t.id===id) f.add(t.text); })));
  return [...f].map(s=>fold(s.toLowerCase())); }
function onSentence(form){
  const q=Q.items[Q.i]; if(q.fin) return; const val=form.querySelector('[name=a]').value.trim();
  const F=' '+fold(val.toLowerCase()).replace(/[’']/g,' ')+' ';
  const miss=q.req.filter(id=>!lexForms(id).some(x=>F.includes(x.replace(/[’']/g,' '))));
  document.querySelectorAll('#req .chip').forEach(c=>c.classList.toggle('got',!miss.includes(c.dataset.r)));
  if(val.split(/\s+/).length<3){ fb('mid','Écris une phrase plus longue (au moins 3 mots).'); return; }
  if(miss.length){ q.err=true; fb('mid','Il manque : '+miss.map(id=>W[id].mot).join(', ')+'.'); return; }
  U.phrases.unshift({id:q.w.id,t:val.slice(0,300),d:today()}); U.phrases=U.phrases.slice(0,200); saveU();
  finish(q,true,'Ta phrase est gardée dans ton carnet. Compare avec ce modèle :',`<span class="ans">${rich(q.model,false)} ${sayBtn(plain(q.model),true)}</span>`);
}
function onModel(){ const q=Q.items[Q.i]; if(q.fin) return; q.err=true; finish(q,false,'Voici un modèle. Recopie-le dans ton cahier :',`<span class="ans">${rich(q.model,false)} ${sayBtn(plain(q.model),true)}</span>`); }


/* =====================================================================
   PROBLÈMES À ÉTAPES — un énoncé, puis une ou plusieurs questions.
   Sert pour « Je comprends l’énoncé », « Je calcule » et « Comme au brevet ».
   ===================================================================== */
const GEN2MOD={}; MODS.forEach(m=>(m.calc||[]).forEach(g=>{ GEN2MOD[g]=m.id; }));
function tabHTML(t){ return `<div class="scroll-x"><table class="tbl ptab">${t.map((r,i)=>`<tr>${r.map((c,j)=>i===0||j===0?`<th scope="${i===0?'col':'row'}">${rich(c)}</th>`:`<td>${rich(c)}</td>`).join('')}</tr>`).join('')}</table></div>`; }
function figHTML(f,cat){ if(!f) return ''; const svg=/^<svg/.test(f)?f:renderIll(f,cat); return `<div class="pfig${/viewBox="0 0 (2[2-9]\d|250)/.test(svg)||/viewBox="0 0 200 (1[6-9]\d|2\d\d)"/.test(svg)?' tall':''}">${svg}</div>`; }
function ctxHTML(it){ const cat=itemCat(it);
  if(!it.ctx.length&&!it.fig&&!it.tab) return '';
  return `<div class="pctx">${it.titre?`<p class="ptitle">${esc(it.titre)}</p>`:''}${it.ctx.map(c=>`<p class="pline"><span>${rich(c)}</span>${sayBtn(c,true)}</p>`).join('')}${it.tab?tabHTML(it.tab):''}${figHTML(it.fig,cat)}</div>`; }
function qTitle(q,k,n){ return `${n>1?`<span class="qnum">${k+1}</span>`:''}<span>${rich(q.q)}</span>${sayBtn(q.q,true)}`; }
function inputHTML(q){
  if(q.type==='num') return `<form class="wform pform" data-form="p" autocomplete="off"><div class="row"><input class="inp" name="a" inputmode="decimal" aria-label="Ta réponse" placeholder="Ta réponse" style="max-width:14rem">${q.unit?`<span class="unit">${esc(q.unit)}</span>`:''}<button class="btn" type="submit">Valider</button></div>${kbd(['−',','])}</form>`;
  if(q.type==='frac') return `<form class="wform pform" data-form="p" autocomplete="off"><div class="row"><span class="fracin"><input class="inp" name="n" inputmode="numeric" aria-label="Numérateur" placeholder="?"><i></i><input class="inp" name="d" inputmode="numeric" aria-label="Dénominateur" placeholder="?"></span><button class="btn" type="submit">Valider</button></div><div class="kbd kbd-m"><button type="button" data-act="accent" data-ch="−" aria-label="Ajouter −">−</button></div></form>`;
  if(q.type==='expr') return `<form class="wform pform" data-form="p" autocomplete="off"><div class="row"><input class="inp" name="a" aria-label="Ta réponse" placeholder="Exemple : 3x + 2" autocapitalize="off" autocorrect="off" spellcheck="false" style="max-width:20rem"><button class="btn" type="submit">Valider</button></div>${kbd(true)}</form>`;
  if(q.type==='qcm') return `<div class="opts popts">${q.o.map((o,i)=>`<button type="button" class="opt" data-act="popt" data-v="${i}">${rich(o)}</button>`).join('')}</div>`;
  if(q.type==='vf') return `<div class="opts"><button type="button" class="opt" data-act="popt" data-v="1">✓ Vrai</button><button type="button" class="opt" data-act="popt" data-v="0">✗ Faux</button></div>`;
  if(q.type==='pick') return `<div class="psent">${q.s.map((t,i)=>`<button type="button" class="ps" data-act="ppick" data-v="${i}">${rich(t)}</button>`).join('')}</div>`;
  if(q.type==='pickn') return `<p class="ptoks">${q.toks.map((t,i)=>t.n?`<button type="button" class="ptk" data-act="ptok" data-i="${i}" aria-pressed="${q.sel.includes(i)}">${rich(t.t)}</button>`:`<span>${rich(t.t)}</span>`).join('')}</p><div class="qnext" style="justify-content:flex-start"><button type="button" class="btn" data-act="pickok">Valider</button></div>`;
  if(q.type==='ordre') return `<div class="ordline" id="pordline">${q.built.map((t,i)=>`<button type="button" class="tile" data-act="pord-del" data-i="${i}">${esc(q.tiles[t])}</button>`).join('')}</div><div class="tiles">${q.tiles.map((t,i)=>`<button type="button" class="tile${q.built.includes(i)?' used':''}" data-act="pord-add" data-i="${i}">${esc(t)}</button>`).join('')}</div><div class="qnext" style="justify-content:flex-start"><button type="button" class="btn alt sm" data-act="pord-reset">Effacer</button><button type="button" class="btn sm" data-act="pord-ok">Vérifier</button></div>`;
  return ''; }
function solHTML(q,showAns){ return `<div class="psol">${showAns?`<p class="pans">Réponse : <b>${rich(answerShow(q))}</b></p>`:''}${q.corr&&q.corr.length?`<div class="pcorr"><span class="lbl">📝 Correction</span>${q.corr.map(l=>`<div>${rich(l)}</div>`).join('')}</div>`:''}${q.rep?`<div class="prep"><span class="lbl">✍️ Je rédige</span><p><span>${rich(q.rep)}</span>${sayBtn(q.rep,true)}</p></div>`:''}</div>`; }
function probQHTML(it,k){ const q=it.qs[k], n=it.qs.length, st=q.st||{};
  if(st.done) return `<div class="pq done ${st.good?'good':st.ok?'okk':'bad'}"><p class="pqt">${qTitle(q,k,n)}</p>${q.type==='ordre'?'':`<p class="pres">${st.good?'✅':st.ok?'🟡':'❌'} ${rich(answerShow(q))}</p>`}${solHTML(q,false)}</div>`;
  const aides=(q.aide||[]).slice(0,st.help||0);
  return `<div class="pq cur" id="pqcur"><p class="pqt">${qTitle(q,k,n)}</p>${inputHTML(q)}
   ${aides.length?`<div class="paide">${aides.map(a=>`<p>💡 ${rich(a)}</p>`).join('')}</div>`:''}
   <div class="row ptools">${(q.aide||[]).length>(st.help||0)?`<button type="button" class="btn sm alt" data-act="paide">💡 Aide${(q.aide||[]).length>1?` (${(st.help||0)+1}/${q.aide.length})`:''}</button>`:''}${it.mod&&MOD[it.mod]&&(MOD[it.mod].methodes||[]).length&&!it.noMeth?`<button type="button" class="btn sm alt" data-act="pmeth">📖 Méthode</button>`:''}</div><div id="pmethbox"></div></div>`; }
R.prob={ html:it=>{ it.k=it.k||0; let h=ctxHTML(it); if(it.lead) h=qp(it.lead)+h; for(let k=0;k<=Math.min(it.k,it.qs.length-1);k++) h+=probQHTML(it,k); return `<div class="prob">${h}</div>`; } };
function probRedraw(scroll){ const it=Q.items[Q.i]; const z=document.querySelector('#qzone .qcard'); if(!z) return; const fbH=document.getElementById('fb').outerHTML, nx=document.getElementById('qnext').outerHTML;
  z.innerHTML=R.prob.html(it)+fbH+nx; const cur=document.getElementById('pqcur'); if(cur&&scroll!==false){ try{ cur.scrollIntoView({block:'nearest',behavior:'smooth'}); }catch(e){} const i=cur.querySelector('input.inp'); if(i) try{ i.focus({preventScroll:true}); }catch(e){} } }
function probRec(it,good){ if(it.gen){ const m=U.mx[it.gen]||[0,0]; m[good?0:1]++; U.mx[it.gen]=m; if(!good) Q.gmiss.push(it.gen); }
  if(it.wid) rec(it.wid,good); saveU(); }
/* fin d’une question du problème */
function probDone(it,q,res){ const st=q.st=q.st||{}; st.done=true; st.good=res==='good'; st.ok=res!=='bad';
  Q.tot++; if(st.good) Q.ok++; probRec(it,st.good);
  const ev=commentEvent(st.good,st.ok,res==='mid'); const c=S.comment?Comm.take(q.type==='ordre'&&st.ok?'redige':ev):''; commentSay(c);
  const last=it.k>=it.qs.length-1;
  if(last){ it.fin=true; if(it.bid){ const sc=it.qs.filter(x=>x.st&&x.st.good).length; U.bp[it.bid]=Math.max(U.bp[it.bid]||0,Math.round(100*sc/it.qs.length)); saveU(); } }
  probRedraw(false);
  fb(st.good?'ok':st.ok?'mid':'ko',res==='bad'?'Regarde bien la correction.':'',`${res==='bad'&&q.type!=='ordre'?`<span class="ans">${rich(answerShow(q))}</span>`:''}`,c);
  const n=document.getElementById('qnext'); if(n){ n.innerHTML=last?`<button type="button" class="btn go" data-act="qnext">${Q.i===Q.items.length-1?'Voir mon résultat →':'Continuer →'}</button>`:`<button type="button" class="btn go" data-act="pnext">Question suivante →</button>`; const b=n.querySelector('button'); try{ b.focus({preventScroll:true}); }catch(e){} }
}
function probAnswer(raw){
  const it=Q.items[Q.i]; if(!it||it.type!=='prob'||it.fin) return; const q=it.qs[it.k]; const st=q.st=q.st||{}; if(st.done) return;
  const r=checkAnswer(q,raw);
  if(r.bad){ fb('mid',r.msg||'Écris ta réponse dans la case.'); return; }
  if(r.r==='ok') return probDone(it,q,st.tries||st.help?'mid':'good');
  if(r.r==='mid'&&!(q.type==='frac'||q.type==='expr')) return probDone(it,q,'mid');
  if(r.r==='mid'){ fb('mid',r.msg); st.near=true; return; }
  st.tries=(st.tries||0)+1;
  if(st.tries===1){ if((q.aide||[]).length>(st.help||0)) st.help=(st.help||0)+1; probRedraw(); fb('mid',r.msg||(q.type==='qcm'||q.type==='vf'?'Ce n’est pas la bonne réponse. Lis l’aide, puis essaie encore.':'Pas encore. Lis l’aide, puis essaie encore.')); return; }
  probDone(it,q,'bad'); }
function onPopt(btn){ const it=Q.items[Q.i]; const q=it.qs[it.k]; if(q.st&&q.st.done) return;
  if(q.type==='vf'||q.type==='qcm'){ const okv=q.type==='vf'?(q.a?'1':'0'):String(q.a); if(btn.dataset.v===okv) btn.classList.add('is-ok'); else { btn.classList.add('is-ko'); btn.disabled=true; } }
  probAnswer(btn.dataset.v); }
function onPform(form){ const it=Q.items[Q.i]; const q=it.qs[it.k]; const E=form.elements;
  if(q.type==='frac'){ const n=E.namedItem('n').value.trim(), d=E.namedItem('d').value.trim(); if(!n){ fb('mid','Écris le numérateur.'); return; } const f=parseFrac(d?`${n}/${d}`:n); probAnswer(f||(d?`${n}/${d}`:n)); return; }
  const v=E.namedItem('a').value; if(!v.trim()){ fb('mid','Écris ta réponse dans la case.'); return; } probAnswer(v); }
function onPpick(btn){ const it=Q.items[Q.i]; const q=it.qs[it.k]; if(q.st&&q.st.done) return; const ok=+btn.dataset.v===q.a;
  btn.classList.add(ok?'is-ok':'is-ko'); if(!ok) btn.disabled=true; probAnswer(ok?'1':'0'); }
function onPtok(btn){ const it=Q.items[Q.i]; const q=it.qs[it.k]; if(q.st&&q.st.done) return; const i=+btn.dataset.i; const j=q.sel.indexOf(i); if(j>=0) q.sel.splice(j,1); else q.sel.push(i); btn.setAttribute('aria-pressed',q.sel.includes(i)); }
function onPickOk(){ const it=Q.items[Q.i]; const q=it.qs[it.k]; if(q.st&&q.st.done) return; if(!q.sel.length){ fb('mid','Touche d’abord les nombres utiles.'); return; }
  const chosen=q.sel.map(i=>normTok(q.toks[i].t)).sort(), want=q.want.slice().sort(); const ok=chosen.length===want.length&&chosen.every((v,i)=>v===want[i]);
  if(!ok){ q.sel=[]; } probAnswer(ok?'1':'0'); if(!ok&&!(q.st&&q.st.done)){ const box=document.querySelector('#pqcur .ptoks'); if(box) box.querySelectorAll('.ptk').forEach(b=>b.setAttribute('aria-pressed','false')); } }
function onPord(act,i){ const it=Q.items[Q.i]; const q=it.qs[it.k]; if(q.st&&q.st.done) return;
  if(act==='pord-add'&&!q.built.includes(+i)) q.built.push(+i); if(act==='pord-del') q.built.splice(+i,1); if(act==='pord-reset') q.built=[];
  if(act==='pord-ok'){ const got=q.built.map(k=>q.tiles[k]).join(' '); if(q.built.length<q.tiles.length){ fb('mid','Utilise tous les mots.'); return; } if(got!==q.target) q.built=[]; probAnswer(got===q.target?'1':'0'); return; }
  const cur=document.getElementById('pqcur'); if(cur){ const tmp=document.createElement('div'); tmp.innerHTML=probQHTML(it,it.k); cur.replaceWith(tmp.firstElementChild); } }
function onPaide(){ const it=Q.items[Q.i]; const q=it.qs[it.k]; const st=q.st=q.st||{}; st.help=Math.min((q.aide||[]).length,(st.help||0)+1); probRedraw(); }
function onPmeth(){ const it=Q.items[Q.i]; const m=MOD[it.mod]; const box=document.getElementById('pmethbox'); if(!box||!m) return; if(box.innerHTML){ box.innerHTML=''; return; }
  const me=pickMethod(m,it.gen); box.innerHTML=`<div class="card pmeth"><b>📖 ${esc(me.titre)}</b><ol>${me.etapes.map(e=>`<li>${rich(e)}</li>`).join('')}</ol></div>`; }
function pickMethod(m,gen){ const i=(m.calc||[]).indexOf(gen); const ms=m.methodes||[]; if(!ms.length) return {titre:'',etapes:[]}; return ms[Math.max(0,Math.min(ms.length-1,Math.floor(i*ms.length/Math.max(1,(m.calc||[]).length))))]; }
function onPnext(){ const it=Q.items[Q.i]; it.k++; probRedraw(); fb('', ''); const f=document.getElementById('fb'); if(f){ f.className='fb'; f.innerHTML=''; } document.getElementById('qnext').innerHTML=''; }
/* ---------- Construction des items ---------- */
function normTok(t){ return String(t).replace(/[{}]/g,'').replace(/[  \s]/g,'').replace(/−/g,'-'); }
function tokenizeData(txt){ const re=/\{\{[^}]+\}\}|−?\d+(?:[\u202f\u00a0 ]\d{3})*(?:,\d+(?:[\u202f\u00a0 ]\d{3})*)?/g; const out=[]; let last=0,m; while((m=re.exec(txt))){ if(m.index>last) out.push({t:txt.slice(last,m.index)}); out.push({t:m[0],n:true}); last=re.lastIndex; } if(last<txt.length) out.push({t:txt.slice(last)}); return out; }
function orderTiles(phrase){ const t=plain(phrase).replace(/[  ]/g,' ').split(/\s+/).filter(Boolean); let sh=shuffle(t.map((_,i)=>i)); let k=0; while(sh.every((v,i)=>t[v]===t[i])&&k++<10) sh=shuffle(sh); return {target:t.join(' '),tiles:sh.map(i=>t[i]),built:[]}; }
function compItem(m,c){ const base={type:'prob',mod:m.id,ctx:[],qs:[],noMeth:true};
  if(c.t==='qcm') return Object.assign(base,{ctx:[c.txt],qs:[{q:c.q,type:'qcm',o:c.o,a:c.a,corr:[c.exp]}]});
  if(c.t==='vf') return Object.assign(base,{ctx:[c.txt],qs:[{q:c.q,type:'vf',a:c.a,corr:[c.exp]}]});
  if(c.t==='question') return Object.assign(base,{qs:[{q:c.q,type:'pick',s:c.txt,a:c.a,corr:[c.exp]}]});
  if(c.t==='donnees') return Object.assign(base,{qs:[{q:c.q,type:'pickn',toks:tokenizeData(c.txt),sel:[],want:c.a.map(normTok),corr:[c.exp]}]});
  if(c.t==='ordre') return Object.assign(base,{qs:[Object.assign({q:c.q,type:'ordre',rep:c.phrase},orderTiles(c.phrase))]});
  return null; }
/* « Que veut dire ce mot ? » : le mot dans une phrase, trois définitions */
function defItem(w,pool){ const c=pick(phraseCands(w)); if(!c) return null; const oth=others(w,pool,2).filter(x=>x.def); if(oth.length<2) return null;
  const o=[w,...oth].map(x=>maskIn(plain(x.def),x)); const sh=shuffle(o.map((t,i)=>({t,i})));
  return {type:'prob',wid:w.id,mod:w.mod,noMeth:true,ctx:[],lead:'Que veut dire ce mot dans la phrase ?',qs:[{q:plain(c.ph).replace(c.tok.text,'**'+c.tok.text+'**'),type:'qcm',o:sh.map(x=>x.t),a:sh.findIndex(x=>x.i===0),corr:[`${fullName(w)} : ${plain(w.def)}`],rep:plain(c.ph)}]}; }
function makeCompItems(m){ const items=(m.comprendre||[]).map(c=>compItem(m,c)).filter(Boolean); const ws=m.mots.map(id=>W[id]);
  sample(ws,3).forEach(w=>{ const d=defItem(w,ws); if(d) items.push(d); }); return shuffle(items).slice(0,10); }
function makeCalcItems(m){ const g=m.calc||[]; const order=shuffle(g); const items=[]; for(let i=0;i<8;i++){ const d=i<3?1:i<6?2:3; const it=makeCalc(order[i%order.length],d); if(it){ it.mod=m.id; items.push(it); } } return items; }
function brevetItem(m,p){ const qs=p.qs.map(q=>Object.assign({},q,{st:null})); const last=[...qs].reverse().find(q=>q.rep&&plain(q.rep).split(/\s+/).length>=4&&plain(q.rep).split(/\s+/).length<=14&&!/\{\{/.test(q.rep));
  if(last) qs.push(Object.assign({q:'✍️ **Je rédige** la phrase-réponse : remets les mots dans l’ordre.',type:'ordre',rep:last.rep},orderTiles(last.rep)));
  return {type:'prob',brevet:true,bid:p.id,mod:m.id,titre:p.titre,ctx:p.ctx||[],fig:p.fig||null,tab:p.tab||null,qs}; }
function makeBrevetItems(m){ return (m.brevet||[]).map(p=>brevetItem(m,p)); }
function makeBrevetBlanc(){ const ch=MODS.filter(m=>U.cs[m.id]); const src=ch.length>=2?ch:MODS; const ps=shuffle(src.flatMap(m=>(m.brevet||[]).map(p=>[m,p]))).slice(0,4); return ps.map(([m,p])=>brevetItem(m,p)); }
function makeRevMaths(){ const bad=Object.keys(U.mx).filter(g=>GEN2MOD[g]&&U.mx[g][1]>=U.mx[g][0]); return shuffle(bad).slice(0,3).map(g=>{ const it=makeCalc(g,2); if(it) it.mod=GEN2MOD[g]; return it; }).filter(Boolean); }
