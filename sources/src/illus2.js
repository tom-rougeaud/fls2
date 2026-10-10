/* =====================================================================
   ILLUSTRATIONS DU NIVEAU 2 — dessinées en SVG, sans fichier externe.
   Mêmes règles que le niveau 1 : "famille:arg1|arg2|…"
   ===================================================================== */
const BLUE='#3D7BE0', ORANGE='#FF8A3D', GREEN='#2FA65A', RED='#E5484D', YEL='#FFC233', PURP='#9B5DE5', GREY='#9AA3B5';
function SVh(inner,h,w){ return `<svg class="ill" viewBox="0 0 ${w||200} ${h}" aria-hidden="true" focusable="false">${inner}</svg>`; }
function fN(v){ return String(v).replace('-','−').replace('.',','); }
function ln(x1,y1,x2,y2,col,w,extra){ return `<line x1="${(+x1).toFixed(1)}" y1="${(+y1).toFixed(1)}" x2="${(+x2).toFixed(1)}" y2="${(+y2).toFixed(1)}" stroke="${col||INK}" stroke-width="${w||2.5}" stroke-linecap="round" ${extra||''}/>`; }
function dash(x1,y1,x2,y2,col,w){ return ln(x1,y1,x2,y2,col,w||2,'stroke-dasharray="5 4"'); }
function dot(x,y,r,f,s){ return `<circle cx="${(+x).toFixed(1)}" cy="${(+y).toFixed(1)}" r="${r}" fill="${f}" stroke="${s||INK}" stroke-width="2"/>`; }
function poly(pts,fill,stroke,w,extra){ return `<polygon points="${pts.map(p=>p.map(v=>(+v).toFixed(1)).join(',')).join(' ')}" fill="${fill}" stroke="${stroke||INK}" stroke-width="${w||3}" stroke-linejoin="round" ${extra||''}/>`; }
function fracT(x,y,n,d,size,col){ size=size||22; col=col||INK; const w=Math.max(String(n).length,String(d).length)*size*0.6+6;
  return tx(x,y-size*0.18,n,size,col,800)+ln(x-w/2,y,x+w/2,y,col,2.5)+tx(x,y+size*0.92,d,size,col,800); }
function arcA(cx,cy,r,a0,a1,col,w,fill){ const p=a=>[cx+r*Math.cos(a),cy-r*Math.sin(a)]; const [x0,y0]=p(a0),[x1,y1]=p(a1); const large=Math.abs(a1-a0)>Math.PI?1:0;
  return fill?`<path d="M${cx} ${cy} L${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${large} 0 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" fill="${fill}" stroke="${col}" stroke-width="${w||2.5}"/>`
   :`<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${large} 0 ${x1.toFixed(1)} ${y1.toFixed(1)}" fill="none" stroke="${col}" stroke-width="${w||3}"/>`; }
function rAngle(x,y,ux,uy,vx,vy,s,col){ s=s||10; const a=[x+ux*s,y+uy*s],b=[x+ux*s+vx*s,y+uy*s+vy*s],c=[x+vx*s,y+vy*s]; return `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)} L${c[0].toFixed(1)} ${c[1].toFixed(1)}" fill="none" stroke="${col||INK}" stroke-width="2"/>`; }
function tick(x1,y1,x2,y2,n,col){ const mx=(x1+x2)/2,my=(y1+y2)/2, dx=x2-x1, dy=y2-y1, L=Math.hypot(dx,dy), ux=dx/L, uy=dy/L, px=-uy, py=ux; let s='';
  for(let i=0;i<(n||1);i++){ const o=(i-((n||1)-1)/2)*5; const cx=mx+ux*o, cy=my+uy*o; s+=ln(cx-px*6,cy-py*6,cx+px*6,cy+py*6,col||INK,2.5); } return s; }
function vec(x1,y1,x2,y2,col,w){ const a=Math.atan2(y2-y1,x2-x1), h=10; const p1=[x2-h*Math.cos(a-0.45),y2-h*Math.sin(a-0.45)], p2=[x2-h*Math.cos(a+0.45),y2-h*Math.sin(a+0.45)];
  return ln(x1,y1,x2,y2,col,w||3.5)+`<polyline points="${p1[0].toFixed(1)},${p1[1].toFixed(1)} ${x2},${y2} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}" fill="none" stroke="${col}" stroke-width="${w||3.5}" stroke-linecap="round" stroke-linejoin="round"/>`; }
