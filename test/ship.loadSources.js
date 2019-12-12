const path = require('path')

const {
  loadSources
} = require('../src/ship')

jest.mock('glob', () => jest.fn())
const glob = require('glob')

const makeGlobReturn = (files) => {
  glob.mockImplementation((...args) => {
    if (typeof args[1] === 'function') args[1](null, files)
    else args[2](null, files)
  })
}

const defaultConfig = {
  source: path.resolve(__dirname, 'fixtures/sources'),
  destination: path.resolve(__dirname, 'fixtures/CHANGELOG.md'),
  overwrite: false,
  bumpFiles: []
}

const createConfig = (overrides = {}) => {
  return Object.assign({}, defaultConfig, overrides)
}

// ---------------------------------------------------------------------------------------------

beforeEach(() => {
  glob.mockClear()
})

test(`throws if source path doesn't exist`, async () => {
  const resolvedConfig = createConfig({ source: 'path/to/invalid/dir' })
  expect(loadSources(resolvedConfig)).rejects.toThrow(`source path doesn't exist`)
})

test(`returns an empty object if there are no files to read`, async () => {
  const resolvedConfig = createConfig()
  makeGlobReturn([])

  const loaded = await loadSources(resolvedConfig)
  expect(loaded).toEqual({})
})

test(`parses .yml files`, async () => {
  const resolvedConfig = createConfig()

  makeGlobReturn([path.resolve(__dirname, 'fixtures/sources/20191212_110200_master.yml')])

  const loaded = await loadSources(resolvedConfig)
  expect(loaded).toEqual({
    new: ['item one', 'item two'],
    updated: ['update one', 'update two'],
    fixed: ['patch 1', 'patch 2']
  })
})

test(`parses .yaml files`, async () => {
  const resolvedConfig = createConfig()

  makeGlobReturn([path.resolve(__dirname, 'fixtures/sources/20191212_110330_feature--some-feature.yaml')])

  const loaded = await loadSources(resolvedConfig)
  expect(loaded).toEqual({
    updated: ['update 1 from some-feature', 'update 2 from some-feature'],
    fixed: ['patch from some-feature']
  })
})

test(`merges multiple sources alphabetically`, async () => {
  const resolvedConfig = createConfig()

  makeGlobReturn([
    path.resolve(__dirname, 'fixtures/sources/20191212_110200_master.yml'),
    path.resolve(__dirname, 'fixtures/sources/20191212_110330_feature--some-feature.yaml')
  ])

  const loaded = await loadSources(resolvedConfig)
  expect(loaded).toEqual({
    new: ['item one', 'item two'],
    updated: ['update one', 'update two', 'update 1 from some-feature', 'update 2 from some-feature'],
    fixed: ['patch 1', 'patch 2', 'patch from some-feature']
  })
})
