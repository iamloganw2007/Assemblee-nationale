const g=require('./harness.js');
const N=+process.argv[2]||300, party=process.argv[3]!=null?+process.argv[3]:3;
const out={runs:[],evCount:{},evPerRun:[],billTitles:{},offerTitles:{}};
let stuck=0;
for(let n=0;n<N;n++){
 g.setSeed(1000+n*7919);
 const S=g.SIM;S.me=party;S.pledge=2;S.polls=[];
 try{g.startGov(true)}catch(e){console.error('startGov',e.message);process.exit(1)}
 const G=S.gov;const seen=[],tabled=[];let guard=0;
 while(G.q<16&&!G.fell&&guard++<60){
  if(G.q===0)g.autoCab();
  if(process.env.BOT==='budget'&&G.q%4===0){const B=[62,25,13,22,12,8,4,14.5];g.st.bud=B.map((v,i)=>+(v*(0.75+Math.random()*0.6)).toFixed(1));g.st.tax=g.st.tax.map((_,i)=>{const t=[[-5,5],[-5,5],[-5,5],[0,3],[0,3],[-3,3],[-3,3],[-3,3]][i];return Math.round(t[0]+Math.random()*(t[1]-t[0]))})}
  // events
  G.pend.forEach(p=>seen.push({q:G.q,i:p.i}));
  let k=0;while(G.pend.length&&k++<10){const e=g.GE[G.pend[0].i];const opts=e[4];g.resolveGE(0,(Math.random()*opts.length)|0)}
  // legislation: table first affordable offer
  (G.offer||[]).slice(0,3).forEach(bi=>{const b=g.BL[bi];if(b){const t=(b.f||'?');out.offerTitles[t]=(out.offerTitles[t]||0)+1}});
  if(G.offer&&G.offer.length&&!(G.vote&&!G.vote.done)){const b=g.BL[G.offer[0]];try{g.tableBill(0);if(G.vote&&!G.vote.done){tabled.push(b&&b.f);g.finishVote()}}catch(e){}}
  if(g.isBudQ(G.q)&&!G.bdone){try{g.bvote();if(G.vote&&!G.vote.done)g.finishVote()}catch(e){}}
  if(G.fell)break;
  const q0=G.q;try{g.endQuarter()}catch(e){console.error('EQ',e.message);break}
  if(G.q===q0){stuck++;break}
 }
 seen.forEach(s=>{const t=g.GE[s.i][0];out.evCount[t]=(out.evCount[t]||0)+1});
 tabled.forEach(t=>out.billTitles[t]=(out.billTitles[t]||0)+1);
 const ids=seen.map(s=>s.i);
 out.runs.push({q:G.q,fell:G.fell,appr:Math.round(G.appr),coh:Math.round(G.coh),debt:+G.debt.toFixed(1),ev:ids.length,distinct:new Set(ids).size,
  role:G.role,seatsGov:G.c[G.gv]-G.def,ind:Object.values(G.ind).map(v=>Math.round(v)),prom:(G.prom||[]).filter(p=>p.s==='kept').length,laws:(G.laws||[]).length,seq:ids.join(',')});
}
const R=out.runs,avg=a=>a.reduce((x,y)=>x+y,0)/(a.length||1);
console.log('runs',R.length,'stuck',stuck,'party',g.P[party].n);
console.log('terms completed 16q:',R.filter(r=>r.q>=16).length,'| government fell:',R.filter(r=>r.fell).length,'| avg quarters:',avg(R.map(r=>r.q)).toFixed(1));
console.log('final approval avg/min/max:',avg(R.map(r=>r.appr)).toFixed(1),Math.min(...R.map(r=>r.appr)),Math.max(...R.map(r=>r.appr)));
console.log('debt avg:',avg(R.map(r=>r.debt)).toFixed(1),' cohesion avg:',avg(R.map(r=>r.coh)).toFixed(1));
console.log('events per term avg:',avg(R.map(r=>r.ev)).toFixed(1),'| distinct per term avg:',avg(R.map(r=>r.distinct)).toFixed(1),'| repeat share:',(1-avg(R.map(r=>r.distinct))/avg(R.map(r=>r.ev))).toFixed(2));
console.log('laws enacted avg:',avg(R.map(r=>r.laws)).toFixed(1),' pledges kept avg:',avg(R.map(r=>r.prom)).toFixed(2));
const evs=Object.entries(out.evCount).sort((a,b)=>b[1]-a[1]);const tot=evs.reduce((s,e)=>s+e[1],0);
console.log('\nEVENT FREQUENCY (share of all draws):');evs.forEach(([t,c])=>console.log(' ',(c/tot*100).toFixed(1).padStart(5)+'%',t));
console.log('events never seen:',g.GE.map(e=>e[0]).filter(t=>!out.evCount[t]).join(' | ')||'none');
// opening events: how often first-quarter draw is the same
const first={};R.forEach(r=>{const f=r.seq.split(',')[0];first[f]=(first[f]||0)+1});
console.log('\nopening event distribution:',Object.entries(first).map(([i,c])=>g.GE[i][0]+' '+(c/R.length*100).toFixed(0)+'%').join('; '));
// sequence uniqueness
const uniq=new Set(R.map(r=>r.seq)).size;console.log('unique event sequences:',uniq+'/'+R.length);
const ind=['health','edu','econ','hous','clim','lang'];console.log('final indicators avg:',ind.map((k,i)=>k+' '+avg(R.map(r=>r.ind[i])).toFixed(0)).join(' · '));
const bt=Object.entries(out.billTitles).sort((a,b)=>b[1]-a[1]).slice(0,8);console.log('\ntop tabled bills:',bt.map(e=>e[1]+'× '+e[0]).join(' | '));
console.log('distinct offered bill titles across runs:',Object.keys(out.offerTitles).length);

