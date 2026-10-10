/* =====================================================================
   AFFICHAGE ET ÉVÉNEMENTS
   ===================================================================== */
const VIEWS={accueil:viewAccueil,chapitres:viewChapitres,chap:viewChap,mot:viewMot,entrainement:viewEntrainement,exo:viewExo,maths:viewMaths,brevet:viewBrevet,revision:viewRevision,glossaire:viewGlossaire,carnet:viewCarnet,parametres:viewParametres,'a-propos':viewApropos,confidentialite:viewConfidentialite,contact:viewContact,spirale:viewSpirale,studio:viewStudio};
function render(){
  const main=document.getElementById('main');
  let html; try{ html=(VIEWS[state.view]||notFound)(); }catch(e){ console.error(e); html=`<div class="card"><h1>Oups</h1><p>Un problème est arrivé sur cette page.</p><p><a class="btn" href="#/">Retour à l’accueil</a></p></div>`; }
  main.innerHTML=html;
  if(document.getElementById('qzone')) drawQ();
  if(document.getElementById('gres')) drawGloss();
  if(document.getElementById('stWave')) drawWave();
  const titles={accueil:'Accueil',chapitres:'Chapitres',chap:(MOD[state.args[0]]||{}).titre||'Chapitre',mot:(W[state.args[0]]||{}).mot||'Fiche',entrainement:'S’entraîner',exo:'Exercice',maths:'Exercice de maths',brevet:'Brevet blanc',revision:'Révision',glossaire:'Glossaire',carnet:'Mon carnet',parametres:'Paramètres','a-propos':'À propos',confidentialite:'Confidentialité',contact:'Contact',spirale:'Spirale',studio:'Studio'};
  document.title=(titles[state.view]||'Maths Allophones')+' · Maths Allophones · Niveau 2';
}
function rerenderKeepScroll(){ const y=window.scrollY; render(); window.scrollTo(0,y); }

