const { generateMarkdown } = require('../src/ship')

// ---------------------------------------------------------------------------------------------

test(`returns an empty string when source data is empty`, () => {
  let markdown = generateMarkdown('1.0.0', {})

  expect(markdown).toStrictEqual('')

  markdown = generateMarkdown('1.0.0', {
    new: [],
    updated: [],
    fixed: []
  })

  expect(markdown).toStrictEqual('')

  markdown = generateMarkdown('1.0.0', {
    updated: [],
  })

  expect(markdown).toStrictEqual('')
})

test('adds a version header', () => {
  const markdown = generateMarkdown('1.0.0', { new: ['new item'] })

  expect(markdown).toMatch(/^### 1\.0\.0/)
})

test('includes only categories with changes', () => {
  let markdown = generateMarkdown('1.0.0', {
    new: ['feature 1'],
    updated: ['update 1'],
    fixed: ['patch 1'],
  })

  expect(markdown).toMatch('**New**')
  expect(markdown).toMatch('**Updated**')
  expect(markdown).toMatch('**Fixed**')

  markdown = generateMarkdown('1.0.0', {
    new: ['feature 1'],
  })

  expect(markdown).toMatch('**New**')
  expect(markdown).not.toMatch('**Updated**')
  expect(markdown).not.toMatch('**Fixed**')

  markdown = generateMarkdown('1.0.0', {
    updated: ['update 1'],
  })

  expect(markdown).not.toMatch('**New**')
  expect(markdown).toMatch('**Updated**')
  expect(markdown).not.toMatch('**Fixed**')

  markdown = generateMarkdown('1.0.0', {
    fixed: ['patch 1'],
  })

  expect(markdown).not.toMatch('**New**')
  expect(markdown).not.toMatch('**Updated**')
  expect(markdown).toMatch('**Fixed**')

  markdown = generateMarkdown('1.0.0', {
    new: ['feature 1'],
    updated: ['update 1'],
  })

  expect(markdown).toMatch('**New**')
  expect(markdown).toMatch('**Updated**')
  expect(markdown).not.toMatch('**Fixed**')

  markdown = generateMarkdown('1.0.0', {
    new: ['feature 1'],
    fixed: ['patch 1']
  })

  expect(markdown).toMatch('**New**')
  expect(markdown).not.toMatch('**Updated**')
  expect(markdown).toMatch('**Fixed**')

  markdown = generateMarkdown('1.0.0', {
    updated: ['update 1'],
    fixed: ['patch 1']
  })

  expect(markdown).not.toMatch('**New**')
  expect(markdown).toMatch('**Updated**')
  expect(markdown).toMatch('**Fixed**')
})

test('always puts categories in [new, updated, fixed] order', () => {
  const expectedMatch = `
**New**
- feature 1

**Updated**
- update 1

**Fixed**
- patch 1
`
  let markdown = generateMarkdown('1.0.0', {
    new: ['feature 1'],
    updated: ['update 1'],
    fixed: ['patch 1'],
  })

  expect(markdown).toMatch(expectedMatch)

  markdown = generateMarkdown('1.0.0', {
    updated: ['update 1'],
    new: ['feature 1'],
    fixed: ['patch 1'],
  })

  expect(markdown).toMatch(expectedMatch)

  markdown = generateMarkdown('1.0.0', {
    updated: ['update 1'],
    fixed: ['patch 1'],
    new: ['feature 1'],
  })

  expect(markdown).toMatch(expectedMatch)

  markdown = generateMarkdown('1.0.0', {
    fixed: ['patch 1'],
    new: ['feature 1'],
    updated: ['update 1'],
  })

  expect(markdown).toMatch(expectedMatch)

  markdown = generateMarkdown('1.0.0', {
    updated: ['update 1'],
    new: ['feature 1'],
    fixed: ['patch 1'],
  })

  expect(markdown).toMatch(expectedMatch)
})

test('ignores other categories in source data', () => {
  let markdown = generateMarkdown('1.0.0', {
    new: ['feature 1'],
    updated: ['update 1'],
    fixed: ['patch 1'],
    cows: ['moo'],
    knights: ['ni']
  })

  expect(markdown).toMatch(`
**New**
- feature 1

**Updated**
- update 1

**Fixed**
- patch 1
`)
})

test('ends with a single newline', () => {
  let markdown = generateMarkdown('1.0.0', {
    new: ['feature 1'],
    updated: ['update 1'],
    fixed: ['patch 1'],
  })

  expect(markdown).toMatch(/[^\n]\n$/)

  markdown = generateMarkdown('1.0.0', {
    new: ['feature 1'],
    updated: ['update 1'],
  })

  expect(markdown).toMatch(/[^\n]\n$/)

  markdown = generateMarkdown('1.0.0', {
    fixed: ['patch 1'],
  })

  expect(markdown).toMatch(/[^\n]\n$/)
})
