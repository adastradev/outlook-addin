module.exports = {
    preset: 'ts-jest/presets/js-with-babel',
    roots: ['src/'],
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    globals: {
      'ts-jest': {
        tsConfig: 'tsconfig.json',
      },
    },
    setupFiles: ['<rootDir>/internals/testing/enzyme-setup.js'],
    moduleDirectories: ['node_modules', 'src']
  };
  