export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const TEST_USER = {
  fullName: 'Load Test User',
  email: `loadtest_${Date.now()}@example.com`,
  password: 'Test@12345',
  username: `loadtest_${Date.now()}`,
};

export const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

export const PASSWORDS = {
  weak: '123456',
  fair: 'password1',
  good: 'MyP@ssw0rd',
  strong: 'X9f!kL2@mN5#qR8$',
};

export const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123',
  'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
  'baseball', 'iloveyou', 'master', 'sunshine', 'ashley',
];

export function handleSummary(data) {
  const out = {};
  out['stdout'] = JSON.stringify(data, null, 2);
  out[`./k6-results/${__VU > 0 ? 'test' : 'summary'}-${Date.now()}.json`] = JSON.stringify(data, null, 2);
  return out;
}
