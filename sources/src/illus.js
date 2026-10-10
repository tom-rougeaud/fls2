/* =====================================================================
   ILLUSTRATIONS — chaque mot a une image dessinée en SVG (aucun fichier
   externe). Spécification dans le JSON : "famille:arg1|arg2|…"
   ===================================================================== */
const INK='var(--ink)', SOFT='var(--soft)', PAPER='var(--panel)', LINE='var(--line)';
function escX(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function SV(inner){return `<svg class="ill" viewBox="0 0 200 140" aria-hidden="true" focusable="false">${inner}</svg>`;}
function tx(x,y,s,size,fill,w,anchor){return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${w||700}" fill="${fill||INK}" text-anchor="${anchor||'middle'}">${escX(s)}</text>`;}
function star(cx,cy,r,fill){let p='';for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*0.45:r;p+=`${(cx+rr*Math.cos(a)).toFixed(1)},${(cy+rr*Math.sin(a)).toFixed(1)} `;}return `<polygon points="${p}" fill="${fill}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;}
function arrowHead(x,y,dir,col){const d={r:`${x-10},${y-7} ${x},${y} ${x-10},${y+7}`,l:`${x+10},${y-7} ${x},${y} ${x+10},${y+7}`,u:`${x-7},${y+10} ${x},${y} ${x+7},${y+10}`,d:`${x-7},${y-10} ${x},${y} ${x+7},${y-10}`}[dir];return `<polyline points="${d}" fill="none" stroke="${col}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;}

/* ---------- Texte avec marques : {coloré} [encadré] __ (case vide) ---------- */
function parseMarks(line){
  const out=[]; const re=/\{([^}]*)\}|\[([^\]]*)\]|(__)/g; let last=0,m;
  while((m=re.exec(line))){ if(m.index>last) out.push({t:line.slice(last,m.index),k:'p'});
    if(m[1]!=null) out.push({t:m[1],k:'c'}); else if(m[2]!=null) out.push({t:m[2],k:'b'}); else out.push({t:'',k:'blank'});
    last=re.lastIndex; }
  if(last<line.length) out.push({t:line.slice(last),k:'p'}); return out;
}
function txt(lines,C,T){
  const n=lines.length; let base=n===1?36:n===2?28:21; const gap=base*1.5;
  let out=''; const y0=70-(n-1)*gap/2+base*0.36;
  lines.forEach((line,i)=>{
    const parts=parseMarks(line); let size=base;
    const units=parts.reduce((s,p)=>s+(p.k==='blank'?2.4:p.t.length)+(p.k==='b'?0.9:0),0);
    if(units*size*0.58>186) size=186/(units*0.58);
    const cw=size*0.58; const total=units*cw; let x=100-total/2; const y=y0+i*gap;
    parts.forEach(p=>{
      if(p.k==='blank'){ out+=`<rect x="${x.toFixed(1)}" y="${(y-size*0.82).toFixed(1)}" width="${(2.2*cw).toFixed(1)}" height="${(size*1.08).toFixed(1)}" rx="6" fill="${T}" stroke="${C}" stroke-width="2.5" stroke-dasharray="5 4"/>`; x+=2.4*cw; return; }
      const w=p.t.length*cw;
      if(p.k==='b'){ out+=`<rect x="${x.toFixed(1)}" y="${(y-size*0.86).toFixed(1)}" width="${(w+cw*0.9).toFixed(1)}" height="${(size*1.16).toFixed(1)}" rx="9" fill="${T}" stroke="${C}" stroke-width="3"/>`; x+=cw*0.45; }
      if(p.t.trim()) out+=`<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${size.toFixed(1)}" font-weight="${p.k==='p'?600:800}" fill="${p.k==='p'?INK:C}" textLength="${w.toFixed(1)}" lengthAdjust="spacingAndGlyphs" xml:space="preserve">${escX(p.t)}</text>`;
      x+=w+(p.k==='b'?cw*0.45:0);
    });
  });
  return SV(out);
}

