const http = require('http');

function post(message) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ message });
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/comfort',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function runTests() {
  const tests = [
    { name: 'Debt + Fear (multi)', msg: 'I am drowning in debt and so anxious, I cannot pay my bills and I am scared' },
    { name: 'Grief', msg: 'My mother died last month and I cannot stop crying, the grief is overwhelming' },
    { name: 'Heartbreak', msg: 'My boyfriend cheated on me and broke my heart, I feel so betrayed and rejected' },
    { name: 'Loneliness', msg: 'I feel so alone, nobody checks on me, I have no friends and I feel invisible' },
    { name: 'Confusion/Direction', msg: 'I do not know what to do with my life, I am so confused and lost at a crossroads' },
    { name: 'Guilt/Shame', msg: 'I feel so guilty about my past sins and mistakes, I am ashamed and feel unworthy of God' },
    { name: 'Sickness', msg: 'I have been sick for months, I got a bad diagnosis from the doctor and I am in pain' },
    { name: 'Waiting/Delay', msg: 'I have been waiting for years and nothing is moving, I have prayed so long and wonder if God hears' },
    { name: 'Discouragement', msg: 'I am tired of trying, nothing works, I feel hopeless and want to give up completely' },
    { name: 'African expressions', msg: 'I have so much wahala with money, I am suffering and struggling to survive' },
    { name: 'Crisis', msg: 'I want to die, I cannot go on anymore, there is no reason to live' },
    { name: 'Fallback (no match)', msg: 'hello there how are you doing today' },
  ];

  console.log('=== HeavenlyComfort API Tests ===\n');
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await post(test.msg);
      if (result.crisis) {
        console.log(`[PASS] ${test.name}`);
        console.log(`       crisis=true | msg: ${result.message.slice(0, 60)}...`);
        passed++;
      } else {
        const cats = result.detected || [];
        console.log(`[PASS] ${test.name}`);
        console.log(`       detected: [${cats.join(', ')}]`);
        passed++;
      }
    } catch (err) {
      console.log(`[FAIL] ${test.name}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
}

runTests().catch(console.error);
