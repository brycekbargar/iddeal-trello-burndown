'use strict';
const spy = require('sinon').spy;
const expect = require('chai')
  .use(require('sinon-chai'))
  .expect;
const params = require('./../utils/swaggerParams.js');
const proxyquire = require('proxyquire').noCallThru();
let proxyquireStubs = {};

const Hello = require('./../../../api/model/hello.js');

describe('Expect helloController', () => {
  describe('/get?name={name}', () => {
    beforeEach('setup spies', () => {
      this.resSpy = spy();
      this.helloSpy = spy(Hello);
      proxyquireStubs['./../model/hello.js'] = this.helloSpy;
      this.greetSpy = spy(Hello.prototype, 'greet');
    });
    beforeEach('make call', () => {
      this.name = 'Bryce';
      proxyquire('./../../../api/controllers/helloController.js', proxyquireStubs)
        .get(params([{
          name: 'name',
          value: this.name
        }]), { 
          send: this.resSpy 
        });
    });
    afterEach('teardown spies', () => {
      this.greetSpy.restore();
    });
    it('to delegate to the model', () => {
      expect(this.helloSpy).to.have.been.calledWithNew;
      expect(this.helloSpy).to.have.been.calledWith(this.name);
      expect(this.greetSpy).to.have.been.called;
    });
    it('to greet the user with the given name', () => {
      expect(this.resSpy).to.have.been.calledWith(`Hello, ${this.name}!`);
    });
  });
});