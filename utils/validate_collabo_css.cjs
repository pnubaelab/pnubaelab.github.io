const assert = require('node:assert/strict');
const fs = require('node:fs');

// Check the deployed artifact, not the uncompressed Liquid source. The CSS
// minifier used by Jekyll can strip required spaces from calc() additions,
// invalidating the mask and blurring the entire interactive graph.
const path = process.argv[2] || '_site/publications/index.html';
const html = fs.readFileSync(path, 'utf8');
const graphStyles = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
  .map(match => match[1])
  .filter(css => css.includes('.collabo-overflow-frost'));
assert.ok(graphStyles.length, 'Built publication graph styles are missing');

for (const css of graphStyles) {
  for (const match of css.matchAll(/\bcalc\(/g)) {
    const start = match.index + match[0].length;
    let end = start;
    let depth = 1;
    while (end < css.length && depth) {
      if (css[end] === '(') depth++;
      if (css[end] === ')') depth--;
      end++;
    }
    assert.equal(depth, 0, 'Unclosed calc() in built graph CSS');
    const expression = css.slice(start, end - 1);
    for (let index = 0; index < expression.length; index++) {
      if (expression[index] !== '+') continue;
      const left = expression.slice(0, index).trimEnd();
      // A leading positive sign is unary; additions require whitespace.
      if (!left || /[(+*/-]$/.test(left)) continue;
      assert.ok(
        /\s/.test(expression[index - 1]) && /\s/.test(expression[index + 1] || ''),
        `Production CSS has invalid calc(${expression}); addition requires spaces around +`
      );
    }
  }
}

console.log('Built graph CSS retains valid calc() addition syntax.');
