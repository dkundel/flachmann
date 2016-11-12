import * as request from 'request';
import { assert } from 'chai';
import { exec } from 'child_process';
import * as chalk from 'chalk';

type Test = [string, {}, string | {}]

const TESTS: Test[] = [
  ['/ahoy', {}, 'Ahoy from Flachmann!'],
  ['/people/moin/Dominik', {'x-test-header': 'flachmann'}, { greeting: 'Moin Dominik!'}]
]
const TESTING_PORT = 9191;

info(`Start testing server on port ${TESTING_PORT}...`);
const server = exec(`PORT=${TESTING_PORT} node ${__dirname}/test.js`);

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
  info('Closed server');
});

process.on('exit', () => {
  server.kill('SIGINT');
});

function runTests() {
  info('Start tests...');
  const testRequests = TESTS.map(t => test(t[0], t[1], t[2]));

  return Promise.all(testRequests).then(() => {
    success('All tests passed');
    return Promise.resolve();
  }).catch(err => {
    error(err.message);
  });
}

function test(url, expectedHeader, expectedValue) {
  info(`Testing URL: ${url}`);
  return new Promise((resolve, reject) => {
    request(`http://localhost:${TESTING_PORT}${url}`, (err, response, body) => {
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

function success(msg) {
  console.log(`${chalk.bold.green('SUCCESS')} ${msg}`);
}

function error(msg) {
  console.error(`${chalk.bold.red('ERROR')} ${msg}`);
}

function info(msg) {
  console.log(`${chalk.bold.cyan('INFO')} ${msg}`);
}