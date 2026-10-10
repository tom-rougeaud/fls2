
/* =====================================================================
   STUDIO DU PROFESSEUR — enregistrer sa voix pour chaque mot, chaque
   phrase, chaque façon de dire, chaque commentaire. Plusieurs prises
   possibles par texte : l’appli les fait tourner pour varier.
   ===================================================================== */
const STG=[['mots','🔤 Mots'],['phrases','💬 Phrases'],['dire','🔁 Façons de dire'],['cours','📖 Cours'],['methodes','🪜 Méthodes'],['enonces','📄 Énoncés'],['commentaires','📣 Commentaires'],['consignes','📋 Consignes'],['orphelins','🗂️ À rattacher']];
/* Prises dont le texte n’existe plus dans l’appli (texte modifié) : jamais
   supprimées, listées ici pour être réécoutées et rattachées au bon texte. */
function orphanClips(){ const keys=new Set(studioItems().map(i=>i.k)); return (Bank.rows||[]).filter(c=>!keys.has(c.cle)); }
function bigrams(s){ s=' '+fold(String(s).toLowerCase()).replace(/[^a-z0-9 ]/g,'')+' '; const b=[]; for(let i=0;i<s.length-1;i++) b.push(s.slice(i,i+2)); return b; }
function simil(a,b){ const A=bigrams(a),B=bigrams(b); const m=new Map(); B.forEach(x=>m.set(x,(m.get(x)||0)+1)); let n=0; A.forEach(x=>{ const c=m.get(x); if(c){ n++; m.set(x,c-1); } }); return 2*n/Math.max(1,A.length+B.length); }
function orphanHTML(){
  const os=orphanClips();
  const intro=`<div class="card"><p style="margin:0">Ici, les prises dont le texte a changé dans l’appli. <b>Rien n’est supprimé.</b> Écoute chaque prise : si le son correspond toujours au nouveau texte, rattache-la ; sinon, enregistre le nouveau texte et supprime l’ancienne prise quand tu veux.</p></div>`;
  if(!os.length) return intro+`<div class="card"><p class="muted" style="margin:0">✅ Aucune prise à rattacher : chaque enregistrement correspond à un texte de l’appli.</p></div>`;
  const items=studioItems();
  return intro+os.map(c=>{ const sug=items.map(it=>({it,s:simil(c.texte,it.t)})).sort((a,b)=>b.s-a.s).slice(0,8);
    return `<div class="card orph"><div class="row" style="justify-content:space-between;align-items:center"><b>« ${esc(c.texte)} »</b><span class="row"><button type="button" class="btn sm alt" data-act="st-take-play" data-id="${esc(c.id)}">▶ Écouter</button><button type="button" class="btn sm alt" data-act="st-take-del" data-id="${esc(c.id)}">Supprimer</button></span></div>
      <div class="row" style="margin-top:.5rem"><label class="small" for="or-${esc(c.id)}">Rattacher à :</label><select class="inp" id="or-${esc(c.id)}" style="max-width:28rem">${sug.map(x=>`<option value="${esc(x.it.k)}">${esc(x.it.t)}</option>`).join('')}</select><button type="button" class="btn sm" data-act="st-attach" data-id="${esc(c.id)}">Rattacher</button></div></div>`; }).join('');
}
async function attachClip(id){
  const sel=document.getElementById('or-'+id); if(!sel) return; const it=studioItems().find(i=>i.k===sel.value); const c=(Bank.rows||[]).find(x=>x.id===id); if(!it||!c) return;
  try{ await DB.updClip(id,{cle:it.k,texte:it.t}); c.cle=it.k; c.texte=it.t; Bank.clips=bankIndex(Bank.rows); bankSave(); render(); }
  catch(e){ alert('Impossible de rattacher : '+(e.message||e)); }
}
function backupClips(){
  const rows=(Bank.rows||[]).map(c=>({id:c.id,texte:c.texte,cle:c.cle,actif:c.actif,duree:c.duree,date:c.created_at,fichier:clipUrl(c)}));
  const blob=new Blob([JSON.stringify({app:'maths-allophones-niveau-2',export:new Date().toISOString(),prises:rows,phrases:Bank.textes},null,1)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='sauvegarde-voix-niveau2-'+new Date().toISOString().slice(0,10)+'.json'; document.body.appendChild(a); a.click(); a.remove();
}

let ST={grp:'mots',mod:'all',filtre:'todo',q:'',cur:null,auto:true,ev:'juste'};
const Rec={state:'idle',stream:null,mr:null,chunks:[],ctx:null,an:null,raf:0,pcm:null,rate:48000,a:0,b:0,replace:null,timer:0};

function commentPool(ev){
  const hidden=new Set(Bank.textes.filter(t=>t.evenement===ev&&!t.actif).map(t=>vkey(t.texte)));
  const base=(DATA.commentaires[ev]||[]).filter(t=>!hidden.has(vkey(t)));
  const extra=Bank.textes.filter(t=>t.evenement===ev&&t.actif).map(t=>t.texte);
  const all=base.concat(extra); return all.length?all:(DATA.commentaires[ev]||[]);
}
function studioItems(){
  if(studioItems.cache&&studioItems.cacheT===Bank.textes) return studioItems.cache;
  const out=[], seenK=new Set(); const add=(t,hint,grp,sub,extra)=>{ if(!t) return; t=plain(t); const k=vkey(t); if(!k||seenK.has(grp+k)) return; seenK.add(grp+k); out.push(Object.assign({t,k,hint:hint?plain(hint):t,grp,sub},extra||{})); };
  MODS.forEach(m=>{ m.mots.forEach(id=>{ const w=W[id];
      add(speakText(w),fullName(w)+(w.sym?` (${w.sym})`:''),'mots',m.id);
      w.ph.forEach(p=>add(p,p,'phrases',m.id)); (w.dire||[]).forEach(p=>add(p,p,'dire',m.id)); });
    add(m.titre,'Titre : '+m.titre,'cours',m.id); add(m.intro,m.intro,'cours',m.id); (m.objectifs||[]).forEach(o=>add(o,o,'cours',m.id));
    (m.cours||[]).forEach(c=>{ add(c.titre,'Titre : '+c.titre,'cours',m.id); (c.txt||[]).forEach(t=>add(t,t,'cours',m.id)); (c.ex||[]).forEach(t=>add(t,t,'cours',m.id)); if(c.note) add(c.note,c.note,'cours',m.id); });
    (m.methodes||[]).forEach(me=>{ add(me.titre,'Méthode : '+me.titre,'methodes',m.id); me.etapes.forEach(e=>add(e,e,'methodes',m.id)); if(me.exemple){ add(me.exemple.enonce,me.exemple.enonce,'methodes',m.id); me.exemple.etapes.forEach(e=>add(e.t,e.t,'methodes',m.id)); add(me.exemple.reponse,me.exemple.reponse,'methodes',m.id); } });
    (m.comprendre||[]).forEach(c=>{ [].concat(c.txt||[]).forEach(t=>add(t,t,'enonces',m.id)); add(c.q,c.q,'enonces',m.id); if(c.phrase) add(c.phrase,c.phrase,'enonces',m.id); });
    (m.brevet||[]).forEach(b=>{ add(b.titre,'Problème : '+b.titre,'enonces',m.id); (b.ctx||[]).forEach(t=>add(t,t,'enonces',m.id)); b.qs.forEach(q=>{ add(q.q,q.q,'enonces',m.id); add(q.rep,q.rep,'enonces',m.id); }); }); });
  Object.keys(DATA.commentaires).forEach(ev=>{ const hidden=new Set(Bank.textes.filter(t=>t.evenement===ev&&!t.actif).map(t=>vkey(t.texte)));
    (DATA.commentaires[ev]||[]).forEach(t=>add(t,t,'commentaires',ev,{builtin:true,masque:hidden.has(vkey(t))}));
    Bank.textes.filter(t=>t.evenement===ev&&t.actif).forEach(t=>add(t.texte,t.texte,'commentaires',ev,{custom:t})); });
  PROMPTS.forEach(t=>add(t,t,'consignes','all'));
  studioItems.cache=out; studioItems.cacheT=Bank.textes; return out;
}
function nOwn(k){ return (Bank.clips[k]||[]).length; }
function nN1(k){ return (Bank.shared[k]||[]).length; }
function isDone(k){ return nOwn(k)>0||nN1(k)>0; }
function stFiltered(){ const q=fold(ST.q.toLowerCase());
  return studioItems().filter(it=>it.grp===ST.grp&&(ST.mod==='all'||it.sub===ST.mod)&&(!q||fold(it.hint.toLowerCase()).includes(q)||fold(it.t.toLowerCase()).includes(q))&&(ST.filtre==='all'||(ST.filtre==='todo'?!isDone(it.k):isDone(it.k)))); }
function allTakes(k){ return (Bank.rows||[]).filter(c=>c.cle===k); }

function viewStudio(){
  if(!DB.ok()) return `<div class="stack prose"><h1>🎙️ Studio du professeur</h1><div class="note">La base de données n’est pas encore reliée. Dans <code>index.html</code>, remplis le bloc <code>id="fls-config"</code> avec l’adresse et la clé publique de ton projet Supabase, puis lance le script de la notice.</div></div>`;
  if(!DB.isProf()) return `<div class="stack" style="max-width:32rem"><h1>🎙️ Studio du professeur</h1><p class="lede">Connecte-toi pour enregistrer ta voix. Les élèves n’ont pas besoin de compte : ils entendent tes enregistrements automatiquement.</p>
    <form class="card stack" data-form="login" autocomplete="on"><label class="lbl" for="lgE">Adresse e-mail</label><input class="inp" id="lgE" name="e" type="email" autocomplete="username" required>
    <label class="lbl" for="lgP">Mot de passe</label><input class="inp" id="lgP" name="p" type="password" autocomplete="current-password" required>
    <button class="btn" type="submit">Se connecter</button><p class="small muted" id="lgMsg" role="status"></p></form></div>`;
  const items=studioItems(); const total=items.length, done=items.filter(it=>isDone(it.k)).length, n1=items.filter(it=>!nOwn(it.k)&&nN1(it.k)).length;
  const grpCount=g=>{ if(g==='orphelins') return String(orphanClips().length); const a=items.filter(i=>i.grp===g); return `${a.filter(i=>isDone(i.k)).length}/${a.length}`; };
  const subs=ST.grp==='commentaires'?Object.keys(DATA.evenements).map(e=>[e,DATA.evenements[e]]):['mots','phrases','dire','cours','methodes','enonces'].includes(ST.grp)?MODS.map(m=>[m.id,`${m.num}. ${m.titre}`]):[];
  return `<div class="stack"><div class="row" style="justify-content:space-between"><h1 style="margin:0">🎙️ Studio du professeur</h1><span class="row"><span class="chip plain">${esc(DB.sess.email||'')}</span><button type="button" class="btn sm alt" data-act="st-backup" title="Télécharger la liste de toutes les prises (sauvegarde)">⬇️ Sauvegarde</button><button type="button" class="btn sm alt" data-act="logout">Se déconnecter</button></span></div>
  <div class="card"><div class="row" style="justify-content:space-between"><b>${done} / ${total} textes avec ta voix</b><span class="small muted">${(Bank.rows||[]).length} prises au niveau 2 · ${n1} texte${n1>1?'s':''} déjà enregistré${n1>1?'s':''} au niveau 1</span></div>${DB.ready===false?`<div class="note" style="margin-top:.6rem">⚠️ Les tables du niveau 2 n’existent pas encore dans Supabase. Lance le script SQL de la notice, puis recharge la page. En attendant, tu ne peux pas enregistrer.</div>`:''}<div class="pbar" style="margin-top:.5rem"><i style="width:${Math.round(100*done/Math.max(1,total))}%"></i></div>
   <p class="small muted" style="margin:.6rem 0 0">Raccourcis : <kbd>Espace</kbd> enregistrer / arrêter · <kbd>Entrée</kbd> garder · <kbd>R</kbd> recommencer · <kbd>→</kbd> texte suivant. Enregistre 2 ou 3 prises d’un même texte : l’appli les alterne.</p></div>
  <div class="row studio-tabs" role="tablist">${STG.map(([g,l])=>`<button type="button" class="ob" data-act="st-grp" data-g="${g}" aria-pressed="${ST.grp===g}">${l} <span class="small">${grpCount(g)}</span></button>`).join('')}</div>
  <div class="row">${subs.length?`<select class="inp" id="stMod" style="max-width:20rem"><option value="all">Toutes les leçons</option>${subs.map(([id,t])=>`<option value="${id}" ${ST.mod===id?'selected':''}>${esc(t)}</option>`).join('')}</select>`:''}
   <div class="toggle" role="group" aria-label="Filtre">${[['todo','À enregistrer'],['done','Enregistrés'],['all','Tout']].map(([f,l])=>`<button type="button" data-act="st-filtre" data-f="${f}" aria-pressed="${ST.filtre===f}">${l}</button>`).join('')}</div>
   <input class="inp" id="stQ" type="search" placeholder="Chercher un texte" value="${esc(ST.q)}" style="max-width:16rem"></div>
  ${ST.grp==='orphelins'?orphanHTML()+'</div>':`${ST.grp==='commentaires'?commentEditor():''}
  <div class="studio"><div class="st-list" id="stList">${stListHTML()}</div><div class="st-rec" id="stRec">${stRecHTML()}</div></div></div>`}`;
}
function stListHTML(){ const its=stFiltered();
  if(!its.length) return `<p class="muted">${ST.filtre==='todo'?'Tout est enregistré dans cette partie. Bravo !':'Aucun texte.'}</p>`;
  return its.slice(0,500).map(it=>{ const n=nOwn(it.k), m1=nN1(it.k); return `<button type="button" class="st-item${ST.cur&&ST.cur.k===it.k&&ST.cur.grp===it.grp?' on':''}${it.masque?' masque':''}" data-act="st-pick" data-k="${esc(it.k)}" data-g="${it.grp}"><span>${esc(it.hint)}</span><span class="st-n ${n||m1?'ok':''}">${n?'🎙️ '+n:m1?'niv. 1':'—'}</span></button>`; }).join(''); }
function stCurrent(){ if(ST.cur){ const it=studioItems().find(i=>i.k===ST.cur.k&&i.grp===ST.cur.grp); if(it) return it; } const f=stFiltered(); ST.cur=f[0]?{k:f[0].k,grp:f[0].grp}:null; return f[0]||null; }
function stRecHTML(){
  const it=stCurrent(); if(!it) return `<div class="card"><p class="muted">Choisis un texte dans la liste.</p></div>`;
  const takes=allTakes(it.k); const reading=ttsPrep(it.t).replace(/\s+/g,' ').trim(); const sh=Bank.shared[it.k]||[];
  let panel='';
  if(Rec.state==='rec') panel=`<div class="meter"><i id="stMeter"></i></div><p class="rec-dot">● Enregistrement… <span id="stTime">0,0 s</span></p><button type="button" class="btn go" data-act="st-stop">⏹ Arrêter (Espace)</button>`;
  else if(Rec.state==='review') panel=`<canvas id="stWave" width="640" height="120" class="wave" aria-label="Forme du son"></canvas>
    <div class="trim"><label>Début <input type="range" id="stA" min="0" max="1000" value="${Math.round(1000*Rec.a)}"></label><label>Fin <input type="range" id="stB" min="0" max="1000" value="${Math.round(1000*Rec.b)}"></label></div>
    <p class="small muted">Durée gardée : <b id="stDur">${fmtDur((Rec.b-Rec.a)*Rec.pcm.length/Rec.rate)}</b>. Les silences du début et de la fin sont déjà coupés.</p>
    <div class="row"><button type="button" class="btn alt" data-act="st-play">▶ Écouter</button><button type="button" class="btn okb" data-act="st-keep">✅ ${Rec.replace?'Remplacer':'Garder'} (Entrée)</button><button type="button" class="btn alt" data-act="st-redo">🔁 Recommencer (R)</button></div>`;
  else if(Rec.state==='busy') panel=`<p class="muted">⏳ Envoi en cours…</p>`;
  else panel=`<button type="button" class="btn go big-rec" data-act="st-rec">🎙️ Enregistrer (Espace)</button>`;
  return `<div class="card stack"><span class="lbl">${esc((STG.find(g=>g[0]===it.grp)||['',''])[1])}${it.builtin?' · commentaire fourni':''}${it.custom?' · ta phrase':''}</span>
   <p class="st-text">${esc(it.hint)}</p>${reading!==it.hint?`<p class="small muted">À lire : « ${esc(reading)} »</p>`:''}
   <div class="row"><button type="button" class="btn sm alt" data-act="st-auto">🔈 Voix automatique</button><button type="button" class="btn sm alt" data-act="st-prev">← Précédent</button><button type="button" class="btn sm alt" data-act="st-next">Suivant →</button>
   <label class="small row" style="gap:.3rem"><input type="checkbox" id="stAuto" ${ST.auto?'checked':''}> enchaîner</label></div>
   ${it.builtin?`<button type="button" class="btn sm alt" data-act="st-mask" data-t="${esc(it.t)}" data-ev="${it.sub}">${it.masque?'👁️ Remettre ce commentaire dans l’appli':'🙈 Ne plus utiliser ce commentaire'}</button>`:''}
   <div class="st-panel">${panel}</div><p class="small muted" id="stMsg" role="status"></p>
   ${sh.length?`<p class="small">✅ Déjà enregistré au niveau 1 (${sh.length} prise${sh.length>1?'s':''}) : <button type="button" class="btn sm alt" data-act="st-n1-play" data-k="${esc(it.k)}">▶ Écouter</button> Cette voix est utilisée ici aussi, sauf si tu enregistres une nouvelle prise.</p>`:''}<span class="lbl">Prises enregistrées au niveau 2 (${takes.length})</span>
   ${takes.length?`<ul class="takes">${takes.map((c,i)=>`<li class="${c.actif?'':'off'}"><button type="button" class="say sm" data-act="st-take-play" data-id="${c.id}" aria-label="Écouter la prise ${i+1}">▶</button><span>Prise ${i+1} · ${fmtDur(c.duree||0)}</span>
     <label class="small row" style="gap:.3rem"><input type="checkbox" data-act="st-take-on" data-id="${c.id}" ${c.actif?'checked':''}> utilisée</label>
     <button type="button" class="btn sm alt" data-act="st-take-trim" data-id="${c.id}">✂️ Recadrer</button><button type="button" class="btn sm alt" data-act="st-take-del" data-id="${c.id}" aria-label="Supprimer la prise ${i+1}">🗑️</button></li>`).join('')}</ul>`:'<p class="small muted">Aucune prise pour l’instant : l’appli utilise la voix automatique.</p>'}
  </div>`;
}
function fmtDur(s){ return (Math.round(s*10)/10).toString().replace('.',',')+' s'; }
function commentEditor(){ return `<form class="card row" data-form="addtexte"><b>Ajouter un commentaire :</b><select class="inp" name="ev" style="max-width:16rem">${Object.keys(DATA.evenements).map(e=>`<option value="${e}" ${ST.ev===e?'selected':''}>${esc(DATA.evenements[e])}</option>`).join('')}</select><input class="inp" name="t" placeholder="Ex. : Quelle frappe ! C’est juste !" maxlength="140" style="flex:1 1 16rem" required><button class="btn" type="submit">Ajouter</button></form>
  ${ST.cur&&ST.cur.grp==='commentaires'?(()=>{ const it=stCurrent(); return it&&it.custom?`<form class="card row" data-form="edtexte" data-id="${it.custom.id}"><b>Modifier ta phrase :</b><input class="inp" name="t" value="${esc(it.custom.texte)}" maxlength="140" style="flex:1 1 16rem"><button class="btn sm" type="submit">Enregistrer le texte</button><button type="button" class="btn sm alt" data-act="st-deltexte" data-id="${it.custom.id}">Supprimer la phrase</button></form>`:''; })():''}`; }
function stRedraw(list){ if(ST.grp==='orphelins'){ render(); return; } const r=document.getElementById('stRec'); if(r) r.innerHTML=stRecHTML(); if(list!==false){ const l=document.getElementById('stList'); if(l) l.innerHTML=stListHTML(); } if(Rec.state==='review') drawWave(); }
function stMsg(t){ const m=document.getElementById('stMsg'); if(m) m.textContent=t; }
function stMove(d){ const f=stFiltered(); if(!f.length) return; let i=f.findIndex(x=>ST.cur&&x.k===ST.cur.k&&x.grp===ST.cur.grp); i=i<0?0:Math.max(0,Math.min(f.length-1,i+d)); ST.cur={k:f[i].k,grp:f[i].grp}; recReset(); stRedraw(); const on=document.querySelector('.st-item.on'); if(on&&on.scrollIntoView) on.scrollIntoView({block:'nearest'}); }

/* ---------- Enregistrement ---------- */
function recReset(){ Rec.state='idle'; Rec.pcm=null; Rec.replace=null; cancelAnimationFrame(Rec.raf); clearInterval(Rec.timer); }
async function recStart(){
  if(!navigator.mediaDevices||!window.MediaRecorder){ stMsg('Ce navigateur ne peut pas enregistrer. Utilise Chrome, Edge ou Firefox récent.'); return; }
  try{ stopAll();
    Rec.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1}});
    Rec.chunks=[]; Rec.mr=new MediaRecorder(Rec.stream); Rec.mr.ondataavailable=e=>{ if(e.data&&e.data.size) Rec.chunks.push(e.data); };
    Rec.mr.onstop=recDone; Rec.ctx=Rec.ctx||new (window.AudioContext||window.webkitAudioContext)();
    const src=Rec.ctx.createMediaStreamSource(Rec.stream); Rec.an=Rec.ctx.createAnalyser(); Rec.an.fftSize=1024; src.connect(Rec.an);
    Rec.mr.start(); Rec.state='rec'; Rec.t0=Date.now(); stRedraw(false);
    const buf=new Float32Array(Rec.an.fftSize); const tick=()=>{ if(Rec.state!=='rec') return; Rec.an.getFloatTimeDomainData(buf); let m=0; for(const v of buf) m=Math.max(m,Math.abs(v)); const el=document.getElementById('stMeter'); if(el) el.style.width=Math.min(100,m*140)+'%'; Rec.raf=requestAnimationFrame(tick); }; tick();
    Rec.timer=setInterval(()=>{ const t=document.getElementById('stTime'); const s=(Date.now()-Rec.t0)/1000; if(t) t.textContent=fmtDur(s); if(s>25) recStop(); },100);
  }catch(e){ Rec.state='idle'; stMsg('Micro inaccessible : autorise le micro dans le navigateur (icône du cadenas).'); }
}
function recStop(){ if(Rec.state!=='rec') return; clearInterval(Rec.timer); cancelAnimationFrame(Rec.raf); try{ Rec.mr.stop(); }catch(e){} try{ Rec.stream.getTracks().forEach(t=>t.stop()); }catch(e){} Rec.state='busy'; stRedraw(false); }
async function recDone(){
  try{ const blob=new Blob(Rec.chunks,{type:(Rec.mr&&Rec.mr.mimeType)||'audio/webm'}); await loadForReview(await blob.arrayBuffer()); }
  catch(e){ Rec.state='idle'; stRedraw(false); stMsg('Le son n’a pas pu être lu. Recommence.'); }
}
async function loadForReview(ab){
  Rec.ctx=Rec.ctx||new (window.AudioContext||window.webkitAudioContext)();
  const au=await Rec.ctx.decodeAudioData(ab); const n=au.length, ch=au.numberOfChannels; const pcm=new Float32Array(n);
  for(let c=0;c<ch;c++){ const d=au.getChannelData(c); for(let i=0;i<n;i++) pcm[i]+=d[i]/ch; }
  Rec.pcm=pcm; Rec.rate=au.sampleRate; const [a,b]=autoTrim(pcm,au.sampleRate); Rec.a=a/n; Rec.b=b/n; Rec.state='review'; stRedraw(false);
}
function autoTrim(p,rate){ const f=Math.max(1,Math.round(rate*0.01)), nf=Math.floor(p.length/f); const rms=new Float32Array(nf); let mx=0;
  for(let i=0;i<nf;i++){ let s=0; for(let j=i*f;j<(i+1)*f;j++) s+=p[j]*p[j]; rms[i]=Math.sqrt(s/f); mx=Math.max(mx,rms[i]); }
  const thr=Math.max(0.01,mx*0.07); let a=0,b=nf-1; while(a<nf&&rms[a]<thr) a++; while(b>a&&rms[b]<thr) b--;
  if(a>=b) return [0,p.length]; return [Math.max(0,(a-12)*f),Math.min(p.length,(b+20)*f)]; }