/* ---------- Matériel ---------- */
const TOOLS={
 crayon:()=>`<g transform="rotate(-18 100 70)"><rect x="34" y="58" width="112" height="24" rx="3" fill="#FFC233" stroke="${INK}" stroke-width="2.5"/><line x1="34" y1="66" x2="146" y2="66" stroke="#E0A000" stroke-width="2"/><line x1="34" y1="74" x2="146" y2="74" stroke="#E0A000" stroke-width="2"/><path d="M146 58 L178 70 L146 82 Z" fill="#F5D7A8" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="M169 66.6 L178 70 L169 73.4 Z" fill="#3A3F55"/><rect x="24" y="58" width="12" height="24" fill="#B9BFCC" stroke="${INK}" stroke-width="2.5"/><rect x="10" y="58" width="15" height="24" rx="6" fill="#F28B9B" stroke="${INK}" stroke-width="2.5"/></g>`,
 stylo:()=>`<g transform="rotate(-18 100 70)"><rect x="40" y="61" width="104" height="18" rx="9" fill="#3D6FE0" stroke="${INK}" stroke-width="2.5"/><path d="M144 63 L172 70 L144 77 Z" fill="#DADFEA" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="170" cy="70" r="2.2" fill="#1D2240"/><rect x="22" y="59" width="44" height="22" rx="10" fill="#2B4FB0" stroke="${INK}" stroke-width="2.5"/><rect x="32" y="51" width="36" height="6" rx="3" fill="#2B4FB0" stroke="${INK}" stroke-width="2"/></g>`,
 gomme:()=>`<g transform="rotate(-12 100 70)"><rect x="45" y="45" width="110" height="50" rx="10" fill="#F28B9B" stroke="${INK}" stroke-width="3"/><path d="M100 45 h45 a10 10 0 0 1 10 10 v30 a10 10 0 0 1 -10 10 h-45 z" fill="#5B8DEF" stroke="${INK}" stroke-width="3"/></g>`,
 taille:()=>`<rect x="8" y="64" width="62" height="16" fill="#FFC233" stroke="${INK}" stroke-width="2.5"/><path d="M70 64 L90 72 L70 80 Z" fill="#F5D7A8" stroke="${INK}" stroke-width="2.5"/><rect x="88" y="42" width="78" height="60" rx="12" fill="#4FC3A1" stroke="${INK}" stroke-width="3"/><circle cx="114" cy="72" r="13" fill="${PAPER}" stroke="${INK}" stroke-width="3"/><line x1="128" y1="52" x2="156" y2="58" stroke="#9AA3B5" stroke-width="5" stroke-linecap="round"/>`,
 regle:()=>{let t='';for(let i=0;i<=16;i++){const x=20+i*10;t+=`<line x1="${x}" y1="48" x2="${x}" y2="${i%2?58:66}" stroke="${INK}" stroke-width="2"/>`;if(i%2===0)t+=tx(x,82,i/2,11,INK,700);}return `<rect x="10" y="48" width="180" height="44" rx="6" fill="#FFE27A" stroke="${INK}" stroke-width="3"/>${t}`;},
 equerre:()=>{let t='';for(let i=1;i<12;i++)t+=`<line x1="${34+i*11}" y1="118" x2="${34+i*11}" y2="${i%2?112:108}" stroke="${INK}" stroke-width="1.6"/>`;return `<path d="M30 122 L30 18 L172 122 Z" fill="#9FD3FF" fill-opacity=".75" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M52 104 L52 66 L104 104 Z" fill="${PAPER}" stroke="${INK}" stroke-width="2.5"/><rect x="30" y="106" width="16" height="16" fill="none" stroke="#E5484D" stroke-width="2.5"/>${t}`;},
 compas:()=>`<line x1="40" y1="133" x2="168" y2="133" stroke="#C9D1EA" stroke-width="2.5" stroke-linecap="round"/><line x1="97" y1="28" x2="67" y2="114" stroke="#7A8194" stroke-width="8" stroke-linecap="round"/><path d="M63 112 L71 115 L64 133 Z" fill="#C9CED9" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><line x1="103" y1="28" x2="127" y2="92" stroke="#7A8194" stroke-width="8" stroke-linecap="round"/><g transform="translate(131 104) rotate(-20.4)"><rect x="-6.5" y="-20" width="13" height="26" rx="2" fill="#FFC233" stroke="${INK}" stroke-width="2.2"/><path d="M-6.5 6 L6.5 6 L0 21 Z" fill="#F5D7A8" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M-2.4 15.5 L2.4 15.5 L0 21 Z" fill="${INK}"/></g><circle cx="100" cy="24" r="10" fill="#5B8DEF" stroke="${INK}" stroke-width="3"/><rect x="95" y="3" width="10" height="14" rx="3" fill="#5B8DEF" stroke="${INK}" stroke-width="2.5"/>`,
 rapporteur:()=>{let t='';for(let a=0;a<=180;a+=10){const r=Math.PI*a/180,c=Math.cos(r),s=Math.sin(r);t+=`<line x1="${(100+68*c).toFixed(1)}" y1="${(118-68*s).toFixed(1)}" x2="${(100+(a%30?76:80)*c).toFixed(1)}" y2="${(118-(a%30?76:80)*s).toFixed(1)}" stroke="${INK}" stroke-width="1.8"/>`;}return `<path d="M14 118 A86 86 0 0 1 186 118 Z" fill="#B9F0D9" fill-opacity=".85" stroke="${INK}" stroke-width="3"/>${t}<path d="M60 118 A40 40 0 0 1 140 118 Z" fill="${PAPER}" stroke="${INK}" stroke-width="2"/><circle cx="100" cy="118" r="3.5" fill="#E5484D"/>`+tx(28,112,'0',10)+tx(172,112,'180',10)+tx(100,46,'90',10);},
 calculatrice:()=>{let b='';const k=['7','8','9','4','5','6','1','2','3','0','=','+'];k.forEach((c,i)=>{const x=68+(i%3)*24,y=60+Math.floor(i/3)*17;b+=`<rect x="${x}" y="${y}" width="18" height="13" rx="4" fill="${c==='='?'#FFC233':'#E9ECF5'}" stroke="${INK}" stroke-width="1.5"/>`+tx(x+9,y+10,c,9,'#1D2240',800);});return `<rect x="58" y="10" width="84" height="124" rx="12" fill="#3A3F55" stroke="${INK}" stroke-width="3"/><rect x="66" y="20" width="68" height="30" rx="5" fill="#C8E6C9"/>`+tx(129,42,'12+8',16,'#1D2240',800,'end')+b;},
 surligneur:()=>`<rect x="18" y="98" width="128" height="18" rx="4" fill="#FFF04D"/><g transform="rotate(-28 110 60)"><rect x="70" y="44" width="96" height="32" rx="9" fill="#FFE600" stroke="${INK}" stroke-width="3"/><rect x="52" y="49" width="22" height="22" rx="4" fill="#3A3F55"/><path d="M52 49 L36 55 L36 65 L52 71 Z" fill="#FFF04D" stroke="${INK}" stroke-width="2"/></g>`,
 crayoncouleur:()=>['#E5484D','#3D6FE0','#2FA65A','#FFB000'].map((c,i)=>`<g transform="translate(${36+i*34},0)"><rect x="0" y="40" width="20" height="86" fill="${c}" stroke="${INK}" stroke-width="2.5"/><path d="M0 40 L10 12 L20 40 Z" fill="#F5D7A8" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="M6.4 22 L10 12 L13.6 22 Z" fill="${c}"/></g>`).join(''),
 ciseaux:()=>`<circle cx="46" cy="44" r="18" fill="none" stroke="#E5484D" stroke-width="8"/><circle cx="46" cy="98" r="18" fill="none" stroke="#E5484D" stroke-width="8"/><path d="M62 52 L180 92" stroke="#9AA3B5" stroke-width="10" stroke-linecap="round"/><path d="M62 90 L180 50" stroke="#B8BFCC" stroke-width="10" stroke-linecap="round"/><circle cx="104" cy="71" r="4.5" fill="#1D2240"/>`,
 colle:()=>`<rect x="66" y="40" width="48" height="86" rx="7" fill="#FFD43B" stroke="${INK}" stroke-width="3"/><rect x="66" y="66" width="48" height="30" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/>`+tx(90,86,'colle',13,'#C2332A',800)+`<rect x="63" y="116" width="54" height="14" rx="4" fill="#F2B705" stroke="${INK}" stroke-width="2.5"/><rect x="73" y="20" width="34" height="22" rx="9" fill="#FFFFFF" stroke="${INK}" stroke-width="2.5"/><g transform="rotate(18 150 92)"><rect x="128" y="62" width="44" height="40" rx="8" fill="#FFD43B" stroke="${INK}" stroke-width="3"/><rect x="128" y="62" width="44" height="10" rx="4" fill="#F2B705" stroke="${INK}" stroke-width="2"/></g>`,
 cahier:()=>{let l='';for(let i=0;i<4;i++)l+=`<line x1="80" y1="${78+i*9}" x2="134" y2="${78+i*9}" stroke="#9FB4E8" stroke-width="2"/>`;return `<rect x="52" y="12" width="100" height="118" rx="8" fill="#FF8A3D" stroke="${INK}" stroke-width="3"/><rect x="52" y="12" width="16" height="118" rx="4" fill="#D96A22"/><rect x="74" y="30" width="66" height="34" rx="6" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/><line x1="82" y1="42" x2="132" y2="42" stroke="#9AA3B5" stroke-width="3"/><line x1="82" y1="52" x2="118" y2="52" stroke="#9AA3B5" stroke-width="3"/>${l}`;},
 feuille:()=>{let l='';for(let i=0;i<8;i++)l+=`<line x1="66" y1="${36+i*11}" x2="140" y2="${36+i*11}" stroke="#9FB4E8" stroke-width="2"/>`;return `<path d="M58 12 H128 L148 32 V130 H58 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M128 12 V32 H148" fill="#E9ECF5" stroke="${INK}" stroke-width="2.5"/>${l}<line x1="74" y1="24" x2="74" y2="130" stroke="#F28B9B" stroke-width="2"/>`;},
 copie:()=>{let g='';for(let i=1;i<10;i++){g+=`<line x1="22" y1="${18+i*11}" x2="178" y2="${18+i*11}" stroke="#C9D5F2" stroke-width="1.5"/>`;}return `<rect x="20" y="16" width="80" height="112" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/><rect x="100" y="16" width="80" height="112" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>${g}<line x1="100" y1="16" x2="100" y2="128" stroke="${INK}" stroke-width="3"/><line x1="34" y1="16" x2="34" y2="128" stroke="#F28B9B" stroke-width="2"/><line x1="114" y1="16" x2="114" y2="128" stroke="#F28B9B" stroke-width="2"/>`;},
 classeur:()=>`<rect x="46" y="12" width="112" height="118" rx="8" fill="#8B5CF6" stroke="${INK}" stroke-width="3"/><rect x="46" y="12" width="26" height="118" rx="6" fill="#6D3FD8"/>${[38,70,102].map(y=>`<circle cx="59" cy="${y}" r="7" fill="none" stroke="#D9DCE6" stroke-width="4"/>`).join('')}<rect x="88" y="34" width="54" height="28" rx="5" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/>`,
 trousse:()=>`<rect x="56" y="24" width="12" height="44" fill="#3D6FE0" stroke="${INK}" stroke-width="2"/><rect x="80" y="16" width="12" height="52" fill="#FFC233" stroke="${INK}" stroke-width="2"/><rect x="104" y="28" width="12" height="40" fill="#E5484D" stroke="${INK}" stroke-width="2"/><rect x="22" y="56" width="156" height="66" rx="30" fill="#FF6FA5" stroke="${INK}" stroke-width="3"/><path d="M40 62 ${Array.from({length:12},(_,i)=>`L${46+i*10} ${i%2?62:58}`).join(' ')}" fill="none" stroke="${INK}" stroke-width="2.5"/><circle cx="160" cy="62" r="6" fill="#D9DCE6" stroke="${INK}" stroke-width="2"/>`,
 tableau:()=>`<rect x="14" y="14" width="172" height="96" rx="6" fill="#2F6B4F" stroke="#8A5A2B" stroke-width="7"/>`+tx(100,72,'3 + 4 = 7',26,'#FFFFFF',700)+`<rect x="40" y="114" width="120" height="8" rx="3" fill="#8A5A2B"/><rect x="56" y="108" width="18" height="6" rx="2" fill="#FFFFFF"/>`
};

