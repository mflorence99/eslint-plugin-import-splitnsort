module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts'
  ],
  coverageReporters: ['json-summary', 'text'],
  roots: ['<rootDir>/src/'],
  testEnvironment: 'node',
  testMatch: ['**/+(*.)+(spec).+(ts)'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },  
  transformIgnorePatterns: ['^.+\\.js$']
};
