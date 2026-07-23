import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { BASE_URL, JSON_HEADERS, handleSummary } from './config.js';

const loginErrors = new Rate('login_errors');
const registerErrors = new Rate('register_errors');
const loginDuration = new Trend('login_duration', true);
const registerDuration = new Trend('register_duration', true);

export const options = {
  scenarios: {
    ramp_login: {
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
    register_flow: {
      executor: 'constant-vus',
      vus: 5,
      duration: '2m',
      startTime: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    login_errors: ['rate<0.05'],
    register_errors: ['rate<0.10'],
  },
};

function healthCheck() {
  const res = http.get(`${BASE_URL}/api/health`);
  check(res, {
    'health check status 200': (r) => r.status === 200,
  });
  return res.status === 200;
}

function doLogin(email, password) {
  const payload = JSON.stringify({ email, password, rememberMe: false });
  const params = { headers: JSON_HEADERS };
  const res = http.post(`${BASE_URL}/api/auth/login`, payload, params);

  loginDuration.add(res.timings.duration);

  const parsed = JSON.parse(res.body || '{}');
  const success = check(res, {
    'login status is 200': (r) => r.status === 200,
    'login returns success': () => parsed.success === true,
    'login has accessToken': () => parsed.data && parsed.data.accessToken,
    'login response time < 500ms': (r) => r.timings.duration < 500,
  });

  loginErrors.add(!success);

  if (!success) {
    console.log(`Login failed: ${res.status} ${res.body}`);
  }

  return parsed.data ? parsed.data.accessToken : null;
}

function doRegister(email, username, password) {
  const payload = JSON.stringify({
    email,
    username,
    password,
    firstName: 'Load',
    lastName: 'Test',
  });
  const params = { headers: JSON_HEADERS };
  const res = http.post(`${BASE_URL}/api/auth/register`, payload, params);

  registerDuration.add(res.timings.duration);

  const parsed = JSON.parse(res.body || '{}');
  const success = check(res, {
    'register status is 201 or 409': (r) => r.status === 201 || r.status === 409,
    'register response time < 500ms': (r) => r.timings.duration < 500,
  });

  registerErrors.add(!success);

  return parsed.data ? parsed.data.accessToken : null;
}

export default function () {
  group('Health Check', () => {
    if (__VU === 1 && __ITER === 0) {
      healthCheck();
    }
  });

  group('Login Load Test', () => {
    const email = `loadtest_vu${__VU}@example.com`;
    const token = doLogin(email, 'Test@12345');

    if (token) {
      group('Verify Authenticated Request', () => {
        const params = {
          headers: {
            ...JSON_HEADERS,
            Authorization: `Bearer ${token}`,
          },
        };
        const res = http.get(`${BASE_URL}/api/auth/me`, params);
        check(res, {
          'auth me status is 200': (r) => r.status === 200,
        });
      });
    }
  });

  group('Register + Login Flow', () => {
    const timestamp = Date.now();
    const email = `flow_${timestamp}_${__VU}@example.com`;
    const username = `flow_${timestamp}_${__VU}`;
    const token = doRegister(email, username, 'Test@12345');

    if (token) {
      sleep(0.5);
      doLogin(email, 'Test@12345');
    } else {
      doLogin(email, 'Test@12345');
    }
  });

  sleep(1);
}

export { handleSummary };
