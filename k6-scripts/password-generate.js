import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { BASE_URL, JSON_HEADERS, handleSummary } from './config.js';

const generateErrors = new Rate('generate_errors');
const passphraseErrors = new Rate('passphrase_errors');
const generateDuration = new Trend('generate_duration', true);
const passphraseDuration = new Trend('passphrase_duration', true);

export const options = {
  scenarios: {
    ramp_generate: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 50 },
        { duration: '1m', target: 100 },
        { duration: '30s', target: 100 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<300'],
    generate_errors: ['rate<0.05'],
    passphrase_errors: ['rate<0.05'],
  },
};

const GENERATE_CONFIGS = [
  { length: 8, includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: false },
  { length: 12, includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: true },
  { length: 16, includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: true },
  { length: 32, includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: true },
  { length: 20, includeUppercase: true, includeLowercase: false, includeNumbers: true, includeSymbols: true, excludeAmbiguous: true },
  {},
];

const PASSPHRASE_CONFIGS = [
  { words: 4, separator: '-' },
  { words: 5, separator: ' ' },
  { words: 6, separator: '_' },
  { words: 4, separator: 'number' },
  { words: 8, separator: 'symbol' },
  {},
];

function healthCheck() {
  const res = http.get(`${BASE_URL}/api/health`);
  return res.status === 200;
}

function generatePassword(config) {
  const payload = JSON.stringify(config);
  const params = { headers: JSON_HEADERS };
  const res = http.post(`${BASE_URL}/api/password/generate`, payload, params);

  generateDuration.add(res.timings.duration);

  const parsed = JSON.parse(res.body || '{}');
  const success = check(res, {
    'generate status is 200': (r) => r.status === 200,
    'generate returns success': () => parsed.success === true,
    'generate has password': () => parsed.data && parsed.data.password,
    'generated password is string': () => typeof (parsed.data && parsed.data.password) === 'string',
    'generate response time < 300ms': (r) => r.timings.duration < 300,
  });

  generateErrors.add(!success);

  if (!success) {
    console.log(`Password generate failed: ${res.status} ${res.body}`);
  }

  return success;
}

function generatePassphrase(config) {
  const payload = JSON.stringify(config);
  const params = { headers: JSON_HEADERS };
  const res = http.post(`${BASE_URL}/api/password/generate-passphrase`, payload, params);

  passphraseDuration.add(res.timings.duration);

  const parsed = JSON.parse(res.body || '{}');
  const success = check(res, {
    'passphrase status is 200': (r) => r.status === 200,
    'passphrase returns success': () => parsed.success === true,
    'passphrase has passphrase': () => parsed.data && parsed.data.passphrase,
    'passphrase response time < 300ms': (r) => r.timings.duration < 300,
  });

  passphraseErrors.add(!success);

  if (!success) {
    console.log(`Passphrase generate failed: ${res.status} ${res.body}`);
  }

  return success;
}

export default function () {
  group('Health Check', () => {
    if (__VU === 1 && __ITER === 0) {
      healthCheck();
    }
  });

  group('Password Generation', () => {
    const configIndex = __ITER % GENERATE_CONFIGS.length;
    generatePassword(GENERATE_CONFIGS[configIndex]);
  });

  sleep(0.3);

  group('Passphrase Generation', () => {
    const configIndex = __ITER % PASSPHRASE_CONFIGS.length;
    generatePassphrase(PASSPHRASE_CONFIGS[configIndex]);
  });

  sleep(0.5);
}

export { handleSummary };
