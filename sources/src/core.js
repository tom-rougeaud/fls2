"use strict";
/* =====================================================================
   MATHS ALLOPHONES · NIVEAU 2
   NOYAU — données, stockage, outils, voix, bulles, navigation
   ===================================================================== */
const APP='mathsallophones2', VER='v1';
const KEY=k=>`${APP}_${VER}_${k}`;
const DATA=JSON.parse(document.getElementById('mm-data').textContent);
const CATS=Object.fromEntries(DATA.categories.map(c=>[c.id,c]));
const MODS=DATA.modules, MOD=Object.fromEntries(MODS.map(m=>[m.id,m]));
const WORDS=DATA.mots, W=Object.fromEntries(WORDS.map(w=>[w.id,w]));
const N2=WORDS.filter(w=>!w.n1), RAPPELS=WORDS.filter(w=>w.n1);
MODS.forEach((m,i)=>{ m.num=i+1; m.mots=N2.filter(w=>w.mod===m.id).map(w=>w.id); });

/* ---------- Stockage local (protégé, avec repli en mémoire) ---------- */
const Store=(()=>{
  let ok=true; const mem={};
  try{ const t=KEY('test'); localStorage.setItem(t,'1'); localStorage.removeItem(t); }catch(e){ ok=false; }
  return {
    ok:()=>ok,
    get(k,fb){ try{ const raw=ok?localStorage.getItem(KEY(k)):mem[k]; if(raw==null) return fb; const v=JSON.parse(raw); return (v&&typeof v==='object')?v:fb; }catch(e){ return fb; } },
    set(k,v){ const s=JSON.stringify(v); try{ if(ok) localStorage.setItem(KEY(k),s); else mem[k]=s; }catch(e){ ok=false; mem[k]=s; } },
    del(k){ try{ if(ok) localStorage.removeItem(KEY(k)); }catch(e){} delete mem[k]; }
  };
})();
/* fav : carnet · tr : ma langue · phrases · m : réussites des mots · seen · stars · sr : spirale des mots
   cs : cours lus · mx : réussites des calculs (par générateur) · bp : problèmes de brevet réussis */
const newData=()=>({fav:[],tr:{},phrases:[],m:{},seen:{},stars:{},at:{},sr:{},cs:{},mx:{},bp:{},last:null});
let U=Object.assign(newData(),Store.get('data',{}));
const DEF_SET={zoom:1,theme:'clair',espace:false,contraste:false,dalto:false,rate:0.9,voice:'',moteur:'auto',nv:['fr_FR-siwis-medium'],alterner:false,varier:true,voixProf:true,voixN1:true,comment:true,commentVoix:true,nvBanner:true,aide:true};
let S=Object.assign({},DEF_SET,Store.get('settings',{}));
const saveU=()=>Store.set('data',U);
const saveS=()=>Store.set('settings',S);

/* ---------- Petits outils ---------- */
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
const FOLD={'à':'a','â':'a','ä':'a','á':'a','ç':'c','é':'e','è':'e','ê':'e','ë':'e','î':'i','ï':'i','í':'i','ô':'o','ö':'o','ó':'o','ù':'u','û':'u','ü':'u','ú':'u','ÿ':'y','œ':'o','æ':'a','À':'A','Â':'A','Ç':'C','É':'E','È':'E','Ê':'E','Ë':'E','Î':'I','Ï':'I','Ô':'O','Ù':'U','Û':'U','Œ':'O'};
function fold(s){let o='';for(const ch of String(s)) o+=FOLD[ch]||ch;return o;}
function slug(s){return fold(String(s).toLowerCase()).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function sample(a,n){return shuffle(a).slice(0,n);}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function rnd(a,b){return a+Math.floor(Math.random()*(b-a+1));}
function fmtN(n){ /* nombre à la française : 1 234,5 ; signe − typographique */
  if(typeof n!=='number') return String(n);
  const neg=n<0; let s=String(Math.round(Math.abs(n)*1e9)/1e9); if(/e/.test(s)) s=Math.abs(n).toFixed(12).replace(/0+$/,'').replace(/\.$/,'');
  let [e,d]=s.split('.'); e=e.replace(/\B(?=(\d{3})+(?!\d))/g,' ');
  return (neg?'−':'')+e+(d?','+d:''); }
function lev(a,b){const m=a.length,n=b.length;if(Math.abs(m-n)>2)return 9;const d=Array.from({length:m+1},(_,i)=>[i]);for(let j=1;j<=n;j++)d[0][j]=j;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n];}
function today(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}

