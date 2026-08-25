import js from '@eslint/js'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'

export default [
  { ignores: ['dist', 'node_modules', 'temporary screenshots'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]', args: 'none' }],
      // This project doesn't use the prop-types package anywhere; the rule would
      // require introducing a new convention rather than catching real bugs.
      'react/prop-types': 'off',
      // Flags any effect that transitively calls setState, including the
      // standard `useEffect(() => { load() }, [])` fetch-on-mount idiom used
      // throughout this codebase, because it can't see past the `await` in
      // the async function it calls. Not useful without a data-fetching
      // framework layer.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    // Root-level Node automation/build scripts (dev server, screenshot tool, etc.)
    files: ['*.mjs', '*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]', args: 'none' }],
    },
  },
]
