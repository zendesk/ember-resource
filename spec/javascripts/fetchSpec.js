describe('deferred fetch', function() {
  var Person, people, server;

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

  describe("fetched() for resources", function() {
    it("should resolve when the fetch completes", function() {
      var handler = jasmine.createSpy();

      var person = Person.create({id: 1});
      person.fetched().done(function() {
        handler();
      });

      person.fetch();
      server.respond();

      expect(handler).toHaveBeenCalled();
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
      server.restore();
      server.respondWith("GET", "/people",
                         [200, { "Content-Type": "application/json" },
                         '[{ "id": 1, "name": "Mick Staugaard" }]']);
      people = Ember.ResourceCollection.create({type: Person});

    });

    afterEach(function() {
      window.stopHere = false;
    });

    it("should resolve when the fetch completes", function() {

      var handler = jasmine.createSpy();

      runs(function() {
        people.expire();

        people.fetched().done(function() {
          handler();
        });

        people.fetch();
        server.respond();
      });

      waits(1000);

      runs(function() {
        expect(handler).toHaveBeenCalled();
      });
    });
  });

});
