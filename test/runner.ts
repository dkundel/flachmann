import * as request from 'request';
import { assert } from 'chai';
import { exec } from 'child_process';

const server = exec(`node ${__dirname}/test.js`);

server.stderr.on('data', data => {
  console.error(data);
});

server.stdout.on('data', (data: string) => {
  if (data.trim() === 'listening') {
    runTests().then(() => {
      server.kill('SIGINT');
    });
  }
});

server.on('close', () => {
  console.log('Closed Server');
});

process.on('exit', () => {
  server.kill('SIGINT');
});

function runTests() {
  const testRequests = TESTS.map(t => test(t[0], t[1], t[2]));

  return Promise.all(testRequests).then(() => {
    console.log('ALL DONE!');
    return Promise.resolve();
  }).catch(err => {
    console.error(err.message);
  });
}

function test(url, expectedHeader, expectedValue) {
  return new Promise((resolve, reject) => {
    request(`http://localhost:9999${url}`, (err, response, body) => {
      assert.isNull(err, 'no error returned');

      Object.keys(expectedHeader).forEach(header => {
        assert.propertyVal(response.headers, header, expectedHeader[header], `valid "${header}" header`);
      });

      if (typeof expectedValue !== 'string') {
        body = JSON.parse(body);
      }
      assert.deepEqual(body, expectedValue);

      resolve();
    })
  });
}

type Test = [string, {}, string | {}]

const TESTS: Test[] = [
  ['/ahoy', {}, 'Ahoy from Flachmann!'],
  ['/people/moin/Dominik', {'x-test-header': 'flachmann'}, { greeting: 'Moin Dominik!'}]
]