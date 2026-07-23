import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { BASE_URL, JSON_HEADERS, handleSummary } from './config.js';

const totalRequests = new Counter('total_requests');
const failedRequests = new Counter('failed_requests');
const errorRate = new Rate('error_rate');
const loginDuration = new Trend('login_duration', true);
const checkDuration = new Trend('check_duration', true);
const dashboardDuration = new Trend('dashboard_duration', true);
const generateDuration = new Trend('generate_duration', true);

export const options = {
  scenarios: {
    endurance: {
      executor: 'constant-vus',
      vus: 50,
      duration: __ENV.DURATION || '10m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<800'],
    error_rate: ['rate<0.05'],
  },
};

function healthCheck() {
  const res = http.get(`${BASE_URL}/api/health`);
  return res.status === 200;
}

function setupUser() {
  const timestamp = Date.now();
  const email = `endur_${timestamp}_${__VU}@example.com`;
  const username = `endur_${timestamp}_${__VU}`;
  const password = 'Test@12345';

  const regPayload = JSON.stringify({ email, username, password, firstName: 'Endurance', lastName: 'Test' });
  http.post(`${BASE_URL}/api/auth/register`, regPayload, { headers: JSON_HEADERS });

  const loginPayload = JSON.stringify({ email, password, rememberMe: false });
  const res = http.post(`${BASE_URL}/api/auth/login`, loginPayload, { headers: JSON_HEADERS });

  if (res.status === 200) {
    const parsed = JSON.parse(res.body || '{}');
    return parsed.data ? parsed.data.accessToken : null;
  }
  return null;
}

const userTokens = {};

function getToken() {
  if (userTokens[__VU]) return userTokens[__VU];
  const token = setupUser();
  if (token) userTokens[__VU] = token;
  return token;
}

function doLoginWorkload() {
  const email = `endur_login_${Date.now()}_${__VU}@example.com`;
  const payload = JSON.stringify({ email, password: 'Test@12345', rememberMe: false });
  const params = { headers: JSON_HEADERS };
  const res = http.post(`${BASE_URL}/api/auth/login`, payload, params);
  totalRequests.add(1);
  loginDuration.add(res.timings.duration);
  const ok = res.status < 500;
  errorRate.add(!ok);
  failedRequests.add(ok ? 0 : 1);
}

function doPasswordCheckWorkload() {
  const passwords = ['123456', 'MyP@ssw0rd', 'X9$f!kL2@mN5#qR8$vB3&hJ6', 'password', 'qwerty123', 'C0mpl3x!Ty#99'];
  const pw = passwords[__ITER % passwords.length];
  const payload = JSON.stringify({ password: pw });
  const params = { headers: JSON_HEADERS };
  const res = http.post(`${BASE_URL}/api/password/check-strength`, payload, params);
  totalRequests.add(1);
  checkDuration.add(res.timings.duration);
  const ok = res.status === 200;
  errorRate.add(!ok);
  failedRequests.add(ok ? 0 : 1);
}

function doDashboardWorkload(token) {
  if (!token) return;
  const endpoints = [
    '/api/dashboard/statistics',
    '/api/dashboard/security-score',
    '/api/dashboard/login-history',
    '/api/dashboard/activity-timeline',
    '/api/dashboard/password-analytics',
    '/api/dashboard/chart-data',
  ];
  const idx = __ITER % endpoints.length;
  const params = {
    headers: { ...JSON_HEADERS, Authorization: `Bearer ${token}` },
  };
  const res = http.get(`${BASE_URL}${endpoints[idx]}`, params);
  totalRequests.add(1);
  dashboardDuration.add(res.timings.duration);
  const ok = res.status === 200;
  errorRate.add(!ok);
  failedRequests.add(ok ? 0 : 1);
}

function doGenerateWorkload() {
  const payload = JSON.stringify({ length: 16, includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: true });
  const params = { headers: JSON_HEADERS };
  const res = http.post(`${BASE_URL}/api/password/generate`, payload, params);
  totalRequests.add(1);
  generateDuration.add(res.timings.duration);
  const ok = res.status === 200;
  errorRate.add(!ok);
  failedRequests.add(ok ? 0 : 1);
}

function doPassphraseWorkload() {
  const separators = ['-', ' ', '_', 'number', 'symbol'];
  const sep = separators[__ITER % separators.length];
  const payload = JSON.stringify({ words: 5, separator: sep });
  const params = { headers: JSON_HEADERS };
  const res = http.post(`${BASE_URL}/api/password/generate-passphrase`, payload, params);
  totalRequests.add(1);
  generateDuration.add(res.timings.duration);
  const ok = res.status === 200;
  errorRate.add(!ok);
  failedRequests.add(ok ? 0 : 1);
}

export default function () {
  group('Health Check', () => {
    if (__VU === 1 && __ITER === 0) {
      healthCheck();
    }
  });

  const token = getToken();
  const workloadType = __ITER % 5;

  group('Endurance Mixed Workload', () => {
    switch (workloadType) {
      case 0:
        doLoginWorkload();
        break;
      case 1:
        doPasswordCheckWorkload();
        break;
      case 2:
        doDashboardWorkload(token);
        break;
      case 3:
        doGenerateWorkload();
        break;
      case 4:
        doPassphraseWorkload();
        break;
    }
  });

  sleep(0.5);
}

export { handleSummary };