/* ---------- Affichage d’un mot ---------- */
function fullName(w){ if(!w.art) return w.mot; return w.art.endsWith('’')?w.art+w.mot:w.art+' '+w.mot; }
function indef(w){ return {m:'un',f:'une',mpl:'des',fpl:'des'}[w.g]||''; }
function genreChip(w){ if(!w.g) return ''; const t={m:'masculin · un / le',f:'féminin · une / la',mpl:'masculin pluriel · des / les',fpl:'féminin pluriel · des / les'}[w.g]; return `<span class="chip plain">${t}</span>`; }
function catChip(cat){ const c=CATS[cat]; return `<span class="chip c-${cat}">${c.icone} ${esc(c.nom)}</span>`; }
function speakText(w){ return w.pron || (w.cat==='verbe'||!w.art||w.art==='le signe'?w.mot:fullName(w)); }
function seen(id){ if(!U.seen[id]){ U.seen[id]=1; saveU(); } }

/* ---------- Texte enrichi ----------
   [[texte|id]] : mot du lexique (coloré, s’ouvre au toucher)
   **texte**    : verbe d’action de la consigne (gras souligné)
   {{a/b}}      : fraction écrite en hauteur                     */
function tokRe(){ return /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g; }
function tokens(s){ const r=tokRe(), out=[]; let m; while((m=r.exec(s))) out.push({text:m[1],id:m[2]||slug(m[1]),index:m.index,len:m[0].length}); return out; }
function fracPlain(a,b){ return /\s/.test(a+b)?`${a} sur ${b}`:`${a}/${b}`; }
function plain(s){ return String(s).replace(tokRe(),'$1').replace(/\*\*/g,'').replace(/\{\{([^{}]+?)\/([^{}]+?)\}\}/g,(m,a,b)=>fracPlain(a.trim(),b.trim())); }
function deco(h){ return h.replace(/\*\*(.+?)\*\*/g,'<b class="kv">$1</b>').replace(/\{\{([^{}]+?)\/([^{}]+?)\}\}/g,'<span class="fr" role="math"><span class="fn">$1</span><span class="fd">$2</span></span>'); }
function rich(s,link){
  link=link!==false; s=String(s==null?'':s); const r=tokRe(); let out='',last=0,m;
  while((m=r.exec(s))){
    out+=esc(s.slice(last,m.index)); const id=m[2]||slug(m[1]), w=W[id];
    if(w&&link) out+=`<button type="button" class="lex c-${w.cat}" data-lex="${id}" aria-label="${esc(plain(m[1]))} : voir la définition">${esc(m[1])}</button>`;
    else if(w) out+=`<b class="lexb c-${w.cat}">${esc(m[1])}</b>`;
    else out+=`<b>${esc(m[1])}</b>`;
    last=r.lastIndex;
  }
  return deco(out+esc(s.slice(last)));
}
/* Cache le mot dans sa propre définition (exercices) */
function maskIn(text,w){
  let t=text; const forms=[w.mot]; if(w.f&&w.f.je) forms.push(w.f.je.replace(/^(je |j’|il |ils )/,''));
  forms.forEach(f=>{ const F=fold(f.toLowerCase()); if(F.length<3) return;
    let low=fold(t.toLowerCase()), from=0;
    for(;;){ const i=low.indexOf(F,from); if(i<0) break;
      if(i>0 && /[a-z]/.test(low[i-1])){ from=i+1; continue; }
      let end=i+F.length, k=0; while(end<low.length && /[a-z]/.test(low[end]) && k<3){ end++; k++; }
      t=t.slice(0,i)+'…'+t.slice(end); low=low.slice(0,i)+'…'+low.slice(end); from=i+1; }
  });
  return t;
}

