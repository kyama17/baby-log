const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Handle CSS Modules
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // Setup files to run before each test file
  setupFiles: ['<rootDir>/jest.env.setup.js'], // For setting up env vars
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // For @testing-library/jest-dom
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  // By default, node_modules are not transformed.
  // We need to allow transformation for specific ES modules.
  // https://nextjs.org/docs/app/building-your-application/testing/jest#transforming-es-modules
  // This pattern allows transforming specific modules from node_modules.
  // Files in node_modules are otherwise not transformed.
  // Update: Trying to be more specific and ensure trailing slashes for directories.
  transformIgnorePatterns: [
    '/node_modules/(?!(jose/|@supabase/auth-helpers-shared/|@supabase/auth-helpers-nextjs/))',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