function tbox(x,y,w,h,txt,size,fill,stroke,col){ return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${fill}" stroke="${stroke||INK}" stroke-width="2.5"/>`+tx(x+w/2,y+h/2+size*0.36,txt,size,col||INK,800); }

/* ---------- Droite graduée des relatifs ---------- */
function nl2(min,max,pts,mode,C,T){
  min=+min; max=+max; const P=(pts||'').split(',').filter(s=>s!=='').map(Number); const n=max-min, st=172/n, X=v=>14+(v-min)*st, Y=82;
  let s='';
  if(mode==='pos') s+=`<rect x="${X(0)}" y="${Y-11}" width="${X(max)-X(0)}" height="22" rx="6" fill="${T}"/>`+tx((X(0)+X(max))/2,Y+46,'nombres positifs',12,C,900);
  if(mode==='neg') s+=`<rect x="${X(min)}" y="${Y-11}" width="${X(0)-X(min)}" height="22" rx="6" fill="${T}"/>`+tx((X(0)+X(min))/2,Y+46,'nombres négatifs',12,C,900);
  s+=ln(8,Y,192,Y,INK,3)+arrowHead(194,Y,'r',INK);
  for(let v=min;v<=max;v++){ const big=v===0; s+=ln(X(v),Y-(big?9:6),X(v),Y+(big?9:6),INK,big?3:2); if(n<=12||v%2===0) s+=tx(X(v),Y+26,fN(v),n>10?10:12,big?INK:SOFT,big?900:700); }
  const lab=v=>fN(v>0&&mode!=='pos'?v:v);
  if(mode==='dist'){ const p=P[0]; s+=`<path d="M${X(0)} ${Y-6} Q${(X(0)+X(p))/2} ${Y-46} ${X(p)} ${Y-6}" fill="none" stroke="${C}" stroke-width="3"/>`+tx((X(0)+X(p))/2,Y-34,String(Math.abs(p)),18,C,900); }
  if(mode==='opp'){ const p=Math.abs(P[0]); [-p,p].forEach(v=>{ s+=`<path d="M${X(0)} ${Y-6} Q${(X(0)+X(v))/2} ${Y-40} ${X(v)} ${Y-6}" fill="none" stroke="${C}" stroke-width="3"/>`+tx((X(0)+X(v))/2,Y-30,String(p),15,C,900); }); }
  if(mode==='sum'&&P.length>1){ const a=P[0],b=P[1]; s+=`<path d="M${X(a)} ${Y-8} Q${(X(a)+X(a+b))/2} ${Y-52} ${X(a+b)} ${Y-10}" fill="none" stroke="${C}" stroke-width="3"/>`+arrowHead(X(a+b),Y-9,'d',C)+tx((X(a)+X(a+b))/2,Y-40,(b>0?'+':'−')+Math.abs(b),16,C,900)+dot(X(a+b),Y,7,C); }
  if(mode==='ecart'&&P.length>1){ const [a,b]=P; s+=ln(X(a),Y-28,X(b),Y-28,C,3)+arrowHead(X(a),Y-28,'l',C)+arrowHead(X(b),Y-28,'r',C)+tx((X(a)+X(b))/2,Y-36,String(Math.abs(b-a)),16,C,900); }
  if(mode==='cmp'&&P.length>1) s+=tx(100,30,`${fN(P[0])} < ${fN(P[1])}`,20,C,900);
  P.slice(0,mode==='sum'?1:2).forEach(v=>{ s+=dot(X(v),Y,7,mode==='sum'?BLUE:C)+(mode==='dist'||mode==='opp'||mode==='ecart'?'':tx(X(v),Y-16,lab(v),15,mode==='sum'?BLUE:C,900)); });
  if(mode==='opp'){ const p=Math.abs(P[0]); s+=dot(X(-p),Y,7,C)+dot(X(p),Y,7,C); }
  return SV(s);
}

/* ---------- Fractions (suite) ---------- */
function barF(x,y,w,h,d,n,col,col2,n2){ let s=''; const pw=w/d; for(let i=0;i<d;i++){ const f=i<n?col:(i<n+(n2||0)?col2:'#FFFFFF'); s+=`<rect x="${(x+i*pw).toFixed(1)}" y="${y}" width="${pw.toFixed(1)}" height="${h}" fill="${f}" stroke="${INK}" stroke-width="2"/>`; } return s; }
function fr2(kind,a,b,c,d,C,T){
  a=+a; b=+b; c=+c; d=+d; let s='';
  if(kind==='eq'){ s+=fracT(30,40,a,b,20,C)+barF(60,22,128,30,b,a,C)+tx(30,84,'=',22,INK,900)+fracT(30,108,c,d,20,C)+barF(60,92,128,30,d,c,C); return SV(s); }
  if(kind==='simp'){ const k=a/c; s+=fracT(46,62,a,b,30,INK)+`<path d="M78 46 Q100 22 122 46" fill="none" stroke="${C}" stroke-width="3"/>`+arrowHead(122,46,'d',C)+tx(100,26,'÷ '+k,16,C,900)+`<path d="M78 92 Q100 116 122 92" fill="none" stroke="${C}" stroke-width="3"/>`+arrowHead(122,92,'u',C)+tx(100,128,'÷ '+k,16,C,900)+fracT(154,62,c,d,30,C); return SV(s); }
  if(kind==='add'){ s+=barF(16,24,168,34,b,a,BLUE,ORANGE,c)+fracT(40,92,a,b,18,BLUE)+tx(68,104,'+',22,INK,900)+fracT(96,92,c,d,18,ORANGE)+tx(124,104,'=',22,INK,900)+fracT(156,92,a+c,b,18,C); return SV(s); }
  if(kind==='inv'){ s+=fracT(50,64,a,b,32,INK)+fracT(150,64,b,a,32,C)+`<path d="M74 40 Q100 14 126 40" fill="none" stroke="${C}" stroke-width="3"/>`+arrowHead(126,40,'d',C)+`<path d="M126 104 Q100 130 74 104" fill="none" stroke="${C}" stroke-width="3"/>`+arrowHead(74,104,'u',C); return SV(s); }
  if(kind==='qte'){ const tot=c, per=tot/b; s+=tx(100,22,String(tot),18,INK,900)+ln(16,30,184,30,INK,2)+ln(16,26,16,34)+ln(184,26,184,34)+barF(16,40,168,34,b,a,C);
    for(let i=0;i<b;i++) s+=tx(16+168/b*(i+0.5),62,fN(per),Math.min(15,120/b),i<a?'#FFFFFF':INK,800);
    s+=fracT(52,100,a,b,17,C)+tx(110,112,`de ${tot} = ${fN(a*per)}`,17,INK,800); return SV(s); }
  return txt(['?'],C,T);
}

/* ---------- Puissances et racines ---------- */
function pw(a,b,mode,C,T){
  if(a==='sqrt'){ const n=+b, r=Math.round(Math.sqrt(n)), u=Math.min(13,92/r); let s=''; const x0=20,y0=18;
    for(let i=0;i<r;i++) for(let j=0;j<r;j++) s+=`<rect x="${x0+i*u}" y="${y0+j*u}" width="${u}" height="${u}" fill="${T}" stroke="${C}" stroke-width="1.2"/>`;
    s+=`<rect x="${x0}" y="${y0}" width="${r*u}" height="${r*u}" fill="none" stroke="${INK}" stroke-width="3"/>`+tx(x0+r*u/2,y0+r*u+18,String(r),16,C,900)+tx(x0+r*u/2,y0+r*u/2+6,String(n),18,INK,900);
    s+=tx(150,56,`√${n}`,28,C,900)+tx(150,94,`= ${r}`,28,INK,900); return SV(s); }
  a=+a; b=+b; const sup={2:'²',3:'³',4:'⁴',5:'⁵',6:'⁶'}[b]||'ⁿ';
  if(b===2&&a<=6&&mode!=='exp'){ let s=''; const u=Math.min(16,96/a), x0=18, y0=(140-a*u)/2;
    for(let i=0;i<a;i++) for(let j=0;j<a;j++) s+=`<rect x="${x0+i*u}" y="${y0+j*u}" width="${u}" height="${u}" fill="${T}" stroke="${C}" stroke-width="1.2"/>`;
    s+=`<rect x="${x0}" y="${y0}" width="${a*u}" height="${a*u}" fill="none" stroke="${INK}" stroke-width="3"/>`+tx(150,62,`${a}² = ${a} × ${a}`,17,INK,800)+tx(150,96,`= ${a*a}`,26,C,900); return SV(s); }
  if(b===3&&a<=3&&mode!=='exp'){ const u=60/a, x0=24, y0=46, d=26; let s='';
    s+=`<polygon points="${x0},${y0} ${x0+60},${y0} ${x0+60},${y0+60} ${x0},${y0+60}" fill="${T}" stroke="${C}" stroke-width="2.5"/><polygon points="${x0},${y0} ${x0+d},${y0-d} ${x0+60+d},${y0-d} ${x0+60},${y0}" fill="#FFFFFF" stroke="${C}" stroke-width="2.5"/><polygon points="${x0+60},${y0} ${x0+60+d},${y0-d} ${x0+60+d},${y0+60-d} ${x0+60},${y0+60}" fill="${C}" fill-opacity=".35" stroke="${C}" stroke-width="2.5"/>`;
    for(let i=1;i<a;i++){ s+=ln(x0+i*u,y0,x0+i*u,y0+60,C,1.5)+ln(x0,y0+i*u,x0+60,y0+i*u,C,1.5)+ln(x0+i*u,y0,x0+i*u+d,y0-d,C,1.5)+ln(x0+i*d/a,y0-i*d/a,x0+60+i*d/a,y0-i*d/a,C,1.5)+ln(x0+60+i*d/a,y0-i*d/a,x0+60+i*d/a,y0+60-i*d/a,C,1.5)+ln(x0+60,y0+i*u,x0+60+d,y0+i*u-d,C,1.5); }
    s+=tx(150,62,`${a}³ = ${Array(a).fill(a).join(' × ')}`,15,INK,800)+tx(150,96,`= ${a**3}`,26,C,900); return SV(s); }
  let s=tx(62,70,String(a),58,INK,900);
  if(mode==='exp') s+=`<rect x="75" y="10" width="34" height="40" rx="9" fill="${T}" stroke="${C}" stroke-width="3"/>`;
  s+=tx(92,42,String(b),30,C,900)+tx(100,112,Array(b).fill(a).join(' × '),20,INK,800)+`<path d="M${100-b*19} 122 q0 8 8 8 h${b*38-16} q8 0 8 -8" fill="none" stroke="${C}" stroke-width="2.5"/>`+tx(160,58,`= ${a**b}`,24,C,900);
  return SV(s);
}

/* ---------- Arithmétique ---------- */
function arith(kind,a,b,C,T){
  let s='';
  if(kind==='eucl'){ a=+a; b=+b; const q=Math.floor(a/b), r=a%b; const sp=Math.min(11,(176-q*14-r*12)/(q*b)); let x=14;
    for(let g=0;g<q;g++){ s+=`<rect x="${x-4}" y="22" width="${b*sp+6}" height="26" rx="12" fill="${T}" stroke="${C}" stroke-width="2"/>`; for(let i=0;i<b;i++) s+=dot(x+sp/2+i*sp,35,Math.min(4.5,sp*0.42),C); x+=b*sp+14; }
    for(let i=0;i<r;i++) s+=dot(x+5+i*12,35,5,ORANGE);
    s+=tx(100,86,`${a} = ${b} × ${q} + ${r}`,22,INK,900)+tx(70,118,`quotient ${q}`,14,C,800)+tx(150,118,`reste ${r}`,14,ORANGE,800); return SV(s); }
  if(kind==='premier'){ a=+a; for(let i=0;i<a;i++) s+=`<rect x="${100-a*11+i*22}" y="30" width="18" height="18" rx="4" fill="${T}" stroke="${C}" stroke-width="2"/>`;
    s+=tx(100,84,`${a} = 1 × ${a}`,22,INK,900)+tx(100,116,'seulement 2 diviseurs : 1 et '+a,13,C,800); return SV(s); }
  if(kind==='arbre'){ const N=[[60,100,24],[2,60,58],[30,140,58],[2,100,94],[15,170,94],[3,140,128],[5,184,128]];
    s+=ln(100,30,62,48,INK,2)+ln(100,30,138,48,INK,2)+ln(140,64,104,84,INK,2)+ln(140,64,168,84,INK,2)+ln(170,100,144,118,INK,2)+ln(170,100,184,118,INK,2);
    N.forEach(([v,x,y])=>{ const pr=[2,3,5,7].includes(v); s+=`<circle cx="${Math.min(x,184)}" cy="${y-6}" r="${pr?12:15}" fill="${pr?T:PAPER}" stroke="${pr?C:INK}" stroke-width="2.5"/>`+tx(Math.min(x,184),y,String(v),pr?15:14,pr?C:INK,900); });
    s+=tx(52,128,'60 = 2² × 3 × 5',13,C,900); return SV(s); }
  if(kind==='commun'){ a=+a; b=+b; const div=n=>{ const r=[]; for(let i=1;i<=n;i++) if(n%i===0) r.push(i); return r; }; const A=div(a), B=div(b);
    const row=(L,y,lab,other)=>tx(22,y+6,lab,13,SOFT,800,'start')+L.map((v,i)=>{ const c=other.includes(v); return `<rect x="${58+i*23}" y="${y-12}" width="20" height="24" rx="6" fill="${c?T:PAPER}" stroke="${c?C:INK}" stroke-width="${c?3:1.5}"/>`+tx(68+i*23,y+5,String(v),12,c?C:INK,800); }).join('');
    s+=row(A,42,String(a),B)+row(B,86,String(b),A)+tx(100,128,'diviseurs communs : '+A.filter(v=>B.includes(v)).join(', '),13,C,900); return SV(s); }
  if(kind==='mult'){ a=+a; const X=v=>14+v*11; s+=ln(8,96,192,96,INK,3); for(let v=0;v<=16;v++) s+=ln(X(v),91,X(v),101,INK,v%a===0?3:1.5)+(v%a===0?tx(X(v),118,String(v),12,C,900):'');
    for(let v=0;v+a<=16;v+=a) s+=`<path d="M${X(v)} 90 Q${X(v+a/2)} 56 ${X(v+a)} 90" fill="none" stroke="${C}" stroke-width="3"/>`+tx(X(v+a/2),64,'+'+a,12,C,900);
    s+=tx(100,28,`multiples de ${a}`,16,INK,900); return SV(s); }
  if(kind==='diviseurs'){ a=+a; const prs=[]; for(let i=1;i*i<=a;i++) if(a%i===0) prs.push([i,a/i]); let y=12;
    prs.forEach(([p,q])=>{ const u=Math.min(11,150/q); for(let i=0;i<q;i++) for(let j=0;j<p;j++) s+=`<rect x="${12+i*u}" y="${y+j*u}" width="${u-1}" height="${u-1}" fill="${T}" stroke="${C}" stroke-width="1"/>`; s+=tx(190,y+p*u/2+5,`${p} × ${q}`,13,C,900,'end'); y+=p*u+10; });
    s+=tx(100,134,'diviseurs de '+a+' : '+(()=>{const r=[];for(let i=1;i<=a;i++) if(a%i===0) r.push(i);return r.join(', ');})(),12,INK,800); return SV(s); }
  return txt(['?'],C,T);
}

/* ---------- Calcul littéral ---------- */
function lit(kind,a,b,C,T){
  let s='';
  const arc=(x1,x2,y,up,col)=>`<path d="M${x1} ${y} Q${(x1+x2)/2} ${y+(up?-26:26)} ${x2} ${y}" fill="none" stroke="${col||C}" stroke-width="2.5"/>`+arrowHead(x2,y+(up?-1:1),up?'d':'u',col||C);
  const T0=(x,y,t,size,col)=>`<text x="${x}" y="${y}" font-size="${size}" font-weight="900" fill="${col||INK}" text-anchor="middle">${escX(t)}</text>`;
  const row=(y,items,size)=>items.map(([x,t,col])=>T0(x,y,t,size,col)).join('');
  if(kind==='expr'){ s+=`<rect x="34" y="30" width="64" height="64" fill="${T}" stroke="${C}" stroke-width="3.5"/>`+tx(66,24,'x',18,C,900)+tx(26,68,'x',18,C,900,'end')+tx(148,60,'P = 4 × x',19,INK,900)+tx(148,92,'= 4x',22,C,900); return SV(s); }
  if(kind==='subst'){ s+=tx(100,34,'A = 3x + 5',22,INK,900)+`<rect x="48" y="50" width="58" height="26" rx="12" fill="${T}" stroke="${C}" stroke-width="2.5"/>`+tx(77,68,'x = 2',15,C,900)+vec(112,63,138,63,C,3)+tx(100,116,'A = 3 × 2 + 5 = 11',18,INK,900); return SV(s); }
  if(kind==='red'){ const bar=(x,c)=>`<rect x="${x}" y="22" width="14" height="40" rx="4" fill="${c}" stroke="${INK}" stroke-width="1.5"/>`+tx(x+7,48,'x',11,'#fff',900);
    for(let i=0;i<3;i++) s+=bar(22+i*18,BLUE); s+=tx(88,48,'+',20,INK,900); for(let i=0;i<2;i++) s+=bar(102+i*18,ORANGE); s+=tx(150,48,'=',20,INK,900);
    s+=tx(100,92,'3x + 2x',20,INK,800)+tx(100,124,'= 5x',24,C,900); return SV(s); }
  if(kind==='dev'){ s+=row(70,[[30,'3',C],[46,'('],[62,'x'],[82,'+'],[102,'4'],[118,')']],24)+arc(30,62,46,true)+arc(30,102,46,true)+tx(100,118,'= 3x + 12',24,C,900); return SV(s); }
  if(kind==='dbl'){ s+=row(72,[[18,'('],[32,'x',BLUE],[52,'+'],[70,'2',ORANGE],[84,')'],[100,'('],[114,'x'],[134,'+'],[152,'3'],[166,')']],22)+arc(32,114,50,true,BLUE)+arc(32,152,50,true,BLUE)+arc(70,114,80,false,ORANGE)+arc(70,152,80,false,ORANGE)+tx(100,128,'x² + 3x + 2x + 6',16,C,900); return SV(s); }
  if(kind==='fact'){ s+=row(52,[[34,'5',C],[50,'x'],[72,'+'],[94,'5',C],[114,'×'],[134,'3']],24)+`<circle cx="34" cy="44" r="14" fill="none" stroke="${C}" stroke-width="2.5"/><circle cx="94" cy="44" r="14" fill="none" stroke="${C}" stroke-width="2.5"/>`+tx(100,108,'= 5(x + 3)',26,C,900); return SV(s); }
  if(kind==='rect'){ s+=`<rect x="30" y="30" width="140" height="72" fill="${T}" stroke="${C}" stroke-width="3.5"/>`+tx(100,124,a||'x + 5',20,C,900)+tx(22,72,b||'x',20,C,900,'end'); return SV(s); }
  return txt(['?'],C,T);
}

/* ---------- Équations ---------- */
function eqI(kind,a,b,C,T){
  if(kind==='bal'||kind==='bal2'){ const L=kind==='bal2'?'x + 3':a, R=kind==='bal2'?'7':b;
    let s=`<path d="M86 132 L114 132 L100 104 Z" fill="${T}" stroke="${INK}" stroke-width="3"/>`+ln(100,104,100,42,INK,5)+ln(26,42,174,42,C,6)+ln(36,42,8,70,INK,2)+ln(36,42,64,70,INK,2)+ln(164,42,136,70,INK,2)+ln(164,42,192,70,INK,2)+`<path d="M6 70 h60 a30 13 0 0 1 -60 0 z" fill="${T}" stroke="${INK}" stroke-width="2.5"/><path d="M134 70 h60 a30 13 0 0 1 -60 0 z" fill="${T}" stroke="${INK}" stroke-width="2.5"/>`+dot(100,42,6,C);
    s+=tx(36,66,L,Math.min(15,95/L.length),INK,900)+tx(164,66,R,15,INK,900);
    if(kind==='bal2') s+=tx(36,104,'− 3',15,C,900)+tx(164,104,'− 3',15,C,900)+tx(100,22,'x = 4',18,C,900);
    return SV(s); }
  if(kind==='membres'){ const wa=a.length*13, wb=b.length*13; let s=`<text x="104" y="62" font-size="24" font-weight="900" fill="${INK}" text-anchor="end" textLength="${wa}" lengthAdjust="spacingAndGlyphs">${escX(a)}</text>`+tx(116,62,'=',24,INK,900)+`<text x="128" y="62" font-size="24" font-weight="900" fill="${INK}" textLength="${wb}" lengthAdjust="spacingAndGlyphs">${escX(b)}</text>`;
    s+=`<path d="M${104-wa} 74 q0 10 10 10 h${wa-20} q10 0 10 -10" fill="none" stroke="${C}" stroke-width="3"/>`+tx(104-wa/2,106,'1ᵉʳ membre',12,C,900)+`<path d="M128 74 q0 10 10 10 h${wb-20} q10 0 10 -10" fill="none" stroke="${ORANGE}" stroke-width="3"/>`+tx(Math.min(170,128+wb/2),106,'2ᵉ membre',12,ORANGE,900); return SV(s); }
  return txt(['?'],C,T);
}

/* ---------- Proportionnalité ---------- */
function prop(kind,a,b,c,C,T){
  let s='';
  if(kind==='croix'){ a=+a; b=+b; c=+c; s+=`<rect x="30" y="20" width="140" height="80" fill="${PAPER}" stroke="${INK}" stroke-width="2.5"/>`+ln(30,60,170,60,INK,2.5)+ln(100,20,100,100,INK,2.5);
    s+=tx(65,48,String(a),22,INK,800)+tx(135,48,String(c),22,C,900)+tx(65,88,String(b),22,C,900)+tx(135,88,'x',22,ORANGE,900)+ln(75,80,125,46,C,3,'stroke-dasharray="6 4"');
    s+=tx(100,128,`x = ${b} × ${c} ÷ ${a}`,17,INK,900); return SV(s); }
  if(kind==='aug'||kind==='red'){ const up=kind==='aug'; const tag=(x,y,t,col,fill)=>`<path d="M${x} ${y} h60 l14 16 l-14 16 h-60 z" fill="${fill}" stroke="${col}" stroke-width="3" stroke-linejoin="round"/><circle cx="${x+62}" cy="${y+16}" r="4" fill="#fff" stroke="${col}" stroke-width="2"/>`+tx(x+28,y+22,t,15,col,900);
    s+=tag(10,up?74:30,'40 €',INK,PAPER)+tag(116,up?16:84,up?'48 €':'30 €',C,T)+vec(80,up?80:54,114,up?44:96,C,4)+tx(100,up?128:20,up?'+ 20 %  (× 1,2)':'− 25 %  (× 0,75)',15,C,900); return SV(s); }
  if(kind==='vitesse'){ s+=`<rect x="0" y="96" width="200" height="22" fill="#9AA3B5"/>`+Array.from({length:6},(_,i)=>`<rect x="${8+i*34}" y="105" width="18" height="4" fill="#fff"/>`).join('');
    s+=`<path d="M40 92 h70 l14 -18 h-56 l-14 18" fill="${C}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><rect x="28" y="72" width="112" height="22" rx="7" fill="${C}" stroke="${INK}" stroke-width="2.5"/>`+dot(52,96,9,'#3A3F55')+dot(118,96,9,'#3A3F55');
    s+=vec(146,82,190,82,ORANGE,4)+`<rect x="58" y="12" width="86" height="34" rx="17" fill="${T}" stroke="${C}" stroke-width="3"/>`+tx(101,36,'75 km/h',18,C,900); return SV(s); }
  if(kind==='echelle'){ s+=`<rect x="12" y="16" width="86" height="96" rx="6" fill="#E8F3E1" stroke="${INK}" stroke-width="2.5"/><path d="M22 96 L56 40 L84 76" fill="none" stroke="#7FA35F" stroke-width="3"/>`+ln(26,100,82,100,C,4)+tx(54,94,'4 cm',12,C,900)+tx(55,132,'plan 1/100',13,INK,800);
    s+=vec(104,64,124,64,INK,3)+ln(130,100,190,100,C,5)+tx(160,92,'4 m',18,C,900)+tx(160,52,'en vrai',13,INK,800)+tx(160,124,'4 × 100 = 400 cm',11,SOFT,800); return SV(s); }
  if(kind==='ratio'){ for(let i=0;i<2;i++) s+=`<rect x="${30+i*30}" y="30" width="28" height="28" rx="5" fill="${BLUE}" stroke="${INK}" stroke-width="2"/>`; for(let i=0;i<3;i++) s+=`<rect x="${30+i*30}" y="76" width="28" height="28" rx="5" fill="${ORANGE}" stroke="${INK}" stroke-width="2"/>`;
    s+=tx(150,52,'2 parts',15,BLUE,900)+tx(150,98,'3 parts',15,ORANGE,900)+tx(100,130,'ratio 2 : 3',18,C,900); return SV(s); }
  return txt(['?'],C,T);
}

/* ---------- Statistiques ---------- */
function boxes(vals,y,hl,C,T,w){ w=w||30; const x0=100-vals.length*(w+4)/2; return vals.map((v,i)=>{ const h=hl&&hl(i,v); return `<rect x="${x0+i*(w+4)}" y="${y}" width="${w}" height="30" rx="7" fill="${h?T:PAPER}" stroke="${h?C:INK}" stroke-width="${h?3.5:2}"/>`+tx(x0+i*(w+4)+w/2,y+21,fN(v),14,h?C:INK,900); }).join(''); }
function statI(kind,a,b,C,T){
  let s='';
  if(kind==='serie'||kind==='valeur'){ s+=tx(100,30,'Les notes de Sara',15,SOFT,800)+boxes([12,15,9,14,10],46,kind==='valeur'?(i=>i===1):null,C,T)+(kind==='valeur'?tx(100,110,'une valeur : 15',16,C,900):tx(100,110,'5 valeurs',16,C,900)); return SV(s); }
  if(kind==='freq'){ for(let i=0;i<25;i++){ const r=Math.floor(i/10),c=i%10; s+=person(30+c*15,22+r*34,i<8?C:'var(--sunk)').replace(/r="11"/,'r="5"').replace(/M(\S+) (\S+) q0 -22 16 -22 q16 0 16 22 z/,(m,x,y)=>`M${+x+9} ${+y-18} q0 -8 7 -8 q7 0 7 8 z`); }
    s+=tx(100,126,'8 ÷ 25 = 0,32 = 32 %',18,C,900); return SV(s); }
  if(kind==='moyp'){ const rows=[['Note','10','12','15'],['Effectif','3','5','2']]; rows.forEach((r,i)=>r.forEach((v,j)=>{ s+=`<rect x="${10+j*46}" y="${14+i*32}" width="46" height="32" fill="${j===0?'var(--sunk)':PAPER}" stroke="${INK}" stroke-width="2"/>`+tx(33+j*46,35+i*32,v,j===0?11:15,j===0?SOFT:INK,800); }));
    s+=tx(100,104,'10×3 + 12×5 + 15×2',14,INK,800)+tx(100,128,'= 120 ; 120 ÷ 10 = 12',15,C,900); return SV(s); }
  if(kind==='mediane'){ s+=boxes([9,10,12,14,15],40,(i)=>i===2,C,T)+tx(100,26,'rangées dans l’ordre',13,SOFT,800)+`<path d="M100 76 v12" stroke="${C}" stroke-width="3"/>`+tx(100,108,'médiane : 12',18,C,900)+tx(57,128,'2 valeurs',12,SOFT,800)+tx(143,128,'2 valeurs',12,SOFT,800); return SV(s); }
  if(kind==='etendue'){ s+=boxes([9,10,12,14,15],40,(i)=>i===0||i===4,C,T)+`<path d="M28 82 h144" stroke="${C}" stroke-width="3"/>`+arrowHead(24,82,'l',C)+arrowHead(176,82,'r',C)+tx(100,112,'15 − 9 = 6',20,C,900); return SV(s); }
  if(kind==='hist'){ const v=[30,62,90,54,24]; v.forEach((h,i)=>{ s+=`<rect x="${26+i*30}" y="${118-h}" width="30" height="${h}" fill="${i===2?C:T}" stroke="${INK}" stroke-width="2"/>`; });
    s+=ln(20,118,186,118,INK,3)+ln(22,118,22,14,INK,3)+['150','160','170','180','190','200'].map((l,i)=>tx(26+i*30,132,l,9,SOFT,700)).join('')+tx(110,14,'tailles (cm)',11,SOFT,800); return SV(s); }
  if(kind==='barres'){ const L=(a||'').split(','), V=(b||'').split(',').map(Number), M=Math.max(...V), top=Math.ceil(M/5)*5, H=100, y0=122, x0=32, w=Math.min(26,150/L.length-8);
    for(let g=0;g<=top;g+=5){ const y=y0-H*g/top; s+=ln(x0,y,192,y,'var(--line)',1)+tx(x0-5,y+4,String(g),9,SOFT,700,'end'); }
    V.forEach((v,i)=>{ const x=x0+8+i*(150/L.length), h=H*v/top; s+=`<rect x="${x}" y="${y0-h}" width="${w}" height="${h}" rx="3" fill="${C}" stroke="${INK}" stroke-width="1.5"/>`+tx(x+w/2,y0+13,L[i],10,INK,800); });
    s+=ln(x0,y0,192,y0,INK,2.5)+ln(x0,y0,x0,14,INK,2.5); return SV(s); }
  return txt(['?'],C,T);
}

/* ---------- Probabilités ---------- */
function dieFace(x,y,s,n,fill,col){ const p={1:[[.5,.5]],2:[[.25,.25],[.75,.75]],3:[[.25,.25],[.5,.5],[.75,.75]],4:[[.25,.25],[.75,.25],[.25,.75],[.75,.75]],5:[[.25,.25],[.75,.25],[.5,.5],[.25,.75],[.75,.75]],6:[[.25,.22],[.75,.22],[.25,.5],[.75,.5],[.25,.78],[.75,.78]]}[n];
  return `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s*0.18}" fill="${fill||'#FFFFFF'}" stroke="${INK}" stroke-width="2.5"/>`+p.map(([u,v])=>`<circle cx="${(x+u*s).toFixed(1)}" cy="${(y+v*s).toFixed(1)}" r="${(s*0.09).toFixed(1)}" fill="${col||INK}"/>`).join(''); }
function urn(x,y,w,h,balls){ let s=`<path d="M${x+w*0.18} ${y} h${w*0.64} v${h*0.12} q${w*0.18} ${h*0.08} ${w*0.18} ${h*0.3} v${h*0.46} q0 ${h*0.12} -${w*0.12} ${h*0.12} h-${w*0.76} q-${w*0.12} 0 -${w*0.12} -${h*0.12} v-${h*0.46} q0 -${h*0.22} ${w*0.18} -${h*0.3} z" fill="#E9F3FF" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
  const per=Math.max(3,Math.ceil(Math.sqrt(balls.length*1.6))), r=Math.min(9,w*0.8/per/2.2); balls.forEach((c,i)=>{ const row=Math.floor(i/per), col=i%per; s+=dot(x+w*0.12+r+col*r*2.3,y+h*0.86-r-row*r*2.2,r,c); }); return s; }
function proba(kind,a,b,c,C,T){
  let s='';
  if(kind==='de'){ s+=`<polygon points="62,46 112,30 150,48 100,64" fill="#FFFFFF" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><polygon points="100,64 150,48 150,104 100,122" fill="#E9ECF5" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`+dieFace(46,64,54,5).replace('<rect','<rect transform="skewY(0)"')+`<circle cx="106" cy="47" r="4" fill="${INK}"/><circle cx="125" cy="72" r="4" fill="${INK}"/><circle cx="137" cy="88" r="4" fill="${INK}"/><circle cx="113" cy="96" r="4" fill="${INK}"/>`; return SV(s); }
  if(kind==='issues'||kind==='evenement'){ for(let n=1;n<=6;n++){ const x=6+(n-1)*32.5, hi=kind==='evenement'&&n%2===0; s+=dieFace(x,40,28,n,hi?T:'#FFFFFF',hi?C:INK)+(hi?`<rect x="${x-3}" y="37" width="34" height="34" rx="8" fill="none" stroke="${C}" stroke-width="3"/>`:''); }
    s+=tx(100,104,kind==='evenement'?'« obtenir un nombre pair »':'6 issues',kind==='evenement'?14:18,C,900)+(kind==='evenement'?tx(100,126,'3 issues sur 6',14,INK,800):''); return SV(s); }
  if(kind==='echelle'||kind==='certain'||kind==='impossible'){ s+=`<rect x="16" y="60" width="168" height="16" rx="8" fill="url(#gp)"/><defs><linearGradient id="gp"><stop offset="0" stop-color="#E5484D"/><stop offset=".5" stop-color="#FFC233"/><stop offset="1" stop-color="#2FA65A"/></linearGradient></defs>`;
    [['0',16,'impossible','start',8],['1/2',100,'',0,0],['1',184,'certain','end',192]].forEach(([v,x,l,an,lx])=>{ const on=l&&((kind==='certain'&&v==='1')||(kind==='impossible'&&v==='0')||kind==='echelle'); s+=ln(x,54,x,82,INK,2.5)+tx(x,100,v,15,INK,900)+(on?tx(lx,124,l,13,v==='0'?RED:GREEN,900,an):''); });
    if(kind!=='echelle') s+=`<path d="M${kind==='certain'?184:16} 50 l-8 -14 h16 z" fill="${C}"/>`+tx(100,30,kind==='certain'?'P = 1':'P = 0',22,C,900); else s+=tx(100,32,'0 ≤ P ≤ 1',20,C,900);
    return SV(s); }
  if(kind==='contraire'){ s+=`<rect x="16" y="40" width="50" height="34" fill="${C}" stroke="${INK}" stroke-width="2"/><rect x="66" y="40" width="118" height="34" fill="${T}" stroke="${INK}" stroke-width="2"/>`+tx(41,62,'A',16,'#fff',900)+tx(125,62,'contraire de A',13,C,900)+tx(41,96,'0,3',15,C,900)+tx(125,96,'0,7',15,C,900)+tx(100,128,'1 − 0,3 = 0,7',18,INK,900); return SV(s); }
  if(kind==='urne'){ const r=+a||3, bl=+b||5; s+=urn(40,20,120,104,shuffle([...Array(r).fill(RED),...Array(bl).fill(BLUE)])); return SV(s); }
  if(kind==='sac'){ const balls=[...Array(+a).fill(RED),...Array(+b).fill(BLUE),...Array(+c).fill(GREEN)]; s+=`<path d="M60 40 q-34 30 -24 70 q6 22 64 22 q58 0 64 -22 q10 -40 -24 -70 z" fill="#E7C9A0" stroke="${INK}" stroke-width="3"/><path d="M66 40 q34 -14 68 0" fill="none" stroke="${INK}" stroke-width="3"/>`;
    balls.forEach((col,i)=>{ const row=Math.floor(i/5), cl=i%5; s+=dot(62+cl*19,112-row*19,8,col); }); return SV(s); }
  if(kind==='piece'){ s+=`<circle cx="58" cy="66" r="40" fill="${YEL}" stroke="${INK}" stroke-width="3"/><circle cx="58" cy="66" r="32" fill="none" stroke="#C98A00" stroke-width="2"/>`+tx(58,73,'PILE',15,'#7A4F00',900)+`<circle cx="142" cy="66" r="40" fill="#E0E3EC" stroke="${INK}" stroke-width="3"/><circle cx="142" cy="66" r="32" fill="none" stroke="${GREY}" stroke-width="2"/>`+tx(142,73,'FACE',15,'#3A3F55',900)+tx(100,128,'pile ou face ?',14,C,900); return SV(s); }
  if(kind==='arbre'){ const N=(x,y,t,col)=>`<circle cx="${x}" cy="${y}" r="11" fill="${col}" stroke="${INK}" stroke-width="2"/>`+tx(x,y+5,t,12,'#fff',900);
    s+=ln(18,70,64,36)+ln(18,70,64,104)+ln(76,36,124,18)+ln(76,36,124,52)+ln(76,104,124,88)+ln(76,104,124,122)+dot(14,70,5,INK);
    s+=N(70,36,'P',BLUE)+N(70,104,'F',ORANGE)+N(130,18,'P',BLUE)+N(130,52,'F',ORANGE)+N(130,88,'P',BLUE)+N(130,122,'F',ORANGE)+['PP','PF','FP','FF'].map((t,i)=>tx(170,[23,57,93,127][i],t,14,C,900)).join(''); return SV(s); }
  if(kind==='hasard'){ s+=urn(30,24,100,96,[RED,BLUE,GREEN,BLUE,RED,YEL,BLUE]); s+=`<circle cx="158" cy="44" r="22" fill="${T}" stroke="${C}" stroke-width="3"/>`+tx(158,54,'?',28,C,900)+`<path d="M150 80 q8 -6 16 0 M146 96 q12 10 24 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`; return SV(s); }
  if(kind==='roue'){ const n=+a||6, k1=+b||0, k2=+c||0, cx=100, cy=76, r=52; for(let i=0;i<n;i++){ const f=i<k1?C:(i<k1+k2?YEL:(n<=6&&k1===0?[BLUE,ORANGE,GREEN,RED,PURP,YEL][i%6]:'#FFFFFF')); s+=sector(cx,cy,r,i*2*Math.PI/n,(i+1)*2*Math.PI/n,f); }
    s+=dot(cx,cy,6,INK)+`<path d="M${cx} ${cy-r+6} l-8 -16 h16 z" fill="${INK}"/>`; return SV(s); }
  return txt(['?'],C,T);
}

/* ---------- Repère et fonctions ---------- */
function frame(x0,x1,y0,y1,opt){ opt=opt||{}; const L=24,R=190,TT=10,B=(opt.H||140)-12; const u=Math.min((R-L)/(x1-x0),(B-TT)/(y1-y0)); const ox=L-x0*u, oy=TT+y1*u;
  const X=x=>ox+x*u, Y=y=>oy-y*u; let s='';
  if(opt.grid) for(let i=Math.ceil(x0);i<=x1;i++) s+=ln(X(i),Y(y0),X(i),Y(y1),'var(--line)',1); if(opt.grid) for(let j=Math.ceil(y0);j<=y1;j++) s+=ln(X(x0),Y(j),X(x1),Y(j),'var(--line)',1);
  s+=ln(X(x0),Y(0),X(x1)+4,Y(0),opt.cx||INK,opt.wx||2.5)+arrowHead(X(x1)+6,Y(0),'r',opt.cx||INK)+ln(X(0),Y(y0),X(0),Y(y1)-4,opt.cy||INK,opt.wy||2.5)+arrowHead(X(0),Y(y1)-6,'u',opt.cy||INK);
  for(let i=Math.ceil(x0);i<=x1;i++) if(i){ s+=ln(X(i),Y(0)-3,X(i),Y(0)+3,INK,1.5); if(opt.labels!==false&&(u>=14||i%2===0)) s+=tx(X(i),Y(0)+13,fN(i),opt.fs||9,SOFT,700); }
  for(let j=Math.ceil(y0);j<=y1;j++) if(j){ s+=ln(X(0)-3,Y(j),X(0)+3,Y(j),INK,1.5); if(opt.labels!==false&&(u>=14||j%2===0)) s+=tx(X(0)-5,Y(j)+3,fN(j),opt.fs||9,SOFT,700,'end'); }
  s+=tx(X(0)-6,Y(0)+13,'O',10,INK,900,'end');
  return {X,Y,u,s}; }
function repI(kind,a,b,C,T){
  a=a!=null&&a!==''?+a:0; b=b!=null&&b!==''?+b:0;
  if(['axes','orig','axex','axey'].includes(kind)){ const F=frame(-2,5,-1,4,{cx:kind==='axex'||kind==='axes'?C:INK,cy:kind==='axey'||kind==='axes'?C:INK,wx:kind==='axex'?5:2.5,wy:kind==='axey'?5:2.5}); let s=F.s;
    if(kind==='axes'||kind==='axex') s+=tx(F.X(5)-2,F.Y(0)-10,'axe des abscisses',11,C,900,'end');
    if(kind==='axes'||kind==='axey') s+=tx(F.X(0)+12,F.Y(4)+10,'axe des ordonnées',11,C,900,'start');
    if(kind==='orig') s+=`<circle cx="${F.X(0)}" cy="${F.Y(0)}" r="10" fill="none" stroke="${C}" stroke-width="3"/>`+tx(F.X(0)+38,F.Y(0)-14,'O(0 ; 0)',13,C,900);
    return SV(s); }
  if(['pt','abs','ord'].includes(kind)){ const F=frame(-1,5,-1,4,{grid:true}); const X=F.X(a), Y=F.Y(b); let s=F.s+dash(X,Y,X,F.Y(0),kind==='abs'?C:SOFT,kind==='abs'?3:2)+dash(X,Y,F.X(0),Y,kind==='ord'?C:SOFT,kind==='ord'?3:2)+cross(X,Y,C)+tx(X+8,Y-8,`A(${a} ; ${b})`,13,C,900,'start');
    if(kind==='abs') s+=`<circle cx="${X}" cy="${F.Y(0)+12}" r="9" fill="none" stroke="${C}" stroke-width="2.5"/>`;
    if(kind==='ord') s+=`<circle cx="${F.X(0)-8}" cy="${Y+3}" r="9" fill="none" stroke="${C}" stroke-width="2.5"/>`;
    return SV(s); }
  if(['lin','aff','coef','b','img','graph'].includes(kind)){
    if(kind==='img'){ a=1; b=1; }
    const g=kind==='graph'; const F=g?frame(-1,4,-3,7,{grid:true,H:230,fs:11}):frame(-1,5,-1,5,{grid:true}); const f=x=>a*x+b; let s=F.s;
    const lo=g?-3:-1, hi=g?7:5; let xa=-1, xb=g?4:5; if(a){ const c1=(lo-b)/a, c2=(hi-b)/a; xa=Math.max(xa,Math.min(c1,c2)); xb=Math.min(xb,Math.max(c1,c2)); }
    s+=ln(F.X(xa),F.Y(f(xa)),F.X(xb),F.Y(f(xb)),C,3.5);
    if(g) return SVh(s,230);
    if(kind==='lin') s+=`<circle cx="${F.X(0)}" cy="${F.Y(0)}" r="7" fill="none" stroke="${ORANGE}" stroke-width="3"/>`+tx(F.X(2.2)+8,F.Y(f(2.2))+4,`f(x) = ${a}x`,12,C,900,'start');
    if(kind==='aff') s+=tx(F.X(1.8)+8,F.Y(f(1.8))+6,`f(x) = ${a}x + ${b}`,12,C,900,'start');
    if(kind==='coef'){ s+=ln(F.X(1),F.Y(f(1)),F.X(2),F.Y(f(1)),ORANGE,3)+ln(F.X(2),F.Y(f(1)),F.X(2),F.Y(f(2)),ORANGE,3)+tx(F.X(1.5),F.Y(f(1))+13,'+1',11,ORANGE,900)+tx(F.X(2)+5,F.Y(f(1.5))+4,'+'+a,11,ORANGE,900,'start'); }
    if(kind==='b') s+=`<circle cx="${F.X(0)}" cy="${F.Y(b)}" r="8" fill="none" stroke="${ORANGE}" stroke-width="3"/>`+tx(F.X(0)+12,F.Y(b)+4,`b = ${b}`,12,ORANGE,900,'start');
    if(kind==='img'){ const x=2; s+=vec(F.X(x),F.Y(0),F.X(x),F.Y(f(x))+4,ORANGE,2.5)+vec(F.X(x),F.Y(f(x)),F.X(0)+5,F.Y(f(x)),ORANGE,2.5)+tx(F.X(x),F.Y(0)+24,'x = 2',11,ORANGE,900)+tx(F.X(0)+30,F.Y(f(x))-6,'f(2) = 3',11,ORANGE,900,'start'); }
    return SV(s); }
  if(kind==='courbe'){ const F=frame(-1,5,-1,5,{grid:true}); const f=x=>0.45*(x-2)*(x-2)+0.5; let d=''; for(let i=0;i<=40;i++){ const x=-0.6+i*0.13; const y=f(x); if(y<=5) d+=(d?' L':'M')+F.X(x).toFixed(1)+' '+F.Y(y).toFixed(1); }
    return SV(F.s+`<path d="${d}" fill="none" stroke="${C}" stroke-width="3.5"/>`+[0,2,4].map(x=>dot(F.X(x),F.Y(f(x)),4,ORANGE)).join('')); }
  return txt(['?'],C,T);
}
function fnI(kind,C,T){ if(kind==='tab'){ const R=[['x','−1','0','1','2'],['f(x)','−1','1','3','5']]; let s=''; R.forEach((r,i)=>r.forEach((v,j)=>{ s+=`<rect x="${8+j*37}" y="${30+i*38}" width="37" height="38" fill="${j===0?T:PAPER}" stroke="${j===0?C:INK}" stroke-width="2"/>`+tx(26.5+j*37,55+i*38,v,j===0?13:16,j===0?C:INK,900); }));
  s+=tx(100,20,'f(x) = 2x + 1',14,C,900); return SV(s); } return txt(['?'],C,T); }

/* ---------- Aires ---------- */
function aireI(kind,C,T){
  if(kind==='tri') return SV(poly([[20,112],[180,112],[120,24]],T,C,3.5)+dash(120,24,120,112,ORANGE,2.5)+rAngle(120,112,-1,0,0,-1,9,ORANGE)+tx(100,130,'base',13,C,900)+tx(126,74,'hauteur',12,ORANGE,900,'start')+tx(46,40,'A = b × h ÷ 2',13,INK,900));
  if(kind==='cm2') return SV(`<rect x="60" y="30" width="60" height="60" fill="${T}" stroke="${C}" stroke-width="3.5"/>`+tx(90,22,'1 cm',13,INK,800)+tx(132,64,'1 cm',13,INK,800,'start')+tx(90,66,'1 cm²',15,C,900)+tx(100,124,'aire = 1 cm²',16,INK,800));
  return txt(['?'],C,T);
}

/* ---------- Solides et globe ---------- */
function solI(kind,a,b,C,T){
  let s='';
  if(kind==='disque'){ const r=+a||3; s+=`<circle cx="62" cy="70" r="52" fill="${T}" stroke="${C}" stroke-width="3.5"/>`+ln(62,70,114,70,ORANGE,3.5)+dot(62,70,4,INK)+tx(88,62,'r',16,ORANGE,900)+tx(160,52,'A = π × r²',12,INK,900)+tx(160,96,'P = 2 × π × r',11,INK,900); return SV(s); }
  if(kind==='cubes'||kind==='cm3'){ const u=kind==='cm3'?42:20, n=kind==='cm3'?[1,1,1]:[3,2,2]; const ox=kind==='cm3'?58:40, oy=kind==='cm3'?110:112;
    const cube=(i,j,k)=>{ const x=ox+i*u+k*u*0.5, y=oy-j*u-k*u*0.5; return `<polygon points="${x},${y} ${x+u},${y} ${x+u},${y-u} ${x},${y-u}" fill="${T}" stroke="${C}" stroke-width="1.6"/><polygon points="${x},${y-u} ${x+u*0.5},${y-u*1.5} ${x+u*1.5},${y-u*1.5} ${x+u},${y-u}" fill="#FFFFFF" stroke="${C}" stroke-width="1.6"/><polygon points="${x+u},${y} ${x+u*1.5},${y-u*0.5} ${x+u*1.5},${y-u*1.5} ${x+u},${y-u}" fill="${C}" fill-opacity=".4" stroke="${C}" stroke-width="1.6"/>`; };
    for(let k=n[2]-1;k>=0;k--) for(let j=0;j<n[1];j++) for(let i=0;i<n[0];i++) s+=cube(i,j,k);
    s+=kind==='cm3'?tx(79,128,'1 cm',13,INK,800)+tx(160,72,'1 cm³',18,C,900)+tx(160,96,'= 1 mL',14,INK,800):tx(170,40,'12 cubes',13,C,900)+tx(170,58,'V = 12 cm³',12,INK,800); return SV(s); }
  if(kind==='cylindre'){ const r=a||'r', h=b||'h'; s+=`<path d="M42 34 V108 A44 14 0 0 0 130 108 V34" fill="${T}" stroke="${INK}" stroke-width="3"/><ellipse cx="86" cy="34" rx="44" ry="14" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>`+ln(86,34,130,34,ORANGE,3)+dot(86,34,3,INK)+tx(108,14,`r = ${r}`+(a?' cm':''),12,ORANGE,900)+ln(146,34,146,108,C,2.5)+arrowHead(146,32,'u',C)+arrowHead(146,110,'d',C)+tx(152,76,b?`${h} cm`:'h',12,C,900,'start'); return SV(s); }
  if(kind==='cone'||kind==='cornet'){ if(kind==='cornet'){ s+=`<circle cx="100" cy="36" r="28" fill="#FFB3C7" stroke="${INK}" stroke-width="3"/><path d="M72 40 L100 132 L128 40 Z" fill="#E7B66D" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`+Array.from({length:5},(_,i)=>ln(78+i*10,44,100,120,'#C08A3A',1.5)).join('')+tx(136,40,'r = 2,5 cm',10,INK,800,'start')+tx(136,96,'h = 12 cm',10,INK,800,'start'); return SV(s); }
    s+=`<path d="M100 14 L54 108 A46 15 0 0 0 146 108 Z" fill="${T}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M54 108 A46 15 0 0 1 146 108" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="5 4"/>`+dash(100,14,100,108,C,2.5)+ln(100,108,146,108,ORANGE,3)+tx(124,124,'r',14,ORANGE,900)+tx(106,66,'h',14,C,900,'start')+rAngle(100,108,1,0,0,-1,8,C); return SV(s); }
  if(kind==='boule'){ s+=`<defs><radialGradient id="gb" cx=".35" cy=".35"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="${T}"/></radialGradient></defs><circle cx="100" cy="70" r="56" fill="url(#gb)" stroke="${C}" stroke-width="3.5"/><path d="M44 70 A56 16 0 0 0 156 70" fill="none" stroke="${C}" stroke-width="2"/><path d="M44 70 A56 16 0 0 1 156 70" fill="none" stroke="${C}" stroke-width="1.5" stroke-dasharray="5 4"/>`+ln(100,70,156,70,ORANGE,3)+dot(100,70,3.5,INK)+tx(128,64,'r',14,ORANGE,900); return SV(s); }
  if(kind==='sphere'){ s+=`<circle cx="100" cy="62" r="50" fill="none" stroke="${C}" stroke-width="4"/><path d="M50 62 A50 14 0 0 0 150 62" fill="none" stroke="${C}" stroke-width="2"/><path d="M50 62 A50 14 0 0 1 150 62" fill="none" stroke="${C}" stroke-width="1.5" stroke-dasharray="5 4"/>`+dot(100,62,3.5,INK)+tx(100,132,'la surface de la boule',12,SOFT,800); return SV(s); }
  if(kind==='base'){ s+=`<path d="M56 30 V108 A44 14 0 0 0 144 108 V30" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/><ellipse cx="100" cy="30" rx="44" ry="14" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/><path d="M56 108 A44 14 0 0 0 144 108 A44 14 0 0 0 56 108" fill="${C}" fill-opacity=".55" stroke="${C}" stroke-width="3"/>`+tx(170,118,'base',14,C,900); return SV(s); }
  if(kind==='hauteur'){ s+=poly([[40,110],[130,110],[160,86],[70,86]],T,INK,2.5)+ln(100,16,40,110,INK,2.5)+ln(100,16,130,110,INK,2.5)+ln(100,16,160,86,INK,2.5)+dash(100,16,70,86,INK,1.5)+dash(100,16,100,98,C,3)+dot(100,98,3,C)+tx(94,60,'hauteur',12,C,900,'end'); return SV(s); }
  if(kind==='prisme'){ s+=poly([[40,108],[100,108],[70,56]],T,INK,3)+poly([[100,108],[160,82],[130,30],[70,56]],'#FFFFFF',INK,2.5)+ln(70,56,130,30,INK,2.5)+dash(40,108,100,82,INK,1.5)+dash(100,82,160,82,INK,1.5)+dash(100,82,130,30,INK,1.5)+tx(54,128,'base',12,C,900); return SV(s); }
  if(kind==='pyramide'){ s+=poly([[40,110],[130,110],[100,16]],T,INK,3)+poly([[130,110],[160,86],[100,16]],'#E9ECF5',INK,3)+dash(40,110,70,86,INK,1.5)+dash(70,86,160,86,INK,1.5)+dash(70,86,100,16,INK,1.5)+dot(100,16,4,C)+tx(112,16,'sommet',11,C,900,'start'); return SV(s); }
  if(kind==='globe'||kind==='lat'||kind==='long'){ const cx=100,cy=70,r=56; s+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#CFEAFF" stroke="${INK}" stroke-width="3"/>`;
    [-30,30].forEach(l=>{ const yy=cy-r*Math.sin(l*Math.PI/180), rx=r*Math.cos(l*Math.PI/180); s+=`<ellipse cx="${cx}" cy="${yy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${(rx*0.22).toFixed(1)}" fill="none" stroke="#6AA5D8" stroke-width="1.5"/>`; });
    s+=`<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="12" fill="none" stroke="${RED}" stroke-width="3"/><ellipse cx="${cx}" cy="${cy}" rx="18" ry="${r}" fill="none" stroke="${GREEN}" stroke-width="3"/>`;
    if(kind==='globe') s+=tx(176,74,'équateur',10,RED,900,'start').replace('176','150')+tx(100,10,'N',11,INK,900)+tx(100,138,'S',11,INK,900);
    if(kind==='lat'){ const px=cx+12, py=cy-30; s+=ln(cx,cy,px,py,ORANGE,2.5)+ln(cx,cy,px+4,cy,ORANGE,2)+dot(px,py,4.5,ORANGE)+tx(px+10,py,'30° N',12,ORANGE,900,'start'); }
    if(kind==='long') s+=`<ellipse cx="${cx+20}" cy="${cy}" rx="34" ry="${r}" fill="none" stroke="${ORANGE}" stroke-width="2.5" stroke-dasharray="5 3"/>`+tx(160,26,'méridien',11,GREEN,900)+tx(160,124,'longitude',11,ORANGE,900);
    return SV(s); }
  if(kind==='section'){ s+=poly([[40,112],[130,112],[130,42],[40,42]],'#FFFFFF',INK,2.5)+poly([[130,112],[166,86],[166,16],[130,42]],'#E9ECF5',INK,2.5)+poly([[40,42],[76,16],[166,16],[130,42]],'#FFFFFF',INK,2.5);
    s+=poly([[40,78],[130,78],[166,52],[76,52]],C,C,2.5,'fill-opacity=".5"')+tx(100,132,'la section est un rectangle',12,C,900); return SV(s); }
  return txt(['?'],C,T);
}

/* ---------- Transformations ---------- */
const FLAG=[[0,0],[0,-44],[30,-34],[10,-24],[10,0]];
function flag(ox,oy,f,fill,stroke){ return poly(FLAG.map(([x,y])=>f(ox+x,oy+y)),fill,stroke||INK,3); }
function transI(kind,C,T){
  let s=''; const id=(x,y)=>[x,y];
  if(kind==='symax'){ s+=dash(100,6,100,134,C,3)+flag(40,100,id,BLUE)+flag(40,100,(x,y)=>[200-x,y],GREEN)+tx(100,138,'axe',11,C,900); return SV(s); }
  if(kind==='symc'){ s+=flag(50,74,id,BLUE)+flag(50,74,(x,y)=>[200-x,140-y],GREEN)+dash(50,74,150,66,SOFT,1.5)+dot(100,70,5,C)+tx(108,62,'O',14,C,900,'start'); return SV(s); }
  if(kind==='trans'||kind==='image'){ s+=flag(30,110,id,BLUE)+flag(30,110,(x,y)=>[x+100,y-20],GREEN)+vec(56,124,150,104,C,3.5)+(kind==='image'?tx(45,128,'figure',11,BLUE,900)+tx(150,134,'image',11,GREEN,900):''); return SV(s); }
  if(kind==='rot'){ const O=[100,96], R=(x,y)=>[O[0]+(y-O[1]),O[1]-(x-O[0])]; s+=flag(128,96,id,BLUE)+flag(128,96,R,GREEN)+dot(O[0],O[1],5,C)+tx(92,112,'O',14,C,900,'end')+`<path d="M166 72 A70 70 0 0 0 124 30" fill="none" stroke="${C}" stroke-width="3"/>`+arrowHead(122,30,'l',C)+tx(168,40,'90°',14,C,900); return SV(s); }
  if(kind==='homo'){ const O=[18,124]; s+=dot(O[0],O[1],5,C)+tx(14,110,'O',13,C,900,'end'); const P=[[46,112],[78,112],[52,88]]; const Q=P.map(([x,y])=>[O[0]+2.4*(x-O[0]),O[1]+2.4*(y-O[1])]);
    Q.forEach(q=>{ s+=dash(O[0],O[1],q[0],q[1],SOFT,1.5); }); s+=poly(Q,T,GREEN,3)+poly(P,'#DDE8FF',BLUE,3)+tx(160,40,'k = 2,4',14,C,900); return SV(s); }
  if(kind==='agr'){ s+=`<rect x="20" y="72" width="40" height="28" fill="#DDE8FF" stroke="${BLUE}" stroke-width="3"/><rect x="100" y="44" width="80" height="56" fill="${T}" stroke="${GREEN}" stroke-width="3"/>`+vec(66,86,92,86,C,3)+tx(79,76,'× 2',13,C,900)+tx(40,118,'aire 1',11,BLUE,900)+tx(140,118,'aire × 4',11,GREEN,900); return SV(s); }
  if(kind==='grid'){ const F=frame(-5,5,-5,5,{grid:true,H:200,fs:10}); const P={A:[1,1],B:[3,1],C:[1,4]}; s+=F.s+poly(Object.values(P).map(([x,y])=>[F.X(x),F.Y(y)]),'#DDE8FF',BLUE,2.5);
    Object.entries(P).forEach(([n,[x,y]])=>{ s+=dot(F.X(x),F.Y(y),3,BLUE)+tx(F.X(x)+(n==='B'?7:-6),F.Y(y)+(n==='C'?-3:12),n,13,BLUE,900,n==='B'?'start':'end'); }); return SVh(s,200); }
  return txt(['?'],C,T);
}

/* ---------- Angles ---------- */
function angI(kind,C,T){
  let s=''; const D=Math.PI/180;
  const angle=(x,y,deg,len,lab)=>ln(x,y,x+len,y,INK,3.5)+ln(x,y,x+len*Math.cos(deg*D),y-len*Math.sin(deg*D),INK,3.5)+(deg===90?rAngle(x,y,1,0,0,-1,14,C):arcA(x,y,22,0,deg*D,C,2.5,T))+(lab?tx(x+len/2,y+18,lab,12,C,900):'');
  if(kind==='types'){ s+=angle(10,90,45,46,'aigu')+angle(78,90,90,40,'droit')+angle(140,90,135,44,'obtus').replace(/x2="1(\d\d)\.\d"/,m=>m); s+=tx(33,124,'< 90°',11,SOFT,800)+tx(98,124,'= 90°',11,SOFT,800)+tx(160,124,'> 90°',11,SOFT,800); return SV(s); }
  if(kind==='aigu') return SV(angle(40,110,40,140)+tx(110,92,'40°',18,C,900));
  if(kind==='obtus') return SV(angle(110,112,130,80)+tx(118,84,'130°',18,C,900,'start'));
  if(kind==='opp'){ s+=ln(20,30,180,110,INK,3.5)+ln(20,110,180,30,INK,3.5)+arcA(100,70,30,-26.57*D,26.57*D,C,2.5,T)+arcA(100,70,30,153.43*D,206.57*D,C,2.5,T)+tx(150,74,'40°',13,C,900)+tx(50,74,'40°',13,C,900); return SV(s); }
  if(kind==='alt'||kind==='corr'||kind==='sec'){ s+=ln(8,40,192,40,INK,3)+ln(8,100,192,100,INK,3)+ln(60,130,140,10,kind==='sec'?C:INK,kind==='sec'?4:3)+tx(188,32,'(d)',11,INK,800,'end')+tx(188,92,'(d’)',11,INK,800,'end')+tx(148,16,'(Δ)',11,kind==='sec'?C:INK,800,'start');
    const th=Math.atan2(60,40);
    if(kind==='alt') s+=arcA(80,100,22,0,th,C,2.5,T)+arcA(120,40,22,Math.PI,Math.PI+th,ORANGE,2.5,'#FFE2C8');
    if(kind==='corr') s+=arcA(80,100,22,0,th,C,2.5,T)+arcA(120,40,22,0,th,ORANGE,2.5,'#FFE2C8');
    if(kind==='sec') s+=dot(80,100,4,C)+dot(120,40,4,C);
    return SV(s); }
  return txt(['?'],C,T);
}

/* ---------- Triangles ---------- */
function lbl(x,y,t,col,size){ return tx(x,y,t,size||13,col||INK,900); }
function triI(kind,C,T){
  let s=''; const D=Math.PI/180;
  if(kind==='somme'){ const A=[30,118],B=[176,118],Cc=[110,26]; s+=poly([A,B,Cc],PAPER,INK,3.5);
    const ang=(P,Q,R,col)=>{ const a1=Math.atan2(-(Q[1]-P[1]),Q[0]-P[0]), a2=Math.atan2(-(R[1]-P[1]),R[0]-P[0]); let lo=Math.min(a1,a2), hi=Math.max(a1,a2); if(hi-lo>Math.PI){ const t=lo; lo=hi; hi=t+2*Math.PI; } return arcA(P[0],P[1],18,lo,hi,col,2,col); };
    s+=ang(A,B,Cc,BLUE)+ang(B,A,Cc,ORANGE)+ang(Cc,A,B,GREEN)+tx(56,30,'a + b + c',13,INK,900)+tx(56,48,'= 180°',15,C,900); return SV(s); }
  if(kind==='iso'||kind==='equi'){ const A=kind==='iso'?[100,18]:[100,22],B=kind==='iso'?[40,118]:[44,118],Cc=kind==='iso'?[160,118]:[156,118]; s+=poly([A,B,Cc],T,C,3.5)+tick(...A,...B,kind==='iso'?2:1,INK)+tick(...A,...Cc,kind==='iso'?2:1,INK)+(kind==='equi'?tick(...B,...Cc,1,INK):'');
    if(kind==='iso') s+=arcA(B[0],B[1],20,0,59*D,ORANGE,2.5)+arcA(Cc[0],Cc[1],20,121*D,Math.PI,ORANGE,2.5);
    s+=lbl(A[0],A[1]-4,'A')+lbl(B[0]-10,B[1]+6,'B')+lbl(Cc[0]+10,Cc[1]+6,'C')+(kind==='equi'?tx(100,96,'60°',12,C,900):''); return SV(s); }
  if(kind==='rect') return SV(poly([[40,112],[170,112],[40,28]],T,C,3.5)+rAngle(40,112,1,0,0,-1,14,ORANGE)+lbl(30,124,'A')+lbl(178,124,'B')+lbl(30,26,'C'));
  if(kind==='mediatrice'){ s+=ln(40,86,160,86,INK,3.5)+cross(40,86,INK)+cross(160,86,INK)+tick(40,86,100,86,1,INK)+tick(100,86,160,86,1,INK)+ln(100,10,100,134,C,3.5)+rAngle(100,86,1,0,0,-1,11,C)+lbl(34,106,'A')+lbl(166,106,'B')+lbl(108,104,'I'); return SV(s); }
  if(kind==='hauteur'){ s+=poly([[70,20],[20,118],[180,118]],T,INK,3)+dash(70,20,70,118,C,3)+rAngle(70,118,1,0,0,-1,10,C)+lbl(70,14,'A')+lbl(14,128,'B')+lbl(186,128,'C')+lbl(76,132,'H',C); return SV(s); }
  if(kind==='semblables'){ const p=[[14,118],[60,118],[26,86]], q=p.map(([x,y])=>[96+(x-14)*2,118+(y-118)*2]); s+=poly(p,'#DDE8FF',BLUE,3)+poly(q,T,GREEN,3);
    [[p[0],0],[q[0],0]].forEach(([P])=>{ s+=arcA(P[0],P[1],12,0,69.4*D,ORANGE,2.5); }); s+=tx(37,132,'ABC',11,BLUE,900)+tx(142,132,'DEF',11,GREEN,900)+tx(150,30,'× 2',16,C,900); return SV(s); }
  const A=[36,112],B=[176,112],Cc=[36,26]; const base=(hl)=>{ let r=poly([A,B,Cc],PAPER,INK,2.5)+rAngle(36,112,1,0,0,-1,12,INK)+arcA(176,112,26,Math.PI-31.6*D,Math.PI,ORANGE,2.5,'#FFE2C8')+lbl(26,124,'A')+lbl(186,124,'B')+lbl(26,24,'C');
    if(hl.adj) r+=ln(...A,...B,BLUE,5)+tx(106,130,'côté adjacent',11,BLUE,900);
    if(hl.opp) r+=ln(...A,...Cc,RED,5)+`<text x="24" y="70" font-size="11" font-weight="900" fill="${RED}" text-anchor="middle" transform="rotate(-90 24 70)">côté opposé</text>`;
    if(hl.hyp) r+=ln(...B,...Cc,C,5)+tx(118,58,'hypoténuse',12,C,900,'start').replace('start','start');
    return r; };
  if(kind==='hyp') return SV(base({hyp:1}));
  if(kind==='adj') return SV(base({adj:1,hyp:1}));
  if(kind==='opp') return SV(base({opp:1,hyp:1}));
  if(kind==='adjopp') return SV(base({adj:1,opp:1,hyp:1}));
  if(kind==='cos') return SV(base({adj:1,hyp:1})+tx(120,30,'cos B = adj ÷ hyp',11,INK,900));
  if(kind==='sin') return SV(base({opp:1,hyp:1})+tx(120,30,'sin B = opp ÷ hyp',11,INK,900));
  if(kind==='tan') return SV(base({adj:1,opp:1})+tx(120,30,'tan B = opp ÷ adj',11,INK,900));
  if(kind==='trigo') return SV(base({})+tx(128,34,'SOH',15,RED,900)+tx(128,56,'CAH',15,BLUE,900)+tx(128,78,'TOA',15,GREEN,900));
  if(kind==='pyth'){ const a=[64,86],b=[104,86],c=[64,56]; s+=poly([a,b,[104,126],[64,126]],'#DDE8FF',BLUE,2.5)+poly([c,a,[34,86],[34,56]],'#FFE2C8',ORANGE,2.5)+poly([c,b,[134,46],[94,16]],T,C,2.5)+poly([a,b,c],PAPER,INK,3)+rAngle(64,86,1,0,0,-1,8,INK);
    s+=tx(84,110,'AB²',11,BLUE,900)+tx(49,75,'AC²',10,ORANGE,900)+tx(100,54,'BC²',12,C,900)+lbl(58,98,'A',INK,11)+lbl(110,98,'B',INK,11)+lbl(58,52,'C',INK,11)+tx(160,96,'BC² =',12,C,900)+tx(160,114,'AB² + AC²',11,INK,900); return SV(s); }
  if(kind==='thales'){ const A=[100,14],B=[30,124],Cc=[176,124],M=[68.5,63.5],N=[134.2,63.5]; s+=poly([A,B,Cc],PAPER,INK,3)+ln(...M,...N,C,3.5)+ln(...B,...Cc,C,3.5)+lbl(100,10,'A')+lbl(22,134,'B')+lbl(184,134,'C')+lbl(58,62,'M')+lbl(144,62,'N')+tx(100,92,'(MN) // (BC)',12,C,900); return SV(s); }
  if(kind==='thales2'){ const B=[30,22],Cc=[78,22],A=[100,70],M=[142,98.8],N=[113.2,98.8]; s+=ln(...B,...M,INK,3)+ln(...Cc,...N,INK,3)+ln(...B,...Cc,C,3.5)+ln(...M,...N,C,3.5)+lbl(24,18,'B')+lbl(84,18,'C')+lbl(110,70,'A')+lbl(150,112,'M')+lbl(108,112,'N')+tx(170,46,'(BC) // (MN)',11,C,900); return SV(s); }
  if(kind==='echelle'){ s+=`<rect x="150" y="10" width="40" height="112" fill="#E3D2BC" stroke="${INK}" stroke-width="2.5"/>`+ln(10,122,190,122,INK,3)+ln(100,122,150,26,'#A0662E',6)+ln(94,118,144,22,'#A0662E',2)+rAngle(150,122,-1,0,0,-1,10,C)+tx(112,64,'5 m',13,C,900,'end')+tx(125,136,'1,4 m',12,INK,900)+tx(158,74,'h ?',13,ORANGE,900,'start'); return SV(s); }
  if(kind==='ombre'){ s+=ln(6,118,196,118,INK,3)+`<rect x="56" y="70" width="8" height="48" fill="#8A5A2B"/><circle cx="60" cy="50" r="24" fill="#6BBF59" stroke="${INK}" stroke-width="2"/>`+ln(60,26,60,118,INK,1,'stroke-dasharray="3 3"')+ln(135,82,135,118,'#A0662E',5)+ln(40,11,190,124,YEL,3)+`<circle cx="26" cy="14" r="9" fill="${YEL}"/>`+tx(50,96,'?',16,ORANGE,900,'end')+tx(142,102,'1,5 m',11,INK,900,'start')+tx(160,134,'2 m',11,INK,900)+tx(120,134,'12 m',11,C,900)+ln(60,128,183,128,C,1.5)+ln(135,124,183,124,INK,1.5); return SV(s); }
  if(kind==='rampe'){ s+=poly([[16,118],[184,118],[184,84]],T,C,3)+rAngle(184,118,-1,0,0,-1,9,INK)+arcA(16,118,40,0,11.4*D,ORANGE,2.5)+tx(100,94,'6 m',14,C,900)+tx(190,104,'0,5 m',11,INK,900,'end').replace('end','end')+tx(48,134,'angle ?',11,ORANGE,900); return SV(s); }
  if(kind==='toit'){ s+=`<rect x="52" y="70" width="96" height="58" fill="#FFF3DC" stroke="${INK}" stroke-width="2.5"/><rect x="88" y="94" width="24" height="34" fill="#C98A5A" stroke="${INK}" stroke-width="2"/>`+poly([[40,70],[160,70],[100,30]],'#E5484D',INK,3)+tick(40,70,100,30,1,'#fff')+tick(100,30,160,70,1,'#fff')+arcA(100,30,16,(180+33.7)*D,(360-33.7)*D,YEL,2.5)+lbl(100,24,'A')+lbl(30,76,'B')+lbl(170,76,'C')+tx(128,24,'110°',12,C,900,'start'); return SV(s); }
  return txt(['?'],C,T);
}

/* ---------- Scratch (blocs génériques, dessinés à la main) ---------- */
const SCOL={mouv:'#4C97FF',appa:'#9966FF',even:'#FFBF00',ctrl:'#FFAB19',capt:'#5CB1D6',ope:'#59C059',vari:'#FF8C1A',stylo:'#0FBD8C'};
function sLabel(x,y,label,size){ size=size||9; const cw=size*0.6; let out='', cx=x; label.split(/(\[[^\]]*\]|\([^)]*\)|\{[^}]*\}|⚑)/).filter(Boolean).forEach(p=>{
  if(p==='⚑'){ out+=`<path d="M${cx+2} ${y+2} v-${size+3} M${cx+2} ${y-size-1} h${size} l-2 3 l2 3 h-${size}" fill="#4CBF56" stroke="#2D8A35" stroke-width="1.5"/>`; cx+=size*1.5; }
  else if(/^\[.*\]$/.test(p)||/^\(.*\)$/.test(p)){ const t=p.slice(1,-1), w=t.length*cw+10, rep=/^\(/.test(p), col=t==='réponse'?SCOL.capt:SCOL.vari; out+=`<rect x="${cx}" y="${y-size-1}" width="${w}" height="${size+6}" rx="${(size+6)/2}" fill="${rep?col:'#FFFFFF'}" stroke="rgba(0,0,0,.2)"/>`+`<text x="${cx+w/2}" y="${y+1}" font-size="${size}" font-weight="700" fill="${rep?'#FFFFFF':'#575E75'}" text-anchor="middle">${escX(t)}</text>`; cx+=w+3; }
  else if(/^\{.*\}$/.test(p)){ const t=p.slice(1,-1), w=t.length*cw+14; out+=`<path d="M${cx+6} ${y-size-1} h${w-12} l6 ${(size+6)/2} l-6 ${(size+6)/2} h-${w-12} l-6 -${(size+6)/2} z" fill="${SCOL.ope}" stroke="rgba(0,0,0,.2)"/>`+`<text x="${cx+w/2}" y="${y+1}" font-size="${size}" font-weight="700" fill="#fff" text-anchor="middle">${escX(t)}</text>`; cx+=w+3; }
  else { out+=`<text x="${cx}" y="${y+1}" font-size="${size}" font-weight="700" fill="#FFFFFF" xml:space="preserve">${escX(p)}</text>`; cx+=p.length*cw; } }); return {svg:out,end:cx}; }
