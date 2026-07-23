import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { BASE_URL, JSON_HEADERS, COMMON_PASSWORDS, handleSummary } from './config.js';

const checkErrors = new Rate('check_errors');
const checkDuration = new Trend('check_duration', true);

export const options = {
  scenarios: {
    ramp_check: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 100 },
        { duration: '1m', target: 200 },
        { duration: '30s', target: 200 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<200'],
    check_errors: ['rate<0.05'],
  },
};

const TEST_PASSWORDS = [
  { password: '123456', label: 'very_weak' },
  { password: 'password', label: 'very_weak' },
  { password: 'password123', label: 'weak' },
  { password: 'MyP@ssw0rd', label: 'fair' },
  { password: 'C0mpl3x!Ty#99', label: 'good' },
  { password: 'X9$f!kL2@mN5#qR8$vB3&hJ6', label: 'strong' },
  { password: 'qwerty', label: 'very_weak' },
  { password: 'letmein', label: 'very_weak' },
  { password: 'iloveyou', label: 'very_weak' },
  { password: 'Abc123!@#def456$', label: 'strong' },
];

function healthCheck() {
  const res = http.get(`${BASE_URL}/api/health`);
  return res.status === 200;
}

function checkPassword(password, expectedLabel) {
  const payload = JSON.stringify({ password });
  const params = { headers: JSON_HEADERS };
  const res = http.post(`${BASE_URL}/api/password/check-strength`, payload, params);

  checkDuration.add(res.timings.duration);

  const parsed = JSON.parse(res.body || '{}');
  const success = check(res, {
    'check status is 200': (r) => r.status === 200,
    'check returns success': () => parsed.success === true,
    'check has score': () => parsed.data && typeof parsed.data.score === 'number',
    'check has label': () => parsed.data && parsed.data.label,
    'check response time < 200ms': (r) => r.timings.duration < 200,
  });

  checkErrors.add(!success);

  if (!success) {
    console.log(`Password check failed: ${res.status} ${res.body}`);
  }

  return success;
}

function checkBulkPasswords() {
  group('Bulk Common Password Check', () => {
    for (const pw of COMMON_PASSWORDS) {
      checkPassword(pw, null);
      sleep(0.1);
    }
  });
}

export default function () {
  group('Health Check', () => {
    if (__VU === 1 && __ITER === 0) {
      healthCheck();
    }
  });

  group('Password Strength Check', () => {
    const testIndex = __ITER % TEST_PASSWORDS.length;
    const test = TEST_PASSWORDS[testIndex];
    checkPassword(test.password, test.label);
  });

  group('Random Password Patterns', () => {
    const patterns = [
      'a'.repeat(8 + (__VU % 56)),
      `${Date.now()}${__VU}${__ITER}`,
      `P@ss${__VU}w0rd!${__ITER % 10}`,
      `${__ITER}${__VU}${Date.now()}`,
    ];
    const idx = __ITER % patterns.length;
    checkPassword(patterns[idx], null);
  });

  if (__ITER % 10 === 0) {
    checkBulkPasswords();
  }

  sleep(0.5);
}

export { handleSummary };
