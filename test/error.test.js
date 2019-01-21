const expect = require('expect')
const { stub } = require('sinon')
const fs = require('fs')

const dootfile = require('../')
const log = require('../log')

const expectedError = 'Random error message'

let readFileStub, exitStub, consoleStub

describe('Error management', () => {
  beforeEach(() => {
    consoleStub = stub(log, 'info')
    readFileStub = stub(fs, 'readFileSync').callsFake(() => { throw new Error(expectedError) })
    exitStub = stub(process, 'exit')
  })

  afterEach(() => {
    consoleStub.restore()
    readFileStub.restore()
    exitStub.restore()
  })

  it('should log a message and exit if an unknown error occurs', async () => {
    await dootfile()

    const errorMessage = consoleStub.firstCall.args[0]
    expect(errorMessage).toContain(expectedError)
    expect(exitStub.calledWith(1)).toBeTruthy()
  })
})
