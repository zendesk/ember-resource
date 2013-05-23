describe('deferred fetch', function() {
  var Person, people, server,
      PERSON_DATA = { "id": 1, "name": "Mick Staugaard" };

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
                       JSON.stringify(PERSON_DATA) ]);


  });

  afterEach(function() {
    server.restore();
  });

  describe("fetched() for resources", function() {
    it("should resolve with the resource when the fetch completes", function() {
      var handler = jasmine.createSpy('onFetch');

      var person = Person.create({id: 1});
      person.fetched().done(handler);

      person.fetch();
      server.respond();

      expect(handler).toHaveBeenCalledWith(PERSON_DATA, person);
    });
  });

  describe('fetch() for unfetched resources', function() {
    it('resolves with the resource when the server responds', function() {
      var handler = jasmine.createSpy('onFetch'),
          person = Person.create({id: 1});

      person.fetch().done(handler);
      server.respond();

      expect(handler).toHaveBeenCalledWith(PERSON_DATA, person);
    });
  });

  describe('fetch() for fetched, non-expired resources', function() {
    it('should resolve with the resource immediately', function() {
      var handler = jasmine.createSpy('onFetch'),
          person = Person.create({id: 1});

      person.fetch();
      server.respond();

      person.fetch().done(handler);
      expect(handler).toHaveBeenCalledWith(PERSON_DATA, person);
    });
  });

  describe('handling errors on fetch for resources', function() {
    beforeEach(function() {
      server.respondWith('GET', '/people/2', [422, {}, '[["foo", "bar"]]']);
    });

    it('should not prevent subsequent fetches from happening', function() {
      var resource = Person.create({ id: 2 });

      resource.fetch();
      server.respond();

      spyOn(resource, 'willFetch').andReturn($.when());
      resource.fetch();
      server.respond();
      expect(resource.willFetch).toHaveBeenCalled();
    });

    it('should pass a reference to the resource to the error handling function', function() {
      var spy = jasmine.createSpy();
      Ember.Resource.errorHandler = function(a, b, c, fourthArgument) {
        spy(fourthArgument.resource, fourthArgument.operation);
      };

      var resource = Person.create({ id: 2 });

      resource.fetch();
      server.respond();

      expect(spy).toHaveBeenCalledWith(resource, "read");
    });
  });

  describe('handling errors on fetch for collections', function() {
    beforeEach(function() {
      people = Ember.ResourceCollection.create({type: Person});
      server.respondWith('GET', '/people', [422, {}, '[["foo", "bar"]]']);
    });

    it('should pass a reference to the resource to the error handling function', function() {
      var spy = jasmine.createSpy();
      Ember.Resource.errorHandler = function(a, b, c, fourthArgument) {
        spy(fourthArgument.resource, fourthArgument.operation);
      };

      people.fetch();
      server.respond();

      expect(spy).toHaveBeenCalledWith(people, "read");
    });
  });

  describe("fetched() for resource collections", function() {
    beforeEach(function() {
      server.respondWith("GET", "/people",
                         [200, { "Content-Type": "application/json" },
                         JSON.stringify([ PERSON_DATA ]) ]);
      people = Ember.ResourceCollection.create({type: Person});

    });

    afterEach(function() {
      window.stopHere = false;
    });

    it("should resolve with the collection when the fetch completes", function() {

      var handler = jasmine.createSpy('onFetch');

      runs(function() {
        people.expire();

        people.fetched().done(handler);

        people.fetch();
        server.respond();
      });

      waits(1000);

      runs(function() {
        expect(handler).toHaveBeenCalledWith([PERSON_DATA], people);
      });
    });
  });

});