function sBlock(x,y,label,col,size){ size=size||9; const L=sLabel(x+7,y+15,label,size), w=Math.max(60,L.end-x+8), h=22;
  return {h, svg:`<path d="M${x} ${y+3} q0 -3 3 -3 h7 l3 3 h9 l3 -3 h${w-28} q3 0 3 3 v${h-6} q0 3 -3 3 h-${w-28} l-3 3 h-9 l-3 -3 h-7 q-3 0 -3 -3 z" fill="${col}" stroke="rgba(0,0,0,.25)" stroke-width="1"/>`+L.svg}; }
function sHat(x,y,label,size){ size=size||9; const L=sLabel(x+7,y+24,label,size), w=Math.max(80,L.end-x+8);
  return {h:31, svg:`<path d="M${x} ${y+12} q${w*0.2} -14 ${w*0.42} 0 h${w*0.58-3} q3 0 3 3 v13 q0 3 -3 3 h-${w-31} l-3 3 h-9 l-3 -3 h-7 q-3 0 -3 -3 z" fill="${SCOL.even}" stroke="rgba(0,0,0,.25)"/>`+L.svg}; }
function sC(x,y,label,inner,col,size,elseInner){ size=size||9; const top=sBlock(x,y,label,col,size); let yy=y+22, inn=''; inner.forEach(b=>{ const r=b(x+14,yy); inn+=r.svg; yy+=r.h; }); if(!inner.length) yy+=14;
  let mid=''; if(elseInner){ mid+=`<rect x="${x}" y="${yy}" width="14" height="20" fill="${col}"/><rect x="${x}" y="${yy}" width="70" height="20" rx="3" fill="${col}" stroke="rgba(0,0,0,.25)"/>`+`<text x="${x+7}" y="${yy+14}" font-size="${size}" font-weight="700" fill="#fff">sinon</text>`; yy+=20; elseInner.forEach(b=>{ const r=b(x+14,yy); mid+=r.svg; yy+=r.h; }); }
  const arm=`<rect x="${x}" y="${y+18}" width="14" height="${yy-y-14}" fill="${col}" stroke="rgba(0,0,0,.25)"/>`, bot=`<rect x="${x}" y="${yy}" width="80" height="14" rx="3" fill="${col}" stroke="rgba(0,0,0,.25)"/>`;
  return {h:yy-y+16, svg:arm+top.svg+inn+mid+bot}; }
