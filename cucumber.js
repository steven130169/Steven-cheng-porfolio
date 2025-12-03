// Ensure ts-node uses the correct config for E2E tests
process.env.TS_NODE_PROJECT = 'e2e/tsconfig.json';

module.exports = {
  default: {
    paths: ['e2e/specs/**/*.feature'],
    import: ['e2e/tests/bdd-steps/**/*.ts'],
    loader: ['ts-node/esm'],
    format: ['summary', 'progress'],
    formatOptions: { snippetInterface: 'async-await' }
  }
};
