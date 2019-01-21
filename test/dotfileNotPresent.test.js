const { stub } = require('sinon')
const expect = require('expect')
const promptly = require('promptly')
const fs = require('fs')
const path = require('path')
const homedir = require('os').homedir()
const pjson = require('../package.json')

const dootfile = require('../')
const log = require('../log')
const constants = require('../constants')

const expectedPath = path.join(homedir, `.${pjson.name}rc.json`)
const expectedKeys = ['foo', 'bar']
const invalidJson = 'this is not valid JSON'

let consoleStub, promptStub, exitStub, readFileStub, writeFileStub, openFileStub, closeFileStub

function fakeEnoent() {
  this.code = 'ENOENT'
}

describe('Absent config management ', () => {
  beforeEach(() => {
    consoleStub = stub(log, 'info')
    promptStub = stub(promptly, 'prompt').callsFake(async () => Math.random())
    exitStub = stub(process, 'exit')
    readFileStub = stub(fs, 'readFileSync').callsFake(() => { throw new fakeEnoent() })
    writeFileStub = stub(fs, 'writeFileSync')
    openFileStub = stub(fs, 'openSync')
    closeFileStub = stub(fs, 'closeSync')
  })
  
  afterEach(() => {
    consoleStub.restore()
    promptStub.restore()
    exitStub.restore()
    readFileStub.restore()
    writeFileStub.restore()
    openFileStub.restore()
    closeFileStub.restore()
  })

  it('should print a message and exit if the dootfile is not present and no key is specified', async () => {
    await dootfile()
    expect(consoleStub.calledWith(constants.NO_DOTFILE)).toBeTruthy()
    expect(consoleStub.calledWith(constants.EDIT_BY_HAND)).toBeTruthy()
    expect(openFileStub.calledWith(expectedPath, 'w'))
    expect(exitStub.calledWith(1)).toBeTruthy()
  })

  it('should prompt the user for the required keys and store the inputs in a file', async () => {
    const config = await dootfile(expectedKeys)

    expect(consoleStub.calledWith(constants.NO_DOTFILE)).toBeTruthy()
    expect(promptStub.calledWith(`${expectedKeys[0]} : `)).toBeTruthy()
    expect(promptStub.calledWith(`${expectedKeys[1]} : `)).toBeTruthy()
    expect(writeFileStub.calledWith(expectedPath)).toBeTruthy()
    expect(JSON.parse(writeFileStub.firstCall.args[1])).toMatchObject({
      foo: expect.anything(),
      bar: expect.anything(),
    })
    expect(config).toMatchObject({
      foo: expect.anything(),
      bar: expect.anything(),
    })
  })
})

describe('Invalid JSON management', () => {
  beforeEach(() => {
    consoleStub = stub(log, 'info')
    exitStub = stub(process, 'exit')
    readFileStub = stub(fs, 'readFileSync').callsFake(() => invalidJson)
    promptStub = stub(promptly, 'prompt').callsFake(async () => Math.random())
    writeFileStub = stub(fs, 'writeFileSync')
  })

  afterEach(() => {
    consoleStub.restore()
    exitStub.restore()
    readFileStub.restore()
    writeFileStub.restore()
    promptStub.restore()
  })

  it('should print a message and exit if the dootfile is not present and no key is specified', async () => {
    await dootfile()

    expect(consoleStub.calledWith(constants.INVALID_JSON)).toBeTruthy()
    expect(consoleStub.calledWith(constants.EDIT_BY_HAND)).toBeTruthy()
    expect(openFileStub.calledWith(expectedPath, 'w'))
    expect(exitStub.calledWith(1)).toBeTruthy()
  })

  it('should prompt the user for the required keys', async () => {
    const config = await dootfile(expectedKeys)

    expect(consoleStub.calledWith(constants.INVALID_JSON)).toBeTruthy()
    expect(promptStub.calledWith(`${expectedKeys[0]} : `)).toBeTruthy()
    expect(promptStub.calledWith(`${expectedKeys[1]} : `)).toBeTruthy()
    expect(writeFileStub.calledWith(expectedPath)).toBeTruthy()
    expect(JSON.parse(writeFileStub.firstCall.args[1])).toMatchObject({
      foo: expect.anything(),
      bar: expect.anything(),
    })
    expect(config).toMatchObject({
      foo: expect.anything(),
      bar: expect.anything(),
    })
  })
})
