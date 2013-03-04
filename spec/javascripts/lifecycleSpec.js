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
      expect(person.get('resourceState')).toBe(Ember.Resource.Lifecycle.UNFETCHED);
    });

    it('should not be expired', function() {
      expect(person.get('isExpired')).toBeFalsy();
    });

    it('should never expire', function() {
      expect(person.get('expireAt')).toBeUndefined();
    });

    it('should be fetchable', function() {
      expect(person.get('isFetchable')).toBe(true);
    });
  });

  describe('fetching', function() {
    var person;
    beforeEach(function() {
      person = Person.create({id: 1});
      person.fetch();
    });

    it('should put the object in a FETCHING state', function() {
      expect(person.get('resourceState')).toBe(Ember.Resource.Lifecycle.FETCHING);
    });

    describe('is done', function() {
      beforeEach(function() {
        server.respond();
      });

      it('should put the object in a FETCHED state when the fetch is done', function() {
        expect(person.get('resourceState')).toBe(Ember.Resource.Lifecycle.FETCHED);
      });

      it('should set expiry in 5 minutes', function() {
        var fiveMinutesFromNow = new Date();
        fiveMinutesFromNow.setSeconds(fiveMinutesFromNow.getSeconds() + (60 * 5));

        expect(person.get('expireAt')).toBeDefined();
        expect(person.get('expireAt').getTime()).toBeCloseTo(fiveMinutesFromNow.getTime(), 2);
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
      expect(person.get('isExpired')).toBe(true);
    });

    it('should be expired with an expireAt in the future', function() {
      var expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);
      person.set('expireAt', expiry);
      expect(person.get('isExpired')).toBeFalsy();
      expect(person.get('resourceState')).toBe(Ember.Resource.Lifecycle.UNFETCHED);
    });

    describe('when "expire" is called', function() {
      var tickSpy;

      beforeEach(function() {
        expect(person.get('isExpired')).toBeFalsy();
        person.set('resourceState', Ember.Resource.Lifecycle.FETCHED);
        expect(person.get('isFetchable')).toBeFalsy();
        tickSpy = spyOn(Ember.Resource.Lifecycle.clock, 'tick');
        person.expire();
      });

      it('should expire the object', function() {
        waitsFor(function() {
          return person.get('isExpired');
        }, 'person never expired', 1000);
      });

      it('should result in the object becoming fetchable', function() {
        waitsFor(function() {
          return person.get('isFetchable');
        }, 'person to become fetchable', 1000);
      });

      it('should not tick the ember resource clock', function() {
        waitsFor(function() {
          return person.get('isExpired') && person.get('isFetchable');
        }, 'person never expired', 1000);

        runs(function() {
          expect(tickSpy).not.toHaveBeenCalled();
        });
      });
    });

  });

});