function drawWave(){ const cv=document.getElementById('stWave'); if(!cv||!Rec.pcm) return; const g=cv.getContext('2d'); const W2=cv.width,H=cv.height,p=Rec.pcm,step=Math.ceil(p.length/W2);
  g.clearRect(0,0,W2,H); const css=getComputedStyle(document.documentElement);
  g.fillStyle=css.getPropertyValue('--sunk')||'#eee'; g.fillRect(0,0,W2,H);
  g.fillStyle=css.getPropertyValue('--c-verbe')||'#1E7F45';
  for(let x=0;x<W2;x++){ let m=0; for(let j=x*step;j<Math.min(p.length,(x+1)*step);j++) m=Math.max(m,Math.abs(p[j])); const h=Math.max(1,m*H*0.95); g.fillRect(x,(H-h)/2,1,h); }
  g.fillStyle='rgba(30,34,64,.45)'; g.fillRect(0,0,Rec.a*W2,H); g.fillRect(Rec.b*W2,0,W2-Rec.b*W2,H); }
function recSlice(){ const n=Rec.pcm.length; return Rec.pcm.subarray(Math.floor(Rec.a*n),Math.max(Math.floor(Rec.a*n)+1,Math.floor(Rec.b*n))); }
async function encodeMp3(pcm,rate){
  if(!window.lamejs) await loadScript(new URL('vendor/lame.min.js',location.href).href);
  let peak=0; for(const v of pcm) peak=Math.max(peak,Math.abs(v)); const g=peak>0?Math.min(6,0.9/peak):1;
  const n=pcm.length, fade=Math.min(Math.round(rate*0.012),n>>2); const i16=new Int16Array(n);
  for(let i=0;i<n;i++){ let s=pcm[i]*g; if(i<fade) s*=i/fade; if(i>n-fade) s*=(n-i)/fade; i16[i]=Math.max(-32768,Math.min(32767,s*32767)); }
  const enc=new lamejs.Mp3Encoder(1,rate,96); const parts=[]; for(let i=0;i<n;i+=1152){ const b=enc.encodeBuffer(i16.subarray(i,i+1152)); if(b.length) parts.push(new Int8Array(b)); }
  const e=enc.flush(); if(e.length) parts.push(new Int8Array(e)); return new Blob(parts,{type:'audio/mpeg'}); }
