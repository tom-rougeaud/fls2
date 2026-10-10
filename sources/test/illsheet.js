// Planche de toutes les illustrations utilisées (contrôle visuel)
const fs=require('fs'), vm=require('vm'), path=require('path');
const S=path.join(__dirname,'../src');
const ctx={console,Math,String,Number,Array,Object,JSON,shuffle:a=>a.slice()}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(S+'/illus.js','utf8')+fs.readFileSync(S+'/illus2.js','utf8')+';this.renderIll=renderIll;',ctx);
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'../dist/data.json'),'utf8'));
const specs=new Map();
data.mots.filter(w=>!w.n1).forEach(w=>specs.set(w.ill+'|'+w.cat,{spec:w.ill,cat:w.cat,lab:w.id}));
data.modules.forEach(m=>{ (m.cours||[]).forEach((c,i)=>c.ill&&specs.set(c.ill+'|'+m.cat,{spec:c.ill,cat:m.cat,lab:m.id+' cours '+(i+1)}));
  (m.methodes||[]).forEach(me=>me.exemple&&me.exemple.ill&&specs.set(me.exemple.ill+'|'+m.cat,{spec:me.exemple.ill,cat:m.cat,lab:m.id+' méthode'}));
  (m.brevet||[]).forEach(p=>p.fig&&specs.set(p.fig+'|'+m.cat,{spec:p.fig,cat:m.cat,lab:p.id})); });
const css=fs.readFileSync(S+'/style.css','utf8').split('/* ---------- Composants')[0];
let html=`<!doctype html><meta charset="utf-8"><style>${css} body{font-family:sans-serif;margin:8px;background:#fff} .g{display:grid;grid-template-columns:repeat(6,1fr);gap:6px} .c{border:1px solid #ccc;border-radius:6px;padding:3px;font-size:10px} .c svg{width:100%;height:auto;background:var(--tt);border-radius:6px} .c-verbe{--cc:var(--c-verbe);--tt:var(--t-verbe)}.c-algebre{--cc:var(--c-algebre);--tt:var(--t-algebre)}.c-nombre{--cc:var(--c-nombre);--tt:var(--t-nombre)}.c-fonction{--cc:var(--c-fonction);--tt:var(--t-fonction)}.c-geometrie{--cc:var(--c-geometrie);--tt:var(--t-geometrie)}.c-mesure{--cc:var(--c-mesure);--tt:var(--t-mesure)}.c-algo{--cc:var(--c-algo);--tt:var(--t-algo)}.c-donnees{--cc:var(--c-donnees);--tt:var(--t-donnees)}</style><div class="g">`;
let n=0, bad=[];
for(const {spec,cat,lab} of specs.values()){ let svg; try{ svg=ctx.renderIll(spec,cat); }catch(e){ svg='ERR '+e.message; }
  if(/>\?<\/text>/.test(svg)&&!/\?/.test(spec)) bad.push(spec);
  if(/NaN|undefined/.test(svg)) bad.push('NaN '+spec);
  html+=`<div class="c c-${cat}">${svg}<div>${lab} · ${spec}</div></div>`; n++; }
html+='</div>';
fs.writeFileSync(process.argv[2]||require('path').join(require('os').tmpdir(),'planche.html'),html);
console.log(n,'illustrations'); if(bad.length) console.log('PROBLÈMES',bad);
