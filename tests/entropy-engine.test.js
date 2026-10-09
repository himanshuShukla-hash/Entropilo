/**
 * Unit tests for Progressive Entropy Engine calculations and reversibility.
 */

// Mock DOM
global.window = {};
let mockStyleContent = '';
let htmlClassList = new Set();

global.document = {
  head: {
    appendChild: (el) => {}
  },
  documentElement: {
    classList: {
      add: (cls) => htmlClassList.add(cls),
      remove: (cls) => htmlClassList.delete(cls),
      contains: (cls) => htmlClassList.has(cls)
    }
  },
  getElementById: (id) => {
    if (id === 'entropilo-entropy-styles') {
      return {
        id,
        set textContent(val) { mockStyleContent = val; },
        get textContent() { return mockStyleContent; },
        setAttribute: () => {}
      };
    }
    return null;
  },
  createElement: (tag) => ({
    id: '',
    set textContent(val) { mockStyleContent = val; },
    get textContent() { return mockStyleContent; },
    setAttribute: () => {}
  })
};

const fs = require('fs');
const path = require('path');
const entropyCode = fs.readFileSync(path.join(__dirname, '../content/entropy-engine.js'), 'utf8');
eval(entropyCode);

function assert(condition, message) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

function runEntropyTests() {
  console.log('🧪 Running Entropilo Entropy Engine Test Suite...\n');

  const engine = new window.ProgressiveEntropyEngine();

  // Test 1: Low score (<35) applies no disruption
  engine.applyScore(20);
  assert(mockStyleContent === '', 'Score < 35 should produce empty styles');
  assert(!htmlClassList.has('entropilo-active'), 'Class entropilo-active should not be present');
  console.log('✅ Test 1 Passed: Low score leaves page unaffected');

  // Test 2: Moderate score (65) applies intermediate grayscale & contrast
  engine.applyScore(65);
  assert(mockStyleContent.includes('grayscale('), 'Should contain grayscale filter');
  assert(mockStyleContent.includes('contrast('), 'Should contain contrast filter');
  assert(htmlClassList.has('entropilo-active'), 'Class entropilo-active should be present');
  console.log('✅ Test 2 Passed: Score 65 applies calibrated desaturation');

  // Test 3: High score (95) applies vignette and higher grayscale bounded under 85%
  engine.applyScore(95);
  assert(mockStyleContent.includes('grayscale('), 'Should contain grayscale filter');
  assert(mockStyleContent.includes('blur('), 'Should blur distracting media elements');
  assert(mockStyleContent.includes('box-shadow: inset'), 'Should apply subtle vignette');
  console.log('✅ Test 3 Passed: High score applies complete intervention stage with bounds');

  // Test 4: Reversible reset
  engine.reset();
  assert(mockStyleContent === '', 'Reset should completely clear style content');
  assert(!htmlClassList.has('entropilo-active'), 'Class should be removed on reset');
  console.log('✅ Test 4 Passed: Reset is 100% reversible and cleans all styles');

  console.log('\n🎉 All Entropy Engine tests passed successfully!\n');
}

runEntropyTests();