async function recKeep(){
  if(Rec.state!=='review') return; const it=stCurrent(); if(!it) return; const sl=recSlice(); const dur=sl.length/Rec.rate;
  if(dur<0.2){ stMsg('Le son est trop court. Recommence.'); return; }
  Rec.state='busy'; stRedraw(false);
  try{ const mp3=await encodeMp3(sl,Rec.rate); const row=await DB.addClip(it.t,mp3,dur); Bank.rows=(Bank.rows||[]).concat(row);
    if(Rec.replace){ const old=Bank.rows.find(c=>c.id===Rec.replace); if(old){ await DB.delClip(old); Bank.rows=Bank.rows.filter(c=>c.id!==old.id); } }
    Bank.clips=bankIndex(Bank.rows); bankSave();
    const wasTodo=ST.filtre==='todo'; recReset(); toast('Prise enregistrée ✔');
    if(ST.auto){ if(wasTodo){ ST.cur=null; } else stMove(1); }
    stRedraw(); }
  catch(e){ Rec.state='review'; stRedraw(false); stMsg('Envoi impossible : '+(e.message||e)+'. Vérifie la connexion, puis réessaie.'); }
}
async function takeTrim(id){ const c=(Bank.rows||[]).find(x=>x.id===id); if(!c) return; try{ const r=await fetch(DB.pub(c.chemin)); await loadForReview(await r.arrayBuffer()); Rec.replace=id; Rec.a=0; Rec.b=1; stRedraw(false); stMsg('Déplace « Début » et « Fin », puis « Remplacer ».'); }catch(e){ stMsg('Impossible de charger cette prise.'); } }
async function takeDel(id){ const c=(Bank.rows||[]).find(x=>x.id===id); if(!c||!confirm('Supprimer cette prise ?')) return; try{ await DB.delClip(c); Bank.rows=Bank.rows.filter(x=>x.id!==id); Bank.clips=bankIndex(Bank.rows); bankSave(); stRedraw(); }catch(e){ stMsg('Suppression impossible : '+e.message); } }
async function takeOn(id,on){ const c=(Bank.rows||[]).find(x=>x.id===id); if(!c) return; try{ await DB.setActif(id,on); c.actif=on; Bank.clips=bankIndex(Bank.rows); bankSave(); stRedraw(); }catch(e){ stMsg('Modification impossible : '+e.message); } }
async function textesReload(){ try{ Bank.textes=await DB.listTextes(); bankSave(); }catch(e){} }