/* ---------- Gestes (consignes) montrés sur un mot ---------- */
function markSvg(kind,C,T){
  const word=(x,y,s,op)=>`<text x="${x}" y="${y}" font-size="40" font-weight="800" fill="${INK}" text-anchor="middle" ${op?`opacity="${op}"`:''}>${s}</text>`;
  switch(kind){
   case 'souligner': return SV(word(100,80,'mot')+`<line x1="52" y1="94" x2="148" y2="94" stroke="${C}" stroke-width="6" stroke-linecap="round"/>`);
   case 'surligner': return SV(`<rect x="48" y="44" width="104" height="48" rx="8" fill="#FFF04D"/>`+word(100,80,'mot'));
   case 'entourer': return SV(`<ellipse cx="100" cy="68" rx="66" ry="38" fill="none" stroke="${C}" stroke-width="5"/>`+word(100,82,'mot'));
   case 'barrer': return SV(word(100,82,'mot')+`<line x1="44" y1="68" x2="156" y2="68" stroke="${C}" stroke-width="6" stroke-linecap="round"/>`);
   case 'cocher': return SV(`<rect x="34" y="38" width="52" height="52" rx="8" fill="${PAPER}" stroke="${INK}" stroke-width="4"/><path d="M44 64 L57 78 L80 46" fill="none" stroke="${C}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><rect x="114" y="38" width="52" height="52" rx="8" fill="${PAPER}" stroke="${INK}" stroke-width="4"/>`);
   case 'relier': return SV(`<circle cx="40" cy="40" r="9" fill="${INK}"/><circle cx="40" cy="100" r="9" fill="${INK}"/><circle cx="160" cy="40" r="9" fill="${INK}"/><circle cx="160" cy="100" r="9" fill="${INK}"/><path d="M48 42 C100 46 100 96 152 99" fill="none" stroke="${C}" stroke-width="5" stroke-linecap="round"/><path d="M48 99 C100 96 100 46 152 41" fill="none" stroke="${C}" stroke-width="5" stroke-linecap="round" opacity=".45"/>`);
   case 'completer': return txt(['3 + __ = 8'],C,T);
   case 'colorier': return SV(`<path d="M100 18 L124 60 L172 66 L136 98 L146 132 L100 114 L54 132 L64 98 L28 66 L76 60 Z" fill="${PAPER}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><clipPath id="clipStar"><path d="M100 18 L124 60 L172 66 L136 98 L146 132 L100 114 L54 132 L64 98 L28 66 L76 60 Z"/></clipPath><g clip-path="url(#clipStar)">${Array.from({length:9},(_,i)=>`<line x1="${20+i*10}" y1="140" x2="${60+i*10}" y2="10" stroke="${C}" stroke-width="8"/>`).join('')}</g>`);
   case 'recopier': return SV(`<rect x="10" y="44" width="76" height="52" rx="10" fill="${T}" stroke="${INK}" stroke-width="2.5"/>`+tx(48,80,'abc',28,INK,800)+`<line x1="94" y1="70" x2="110" y2="70" stroke="${C}" stroke-width="5"/>`+arrowHead(116,70,'r',C)+`<rect x="122" y="44" width="70" height="52" rx="10" fill="${PAPER}" stroke="${C}" stroke-width="3" stroke-dasharray="6 4"/>`+tx(157,80,'abc',28,C,800));
   case 'corriger': return SV(tx(84,92,'4 + 3 =',32,INK,700)+tx(160,92,'6',36,INK,700)+`<line x1="146" y1="98" x2="174" y2="66" stroke="${C}" stroke-width="5" stroke-linecap="round"/>`+tx(160,48,'7',36,C,800));
   case 'effacer': return SV(word(84,84,'mot',0.25)+`<g transform="rotate(-20 150 70)"><rect x="120" y="50" width="60" height="34" rx="7" fill="#F28B9B" stroke="${INK}" stroke-width="3"/><path d="M150 50 h23 a7 7 0 0 1 7 7 v20 a7 7 0 0 1 -7 7 h-23 z" fill="#5B8DEF" stroke="${INK}" stroke-width="3"/></g>`);
  }
  return txt(['?'],C,T);
}

