const path = require('node:path')
const { createRequire } = require('node:module')

const appRoot = process.env.MF_APP_ROOT || path.resolve(__dirname, '../..')
const themeRoot = process.env.MF_THEME_ROOT || path.resolve(appRoot, '../magic-theme')
const componentDir = path.join(appRoot, 'react/components/CentralRelacionamento')
const assetDir = process.env.MF_ASSET_DIR || path.join(themeRoot, 'assets/img/faq')

// Reuse one complete local React/DOM runtime; never install dependencies or mix
// React resolved from MagicApp with ReactDOM resolved from the AF checkout.
const getProjectRequire = () => {
  const candidates = process.env.MF_TEST_RUNTIME
    ? [path.resolve(process.env.MF_TEST_RUNTIME)]
    : [path.join(appRoot, 'react/package.json'), path.resolve(appRoot, '../../authenticfeet-ecommerce/react/package.json')]
  for (const candidate of candidates) {
    const runtimeRequire = createRequire(candidate)
    try {
      for (const dependency of ['react', 'react-dom/client', 'react-dom/server', 'jsdom', '@babel/core', '@babel/plugin-transform-react-jsx', '@babel/plugin-transform-modules-commonjs', 'typescript']) runtimeRequire.resolve(dependency)
      return runtimeRequire
    } catch (_) { /* Try the existing sibling checkout; do not install packages. */ }
  }
  throw new Error('Set MF_TEST_RUNTIME to an already installed react/package.json with the test dependencies')
}

module.exports = { appRoot, themeRoot, componentDir, assetDir, getProjectRequire }