/* ---------- Voix (synthèse vocale du navigateur) ---------- */
const TTS={ok:typeof window!=='undefined'&&'speechSynthesis' in window&&'SpeechSynthesisUtterance' in window,voices:[]};
function loadVoices(){ if(!TTS.ok) return; try{ TTS.voices=speechSynthesis.getVoices().filter(v=>/^fr/i.test(v.lang)); }catch(e){ TTS.voices=[]; } }
if(TTS.ok){ loadVoices(); try{ speechSynthesis.addEventListener('voiceschanged',()=>{ loadVoices(); if(state.view==='parametres') rerenderKeepScroll(); }); }catch(e){} }
/* Lecture des écritures mathématiques en mots (pour la synthèse vocale uniquement) */
const SUP={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁻':'−'};
const UNITS_TTS=[['km/h','kilomètres par heure'],['m/s','mètres par seconde'],['cm³','centimètres cubes'],['dm³','décimètres cubes'],['m³','mètres cubes'],['cm²','centimètres carrés'],['dm²','décimètres carrés'],['km²','kilomètres carrés'],['m²','mètres carrés'],['km','kilomètres'],['cm','centimètres'],['mm','millimètres'],['dm','décimètres'],['kg','kilogrammes'],['mg','milligrammes'],['cL','centilitres'],['mL','millilitres'],['Go','gigaoctets'],['Mo','mégaoctets'],['min','minutes'],['°C','degrés'],['L','litres'],['g','grammes'],['h','heures'],['s','secondes'],['m','mètres']];
function ttsPrep(t){
  t=plain(String(t));
  for(let i=0;i<3;i++) t=t.replace(/(\d)[   ](\d{3})(?!\d)/g,'$1$2');
  t=t.replace(/[  ]/g,' ');
  t=t.replace(/√\s?\(?([\d,]+|[a-z])\)?/g,' racine carrée de $1 ').replace(/π/g,' pi ').replace(/cos⁻¹/g,'arc cosinus').replace(/sin⁻¹/g,'arc sinus').replace(/tan⁻¹/g,'arc tangente')
   .replace(/\bcos\(/g,'cosinus de (').replace(/\bsin\(/g,'sinus de (').replace(/\btan\(/g,'tangente de (')
   .replace(/(\d)\s?(km\/h|m\/s|cm³|dm³|m³|cm²|dm²|km²|m²|km|cm|mm|dm|kg|mg|cL|mL|Go|Mo|min|°C|L|g|h|s|m)(?![A-Za-zÀ-ÿ²³])/g,(m,d,u)=>d+' '+UNITS_TTS.find(x=>x[0]===u)[1])
   .replace(/([0-9A-Za-z)])([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)/g,(m,b,e)=>{ const x=e.split('').map(c=>SUP[c]).join(''); return b+(x==='2'?' au carré':x==='3'?' au cube':' puissance '+x.replace('−','moins ')); })
   .replace(/\b([fgh])\(([^()]+)\)/g,'$1 de $2').replace(/\b([A-Z])’?\((−?[\d,]+) ; (−?[\d,]+)\)/g,'$1 de coordonnées $2 et $3').replace(/\((−?[\d,x]+) ; (−?[^()]+)\)/g,'$1 et $2')
   .replace(/\b([A-Z])’(?![a-zà-ÿ])/g,'$1 prime').replace(/\(([a-zΔ])’\)/g,'$1 prime').replace(/\(Δ\)/g,'delta').replace(/Δ/g,'delta')
   .replace(/\[([A-Z])([A-Z])\]/g,' segment $1 $2 ').replace(/\(([A-Z])([A-Z])\)/g,' droite $1 $2 ').replace(/\s\/\/\s/g,' parallèle à ').replace(/⊥/g,' perpendiculaire à ')
   .replace(/\b([A-Z]{1,2}|\d+(?:,\d+)?)\/([A-Z]{1,2}|\d+(?:,\d+)?)\b/g,'$1 sur $2')
   .replace(/\b([A-Z])([A-Z])\b/g,'$1 $2');
  return t.replace(/\s\+\s/g,' plus ').replace(/\+(\d)/g,' plus $1').replace(/×/g,' fois ').replace(/÷/g,' divisé par ').replace(/−/g,' moins ').replace(/(\d)\s*-\s*(\d)/g,'$1 moins $2')
   .replace(/≈/g,' environ ').replace(/≠/g,' différent de ').replace(/≤/g,' inférieur ou égal à ').replace(/≥/g,' supérieur ou égal à ').replace(/=/g,' égale ').replace(/>/g,' est plus grand que ').replace(/</g,' est plus petit que ')
   .replace(/%/g,' pour cent').replace(/°/g,' degrés').replace(/→/g,', ').replace(/[«»✓✗]/g,'').replace(/\s+/g,' ').trim();
}
function sayBtn(text,sm){ return `<button type="button" class="say${sm?' sm':''}" data-act="say" data-t="${esc(text)}" aria-label="Écouter : ${esc(plain(text))}"><span aria-hidden="true">🔊</span></button>`; }

/* ---------- Message court ---------- */
let toastT=null;
function toast(msg){ const t=document.getElementById('toast'); if(!t) return; t.textContent=msg; t.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>{t.hidden=true;},2600); }
function live(msg){ const l=document.getElementById('live'); if(l){ l.textContent=''; setTimeout(()=>{l.textContent=msg;},30); } }

/* ---------- Bulle de définition (survol, toucher, clavier) ---------- */
const Pop={el:null,owner:null,showT:null,hideT:null};
function popHTML(w){
  return `<div class="c-${w.cat}">${renderIll(w.ill,w.cat)}<div class="small">${CATS[w.cat].icone} ${esc(CATS[w.cat].nom)}${w.n1?' · niveau 1':''}${w.ctx?' · '+esc(w.ctx):''}</div>
  <div class="pw">${w.art?`<span class="muted" style="font-size:.7em">${esc(w.art)}</span> `:''}${esc(w.mot)}${w.sym?` <span class="chip">${esc(w.sym)}</span>`:''}</div>
  <div class="pd">${rich(w.def,false)}</div>
  <div class="row">${sayBtn(speakText(w),true)}<a class="btn sm alt" href="#/mot/${w.id}" data-act="pop-close">Voir la fiche</a><button type="button" class="btn sm alt" data-act="pop-close">Fermer</button></div></div>`;
}
function showPop(btn){
  const w=W[btn.dataset.lex]; if(!w) return;
  const p=Pop.el; p.className=`c-${w.cat}`; p.innerHTML=popHTML(w); p.hidden=false; Pop.owner=btn;
  p.setAttribute('aria-label','Définition : '+w.mot);
  const small=window.innerWidth<640;
  if(small){ p.classList.add('sheet'); p.style.left=''; p.style.top=''; }
  else{ const r=btn.getBoundingClientRect(); const pw=Math.min(340,window.innerWidth-24);
    let left=r.left+window.scrollX; left=Math.max(12,Math.min(left,window.scrollX+window.innerWidth-pw-12));
    p.style.left=left+'px'; p.style.top=(r.bottom+window.scrollY+8)+'px'; }
  seen(w.id);
}
function hidePop(){ if(Pop.el){ Pop.el.hidden=true; Pop.owner=null; } }

/* ---------- Clavier des accents et des signes ---------- */
const ACCENTS=['é','è','ê','à','â','ç','ù','ô','î','œ','’','-'];
const SIGNES=['−','×','÷','²','³','(',')','/','x',',','√','π'];
let lastInput=null;
function kbd(math){ const list=Array.isArray(math)?math:math?SIGNES:ACCENTS; return `<div class="kbd${math?' kbd-m':''}" role="group" aria-label="${math?'Signes mathématiques':'Lettres avec accents'}">${list.map(c=>`<button type="button" data-act="accent" data-ch="${c}" aria-label="Ajouter ${c}">${c}</button>`).join('')}</div>`; }
function insertAt(input,ch){ if(!input) return; const s=input.selectionStart??input.value.length, e=input.selectionEnd??input.value.length;
  input.value=input.value.slice(0,s)+ch+input.value.slice(e); try{ input.setSelectionRange(s+ch.length,s+ch.length);}catch(err){} input.focus(); input.dispatchEvent(new Event('input',{bubbles:true})); }

/* ---------- Vérification d’une réponse écrite ---------- */
function normA(s){ return String(s).toLowerCase().replace(/['`´]/g,'’').replace(/[  ]/g,' ').replace(/\s+/g,' ').replace(/[.!?;:,]+$/,'').trim(); }
function stripArt(s){ return s.replace(/^(le |la |les |l’|un |une |des |le signe )/,''); }
/* renvoie 'ok' | 'accent' | 'tiret' | 'near' | 'ko' */
function check(input,expected){
  const a=normA(input); const exp=[].concat(expected).map(normA);
  if(!a) return 'ko';
  if(exp.includes(a)||exp.includes(stripArt(a))) return 'ok';
  const fa=fold(a), fs=fold(stripArt(a));
  if(exp.some(e=>fold(e)===fa||fold(e)===fs)) return 'accent';
  const dh=x=>fold(x).replace(/[-\s]+/g,'');
  if(exp.some(e=>dh(e)===dh(a))) return 'tiret';
  if(exp.some(e=>e.length>=5&&lev(fold(e),fs)<=1)) return 'near';
  return 'ko';
}

/* ---------- Navigation (adresse #/…) ---------- */
const state={view:'accueil',args:[]};
function go(h){ if(location.hash===h) route(); else location.hash=h; }
const TABS={accueil:'accueil',chapitres:'chapitres',chap:'chapitres',mot:'glossaire',entrainement:'entrainement',exo:'entrainement',maths:'entrainement',revision:'entrainement',spirale:'entrainement',brevet:'entrainement',glossaire:'glossaire',carnet:'carnet',parametres:'parametres',studio:'studio'};
function route(){
  const h=(location.hash||'#/').replace(/^#\/?/,''); const parts=h.split('/').filter(Boolean).map(p=>{ try{ return decodeURIComponent(p); }catch(e){ return p; } });
  let v=parts[0]||'accueil'; if(v==='lecons') v='chapitres'; if(v==='lecon') v='chap';
  state.view=v; state.args=parts.slice(1);
  hidePop(); try{ stopAll(); }catch(e){}
  render(); window.scrollTo(0,0);
  const tab=TABS[v];
  document.querySelectorAll('[data-tab]').forEach(a=>{ if(a.dataset.tab===tab) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
  const m=document.getElementById('main'); if(m){ m.focus({preventScroll:true}); }
}

/* ---------- Réglages d’affichage ---------- */
function applySettings(){
  const r=document.documentElement;
  const z=Math.max(0.8,Math.min(2,+S.zoom||1)); r.style.setProperty('--z',z); r.dataset.zbig=z>=1.4?'1':'0';
  document.querySelectorAll('[data-zoomval]').forEach(e=>e.textContent=Math.round(z*100)+' %');
  document.querySelectorAll('input[data-zoom]').forEach(e=>e.value=z);
  if(S.theme&&S.theme!=='clair') r.dataset.theme=S.theme; else delete r.dataset.theme;
  ['espace','contraste','dalto'].forEach(k=>{ if(S[k]) r.dataset[k]='1'; else delete r.dataset[k]; });
}
