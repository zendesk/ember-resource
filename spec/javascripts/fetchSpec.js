describe('deferred fetch', function() {
  var Person, people, server, person,
      PERSON_DATA = { "id": 1, "name": "Mick Staugaard" },
      PEOPLE_DATA = {"people" : [ PERSON_DATA ]};

  beforeEach(function() {
    Person = Ember.Resource.define({
      url: '/people',
      schema: {
        id:       Number,
        name:     String
      }
    });

    server = sinon.fakeServer.create();

  });

  afterEach(function() {
    server.restore();
  });

  describe("fetched() for resources", function() {
    beforeEach(function() {
      server.respondWith("GET", "/people/1",
                         [200, { "Content-Type": "application/json" },
                          JSON.stringify(PERSON_DATA) ]);
    });

    it("should resolve with the resource when the fetch completes", function() {
      var handler = sinon.spy();

      person = Person.create({id: 1});
      person.fetched().done(handler);

      person.fetch();
      server.respond();

      expect(handler.calledWith(PERSON_DATA, person)).to.be.ok;
    });
  });

  describe('fetch() for resources', function() {
    beforeEach(function() {
      person = Person.create({id: 1});
      server.respondWith("GET", "/people/1",
                         [200, { "Content-Type": "application/json" },
                          JSON.stringify(PERSON_DATA) ]);

    });

    describe('when unfetched', function() {
      it('resolves with the resource when the server responds', function() {
        var handler = sinon.spy();

        person.fetch().done(handler);
        server.respond();

        expect(handler.calledWith(PERSON_DATA, person)).to.be.ok;
      });
    });

    describe('when being fetched', function() {
      it('resolves with the resource when the server responds', function() {
        var handler = sinon.spy(),
            promise1, promise2;

        promise1 = person.fetch();
        expect(person.get('isFetching')).to.be.ok;

        promise2 = person.fetch();
        promise2.done(handler);

        expect(promise1).to.equal(promise2);

        expect(handler.callCount).to.equal(0);

        server.respond();
        expect(handler.calledWith(PERSON_DATA, person)).to.be.ok;

      });
    });

    describe('when fetched, but not expired', function() {
      it('should resolve with the resource immediately', function() {
        var handler = sinon.spy();

        person.fetch();
        server.respond();

        person.fetch().done(handler);
        expect(handler.calledWith(PERSON_DATA, person)).to.be.ok;
      });
    });

    describe('for resources with no resourceURL', function() {
      it("returns a resolved promise", function() {
        var handler = sinon.spy();
        person.resourceURL = function() { return undefined; };

        person.fetch().done(handler);
        expect(handler.callCount).to.equal(1);
        expect(handler.getCall(0).args[0].id).to.equal(person.get('id'));
        expect(handler.getCall(0).args[1]).to.equal(person);
      });
    });

    describe('when there are errors', function() {
      beforeEach(function() {
        server.respondWith('GET', '/people/2', [422, {}, '[["foo", "bar"]]']);
      });

      it('should not prevent subsequent fetches from happening', function() {
        var resource = Person.create({ id: 2 });

        resource.fetch();
        server.respond();

        sinon.stub(resource, 'willFetch');
        resource.fetch();
        server.respond();
        expect(resource.willFetch.callCount).to.equal(1);
      });

      it('should pass a reference to the resource to the error handling function', function() {
        var spy = sinon.spy();
        Ember.Resource.errorHandler = function(a, b, c, fourthArgument) {
          spy(fourthArgument.resource, fourthArgument.operation);
        };

        var resource = Person.create({ id: 2 });

        resource.fetch();
        server.respond();

        expect(spy.calledWith(resource, "read")).to.be.ok;
      });
    });

  });


  describe("fetch() for resource collections", function() {
    beforeEach(function() {
      people = Ember.ResourceCollection.create({
        type: Person,
        parse: function(json) { return json.people; }
      });
    });

    describe('when being fetched', function() {
      var handler, promise1, promise2;

      beforeEach(function() {
        handler = sinon.spy();
        server.respondWith('GET', '/people', [200, {}, JSON.stringify(PEOPLE_DATA)]);
        promise1 = people.fetch();
        promise2 = people.fetch();
        promise2.done(handler);
      });

      it('returns the same promise for successive fetches', function() {
        expect(promise1).to.equal(promise2);
      });

      it('resolves with the collection when the server responds', function() {
        expect(handler.callCount).to.equal(0);
        server.respond();
        expect(handler.calledWith(PEOPLE_DATA, people)).to.be.ok;
      });

    });

    describe('when there are errors', function() {
      beforeEach(function() {
        server.respondWith('GET', '/people', [422, {}, '[["foo", "bar"]]']);
      });

      it('should pass a reference to the resource to the error handling function', function() {
        var spy = sinon.spy();
        Ember.Resource.errorHandler = function(a, b, c, fourthArgument) {
          spy(fourthArgument.resource, fourthArgument.operation);
        };

        people.fetch();
        server.respond();

        expect(spy.calledWith(people, "read")).to.be.ok;
      });

      it("collection should still be fetchable", function() {
        people.fetch();
        server.respond();
        expect(people.get('isFetchable')).to.be.true;
      });
    });

  });

  describe("fetched() for resource collections", function() {
    beforeEach(function() {
      server.respondWith("GET", "/people",
                         [200, { "Content-Type": "application/json" },
                         JSON.stringify([ PERSON_DATA ]) ]);
      people = Ember.ResourceCollection.create({type: Person});

    });

    it("should resolve with the collection when the fetch completes", function(done) {
      var handler = sinon.spy();

      people.expire();

      people.fetched().done(handler);

      people.fetch();
      server.respond();

      setTimeout(function() {
        expect(handler.calledWith([PERSON_DATA], people)).to.be.ok;
        done();
      }, 1000);
    });
  });

});
