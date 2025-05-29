module.exports = {
  // preset: 'ts-jest', // Removed ts-jest preset
  testEnvironment: 'node', // Default environment
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // If you use path aliases like @/components
    // Handle CSS Modules (if you use them, otherwise optional)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // Setup files to run before each test file
  setupFiles: ['<rootDir>/jest.env.setup.js'], // For setting up env vars
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // For @testing-library/jest-dom
  // Babel-jest will be automatically used with babel.config.js
  // No explicit transform needed here if babel.config.js is set up
};
