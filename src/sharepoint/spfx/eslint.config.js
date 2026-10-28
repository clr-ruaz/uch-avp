const spfxProfile = require('@microsoft/eslint-config-spfx/lib/flat-profiles/react');
module.exports = [...spfxProfile, { files: ['**/*.ts', '**/*.tsx'], rules: { 'no-void': ['error', { allowAsStatement: true }] }, languageOptions: { parserOptions: { tsconfigRootDir: __dirname, project: './tsconfig.json' } } }];
