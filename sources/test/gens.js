// Tire chaque générateur de calcul des centaines de fois et vérifie :
// item valide, pas de NaN/undefined, et la réponse affichée est acceptée par le correcteur.
const load=require('./load');
const dom=load({noDB:true}); const T=dom.window.__T; const N=+process.argv[2]||150;
let fails=0, count=0; const bad={};
const strip=s=>String(s).replace(/\{\{([^{}]+)\/([^{}]+)\}\}/g,'$1/$2').replace(/<[^>]+>/g,'');
for(const id of Object.keys(T.GENS)){ for(const d of [1,2,3]){ for(let i=0;i<N;i++){ count++;
  const it=T.makeCalc(id,d); const err=m=>{ fails++; (bad[id]=bad[id]||[]).push(m); };
  if(!it){ err('null'); continue; }
  const txt=JSON.stringify(it); if(/NaN|undefined|Infinity|\bnull\b(?!,"tab"|,"fig")/.test(txt.replace(/"(fig|tab|arr)":null/g,''))) err('NaN/undefined: '+txt.slice(0,300));
  it.qs.forEach(q=>{
    let raw;
    if(q.type==='num'){ raw=strip(T.answerShow(q)); }
    else if(q.type==='frac'){ raw=strip(T.answerShow(q)).replace(/\s/g,''); }
    else if(q.type==='expr'){ raw=T.answerShow(q); }
    else if(q.type==='qcm'){ raw=String(q.a); if(new Set(q.o).size!==q.o.length) err('qcm doublon '+q.o.join(' | ')); }
    else if(q.type==='vf'){ raw=q.a?'1':'0'; }
    const r=T.checkAnswer(q,raw);
    if(r.r!=='ok') err(`réponse refusée [${q.type}] ${strip(q.q)} → « ${raw} » (${r.r} ${r.msg||''})`);
    if(q.type==='num'&&!(q.corr||[]).length) err('pas de correction');
    if(!q.rep) err('pas de phrase-réponse');
  });
}}}
console.log(`${count} items générés, ${fails} problèmes`);
for(const [k,v] of Object.entries(bad)) console.log(k, v.length, '·', v.slice(0,3).join(' || '));
process.exit(fails?1:0);
