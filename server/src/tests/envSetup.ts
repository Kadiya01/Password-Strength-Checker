process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "mysql://root@localhost:3306/pwc_test";
process.env.JWT_SECRET = "test-access-secret-key-for-testing-32ch";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-key-for-testing-32ch";
process.env.JWT_EXPIRES_IN = "15m";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";