function stack(x,y,blocks){ let s='', yy=y; blocks.forEach(b=>{ const r=b(x,yy); s+=r.svg; yy+=r.h; }); return {svg:s,h:yy-y}; }
const B=(label,col)=>(x,y)=>sBlock(x,y,label,SCOL[col]);
const Hat=label=>(x,y)=>sHat(x,y,label);
const Cb=(label,inner,col,els)=>(x,y)=>sC(x,y,label,inner,SCOL[col||'ctrl'],9,els);
function sprite(x,y,s){ s=s||1; return `<g transform="translate(${x} ${y}) scale(${s})"><line x1="0" y1="-26" x2="0" y2="-36" stroke="${INK}" stroke-width="2.5"/><circle cx="0" cy="-38" r="4" fill="${RED}" stroke="${INK}" stroke-width="2"/><rect x="-18" y="-26" width="36" height="30" rx="10" fill="${YEL}" stroke="${INK}" stroke-width="2.5"/><circle cx="-7" cy="-13" r="4" fill="${INK}"/><circle cx="7" cy="-13" r="4" fill="${INK}"/><path d="M-6 -4 q6 5 12 0" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/><rect x="-12" y="4" width="24" height="14" rx="4" fill="${BLUE}" stroke="${INK}" stroke-width="2.5"/></g>`; }
function flagIco(x,y){ return `<path d="M${x} ${y} v-12 M${x} ${y-12} h9 l-2 3 l2 3 h-9" fill="#4CBF56" stroke="#2D8A35" stroke-width="1.5"/>`; }
function scrI(kind,C,T){
  if(kind==='bloc') return SV(sBlock(30,58,'avancer de [10] pas',SCOL.mouv,11).svg);
  if(kind==='avancer') return SV(sBlock(10,14,'avancer de [100] pas',SCOL.mouv,10).svg+sprite(40,112,.9)+dash(64,98,150,98,C,2.5)+arrowHead(156,98,'r',C)+sprite(170,112,.9).replace('<g ','<g opacity=".45" '));
  if(kind==='lutin') return SV(sprite(100,104,1.9));
  if(kind==='drapeau') return SV(sHat(24,40,'quand ⚑ est cliqué',12).svg+`<g transform="translate(150 96)"><path d="M0 0 v-40 M0 -40 h26 l-6 9 l6 9 h-26" fill="#4CBF56" stroke="#2D8A35" stroke-width="3"/></g>`);
  if(kind==='script'||kind==='programme'){ const st=stack(30,14,[Hat('quand ⚑ est cliqué'),B('avancer de [50] pas','mouv'),B('dire [Bonjour !]','appa')]); return SV(st.svg); }
  if(kind==='repeter') return SV(stack(30,16,[Cb('répéter [4] fois',[B('avancer de [100] pas','mouv'),B('tourner ↻ de [90] degrés','mouv')])]).svg);
  if(kind==='var') return SV(stack(24,22,[B('mettre score à [0]','vari'),B('ajouter [1] à score','vari')]).svg+`<rect x="40" y="90" width="120" height="30" rx="6" fill="#E9ECF5" stroke="${INK}" stroke-width="2"/>`+tx(80,110,'score',13,INK,800)+`<rect x="108" y="96" width="40" height="18" rx="5" fill="${SCOL.vari}"/>`+tx(128,109,'1',12,'#fff',900));
  if(kind==='si') return SV(stack(30,22,[Cb('si {score > 10} alors',[B('dire [Bravo !]','appa')])]).svg);
  if(kind==='sisinon') return SV(stack(22,8,[Cb('si {réponse = 7} alors',[B('dire [Gagné !]','appa')],'ctrl',[B('dire [Perdu]','appa')])]).svg);
  if(kind==='demander') return SV(sBlock(6,14,'demander [Ton âge ?] et attendre',SCOL.capt,8.5).svg+sprite(46,128,.9)+bubble(78,64,108,34,'#FFFFFF',INK,'l')+tx(132,86,'Ton âge ?',12,INK,800)+`<rect x="88" y="112" width="86" height="20" rx="10" fill="#FFFFFF" stroke="${SCOL.capt}" stroke-width="2"/>`+tx(131,126,'14',11,INK,800));
  if(kind==='algo'){ const st=['1. Je casse 2 œufs.','2. J’ajoute 100 g de farine.','3. Je mélange.','4. Je fais cuire 3 min.']; return SV(st.map((t,i)=>`<rect x="20" y="${8+i*32}" width="160" height="24" rx="8" fill="${i%2?T:PAPER}" stroke="${C}" stroke-width="2"/>`+tx(28,24+i*32,t,11,INK,800,'start')+(i<3?arrowHead(100,38+i*32,'d',C):'')).join('')); }
  if(kind==='scene'){ let s=`<rect x="10" y="10" width="180" height="120" rx="6" fill="#FFFFFF" stroke="${INK}" stroke-width="2.5"/>`+dash(10,70,190,70,SOFT,1.5)+dash(100,10,100,130,SOFT,1.5)+tx(186,64,'x',11,SOFT,900,'end')+tx(106,20,'y',11,SOFT,900,'start')+tx(18,84,'−240',9,SOFT,700,'start')+tx(184,84,'240',9,SOFT,700,'end')+tx(106,126,'−180',9,SOFT,700,'start')+tx(106,32,'180',9,SOFT,700,'start'); return SV(s+sprite(100,86,.8)+tx(130,104,'(0 ; 0)',10,C,900,'start')); }
  if(kind==='poly'){ const cx=128,cy=70,r=44; const pts=Array.from({length:6},(_,i)=>[cx+r*Math.cos(i*Math.PI/3),cy+r*Math.sin(i*Math.PI/3)]); return SV(poly(pts,'none',SCOL.stylo,4)+sprite(pts[0][0],pts[0][1]+16,.55)+tx(40,60,'6 côtés',13,C,900)+tx(40,80,'360 ÷ 6',12,INK,800)+tx(40,98,'= 60°',14,C,900)); }
  if(kind==='prog1'){ const st=stack(8,8,[Hat('quand ⚑ est cliqué'),B('demander [Choisis un nombre] et attendre','capt'),B('mettre x à (réponse)','vari'),B('mettre y à (x) × [4]','vari'),B('mettre y à (y) − [5]','vari'),B('dire (y)','appa')]); return SVh(st.svg,st.h+16,250); }
  if(kind==='prog2'){ const st=stack(20,8,[Hat('quand ⚑ est cliqué'),B('stylo en position d’écriture','stylo'),Cb('répéter [5] fois',[B('avancer de [80] pas','mouv'),B('tourner ↻ de [72] degrés','mouv')])]); return SVh(st.svg,st.h+16,250); }
  if(kind==='prog3'){ const st=stack(8,8,[Hat('quand ⚑ est cliqué'),B('mettre essais à [0]','vari'),Cb('répéter jusqu’à ce que {réponse = 7}',[B('demander [Devine le nombre] et attendre','capt'),B('ajouter [1] à essais','vari')]),B('dire (essais)','appa')]); return SVh(st.svg,st.h+16,250); }
  return txt(['?'],C,T);
}