document.addEventListener('click',e=>{
  const lex=e.target.closest('.lex');
  if(lex){ e.preventDefault(); if(Pop.owner===lex&&!Pop.el.hidden) hidePop(); else showPop(lex); return; }
  if(Pop.el&&!Pop.el.hidden&&!e.target.closest('#pop')) hidePop();
  const a=e.target.closest('[data-act]'); if(!a) return; const act=a.dataset.act;
  switch(act){
    case 'say': speak(a.dataset.t,a.classList.contains('say')||a.classList.contains('btn')?a:null); break;
    case 'pop-close': hidePop(); break;
    case 'fav': { const id=a.dataset.id; const i=U.fav.indexOf(id); if(i>=0) U.fav.splice(i,1); else U.fav.unshift(id); saveU();
      const on=U.fav.includes(id); a.setAttribute('aria-pressed',on); a.textContent=on?'♥':'♡'; a.setAttribute('aria-label',on?'Retirer de mon carnet':'Ajouter à mon carnet'); toast(on?'Ajouté à ton carnet ♥':'Retiré du carnet'); break; }
    case 'lprev': if(LS.i>0){ LS.i--; rerenderKeepScroll(); } break;
    case 'lnext': { const m=MOD[LS.mod]; if(LS.i<m.mots.length-1){ LS.i++; rerenderKeepScroll(); } break; }
    case 'lgo': LS.i=+a.dataset.i; rerenderKeepScroll(); break;
    case 'lmode': LS.mode=a.dataset.m; rerenderKeepScroll(); break;
    case 'print': printModule(a.dataset.mod); break;
    case 'back': if(history.length>1) history.back(); else go('#/'); break;
    case 'accent': insertAt(lastInput||document.querySelector('#main input.inp, #main textarea.inp'),a.dataset.ch); break;
    case 'opt': onOpt(a); break;
    case 'vf': onVF(a.dataset.v); break;
    case 'mpick': onMatch(a); break;
    case 'ord-add': case 'ord-del': case 'ord-reset': case 'ord-check': onOrder(act,a.dataset.i); break;
    case 'model': onModel(); break;
    case 'qnext': Q.i++; drawQ(); document.getElementById('qzone').scrollIntoView({block:'start'}); break;
    case 'again': startSeries({...Q}); drawQ(); break;
    case 'popt': onPopt(a); break;
    case 'ppick': onPpick(a); break;
    case 'ptok': onPtok(a); break;
    case 'pickok': onPickOk(); break;
    case 'pord-add': case 'pord-del': case 'pord-reset': case 'pord-ok': onPord(act,a.dataset.i); break;
    case 'paide': onPaide(); break;
    case 'pmeth': onPmeth(); break;
    case 'pnext': onPnext(); break;
    case 'gn1': G.n1=a.dataset.v==='1'; render(); break;
    case 'gmode': G.mode=a.dataset.m; G.q=''; render(); break;
    case 'set': { const k=a.dataset.k; let v=a.dataset.v; if(k==='zoom'||k==='rate') v=+v; else if(v==='true'||v==='false') v=v==='true'; S[k]=v; saveS(); applySettings(); if(k==='rate') Neural.mem.clear(); rerenderKeepScroll(); break; }
    case 'zoom': { S.zoom=Math.round(Math.max(0.8,Math.min(2,(+S.zoom||1)+(+a.dataset.d)))*10)/10; saveS(); applySettings(); break; }
    case 'nv-hide': S.nvBanner=false; saveS(); rerenderKeepScroll(); break;
    case 'nv-install': nvInstallUI(a.dataset.id); break;
    case 'nv-del': if(confirm('Supprimer cette voix de l’appareil ?')){ nvRemove(a.dataset.id).then(rerenderKeepScroll); } break;
    case 'nv-toggle': { const id=a.dataset.id; S.nv=(S.nv||[]).includes(id)?S.nv.filter(x=>x!==id):(S.nv||[]).concat(id); saveS(); Neural.mem.clear(); rerenderKeepScroll(); break; }
    case 'nv-test': { const id=a.dataset.id; a.classList.add('is-loading'); nvSynth('Bonjour ! Je suis la voix de l’appli. Je lis les mots et les phrases de maths.',id).then(b=>playSrc(URL.createObjectURL(b),a)).catch(err=>{ a.classList.remove('is-loading'); toast('La voix ne fonctionne pas sur cet appareil : '+(err.message||err)); }); break; }
    case 'prof-offline': { const o=document.getElementById('profOff'); cacheAllProf((i,n)=>{ if(o) o.textContent=i+' / '+n; }).then(()=>{ if(o) o.textContent='✔ prêt pour le hors-ligne'; }); break; }
    case 'logout': DB.logout(); render(); break;
    case 'st-grp': ST.grp=a.dataset.g; ST.mod='all'; ST.cur=null; recReset(); render(); break;
    case 'st-filtre': ST.filtre=a.dataset.f; ST.cur=null; recReset(); render(); break;
    case 'st-pick': ST.cur={k:a.dataset.k,grp:a.dataset.g}; recReset(); stRedraw(); break;
    case 'st-next': stMove(1); break;
    case 'st-prev': stMove(-1); break;
    case 'st-rec': recStart(); break;
    case 'st-stop': recStop(); break;
    case 'st-redo': recReset(); recStart(); break;
    case 'st-keep': recKeep(); break;
    case 'st-play': { const sl=recSlice(); stopAll(); playSrc(URL.createObjectURL(pcm2wav(sl,Rec.rate)),a); break; }
    case 'st-auto': { const it=stCurrent(); if(it){ const keep=S.voixProf; S.voixProf=false; Promise.resolve(speak(it.t,a)).finally(()=>{ S.voixProf=keep; }); } break; }
    case 'st-attach': attachClip(a.dataset.id); break;
    case 'st-backup': backupClips(); break;
    case 'st-take-play': { const c=(Bank.rows||[]).find(x=>x.id===a.dataset.id); if(c){ stopAll(); playSrc(clipUrl(c),a); } break; }
    case 'st-n1-play': { const l=Bank.shared[a.dataset.k]||[]; if(l.length){ stopAll(); playSrc(clipUrl(pickVariant('n1'+a.dataset.k,l)),a); } break; }
    case 'st-take-trim': takeTrim(a.dataset.id); break;
    case 'st-take-del': takeDel(a.dataset.id); break;
    case 'st-deltexte': if(confirm('Supprimer cette phrase ?')) DB.delTexte(a.dataset.id).then(textesReload).then(()=>{ ST.cur=null; render(); }).catch(err=>toast('Impossible : '+err.message)); break;
    case 'st-mask': { const t=a.dataset.t, ev=a.dataset.ev; const row=Bank.textes.find(x=>x.evenement===ev&&!x.actif&&vkey(x.texte)===vkey(t));
      (row?DB.delTexte(row.id):DB.addTexte(ev,t,false)).then(textesReload).then(()=>stRedraw()).catch(err=>toast('Impossible : '+err.message)); break; }

    case 'resetset': S={...DEF_SET}; saveS(); applySettings(); rerenderKeepScroll(); toast('Réglages remis par défaut.'); break;
    case 'delph': U.phrases.splice(+a.dataset.i,1); saveU(); rerenderKeepScroll(); break;
    case 'export': doExport(); break;
    case 'wipe': if(confirm('Effacer toute ta progression, ton carnet, tes phrases et tes réglages ? On ne peut pas annuler.')){ U=newData(); S={...DEF_SET}; Store.del('data'); Store.del('settings'); applySettings(); render(); toast('Tout est effacé.'); } break;
  }
});
document.addEventListener('submit',e=>{
  const f=e.target.closest('form[data-form]'); if(!f) return; e.preventDefault();
  if(f.dataset.form==='w') onWrite(f); else if(f.dataset.form==='s') onSentence(f); else if(f.dataset.form==='p') onPform(f);
  else if(f.dataset.form==='login'){ const m=document.getElementById('lgMsg'); m.textContent='Connexion…'; DB.login(f.elements.namedItem('e').value.trim(),f.elements.namedItem('p').value).then(()=>loadBank()).then(()=>render()).catch(()=>{ m.textContent='Connexion refusée : vérifie l’adresse et le mot de passe.'; }); }
  else if(f.dataset.form==='addtexte'){ const t=f.elements.namedItem('t').value.trim(); if(!t) return; const evv=f.elements.namedItem('ev').value; ST.ev=evv; DB.addTexte(evv,t,true).then(r=>textesReload().then(()=>{ ST.grp='commentaires'; ST.filtre='all'; ST.mod=evv; ST.cur={k:vkey(t),grp:'commentaires'}; render(); toast('Commentaire ajouté. Tu peux l’enregistrer.'); })).catch(err=>toast('Impossible : '+err.message)); }
  else if(f.dataset.form==='edtexte'){ const t=f.elements.namedItem('t').value.trim(); if(!t) return; DB.updTexte(f.dataset.id,{texte:t}).then(textesReload).then(()=>{ ST.cur={k:vkey(t),grp:'commentaires'}; render(); toast('Texte modifié. Pense à réenregistrer ce commentaire.'); }).catch(err=>toast('Impossible : '+err.message)); }
});
document.addEventListener('focusin',e=>{ if(e.target.matches&&e.target.matches('input.inp,textarea.inp')) lastInput=e.target;
  const lex=e.target.closest&&e.target.closest('.lex'); if(lex){ let kb=false; try{ kb=lex.matches(':focus-visible'); }catch(err){} if(kb) showPop(lex); } });
