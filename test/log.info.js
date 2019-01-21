const { stub } = require('sinon')
const expect = require('expect')

const log = require('../log')

let consoleStub

describe('Test the logging function', () => {
  beforeEach(() => {
    consoleStub = stub(console, 'log')
  })

  afterEach(() => {
    consoleStub.restore()
  })

  it('should console log a message', () => {
    const message = 'A test console message'
    log.info(message)
    expect(consoleStub.calledWith(message)).toBeTruthy()
  })
})
