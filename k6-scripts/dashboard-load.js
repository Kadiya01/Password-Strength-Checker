import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { BASE_URL, JSON_HEADERS, handleSummary } from './config.js';

const dashboardErrors = new Rate('dashboard_errors');
const dashboardDuration = new Trend('dashboard_duration', true);

export const options = {
  scenarios: {
    ramp_dashboard: {
      executor: 'ramping-vus',
      startVUs: 5,
      stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 25 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 50 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    dashboard_errors: ['rate<0.05'],
  },
};

const DASHBOARD_ENDPOINTS = [
  { method: 'GET', path: '/api/dashboard/statistics', label: 'statistics' },
  { method: 'GET', path: '/api/dashboard/security-score', label: 'security_score' },
  { method: 'GET', path: '/api/dashboard/login-history', label: 'login_history' },
  { method: 'GET', path: '/api/dashboard/activity-timeline', label: 'activity_timeline' },
  { method: 'GET', path: '/api/dashboard/password-analytics', label: 'password_analytics' },
  { method: 'GET', path: '/api/dashboard/chart-data', label: 'chart_data' },
  { method: 'GET', path: '/api/dashboard/generation-stats', label: 'generation_stats' },
];

function healthCheck() {
  const res = http.get(`${BASE_URL}/api/health`);
  return res.status === 200;
}

function loginAs(email, password) {
  const payload = JSON.stringify({ email, password, rememberMe: false });
  const params = { headers: JSON_HEADERS };
  const res = http.post(`${BASE_URL}/api/auth/login`, payload, params);

  if (res.status === 200) {
    const parsed = JSON.parse(res.body || '{}');
    return parsed.data ? parsed.data.accessToken : null;
  }

  return null;
}

function setupTestUser() {
  const timestamp = Date.now();
  const email = `dash_${timestamp}_${__VU}@example.com`;
  const username = `dash_${timestamp}_${__VU}`;
  const password = 'Test@12345';

  const regPayload = JSON.stringify({
    email,
    username,
    password,
    firstName: 'Dashboard',
    lastName: 'Tester',
  });
  const regRes = http.post(`${BASE_URL}/api/auth/register`, regPayload, { headers: JSON_HEADERS });

  if (regRes.status === 201 || regRes.status === 409) {
    const token = loginAs(email, password);
    return { email, token };
  }

  const token = loginAs(email, password);
  return { email, token };
}

const userTokens = {};

function getAuthToken() {
  if (userTokens[__VU]) {
    return userTokens[__VU];
  }

  const { token } = setupTestUser();
  if (token) {
    userTokens[__VU] = token;
  }
  return token;
}

function testEndpoint(token, endpoint) {
  const params = {
    headers: {
      ...JSON_HEADERS,
      Authorization: `Bearer ${token}`,
    },
  };

  const url = `${BASE_URL}${endpoint.path}`;
  const res = http.get(url, params);

  dashboardDuration.add(res.timings.duration);

  const parsed = JSON.parse(res.body || '{}');
  const success = check(res, {
    [`${endpoint.label} status is 200`]: (r) => r.status === 200,
    [`${endpoint.label} returns success`]: () => parsed.success === true,
    [`${endpoint.label} response time < 500ms`]: (r) => r.timings.duration < 500,
  });

  dashboardErrors.add(!success);

  if (!success) {
    console.log(`${endpoint.label} failed: ${res.status} ${res.body}`);
  }

  return success;
}

export default function () {
  group('Health Check', () => {
    if (__VU === 1 && __ITER === 0) {
      healthCheck();
    }
  });

  const token = getAuthToken();

  if (!token) {
    console.log(`VU ${__VU}: Failed to get auth token`);
    sleep(2);
    return;
  }

  group('Dashboard Endpoints', () => {
    for (const endpoint of DASHBOARD_ENDPOINTS) {
      testEndpoint(token, endpoint);
      sleep(0.2);
    }
  });

  group('Password History', () => {
    const params = {
      headers: {
        ...JSON_HEADERS,
        Authorization: `Bearer ${token}`,
      },
    };
    const res = http.get(`${BASE_URL}/api/password/history?page=1&limit=20`, params);
    dashboardDuration.add(res.timings.duration);

    check(res, {
      'password history status is 200': (r) => r.status === 200,
      'password history response time < 500ms': (r) => r.timings.duration < 500,
    });
  });

  group('User Profile', () => {
    const params = {
      headers: {
        ...JSON_HEADERS,
        Authorization: `Bearer ${token}`,
      },
    };
    const res = http.get(`${BASE_URL}/api/auth/me`, params);
    dashboardDuration.add(res.timings.duration);

    check(res, {
      'user profile status is 200': (r) => r.status === 200,
    });
  });

  sleep(1);
}

export { handleSummary };