document.addEventListener('mousedown',e=>{ if(e.target.closest('[data-act="accent"]')) e.preventDefault(); });
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.id==='gq'){ G.q=t.value; drawGloss(); }
  else if(t.id==='stQ'){ ST.q=t.value; const l=document.getElementById('stList'); if(l) l.innerHTML=stListHTML(); }
  else if(t.id==='stA'||t.id==='stB'){ const a=+document.getElementById('stA').value/1000, b=+document.getElementById('stB').value/1000; Rec.a=Math.min(a,b-0.01); Rec.b=Math.max(b,a+0.01); drawWave(); const d=document.getElementById('stDur'); if(d&&Rec.pcm) d.textContent=fmtDur((Rec.b-Rec.a)*Rec.pcm.length/Rec.rate); }
  else if(t.dataset&&t.dataset.zoom!=null){ S.zoom=+t.value; saveS(); applySettings(); }
  else if(t.dataset&&t.dataset.tr){ const v=t.value.slice(0,80); if(v) U.tr[t.dataset.tr]=v; else delete U.tr[t.dataset.tr]; saveU(); }
  else if(t.dataset&&t.dataset.copy){ const w=W[t.dataset.copy]; const r=check(t.value,[w.mot]); const ok=r==='ok'; t.classList.toggle('is-ok',ok); if(ok&&!t.dataset.done){ t.dataset.done='1'; toast('Bien écrit ! ✍️'); } }
});
document.addEventListener('change',e=>{
  if(e.target.id==='voiceSel'){ S.voice=e.target.value; saveS(); sysSpeak('Bonjour ! Voici ma voix.'); }
  if(e.target.id==='stMod'){ ST.mod=e.target.value; ST.cur=null; recReset(); render(); }
  if(e.target.id==='stAuto'){ ST.auto=e.target.checked; }
  if(e.target.dataset&&e.target.dataset.act==='st-take-on') takeOn(e.target.dataset.id,e.target.checked);
  if(e.target.id==='importF'&&e.target.files[0]) doImport(e.target.files[0]);
});
document.addEventListener('keydown',e=>{
  if(state.view==='studio'&&DB.isProf()&&!e.target.closest('input[type=text],input[type=search],input[type=email],input[type=password],input:not([type]),textarea,select')){
    if(e.code==='Space'){ e.preventDefault(); if(Rec.state==='rec') recStop(); else if(Rec.state!=='busy'){ recReset(); recStart(); } return; }
    if(e.key==='Enter'&&Rec.state==='review'){ e.preventDefault(); recKeep(); return; }
    if((e.key==='r'||e.key==='R')&&Rec.state==='review'){ e.preventDefault(); recReset(); recStart(); return; }
    if(e.key==='ArrowRight'&&Rec.state!=='rec'){ e.preventDefault(); stMove(1); return; }
    if(e.key==='ArrowLeft'&&Rec.state!=='rec'){ e.preventDefault(); stMove(-1); return; } }
  if(e.key==='Escape'&&Pop.el&&!Pop.el.hidden){ const o=Pop.owner; hidePop(); if(o) o.focus(); }
  if(state.view==='chap'&&state.args[1]==='mots'&&LS.mode==='one'&&!e.target.closest('input,textarea,select')){
    if(e.key==='ArrowRight'){ const m=MOD[LS.mod]; if(LS.i<m.mots.length-1){ LS.i++; rerenderKeepScroll(); } }
    if(e.key==='ArrowLeft'&&LS.i>0){ LS.i--; rerenderKeepScroll(); } }
});
/* survol à la souris : bulle après un court instant */
document.addEventListener('pointerover',e=>{ if(e.pointerType!=='mouse') return; const lex=e.target.closest('.lex');
  if(lex){ clearTimeout(Pop.hideT); clearTimeout(Pop.showT); Pop.showT=setTimeout(()=>showPop(lex),300); }
  else if(e.target.closest('#pop')) clearTimeout(Pop.hideT); });
