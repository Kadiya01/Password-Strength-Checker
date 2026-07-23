import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { BASE_URL, JSON_HEADERS, handleSummary } from './config.js';

const totalRequests = new Counter('total_requests');
const failedRequests = new Counter('failed_requests');
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time', true);
const throughput = new Counter('throughput');

export const options = {
  scenarios: {
    stress: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '30s', target: 50 },
        { duration: '30s', target: 100 },
        { duration: '30s', target: 200 },
        { duration: '30s', target: 400 },
        { duration: '30s', target: 600 },
        { duration: '30s', target: 800 },
        { duration: '30s', target: 1000 },
        { duration: '30s', target: 1500 },
        { duration: '30s', target: 2000 },
        { duration: '1m', target: 2000 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    error_rate: ['rate<0.10'],
  },
};

function healthCheck() {
  const res = http.get(`${BASE_URL}/api/health`);
  check(res, { 'health ok': (r) => r.status === 200 });
  return res.status === 200;
}

function loginAs(email, password) {
  const payload = JSON.stringify({ email, password, rememberMe: false });
  const params = { headers: JSON_HEADERS };
  const res = http.post(`${BASE_URL}/api/auth/login`, payload, params);
  totalRequests.add(1);

  const parsed = JSON.parse(res.body || '{}');
  const ok = res.status === 200 && parsed.success === true;
  errorRate.add(!ok);
  if (ok) throughput.add(1);

  return parsed.data ? parsed.data.accessToken : null;
}

function setupUser() {
  const timestamp = Date.now();
  const email = `stress_${timestamp}_${__VU}@example.com`;
  const username = `stress_${timestamp}_${__VU}`;
  const password = 'Test@12345';

  const regPayload = JSON.stringify({ email, username, password, firstName: 'Stress', lastName: 'Test' });
  http.post(`${BASE_URL}/api/auth/register`, regPayload, { headers: JSON_HEADERS });

  const token = loginAs(email, password);
  return token;
}

const userTokens = {};

function getToken() {
  if (userTokens[__VU]) return userTokens[__VU];
  const token = setupUser();
  if (token) userTokens[__VU] = token;
  return token;
}

function doLoginWorkload() {
  const email = `stress_login_${Date.now()}_${__VU}@example.com`;
  const payload = JSON.stringify({ email, password: 'Test@12345', rememberMe: false });
  const params = { headers: JSON_HEADERS };
  const res = http.post(`${BASE_URL}/api/auth/login`, payload, params);
  totalRequests.add(1);
  responseTime.add(res.timings.duration);
  const ok = res.status < 500;
  errorRate.add(!ok);
  failedRequests.add(ok ? 0 : 1);
}

function doPasswordCheckWorkload() {
  const passwords = ['123456', 'MyP@ssw0rd', 'X9$f!kL2@mN5#qR8$vB3&hJ6', 'password', 'qwerty123'];
  const pw = passwords[__ITER % passwords.length];
  const payload = JSON.stringify({ password: pw });
  const params = { headers: JSON_HEADERS };
  const res = http.post(`${BASE_URL}/api/password/check-strength`, payload, params);
  totalRequests.add(1);
  responseTime.add(res.timings.duration);
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
  ];
  const idx = __ITER % endpoints.length;
  const params = {
    headers: { ...JSON_HEADERS, Authorization: `Bearer ${token}` },
  };
  const res = http.get(`${BASE_URL}${endpoints[idx]}`, params);
  totalRequests.add(1);
  responseTime.add(res.timings.duration);
  const ok = res.status === 200;
  errorRate.add(!ok);
  failedRequests.add(ok ? 0 : 1);
}

function doGenerateWorkload() {
  const payload = JSON.stringify({ length: 16, includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: true });
  const params = { headers: JSON_HEADERS };
  const res = http.post(`${BASE_URL}/api/password/generate`, payload, params);
  totalRequests.add(1);
  responseTime.add(res.timings.duration);
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

  const workloadType = __ITER % 4;

  group('Mixed Workload', () => {
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
    }
  });

  sleep(0.3);
}

export { handleSummary };
