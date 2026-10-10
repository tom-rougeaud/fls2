/* =====================================================================
   BASE DE DONNÉES — Supabase, appelé directement (aucune bibliothèque).
   Les élèves lisent seulement (voix du professeur, phrases ajoutées).
   Seul le professeur, connecté, peut ajouter, modifier ou supprimer.
   Niveau 2 : tables « fls2_clips » et « fls2_textes », dossier « fls2-voix ».
   Les enregistrements du niveau 1 (tables « fls_… ») sont lus aussi :
   un texte identique déjà enregistré au niveau 1 est réutilisé.
   ===================================================================== */
const CFG=(()=>{ try{ return JSON.parse(document.getElementById('fls-config').textContent); }catch(e){ return {}; } })();
const DB={
  url:(CFG.supabaseUrl||'').replace(/\/+$/,''), key:CFG.supabaseAnonKey||'', bucket:CFG.bucket||'fls2-voix', T:CFG.tables||'fls2',
  share:CFG.partage&&CFG.partage.tables?CFG.partage:null,
  sess:null, online:false, err:'', ready:true,
  ok(){ return !!(this.url&&this.key); },
  isProf(){ return !!(this.sess&&this.sess.access_token); },
  h(auth,extra){ const o={apikey:this.key}; if(auth&&this.sess) o.Authorization='Bearer '+this.sess.access_token; else if(!/^sb_/.test(this.key)) o.Authorization='Bearer '+this.key; return Object.assign(o,extra||{}); },
  async req(path,opt){ opt=opt||{}; const r=await fetch(this.url+path,opt); if(!r.ok){ let t=''; try{ t=await r.text(); }catch(e){} const err=new Error(r.status+' '+t.slice(0,200)); err.status=r.status; err.body=t; throw err; } const t=await r.text(); if(!t) return null; try{ return JSON.parse(t); }catch(e){ return t; } },
  /* ---- connexion du professeur ---- */
  loadSession(){ const s=Store.get('auth',null); if(s&&s.access_token) this.sess=s; },
  saveSession(){ if(this.sess) Store.set('auth',this.sess); else Store.del('auth'); },
  async login(email,pw){
    const j=await this.req('/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:this.key,'Content-Type':'application/json'},body:JSON.stringify({email,password:pw})});
    this.sess={access_token:j.access_token,refresh_token:j.refresh_token,exp:Date.now()+(j.expires_in||3600)*1000,email:(j.user&&j.user.email)||email}; this.saveSession(); return this.sess;
  },
  async refresh(){
    if(!this.sess||!this.sess.refresh_token) throw new Error('Pas de session');
    const j=await this.req('/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:this.key,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:this.sess.refresh_token})});
    this.sess=Object.assign(this.sess,{access_token:j.access_token,refresh_token:j.refresh_token,exp:Date.now()+(j.expires_in||3600)*1000}); this.saveSession();
  },
  async fresh(){ if(this.sess&&this.sess.exp-Date.now()<120000) await this.refresh(); },
  logout(){ this.sess=null; this.saveSession(); },
  /* ---- enregistrements ---- */
  async listClips(){ return this.req(`/rest/v1/${this.T}_clips?select=id,cle,texte,chemin,duree,actif,created_at&order=created_at.asc`,{headers:this.h(false)}); },
  async listShared(){ if(!this.share) return []; const rows=await this.req(`/rest/v1/${this.share.tables}_clips?select=id,cle,texte,chemin,duree,actif&actif=eq.true&order=created_at.asc`,{headers:this.h(false)}); return (rows||[]).map(r=>Object.assign(r,{bucket:this.share.bucket,n1:true})); },
  pub(chemin,bucket){ return `${this.url}/storage/v1/object/public/${bucket||this.bucket}/${chemin.split('/').map(encodeURIComponent).join('/')}`; },
  async addClip(texte,blob,duree){
    await this.fresh(); const cle=vkey(texte); const chemin=`clips/${hashKey(cle)}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}.mp3`;
    await this.req(`/storage/v1/object/${this.bucket}/${chemin}`,{method:'POST',headers:this.h(true,{'Content-Type':blob.type||'audio/mpeg','x-upsert':'true','cache-control':'31536000'}),body:blob});
    const rows=await this.req(`/rest/v1/${this.T}_clips`,{method:'POST',headers:this.h(true,{'Content-Type':'application/json',Prefer:'return=representation'}),body:JSON.stringify({cle,texte,chemin,duree:Math.round(duree*100)/100,actif:true})});
    return rows[0];
  },
  async delClip(c){ await this.fresh();
    await this.req(`/rest/v1/${this.T}_clips?id=eq.${encodeURIComponent(c.id)}`,{method:'DELETE',headers:this.h(true)});
    try{ await this.req(`/storage/v1/object/${this.bucket}/${c.chemin}`,{method:'DELETE',headers:this.h(true)}); }catch(e){} },
  async updClip(id,patch){ await this.fresh(); await this.req(`/rest/v1/${this.T}_clips?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',headers:this.h(true,{'Content-Type':'application/json'}),body:JSON.stringify(patch)}); },
  async setActif(id,on){ return this.updClip(id,{actif:!!on}); },
  /* ---- phrases ajoutées par le professeur (encouragements…) ---- */
  async listTextes(){ return this.req(`/rest/v1/${this.T}_textes?select=id,evenement,texte,actif&order=created_at.asc`,{headers:this.h(false)}); },
  async addTexte(evenement,texte,actif){ await this.fresh(); const r=await this.req(`/rest/v1/${this.T}_textes`,{method:'POST',headers:this.h(true,{'Content-Type':'application/json',Prefer:'return=representation'}),body:JSON.stringify({evenement,texte,actif:actif!==false})}); return r[0]; },
  async updTexte(id,patch){ await this.fresh(); await this.req(`/rest/v1/${this.T}_textes?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',headers:this.h(true,{'Content-Type':'application/json'}),body:JSON.stringify(patch)}); },
  async delTexte(id){ await this.fresh(); await this.req(`/rest/v1/${this.T}_textes?id=eq.${encodeURIComponent(id)}`,{method:'DELETE',headers:this.h(true)}); }
};
function hashKey(s){ let h=0x811c9dc5; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,0x01000193); } return (h>>>0).toString(16).padStart(8,'0'); }
