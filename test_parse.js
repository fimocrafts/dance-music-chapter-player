const fs = require('fs');
const path = require('path');
const htmlPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlPath,'utf8');
const start = html.indexOf('function parseCommand(');
const end = html.indexOf('\n        function executeCommand', start);
if (start === -1 || end === -1) {
  console.error('Could not locate parseCommand in index.html');
  process.exit(1);
}
const fnText = html.slice(start, end);

// Provide required globals
const WORD_NUMBERS = {one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10, once:1, twice:2, thrice:3};
const WORD_SPEEDS = {'half':0.5, 'quarter':0.25, 'double':2, 'normal':1, 'full':1};
const chapters = ['Intro','Pre-Chorus','Chorus','Outro'];
function findChapterByName(name) {
  const lower = name.toLowerCase().trim();
  let idx = chapters.findIndex(c => c.toLowerCase() === lower);
  if (idx !== -1) return idx;
  idx = chapters.findIndex(c => c.toLowerCase().includes(lower));
  if (idx !== -1) return idx;
  const words = lower.split(/\s+/);
  idx = chapters.findIndex(c => words.every(w => c.toLowerCase().includes(w)));
  return idx;
}

// Expose helpers to the eval environment
const context = { WORD_NUMBERS, WORD_SPEEDS, findChapterByName };
for (const k of Object.keys(context)) global[k] = context[k];

// Evaluate the parseCommand function
try {
  eval(fnText + '\n;global.parseCommand = parseCommand;');
} catch (err) {
  console.error('Error evaluating parseCommand:', err);
  process.exit(1);
}

const tests = [
  'play pre-chorus then chorus 2 times then stop',
  'play intro then (chorus 3 times) then outro',
  'play chorus 3 times'
];

for (const t of tests) {
  try {
    const res = global.parseCommand(t);
    console.log('INPUT:', t);
    console.log(JSON.stringify(res, null, 2));
    console.log('---');
  } catch (e) {
    console.error('Error parsing', t, e);
  }
}
