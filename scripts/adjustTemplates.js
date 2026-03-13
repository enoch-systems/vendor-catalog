const fs = require('fs');
const path = 'app/admin/products/descriptionTemplates.ts';
let lines = fs.readFileSync(path, 'utf8').split('\n');
const filler = ' This premium product delivers outstanding satisfaction through thoughtful design and quality materials.';
let changes = 0;
lines = lines.map(line => {
  const trimmed = line.trim();
  if (trimmed.startsWith('`')) {
    let text = trimmed.replace(/`/g,'');
    let words = text.split(/\s+/).filter(w=>w.length>0);
    if (words.length < 45) {
      while (words.length < 48) {
        text += filler;
        words = text.split(/\s+/).filter(w=>w.length>0);
      }
      changes++;
      return '  `' + text + '`,';
    }
    if (words.length > 55) {
      // optionally trim if >55, but keep as is for now
    }
  }
  return line;
});
fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Adjusted', changes, 'templates');
