/* =====================================================================
   VOIX — dans l’ordre de préférence :
   1. la voix enregistrée par le professeur (si elle existe pour ce texte exact),
   2. la voix naturelle (neuronale, Piper) installée sur l’appareil,
   3. la meilleure voix française de l’appareil.
   Règle : un texte = un seul son, entier. On n’assemble JAMAIS des morceaux.
   ===================================================================== */
function vkey(t){ return normA(plain(String(t))).replace(/[«»"]/g,'').replace(/\s*([!?:;,.])/g,'$1').replace(/[.!?;:,…]+$/,'').trim(); }
const Bank={ clips:{}, shared:{}, textes:[], rows:[], srows:[], loaded:false, last:{} };
function bankIndex(rows){ const m={}; (rows||[]).forEach(c=>{ if(!c.actif) return; (m[c.cle]=m[c.cle]||[]).push(c); }); return m; }
function bankSave(){ Store.set('bank',{clips:Bank.rows,shared:Bank.srows,textes:Bank.textes,at:Date.now()}); }
async function loadBank(){
  const cached=Store.get('bank',null); if(cached){ Bank.rows=cached.clips||[]; Bank.srows=cached.shared||[]; Bank.clips=bankIndex(Bank.rows); Bank.shared=bankIndex(Bank.srows); Bank.textes=cached.textes||[]; }
  if(!DB.ok()) return;
  const [a,b,c]=await Promise.allSettled([DB.listClips(),DB.listTextes(),DB.listShared()]);
  if(a.status==='fulfilled'){ Bank.rows=a.value||[]; Bank.clips=bankIndex(Bank.rows); DB.online=true; DB.ready=true; DB.err=''; }
  else { DB.err=String(a.reason&&a.reason.message||a.reason); DB.online=false; if(a.reason&&(a.reason.status===404||/42P01|does not exist|schema cache/i.test(a.reason.body||''))){ DB.ready=false; DB.online=true; } }
  if(b.status==='fulfilled') Bank.textes=b.value||[];
  if(c.status==='fulfilled'){ Bank.srows=c.value||[]; Bank.shared=bankIndex(Bank.srows); if(!DB.err) DB.online=true; }
  Bank.loaded=true; bankSave();
}
function recsFor(text){ const k=vkey(text); const own=Bank.clips[k]||[]; if(own.length||S.voixN1===false) return own; return Bank.shared[k]||[]; }
function clipUrl(c){ return DB.pub(c.chemin,c.bucket); }
function pickVariant(key,list){ if(list.length===1) return list[0]; let i; do{ i=Math.floor(Math.random()*list.length); }while(i===Bank.last[key]); Bank.last[key]=i; return list[i]; }

/* ---------- Lecture ---------- */
const Player={ audio:null, btn:null, token:0 };
function stopAll(){ Player.token++; try{ if(Player.audio){ Player.audio.pause(); Player.audio.src=''; } }catch(e){} try{ if(TTS.ok) speechSynthesis.cancel(); }catch(e){} markBtn(null); }
function markBtn(b){ if(Player.btn) Player.btn.classList.remove('is-playing','is-loading'); Player.btn=b||null; }
function playSrc(src,btn){ return new Promise(res=>{ try{ if(!Player.audio) Player.audio=new Audio(); const a=Player.audio; a.src=src; a.playbackRate=1;
  a.onended=a.onerror=()=>{ if(btn) btn.classList.remove('is-playing'); res(); }; if(btn){ btn.classList.remove('is-loading'); btn.classList.add('is-playing'); }
  const p=a.play(); if(p&&p.catch) p.catch(()=>res()); }catch(e){ res(); } }); }
async function cachedUrl(url){ try{ if('caches' in window){ const c=await caches.open('fls-voix-prof'); const r=await c.match(url); if(r) return URL.createObjectURL(await r.blob()); } }catch(e){} return url; }

/* ---------- Voix naturelle (Piper, dans le navigateur) ---------- */
const NV=[{id:'fr_FR-siwis-medium',nom:'Voix de femme (Siwis)',path:'fr/fr_FR/siwis/medium/',mo:63},{id:'fr_FR-tom-medium',nom:'Voix d’homme (Tom)',path:'fr/fr_FR/tom/medium/',mo:63}];
const Neural={ installed:{}, sessions:{}, ph:null, ort:null, state:{}, busy:Promise.resolve(), mem:new Map(), turn:0 };
function nvBase(){ return (CFG.voixBase||'https://huggingface.co/rhasspy/piper-voices/resolve/main').replace(/\/+$/,'')+'/'; }
function nvUrls(v){ return {model:nvBase()+v.path+v.id+'.onnx',conf:nvBase()+v.path+v.id+'.onnx.json'}; }
function loadScript(src){ return new Promise((ok,ko)=>{ const s=document.createElement('script'); s.src=src; s.onload=ok; s.onerror=()=>ko(new Error('Chargement impossible : '+src)); document.head.appendChild(s); }); }
async function nvCheckInstalled(){ if(!('caches' in window)) return; try{ const c=await caches.open('fls-voix-modeles'); for(const v of NV){ Neural.installed[v.id]=!!(await c.match(nvUrls(v).model)); } }catch(e){} }
function nvEnabled(){ return NV.filter(v=>Neural.installed[v.id]&&(S.nv||[]).includes(v.id)); }
function nvReady(){ return S.moteur!=='appareil' && nvEnabled().length>0; }
async function nvInstall(id,onProg){
  const v=NV.find(x=>x.id===id); const u=nvUrls(v); const c=await caches.open('fls-voix-modeles');
  try{ if(navigator.storage&&navigator.storage.persist) await navigator.storage.persist(); }catch(e){}
  const conf=await fetch(u.conf); if(!conf.ok) throw new Error('Fichier de voix introuvable ('+conf.status+')');
  const confBlob=await conf.blob();
  const r=await fetch(u.model); if(!r.ok||!r.body) throw new Error('Téléchargement impossible ('+r.status+')');
  const total=+(r.headers.get('Content-Length')||0)||v.mo*1048576; const rd=r.body.getReader(); const parts=[]; let got=0;
  for(;;){ const {done,value}=await rd.read(); if(done) break; parts.push(value); got+=value.length; if(onProg) onProg(Math.min(99,Math.round(100*got/total))); }
  await c.put(u.conf,new Response(confBlob,{headers:{'Content-Type':'application/json'}}));
  await c.put(u.model,new Response(new Blob(parts),{headers:{'Content-Type':'application/octet-stream'}}));
  Neural.installed[id]=true; if(!(S.nv||[]).includes(id)){ S.nv=(S.nv||[]).concat(id); saveS(); }
  if(onProg) onProg(100);
}
async function nvRemove(id){ const v=NV.find(x=>x.id===id); const u=nvUrls(v); try{ const c=await caches.open('fls-voix-modeles'); await c.delete(u.model); await c.delete(u.conf); }catch(e){} Neural.installed[id]=false; delete Neural.sessions[id]; S.nv=(S.nv||[]).filter(x=>x!==id); saveS(); Neural.mem.clear(); }
async function nvRuntime(){
  if(Neural.ort&&Neural.ph) return;
  const base=new URL('vendor/',location.href).href;
  if(!window.ort) await loadScript(base+'ort/ort.wasm.min.js');
  if(!window.createPiperPhonemize) await loadScript(base+'piper/piper_phonemize.js');
  const ort=window.ort; ort.env.wasm.wasmPaths=base+'ort/'; ort.env.wasm.numThreads=1; ort.env.wasm.proxy=true; Neural.ort=ort;
  let out=[]; const mod=await window.createPiperPhonemize({print:d=>out.push(d),printErr:()=>{},locateFile:u=>base+'piper/'+u.split('/').pop()});
  Neural.ph=(text,voice)=>{ out=[]; mod.callMain(['-l',voice,'--input',JSON.stringify([{text}]),'--espeak_data','/espeak-ng-data']);
    const ids=[]; out.forEach(line=>{ try{ const j=JSON.parse(line); if(j.phoneme_ids) ids.push(j.phoneme_ids); }catch(e){} }); return ids; };
}
async function nvSession(id){
  if(Neural.sessions[id]) return Neural.sessions[id];
  await nvRuntime(); const v=NV.find(x=>x.id===id), u=nvUrls(v); const c=await caches.open('fls-voix-modeles');
  const cr=await c.match(u.conf), mr=await c.match(u.model); if(!cr||!mr) throw new Error('Voix non installée');
  const cfg=await cr.json(); const session=await Neural.ort.InferenceSession.create(await mr.arrayBuffer(),{executionProviders:['wasm']});
  return (Neural.sessions[id]={cfg,session});
}
function pcm2wav(pcm,rate){ const n=pcm.length, b=new ArrayBuffer(44+n*2), v=new DataView(b); const w=(o,s)=>{for(let i=0;i<s.length;i++) v.setUint8(o+i,s.charCodeAt(i));};
  w(0,'RIFF'); v.setUint32(4,36+n*2,true); w(8,'WAVE'); w(12,'fmt '); v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,1,true); v.setUint32(24,rate,true); v.setUint32(28,rate*2,true); v.setUint16(32,2,true); v.setUint16(34,16,true); w(36,'data'); v.setUint32(40,n*2,true);
  let peak=0; for(let i=0;i<n;i++) peak=Math.max(peak,Math.abs(pcm[i])); const g=peak>0?Math.min(4,0.92/peak):1;
  const fade=Math.min(220,n>>3); for(let i=0;i<n;i++){ let s=pcm[i]*g; if(i<fade) s*=i/fade; if(i>n-fade) s*=(n-i)/fade; v.setInt16(44+i*2,Math.max(-1,Math.min(1,s))*32767,true); }
  return new Blob([b],{type:'audio/wav'}); }
/* une synthèse = la phrase entière, d’un seul tenant, avec une petite variation naturelle */
function nvSynth(text,voiceId){
  const job=Neural.busy.then(async()=>{
    const {cfg,session}=await nvSession(voiceId); const ort=Neural.ort;
    const groups=Neural.ph(ttsPrep(text),(cfg.espeak&&cfg.espeak.voice)||'fr'); if(!groups.length) throw new Error('Phonèmes vides');
    let ids=groups[0]; for(let k=1;k<groups.length;k++){ ids=ids.slice(0,-1).concat(groups[k].slice(1)); }
    const inf=cfg.inference||{}; const r=()=>Math.random();
    const scales=[(inf.noise_scale??0.667)*(0.88+0.24*r()),(inf.length_scale??1)*(1/(S.rate||0.9))*(0.96+0.08*r()),(inf.noise_w??0.8)*(0.85+0.3*r())];
    const feeds={input:new ort.Tensor('int64',BigInt64Array.from(ids.map(BigInt)),[1,ids.length]),input_lengths:new ort.Tensor('int64',BigInt64Array.from([BigInt(ids.length)]),[1]),scales:new ort.Tensor('float32',Float32Array.from(scales),[3])};
    if(cfg.speaker_id_map&&Object.keys(cfg.speaker_id_map).length) feeds.sid=new ort.Tensor('int64',BigInt64Array.from([0n]),[1]);
    const out=await session.run(feeds); const key=Object.keys(out)[0];
    return pcm2wav(out[key].data,(cfg.audio&&cfg.audio.sample_rate)||22050);
  });
  Neural.busy=job.catch(()=>{}); return job;
}
function nvVoiceFor(){ const en=nvEnabled(); if(en.length<2||!S.alterner) return en[0].id; Neural.turn=(Neural.turn+1)%en.length; return en[Neural.turn].id; }
/* garde 2 versions de chaque texte et les fait tourner (pas de monotonie) */
async function nvGet(text){
  const k=vkey(text)+'|'+(S.rate||0.9); let e=Neural.mem.get(k);
  if(!e){ e={urls:[],i:0,pending:null}; Neural.mem.set(k,e); if(Neural.mem.size>300){ const f=Neural.mem.keys().next().value; const old=Neural.mem.get(f); old.urls.forEach(u=>URL.revokeObjectURL(u)); Neural.mem.delete(f); } }
  if(e.urls.length===0){ const b=await nvSynth(text,nvVoiceFor()); e.urls.push(URL.createObjectURL(b)); }
  const url=e.urls[e.i%e.urls.length]; e.i++;
  if(e.urls.length<2&&!e.pending){ e.pending=nvSynth(text,nvVoiceFor()).then(b=>{ e.urls.push(URL.createObjectURL(b)); }).catch(()=>{}).finally(()=>{ e.pending=null; }); }
  return url;
}
function nvPrefetch(texts){ if(!nvReady()) return; texts.filter(Boolean).forEach(t=>{ if(recsFor(t).length) return; const k=vkey(t)+'|'+(S.rate||0.9); if(!Neural.mem.has(k)) nvGet(t).catch(()=>{}); }); }

/* ---------- Voix de l’appareil ---------- */
function rankVoice(v){ let s=0; const n=v.name||''; if(/natural|naturelle|neural|online|premium|enhanced|améliorée|google|siri/i.test(n)) s+=10; if(v.lang==='fr-FR') s+=3; if(/compact|eloquence/i.test(n)) s-=5; return s; }
function sysVoices(){ return TTS.voices.slice().sort((a,b)=>rankVoice(b)-rankVoice(a)); }
let sysTurn=0;
function sysSpeak(text,btn){ return new Promise(res=>{
  if(!TTS.ok){ toast('La voix n’est pas disponible sur cet appareil.'); return res(); }
  try{ speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(ttsPrep(text)); u.lang='fr-FR'; u.rate=S.rate||0.9;
    const vs=sysVoices(); let v=vs.find(x=>x.voiceURI===S.voice);
    if(!v&&vs.length){ const top=vs.filter(x=>rankVoice(x)>=rankVoice(vs[0])-2).slice(0,3); v=S.varier&&top.length>1?top[(sysTurn++)%top.length]:vs[0]; }
    if(v) u.voice=v; u.pitch=S.varier?0.95+Math.random()*0.1:1;
    if(btn){ btn.classList.remove('is-loading'); btn.classList.add('is-playing'); }
    u.onend=u.onerror=()=>{ if(btn) btn.classList.remove('is-playing'); res(); };
    speechSynthesis.speak(u); }catch(e){ res(); } }); }

/* ---------- Point d’entrée unique ---------- */
async function speak(text,btn){
  if(!text) return; stopAll(); const tok=Player.token; markBtn(btn);
  const recs=S.voixProf===false?[]:recsFor(text);
  if(recs.length){ const c=pickVariant(vkey(text),recs); const u=await cachedUrl(clipUrl(c)); if(tok!==Player.token) return; return playSrc(u,btn); }
  if(nvReady()){ if(btn) btn.classList.add('is-loading');
    try{ const url=await nvGet(text); if(tok!==Player.token) return; return playSrc(url,btn); }
    catch(e){ if(btn) btn.classList.remove('is-loading'); console.warn('Voix naturelle', e); } }
  if(tok!==Player.token) return; return sysSpeak(text,btn);
}
async function cacheAllProf(onProg){ const rows=(Bank.rows||[]).concat(S.voixN1===false?[]:Bank.srows||[]).filter(c=>c.actif); const c=await caches.open('fls-voix-prof'); let i=0;
  for(const r of rows){ const u=clipUrl(r); try{ if(!(await c.match(u))){ const res=await fetch(u); if(res.ok) await c.put(u,res); } }catch(e){} i++; if(onProg) onProg(i,rows.length); } }

function canSpeak(){ return TTS.ok||nvReady()||Object.keys(Bank.clips).length>0||Object.keys(Bank.shared).length>0; }

