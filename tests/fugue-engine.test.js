/**
 * Unit tests for Entropilo's Fugue Engine and Progressive Entropy calculations.
 */

// Mock window and document environment for Node testing
global.window = {
  scrollY: 0,
  innerHeight: 800,
  addEventListener: () => {},
  removeEventListener: () => {}
};

global.document = {
  addEventListener: () => {},
  removeEventListener: () => {},
  querySelectorAll: () => [],
  querySelector: () => null,
  createElement: (tag) => ({
    id: '',
    textContent: '',
    setAttribute: () => {},
    style: {},
    appendChild: () => {}
  }),
  head: { appendChild: () => {} },
  documentElement: {
    appendChild: () => {},
    classList: { add: () => {}, remove: () => {} }
  },
  getElementById: () => null
};

global.requestAnimationFrame = (fn) => setTimeout(fn, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Load FugueEngine
const fs = require('fs');
const path = require('path');

const fugueCode = fs.readFileSync(path.join(__dirname, '../content/fugue-engine.js'), 'utf8');
eval(fugueCode); // Defines FugueEngine on window.FugueEngine

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log('🧪 Running Entropilo Fugue Engine Test Suite...\n');

  // Test 1: Initialization
  {
    const engine = new window.FugueEngine();
    assert(engine.score === 0, 'Score should initialize to 0');
    assert(engine.stats.postsScrolled === 0, 'Posts count should initialize to 0');
    assert(engine.stats.linksClicked === 0, 'Links clicked should initialize to 0');
    console.log('✅ Test 1 Passed: Initial state properly calibrated');
  }

  // Test 2: Normal / Purposeful reading stays low
  {
    const engine = new window.FugueEngine({
      gracePeriodMs: 5000,
      windowDurationMs: 10000
    });
    engine.start();

    // Simulate intentional reading: low velocity (100 px/s), long dwell, occasional click
    engine.recordEvent('scroll_velocity', 120);
    engine.recordEvent('dwell', 3500);
    engine.recordEvent('interaction', 1);
    engine.recordEvent('link_click', 1);

    engine.tick();
    assert(engine.score <= 10, `Expected low score for reading, got ${engine.score}`);
    engine.stop();
    console.log('✅ Test 2 Passed: Intentional reading keeps score low');
  }

  // Test 3: Doomscrolling behavior causes score climb
  {
    const engine = new window.FugueEngine({
      gracePeriodMs: 100, // Bypass grace period for test
      demoMode: true,
      windowDurationMs: 10000
    });
    engine.start();

    // Fast-forward past grace period (demoGracePeriodMs is 6000ms)
    engine.sessionStartTime = Date.now() - 15000;

    // Simulate rapid scroll bursts with 0 dwell and 0 interactions
    for (let i = 0; i < 10; i++) {
      engine.recordEvent('scroll_velocity', 1800);
    }

    const initialScore = engine.score;
    // Tick forward 3 seconds
    engine.lastTickTime = Date.now() - 3000;
    engine.tick();

    assert(engine.score > initialScore, `Score should increase under doomscroll pattern: was ${initialScore}, now ${engine.score}`);
    assert(engine.score > 25, `Expected score > 25 under continuous fast scrolling, got ${engine.score}`);
    engine.stop();
    console.log('✅ Test 3 Passed: Rapid low-interaction scrolling triggers score climb');
  }

  // Test 4: Conscious reset
  {
    const engine = new window.FugueEngine();
    engine.score = 85;
    engine.stats.postsScrolled = 42;
    engine.reset();

    assert(engine.score === 0, 'Score should be 0 after reset');
    assert(engine.stats.postsScrolled === 0, 'Posts scrolled should be reset to 0');
    console.log('✅ Test 4 Passed: Reset fully clears score and cumulative counters');
  }

  // Test 5: Metrics formatting
  {
    const engine = new window.FugueEngine();
    assert(engine.formatTime(45) === '45s', '45 seconds should format as 45s');
    assert(engine.formatTime(125) === '2m 5s', '125 seconds should format as 2m 5s');
    console.log('✅ Test 5 Passed: Metrics elapsed time formatting is accurate');
  }

  console.log('\n🎉 All 5 tests passed successfully!\n');
}

runTests().catch(err => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
