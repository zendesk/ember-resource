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
      var handler = sinon.spy();

      var person = Person.create({id: 1});
      person.fetched().done(handler);

      person.fetch();
      server.respond();

      // expect(handler.callCount).to.equal(1);
      // expect(handler.getCall(0).args[0]).to.deep.equal(PERSON_DATA);
      // expect(handler.getCall(0).args[1]).to.be(person);
      expect(handler.calledWith(PERSON_DATA, person)).to.be.ok;
    });
  });

  describe('fetch() for unfetched resources', function() {
    it('resolves with the resource when the server responds', function() {
      var handler = sinon.spy(),
          person = Person.create({id: 1});

      person.fetch().done(handler);
      server.respond();

      expect(handler.calledWith(PERSON_DATA, person)).to.be.ok;
    });
  });

  describe('fetch() for fetched, non-expired resources', function() {
    it('should resolve with the resource immediately', function() {
      var handler = sinon.spy(),
          person = Person.create({id: 1});

      person.fetch();
      server.respond();

      person.fetch().done(handler);
      expect(handler.calledWith(PERSON_DATA, person)).to.be.ok;
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

      sinon.stub(resource, 'willFetch').returns($.when());
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

  describe('handling errors on fetch for collections', function() {
    beforeEach(function() {
      people = Ember.ResourceCollection.create({type: Person});
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
