// Charge dist/index.html dans jsdom et renvoie la fenêtre (scripts exécutés).
const fs=require('fs'), path=require('path'); const {JSDOM}=require('jsdom');
module.exports=function load(opts){ opts=opts||{};
  let html=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8');
  if(opts.noDB) html=html.replace(/"supabaseUrl":"[^"]*"/,'"supabaseUrl":""');
  // on expose les fonctions et constantes globales (const/let ne sont pas sur window)
  html=html.replace(/\ninit\(\);\s*<\/script>/,`\nwindow.__T={get Q(){return Q;},set Q(v){Q=v;},get U(){return U;},get S(){return S;},state,MODS,MOD,W,WORDS,N2,GENS,makeCalc,checkAnswer,answerShow,parsePoly,P,parseNum,makeCompItems,makeCalcItems,makeBrevetItems,makeBrevetBlanc,makeSpiralItems,makeRevItems,makeModItems,R,render,route,studioItems,ttsPrep,vkey,plain,rich,renderIll,drawQ,probAnswer,onPnext,onPopt,onPform,onPord,onPtok,onPickOk,onPpick,GEN2MOD,spiralState,Bank,DB};\ninit();\n</script>`);
  const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://tom-rougeaud.github.io/fls2/'+(opts.hash||'#/'),pretendToBeVisual:true,beforeParse(w){
    w.fetch=opts.fetch||(()=>Promise.reject(new Error('offline'))); w.scrollTo=()=>{}; w.HTMLElement.prototype.scrollIntoView=function(){}; w.print=()=>{};
    w.speechSynthesis={getVoices:()=>[],speak:()=>{},cancel:()=>{},addEventListener:()=>{}}; w.SpeechSynthesisUtterance=function(t){ this.text=t; };
    w.Audio=function(){ return {play:()=>Promise.resolve(),pause(){},set src(v){},get src(){return ''}}; };
    w.confirm=()=>true; w.alert=()=>{}; w.console.warn=()=>{};
  }});
  if(!dom.window.__T) throw new Error('scripts non chargés');
  return dom; };
