/* =====================================================================
   MOTEUR DE MATHS — réponses numériques, fractions, expressions avec x.
   Générateurs de calculs (« Je calcule ») et problèmes à étapes.
   ===================================================================== */
const MATH={};
/* ---------- Nombres ---------- */
function gcd(a,b){ a=Math.abs(a); b=Math.abs(b); while(b){ [a,b]=[b,a%b]; } return a; }
function lcm(a,b){ return Math.abs(a*b)/gcd(a,b); }
function rnd0(a,b){ let v; do{ v=rnd(a,b); }while(v===0); return v; }
function roundTo(v,d){ const p=10**d; return Math.round((v+Math.sign(v)*1e-12)*p)/p; }
function fx(v,d){ return fmtN(d==null?v:roundTo(v,d)); }        /* nombre affiché à la française */
function par(v){ return v<0?`(${fmtN(v)})`:fmtN(v); }            /* nombre entre parenthèses s’il est négatif */
function frS(n,d){ if(d<0){ n=-n; d=-d; } if(d===1) return fmtN(n); return (n<0?'−':'')+`{{${Math.abs(n)}/${d}}}`; }
function frRed(n,d){ const g=gcd(n,d)||1; let a=n/g, b=d/g; if(b<0){ a=-a; b=-b; } return [a,b]; }
/* Lecture d’un nombre écrit par l’élève : « 28,3 cm² », « −5 », « 3/4 », « 1 800 € » */
function parseNum(s){
  s=String(s||'').replace(/[  \s]/g,'').replace(/[−–—]/g,'-').replace(/,/g,'.').replace(/^\+/,'');
  const m=s.match(/^(-?\d+(?:\.\d+)?|-?\.\d+)(?:\/(-?\d+(?:\.\d+)?))?(.*)$/); if(!m) return NaN;
  const rest=m[3]; if(rest&&!/^(?![a-z]$)(?:[a-zA-Zà-ÿ°²³%€\/.]{1,14})$/i.test(rest)&&!/^[mgshlL]$/.test(rest)) return NaN;
  if(rest&&/^[a-z]$/i.test(rest)&&!/^[mgshl]$/i.test(rest)) return NaN;
  const a=parseFloat(m[1]); if(m[2]!=null){ const b=parseFloat(m[2]); return b?a/b:NaN; } return a; }
function parseFrac(s){ s=String(s||'').replace(/[  \s]/g,'').replace(/[−–—]/g,'-');
  let m=s.match(/^(-?\d+)\/(-?\d+)$/); if(m) return [+m[1],+m[2]]; m=s.match(/^-?\d+$/); if(m) return [+s,1]; return null; }
/* ---------- Expressions littérales : un petit analyseur sûr (une seule lettre) ----------
   Une expression devient un polynôme : tableau des coefficients [c0, c1, c2, …]. */
const P={ add:(a,b)=>{ const r=[]; for(let i=0;i<Math.max(a.length,b.length);i++) r[i]=(a[i]||0)+(b[i]||0); return P.trim(r); },
  neg:a=>a.map(v=>-v), mul:(a,b)=>{ const r=Array(a.length+b.length-1).fill(0); a.forEach((x,i)=>b.forEach((y,j)=>{ r[i+j]+=x*y; })); return P.trim(r); },
  trim:a=>{ a=a.map(v=>Math.abs(v)<1e-12?0:v); while(a.length>1&&a[a.length-1]===0) a.pop(); return a.length?a:[0]; },
  eq:(a,b)=>{ a=P.trim(a); b=P.trim(b); return a.length===b.length&&a.every((v,i)=>Math.abs(v-b[i])<1e-9); },
  pow:(a,n)=>{ let r=[1]; for(let i=0;i<n;i++) r=P.mul(r,a); return r; } };
function exprTokens(s,v){
  s=String(s).replace(/[  \s]/g,'').replace(/[−–—]/g,'-').replace(/[×·*]/g,'*').replace(/÷|:/g,'/').replace(/,/g,'.').replace(/²/g,'^2').replace(/³/g,'^3');
  const t=[]; let i=0;
  while(i<s.length){ const c=s[i];
    if(/[0-9.]/.test(c)){ let j=i; while(j<s.length&&/[0-9.]/.test(s[j])) j++; t.push({k:'n',v:parseFloat(s.slice(i,j))}); i=j; continue; }
    if(/[a-zA-Z]/.test(c)){ if(c.toLowerCase()!==v) throw new Error('lettre'); t.push({k:'x'}); i++; continue; }
    if('+-*/^()'.includes(c)){ t.push({k:c}); i++; continue; }
    throw new Error('signe'); }
  /* multiplication sous-entendue : 3x, 2(x+1), (x+1)(x−2), x(x+1) */
  const o=[]; t.forEach((tk,j)=>{ const p=o[o.length-1]; if(p&&(p.k==='n'||p.k==='x'||p.k===')')&&(tk.k==='x'||tk.k==='('||tk.k==='n'&&p.k!=='n')) o.push({k:'*',imp:true}); o.push(tk); });
  return o; }
function parsePoly(str,v){
  const t=exprTokens(str,v||'x'); let i=0; const peek=()=>t[i], take=()=>t[i++];
  function expr(){ let r=term(); while(peek()&&(peek().k==='+'||peek().k==='-')){ const op=take().k; const b=term(); r=op==='+'?P.add(r,b):P.add(r,P.neg(b)); } return r; }
  function term(){ let r=factor(); while(peek()&&(peek().k==='*'||peek().k==='/')){ const op=take().k; const b=factor(); if(op==='*') r=P.mul(r,b); else { if(b.length!==1||!b[0]) throw new Error('division'); r=r.map(x=>x/b[0]); } } return r; }
  function factor(){ if(peek()&&peek().k==='-'){ take(); return P.neg(factor()); } if(peek()&&peek().k==='+'){ take(); return factor(); } let b=base();
    if(peek()&&peek().k==='^'){ take(); const e=take(); if(!e||e.k!=='n'||e.v>4||e.v<0||e.v%1) throw new Error('puissance'); b=P.pow(b,e.v); } return b; }
  function base(){ const k=take(); if(!k) throw new Error('fin'); if(k.k==='n') return [k.v]; if(k.k==='x') return [0,1]; if(k.k==='('){ const r=expr(); const c=take(); if(!c||c.k!==')') throw new Error('parenthèse'); return r; } throw new Error('inattendu'); }
  const r=expr(); if(i<t.length) throw new Error('reste'); return P.trim(r);
}
/* forme : 'dev' ou 'red' = développée et réduite ; 'fact' = un produit ; 'any' = toute écriture égale */
function exprForm(str,v){
  const t=exprTokens(str,v||'x'); let depth=0, topAdd=0, paren=false, first=true;
  t.forEach((k,j)=>{ if(k.k==='(') { depth++; paren=true; } if(k.k===')') depth--; if(depth===0&&(k.k==='+'||k.k==='-')&&!(j===0)) topAdd++; });
  const terms=[]; let cur=[]; depth=0; t.forEach((k,j)=>{ if(k.k==='(') depth++; if(k.k===')') depth--; if(depth===0&&(k.k==='+'||k.k==='-')&&j>0){ terms.push(cur); cur=[]; } else cur.push(k); }); terms.push(cur);
  const degs=terms.map(tt=>{ try{ const s=tt.map(k=>k.k==='n'?k.v:k.k==='x'?(v||'x'):k.k).join(''); const p=parsePoly(s.replace(/^-/,''),v); return p.length-1; }catch(e){ return -1; } });
  return {paren, topAdd, nTerms:terms.length, dupDeg:new Set(degs).size<degs.length}; }
function checkExpr(input,q){
  const v=q.v||'x'; let pi, pa; try{ pi=parsePoly(input,v); }catch(e){ return {r:'ko',msg:'Je ne comprends pas cette écriture. Écris par exemple : 3x + 2.'}; }
  pa=parsePoly(q.a,v); if(!P.eq(pi,pa)) return {r:'ko'};
  const f=exprForm(input,v);
  if((q.form==='dev'||q.form==='red')&&(f.paren||f.dupDeg)) return {r:'mid',msg:q.form==='dev'?'C’est égal, mais il faut développer et réduire : plus de parenthèses, et un seul terme de chaque sorte.':'C’est égal, mais il faut réduire : regroupe les termes du même type.'};
  if(q.form==='fact'&&(f.topAdd>0||!f.paren)) return {r:'mid',msg:'C’est égal, mais ce n’est pas un produit. Mets le facteur commun devant une parenthèse.'};
  return {r:'ok'}; }
function prettyExpr(s){ return String(s).replace(/\^2/g,'²').replace(/\^3/g,'³').replace(/\*/g,' × ').replace(/(\S)([+-])/g,'$1 $2 ').replace(/-/g,'−').replace(/\s+/g,' ').trim(); }
/* écriture d’un polynôme ax + b, ax² + bx + c */
function polyStr(c,v){ v=v||'x'; let out=''; for(let d=c.length-1;d>=0;d--){ const a=c[d]; if(!a) continue; const abs=Math.abs(a); const m=d===0?fmtN(abs):(abs===1?'':fmtN(abs))+v+(d===2?'²':d===3?'³':''); out+=out?(a<0?' − ':' + ')+m:(a<0?'−':'')+m; } return out||'0'; }
function lin(a,b,v){ return polyStr([b,a],v); }

/* ---------- Vérification d’une réponse ---------- */
function checkAnswer(q,raw){
  if(q.type==='num'){ const v=parseNum(raw); if(isNaN(v)) return {r:'ko',msg:'Écris un nombre (par exemple 12,5 ou −3).',bad:true};
    if(q.arr!=null){ const e=roundTo(q.a,q.arr); if(Math.abs(v-e)<1e-9*Math.max(1,Math.abs(e))) return {r:'ok'};
      if(!q.strict&&Math.abs(v-q.a)<0.5*10**-q.arr&&Math.abs(v-e)>1e-9) return {r:'mid',msg:`Presque ! Il faut arrondir ${q.arr===0?'à l’unité':q.arr===1?'au dixième':q.arr===2?'au centième':'au millième'} : ${fx(e)}.`};
      return {r:'ko'}; }
    const tol=Math.max(q.tol||0,1e-9*Math.max(1,Math.abs(q.a))); return {r:Math.abs(v-q.a)<=tol?'ok':'ko'}; }
  if(q.type==='frac'){ const [an,ad]=String(q.a).split('/').map(Number); const f=Array.isArray(raw)?raw:parseFrac(raw);
    if(!f||!f[1]) { const v=parseNum(Array.isArray(raw)?raw.join('/'):raw); if(!isNaN(v)&&Math.abs(v-an/(ad||1))<1e-9) return {r:'mid',msg:'C’est la bonne valeur. Écris-la sous forme de fraction.'}; return {r:'ko',msg:f?'':'Écris une fraction : le numérateur en haut, le dénominateur en bas.',bad:!f}; }
    if(Math.abs(f[0]*(ad||1)-an*f[1])>1e-9) return {r:'ko'};
    if(q.irr&&gcd(f[0],f[1])!==1) return {r:'mid',msg:'C’est égal, mais tu peux encore simplifier la fraction.'};
    return {r:'ok'}; }
  if(q.type==='expr') return checkExpr(raw,q);
  if(q.type==='qcm') return {r:+raw===q.a?'ok':'ko'};
  if(q.type==='vf') return {r:(raw==='1')===!!q.a?'ok':'ko'};
  if(q.type==='txt') return {r:check(raw,q.a)!=='ko'&&check(raw,q.a)!=='near'?'ok':'ko'};
  if(q.type==='pick'||q.type==='pickn'||q.type==='ordre') return {r:raw==='1'?'ok':'ko'};
  return {r:'ko'}; }
function answerShow(q){
  if(q.type==='num') return fx(q.arr!=null?roundTo(q.a,q.arr):q.a)+(q.unit?' '+q.unit:'');
  if(q.type==='frac'){ const [n,d]=String(q.a).split('/').map(Number); return d?frS(n,d):fmtN(n); }
  if(q.type==='expr') return prettyExpr(q.a);
  if(q.type==='qcm') return q.o[q.a];
  if(q.type==='vf') return q.a?'Vrai':'Faux';
  if(q.type==='pick') return q.s[q.a];
  if(q.type==='pickn') return q.toks.filter(t=>t.n&&q.want.includes(normTok(t.t))).map(t=>t.t).filter((v,i,a)=>a.indexOf(v)===i).join(' et ');
  if(q.type==='ordre') return q.rep;
  return [].concat(q.a)[0]; }

