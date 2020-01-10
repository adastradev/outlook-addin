module.exports = {
    preset: 'ts-jest/presets/js-with-babel',
    roots: ['src/'],
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    globals: {
      '__API_BASE_PATH__': '',
      '__SCHEDULE_BASE_PATH__': '',
      '__SCHEDULE_INSTANCE__': '',
      '__ADDIN_ID__': '',
      'ts-jest': {
        tsConfig: 'tsconfig.json',
      },
    },
    setupFiles: ['<rootDir>/internals/testing/enzyme-setup.js'],
    moduleDirectories: ['node_modules', 'src']
  };
  