/* ---------- Icônes diverses ---------- */
function bubble(x,y,w,h,fill,stroke,tail){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${fill}" stroke="${stroke}" stroke-width="3"/><path d="M${tail==='r'?x+w-28:x+20} ${y+h-1} l${tail==='r'?14:-4} 18 l${tail==='r'?4:16} -18" fill="${fill}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/><rect x="${tail==='r'?x+w-30:x+18}" y="${y+h-4}" width="24" height="6" fill="${fill}"/>`;}
function page(x,y,w,h,lines,hl,C){let s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>`;for(let i=0;i<lines;i++){const yy=y+18+i*14;s+=`<line x1="${x+12}" y1="${yy}" x2="${x+w-12-(i===lines-1?30:0)}" y2="${yy}" stroke="#AEB6CC" stroke-width="4" stroke-linecap="round"/>`;}return s;}
function person(x,y,col){return `<circle cx="${x}" cy="${y}" r="11" fill="${col}" stroke="${INK}" stroke-width="2.5"/><path d="M${x-16} ${y+36} q0 -22 16 -22 q16 0 16 22 z" fill="${col}" stroke="${INK}" stroke-width="2.5"/>`;}
function clock(cx,cy,r,h,m,hiH,hiM,C){let t='';for(let i=0;i<12;i++){const a=i*Math.PI/6;t+=`<line x1="${(cx+(r-4)*Math.sin(a)).toFixed(1)}" y1="${(cy-(r-4)*Math.cos(a)).toFixed(1)}" x2="${(cx+(r-10)*Math.sin(a)).toFixed(1)}" y2="${(cy-(r-10)*Math.cos(a)).toFixed(1)}" stroke="${INK}" stroke-width="2"/>`;}const ah=(h%12+m/60)*Math.PI/6,am=m*Math.PI/30;return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>${t}<line x1="${cx}" y1="${cy}" x2="${(cx+r*0.5*Math.sin(ah)).toFixed(1)}" y2="${(cy-r*0.5*Math.cos(ah)).toFixed(1)}" stroke="${hiH?C:INK}" stroke-width="${hiH?7:5}" stroke-linecap="round"/><line x1="${cx}" y1="${cy}" x2="${(cx+r*0.78*Math.sin(am)).toFixed(1)}" y2="${(cy-r*0.78*Math.cos(am)).toFixed(1)}" stroke="${hiM?C:INK}" stroke-width="${hiM?5:3}" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="4" fill="${INK}"/>`;}
function balanceSvg(tilt,C,T){const dy=tilt?14:0;return `<path d="M80 128 L120 128 L100 98 Z" fill="${T}" stroke="${INK}" stroke-width="3"/><line x1="100" y1="98" x2="100" y2="40" stroke="${INK}" stroke-width="5"/><line x1="36" y1="${44+dy}" x2="164" y2="${44-dy}" stroke="${C}" stroke-width="6" stroke-linecap="round"/><line x1="36" y1="${44+dy}" x2="36" y2="${74+dy}" stroke="${INK}" stroke-width="2.5"/><line x1="164" y1="${44-dy}" x2="164" y2="${74-dy}" stroke="${INK}" stroke-width="2.5"/><path d="M12 ${74+dy} h48 a24 12 0 0 1 -48 0 z" fill="${T}" stroke="${INK}" stroke-width="2.5"/><path d="M140 ${74-dy} h48 a24 12 0 0 1 -48 0 z" fill="${T}" stroke="${INK}" stroke-width="2.5"/><circle cx="100" cy="40" r="6" fill="${C}"/>`+(tilt?tx(36,68+dy,'54',16,C,800)+tx(164,68-dy,'45',16,INK,800):tx(36,68,'5 + 3',13,INK,800)+tx(164,68,'8',16,INK,800));}

const ICONS={
 lire:(C,T)=>`<path d="M100 32 Q66 20 26 28 V114 Q66 106 100 118 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M100 32 Q134 20 174 28 V114 Q134 106 100 118 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>${[46,60,74,88].map(y=>`<line x1="38" y1="${y}" x2="88" y2="${y+2}" stroke="${C}" stroke-width="3.5" stroke-linecap="round"/><line x1="112" y1="${y+2}" x2="162" y2="${y}" stroke="#AEB6CC" stroke-width="3.5" stroke-linecap="round"/>`).join('')}`,
 ecrire:(C)=>`<path d="M14 104 q10 -26 20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="${C}" stroke-width="5" stroke-linecap="round"/><g transform="rotate(-50 140 70)"><rect x="100" y="62" width="84" height="18" fill="#FFC233" stroke="${INK}" stroke-width="2.5"/><path d="M100 62 L80 71 L100 80 Z" fill="#F5D7A8" stroke="${INK}" stroke-width="2.5"/><rect x="184" y="62" width="10" height="18" rx="4" fill="#F28B9B" stroke="${INK}" stroke-width="2.5"/></g>`,
 tracer:(C)=>`<rect x="16" y="76" width="168" height="34" rx="5" fill="#FFE27A" stroke="${INK}" stroke-width="3"/>${Array.from({length:16},(_,i)=>`<line x1="${26+i*10}" y1="76" x2="${26+i*10}" y2="${i%2?84:90}" stroke="${INK}" stroke-width="1.6"/>`).join('')}<line x1="26" y1="70" x2="150" y2="70" stroke="${C}" stroke-width="5" stroke-linecap="round"/><g transform="rotate(-55 150 60)"><rect x="150" y="54" width="70" height="14" fill="#FFC233" stroke="${INK}" stroke-width="2"/><path d="M150 54 L134 61 L150 68 Z" fill="#F5D7A8" stroke="${INK}" stroke-width="2"/></g>`,
 mesurer:(C)=>`<line x1="30" y1="44" x2="170" y2="44" stroke="${C}" stroke-width="6" stroke-linecap="round"/>`+tx(100,30,'14 cm',18,C,800)+`<rect x="22" y="56" width="160" height="34" rx="5" fill="#FFE27A" stroke="${INK}" stroke-width="3"/>${Array.from({length:15},(_,i)=>`<line x1="${30+i*10}" y1="56" x2="${30+i*10}" y2="${i%2?64:70}" stroke="${INK}" stroke-width="1.6"/>`).join('')}`,
 calculer:(C,T)=>`<g transform="rotate(-30 160 100)"><rect x="140" y="96" width="56" height="12" fill="#FFC233" stroke="${INK}" stroke-width="2"/><path d="M140 96 L126 102 L140 108 Z" fill="#F5D7A8" stroke="${INK}" stroke-width="2"/></g>`+tx(90,74,'17 + 5 =',32,INK,700)+tx(90,112,'?',34,C,800),
 poser:(C)=>tx(46,54,'134 + 52',17,INK,700)+`<line x1="46" y1="66" x2="46" y2="96" stroke="${C}" stroke-width="4"/>`+arrowHead(46,102,'d',C)+[['134',46],['+ 52',78],['?',118]].map(([s,y])=>tx(166,y,s,24,s==='?'?C:INK,800,'end')).join('')+`<line x1="108" y1="88" x2="170" y2="88" stroke="${INK}" stroke-width="3"/>`,
 verifier:(C,T)=>`<circle cx="86" cy="62" r="42" fill="${T}" stroke="${INK}" stroke-width="6"/><line x1="116" y1="92" x2="158" y2="130" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M64 62 L80 78 L110 46" fill="none" stroke="${C}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`,
 repondre:(C,T)=>bubble(12,14,74,54,'#FFFFFF',INK,'l')+tx(49,54,'?',36,INK,800)+bubble(102,56,88,54,T,C,'r')+tx(146,95,'12 €',24,C,800),
 expliquer:(C,T)=>bubble(30,14,140,92,T,C,'l')+[38,58,78].map((y,i)=>tx(52,y+8,`${i+1}`,16,C,800)+`<line x1="66" y1="${y+3}" x2="${150-i*14}" y2="${y+3}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`).join(''),
 observer:(C,T)=>`<path d="M14 70 Q100 -6 186 70 Q100 146 14 70 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="4"/><circle cx="100" cy="70" r="30" fill="${C}"/><circle cx="100" cy="70" r="13" fill="#1D2240"/><circle cx="108" cy="62" r="5" fill="#FFFFFF"/>`,
 decouper:(C)=>`<rect x="26" y="26" width="92" height="92" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="8 6"/><g transform="translate(96 60) scale(.62)">${TOOLS.ciseaux()}</g>`,
 coller:(C,T)=>page(18,20,96,110,6)+`<rect x="40" y="46" width="70" height="56" rx="4" fill="${T}" stroke="${C}" stroke-width="3" transform="rotate(-8 75 74)"/><g transform="translate(96 16) scale(.62)"><rect x="66" y="40" width="48" height="86" rx="7" fill="#FFD43B" stroke="${INK}" stroke-width="3"/><rect x="66" y="66" width="48" height="30" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/><rect x="63" y="116" width="54" height="14" rx="4" fill="#F2B705" stroke="${INK}" stroke-width="2.5"/><rect x="73" y="20" width="34" height="22" rx="9" fill="#FFFFFF" stroke="${INK}" stroke-width="2.5"/></g>`,
 balance:(C,T)=>balanceSvg(false,C,T),
 comparer:(C,T)=>`<rect x="12" y="20" width="62" height="50" rx="11" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/><rect x="126" y="20" width="62" height="50" rx="11" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>`+tx(43,56,'45',30,INK,800)+tx(157,56,'54',30,INK,800)+`<circle cx="100" cy="45" r="18" fill="${T}" stroke="${C}" stroke-width="3"/>`+tx(100,55,'?',27,C,800)+[['<',58],['=',100],['>',142]].map(([s,x])=>`<rect x="${x-16}" y="90" width="32" height="32" rx="9" fill="${T}" stroke="${C}" stroke-width="2.5"/>`+tx(x,114,s,24,C,800)).join(''),
 tete:(C,T)=>`<path d="M30 132 V108 Q20 104 24 92 L18 84 Q22 78 26 76 Q20 36 60 28 Q98 22 104 64 Q106 90 90 104 V132 Z" fill="#F5D7A8" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><circle cx="112" cy="54" r="5" fill="${T}" stroke="${C}" stroke-width="2"/><circle cx="124" cy="40" r="7" fill="${T}" stroke="${C}" stroke-width="2"/>`+`<rect x="118" y="6" width="78" height="30" rx="15" fill="${T}" stroke="${C}" stroke-width="3"/>`+tx(157,27,'20 + 30',15,C,800),
 enonce:()=>page(36,10,128,122,7),
 probleme:(C,T)=>page(22,14,110,114,6)+`<circle cx="150" cy="96" r="34" fill="${T}" stroke="${C}" stroke-width="4"/>`+tx(150,110,'?',40,C,800),
 question:(C,T)=>bubble(40,12,120,94,T,C,'l')+tx(100,84,'?',70,C,800),
 donnee:(C,T)=>`<rect x="20" y="20" width="160" height="100" rx="8" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>`+[42,64,86,108].map(y=>`<line x1="34" y1="${y}" x2="166" y2="${y}" stroke="#AEB6CC" stroke-width="4" stroke-linecap="round"/>`).join('')+`<rect x="58" y="32" width="38" height="20" rx="5" fill="#FFF04D"/>`+tx(77,48,'12',16,C,800)+`<rect x="104" y="76" width="50" height="20" rx="5" fill="#FFF04D"/>`+tx(129,92,'5 €',16,C,800),
 combien:(C,T)=>[0,1,2,3].map(i=>`<ellipse cx="62" cy="${118-i*14}" rx="34" ry="11" fill="#FFC233" stroke="${INK}" stroke-width="2.5"/>`).join('')+bubble(110,14,80,70,T,C,'l')+tx(150,68,'?',48,C,800),
 chaque:(C,T)=>[40,100,160].map(x=>person(x,70,T)+star(x,30,13,C)).join(''),
 par:(C,T)=>[0,1,2].map(r=>[0,1,2,3].map(c=>`<rect x="${26+c*26}" y="${22+r*34}" width="18" height="22" rx="4" fill="${T}" stroke="${INK}" stroke-width="2"/>`).join('')+`<line x1="134" y1="${33+r*34}" x2="150" y2="${33+r*34}" stroke="${C}" stroke-width="3"/>`+tx(170,40+r*34,'4',22,C,800)).join(''),
 ticket:(C,T)=>`<path d="M54 8 H146 V124 l-9 8 l-9 -8 l-9 8 l-9 -8 l-9 8 l-9 -8 l-9 8 l-9 -8 l-9 8 l-9 -8 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`+[24,40,56].map(y=>`<line x1="66" y1="${y}" x2="104" y2="${y}" stroke="#AEB6CC" stroke-width="4" stroke-linecap="round"/><line x1="118" y1="${y}" x2="134" y2="${y}" stroke="#AEB6CC" stroke-width="4" stroke-linecap="round"/>`).join('')+`<line x1="62" y1="70" x2="138" y2="70" stroke="${INK}" stroke-width="2" stroke-dasharray="4 3"/><rect x="62" y="80" width="76" height="30" rx="7" fill="${T}" stroke="${C}" stroke-width="3"/>`+tx(100,102,'25 €',20,C,800),
 etiquette:(C,T)=>`<path d="M40 40 L130 40 L170 76 L130 112 L40 112 Z" fill="${T}" stroke="${C}" stroke-width="4" stroke-linejoin="round"/><circle cx="140" cy="76" r="7" fill="#FFFFFF" stroke="${INK}" stroke-width="2.5"/>`+tx(86,86,'2,50 €',24,C,800),
 couter:(C,T)=>`<g transform="translate(-20 4) scale(.7)">${TOOLS.cahier()}</g><line x1="96" y1="40" x2="120" y2="54" stroke="${INK}" stroke-width="2.5"/><path d="M118 44 L176 44 L192 64 L176 84 L118 84 Z" fill="${T}" stroke="${C}" stroke-width="3" stroke-linejoin="round"/>`+tx(150,71,'3 €',22,C,800),
 resoudre:(C,T)=>`<circle cx="50" cy="70" r="34" fill="${PAPER}" stroke="${INK}" stroke-width="4"/>`+tx(50,86,'?',44,INK,800)+`<line x1="92" y1="70" x2="112" y2="70" stroke="${C}" stroke-width="5"/>`+arrowHead(118,70,'r',C)+`<circle cx="152" cy="70" r="34" fill="${T}" stroke="${C}" stroke-width="4"/><path d="M134 70 L148 84 L170 56" fill="none" stroke="${C}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
 etape:(C,T)=>[0,1,2].map(i=>`<rect x="${24+i*52}" y="${92-i*30}" width="52" height="${36+i*30}" fill="${i===2?T:PAPER}" stroke="${i===2?C:INK}" stroke-width="3"/>`+tx(50+i*52,118-i*0,`${i+1}`,22,i===2?C:INK,800)).join('')
};

/* ---------- Points / quantités ---------- */
function dots(kind,a,b,C,T){
  a=+a; b=+b; let s='';
  const dot=(x,y,f,r)=>`<circle cx="${x}" cy="${y}" r="${r||9}" fill="${f}" stroke="${INK}" stroke-width="2"/>`;
  if(kind==='add'){ for(let i=0;i<a;i++) s+=dot(22+i*24,36,'#5B8DEF'); s+=tx(30+a*24,44,'+',24,C,800); for(let i=0;i<b;i++) s+=dot(54+a*24+i*24,36,'#FFB000');
    s+=`<line x1="100" y1="56" x2="100" y2="80" stroke="${C}" stroke-width="4"/>`+arrowHead(100,86,'d',C);
    for(let i=0;i<a+b;i++) s+=dot(100-(a+b-1)*12+i*24,112,i<a?'#5B8DEF':'#FFB000'); return SV(s);}
  if(kind==='sub'){ for(let i=0;i<a;i++){ const x=100-(a-1)*16+i*32; s+=dot(x,56,'#5B8DEF',12); if(i>=a-b) s+=`<line x1="${x-16}" y1="40" x2="${x+16}" y2="72" stroke="${C}" stroke-width="5" stroke-linecap="round"/><line x1="${x+16}" y1="40" x2="${x-16}" y2="72" stroke="${C}" stroke-width="5" stroke-linecap="round"/>`; }
    s+=`<path d="M${100+(a-1)*16-(b-1)*32-8} 90 q${(b-1)*16+8} 30 ${(b-1)*32+16} 0" fill="none" stroke="${C}" stroke-width="3"/>`; return SV(s);}
  if(kind==='mul'){ for(let r=0;r<a;r++){ s+=`<rect x="${100-b*14-8}" y="${30+r*30-13}" width="${b*28+16}" height="26" rx="13" fill="${T}" stroke="${C}" stroke-width="2"/>`; for(let c=0;c<b;c++) s+=dot(100-(b-1)*14+c*28,30+r*30,C,9); } return SV(s);}
  if(kind==='div'){ const per=a/b, cols=['#5B8DEF','#FFB000','#2FA65A','#E5484D']; for(let g=0;g<b;g++){ const cx=100-(b-1)*30+g*60; s+=`<rect x="${cx-24}" y="16" width="48" height="110" rx="20" fill="${T}" stroke="${C}" stroke-width="3"/>`; for(let i=0;i<per;i++) s+=dot(cx,34+i*25,cols[g%4],9); } return SV(s);}
  if(kind==='count'){ for(let i=0;i<a;i++){ const x=100-(a-1)*17+i*34; s+=star(x,58,15,'#FFC233')+tx(x,104,`${i+1}`,22,C,800); } return SV(s);}
  if(kind==='entout'){ for(let i=0;i<a;i++) s+=dot(24+i*26,50,'#5B8DEF'); for(let i=0;i<b;i++) s+=dot(118+i*22,50,'#FFB000');
    s+=`<path d="M16 72 q0 14 14 14 h56 q14 0 14 12 q0 -12 14 -12 h66 q14 0 14 -14" fill="none" stroke="${C}" stroke-width="4"/>`+tx(100,130,'?',30,C,800); return SV(s);}
  if(kind==='share'){ const per=a/b; for(let g=0;g<b;g++){ const x=100-(b-1)*29+g*58; s+=person(x,30,T); for(let i=0;i<per;i++) s+=dot(x-(per-1)*6.5+i*13,104,'#FFB000',6);} return SV(s);}
  return txt(['?'],C,T);
}

/* ---------- Opération posée ---------- */
function pose(op,a,b,mode,C,T){
  a=+a; b=+b; let s=''; const cw=19, xr=140, fs=28;
  if(op==='÷'){
    const q=Math.floor(a/b), r=a%b;
    s+=tx(92,48,String(a),fs,INK,700,'end')+`<line x1="102" y1="24" x2="102" y2="112" stroke="${INK}" stroke-width="3"/>`+tx(112,48,String(b),fs,INK,700,'start')+`<line x1="102" y1="58" x2="166" y2="58" stroke="${INK}" stroke-width="3"/>`+tx(112,90,String(q),fs,INK,700,'start');
    s+=`<rect x="${92-String(r).length*cw-8}" y="80" width="${String(r).length*cw+14}" height="38" rx="9" fill="${T}" stroke="${C}" stroke-width="3"/>`+tx(90,110,String(r),fs,C,800,'end');
    return SV(s);
  }
  const res = op==='+'?a+b: op==='−'?a-b: a*b;
  const digits=(n,y,col,w)=>String(n).split('').reverse().map((d,i)=>tx(xr-(i+0.5)*cw,y,d,fs,col||INK,w||700)).join('');
  s+=digits(a,44)+digits(b,80)+tx(xr-(Math.max(String(a).length,String(b).length,String(res).length)+0.9)*cw,80,op,fs,C,800);
  const L=Math.max(String(a).length,String(b).length,String(res).length)+1;
  s+=`<line x1="${xr-L*cw-6}" y1="92" x2="${xr+4}" y2="92" stroke="${INK}" stroke-width="3"/>`;
  if(mode==='res'||mode==='ret'){
    s+=digits(res,124, mode==='res'?C:INK, 800);
    if(mode==='ret' && op==='+'){ let c=0; const A=String(a).split('').reverse(), B=String(b).split('').reverse();
      for(let i=0;i<Math.max(A.length,B.length);i++){ const t=(+A[i]||0)+(+B[i]||0)+c; c=t>9?1:0; if(c){ const x=xr-(i+1.5)*cw; s+=`<circle cx="${x}" cy="14" r="11" fill="${T}" stroke="${C}" stroke-width="2.5"/>`+tx(x,20,'1',16,C,800);} } }
  } else s+=tx(xr-0.5*cw,124,'?',fs,C,800);
  return SV(s);
}

/* ---------- Tableau de numération ---------- */
function pv(num,which,C,T){
  let cols, digs;
  if(num.includes(',')){ const [e,d]=num.split(','); cols=['U',',',...(d.length>=1?['1/10']:[]),...(d.length>=2?['1/100']:[])]; digs=[e,',',...d.split('')]; }
  else { const all=['M','C','D','U']; cols=all.slice(4-num.length); digs=num.split(''); }
  const target={u:'U',d:'D',c:'C',m:'M',di:'1/10',ce:'1/100'}[which];
  const w=Math.min(40,170/cols.length), x0=100-cols.length*w/2; let s='';
  cols.forEach((c,i)=>{ const x=x0+i*w; const hi=c===target; if(c===','){ s+=tx(x+w/2,96,',',40,INK,800); return; }
    s+=`<rect x="${x}" y="26" width="${w}" height="26" fill="${hi?T:'var(--sunk)'}" stroke="${hi?C:INK}" stroke-width="${hi?3:2}"/>`+tx(x+w/2,45,c,c.length>2?11:16,hi?C:SOFT,800);
    s+=`<rect x="${x}" y="52" width="${w}" height="60" fill="${hi?T:PAPER}" stroke="${hi?C:INK}" stroke-width="${hi?3:2}"/>`+tx(x+w/2,96,digs[i],36,hi?C:INK,800); });
  return SV(s);
}

/* ---------- Fractions ---------- */
function sector(cx,cy,r,a0,a1,fill){const x0=cx+r*Math.sin(a0),y0=cy-r*Math.cos(a0),x1=cx+r*Math.sin(a1),y1=cy-r*Math.cos(a1);return `<path d="M${cx} ${cy} L${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${a1-a0>Math.PI?1:0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" fill="${fill}" stroke="${INK}" stroke-width="2.5"/>`;}
function disc(n,d,C,T,cx,cy,r){cx=cx||100;cy=cy||70;r=r||56;let s='';for(let i=0;i<d;i++)s+=sector(cx,cy,r,i*2*Math.PI/d,(i+1)*2*Math.PI/d,i<n?C:'#FFFFFF');return s;}
function frac(n,d,hl,C,T){
  const cN=hl==='num'?C:INK, cD=hl==='den'?C:INK;
  let s='';
  if(hl==='num') s+=`<rect x="40" y="16" width="60" height="50" rx="10" fill="${T}" stroke="${C}" stroke-width="3"/>`;
  if(hl==='den') s+=`<rect x="40" y="76" width="60" height="50" rx="10" fill="${T}" stroke="${C}" stroke-width="3"/>`;
  s+=tx(70,56,n,42,cN,800)+`<line x1="40" y1="71" x2="100" y2="71" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`+tx(70,116,d,42,cD,800);
  s+=disc(+n,+d,C,T,150,70,36);
  return SV(s);
}

/* ---------- Droite graduée ---------- */
function nl(kind,C,T){
  let s=`<line x1="10" y1="70" x2="190" y2="70" stroke="${INK}" stroke-width="3"/>`+arrowHead(192,70,'r',INK);
  const tick=(x,lab,hi)=>`<line x1="${x}" y1="62" x2="${x}" y2="78" stroke="${hi?C:INK}" stroke-width="${hi?4:2.5}"/>`+(lab!==''?tx(x,102,lab,hi?24:18,hi?C:INK,800):'');
  if(kind==='graduee'){ for(let i=0;i<=10;i++) s+=tick(18+i*16.5,String(i),false); return SV(s);}
  if(kind==='entre'){ s+=tick(40,'5')+tick(100,'7',true)+tick(160,'10'); s+=`<path d="M44 46 q56 -26 112 0" fill="none" stroke="${C}" stroke-width="3" stroke-dasharray="5 4"/>`+`<circle cx="100" cy="70" r="8" fill="${C}"/>`; return SV(s);}
  if(kind==='avant'||kind==='apres'){ const hiX=kind==='avant'?50:150; s+=tick(50,kind==='avant'?'19':'',kind==='avant')+tick(100,'20')+tick(150,kind==='apres'?'21':'',kind==='apres');
    s+=`<path d="M100 50 Q${(100+hiX)/2} 22 ${hiX} 50" fill="none" stroke="${C}" stroke-width="4"/>`+arrowHead(hiX,52,'d',C)+`<circle cx="${hiX}" cy="70" r="8" fill="${C}"/>`; return SV(s);}
  return SV(s);
}

/* ---------- Graphiques et tableaux ---------- */
function bars(vals,hiFn,C,T,x0){x0=x0||28;return vals.map((v,i)=>`<rect x="${x0+i*30}" y="${124-v}" width="22" height="${v}" rx="4" fill="${hiFn(i,v)?C:T}" stroke="${hiFn(i,v)?C:INK}" stroke-width="2"/>`).join('')+`<line x1="${x0-8}" y1="124" x2="${x0+vals.length*30}" y2="124" stroke="${INK}" stroke-width="3"/>`;}
function grid(hl,C,T){let s='';for(let r=0;r<3;r++)for(let c=0;c<4;c++){const hi=(hl.r===r&&hl.c==null)||(hl.c===c&&hl.r==null)||(hl.r===r&&hl.c===c);s+=`<rect x="${24+c*38}" y="${20+r*34}" width="38" height="34" fill="${hi?T:(r===0?'var(--sunk)':PAPER)}" stroke="${hi?C:INK}" stroke-width="${hi?3.5:2}"/>`;}
  const v=[['','A','B','C'],['1','4','7','2'],['2','5','9','6']];v.forEach((row,r)=>row.forEach((t,c)=>{if(t)s+=tx(43+c*38,43+r*34,t,16,INK,700);}));return s;}
function chart(kind,C,T){
  switch(kind){
   case 'tableau': return SV(grid({},C,T));
   case 'ligne': return SV(grid({r:1},C,T));
   case 'colonne': return SV(grid({c:2},C,T));
   case 'case': return SV(grid({r:2,c:2},C,T));
   case 'barres': return SV(bars([50,84,36,100,64],()=>true,C,T,36));
   case 'max': return SV(bars([50,84,36,100,64],(i,v)=>v===100,C,T,36));
   case 'min': return SV(bars([50,84,36,100,64],(i,v)=>v===36,C,T,36));
   case 'moyenne': return SV(bars([50,84,36,100,64],()=>false,C,T,36)+`<line x1="26" y1="57" x2="186" y2="57" stroke="${C}" stroke-width="4" stroke-dasharray="8 5"/>`);
   case 'croissant': return SV(bars([24,46,70,96],()=>true,C,T,46)+`<path d="M40 30 L150 14" stroke="${C}" stroke-width="3"/>`+arrowHead(156,13,'r',C));
   case 'decroissant': return SV(bars([96,70,46,24],()=>true,C,T,46));
   case 'ranger': return SV(tx(100,52,'9   2   5',30,INK,700)+`<line x1="100" y1="64" x2="100" y2="80" stroke="${C}" stroke-width="4"/>`+arrowHead(100,86,'d',C)+tx(100,122,'2   5   9',30,C,800));
   case 'courbe': return SV(`<line x1="24" y1="122" x2="186" y2="122" stroke="${INK}" stroke-width="3"/><line x1="24" y1="122" x2="24" y2="14" stroke="${INK}" stroke-width="3"/><polyline points="36,96 64,70 92,82 120,44 148,58 176,26" fill="none" stroke="${C}" stroke-width="4" stroke-linejoin="round"/>`+[[36,96],[64,70],[92,82],[120,44],[148,58],[176,26]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" fill="${C}"/>`).join(''));
   case 'camembert': return SV(sector(100,70,58,0,2.4,C)+sector(100,70,58,2.4,4.4,T)+sector(100,70,58,4.4,2*Math.PI,'#FFC233'));
   case 'axes': return SV(`<line x1="30" y1="118" x2="186" y2="118" stroke="${C}" stroke-width="6"/>`+arrowHead(190,118,'r',C)+`<line x1="30" y1="118" x2="30" y2="14" stroke="${C}" stroke-width="6"/>`+arrowHead(30,10,'u',C)+[60,90,120,150].map(x=>`<line x1="${x}" y1="112" x2="${x}" y2="124" stroke="${INK}" stroke-width="2"/>`).join('')+[90,62,34].map(y=>`<line x1="24" y1="${y}" x2="36" y2="${y}" stroke="${INK}" stroke-width="2"/>`).join(''));
   case 'legende': return SV(sector(56,70,44,0,2.6,C)+sector(56,70,44,2.6,2*Math.PI,'#FFC233')+`<rect x="112" y="34" width="80" height="72" rx="10" fill="${T}" stroke="${C}" stroke-width="3"/><rect x="122" y="48" width="16" height="16" fill="${C}"/><line x1="146" y1="56" x2="180" y2="56" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><rect x="122" y="76" width="16" height="16" fill="#FFC233" stroke="${INK}" stroke-width="1.5"/><line x1="146" y1="84" x2="174" y2="84" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`);
   case 'effectif': return SV([0,1,2,3].map(i=>`<line x1="${30+i*16}" y1="36" x2="${30+i*16}" y2="104" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`).join('')+`<line x1="22" y1="100" x2="88" y2="40" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><line x1="104" y1="36" x2="104" y2="104" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><line x1="120" y1="36" x2="120" y2="104" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`+tx(150,82,'→',24,C,800)+tx(178,84,'7',30,C,800));
   case 'pourcent': { let s=''; for(let i=0;i<100;i++){ const r=Math.floor(i/10), c=i%10; s+=`<rect x="${50+c*10}" y="${20+r*10}" width="9" height="9" rx="1.5" fill="${i<25?C:T}"/>`; } return SV(s+tx(176,76,'%',26,C,800)); }
   case 'prop': return SV(`<rect x="20" y="30" width="138" height="72" fill="${PAPER}" stroke="${INK}" stroke-width="2"/><line x1="20" y1="66" x2="158" y2="66" stroke="${INK}" stroke-width="2"/>`+[66,112].map(x=>`<line x1="${x}" y1="30" x2="${x}" y2="102" stroke="${INK}" stroke-width="2"/>`).join('')+[['1','3'],['2','6'],['4','12']].map(([a,b],i)=>tx(43+i*46,56,a,20,INK,700)+tx(43+i*46,92,b,20,C,800)).join('')+`<path d="M166 50 q22 16 0 32" fill="none" stroke="${C}" stroke-width="3"/>`+tx(184,72,'×3',15,C,800));
   case 'deplus': return SV(`<rect x="20" y="30" width="100" height="30" rx="5" fill="${T}" stroke="${INK}" stroke-width="2.5"/><rect x="20" y="82" width="100" height="30" rx="5" fill="${T}" stroke="${INK}" stroke-width="2.5"/><rect x="120" y="82" width="50" height="30" rx="5" fill="${C}" stroke="${C}" stroke-width="2.5"/>`+tx(145,103,'+5',18,'#FFFFFF',800));
   case 'demoins': return SV(`<rect x="20" y="30" width="150" height="30" rx="5" fill="${T}" stroke="${INK}" stroke-width="2.5"/><rect x="20" y="82" width="100" height="30" rx="5" fill="${T}" stroke="${INK}" stroke-width="2.5"/><rect x="120" y="82" width="50" height="30" rx="5" fill="none" stroke="${C}" stroke-width="3" stroke-dasharray="6 4"/>`+tx(145,103,'−5',18,C,800));
  }
  return txt(['?'],C,T);
}

