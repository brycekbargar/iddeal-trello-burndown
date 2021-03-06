'use strict';
const chai = require('./../../chai.js');
const expect = chai.expect;
const sinon = require('sinon');
require('sinon-as-promised');

const model = require('./../../../api/model/model.js');

describe('[Web] Expect /api/cards', () => {
  before('setup spies', () => {
    this.CardSpy = sinon.spy(model, 'Card');
    this.createOrReplaceStub = sinon.stub(model.Card, 'createOrReplace');
  });
  after('teardown spies', () => {
    this.createOrReplaceStub.restore();
    this.CardSpy.restore();
  });
  afterEach('reset spies', () => {
    this.createOrReplaceStub.reset();
    this.createOrReplaceStub.resetBehavior();
    this.CardSpy.reset();
  });

  before('setup server', () => {
    this.key = 'A Key';
    require('./../../../config/config.js').ScraperKey = this.key;
    return require('./../../../index.js').web().then(s => this.app = s.app);
  });

  describe('/{link} PUT', () => {
    beforeEach('setup card', () => {
      this.card = {
        name: 'Blueberry Scone',
        no: 1654
      };
      this.cardLink = '1562anei';
    });
    it('to report creating a new card', done => {
      this.createOrReplaceStub.resolves(true);
      expect(chai.request(this.app)
        .put(`/api/Cards/${this.cardLink}`)
        .set('apikey', this.key)
        .send(this.card))
      .to.eventually.have.status(201)
      .notify(done);
    });
    it('to report replacing an existing card', done => {
      this.createOrReplaceStub.resolves(false);
      expect(chai.request(this.app)
        .put(`/api/Cards/${this.cardLink}`)
        .set('apikey', this.key)
        .send(this.card))
      .to.eventually.have.status(204)
      .notify(done);
    });
    it('with invalid data to return validation errors', done => {
      expect(chai.request(this.app)
        .put(`/api/Cards/${this.cardLink}`)
        .set('apikey', this.key)
        .send({}).then(() => {})
        .catch(err => err.response))
      .to.eventually.have.status(400)
      .and.to.eventually.be.json
      .and.to.eventually.have.deep.property('body.message', 'Validation errors') 
      .and.also.eventually.have.deep.property('body.errors[0].code', 'INVALID_REQUEST_PARAMETER') 
      .notify(done);
    });
    it('to attempt to save the card', () => {
      this.createOrReplaceStub.resolves(true);
      return chai.request(this.app)
        .put(`/api/Cards/${this.cardLink}`)
        .set('apikey', this.key)
        .send(this.card)
        .then(() => {
          expect(this.createOrReplaceStub).to.have.been.calledOnce;
          expect(this.createOrReplaceStub.args[0][0])
            .and.to.be.an.instanceOf(model.Card)
            .and.to.have.property('link', this.cardLink)
            .and.to.also.have.property('name', this.card.name)
            .and.to.also.have.property('no', this.card.no);
        });
    });
    it('to forward exceptions', done => {
      const message = 'Nutella crepes';
      this.createOrReplaceStub.rejects(new Error(message));
      expect(chai.request(this.app)
        .put(`/api/Cards/${this.cardLink}`)
        .set('apikey', this.key)
        .send(this.card).then(() => {})
        .catch(err => err.response))
      .to.eventually.have.status(500)
      .to.eventually.have.deep.property('body.message', message)
      .notify(done);
    });
    it('to require Scraper permissions', done => {
      expect(chai.request(this.app)
        .put(`/api/Cards/${this.cardLink}`)
        .send({}).then(() => {})
        .catch(err => err.response))
      .to.eventually.have.status(401)
      .notify(done);
    });
  });
});
