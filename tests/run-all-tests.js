/**
 * Master test runner for Entropilo test suites.
 */

const { execSync } = require('child_process');
const path = require('path');

const testFiles = [
  'tests/fugue-engine.test.js',
  'tests/entropy-engine.test.js'
];

console.log('==================================================');
console.log('       ENTROPILO TEST VERIFICATION SUITE         ');
console.log('==================================================\n');

let allPassed = true;

for (const file of testFiles) {
  try {
    const fullPath = path.join(__dirname, '..', file);
    console.log(`▶ Executing: ${file}`);
    const output = execSync(`node "${fullPath}"`, { encoding: 'utf8' });
    console.log(output);
  } catch (err) {
    allPassed = false;
    console.error(`❌ Failed: ${file}`);
    console.error(err.stdout || err.message);
  }
}

if (allPassed) {
  console.log('==================================================');
  console.log('✔ ALL TEST SUITES PASSED (100% SUCCESS)');
  console.log('==================================================');
  process.exit(0);
} else {
  console.error('Some tests failed.');
  process.exit(1);
}
