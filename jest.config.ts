import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  moduleNameMapper: {
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@types$': '<rootDir>/src/components/types/types.ts',
    '^@icons/(.*)$': '<rootDir>/src/icons/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@ui/(.*)$': '<rootDir>/src/components/ui/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },

  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },

  testMatch: [
    '**/__tests__/**/*.ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)'
  ],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts'
  ],

  transformIgnorePatterns: [
    'node_modules/(?!(react-leaflet|@react-leaflet|leaflet)/)'
  ],

  roots: ['<rootDir>/src'],

  moduleDirectories: ['node_modules', '<rootDir>/src'],

  clearMocks: true,

  collectCoverage: false,
  coverageDirectory: 'coverage',

  coverageReporters: ['text', 'lcov'],
};

export default config;