/* ---------- Géométrie ---------- */
function cross(x,y,col){return `<path d="M${x-7} ${y-7} L${x+7} ${y+7} M${x+7} ${y-7} L${x-7} ${y+7}" stroke="${col}" stroke-width="3.5" stroke-linecap="round"/>`;}
function shape(name,C,T){
  const S={
   point:()=>cross(100,74,C)+tx(116,60,'A',22,C,800),
   segment:()=>`<line x1="40" y1="76" x2="160" y2="76" stroke="${C}" stroke-width="5" stroke-linecap="round"/>`+cross(40,76,INK)+cross(160,76,INK)+tx(40,110,'A',20)+tx(160,110,'B',20),
   droite:()=>`<line x1="4" y1="96" x2="196" y2="44" stroke="${C}" stroke-width="5"/>`+cross(62,80,INK)+cross(138,60,INK)+tx(58,106,'A',20)+tx(134,88,'B',20),
   milieu:()=>`<line x1="30" y1="76" x2="170" y2="76" stroke="${INK}" stroke-width="4"/>`+cross(30,76,INK)+cross(170,76,INK)+`<line x1="62" y1="68" x2="66" y2="84" stroke="${INK}" stroke-width="2.5"/><line x1="134" y1="68" x2="138" y2="84" stroke="${INK}" stroke-width="2.5"/>`+cross(100,76,C)+`<circle cx="100" cy="76" r="14" fill="none" stroke="${C}" stroke-width="3"/>`+tx(30,110,'A',18)+tx(170,110,'B',18)+tx(100,54,'I',22,C,800),
   angle:()=>`<path d="M40 120 L180 120 M40 120 L140 34" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/><path d="M40 120 L90 120 A50 50 0 0 0 78 87 Z" fill="${T}" stroke="${C}" stroke-width="3.5"/>`,
   angledroit:()=>`<path d="M50 124 L180 124 M50 124 L50 14" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/><rect x="50" y="98" width="26" height="26" fill="${T}" stroke="${C}" stroke-width="3.5"/>`,
   degre:()=>`<path d="M30 120 L184 120 M30 120 L163 43" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/><path d="M90 120 A60 60 0 0 0 82 90" fill="none" stroke="${C}" stroke-width="4"/>`+tx(130,108,'30°',24,C,800),
   sommet:()=>`<polygon points="100,22 30,122 170,122" fill="${PAPER}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><circle cx="100" cy="22" r="14" fill="none" stroke="${C}" stroke-width="4"/><circle cx="100" cy="22" r="5" fill="${C}"/>`,
   cote:()=>`<polygon points="100,22 30,122 170,122" fill="${PAPER}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><line x1="30" y1="122" x2="170" y2="122" stroke="${C}" stroke-width="9" stroke-linecap="round"/>`,
   triangle:()=>`<polygon points="100,18 26,124 174,124" fill="${T}" stroke="${C}" stroke-width="5" stroke-linejoin="round"/>`,
   carre:()=>`<rect x="48" y="18" width="104" height="104" fill="${T}" stroke="${C}" stroke-width="5"/>`,
   rectangle:()=>`<rect x="18" y="38" width="164" height="72" fill="${T}" stroke="${C}" stroke-width="5"/>`,
   losange:()=>`<polygon points="100,10 160,70 100,130 40,70" fill="${T}" stroke="${C}" stroke-width="5" stroke-linejoin="round"/>`,
   cercle:()=>`<circle cx="100" cy="70" r="56" fill="${T}" stroke="${C}" stroke-width="5"/>`,
   centre:()=>`<circle cx="100" cy="70" r="56" fill="none" stroke="${INK}" stroke-width="3"/>`+cross(100,70,C)+`<circle cx="100" cy="70" r="13" fill="none" stroke="${C}" stroke-width="3"/>`+tx(118,64,'O',20,C,800),
   rayon:()=>`<circle cx="100" cy="70" r="56" fill="none" stroke="${INK}" stroke-width="3"/><line x1="100" y1="70" x2="156" y2="70" stroke="${C}" stroke-width="6" stroke-linecap="round"/>`+cross(100,70,INK),
   diametre:()=>`<circle cx="100" cy="70" r="56" fill="none" stroke="${INK}" stroke-width="3"/><line x1="44" y1="70" x2="156" y2="70" stroke="${C}" stroke-width="6" stroke-linecap="round"/>`+cross(100,70,INK),
   paralleles:()=>`<line x1="10" y1="48" x2="190" y2="28" stroke="${C}" stroke-width="5"/><line x1="10" y1="112" x2="190" y2="92" stroke="${C}" stroke-width="5"/>`,
   perpendiculaires:()=>`<line x1="20" y1="80" x2="180" y2="80" stroke="${C}" stroke-width="5"/><line x1="100" y1="8" x2="100" y2="134" stroke="${C}" stroke-width="5"/><rect x="100" y="58" width="22" height="22" fill="none" stroke="${INK}" stroke-width="3"/>`,
   figure:()=>`<polygon points="44,24 14,82 74,82" fill="${T}" stroke="${C}" stroke-width="3.5" stroke-linejoin="round"/><circle cx="140" cy="48" r="32" fill="${T}" stroke="${C}" stroke-width="3.5"/><rect x="70" y="92" width="44" height="40" fill="${T}" stroke="${C}" stroke-width="3.5"/>`,
   symetrie:()=>`<path d="M100 22 L58 60 V122 H142 V60 Z" fill="${T}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><rect x="88" y="90" width="24" height="32" fill="${PAPER}" stroke="${INK}" stroke-width="2.5"/><line x1="100" y1="6" x2="100" y2="136" stroke="${C}" stroke-width="4" stroke-dasharray="9 6"/>`,
   cube:()=>`<polygon points="60,46 120,46 120,116 60,116" fill="${T}" stroke="${INK}" stroke-width="3"/><polygon points="60,46 86,22 146,22 120,46" fill="${PAPER}" stroke="${INK}" stroke-width="3"/><polygon points="120,46 146,22 146,92 120,116" fill="var(--sunk)" stroke="${INK}" stroke-width="3"/>`,
   pave:()=>`<polygon points="30,56 140,56 140,118 30,118" fill="${T}" stroke="${INK}" stroke-width="3"/><polygon points="30,56 62,30 172,30 140,56" fill="${PAPER}" stroke="${INK}" stroke-width="3"/><polygon points="140,56 172,30 172,92 140,118" fill="var(--sunk)" stroke="${INK}" stroke-width="3"/>`,
   cylindre:()=>`<path d="M60 30 V110 A40 14 0 0 0 140 110 V30" fill="${T}" stroke="${INK}" stroke-width="3"/><ellipse cx="100" cy="30" rx="40" ry="14" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>`,
   face:()=>`<polygon points="60,46 120,46 120,116 60,116" fill="${C}" stroke="${INK}" stroke-width="3"/><polygon points="60,46 86,22 146,22 120,46" fill="${PAPER}" stroke="${INK}" stroke-width="3"/><polygon points="120,46 146,22 146,92 120,116" fill="var(--sunk)" stroke="${INK}" stroke-width="3"/>`,
   horizontal:()=>`<line x1="20" y1="70" x2="180" y2="70" stroke="${C}" stroke-width="7" stroke-linecap="round"/>`+arrowHead(194,70,'r',C)+arrowHead(6,70,'l',C),
   vertical:()=>`<line x1="100" y1="18" x2="100" y2="122" stroke="${C}" stroke-width="7" stroke-linecap="round"/>`+arrowHead(100,6,'u',C)+arrowHead(100,134,'d',C),
   longueur:()=>`<rect x="30" y="64" width="140" height="52" rx="6" fill="${PAPER}" stroke="${INK}" stroke-width="3"/><line x1="36" y1="40" x2="164" y2="40" stroke="${C}" stroke-width="4"/>`+arrowHead(32,40,'l',C)+arrowHead(168,40,'r',C)+`<line x1="30" y1="30" x2="30" y2="60" stroke="${C}" stroke-width="2"/><line x1="170" y1="30" x2="170" y2="60" stroke="${C}" stroke-width="2"/>`,
   perimetre:()=>`<rect x="34" y="30" width="132" height="84" fill="none" stroke="${C}" stroke-width="7" stroke-dasharray="14 7"/>`+arrowHead(110,30,'r',C)+arrowHead(90,114,'l',C),
   aire:()=>{let g='';for(let i=1;i<6;i++)g+=`<line x1="${34+i*22}" y1="30" x2="${34+i*22}" y2="114" stroke="${C}" stroke-width="1.5" opacity=".6"/>`;for(let j=1;j<4;j++)g+=`<line x1="34" y1="${30+j*21}" x2="166" y2="${30+j*21}" stroke="${C}" stroke-width="1.5" opacity=".6"/>`;return `<rect x="34" y="30" width="132" height="84" fill="${T}" stroke="${INK}" stroke-width="3"/>${g}`;}
  };
  return SV((S[name]||(()=>tx(100,80,'?',40)))());
}