/* ---------- Icônes des consignes et autres ---------- */
function machine(inp,out,hl,C,T){ return `<rect x="70" y="34" width="60" height="56" rx="12" fill="${T}" stroke="${C}" stroke-width="3"/>`+tx(100,58,'f',20,C,900)+tx(100,80,'×2 +1',12,INK,800)+vec(30,62,66,62,INK,3)+vec(134,62,170,62,INK,3)+`<circle cx="22" cy="62" r="15" fill="${hl==='ant'?YEL:PAPER}" stroke="${INK}" stroke-width="2.5"/>`+tx(22,68,inp,16,INK,900)+`<circle cx="182" cy="62" r="15" fill="${hl==='img'?YEL:PAPER}" stroke="${INK}" stroke-width="2.5"/>`+tx(182,68,out,16,INK,900); }
function ico2(k,C,T){
  let s='';
  switch(k){
   case 'consigne': return SV(tx(18,64,'Calcule',30,INK,900,'start')+ln(18,74,134,74,C,5)+tx(142,64,'l’aire',20,SOFT,700,'start')+tx(100,112,'Le verbe dit ce que je fais.',13,C,800));
   case 'determiner': return SV(tx(70,72,'? = 12',30,INK,900)+`<circle cx="148" cy="58" r="28" fill="${T}" fill-opacity=".6" stroke="${INK}" stroke-width="5"/>`+ln(168,78,190,104,INK,9));
   case 'justifier': return SV(bubble(14,10,172,78,T,C,'l')+tx(100,42,'15 est impair',17,INK,800)+`<rect x="26" y="52" width="40" height="24" rx="7" fill="#FFFFFF" stroke="${C}" stroke-width="2.5"/>`+tx(46,69,'car',15,C,900)+tx(72,69,'il finit par 5.',15,INK,700,'start')+tx(100,124,'✓',26,C,900));
   case 'demontrer': return SV([['Je sais que…',BLUE],['Or…',ORANGE],['Donc…',C]].map(([t,col],i)=>`<rect x="30" y="${8+i*44}" width="140" height="32" rx="10" fill="#FFFFFF" stroke="${col}" stroke-width="3"/>`+tx(100,30+i*44,t,15,col,900)+(i<2?arrowHead(100,48+i*44,'d',INK):'')).join(''));
   case 'montrer': return SV(tx(52,62,'√25',26,INK,900)+vec(84,54,112,54,C,3.5)+`<rect x="118" y="30" width="72" height="40" rx="10" fill="${T}" stroke="${C}" stroke-width="3"/>`+tx(154,57,'AB = 5',15,C,900)+tx(100,112,'La réponse est donnée.',13,SOFT,800));
   case 'deduire': return SV(`<rect x="10" y="16" width="180" height="36" rx="10" fill="#FFFFFF" stroke="${INK}" stroke-width="2.5"/>`+tx(100,40,'1. 4 stylos coûtent 6 €.',14,INK,800)+vec(100,56,100,80,C,3.5)+`<rect x="10" y="86" width="180" height="36" rx="10" fill="${T}" stroke="${C}" stroke-width="3"/>`+tx(100,110,'2. 1 stylo : 6 ÷ 4 = 1,50 €',13,C,900));
   case 'arrondi': return SV(tx(92,62,'3,1',34,C,900,'end')+tx(104,62,'4159',34,SOFT,700,'start')+dash(98,24,98,74,INK,2.5)+tx(100,116,'≈ 3,1',28,C,900));
   case 'contreexemple': return SV(bubble(10,8,180,48,'#FFFFFF',INK,'l')+tx(100,38,'pair → multiple de 4 ?',13,INK,800)+tx(70,106,'6',38,C,900)+tx(118,92,'pair ✓',13,GREEN,900,'start')+tx(118,114,'table de 4 ✗',13,RED,900,'start'));
   case 'exprimer': return lit('expr','','',C,T);
   case 'conjecturer': return SV(['1 + 2 = 3','2 + 3 = 5','3 + 4 = 7'].map((t,i)=>tx(56,32+i*28,t,15,INK,800)).join('')+vec(104,60,128,60,C,3)+tx(160,56,'toujours',12,C,900)+tx(160,74,'impair ?',14,C,900)+`<circle cx="160" cy="108" r="14" fill="${YEL}" stroke="${INK}" stroke-width="2"/>`+tx(160,114,'?',16,INK,900));
   case 'exacte': return SV(`<rect x="46" y="28" width="108" height="72" rx="16" fill="${T}" stroke="${C}" stroke-width="4"/>`+tx(100,80,'√2',44,C,900)+tx(100,124,'valeur exacte',14,INK,800));
   case 'approchee': return SV(tx(60,72,'√2',36,INK,900)+tx(112,72,'≈',36,C,900)+tx(160,72,'1,41',30,C,900)+tx(100,118,'presque égal',14,SOFT,800));
   case 'affirmation': return SV(bubble(14,12,172,64,'#FFFFFF',INK,'l')+tx(100,52,'« 2³ = 6 »',20,INK,900)+`<rect x="34" y="96" width="60" height="30" rx="10" fill="${T}" stroke="${GREEN}" stroke-width="3"/>`+tx(64,117,'vrai ?',13,GREEN,900)+`<rect x="106" y="96" width="60" height="30" rx="10" fill="#FFE3E0" stroke="${RED}" stroke-width="3"/>`+tx(136,117,'faux ?',13,RED,900));
   case 'propriete': return SV(`<path d="M100 26 Q66 14 26 22 V116 Q66 108 100 120 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/><path d="M100 26 Q134 14 174 22 V116 Q134 108 100 120 Z" fill="${T}" stroke="${INK}" stroke-width="3"/>`+tx(62,58,'Si…',16,C,900)+tx(136,58,'alors…',15,C,900)+[78,92].map(y=>ln(36,y,90,y,'#AEB6CC',4)+ln(110,y,164,y,'#AEB6CC',4)).join(''));
   case 'codage': return SV(ln(20,34,100,34,INK,3.5)+ln(100,34,180,34,INK,3.5)+cross(100,34,INK)+tick(20,34,100,34,2,C)+tick(100,34,180,34,2,C)+tx(100,62,'même longueur',13,C,900)+ln(40,124,140,124,INK,3.5)+ln(40,124,40,78,INK,3.5)+rAngle(40,124,1,0,0,-1,14,C)+tx(62,108,'angle droit',13,C,900,'start'));
   case 'altitude': return SV(`<rect x="0" y="80" width="200" height="60" fill="#8FD3F5"/>`+poly([[20,80],[70,20],[120,80]],'#9C7B5B',INK,2.5)+ln(0,80,200,80,INK,2.5)+tx(190,76,'0 m',11,INK,900,'end')+tx(70,14,'+ 800 m',11,GREEN,900)+`<g transform="translate(150 112)"><ellipse cx="0" cy="0" rx="16" ry="7" fill="#FFC233" stroke="${INK}" stroke-width="2"/></g>`+tx(150,134,'− 20 m',11,RED,900));
   case 'miseeq': return SV(page(10,14,70,100,5)+vec(86,64,108,64,C,3)+tx(152,48,'Soit x…',15,C,900)+tx(152,84,'3x + 2 = 10',14,INK,900));
   case 'machine': return SV(machine('3','7','',C,T)+tx(100,120,'f(3) = 7',16,C,900));
   case 'imageant': return SV(machine('3','7','',C,T)+tx(6,98,'antécédent',11,ORANGE,900,'start')+tx(194,98,'image',11,GREEN,900,'end')+tx(100,124,'f(3) = 7',15,C,900));
   case 'image': return SV(machine('3','7','img',C,T)+tx(178,100,'image',13,C,900)+tx(100,124,'7 est l’image de 3',13,INK,800));
   case 'antecedent': return SV(machine('3','7','ant',C,T)+tx(6,100,'antécédent',11,C,900,'start')+tx(100,124,'3 est un antécédent de 7',12,INK,800));
  }
  return txt(['?'],C,T);
}

