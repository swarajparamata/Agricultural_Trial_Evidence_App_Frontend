import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  // The original single-file prototype is kept for reference only.
  globalIgnores(['dist', 'agritrial_dashboard.tsx']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    rules: {
      // Every module is a folder with an index file, so imports must point at folders.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '(^|/)index(\\.[cm]?[jt]sx?)?$|\\.[cm]?[jt]sx?$',
              message: 'Import the folder (e.g. "@/components/ui/Button"), not a file inside it.',
            },
          ],
        },
      ],
    },
  },
]);