/* ---------- Se repérer ---------- */
function pos(where,C,T){
  let s=''; const box=`<rect x="80" y="78" width="40" height="34" rx="5" fill="${T}" stroke="${INK}" stroke-width="3"/>`;
  if(where==='dessus') return SV(`<rect x="70" y="70" width="60" height="50" rx="6" fill="var(--sunk)" stroke="${INK}" stroke-width="3"/>`+star(100,42,20,C));
  if(where==='dessous') return SV(`<rect x="70" y="16" width="60" height="50" rx="6" fill="var(--sunk)" stroke="${INK}" stroke-width="3"/>`+star(100,98,20,C));
  s+=`<rect x="44" y="8" width="112" height="124" rx="6" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>`;
  const p={haut:[100,32],bas:[100,108],gauche:[66,70],droite:[134,70]}[where]||[100,70];
  return SV(s+star(p[0],p[1],17,C));
}

/* ---------- Mesures ---------- */
function meas(kind,C,T){
  const ruler=(n,lab,step)=>{let t='';for(let i=0;i<=n;i++)t+=`<line x1="${20+i*step}" y1="70" x2="${20+i*step}" y2="${i%(lab?10:5)===0?92:82}" stroke="${INK}" stroke-width="2"/>`;return `<rect x="12" y="70" width="176" height="40" rx="5" fill="#FFE27A" stroke="${INK}" stroke-width="3"/>`+t;};
  const weight=(x,w,h,lab)=>`<path d="M${x-w/2} 120 L${x-w/2+10} ${120-h} H${x+w/2-10} L${x+w/2} 120 Z" fill="#5A6075" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M${x-10} ${120-h} q0 -16 10 -16 q10 0 10 16" fill="none" stroke="${INK}" stroke-width="4"/>`+tx(x,120-h/2+7,lab,Math.min(20,w/3),'#FFFFFF',800);
  switch(kind){
   case 'metre': return SV(`<rect x="12" y="70" width="176" height="34" rx="5" fill="#FFE27A" stroke="${INK}" stroke-width="3"/>`+Array.from({length:11},(_,i)=>`<line x1="${16+i*16.8}" y1="70" x2="${16+i*16.8}" y2="84" stroke="${INK}" stroke-width="2"/>`).join('')+`<line x1="16" y1="44" x2="184" y2="44" stroke="${C}" stroke-width="4"/>`+arrowHead(12,44,'l',C)+arrowHead(188,44,'r',C)+tx(100,34,'1 m',24,C,800));
   case 'cm': return SV(ruler(15,false,11)+`<rect x="20" y="62" width="55" height="8" fill="${C}"/>`+tx(48,52,'1 cm',22,C,800)+[0,1,2,3].map(i=>tx(20+i*55,128,`${i}`,14)).join(''));
   case 'mm': return SV(ruler(15,false,11)+`<rect x="20" y="62" width="11" height="8" fill="${C}"/>`+tx(60,52,'1 mm',22,C,800)+`<line x1="26" y1="56" x2="40" y2="50" stroke="${C}" stroke-width="2"/>`);
   case 'km': return SV(`<path d="M10 124 C60 100 40 60 100 60 S150 24 190 18" fill="none" stroke="#9AA3B5" stroke-width="14" stroke-linecap="round"/><path d="M10 124 C60 100 40 60 100 60 S150 24 190 18" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-dasharray="8 8"/><circle cx="22" cy="118" r="9" fill="${C}"/><circle cx="182" cy="20" r="9" fill="${C}"/>`+tx(70,40,'1 km',24,C,800));
   case 'masse': return SV(`<rect x="40" y="88" width="120" height="36" rx="8" fill="${T}" stroke="${INK}" stroke-width="3"/><rect x="60" y="96" width="80" height="18" rx="4" fill="#C8E6C9" stroke="${INK}" stroke-width="2"/>`+tx(100,110,'2 kg',14,'#1D2240',800)+`<rect x="30" y="80" width="140" height="8" rx="3" fill="${INK}"/>`+[70,100,130].map((x,i)=>`<circle cx="${x}" cy="${62-i%2*6}" r="${18-i%2*2}" fill="${['#E5484D','#2FA65A','#FFB000'][i]}" stroke="${INK}" stroke-width="2.5"/>`).join(''));
   case 'g': return SV(weight(100,44,40,'1 g'));
   case 'kg': return SV(weight(100,110,80,'1 kg'));
   case 'L': return SV(`<path d="M86 10 h28 v18 q22 12 22 36 v58 q0 10 -10 10 h-52 q-10 0 -10 -10 v-58 q0 -24 22 -36 z" fill="#CFEFFF" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M66 70 h68 v52 q0 10 -10 10 h-48 q-10 0 -10 -10 z" fill="#5BB8F5"/>`+tx(100,108,'1 L',24,'#FFFFFF',800));
   case 'heure': return SV(clock(100,70,58,3,0,true,false,C));
   case 'minute': return SV(clock(100,70,58,10,20,false,true,C));
   case 'seconde': return SV(`<rect x="90" y="4" width="20" height="12" rx="3" fill="${INK}"/>`+clock(100,76,54,0,0,false,false,C)+`<line x1="100" y1="76" x2="140" y2="56" stroke="${C}" stroke-width="3"/>`);
   case 'duree': return SV(clock(42,62,34,8,0,false,false,C)+clock(158,62,34,10,0,false,false,C)+`<line x1="82" y1="62" x2="114" y2="62" stroke="${C}" stroke-width="5"/>`+arrowHead(120,62,'r',C)+tx(100,124,'2 h',24,C,800));
   case 'euro': return SV(`<circle cx="100" cy="70" r="54" fill="#FFC233" stroke="${INK}" stroke-width="4"/><circle cx="100" cy="70" r="42" fill="none" stroke="#C98A00" stroke-width="3"/>`+tx(100,90,'€',56,'#7A4F00',800));
   case 'centime': return SV([[50,'1'],[100,'2'],[150,'5']].map(([x,l])=>`<circle cx="${x}" cy="70" r="${20+(+l)*3}" fill="#D9824A" stroke="${INK}" stroke-width="3"/>`+tx(x,77,l,20,'#FFFFFF',800)).join('')+tx(100,128,'c',18,C,800));
   case 'convertir': return SV(tx(46,82,'1 m',30,INK,800)+`<line x1="80" y1="72" x2="110" y2="72" stroke="${C}" stroke-width="5"/>`+arrowHead(116,72,'r',C)+tx(156,82,'100 cm',24,C,800));
  }
  return txt(['?'],C,T);
}

