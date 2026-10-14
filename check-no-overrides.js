// Usage: node check-no-overrides.js Assemblee_national.html
// Fails if the game defines a function twice, reassigns a function, or wraps one ("const _old=fn; fn=function...").
// Rule: change a function where it is defined. Never layer a new version on top of an old one.
const fs=require('fs');const f=process.argv[2]||'Assemblee_national.html';
const t=fs.readFileSync(f,'utf8').split('\n');const seen={},bad=[];
t.forEach((l,i)=>{let m;
 if((m=l.match(/^function\s+([A-Za-z_$][\w$]*)\s*\(/))){if(seen[m[1]])bad.push(`line ${i+1}: "${m[1]}" is also defined on line ${seen[m[1]]}`);else seen[m[1]]=i+1}
 if((m=l.match(/^([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)?)\s*=\s*function\b/)))bad.push(`line ${i+1}: "${m[1]}" is reassigned`);
 if(/^(?:const|let|var)\s+_\w+\s*=\s*(?!null\b|true\b|false\b|undefined\b)[A-Za-z_$][\w$.]*\s*;/.test(l))bad.push(`line ${i+1}: wrapper capture of an older function`)});
if(bad.length){console.log('LAYERED OVERRIDES FOUND\n'+bad.join('\n'));process.exit(1)}console.log('OK: every function has exactly one definition');
