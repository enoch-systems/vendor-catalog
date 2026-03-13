const fs = require('fs');
const lines = fs.readFileSync('app/admin/products/descriptionTemplates.ts','utf8').split('\n');
lines.forEach(l=>{
  const trimmed=l.trim();
  if(trimmed.startsWith('`')){
    const text = trimmed.replace(/`/g,'');
    const w = text.split(/\s+/).length;
    if(w<45 || w>55) console.log(w+' words: '+text);
  }
});
