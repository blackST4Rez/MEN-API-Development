import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: [
    "<rootDir>/src/tests/**/*.test.ts",
    "<rootDir>/src/**/__tests__/**/*.ts",
  ],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/tests/**/*",
    "!src/**/__tests__/**/*",
  ],
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
};

export default config;