document.addEventListener('pointerout',e=>{ if(e.pointerType!=='mouse') return; if(e.target.closest('.lex')||e.target.closest('#pop')){ clearTimeout(Pop.showT); clearTimeout(Pop.hideT); Pop.hideT=setTimeout(()=>{ if(!Pop.el.matches(':hover')) hidePop(); },400); } });

/* ---------- Export / import ---------- */
function doExport(){
  const payload={app:APP,version:1,exportedAt:new Date().toISOString(),data:U,settings:S};
  try{ const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download=`maths-allophones-niveau2-${today()}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1500); toast('Fichier téléchargé.'); }
  catch(e){ toast('Export impossible sur cet appareil.'); }
}
function doImport(file){
  const r=new FileReader();
  r.onload=()=>{ try{ const p=JSON.parse(r.result); if(!p||p.app!==APP||!p.data||typeof p.data!=='object') throw new Error('format');
      if(!confirm('Remplacer ta progression actuelle par celle du fichier ?')) return;
      const d=newData(); ['fav','phrases'].forEach(k=>{ if(Array.isArray(p.data[k])) d[k]=p.data[k]; }); ['tr','m','seen','stars','at','sr','cs','mx','bp'].forEach(k=>{ if(p.data[k]&&typeof p.data[k]==='object') d[k]=p.data[k]; });
      d.fav=d.fav.filter(id=>W[id]); U=d; if(p.settings&&typeof p.settings==='object') S=Object.assign({},DEF_SET,p.settings); saveU(); saveS(); applySettings(); render(); toast('Progression importée ✔'); }
    catch(e){ toast('Ce fichier n’est pas une sauvegarde de Maths Allophones · Niveau 2.'); } };
  r.onerror=()=>toast('Lecture du fichier impossible.'); r.readAsText(file);
}

/* ---------- Démarrage ---------- */
function nvInstallUI(id){
  NVP[id]=0; const upd=()=>{ const l=document.getElementById('nvList'); if(l) l.innerHTML=nvRows(); };
  upd(); nvInstall(id,p=>{ NVP[id]=p; upd(); }).then(()=>{ delete NVP[id]; S.nvBanner=false; saveS(); upd(); toast('Voix installée ✔'); return nvSession(id); }).then(()=>speak('La voix est prête. Bon travail en maths !'))
  .catch(err=>{ delete NVP[id]; upd(); toast('Installation impossible : '+(err.message||err)+'. Vérifie la connexion internet.'); });
}
function init(){
  Pop.el=document.getElementById('pop'); applySettings(); DB.loadSession();
  window.addEventListener('hashchange',()=>{ if(Q) Q.stale=true; if(Rec.state==='rec') recStop(); route(); });
  route();
  loadBank().then(()=>{ if(['parametres','studio','accueil'].includes(state.view)) rerenderKeepScroll(); });
  nvCheckInstalled().then(()=>{ if(state.view==='parametres'||state.view==='accueil') rerenderKeepScroll(); const en=nvEnabled(); if(en.length){ const go=()=>nvSession(en[0].id).catch(()=>{}); if(window.requestIdleCallback) requestIdleCallback(go,{timeout:4000}); else setTimeout(go,2000); } });
}

init();

