module.exports = {
  presets: [
    '@babel/preset-env',
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
    // Using 'next/babel' is often preferred for Next.js projects
    // as it includes the above and other necessary configurations.
    // If the above doesn't work, we can try 'next/babel'.
  ],
};
