// Vérifie le contenu fixe : problèmes de brevet, compréhension, illustrations, textes du studio.
const load=require('./load'); const dom=load({noDB:true}); const T=dom.window.__T; let fails=0; const f=m=>{ fails++; console.log('✗',m); };
const strip=s=>String(s).replace(/\{\{([^{}]+)\/([^{}]+)\}\}/g,'$1/$2').replace(/<[^>]+>/g,'');
// 1. réponses des problèmes de brevet acceptées par le correcteur
T.MODS.forEach(m=>{ T.makeBrevetItems(m).forEach(it=>it.qs.forEach(q=>{ let raw;
  if(q.type==='num'||q.type==='frac') raw=strip(T.answerShow(q)).replace(q.type==='frac'?/\s/g:/^$/,''); else if(q.type==='expr') raw=T.answerShow(q); else if(q.type==='qcm') raw=String(q.a); else if(q.type==='vf') raw=q.a?'1':'0'; else return;
  const r=T.checkAnswer(q,raw); if(r.r!=='ok') f(`${it.bid} « ${strip(q.q)} » → ${raw} : ${r.r} ${r.msg||''}`);
  if(q.type!=='ordre'&&!(q.corr||[]).length) f(`${it.bid} sans correction`); if(q.type!=='ordre'&&!q.rep) f(`${it.bid} sans phrase-réponse`); })); });
// 2. compréhension : chaque item se construit et la bonne réponse est possible
T.MODS.forEach(m=>{ const its=T.makeCompItems(m); if(its.length<8) f(`${m.id} : seulement ${its.length} items de compréhension`);
  its.forEach(it=>it.qs.forEach(q=>{ if(q.type==='pickn'){ const nums=q.toks.filter(t=>t.n).map(t=>t.t.replace(/[{}\s\u202f\u00a0]/g,'').replace(/−/g,'-')); q.want.forEach(w=>{ if(!nums.includes(w)) f(`${m.id} donnée introuvable ${w} dans ${nums.join(',')}`); }); }
    if(q.type==='ordre'&&q.tiles.length>16) f(`${m.id} phrase à ordonner trop longue`); })); });
// 3. expressions : écritures équivalentes
const E=[['4x+10','10+4x','red','ok'],['x^2+5x','x²+5x','dev','ok'],['x^2+5x','x(x+5)','dev','mid'],['x^2+5x','5x+x*x','dev','ok'],['2x','x+x','red','mid'],['3x(x+4)','3x²+12x','fact','mid'],['3x(x+4)','3x(4+x)','fact','ok'],['3x(x+4)','x(3x+12)','fact','ok'],['x^2-16','(x-4)(x+4)','dev','mid'],['2x-1','−1+2x','any','ok'],['4x-5','4x−5','any','ok'],['4x-5','4x+5','any','ko'],['x^2-16','x² − 16','dev','ok'],['2x+14','2(x+7)','red','mid']];
E.forEach(([a,inp,form,want])=>{ const r=T.checkAnswer({type:'expr',a,form},inp); if(r.r!==want) f(`expr ${inp} (attendu ${a}, ${form}) → ${r.r}, voulu ${want}`); });
// 4. nombres écrits par l’élève
[['12,5',12.5],['−3',-3],['-3',-3],['1 800',1800],['1\u202f800 €',1800],['28,3 cm²',28.3],['3/4',0.75],['40 %',40],['2x',NaN],['abc',NaN],['7,4',7.4]].forEach(([s,v])=>{ const r=T.parseNum(s); if(!(Number.isNaN(v)?Number.isNaN(r):Math.abs(r-v)<1e-9)) f(`parseNum(${s}) = ${r}, attendu ${v}`); });
// arrondis
const q={type:'num',a:28.2743,arr:1}; if(T.checkAnswer(q,'28,3').r!=='ok') f('arrondi 28,3'); if(T.checkAnswer(q,'28,27').r!=='mid') f('arrondi presque'); if(T.checkAnswer({type:'num',a:7.382,arr:1,strict:true},'7,382').r!=='ko') f('arrondi strict');
if(T.checkAnswer({type:'frac',a:'5/12',irr:true},[10,24]).r!=='mid') f('fraction non simplifiée'); if(T.checkAnswer({type:'frac',a:'5/12',irr:true},[5,12]).r!=='ok') f('fraction ok');
// 5. toutes les illustrations se dessinent sans « ? » de secours
const specs=new Set(); T.WORDS.forEach(w=>specs.add(w.ill+'|'+w.cat)); T.MODS.forEach(m=>{ m.cours.forEach(c=>specs.add(c.ill+'|'+m.cat)); m.brevet.forEach(b=>b.fig&&specs.add(b.fig+'|'+m.cat)); m.methodes.forEach(me=>me.exemple&&me.exemple.ill&&specs.add(me.exemple.ill+'|'+m.cat)); });
specs.forEach(s=>{ const i=s.lastIndexOf('|'); const svg=T.renderIll(s.slice(0,i),s.slice(i+1)); if(/NaN|undefined/.test(svg)) f('illustration NaN '+s); if(/>\?<\/text><\/svg>$/.test(svg)&&svg.length<400) f('illustration inconnue '+s); });
// 6. textes du studio
const st=T.studioItems(); const keys=new Set(); st.forEach(i=>{ if(!i.k) f('texte vide'); if(/\[\[|\*\*|\{\{/.test(i.t)) f('marques dans un texte du studio : '+i.t); });
const byG={}; st.forEach(i=>byG[i.grp]=(byG[i.grp]||0)+1);
console.log('Textes du studio :',st.length,JSON.stringify(byG));
// 7. lecture à voix haute : pas de symbole brut restant
const sample=['(−7) + 4 = −3','2³ = 8','√49 = 7','f(x) = 2x + 1','A(3 ; 2)','10⁻³ = 0,001','BC² = AB² + AC²','{{3/4}} de 20','28,3 cm²','90 km/h','1,5 × 10⁸ km','(d) // (d’)','cos(40°)','x²'];
sample.forEach(s=>{ const t=T.ttsPrep(s); if(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻√{}×÷−]/.test(t)) f(`lecture : ${s} → ${t}`); });
console.log(sample.map(s=>s+' → '+T.ttsPrep(s)).join('\n'));
console.log(fails?`${fails} problèmes`:'Contenu OK'); process.exit(fails?1:0);