/* ---------- Aiguillage des nouvelles familles ---------- */
function renderIll2(fam,args,C,T){
  switch(fam){
    case 'nl2': return nl2(args[0],args[1],args[2],args[3],C,T);
    case 'fr2': return fr2(args[0],args[1],args[2],args[3],args[4],C,T);
    case 'pw': return pw(args[0],args[1],args[2],C,T);
    case 'arith': return arith(args[0],args[1],args[2],C,T);
    case 'lit': return lit(args[0],args[1],args[2],C,T);
    case 'eq': return eqI(args[0],args[1],args[2],C,T);
    case 'prop': return prop(args[0],args[1],args[2],args[3],C,T);
    case 'stat': return statI(args[0],args[1],args[2],C,T);
    case 'proba': return proba(args[0],args[1],args[2],args[3],C,T);
    case 'rep': return repI(args[0],args[1],args[2],C,T);
    case 'fn': return fnI(args[0],C,T);
    case 'aire': return aireI(args[0],C,T);
    case 'sol': return solI(args[0],args[1],args[2],C,T);
    case 'trans': return transI(args[0],C,T);
    case 'ang': return angI(args[0],C,T);
    case 'tri': return triI(args[0],C,T);
    case 'scr': return scrI(args[0],C,T);
    case 'ico2': return ico2(args[0],C,T);
  }
  return null;
}
