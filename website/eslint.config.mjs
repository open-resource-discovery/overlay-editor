// Minimal flat ESLint config for the Docusaurus site. Root linting is scoped to
// the library (`src/`, `tests/`); the website is linted here only to keep
// generated output out of any recursive runs.
export default [
  {
    ignores: ['build/**', '.docusaurus/**', 'node_modules/**'],
  },
];
