const fs = require('node:fs')
const path = require('node:path')
const { createHash } = require('node:crypto')
const { createRequire } = require('node:module')

const args = process.argv.slice(2)
function option(name, fallback) {
  const index = args.indexOf(name)
  return index < 0 ? fallback : args[index + 1]
}
const repoRoot = path.resolve(option('--repo', path.join(__dirname, '..')))
const themeRoot = path.resolve(repoRoot, option('--theme', 'magic-theme'))
const appRoot = path.resolve(repoRoot, option('--app', 'magicApp'))
const output = path.resolve(repoRoot, option('--output', 'magicApp/react/components/CentralRelacionamento/assetDefaults.js'))
const manifest = JSON.parse(fs.readFileSync(path.join(themeRoot, 'manifest.json'), 'utf8'))
if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) throw new Error('Expected the concrete MagicTheme release version')
const localRequire = createRequire(path.join(appRoot, 'react/package.json'))
const ts = localRequire('typescript')
const blockFile = path.join(themeRoot, 'store/blocks/institucional/central-relacionamento/central-relacionamento.jsonc')
const parsed = ts.parseConfigFileTextToJson(blockFile, fs.readFileSync(blockFile, 'utf8'))
if (parsed.error) throw new Error('The central page JSONC is invalid')
const assetMap = parsed.config['pd-CentralRelacionamento']?.props?.staticAssets
if (!assetMap || typeof assetMap !== 'object' || Array.isArray(assetMap)) throw new Error('The central block must declare its staticAssets map')
const base = `https://${manifest.vendor}.vtexassets.com/assets/vtex/assets-builder/${manifest.vendor}.${manifest.name}/${manifest.version}/`
const entries = []
for (const [key, assetPath] of Object.entries(assetMap)) {
  if (!/^[A-Za-z][A-Za-z0-9]*$/.test(key)) throw new Error('Unsupported asset slot: ' + key)
  if (typeof assetPath !== 'string' || !/^assets\/img\/faq\/[^/]+\.(?:png|svg|jpe?g)$/.test(assetPath)) throw new Error('Expected an original MagicTheme asset path for ' + key)
  const bytes = fs.readFileSync(path.join(themeRoot, assetPath))
  if (!bytes.length) throw new Error('Empty asset: ' + assetPath)
  if (assetPath.endsWith('.svg') && bytes.includes(13)) throw new Error('Normalize the FAQ SVG to LF before generating its URL: ' + assetPath)
  const extension = path.extname(assetPath)
  const stem = assetPath.slice('assets/'.length, -extension.length)
  const hash = createHash('md5').update(bytes).digest('hex')
  entries.push(`  ${key}:\n    '${base}${stem}___${hash}${extension}',`)
}
const code = '// MagicTheme Assets Builder URLs for legacy CMS records without staticAssets.\n' +
  'export const ASSET_DEFAULTS = Object.freeze({\n' + entries.join('\n') + '\n})\n\nexport default ASSET_DEFAULTS\n'
fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, code, 'utf8')
console.log(`Generated ${entries.length} fallback slots from ${manifest.vendor}.${manifest.name}@${manifest.version}`)