/* ---------- Point d’entrée ---------- */
function renderIll(spec,cat){
  const C=`var(--c-${cat})`, T=`var(--t-${cat})`;
  try{
    const i=spec.indexOf(':'); const fam=spec.slice(0,i), args=spec.slice(i+1).split('|');
    switch(fam){
      case 'txt': return txt(args,C,T);
      case 'sym': return SV(`<rect x="44" y="12" width="112" height="116" rx="30" fill="${T}" stroke="${C}" stroke-width="4"/>`+tx(100,103,args[0],86,C,800));
      case 'tool': return SV(TOOLS[args[0]]());
      case 'mark': return markSvg(args[0],C,T);
      case 'icon': return SV(ICONS[args[0]](C,T));
      case 'dots': return dots(args[0],args[1],args[2],C,T);
      case 'pose': return pose(args[0],args[1],args[2],args[3],C,T);
      case 'pv': return pv(args[0],args[1],C,T);
      case 'frac': return frac(args[0],args[1],args[2],C,T);
      case 'disc': return SV(disc(+args[0],+args[1],C,T));
      case 'nl': return nl(args[0],C,T);
      case 'chart': return chart(args[0],C,T);
      case 'shape': return shape(args[0],C,T);
      case 'pos': return pos(args[0],C,T);
      case 'meas': return meas(args[0],C,T);
      default: { const r=renderIll2(fam,args,C,T); if(r) return r; }
    }
  }catch(e){ if(typeof console!=='undefined') console.warn('Illustration', spec, e); }
  return txt(['?'],C,T);
}

