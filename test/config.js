const { cosmiconfig } = require('cosmiconfig')
const path = require('path')

const getConfig = require('../src/config')

// Mock cosmiconfig search utility
const mockSearch = jest.fn()
jest.mock('cosmiconfig', () => ({ cosmiconfig: jest.fn(() => ({ search: mockSearch })) }))

// Set expected default config
const defaultConfig = {
  source: path.resolve(process.cwd(), 'resources/changelog'),
  destination: path.resolve(process.cwd(), 'CHANGELOG.md'),
  overwrite: false,
  bumpFiles: []
}

// ---------------------------------------------------------------------------------------------

test('supports zero-config', async () => {
  mockSearch.mockResolvedValue({ config: null })
  const resolvedConfig = await getConfig({})

  expect(resolvedConfig.source).toEqual(defaultConfig.source)
  expect(resolvedConfig.destination).toEqual(defaultConfig.destination)
  expect(resolvedConfig.overwrite).toEqual(defaultConfig.overwrite)
  expect(resolvedConfig.bumpFiles).toEqual(defaultConfig.bumpFiles)
})

test('always resolves absolute paths', async () => {
  const suppliedConfig = {
    source: './subdir/changelog',
    destination: 'another-subdir/CHANGELOG.md'
  }

  mockSearch.mockResolvedValue({ config: suppliedConfig })
  const resolvedConfig = await getConfig({})

  expect(resolvedConfig.source).toEqual(path.resolve(suppliedConfig.source))
  expect(resolvedConfig.destination).toEqual(path.resolve(suppliedConfig.destination))
})

test('supports configuration objects', async () => {
  const suppliedConfig = {
    source: '/different-path/changelog',
    destination: '/different-path/CHANGES.md',
    bumpFiles: ['./index.js']
  }

  mockSearch.mockResolvedValue({ config: suppliedConfig })
  const resolvedConfig = await getConfig({})

  expect(resolvedConfig.source).toEqual(suppliedConfig.source)
  expect(resolvedConfig.destination).toEqual(suppliedConfig.destination)
  expect(resolvedConfig.overwrite).toEqual(defaultConfig.overwrite)
  expect(resolvedConfig.bumpFiles).toEqual(suppliedConfig.bumpFiles)
})

test('supports command arguments', async () => {
  const argv = {
    _: [],
    destination: 'PENGUINS.md'
  }

  mockSearch.mockResolvedValue({ config: null })
  const resolvedConfig = await getConfig(argv)

  expect(resolvedConfig.destination).toBe(path.resolve(argv.destination))
})

test('command arguments override config', async () => {
  const argv = {
    _: [],
    source: 'penguins/changelog'
  }
  const suppliedConfig = {
    source: 'bananas/changelog'
  }

  mockSearch.mockResolvedValue({ config: suppliedConfig })
  const resolvedConfig = await getConfig(argv)

  expect(resolvedConfig.source).toEqual(path.resolve(argv.source))
})