/* ---------- Figures dessinées à la demande ---------- */
const FIG={
  right(o){ /* triangle rectangle en A ; o.ab, o.ac, o.bc : textes ; o.ang : angle en B */
    const A=[36,112],Bp=[176,112],Cp=[36,26], n=o.n||['A','B','C']; let s=poly([A,Bp,Cp],PAPER,INK,3)+rAngle(36,112,1,0,0,-1,12,INK)+tx(26,124,n[0],13,INK,900)+tx(186,124,n[1],13,INK,900)+tx(26,24,n[2],13,INK,900);
    if(o.ang) s+=arcA(176,112,26,Math.PI-31.6*Math.PI/180,Math.PI,ORANGE,2.5,'#FFE2C8')+tx(140,104,o.ang,12,ORANGE,900,'end');
    if(o.ab) s+=tx(106,130,o.ab,13,BLUE,900); if(o.ac) s+=tx(30,72,o.ac,13,RED,900,'end'); if(o.bc) s+=tx(114,62,o.bc,13,'var(--c-geometrie)',900,'start');
    return SV(s); },
  tri(o){ const A=[30,118],Bp=[176,118],Cp=[110,26]; let s=poly([A,Bp,Cp],PAPER,INK,3)+tx(20,128,o.n[0],13,INK,900)+tx(186,128,o.n[1],13,INK,900)+tx(110,18,o.n[2],13,INK,900);
    [[A,o.a[0],[52,110]],[Bp,o.a[1],[150,110]],[Cp,o.a[2],[110,52]]].forEach(([P,l,[x,y]])=>{ if(l) s+=tx(x,y,l,13,l==='?'?ORANGE:'var(--c-geometrie)',900); });
    if(o.iso) s+=tick(...A,...Cp,1,INK)+tick(...Bp,...Cp,1,INK);
    return SV(s); },
  thales(o){ const A=[100,14],Bp=[30,124],Cp=[176,124],M=[68.5,63.5],N=[134.2,63.5]; let s=poly([A,Bp,Cp],PAPER,INK,3)+ln(...M,...N,'var(--c-geometrie)',3.5)+tx(100,10,'A',13,INK,900)+tx(22,134,'B',13,INK,900)+tx(184,134,'C',13,INK,900)+tx(58,62,'M',13,INK,900)+tx(144,62,'N',13,INK,900);
    if(o.am) s+=tx(76,40,o.am,11,BLUE,900,'end'); if(o.ab) s+=tx(56,96,o.ab,11,BLUE,900,'end'); if(o.mn) s+=tx(101,58,o.mn,11,'var(--c-geometrie)',900); if(o.bc) s+=tx(103,138,o.bc,11,'var(--c-geometrie)',900);
    return SV(s); },
  pave(l,w,h){ return SV(poly([[30,112],[124,112],[124,52],[30,52]],'var(--t-mesure)',INK,2.5)+poly([[124,112],[166,82],[166,22],[124,52]],'#E9ECF5',INK,2.5)+poly([[30,52],[72,22],[166,22],[124,52]],'#FFFFFF',INK,2.5)+tx(77,128,l,12,INK,900)+tx(152,106,w,12,INK,900,'start')+tx(24,86,h,12,INK,900,'end')); },
  alt(v){ const th=Math.atan2(60,40); return SV(ln(8,40,192,40,INK,3)+ln(8,100,192,100,INK,3)+ln(60,130,140,10,INK,3)+tx(188,32,'(d)',11,INK,800,'end')+tx(188,92,'(d’)',11,INK,800,'end')+arcA(80,100,22,0,th,'var(--c-geometrie)',2.5,'var(--t-geometrie)')+tx(110,94,v,12,'var(--c-geometrie)',900,'start')+arcA(120,40,22,Math.PI,Math.PI+th,ORANGE,2.5,'#FFE2C8')+tx(92,56,'?',14,ORANGE,900,'end')); },
  script(blocks,w){ const st=stack(8,8,blocks); return SVh(st.svg,st.h+16,w||250); },
  serie(vals){ return SV(boxes(vals,50,null,'var(--c-donnees)','var(--t-donnees)',Math.min(30,180/vals.length-4))); },
  urne(r,b,g){ return SV(urn(40,20,120,104,shuffle([...Array(r).fill(RED),...Array(b).fill(BLUE),...Array(g||0).fill(GREEN)]))); }
};

/* ---------- Un item de calcul : un énoncé, une ou plusieurs questions ---------- */
function item(gen,ctx,qs,extra){ return Object.assign({type:'prob',gen,ctx:[].concat(ctx||[]),qs:[].concat(qs)},extra||{}); }
function qN(q,a,o){ return Object.assign({q,type:'num',a},o||{}); }
function qC(q,opts,o){ const sh=shuffle(opts.map((t,i)=>({t,i}))); return Object.assign({q,type:'qcm',o:sh.map(x=>x.t),a:sh.findIndex(x=>x.i===0)},o||{}); }
function qV(q,a,o){ return Object.assign({q,type:'vf',a},o||{}); }
function qF(q,n,d,o){ const [a,b]=frRed(n,d); return Object.assign({q,type:'frac',a:`${a}/${b}`,irr:true},o||{}); }
function qE(q,a,form,o){ return Object.assign({q,type:'expr',a,form},o||{}); }
const ROUND_TXT={0:'à l’unité',1:'au dixième',2:'au centième'};

