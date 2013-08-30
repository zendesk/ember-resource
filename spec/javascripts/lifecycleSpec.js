/*globals Ember */
describe('Lifecycle', function() {
  var Person, server;

  beforeEach(function() {
    Person = Ember.Resource.define({
      url: '/people',
      schema: {
        id:       Number,
        name:     String
      }
    });

    server = sinon.fakeServer.create();
    server.respondWith("GET", "/people/1",
                       [200, { "Content-Type": "application/json" },
                       '{ "id": 1, "name": "Mick Staugaard" }']);
  });

  afterEach(function() {
    server.restore();
  });

  describe('new object', function() {
    var person;
    beforeEach(function() {
      person = Person.create({id: 1});
    });

    it('should be in the UNFETCHED state', function() {
      expect(person.get('resourceState')).to.equal(Ember.Resource.Lifecycle.UNFETCHED);
    });

    it('should not be expired', function() {
      expect(person.get('isExpired')).to.not.be.ok;
    });

    it('should never expire', function() {
      expect(person.get('expireAt')).to.be.undefined;
    });

    it('should be fetchable', function() {
      expect(person.get('isFetchable')).to.equal(true);
    });
  });

  describe('fetching', function() {
    var person;
    beforeEach(function() {
      person = Person.create({id: 1});
      person.fetch();
    });

    it('should put the object in a FETCHING state', function() {
      expect(person.get('resourceState')).to.equal(Ember.Resource.Lifecycle.FETCHING);
    });

    describe('is done', function() {
      beforeEach(function() {
        server.respond();
      });

      it('should put the object in a FETCHED state when the fetch is done', function() {
        expect(person.get('resourceState')).to.equal(Ember.Resource.Lifecycle.FETCHED);
      });

      it('should set expiry in 5 minutes', function() {
        var fiveMinutesFromNow = new Date();
        fiveMinutesFromNow.setSeconds(fiveMinutesFromNow.getSeconds() + (60 * 5));

        expect(person.get('expireAt')).to.not.equal(undefined);
        expect(person.get('expireAt').getTime()).to.be.within(fiveMinutesFromNow.getTime() - 100, fiveMinutesFromNow.getTime() + 100);
      });
    });

  });

  describe('expiry', function() {
    var person;

    beforeEach(function() {
      person = Person.create({id: 1});
    });

    it('should be expired with an expireAt in the past', function() {
      var expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() - 1);
      person.set('expireAt', expiry);
      expect(person.get('isExpired')).to.equal(true);
    });

    it('should be expired with an expireAt in the future', function() {
      var expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);
      person.set('expireAt', expiry);
      expect(person.get('isExpired')).to.not.be.ok;
      expect(person.get('resourceState')).to.equal(Ember.Resource.Lifecycle.UNFETCHED);
    });

    describe('when "expire" is called', function() {
      var tickSpy;

      beforeEach(function() {
        expect(person.get('isExpired')).to.not.be.ok;
        person.set('resourceState', Ember.Resource.Lifecycle.FETCHED);
        expect(person.get('isFetchable')).to.not.be.ok;
        tickSpy = sinon.stub(Ember.Resource.Lifecycle.clock, 'tick');
        person.expire();
      });

      afterEach(function() {
        Ember.Resource.Lifecycle.clock.tick.restore();
      });

      it('should expire the object', function(done) {
        Ember.addObserver(person, 'isExpired', function() {
          if (person.get('isExpired')) { done(); }
        });
      });

      it('should result in the object becoming fetchable', function(done) {
        Ember.addObserver(person, 'isFetchable', function() {
          if (person.get('isFetchable')) { done(); }
        });
      });

      it('should not tick the ember resource clock', function(done) {
        Ember.addObserver(person, 'isFetchable', function() {
          if (person.get('isExpired') && person.get('isFetchable')) {
            expect(tickSpy.callCount).to.equal(0);
            done();
          }
        });
      });
    });

  });

  describe('Given an object that observes `isFetchable`', function() {
    var person, called, obj;

    beforeEach(function() {
      called = false;

      person = Person.create({
        state: Ember.Resource.Lifecycle.FETCHED
      });

      obj = Ember.Object.extend({
        person: person,
        isFetchedDidChange: function() {
          called = true;
        }.observes('person.isFetchable')
      }).create();
    });

    describe('When we expire the person object', function() {
      beforeEach(function() {
        person.expireNow();
      });

      it('should call the observer', function() {
        expect(called).to.equal(true);
      });
    });
  });

});
