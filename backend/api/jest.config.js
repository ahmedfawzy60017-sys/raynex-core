module.exports = {
  rootDir: '.',
  testRegex: '.*\\.(spec|unit-spec)\\.ts$',
  transform: { '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: 'tsconfig.json' }] },
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.ts'],
};