const GENS={
/* ===== 1. Consignes ===== */
'arrondi':d=>{ const k=d===1?0:d===2?1:2; const v=rnd(1000,99999)/1000; const e=roundTo(v,k); const digits=String(v.toFixed(3)).replace('.',',');
  return item('arrondi',[],qN(`**Arrondis** ${digits} ${ROUND_TXT[k]}.`,v,{arr:k,strict:true,aide:[k===0?'À l’unité : aucun chiffre après la virgule.':`${ROUND_TXT[k][0].toUpperCase()+ROUND_TXT[k].slice(1)} : je garde ${k} chiffre${k>1?'s':''} après la virgule.`,'Je regarde le chiffre juste après : 5 ou plus, j’ajoute 1.'],
    corr:[`Chiffre suivant : ${String(v.toFixed(3)).replace('.','')[String(Math.floor(v)).length+k]}`,`${digits} ≈ ${fx(e)}`],rep:`${digits} arrondi ${ROUND_TXT[k]} est ${fx(e)}.`})); },
'vexacte':d=>{ const c=pick(['racine','tiers','pi']);
  if(c==='racine'){ const n=pick([2,3,5,6,7,10,11]); const v=Math.sqrt(n); return item('vexacte',[`On calcule la racine carrée de ${n}.`],qC('Quelle réponse est la valeur exacte ?',[`√${n}`,fx(v,2),fx(v,1)],{aide:['Une valeur exacte n’est pas arrondie.'],corr:[`√${n} ≈ ${fx(v,2)} : c’est une valeur approchée.`],rep:`La valeur exacte est √${n}.`})); }
  if(c==='tiers'){ const n=pick([1,2]), q=pick([3,7,9]); return item('vexacte',[`On calcule ${n} ÷ ${q}.`],qC('Quelle réponse est la valeur exacte ?',[`{{${n}/${q}}}`,fx(n/q,2),fx(n/q,1)],{aide:['La division ne tombe pas juste : la fraction est exacte.'],corr:[`${n} ÷ ${q} ≈ ${fx(n/q,3)}…`],rep:`La valeur exacte est {{${n}/${q}}}.`})); }
  const r=pick([2,3,4,5]); return item('vexacte',[`L’aire d’un disque de rayon ${r} cm est π × ${r}².`],qC('Quelle réponse est la valeur exacte ?',[`${r*r}π cm²`,fx(Math.PI*r*r,1)+' cm²',fx(Math.PI*r*r,0)+' cm²'],{aide:['Une valeur exacte garde le nombre π.'],corr:[`π × ${r}² = ${r*r}π`],rep:`La valeur exacte est ${r*r}π cm².`})); },
'consigne':d=>{ const V=[['Calcule','Je fais le calcul et j’écris le résultat.'],['Justifie','J’explique pourquoi, avec un calcul ou une propriété.'],['Démontre','J’écris les étapes : je sais que, or, donc.'],['En déduire','J’utilise la réponse d’avant.'],['Détermine','Je trouve la réponse.'],['Arrondis au dixième','Je garde un chiffre après la virgule.'],['Exprime en fonction de x','J’écris un calcul avec la lettre x.'],['Conjecture','Je propose une règle en regardant des exemples.'],['Vérifie','Je regarde encore pour être sûr que c’est juste.']];
  const i=rnd(0,V.length-1); const oth=sample(V.filter((_,j)=>j!==i),2).map(x=>x[1]);
  return item('consigne',[`« **${V[i][0]}** … »`],qC('Que dois-je faire ?',[V[i][1],...oth],{corr:[`${V[i][0]} : ${V[i][1]}`],rep:V[i][1]})); },

/* ===== 2. Relatifs ===== */
'rel-add':d=>{ const R=d===1?9:d===2?20:60; const a=rnd0(-R,R), b=rnd0(-R,R); const r=a+b; const same=Math.sign(a)===Math.sign(b);
  return item('rel-add',[],qN(`**Calcule** ${par(a)} + ${par(b)}.`,r,{aide:[same?'Les deux nombres ont le même signe : j’additionne les distances à zéro.':'Les signes sont différents : je soustrais les distances à zéro.','Je garde le signe du nombre le plus loin de zéro.'],
    corr:[same?`${Math.abs(a)} + ${Math.abs(b)} = ${Math.abs(r)}`:`${Math.max(Math.abs(a),Math.abs(b))} − ${Math.min(Math.abs(a),Math.abs(b))} = ${Math.abs(r)}`,`${par(a)} + ${par(b)} = ${fmtN(r)}`],rep:`${par(a)} + ${par(b)} = ${fmtN(r)}`,fig:null})); },
'rel-sub':d=>{ const R=d===1?9:d===2?20:60; const a=rnd0(-R,R), b=rnd0(-R,R); const r=a-b;
  return item('rel-sub',[],qN(`**Calcule** ${fmtN(a)} − ${par(b)}.`,r,{aide:['Soustraire un nombre, c’est additionner son opposé.',`${fmtN(a)} − ${par(b)} = ${fmtN(a)} + ${par(-b)}`],corr:[`${fmtN(a)} − ${par(b)} = ${fmtN(a)} + ${par(-b)}`,`= ${fmtN(r)}`],rep:`${fmtN(a)} − ${par(b)} = ${fmtN(r)}`})); },
'rel-mul':d=>{ if(d===3){ const a=rnd0(-6,6),b=rnd0(-5,5),c=rnd0(-4,4); const r=a*b*c, neg=[a,b,c].filter(x=>x<0).length;
    return item('rel-mul',[],qN(`**Calcule** ${par(a)} × ${par(b)} × ${par(c)}.`,r,{aide:['Je compte les nombres négatifs.','Pair : résultat positif. Impair : résultat négatif.'],corr:[`${neg} nombre${neg>1?'s':''} négatif${neg>1?'s':''} : résultat ${r<0?'négatif':'positif'}`,`${Math.abs(a)} × ${Math.abs(b)} × ${Math.abs(c)} = ${Math.abs(r)}`,`= ${fmtN(r)}`],rep:`Le produit est ${fmtN(r)}.`})); }
  const div=Math.random()<0.4; const a=rnd0(-9,9), b=rnd0(-9,9);
  if(div){ const p=a*b; return item('rel-mul',[],qN(`**Calcule** ${par(p)} ÷ ${par(b)}.`,a,{aide:['Même signe : positif. Signes différents : négatif.'],corr:[`${Math.abs(p)} ÷ ${Math.abs(b)} = ${Math.abs(a)}`,`Signe : ${a<0?'−':'+'}`,`${par(p)} ÷ ${par(b)} = ${fmtN(a)}`],rep:`${par(p)} ÷ ${par(b)} = ${fmtN(a)}`})); }
  return item('rel-mul',[],qN(`**Calcule** ${par(a)} × ${par(b)}.`,a*b,{aide:['J’utilise la règle des signes.'],corr:[`${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(a*b)}`,`Signe : ${a*b<0?'−':'+'}`,`${par(a)} × ${par(b)} = ${fmtN(a*b)}`],rep:`${par(a)} × ${par(b)} = ${fmtN(a*b)}`})); },
'rel-comp':d=>{ let a,b; do{ a=rnd(-15,8); b=rnd(-15,8); }while(a===b||(d===1&&a>0&&b>0)); const s=a<b?'<':'>';
  return item('rel-comp',[`On compare ${fmtN(a)} et ${fmtN(b)}.`],qC(`Quel signe faut-il écrire : ${fmtN(a)} … ${fmtN(b)} ?`,[s,s==='<'?'>':'<','='],{aide:['Sur la droite graduée, le plus grand nombre est à droite.'],corr:[`${fmtN(a)} ${s} ${fmtN(b)}`],rep:`${fmtN(a)} ${s} ${fmtN(b)}`})); },
'rel-prio':d=>{ const a=rnd(-9,12), b=rnd(2,6), c=rnd0(-8,8); const op=pick(['+','−']); const p=b*c; const r=op==='+'?a+p:a-p;
  return item('rel-prio',[],qN(`**Calcule** A = ${fmtN(a)} ${op} ${b} × ${par(c)}.`,r,{aide:['Je fais d’abord la multiplication.',`${b} × ${par(c)} = ${fmtN(p)}`],corr:[`A = ${fmtN(a)} ${op} ${par(p)}`,`A = ${fmtN(r)}`],rep:`A = ${fmtN(r)}`})); },

/* ===== 3. Fractions ===== */
'fr-simp':d=>{ let p,q; do{ p=rnd(1,9); q=rnd(2,12); }while(gcd(p,q)!==1||p===q); const k=d===1?rnd(2,3):d===2?rnd(4,7):rnd(8,15);
  return item('fr-simp',[],qF(`**Simplifie** la fraction {{${p*k}/${q*k}}}. **Donne** une fraction irréductible.`,p,q,{aide:[`${p*k} et ${q*k} sont dans la table de ${k}.`],corr:[`${p*k} = ${k} × ${p} et ${q*k} = ${k} × ${q}`,`{{${p*k}/${q*k}}} = {{${p}/${q}}}`],rep:`{{${p*k}/${q*k}}} = {{${p}/${q}}}`})); },
'fr-add':d=>{ const sub=d>1&&Math.random()<0.4; let a,b,c,e;
  if(d===1){ b=e=rnd(3,11); a=rnd(1,b-1); c=rnd(1,b-1); }
  else if(d===2){ b=rnd(2,6); e=b*rnd(2,3); a=rnd(1,b-1); c=rnd(1,e-1); }
  else { do{ b=rnd(2,7); e=rnd(2,7); }while(b===e||gcd(b,e)!==1); a=rnd(1,b-1); c=rnd(1,e-1); }
  if(sub&&a/b<c/e){ [a,b,c,e]=[c,e,a,b]; } const L=lcm(b,e); const n=sub?a*L/b-c*L/e:a*L/b+c*L/e; const op=sub?'−':'+';
  return item('fr-add',[],qF(`**Calcule** {{${a}/${b}}} ${op} {{${c}/${e}}}. **Donne** une fraction irréductible.`,n,L,{aide:b===e?['Les dénominateurs sont égaux : je garde le dénominateur.']:[`Je mets les deux fractions sur ${L}.`],corr:[b===e?`{{${a}/${b}}} ${op} {{${c}/${e}}} = {{${n}/${L}}}`:`{{${a*L/b}/${L}}} ${op} {{${c*L/e}/${L}}} = {{${n}/${L}}}`,...(gcd(n,L)>1?[`= ${frS(...frRed(n,L))}`]:[])],rep:`Le résultat est ${frS(...frRed(n,L))}.`})); },
'fr-mul':d=>{ const a=rnd(1,7),b=rnd(2,9),c=rnd(1,7),e=rnd(2,9);
  return item('fr-mul',[],qF(`**Calcule** {{${a}/${b}}} × {{${c}/${e}}}. **Donne** une fraction irréductible.`,a*c,b*e,{aide:['Je multiplie les numérateurs, puis les dénominateurs.'],corr:[`{{${a} × ${c}/${b} × ${e}}} = {{${a*c}/${b*e}}}`,...(gcd(a*c,b*e)>1?[`= ${frS(...frRed(a*c,b*e))}`]:[])],rep:`Le résultat est ${frS(...frRed(a*c,b*e))}.`})); },
'fr-div':d=>{ const a=rnd(1,7),b=rnd(2,9),c=rnd(1,7),e=rnd(2,9);
  return item('fr-div',[],qF(`**Calcule** {{${a}/${b}}} ÷ {{${c}/${e}}}. **Donne** une fraction irréductible.`,a*e,b*c,{aide:[`Diviser par {{${c}/${e}}}, c’est multiplier par son inverse {{${e}/${c}}}.`],corr:[`{{${a}/${b}}} × {{${e}/${c}}} = {{${a*e}/${b*c}}}`,...(gcd(a*e,b*c)>1?[`= ${frS(...frRed(a*e,b*c))}`]:[])],rep:`Le résultat est ${frS(...frRed(a*e,b*c))}.`})); },
'fr-qte':d=>{ const den=pick([2,3,4,5,8,10]), num=rnd(1,den-1); const per=d===1?rnd(2,9):rnd(5,40); const tot=den*per; const les=num===1?'le':'les'; const ctxs=[['élèves',`Dans un collège de ${tot} élèves, ${les} {{${num}/${den}}} ${num===1?'vient':'viennent'} en bus.`,'Combien d’élèves viennent en bus ?','élèves viennent en bus'],['€',`Un vélo coûte ${tot} €. On paie ${les} {{${num}/${den}}} du prix à la commande.`,'Combien paie-t-on à la commande ?','€ à la commande'],['km',`Un trajet fait ${tot} km. On a fait ${les} {{${num}/${den}}} du trajet.`,'Quelle distance a-t-on faite ?','km parcourus']];
  const [u,cx,qq,end]=pick(ctxs); return item('fr-qte',[cx],qN(qq,num*per,{unit:u==='élèves'?'élèves':u,aide:[num===1?`Je divise ${tot} par ${den}.`:`Je divise ${tot} par ${den}, puis je multiplie par ${num}.`],corr:[`${tot} ÷ ${den} = ${per}`,...(num===1?[]:[`${per} × ${num} = ${num*per}`])],rep:`${num*per} ${end}.`})); },

/* ===== 4. Puissances ===== */
'pw-calc':d=>{ const c=d===1?pick([[2,3],[3,2],[5,2],[4,2],[10,3]]):d===2?pick([[2,5],[3,3],[2,4],[4,3],[6,2]]):pick([[-2,3],[-3,2],[-1,5],[-2,4],[2,6]]); const [a,n]=c; const r=a**n;
  return item('pw-calc',[],qN(`**Calcule** ${par(a)}${'⁰¹²³⁴⁵⁶'[n]}.`,r,{aide:[`J’écris ${n} fois le nombre ${par(a)}.`],corr:[`${Array(n).fill(par(a)).join(' × ')} = ${fmtN(r)}`],rep:`${par(a)}${'⁰¹²³⁴⁵⁶'[n]} = ${fmtN(r)}`})); },
'pw-10':d=>{ const sup=n=>String(n).split('').map(c=>c==='-'?'⁻':'⁰¹²³⁴⁵⁶⁷⁸⁹'[+c]).join(''); if(d===1){ const n=rnd(2,6); return item('pw-10',[],qN(`**Écris** 10${sup(n)} en écriture décimale.`,10**n,{aide:[`Un 1 suivi de ${n} zéros.`],corr:[`10${sup(n)} = ${fmtN(10**n)}`],rep:`10${sup(n)} = ${fmtN(10**n)}`})); }
  if(d===2){ const n=rnd(1,4); const v=roundTo(10**-n,n); return item('pw-10',[],qN(`**Écris** 10${sup(-n)} en écriture décimale.`,v,{aide:[`Le chiffre 1 est au rang ${n} après la virgule.`],corr:[`10${sup(-n)} = ${fx(v)}`],rep:`10${sup(-n)} = ${fx(v)}`})); }
  const a=rnd(12,95)/10, n=rnd(-3,4)||2; const v=roundTo(a*10**n,6); return item('pw-10',[],qN(`**Calcule** ${fx(a)} × 10${sup(n)}.`,v,{aide:[n>0?`Je décale la virgule de ${n} rang${n>1?'s':''} vers la droite.`:`Je décale la virgule de ${-n} rang${n<-1?'s':''} vers la gauche.`],corr:[`${fx(a)} × 10${sup(n)} = ${fx(v)}`],rep:`${fx(a)} × 10${sup(n)} = ${fx(v)}`})); },
'pw-sci':d=>{ const sup=n=>String(n).split('').map(c=>c==='-'?'⁻':'⁰¹²³⁴⁵⁶⁷⁸⁹'[+c]).join(''); const m=rnd(11,99)/10; const n=d===3?-rnd(2,5):rnd(3,7); const v=roundTo(m*10**n,8);
  const good=`${fx(m)} × 10${sup(n)}`; const o=[good,`${fx(roundTo(m*10,2))} × 10${sup(n-1)}`,`${fx(m)} × 10${sup(n+(n>0?-1:1))}`];
  return item('pw-sci',[`On veut écrire ${fx(v)} en notation scientifique.`],qC('Quelle est son écriture scientifique ?',o,{aide:['Un seul chiffre avant la virgule, et ce chiffre n’est pas 0.'],corr:[`${fx(v)} = ${good}`],rep:`${fx(v)} = ${good}`})); },
'pw-racine':d=>{ if(d<3){ const r=d===1?rnd(2,10):rnd(11,15); return item('pw-racine',[],qN(`**Calcule** √${r*r}.`,r,{aide:[`Je cherche un nombre qui, multiplié par lui-même, donne ${r*r}.`],corr:[`${r} × ${r} = ${r*r}`,`√${r*r} = ${r}`],rep:`√${r*r} = ${r}`})); }
  let n; do{ n=rnd(10,99); }while(Number.isInteger(Math.sqrt(n))); const v=Math.sqrt(n); return item('pw-racine',[],qN(`**Donne** une valeur approchée de √${n}, arrondie au dixième.`,v,{arr:1,aide:['J’utilise la touche √ de la calculatrice.'],corr:[`√${n} ≈ ${fx(v,3)}`,`≈ ${fx(v,1)}`],rep:`√${n} ≈ ${fx(v,1)}`})); },
'pw-prio':d=>{ const a=rnd(2,5), b=rnd(2,6), c=rnd(1,9); const t=pick(['mul','add']); const r=t==='mul'?a*b*b:c+b*b;
  return item('pw-prio',[],qN(t==='mul'?`**Calcule** ${a} × ${b}².`:`**Calcule** ${c} + ${b}².`,r,{aide:['Je calcule d’abord la puissance.'],corr:[`${b}² = ${b*b}`,t==='mul'?`${a} × ${b*b} = ${r}`:`${c} + ${b*b} = ${r}`],rep:`Le résultat est ${r}.`})); },

/* ===== 5. Arithmétique ===== */
'ar-div':d=>{ const k=pick([3,4,6,7,8,9]); const yes=Math.random()<0.5; const n=yes?k*rnd(6,25):k*rnd(6,25)+rnd(1,k-1); const q=Math.floor(n/k), r=n%k;
  return item('ar-div',[],qV(`Le nombre ${n} est divisible par ${k}.`,yes,{aide:[`Je calcule ${n} ÷ ${k}.`],corr:[yes?`${n} = ${k} × ${q}`:`${n} = ${k} × ${q} + ${r}`,yes?'Le reste est 0.':`Le reste est ${r}.`],rep:yes?`${n} est divisible par ${k} car ${n} = ${k} × ${q}.`:`${n} n’est pas divisible par ${k} : le reste est ${r}.`})); },
'ar-crit':d=>{ const k=pick([2,3,5,9,10]); const n=rnd(100,9999); const ds=String(n).split('').map(Number), s=ds.reduce((a,b)=>a+b,0); const yes=n%k===0;
  const why=k===2?`${n} finit par ${n%10}.`:k===5?`${n} finit par ${n%10}.`:k===10?`${n} finit par ${n%10}.`:`${ds.join(' + ')} = ${s}${s%k===0?`, dans la table de ${k}`:`, pas dans la table de ${k}`}.`;
  return item('ar-crit',[],qV(`Le nombre ${fmtN(n)} est divisible par ${k}.`,yes,{aide:[k===3||k===9?`J’additionne les chiffres de ${fmtN(n)}.`:'Je regarde le dernier chiffre.'],corr:[why],rep:`${fmtN(n)} ${yes?'est':'n’est pas'} divisible par ${k}.`})); },
'ar-prem':d=>{ const P=[11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97]; const C=[21,27,33,39,49,51,57,63,69,77,81,87,91,93]; const yes=Math.random()<0.5; const n=yes?pick(P):pick(C);
  let f=0; for(let k=2;k<n;k++) if(n%k===0){ f=k; break; }
  return item('ar-prem',[],qV(`Le nombre ${n} est un nombre premier.`,yes,{aide:['Je teste les divisions par 2, 3, 5, 7…'],corr:[yes?`${n} n’est divisible ni par 2, ni par 3, ni par 5, ni par 7.`:`${n} = ${f} × ${n/f}`],rep:yes?`${n} est premier : il a seulement deux diviseurs, 1 et ${n}.`:`${n} n’est pas premier car ${n} = ${f} × ${n/f}.`})); },
'ar-decomp':d=>{ const L=[[12,'2² × 3',['2 × 6','3 × 4']],[18,'2 × 3²',['2 × 9','3 × 6']],[20,'2² × 5',['4 × 5','2 × 10']],[28,'2² × 7',['4 × 7','2 × 14']],[30,'2 × 3 × 5',['5 × 6','3 × 10']],[36,'2² × 3²',['4 × 9','6²']],[45,'3² × 5',['9 × 5','3 × 15']],[60,'2² × 3 × 5',['4 × 15','6 × 10']],[72,'2³ × 3²',['8 × 9','2 × 36']],[84,'2² × 3 × 7',['4 × 21','12 × 7']],[90,'2 × 3² × 5',['9 × 10','3 × 30']],[100,'2² × 5²',['10²','4 × 25']],[126,'2 × 3² × 7',['2 × 63','14 × 9']],[150,'2 × 3 × 5²',['6 × 25','15 × 10']]];
  const [n,g,b]=pick(d===1?L.slice(0,6):d===2?L.slice(3,11):L.slice(6));
  return item('ar-decomp',[],qC(`Quelle est la décomposition de ${n} en produit de facteurs premiers ?`,[g,...b],{aide:['Tous les facteurs doivent être des nombres premiers : 2, 3, 5, 7…'],corr:[`${n} = ${g}`],rep:`${n} = ${g}`})); },
'ar-eucl':d=>{ const b=rnd(3,12), q=rnd(3,d===1?9:30), r=rnd(1,b-1); const a=b*q+r; const ask=pick(['q','r']);
  return item('ar-eucl',[`On fait la division euclidienne de ${a} par ${b}.`],qN(ask==='q'?'Quel est le quotient ?':'Quel est le reste ?',ask==='q'?q:r,{aide:[`Je cherche le plus grand multiple de ${b} qui ne dépasse pas ${a}.`],corr:[`${b} × ${q} = ${b*q}`,`${a} − ${b*q} = ${r}`,`${a} = ${b} × ${q} + ${r}`],rep:`Le quotient est ${q} et le reste est ${r}.`})); },

/* ===== 6. Calcul littéral ===== */
'lit-val':d=>{ const a=rnd0(-6,6), b=rnd(-9,9), v=d===1?rnd(1,6):rnd0(-5,5); const sq=d===3; const r=sq?a*v*v+b:a*v+b; const e=sq?polyStr([b,0,a]):lin(a,b);
  return item('lit-val',[`On donne A = ${e}.`],qN(`**Calcule** A pour x = ${fmtN(v)}.`,r,{aide:[`Je remplace x par ${par(v)}.`],corr:[sq?`A = ${fmtN(a)} × ${par(v)}² ${b<0?'−':'+'} ${Math.abs(b)}`:`A = ${fmtN(a)} × ${par(v)} ${b<0?'−':'+'} ${Math.abs(b)}`,`A = ${fmtN(r)}`],rep:`Pour x = ${fmtN(v)}, A = ${fmtN(r)}.`})); },
'lit-red':d=>{ const a=rnd0(-6,8), b=rnd(-9,9), c=rnd0(-6,8), e=rnd(-9,9); const sq=d===3?rnd0(-3,4):0;
  let terms=[[a,1],[b,0],[c,1],[e,0]]; if(sq) terms.push([sq,2]); terms=d===1?terms:shuffle(terms); const str=terms.filter(t=>t[0]).map((t,i)=>{ const m=t[1]===0?fmtN(Math.abs(t[0])):(Math.abs(t[0])===1?'':fmtN(Math.abs(t[0])))+(t[1]===2?'x²':'x'); return i===0?(t[0]<0?'−':'')+m:(t[0]<0?' − ':' + ')+m; }).join('');
  const res=polyStr([b+e,a+c,sq]); return item('lit-red',[`On donne B = ${str}.`],qE('**Réduis** B.',res.replace(/²/g,'^2').replace(/−/g,'-'),'red',{aide:['Je regroupe les termes en x, puis les nombres.'],corr:[`B = ${res}`],rep:`B = ${res}`})); },
'lit-dev':d=>{ const k=d===1?rnd(2,9):rnd0(-9,9), a=d===3?rnd(2,5):1, b=rnd0(-9,9); const res=polyStr([k*b,k*a]);
  return item('lit-dev',[],qE(`**Développe** et **réduis** ${fmtN(k)}(${lin(a,b)}).`,res.replace(/−/g,'-'),'dev',{aide:[`Je multiplie ${par(k)} par chaque terme de la parenthèse.`],corr:[`${par(k)} × ${a===1?'x':a+'x'} ${b<0?'+':'+'} ${par(k)} × ${par(b)}`,`= ${res}`],rep:`${fmtN(k)}(${lin(a,b)}) = ${res}`})); },
'lit-dbl':d=>{ const a=rnd0(-7,7), b=rnd0(-7,7); const id=d===3&&Math.random()<0.5; const B2=id?-a:b; const res=polyStr([a*B2,a+B2,1]);
  return item('lit-dbl',[],qE(`**Développe** et **réduis** (${lin(1,a)})(${lin(1,B2)}).`,res.replace(/²/g,'^2').replace(/−/g,'-'),'dev',{aide:['Je multiplie chaque terme de la première parenthèse par chaque terme de la deuxième.'],corr:[`x × x ${B2<0?'−':'+'} x × ${Math.abs(B2)} ${a<0?'−':'+'} ${Math.abs(a)} × x ${a*B2<0?'−':'+'} ${Math.abs(a)} × ${Math.abs(B2)}`,`= ${res}`],rep:`(${lin(1,a)})(${lin(1,B2)}) = ${res}`})); },
'lit-fact':d=>{ const k=rnd(2,9), b=rnd0(-9,9); if(d===3){ const res=`${k}x(x ${b<0?'−':'+'} ${Math.abs(b)})`; const e=polyStr([0,k*b,k]); return item('lit-fact',[],qE(`**Factorise** ${e}.`,`${k}x(x${b<0?'-':'+'}${Math.abs(b)})`,'fact',{aide:[`${k}x est commun aux deux termes.`],corr:[`${e} = ${k}x × x ${b<0?'−':'+'} ${k}x × ${Math.abs(b)}`,`= ${res}`],rep:`${e} = ${res}`})); }
  const e=polyStr([k*b,k]); const res=`${k}(x ${b<0?'−':'+'} ${Math.abs(b)})`;
  return item('lit-fact',[],qE(`**Factorise** ${e}.`,`${k}(x${b<0?'-':'+'}${Math.abs(b)})`,'fact',{aide:[`${k} est un facteur commun.`],corr:[`${e} = ${k} × x ${b<0?'−':'+'} ${k} × ${Math.abs(b)}`,`= ${res}`],rep:`${e} = ${res}`})); },

/* ===== 7. Équations ===== */
'eq-test':d=>{ const a=rnd(2,7), s=rnd(-5,8), b=rnd(-9,9), c=a*s+b; const t=Math.random()<0.5?s:s+pick([-1,1,2]); const v=a*t+b;
  return item('eq-test',[`On teste x = ${fmtN(t)} dans l’équation ${lin(a,b)} = ${fmtN(c)}.`],qV(`${fmtN(t)} est une solution de l’équation.`,v===c,{aide:[`Je calcule ${a} × ${par(t)} ${b<0?'−':'+'} ${Math.abs(b)}.`],corr:[`${a} × ${par(t)} ${b<0?'−':'+'} ${Math.abs(b)} = ${fmtN(v)}`,v===c?`${fmtN(v)} = ${fmtN(c)}`:`${fmtN(v)} ≠ ${fmtN(c)}`],rep:v===c?`${fmtN(t)} est solution de l’équation.`:`${fmtN(t)} n’est pas solution de l’équation.`})); },
'eq-1':d=>{ const a=d===1?rnd(2,6):rnd0(-7,9), s=d===1?rnd(1,9):rnd(-8,9), b=rnd0(-12,12); const c=a*s+b;
  return item('eq-1',[],qN(`**Résous** l’équation ${lin(a,b)} = ${fmtN(c)}.`,s,{aide:[b>0?`J’enlève ${fmtN(b)} aux deux membres.`:`J’ajoute ${fmtN(-b)} aux deux membres.`,...(a===1?[]:[`Je divise par ${par(a)}.`])],corr:[`${a===1?'':a===-1?'−':fmtN(a)}x = ${fmtN(c)} ${b<0?'+':'−'} ${Math.abs(b)} = ${fmtN(c-b)}`,...(a===1?[]:[`x = ${fmtN(c-b)} ÷ ${par(a)} = ${fmtN(s)}`])],rep:`La solution de l’équation est ${fmtN(s)}.`})); },
'eq-2':d=>{ /* corrigé pas à pas, sans « − 0x » ni « − (0) » */
  const eq2Corr=(a,b,c,e,s)=>{ const k=a-c, st=[]; if(c!==0) st.push(`${lin(k,b)} = ${fmtN(e)}`); if(b!==0) st.push(`${lin(k,0)} = ${fmtN(e-b)}`); if(k!==1) st.push(`x = ${fmtN(e-b)} ÷ ${par(k)}`); st.push(`x = ${fmtN(s)}`); return st; };
  let a,c; do{ a=rnd(2,9); c=rnd(-5,8); }while(a===c); const s=rnd(-6,9), b=rnd(-10,10), e=a*s+b-c*s;
  return item('eq-2',[],qN(`**Résous** l’équation ${lin(a,b)} = ${lin(c,e)}.`,s,{aide:['Je mets les x à gauche et les nombres à droite.'],corr:eq2Corr(a,b,c,e,s),rep:`La solution est ${fmtN(s)}.`})); },
'eq-mise':d=>{ const m=rnd(2,6), p=rnd(1,15), s=rnd(2,15), r=m*s+p;
  return item('eq-mise',[`Je pense à un nombre. Je le multiplie par ${m}, puis j’ajoute ${p}. J’obtiens ${r}.`],[qC('Quelle équation traduit ce problème ?',[`${m}x + ${p} = ${r}`,`${m}(x + ${p}) = ${r}`,`x + ${m} + ${p} = ${r}`],{aide:[`Le nombre est x. Multiplier par ${m} : ${m}x.`],corr:[`${m}x + ${p} = ${r}`],rep:`L’équation est ${m}x + ${p} = ${r}.`}),
    qN('**Résous** l’équation. Quel est le nombre ?',s,{aide:[`${m}x = ${r} − ${p}`],corr:[`${m}x = ${r-p}`,`x = ${r-p} ÷ ${m} = ${s}`],rep:`Le nombre est ${s}.`})]); },
'eq-prod':d=>{ const a=rnd(-7,7), b=rnd(-7,7); if(a===-b) return GENS['eq-prod'](d); const str=`(x ${a<0?'+':'−'} ${Math.abs(a)})(x ${b<0?'−':'+'} ${Math.abs(b)}) = 0`.replace('x + 0','x').replace('x − 0','x');
  return item('eq-prod',[`On veut résoudre ${str}.`],qC('Quelles sont les solutions ?',[`${fmtN(a)} et ${fmtN(-b)}`,`${fmtN(-a)} et ${fmtN(b)}`,`${fmtN(a)} et ${fmtN(b)}`],{aide:['Un produit est nul si un des facteurs est nul.'],corr:[`x ${a<0?'+':'−'} ${Math.abs(a)} = 0 donc x = ${fmtN(a)}`,`x ${b<0?'−':'+'} ${Math.abs(b)} = 0 donc x = ${fmtN(-b)}`],rep:`Les solutions sont ${fmtN(a)} et ${fmtN(-b)}.`})); },

/* ===== 8. Proportionnalité ===== */
'pr-tab':d=>{ const k=pick([2,3,4,5,1.5,2.5]); const xs=sample([1,2,3,4,5,6,8,10],3).sort((a,b)=>a-b); const yes=Math.random()<0.5; const ys=xs.map(x=>roundTo(x*k,2)); if(!yes) ys[2]=roundTo(ys[2]+pick([1,2,-1]),2);
  return item('pr-tab',['Voici un tableau.'],qV('Ce tableau est un tableau de proportionnalité.',yes,{tab:[['Masse (kg)',...xs.map(x=>fmtN(x))],['Prix (€)',...ys.map(y=>fx(y))]],aide:['Je divise chaque prix par la masse.'],corr:xs.map((x,i)=>`${fx(ys[i])} ÷ ${fmtN(x)} = ${fx(roundTo(ys[i]/x,3))}`),rep:yes?'Oui : on multiplie toujours par le même nombre.':'Non : les quotients ne sont pas tous égaux.'})); },
'pr-4e':d=>{ const a=rnd(2,8), pu=d===1?rnd(2,6):rnd(12,60)/10, c=rnd(2,15); if(c===a) return GENS['pr-4e'](d); const b=roundTo(a*pu,2), r=roundTo(c*pu,2);
  return item('pr-4e',[`${a} kg de pommes coûtent ${fx(b)} €. Le prix est proportionnel à la masse.`],qN(`**Calcule** le prix de ${c} kg de pommes.`,r,{unit:'€',aide:['Je fais un tableau, puis un produit en croix.',`x = ${fx(b)} × ${c} ÷ ${a}`],corr:[`${fx(b)} × ${c} ÷ ${a} = ${fx(r)}`],rep:`${c} kg de pommes coûtent ${fx(r)} €.`})); },
'pr-pct':d=>{ if(Math.random()<0.5||d===1){ const t=pick([10,20,25,50,15,30,5,75]), n=pick([40,60,80,120,200,300,24,36]); const r=roundTo(n*t/100,2);
    return item('pr-pct',[],qN(`**Calcule** ${t} % de ${n}.`,r,{aide:[`Je multiplie par ${t}, puis je divise par 100.`],corr:[`${n} × ${t} ÷ 100 = ${fx(r)}`],rep:`${t} % de ${n} = ${fx(r)}`})); }
  const tot=pick([20,25,40,50]), p=rnd(1,tot-1); const r=roundTo(p/tot*100,2);
  return item('pr-pct',[`Dans un club de ${tot} élèves, ${p} élèves sont des filles.`],qN('**Calcule** le pourcentage de filles.',r,{unit:'%',aide:['Je divise la partie par le total, puis je multiplie par 100.'],corr:[`${p} ÷ ${tot} × 100 = ${fx(r)}`],rep:`Il y a ${fx(r)} % de filles.`})); },
'pr-evol':d=>{ const up=Math.random()<0.4, t=pick([10,20,25,30,40,15,5]), p=pick([20,40,50,60,80,120,150,200,250]); const k=1+(up?t:-t)/100, r=roundTo(p*k,2);
  return item('pr-evol',[`Un article coûte ${p} €. Son prix ${up?'augmente':'baisse'} de ${t} %.`],qN('**Calcule** le nouveau prix.',r,{unit:'€',aide:[`Je multiplie par ${fx(roundTo(k,2))}.`],corr:[`1 ${up?'+':'−'} ${fx(t/100)} = ${fx(roundTo(k,2))}`,`${p} × ${fx(roundTo(k,2))} = ${fx(r)}`],rep:`Le nouveau prix est ${fx(r)} €.`})); },
'pr-vit':d=>{ const c=pick(d===1?['v','d']:['v','d','t']); const v=pick([40,50,60,72,80,90,100,120]); const tm=d===1?rnd(1,4):pick([0.5,1.5,2.5,1.25,0.75,3]); const dist=roundTo(v*tm,2);
  const dur=h=>{ const H=Math.floor(h), M=Math.round((h-H)*60); return ((H?`${H} h`:'')+(M?` ${M} min`:'')).trim(); };
  const conv=tm=>Number.isInteger(tm)?[]:[`${dur(tm)} = ${fx(tm)} h`];
  if(c==='v') return item('pr-vit',[`Une voiture parcourt ${fx(dist)} km en ${dur(tm)}.`],qN('**Calcule** sa vitesse moyenne en km/h.',v,{unit:'km/h',aide:[...conv(tm),'v = d ÷ t'],corr:[...conv(tm),`${fx(dist)} ÷ ${fx(tm)} = ${v}`],rep:`La vitesse moyenne est ${v} km/h.`}));
  if(c==='d') return item('pr-vit',[`Un car roule à ${v} km/h pendant ${dur(tm)}.`],qN('**Calcule** la distance parcourue.',dist,{unit:'km',aide:[...conv(tm),'d = v × t'],corr:[...conv(tm),`${v} × ${fx(tm)} = ${fx(dist)}`],rep:`Le car parcourt ${fx(dist)} km.`}));
  return item('pr-vit',[`Un train doit parcourir ${fx(dist)} km à ${v} km/h.`],qN('**Calcule** la durée du trajet, en heures.',tm,{unit:'h',aide:['t = d ÷ v'],corr:[`${fx(dist)} ÷ ${v} = ${fx(tm)} h`,...(Number.isInteger(tm)?[]:[`${fx(tm)} h = ${dur(tm)}`])],rep:`Le trajet dure ${dur(tm)}.`})); },
'pr-ech':d=>{ const E=pick([50,100,200,1000,25000,100000]); const L=rnd(2,15); const real=L*E; const conv=real>=100000?[real/100000,'km']:real>=100?[real/100,'m']:[real,'cm'];
  return item('pr-ech',[`Un plan est à l’échelle {{1/${fmtN(E)}}}. Sur le plan, une longueur mesure ${L} cm.`],qN(`**Calcule** la longueur réelle, en ${conv[1]}.`,conv[0],{unit:conv[1],aide:[`1 cm sur le plan représente ${fmtN(E)} cm en vrai.`],corr:[`${L} × ${fmtN(E)} = ${fmtN(real)} cm`,`${fmtN(real)} cm = ${fx(conv[0])} ${conv[1]}`],rep:`La longueur réelle est ${fx(conv[0])} ${conv[1]}.`})); },

/* ===== 9. Statistiques ===== */
'st-moy':d=>{ const n=d===1?4:d===2?5:7; let v; do{ v=Array.from({length:n},()=>rnd(5,20)); }while(d<3&&v.reduce((a,b)=>a+b,0)%n); const s=v.reduce((a,b)=>a+b,0), m=s/n;
  return item('st-moy',['Voici une série de notes : '+v.join(' ; ')+'.'],qN(d<3?'**Calcule** la moyenne.':'**Calcule** la moyenne. **Arrondis** au dixième.',m,{arr:d<3?null:1,aide:[`J’additionne les ${n} notes.`,`Je divise par ${n}.`],corr:[`${v.join(' + ')} = ${s}`,`${s} ÷ ${n} = ${fx(m,2)}`],rep:`La moyenne est ${fx(roundTo(m,1))}.`})); },
'st-med':d=>{ const n=d===1?5:d===2?pick([7,6]):pick([8,9,10]); const v=Array.from({length:n},()=>rnd(1,30)); const s=v.slice().sort((a,b)=>a-b); const med=n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2;
  return item('st-med',['Voici une série : '+v.join(' ; ')+'.'],qN('**Détermine** la médiane de cette série.',med,{aide:['Je range les valeurs dans l’ordre croissant.',n%2?`Il y a ${n} valeurs : la médiane est la ${(n+1)/2}ᵉ.`:`Il y a ${n} valeurs : je prends la moyenne de la ${n/2}ᵉ et de la ${n/2+1}ᵉ.`],corr:[s.join(' ; '),n%2?`La médiane est ${med}.`:`(${s[n/2-1]} + ${s[n/2]}) ÷ 2 = ${fx(med)}`],rep:`La médiane est ${fx(med)}.`})); },
'st-etendue':d=>{ const v=Array.from({length:rnd(5,8)},()=>d===3?rnd(-10,30):rnd(1,50)); const mx=Math.max(...v), mn=Math.min(...v);
  return item('st-etendue',['Voici une série : '+v.map(x=>fmtN(x)).join(' ; ')+'.'],qN('**Calcule** l’étendue de cette série.',mx-mn,{aide:['La plus grande valeur moins la plus petite.'],corr:[`${fmtN(mx)} − ${par(mn)} = ${mx-mn}`],rep:`L’étendue est ${mx-mn}.`})); },
'st-freq':d=>{ const tot=pick([20,25,40,50,30,24]), e=rnd(2,tot-2); const f=e/tot*100; const ar=Number.isInteger(roundTo(f,6))?null:0;
  return item('st-freq',[`Dans un groupe de ${tot} élèves, ${e} élèves font du football.`],qN(`**Calcule** la fréquence des élèves qui font du football, en pourcentage${ar===0?'. **Arrondis** à l’unité':''}.`,f,{arr:ar,unit:'%',aide:['Fréquence = effectif ÷ effectif total.','Je multiplie par 100.'],corr:[`${e} ÷ ${tot} = ${fx(e/tot,3)}`,`× 100 = ${fx(f,1)} %`],rep:`${fx(roundTo(f,ar==null?2:0))} % des élèves font du football.`})); },
'st-moyp':d=>{ const vals=sample([8,9,10,11,12,13,14,15,16],3).sort((a,b)=>a-b), eff=vals.map(()=>rnd(1,8)); const N=eff.reduce((a,b)=>a+b,0), S=vals.reduce((a,v,i)=>a+v*eff[i],0), m=S/N; const ar=Number.isInteger(roundTo(m*10,6))?null:1;
  return item('st-moyp',['Voici les notes d’une classe.'],qN(`**Calcule** la note moyenne${ar?'. **Arrondis** au dixième':''}.`,m,{arr:ar,tab:[['Note',...vals.map(String)],['Effectif',...eff.map(String)]],aide:['Je multiplie chaque note par son effectif.',`Je divise par l’effectif total : ${N}.`],corr:[vals.map((v,i)=>`${v} × ${eff[i]}`).join(' + ')+` = ${S}`,`${S} ÷ ${N} ≈ ${fx(m,2)}`],rep:`La note moyenne est ${fx(roundTo(m,1))}.`})); },

/* ===== 10. Probabilités ===== */
'pb-de':d=>{ const E=[['obtenir 6',[6]],['obtenir un nombre pair',[2,4,6]],['obtenir un nombre impair',[1,3,5]],['obtenir un multiple de 3',[3,6]],['obtenir un nombre plus grand que 4',[5,6]],['obtenir un nombre plus petit que 3',[1,2]],['obtenir 1 ou 2',[1,2]],['obtenir un diviseur de 6',[1,2,3,6]]];
  const [t,iss]=pick(E); return item('pb-de',['On lance un dé équilibré à 6 faces.'],qF(`**Calcule** la probabilité de l’événement « ${t} ».`,iss.length,6,{aide:['Il y a 6 issues.',`Les issues favorables : ${iss.join(', ')}.`],corr:[`${iss.length} issue${iss.length>1?'s':''} favorable${iss.length>1?'s':''} sur 6`,`P = {{${iss.length}/6}}${gcd(iss.length,6)>1?' = '+frS(...frRed(iss.length,6)):''}`],rep:`La probabilité est ${frS(...frRed(iss.length,6))}.`})); },
'pb-urne':d=>{ const r=rnd(1,8), b=rnd(1,8), g=d===1?0:rnd(1,6); const tot=r+b+g; const c=pick(g?[['rouge',r],['bleue',b],['verte',g]]:[['rouge',r],['bleue',b]]);
  return item('pb-urne',[`Une urne contient ${r} boule${r>1?'s':''} rouge${r>1?'s':''}${g?', ':' et '}${b} boule${b>1?'s':''} bleue${b>1?'s':''}${g?` et ${g} boule${g>1?'s':''} verte${g>1?'s':''}`:''}. On tire une boule au hasard.`],qF(`**Calcule** la probabilité de tirer une boule ${c[0]}.`,c[1],tot,{fig:FIG.urne(r,b,g),aide:[`Il y a ${tot} boules en tout.`],corr:[`P = {{${c[1]}/${tot}}}${gcd(c[1],tot)>1?' = '+frS(...frRed(c[1],tot)):''}`],rep:`La probabilité de tirer une boule ${c[0]} est ${frS(...frRed(c[1],tot))}.`})); },
'pb-contr':d=>{ const p=rnd(5,95)/100; return item('pb-contr',[`La probabilité qu’il pleuve demain est ${fx(p)}.`],qN('**Calcule** la probabilité qu’il ne pleuve pas.',roundTo(1-p,2),{aide:['Ne pas pleuvoir est l’événement contraire.','P(contraire) = 1 − P'],corr:[`1 − ${fx(p)} = ${fx(roundTo(1-p,2))}`],rep:`La probabilité qu’il ne pleuve pas est ${fx(roundTo(1-p,2))}.`})); },
'pb-roue':d=>{ const n=pick([6,8,10,12]), k=rnd(1,n-1); return item('pb-roue',[`Une roue a ${n} secteurs identiques. ${k} secteur${k>1?'s sont':' est'} gagnant${k>1?'s':''}.`],qF('**Calcule** la probabilité de gagner.',k,n,{fig:proba('roue',n,k,0,'var(--c-donnees)','var(--t-donnees)'),aide:[`${k} secteurs gagnants sur ${n}.`],corr:[`P = {{${k}/${n}}}${gcd(k,n)>1?' = '+frS(...frRed(k,n)):''}`],rep:`La probabilité de gagner est ${frS(...frRed(k,n))}.`})); },
'pb-cert':d=>{ const E=[['On lance un dé à 6 faces. Obtenir 8.','impossible'],['On lance un dé à 6 faces. Obtenir un nombre plus petit que 7.','certain'],['On lance un dé à 6 faces. Obtenir 5.','ni certain, ni impossible'],['Dans une urne de boules rouges, tirer une boule rouge.','certain'],['Dans une urne de boules rouges, tirer une boule verte.','impossible'],['On lance une pièce. Obtenir pile.','ni certain, ni impossible'],['On tire une carte dans un jeu de 32 cartes. Tirer un as.','ni certain, ni impossible']];
  const [t,a]=pick(E); const o=['certain','impossible','ni certain, ni impossible']; return item('pb-cert',[t],qC('Cet événement est :',[a,...o.filter(x=>x!==a)],{aide:['Certain : arrive toujours. Impossible : n’arrive jamais.'],corr:[`L’événement est ${a}.`],rep:`Cet événement est ${a}.`})); },

/* ===== 11. Fonctions ===== */
'fn-img':d=>{ const a=rnd0(-5,6), b=rnd(-9,9), v=d===1?rnd(0,6):rnd(-6,6); const sq=d===3; const r=sq?a*v*v+b:a*v+b; const e=sq?polyStr([b,0,a]):lin(a,b);
  return item('fn-img',[`Soit la fonction f(x) = ${e}.`],qN(`**Calcule** l’image de ${fmtN(v)} par f.`,r,{aide:[`Je remplace x par ${par(v)}.`],corr:[sq?`f(${fmtN(v)}) = ${fmtN(a)} × ${par(v)}² ${b<0?'−':'+'} ${Math.abs(b)}`:`f(${fmtN(v)}) = ${fmtN(a)} × ${par(v)} ${b<0?'−':'+'} ${Math.abs(b)}`,`f(${fmtN(v)}) = ${fmtN(r)}`],rep:`L’image de ${fmtN(v)} par f est ${fmtN(r)}.`})); },
'fn-ant':d=>{ const a=d===1?rnd(2,5):rnd0(-5,6), s=rnd(-6,8), b=rnd(-9,9); const y=a*s+b;
  return item('fn-ant',[`Soit la fonction f(x) = ${lin(a,b)}.`],qN(`**Détermine** l’antécédent de ${fmtN(y)} par f.`,s,{aide:[`Je résous l’équation ${lin(a,b)} = ${fmtN(y)}.`],corr:[`${lin(a,b)} = ${fmtN(y)}`,`${a===1?'':a===-1?'−':fmtN(a)}x = ${fmtN(y-b)}`,`x = ${fmtN(s)}`],rep:`L’antécédent de ${fmtN(y)} par f est ${fmtN(s)}.`})); },
'fn-coord':d=>{ const x=rnd(0,5), y=rnd(0,4); const c=pick(['abs','ord']);
  return item('fn-coord',['Regarde le point A dans le repère.'],qN(c==='abs'?'Quelle est l’abscisse du point A ?':'Quelle est l’ordonnée du point A ?',c==='abs'?x:y,{fig:renderIll(`rep:pt|${x}|${y}`,'fonction').replace(/A\(\d+ ; \d+\)/,'A'),aide:[c==='abs'?'L’abscisse se lit sur l’axe horizontal.':'L’ordonnée se lit sur l’axe vertical.'],corr:[`A(${x} ; ${y})`],rep:`${c==='abs'?'L’abscisse':'L’ordonnée'} de A est ${c==='abs'?x:y}.`})); },
'fn-ab':d=>{ const a=rnd0(-6,6), b=rnd(-9,9); const c=pick(d===1?['a','b']:['a','b','nat']); const e=lin(a,b);
  if(c==='nat') return item('fn-ab',[`Soit la fonction f(x) = ${e}.`],qC('La fonction f est :',b?['affine (pas linéaire)','linéaire','ni linéaire, ni affine']:['linéaire (et affine)','affine, mais pas linéaire','ni linéaire, ni affine'],{aide:['Linéaire : f(x) = ax. Affine : f(x) = ax + b.'],corr:[`a = ${fmtN(a)} et b = ${fmtN(b)}`],rep:b?'f est une fonction affine.':'f est une fonction linéaire.'}));
  return item('fn-ab',[`Soit la fonction affine f(x) = ${e}.`],qN(c==='a'?'Quel est le coefficient directeur ?':'Quelle est l’ordonnée à l’origine ?',c==='a'?a:b,{aide:['f(x) = ax + b : a est le coefficient directeur, b est l’ordonnée à l’origine.'],corr:[`a = ${fmtN(a)} et b = ${fmtN(b)}`],rep:c==='a'?`Le coefficient directeur est ${fmtN(a)}.`:`L’ordonnée à l’origine est ${fmtN(b)}.`})); },
'fn-lect':d=>{ const [a,b]=pick([[2,-1],[1,1],[2,1],[-1,4],[1,2],[-2,6],[1,-2],[3,-2]]); const xs=[-1,0,1,2,3,4].filter(x=>a*x+b>=-3&&a*x+b<=7); const x=pick(xs.filter(v=>v!==0)), y=a*x+b; const ant=Math.random()<0.4&&d>1;
  return item('fn-lect',['La droite représente une fonction g.'],qN(ant?`**Lis** l’antécédent de ${fmtN(y)} par g.`:`**Lis** l’image de ${fmtN(x)} par g.`,ant?x:y,{fig:renderIll(`rep:graph|${a}|${b}`,'fonction'),aide:[ant?`Je pars de ${fmtN(y)} sur l’axe des ordonnées.`:`Je pars de ${fmtN(x)} sur l’axe des abscisses.`],corr:[`g(${fmtN(x)}) = ${fmtN(y)}`],rep:ant?`L’antécédent de ${fmtN(y)} par g est ${fmtN(x)}.`:`L’image de ${fmtN(x)} par g est ${fmtN(y)}.`})); },

/* ===== 12. Aires et volumes ===== */
'av-aire':d=>{ const c=pick(d===1?['rect','carre']:['rect','tri','disque']);
  if(c==='rect'||c==='carre'){ const L=rnd(3,15), l=c==='carre'?L:rnd(2,L); return item('av-aire',[c==='carre'?`Un carré a des côtés de ${L} cm.`:`Un rectangle mesure ${L} cm de long et ${l} cm de large.`],qN('**Calcule** son aire.',L*l,{unit:'cm²',aide:[c==='carre'?'Aire = côté × côté':'Aire = longueur × largeur'],corr:[`${L} × ${l} = ${L*l}`],rep:`L’aire est ${L*l} cm².`})); }
  if(c==='tri'){ const b=rnd(3,14), h=rnd(2,12); return item('av-aire',[`Un triangle a une base de ${b} cm et une hauteur de ${h} cm.`],qN('**Calcule** son aire.',b*h/2,{unit:'cm²',fig:renderIll('aire:tri','mesure'),aide:['Aire = base × hauteur ÷ 2'],corr:[`${b} × ${h} ÷ 2 = ${fx(b*h/2)}`],rep:`L’aire du triangle est ${fx(b*h/2)} cm².`})); }
  const r=rnd(2,10); return item('av-aire',[`Un disque a un rayon de ${r} cm.`],qN('**Calcule** son aire. **Arrondis** au dixième.',Math.PI*r*r,{arr:1,unit:'cm²',fig:renderIll(`sol:disque|${r}`,'mesure'),aide:['Aire = π × r × r'],corr:[`π × ${r}² = ${r*r}π`,`≈ ${fx(Math.PI*r*r,1)}`],rep:`L’aire est environ ${fx(Math.PI*r*r,1)} cm².`})); },
'av-cercle':d=>{ const diam=Math.random()<0.4; const r=rnd(2,15); const P=2*Math.PI*r;
  return item('av-cercle',[diam?`Un cercle a un diamètre de ${2*r} cm.`:`Un cercle a un rayon de ${r} cm.`],qN('**Calcule** son périmètre. **Arrondis** au dixième.',P,{arr:1,unit:'cm',aide:[diam?'Périmètre = π × diamètre':'Périmètre = 2 × π × rayon'],corr:[diam?`π × ${2*r} ≈ ${fx(P,2)}`:`2 × π × ${r} ≈ ${fx(P,2)}`,`≈ ${fx(P,1)}`],rep:`Le périmètre est environ ${fx(P,1)} cm.`})); },
'av-vol':d=>{ const c=pick(d===1?['pave','cube']:d===2?['pave','cylindre','pyramide']:['cylindre','cone','boule','pyramide']);
  if(c==='pave'||c==='cube'){ const L=rnd(2,12), l=c==='cube'?L:rnd(2,10), h=c==='cube'?L:rnd(2,10); return item('av-vol',[c==='cube'?`Un cube a des arêtes de ${L} cm.`:`Un pavé droit mesure ${L} cm de long, ${l} cm de large et ${h} cm de haut.`],qN('**Calcule** son volume.',L*l*h,{unit:'cm³',fig:c==='pave'?FIG.pave(L+' cm',l+' cm',h+' cm'):null,aide:['V = longueur × largeur × hauteur'],corr:[`${L} × ${l} × ${h} = ${L*l*h}`],rep:`Le volume est ${L*l*h} cm³.`})); }
  if(c==='pyramide'){ const a=rnd(2,10), h=rnd(3,12); const V=a*a*h/3; return item('av-vol',[`Une pyramide a une base carrée de ${a} cm de côté et une hauteur de ${h} cm.`],qN(`**Calcule** son volume${Number.isInteger(V)?'':'. **Arrondis** au dixième'}.`,V,{arr:Number.isInteger(V)?null:1,unit:'cm³',fig:renderIll('sol:pyramide','geometrie'),aide:['V = aire de la base × hauteur ÷ 3'],corr:[`${a} × ${a} × ${h} ÷ 3 ≈ ${fx(V,2)}`],rep:`Le volume est ${Number.isInteger(V)?'':'environ '}${fx(roundTo(V,1))} cm³.`})); }
  const r=rnd(2,8), h=rnd(3,15); const V=c==='cylindre'?Math.PI*r*r*h:c==='cone'?Math.PI*r*r*h/3:4/3*Math.PI*r**3; const f={cylindre:'V = π × r² × h',cone:'V = π × r² × h ÷ 3',boule:'V = {{4/3}} × π × r³'}[c];
  return item('av-vol',[c==='boule'?`Une boule a un rayon de ${r} cm.`:`Un ${c==='cone'?'cône':'cylindre'} a un rayon de ${r} cm et une hauteur de ${h} cm.`],qN('**Calcule** son volume. **Arrondis** à l’unité.',V,{arr:0,unit:'cm³',fig:c==='cylindre'?renderIll(`sol:cylindre|${r}|${h}`,'mesure'):renderIll(`sol:${c}`,'geometrie'),aide:[f],corr:[`${f}`,`V ≈ ${fx(V,2)}`,`V ≈ ${fx(roundTo(V,0))}`],rep:`Le volume est environ ${fx(roundTo(V,0))} cm³.`})); },
'av-conv':d=>{ const C=[()=>{ const v=rnd(1,9)*500; return [`${fmtN(v)} cm³`,'L',v/1000,`${fmtN(v)} ÷ 1 000 = ${fx(v/1000)}`]; },()=>{ const v=rnd(2,40); return [`${v} m³`,'L',v*1000,`${v} × 1 000 = ${fmtN(v*1000)}`]; },()=>{ const v=rnd(2,90)/10; return [`${fx(v)} L`,'cm³',roundTo(v*1000,3),`${fx(v)} × 1 000 = ${fmtN(roundTo(v*1000,3))}`]; },()=>{ const v=rnd(1,9); return [`${v} m²`,'cm²',v*10000,`${v} × 10 000 = ${fmtN(v*10000)}`]; },()=>{ const v=rnd(2,50)*100; return [`${fmtN(v)} cm²`,'dm²',v/100,`${fmtN(v)} ÷ 100 = ${fx(v/100)}`]; }];
  const [from,to,res,line]=pick(d===1?C.slice(0,3):C)(); return item('av-conv',[],qN(`**Convertis** ${from} en ${to}.`,res,{unit:to,aide:['1 L = 1 dm³ = 1 000 cm³ ; 1 m³ = 1 000 L ; 1 m² = 100 dm² = 10 000 cm²'],corr:[line],rep:`${from} = ${fx(res)} ${to}`})); },
'av-agr':d=>{ const k=pick([2,3,0.5,4,1.5]); const t=pick(d===1?['L']:['A','V','L']); const base=t==='L'?rnd(3,12):t==='A'?rnd(4,20):rnd(5,30); const f=t==='L'?k:t==='A'?k*k:k**3; const r=roundTo(base*f,3); const u=t==='L'?'cm':t==='A'?'cm²':'cm³';
  return item('av-agr',[`On ${k>1?'agrandit':'réduit'} un solide avec le rapport k = ${fx(k)}. ${t==='L'?'Une arête mesure':t==='A'?'Une face a une aire de':'Le volume est de'} ${base} ${u}.`],qN(`**Calcule** ${t==='L'?'la nouvelle longueur de l’arête':t==='A'?'la nouvelle aire de la face':'le nouveau volume'}.`,r,{unit:u,aide:[t==='L'?'Les longueurs sont multipliées par k.':t==='A'?'Les aires sont multipliées par k².':'Les volumes sont multipliés par k³.'],corr:[`${t==='L'?'k':t==='A'?'k²':'k³'} = ${fx(f)}`,`${base} × ${fx(f)} = ${fx(r)}`],rep:`Le résultat est ${fx(r)} ${u}.`})); },

/* ===== 13. Angles ===== */
'an-somme':d=>{ const a=rnd(20,100), b=rnd(20,150-a); const c=180-a-b; return item('an-somme',[`Dans le triangle ABC, l’angle en A mesure ${a}° et l’angle en B mesure ${b}°.`],qN('**Calcule** la mesure de l’angle en C.',c,{unit:'°',fig:FIG.tri({n:['A','B','C'],a:[a+'°',b+'°','?']}),aide:['La somme des angles d’un triangle est 180°.'],corr:[`${a} + ${b} = ${a+b}`,`180 − ${a+b} = ${c}`],rep:`L’angle en C mesure ${c}°.`})); },
'an-iso':d=>{ const top=Math.random()<0.5; if(top){ const s=2*rnd(10,80); const base=(180-s)/2; return item('an-iso',[`Le triangle ABC est isocèle en C. L’angle en C mesure ${s}°.`],qN('**Calcule** la mesure de l’angle en A.',base,{unit:'°',fig:FIG.tri({n:['A','B','C'],a:['?','',s+'°'],iso:true}),aide:['Les deux angles à la base sont égaux.',`180 − ${s} = ${180-s}`],corr:[`180 − ${s} = ${180-s}`,`${180-s} ÷ 2 = ${fx(base)}`],rep:`L’angle en A mesure ${fx(base)}°.`})); }
  const b=rnd(20,85); return item('an-iso',[`Le triangle ABC est isocèle en C. L’angle en A mesure ${b}°.`],qN('**Calcule** la mesure de l’angle en C.',180-2*b,{unit:'°',fig:FIG.tri({n:['A','B','C'],a:[b+'°','','?'],iso:true}),aide:[`L’angle en B mesure aussi ${b}°.`],corr:[`${b} + ${b} = ${2*b}`,`180 − ${2*b} = ${180-2*b}`],rep:`L’angle en C mesure ${180-2*b}°.`})); },
'an-type':d=>{ const v=pick([rnd(10,85),90,rnd(95,175)]); const a=v<90?'aigu':v===90?'droit':'obtus'; return item('an-type',[`Un angle mesure ${v}°.`],qC('Cet angle est :',[a,...['aigu','droit','obtus'].filter(x=>x!==a)],{aide:['Aigu : moins de 90°. Droit : 90°. Obtus : entre 90° et 180°.'],corr:[`${v}° : angle ${a}`],rep:`Un angle de ${v}° est un angle ${a}.`})); },
'an-alt':d=>{ const v=rnd(25,80); return item('an-alt',['Les droites (d) et (d’) sont parallèles. Elles sont coupées par une sécante.',`L’angle violet mesure ${v}°.`],qN('Quelle est la mesure de l’angle orange ?',v,{unit:'°',fig:FIG.alt(v+'°'),aide:['Les deux angles sont alternes-internes.','Les droites sont parallèles : les angles sont égaux.'],corr:['Angles alternes-internes et droites parallèles :',`l’angle orange mesure ${v}°.`],rep:`L’angle orange mesure ${v}°.`})); },
'an-sembl':d=>{ const k=pick([2,3,1.5,0.5,2.5]); const a=rnd(2,9), b=rnd(3,10); return item('an-sembl',[`Les triangles ABC et DEF sont semblables. Les côtés de DEF sont ceux de ABC multipliés par ${fx(k)}.`,`AB = ${a} cm et BC = ${b} cm.`],qN('**Calcule** la longueur EF (elle correspond à BC).',roundTo(b*k,2),{unit:'cm',aide:[`EF = BC × ${fx(k)}`],corr:[`${b} × ${fx(k)} = ${fx(roundTo(b*k,2))}`],rep:`EF = ${fx(roundTo(b*k,2))} cm.`})); },

/* ===== 14. Pythagore, Thalès, trigonométrie ===== */
'py-hyp':d=>{ const T=d===1?pick([[3,4],[6,8],[5,12],[9,12],[8,15]]):[rnd(2,12),rnd(2,12)]; const [a,b]=T; const c=Math.sqrt(a*a+b*b); const ex=Number.isInteger(roundTo(c,9));
  return item('py-hyp',[`ABC est un triangle rectangle en A. AB = ${a} cm et AC = ${b} cm.`],qN(`**Calcule** BC${ex?'':'. **Arrondis** au dixième'}.`,c,{arr:ex?null:1,unit:'cm',fig:FIG.right({ab:a+' cm',ac:b+' cm',bc:'?'}),aide:['BC est l’hypoténuse : BC² = AB² + AC².'],corr:[`BC² = ${a}² + ${b}² = ${a*a} + ${b*b} = ${a*a+b*b}`,`BC = √${a*a+b*b}${ex?` = ${c}`:` ≈ ${fx(c,2)}`}`],rep:`BC ${ex?'=':'≈'} ${fx(roundTo(c,1))} cm.`})); },
'py-cote':d=>{ const [a,b,c]=d===1?pick([[3,4,5],[6,8,10],[5,12,13],[8,15,17]]):(()=>{ const x=rnd(3,10), z=rnd(x+2,15); return [x,Math.sqrt(z*z-x*x),z]; })(); const ex=Number.isInteger(roundTo(b,9));
  return item('py-cote',[`ABC est un triangle rectangle en A. BC = ${c} cm et AB = ${a} cm.`],qN(`**Calcule** AC${ex?'':'. **Arrondis** au dixième'}.`,b,{arr:ex?null:1,unit:'cm',fig:FIG.right({ab:a+' cm',bc:c+' cm',ac:'?'}),aide:['BC² = AB² + AC², donc AC² = BC² − AB².'],corr:[`AC² = ${c}² − ${a}² = ${c*c} − ${a*a} = ${c*c-a*a}`,`AC = √${c*c-a*a}${ex?` = ${b}`:` ≈ ${fx(b,2)}`}`],rep:`AC ${ex?'=':'≈'} ${fx(roundTo(b,1))} cm.`})); },
'py-rec':d=>{ const T=pick([[3,4,5],[5,12,13],[8,15,17],[7,24,25],[6,8,10],[9,12,15]]); const yes=Math.random()<0.5; let [a,b,c]=T; if(!yes) c+=pick([1,-1,2]);
  return item('py-rec',[`Un triangle RST a pour côtés RS = ${a} cm, ST = ${b} cm et RT = ${c} cm.`],qV('Le triangle RST est rectangle.',a*a+b*b===c*c,{aide:['Je compare le carré du plus grand côté avec la somme des carrés des deux autres.'],corr:[`RT² = ${c}² = ${c*c}`,`RS² + ST² = ${a*a} + ${b*b} = ${a*a+b*b}`,a*a+b*b===c*c?'Les deux résultats sont égaux.':'Les deux résultats sont différents.'],rep:a*a+b*b===c*c?'D’après la réciproque du théorème de Pythagore, RST est rectangle en S.':'RST n’est pas rectangle.'})); },
'th-long':d=>{ const am=rnd(2,6), k=pick([2,3,4]), ab=am*k, bc=rnd(2,9)*k; const mn=roundTo(bc*am/ab,2);
  return item('th-long',[`Les droites (MN) et (BC) sont parallèles. AM = ${am} cm, AB = ${ab} cm et BC = ${bc} cm.`],qN('**Calcule** MN.',mn,{unit:'cm',fig:FIG.thales({am:am+' cm',ab:ab+' cm',bc:bc+' cm',mn:'?'}),aide:['D’après le théorème de Thalès : {{AM/AB}} = {{MN/BC}}.',`MN = ${am} × ${bc} ÷ ${ab}`],corr:[`{{${am}/${ab}}} = {{MN/${bc}}}`,`MN = ${am} × ${bc} ÷ ${ab} = ${fx(mn)}`],rep:`MN = ${fx(mn)} cm.`})); },
'tr-long':d=>{ const ang=rnd(20,70), h=rnd(5,20); const f=pick(d===1?['cos']:['cos','sin','tan']); let r, ask, corr;
  if(f==='cos'){ r=h*Math.cos(ang*Math.PI/180); ask='AB'; corr=[`cos(${ang}°) = {{AB/BC}}`,`AB = ${h} × cos(${ang}°) ≈ ${fx(r,2)}`]; }
  else if(f==='sin'){ r=h*Math.sin(ang*Math.PI/180); ask='AC'; corr=[`sin(${ang}°) = {{AC/BC}}`,`AC = ${h} × sin(${ang}°) ≈ ${fx(r,2)}`]; }
  else { r=h*Math.tan(ang*Math.PI/180); ask='AC'; corr=[`tan(${ang}°) = {{AC/AB}}`,`AC = ${h} × tan(${ang}°) ≈ ${fx(r,2)}`]; }
  const known=f==='tan'?`AB = ${h} cm`:`BC = ${h} cm`;
  return item('tr-long',[`ABC est rectangle en A. L’angle en B mesure ${ang}° et ${known}.`],qN(`**Calcule** ${ask}. **Arrondis** au dixième.`,r,{arr:1,unit:'cm',fig:FIG.right({ang:ang+'°',bc:f!=='tan'?h+' cm':'',ab:f==='tan'?h+' cm':ask==='AB'?'?':'',ac:ask==='AC'?'?':''}),aide:[f==='cos'?'Je connais l’hypoténuse et je cherche le côté adjacent : cosinus.':f==='sin'?'Je connais l’hypoténuse et je cherche le côté opposé : sinus.':'Je connais le côté adjacent et je cherche le côté opposé : tangente.'],corr,rep:`${ask} ≈ ${fx(roundTo(r,1))} cm.`})); },
'tr-angle':d=>{ const hyp=rnd(8,20), adj=rnd(3,hyp-2); const ang=Math.acos(adj/hyp)*180/Math.PI;
  return item('tr-angle',[`ABC est rectangle en A. AB = ${adj} cm et BC = ${hyp} cm.`],qN('**Calcule** la mesure de l’angle en B. **Arrondis** au degré.',ang,{arr:0,unit:'°',fig:FIG.right({ab:adj+' cm',bc:hyp+' cm',ang:'?'}),aide:['AB est le côté adjacent, BC est l’hypoténuse : cosinus.',`cos(B) = ${adj} ÷ ${hyp}`],corr:[`cos(B) = {{${adj}/${hyp}}}`,`B = cos⁻¹(${adj} ÷ ${hyp}) ≈ ${fx(ang,1)}°`],rep:`L’angle en B mesure environ ${fx(roundTo(ang,0))}°.`})); },

/* ===== 15. Transformations ===== */
'tf-trans':d=>{ const x=rnd(-4,4), y=rnd(-4,4), dx=rnd0(-4,4), dy=rnd(-3,3); const g=`(${fmtN(x+dx)} ; ${fmtN(y+dy)})`;
  return item('tf-trans',[`Le point A a pour coordonnées (${fmtN(x)} ; ${fmtN(y)}). On le fait glisser de ${Math.abs(dx)} carreau${Math.abs(dx)>1?'x':''} vers la ${dx>0?'droite':'gauche'}${dy?` et de ${Math.abs(dy)} carreau${Math.abs(dy)>1?'x':''} vers le ${dy>0?'haut':'bas'}`:''}.`],qC('Quelles sont les coordonnées de l’image de A ?',[g,`(${fmtN(x-dx)} ; ${fmtN(y-dy)})`,`(${fmtN(x+dy)} ; ${fmtN(y+dx)})`],{aide:['Vers la droite : l’abscisse augmente. Vers le haut : l’ordonnée augmente.'],corr:[`${par(x)} ${dx<0?'−':'+'} ${Math.abs(dx)} = ${fmtN(x+dx)}`,`${par(y)} ${dy<0?'−':'+'} ${Math.abs(dy)} = ${fmtN(y+dy)}`],rep:`L’image de A est le point ${g}.`})); },
'tf-symc':d=>{ const x=rnd0(-5,5), y=rnd0(-5,5); const g=`(${fmtN(-x)} ; ${fmtN(-y)})`;
  return item('tf-symc',[`Le point A a pour coordonnées (${fmtN(x)} ; ${fmtN(y)}).`],qC('Quelles sont les coordonnées de son image par la symétrie de centre O ?',[g,`(${fmtN(-x)} ; ${fmtN(y)})`,`(${fmtN(x)} ; ${fmtN(-y)})`],{aide:['Je prends les opposés des deux coordonnées.'],corr:[`(${fmtN(x)} ; ${fmtN(y)}) → ${g}`],rep:`L’image de A est le point ${g}.`})); },
'tf-symax':d=>{ const x=rnd0(-5,5), y=rnd0(-5,5); const ax=pick(['abscisses','ordonnées']); const g=ax==='abscisses'?`(${fmtN(x)} ; ${fmtN(-y)})`:`(${fmtN(-x)} ; ${fmtN(y)})`;
  return item('tf-symax',[`Le point A a pour coordonnées (${fmtN(x)} ; ${fmtN(y)}).`],qC(`Quelles sont les coordonnées de son image par la symétrie d’axe l’axe des ${ax} ?`,[g,ax==='abscisses'?`(${fmtN(-x)} ; ${fmtN(y)})`:`(${fmtN(x)} ; ${fmtN(-y)})`,`(${fmtN(-x)} ; ${fmtN(-y)})`],{aide:[ax==='abscisses'?'L’axe est horizontal : seule l’ordonnée change de signe.':'L’axe est vertical : seule l’abscisse change de signe.'],corr:[`(${fmtN(x)} ; ${fmtN(y)}) → ${g}`],rep:`L’image de A est le point ${g}.`})); },
'tf-homo':d=>{ const k=pick([2,3,0.5,1.5,4]); const t=pick(d===1?['L']:['L','A']); const v=rnd(3,15); const f=t==='L'?k:k*k; const r=roundTo(v*f,3);
  return item('tf-homo',[`On fait une homothétie de rapport ${fx(k)}. ${t==='L'?`Un segment mesure ${v} cm.`:`Une figure a une aire de ${v} cm².`}`],qN(t==='L'?'**Calcule** la longueur de son image.':'**Calcule** l’aire de son image.',r,{unit:t==='L'?'cm':'cm²',aide:[t==='L'?'Les longueurs sont multipliées par k.':'Les aires sont multipliées par k².'],corr:[`${v} × ${fx(f)} = ${fx(r)}`],rep:`Le résultat est ${fx(r)} ${t==='L'?'cm':'cm²'}.`})); },
'tf-rot':d=>{ const x=rnd0(-5,5), y=rnd0(-5,5); const g=`(${fmtN(-y)} ; ${fmtN(x)})`; if(-y===y&&x===x) {}
  const o=[g,`(${fmtN(y)} ; ${fmtN(-x)})`,`(${fmtN(-x)} ; ${fmtN(-y)})`];
  return item('tf-rot',[`Le point A a pour coordonnées (${fmtN(x)} ; ${fmtN(y)}). On fait une rotation de centre O, d’angle 90°, dans le sens inverse des aiguilles d’une montre.`],qC('Quelles sont les coordonnées de l’image de A ?',o,{aide:['Avec cette rotation : (x ; y) devient (−y ; x).'],corr:[`(${fmtN(x)} ; ${fmtN(y)}) → ${g}`],rep:`L’image de A est le point ${g}.`})); },

/* ===== 16. Algorithmique ===== */
'al-var':d=>{ const a=rnd(0,10), k=rnd(2,d===1?4:6), b=rnd(1,d===3?9:5); const mul=d===3&&Math.random()<0.4; const r=mul?a*b**k:a+k*b; const bb=mul?Math.min(b,3):b; const r2=mul?a*bb**k:r;
  const blocks=[Hat('quand ⚑ est cliqué'),B(`mettre n à [${a}]`,'vari'),Cb(`répéter [${k}] fois`,[mul?B(`mettre n à (n) × [${bb}]`,'vari'):B(`ajouter [${b}] à n`,'vari')]),B('dire (n)','appa')];
  const steps=[]; let n=a; for(let i=0;i<k;i++){ n=mul?n*bb:n+b; steps.push(n); }
  return item('al-var',['Voici un script.'],qN('Que dit le lutin à la fin ?',r2,{fig:FIG.script(blocks),aide:['Je suis la valeur de n à chaque tour.',`Au départ, n = ${a}.`],corr:[`n : ${a} → ${steps.join(' → ')}`],rep:`Le lutin dit ${r2}.`})); },
'al-boucle':d=>{ const k=rnd(2,10), p=pick([10,20,25,30,40,50,100]); return item('al-boucle',['Voici un script.'],qN('De combien de pas le lutin avance-t-il en tout ?',k*p,{unit:'pas',fig:FIG.script([Hat('quand ⚑ est cliqué'),Cb(`répéter [${k}] fois`,[B(`avancer de [${p}] pas`,'mouv'),B('tourner ↻ de [15] degrés','mouv')])]),aide:[`La boucle répète ${k} fois.`],corr:[`${k} × ${p} = ${k*p}`],rep:`Le lutin avance de ${k*p} pas en tout.`})); },
'al-si':d=>{ const s=rnd(5,20), v=rnd(1,30); const ok=v>s; return item('al-si',[`On répond ${v}.`],qC('Que dit le lutin ?',[ok?'Gagné !':'Perdu…',ok?'Perdu…':'Gagné !','Il ne dit rien.'],{fig:FIG.script([Hat('quand ⚑ est cliqué'),B('demander [Ton nombre ?] et attendre','capt'),Cb(`si {réponse > ${s}} alors`,[B('dire [Gagné !]','appa')],'ctrl',[B('dire [Perdu…]','appa')])]),aide:[`Je teste la condition : ${v} > ${s} ?`],corr:[`${v} > ${s} est ${ok?'vrai':'faux'}.`],rep:`Le lutin dit « ${ok?'Gagné !':'Perdu…'} ».`})); },
'al-poly':d=>{ const n=pick([3,4,5,6,8,9,10,12]); const names={3:'un triangle équilatéral',4:'un carré',5:'un pentagone régulier',6:'un hexagone régulier',8:'un octogone régulier',9:'un polygone régulier à 9 côtés',10:'un polygone régulier à 10 côtés',12:'un polygone régulier à 12 côtés'};
  return item('al-poly',[`Le lutin doit tracer ${names[n]}.`],qN('De combien de degrés doit-il tourner à chaque coin ?',360/n,{unit:'degrés',aide:[`Le polygone a ${n} côtés.`,'Je calcule 360 ÷ nombre de côtés.'],corr:[`360 ÷ ${n} = ${fx(360/n)}`],rep:`Il doit tourner de ${fx(360/n)} degrés.`})); },
'al-prog':d=>{ const m=rnd(2,6), p=rnd(1,9), v=d===1?rnd(1,10):rnd(-8,10); const r=v*m-p;
  return item('al-prog',[`On répond ${fmtN(v)}.`],qN('Que dit le lutin ?',r,{fig:FIG.script([Hat('quand ⚑ est cliqué'),B('demander [Choisis un nombre] et attendre','capt'),B(`mettre y à (réponse) × [${m}]`,'vari'),B(`mettre y à (y) − [${p}]`,'vari'),B('dire (y)','appa')]),aide:[`y = ${par(v)} × ${m}, puis y − ${p}.`],corr:[`${par(v)} × ${m} = ${fmtN(v*m)}`,`${fmtN(v*m)} − ${p} = ${fmtN(r)}`],rep:`Le lutin dit ${fmtN(r)}.`})); }
};
/* Un générateur peut rarement produire un cas mal posé : on recommence */
function okItem(it){ return it&&it.qs.every(q=>{ if(q.type==='qcm') return new Set(q.o).size===q.o.length; if(q.type==='num') return isFinite(q.a); if(q.type==='frac'){ const [n,d]=q.a.split('/').map(Number); return isFinite(n)&&d>0; } return true; }); }
function makeCalc(id,d){ const g=GENS[id]; if(!g) return null; for(let i=0;i<20;i++){ let it=null; try{ it=g(d); }catch(e){ console.warn('générateur',id,e); }
  if(okItem(it)){ it.gen=id; it.qs.forEach(q=>{ if(q.fig&&!it.fig){ it.fig=q.fig; } if(q.tab&&!it.tab) it.tab=q.tab; }); return it; } } return null; }
