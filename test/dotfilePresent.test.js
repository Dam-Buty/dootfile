const expect = require('expect')
const { stub } = require('sinon')
const fs = require('fs')
const homedir = require('os').homedir()
const path = require('path')
const pjson = require('../package.json')

const dootfile = require('../')

const expectedEncoding = { encoding: 'utf8' }
const expectedKeys = ['foo', 'bar']
const expectedConfig = {
  foo: true,
  bar: 1,
  baz: 'yolo',
}

let readFileStub

describe('Arguments management', () => {
  beforeEach(() => {
    readFileStub = stub(fs, 'readFileSync').callsFake(() => JSON.stringify(expectedConfig))
  })

  afterEach(() => {
    readFileStub.restore()
  })

  it('should look for a dootfile with the default name from package.json', async () => {
    await dootfile()
    const expectedPath = path.join(homedir, `.${pjson.name}rc.json`)
    expect(readFileStub.calledWith(expectedPath, expectedEncoding)).toBeTruthy()
  })

  it('should look for a dootfile in the home dir if no folder is specified', async () => {
    await dootfile(expectedKeys, '.testrc.json')
    const expectedPath = path.join(homedir, '.testrc.json')
    expect(readFileStub.calledWith(expectedPath, expectedEncoding)).toBeTruthy()
  })

  it('should look for a dootfile in the specified folder', async () => {
    await dootfile(expectedKeys, '.testrc.json', '/tmp')
    const expectedPath = path.join('/tmp', '.testrc.json')
    expect(readFileStub.calledWith(expectedPath, expectedEncoding)).toBeTruthy()
  })
})

describe('Dootfile content management', () => {
  beforeEach(() => {
    readFileStub = stub(fs, 'readFileSync').callsFake(() => JSON.stringify(expectedConfig))
  })

  afterEach(() => {
    readFileStub.restore()
  })

  it('should return the values from the dootfile when it is present', async () => {
    const config = await dootfile()
    expect(config).toMatchObject(expectedConfig)
  })

  it('should only return the specified keys', async () => {
    const config = await dootfile(expectedKeys, '.testrc.json', '/tmp')
    expect(config).toEqual(expect.objectContaining({ foo: true, bar: 1 }))
    expect(config).toEqual(expect.not.objectContaining({ baz: 'yolo' }))
  })
})
