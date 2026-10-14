const fs=require('fs'),vm=require('vm');
const HTML=process.env.GAME_HTML||process.argv[4]||'Assemblee_national.html';
const raw=fs.readFileSync(HTML,'utf8');const a=raw.indexOf('<script>')+8,b=raw.lastIndexOf('</script>');const src=raw.slice(a,b);
const mk=()=>{const f=function(){return p};const p=new Proxy(f,{get:(t,k)=>k===Symbol.toPrimitive?()=> '':k==='length'?0:(k==='style'||k==='classList'||k==='dataset')?p:p,apply:()=>p,construct:()=>p,set:()=>true});return p};
const stub=mk();
const ctx={console,Math,Date,JSON,Object,Array,Number,String,Set,Map,Promise,
 document:stub,window:{},localStorage:{getItem(){return null},setItem(){},removeItem(){}},
 setInterval:()=>0,clearInterval(){},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame:()=>0,
 navigator:{},location:{},alert(){},confirm:()=>true,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}})};
ctx.window=ctx;vm.createContext(ctx);
// expose top-level consts/lets: append accessor
const probe=`;globalThis.__g={get SIM(){return SIM},get GE(){return GE},get BL(){return BL},get RD(){return RD},get st(){return st},get P(){return P},
 setSeed(v){seed=v},startGov,endQuarter,resolveGE,tableBill,startVote,finishVote,bvote,autoCab,isBudQ,seats,cl,cabBlock,LEG,newOffer,get MP(){return MP},dealCheck};`;
try{vm.runInContext(src+probe,ctx,{filename:'game.js'})}catch(e){console.error('LOAD ERR',e.message.slice(0,300));}
module.exports=ctx.__g;
