const fs = require('fs');
const path = 'app/admin/products/descriptionTemplates.ts';
let lines = fs.readFileSync(path, 'utf8').split('\n');
const filler = 'This premium product delivers outstanding satisfaction through thoughtful design and quality materials.';
const fillerWords = filler.split(' ');
let changes = 0;
lines = lines.map(line => {
  const trimmed = line.trim();
  if (trimmed.startsWith('`')) {
    let text = trimmed.replace(/`/g,'');
    let words = text.split(/\s+/).filter(w=>w.length>0);
    if (words.length < 45) {
      const target = 50; // target word count
      let needed = target - words.length;
      if (needed < 0) needed = 0;
      // append as many words from filler as needed
      const toAdd = fillerWords.slice(0, needed).join(' ');
      text = text + (toAdd ? ' ' + toAdd : '');
      changes++;
    } else if (words.length > 55) {
      // trim to 55 words
      text = words.slice(0,55).join(' ');
      changes++;
    }
    return '  `' + text + '`,';
  }
  return line;
});
fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Normalized', changes, 'templates');
