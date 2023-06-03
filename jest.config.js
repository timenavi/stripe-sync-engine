module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['node_modules', 'dist'],
  moduleNameMapper: {
    '^@/(.*)': '<rootDir>/$1',
  },
  verbose: true,
}
