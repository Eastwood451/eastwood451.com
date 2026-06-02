const fs = require('fs');
let code = fs.readFileSync('e:\\Antigravity @Barracuda\\Biology - Antigravity\\app.js', 'utf8');
code = code.substring(0, code.indexOf('const animals ='));
eval(code);
function findId(node) {
  if (node.animalId === 'bjoern') return true;
  if (node.children) return node.children.some(findId);
  return false;
}
console.log('Found bear:', findId(taxonomyTree));
