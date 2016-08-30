'use strict';
const chai = require('./../utils/chai.js');
const expect = chai.expect;
const sinon = require('sinon');

const model = require('./../../../api/model/model.js');
const start = require('./../../../index.js').web;

describe('Expect /api/hello', () => {
  before('setup spies', () => {
    this.HelloStub = sinon.stub(model, 'Hello');
    this.HelloStub.returns(() => sinon.createStubInstance(model.Hello));
    this.greetStub = sinon.stub(model.Hello, 'greet');
  });
  after('teardown spies', () => {
    this.greetStub.restore();
    this.HelloStub.restore();
  });
  afterEach('reset spies', () => {
    this.greetStub.reset();
    this.greetStub.resetBehavior();
    this.HelloStub.reset();
  });

  before('setup server', () => start().then(s => this.app = s.app));

  describe('GET /', () => {
    it('to greet the requester', done => {
      const greeting = 'Pecan Waffles';
      this.greetStub.returns(greeting);
      expect(chai.request(this.app).get('/api/hello'))
      .to.eventually.have.status(200)
      .and.to.eventually.be.json
      .and.to.eventually.have.property('body', greeting)
      .notify(done);
    });
    it('to greet a stranger', () => {
      return chai.request(this.app)
      .get('/api/hello')
      .then(() => {
        expect(this.HelloStub).to.have.been.calledWithNew;
        expect(this.HelloStub).to.have.been.calledWith(undefined);
        expect(this.greetStub).to.have.been.calledOnce;
      });
    });
  });
  describe('GET ?name={name}', () => {
    it('to greet by name', () => {
      const name = 'Bryce';
      return chai.request(this.app)
      .get('/api/hello')
      .query({ name: name })
      .then(() => {
        expect(this.HelloStub).to.have.been.calledWithNew;
        expect(this.HelloStub).to.have.been.calledWith(name);
        expect(this.greetStub).to.have.been.calledOnce;
      });
    });
  });
});