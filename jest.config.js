// By default, debug messages are written to the console which can make the test output confusing
// Instead, bind to stdout and hide all debug messages
const processStdoutWrite = process.stdout.write.bind(process.stdout)
process.stdout.write = (str, encoding, cb) => {
  // Debug messages begin with ::
  if (str.match(/^::/)) return false
  return processStdoutWrite(str, encoding, cb)
}

module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  verbose: true,
}
