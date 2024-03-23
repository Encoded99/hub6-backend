module.exports = {
  verbose: true,
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
  testMatch: ['<rootDir>/tests/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/'],
}
