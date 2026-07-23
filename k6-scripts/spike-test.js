import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { BASE_URL, JSON_HEADERS, handleSummary } from './config.js';

const totalRequests = new Counter('total_requests');
const failedRequests = new Counter('failed_requests');
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time', true);
const recoveryTime = new Trend('recovery_time', true);

export const options = {
  scenarios: {
    spike: {
      executor: 'ramping-vus',
      startVUs: 20,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 20 },
        { duration: '5s', target: 500 },
        { duration: '30s', target: 500 },
        { duration: '5s', target: 20 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    error_rate: ['rate<0.20'],
  },
};

function healthCheck() {
  const res = http.get(`${BASE_URL}/api/health`);
  return res.status === 200;
}

function doLoginWorkload() {
  const payload = JSON.stringify({
    email: `spike_${Date.now()}_${__VU}@example.com`,
    password: 'Test@12345',
    rememberMe: false,
  });
  const params = { headers: JSON_HEADERS };
  const res = http.post(`${BASE_URL}/api/auth/login`, payload, params);
  totalRequests.add(1);
  responseTime.add(res.timings.duration);
  const ok = res.status < 500;
  errorRate.add(!ok);
  failedRequests.add(ok ? 0 : 1);
}

function doPasswordCheckWorkload() {
  const passwords = ['password', '123456', 'MyP@ssw0rd', 'qwerty', 'Test@12345'];
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

function doGenerateWorkload() {
  const payload = JSON.stringify({ length: 16 });
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

  const workloadType = __ITER % 3;

  group('Spike Mixed Workload', () => {
    switch (workloadType) {
      case 0:
        doLoginWorkload();
        break;
      case 1:
        doPasswordCheckWorkload();
        break;
      case 2:
        doGenerateWorkload();
        break;
    }
  });

  sleep(0.2);
}

export { handleSummary };
