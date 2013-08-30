describe('remote expiry', function() {
  var Resource;
  describe('on a resource with a remote expiry key', function() {
    beforeEach(function() {
      Resource = Ember.Resource.define().extend({
        remoteExpiryKey: "foo"
      });
      this.resource = Resource.create();
      sinon.spy(this.resource, 'subscribeForExpiry');
    });

    it('should subscribe for expiry on fetch', function() {
      Ember.sendEvent(this.resource, 'didFetch');
      Ember.run.sync();
      expect(this.resource.subscribeForExpiry.callCount).to.equal(1);
    });
  });

  describe('on a resource with no remote expiry key', function() {
    beforeEach(function() {
      Resource = Ember.Resource.define().extend();
      this.resource = Resource.create();
      sinon.spy(this.resource, 'subscribeForExpiry');
    });

    it('should not subscribe for expiry on fetch', function() {
      Ember.sendEvent(this.resource, 'didFetch');
      Ember.run.sync();
      expect(this.resource.subscribeForExpiry.callCount).to.equal(0);
    });
  });

  describe("subscribing for expiry", function() {
    beforeEach(function() {
      Resource = Ember.Resource.define().extend({
        remoteExpiryKey: "foo"
      });
      this.resource = Resource.create();
      this.spy = sinon.stub(Ember.Resource.PushTransport, 'subscribe');
      Ember.sendEvent(this.resource, 'didFetch');
      Ember.run.sync();
    });

    afterEach(function() {
      Ember.Resource.PushTransport.subscribe.restore();
    });

    it('should use the PushTransport', function() {
      expect(this.spy.callCount).to.equal(1);
      expect(this.spy.getCall(0).args[0]).to.equal('foo');
      expect(typeof this.spy.getCall(0).args[1]).to.equal('function');
    });

    it('should subscribe to Ember.Resource.PushTransport', function() {
      expect(this.spy.callCount).to.equal(1);
    });

    it('should not subscribe more than once', function() {
      Ember.sendEvent(this.resource, 'didFetch');
      Ember.run.sync();
      expect(this.spy.callCount).to.equal(1);
    });
  });

  describe("updating expiry", function() {
    beforeEach(function() {
      Resource = Ember.Resource.define().extend({
        remoteExpiryKey: "foo"
      });
      this.resource = Resource.create();
      this.date = 1345511310;
      sinon.spy(this.resource, 'expire');
      sinon.spy(this.resource, 'fetch');
    });

    it('should expire resource when stale', function() {
      this.resource.updateExpiry({
        updatedAt: this.date
      });
      expect(this.resource.expire.callCount).to.equal(1);
    });

    it('should not expire resource when fresh', function() {
      this.resource.set('expiryUpdatedAt', 1345511310 + 200);
      this.resource.updateExpiry({
        updatedAt: this.date
      });
      expect(this.resource.expire.callCount).to.equal(0);
    });

    it('should not expire resource when message is malformed', function() {
      this.resource.updateExpiry({});
      expect(this.resource.expire.callCount).to.equal(0);
    });

    describe("with remote expiry auto fetch", function() {
      beforeEach(function() {
        this.resource.set('remoteExpiryAutoFetch', true);
      });

      it('should refetch resource when stale', function(done) {
        var resource = this.resource;

        Ember.run(function() {
          this.resource.updateExpiry({
            updatedAt: this.date
          });
        }.bind(this));

        Ember.run(function() {
          expect(resource.get('isExpired')).to.be.ok;
          expect(resource.fetch.callCount).to.equal(1);
          expect(resource.expire.callCount).to.equal(0);
          done();
        });
      });

      it('should not refetch resource when fresh', function() {
        this.resource.set('expiryUpdatedAt', 1345511310 + 200);
        this.resource.updateExpiry({
          updatedAt: this.date
        });
        expect(this.resource.expire.callCount).to.equal(0);
        expect(this.resource.fetch.callCount).to.equal(0);
      });

      it('should not refetch resource when message is malformed', function() {
        this.resource.updateExpiry({});
        expect(this.resource.expire.callCount).to.equal(0);
        expect(this.resource.fetch.callCount).to.equal(0);
      });
    });
  });
});
