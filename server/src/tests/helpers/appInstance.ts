import { createTestApp } from "./testApp";

let app: ReturnType<typeof createTestApp>;

export function getApp(): ReturnType<typeof createTestApp> {
  if (!app) {
    app = createTestApp();
  }
  return app;
}
