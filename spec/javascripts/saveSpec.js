describe('Saving a resource instance', function() {
  var getPath = Ember.Resource.getPath,
      Model, model, server;

  beforeEach(function() {
    Model = Ember.Resource.define({
      schema: {
        id:       Number,
        name:     String,
        subject:  String
      },
      url: '/people'
    });

    server = sinon.fakeServer.create();
  });

  afterEach(function() {
    server.restore();
    Ember.Resource.errorHandler = null;
  });

  describe('handling errors on save', function() {
    beforeEach(function() {
      server.respondWith('POST', '/people', [422, {}, '[["foo", "bar"]]']);
    });

    it('should pass a reference to the resource to the error handling function', function() {
      var spy = jasmine.createSpy();
      Ember.Resource.errorHandler = function(a, b, c, fourthArgument) {
        spy(fourthArgument.resource, fourthArgument.operation);
      };

      var resource = Model.create({ name: 'foo' });
      resource.save();
      server.respond();

      expect(spy).toHaveBeenCalledWith(resource, "create");
    });
  });

  describe('handling errors on create', function() {
    beforeEach(function() {
      server.respondWith('PUT', '/people/1', [422, {}, '[["foo", "bar"]]']);
    });

    it('should pass a reference to the resource to the error handling function', function() {
      var spy = jasmine.createSpy();
      Ember.Resource.errorHandler = function(a, b, c, fourthArgument) {
        spy(fourthArgument.resource, fourthArgument.operation);
      };

      var resource = Model.create({ name: 'foo' });
      resource.set('isNew', false);
      resource.set('id', 1);

      resource.save();
      server.respond();

      expect(spy).toHaveBeenCalledWith(resource, "update");
    });
  });

  describe('resourceState', function() {
    describe('saving', function() {
      var resource;

      beforeEach(function() {
        server.respondWith('POST', '/people', [201, {}, '']);
        resource = Model.create({ name: 'foo' });
        expect(resource.get('resourceState')).not.toBe(Ember.Resource.Lifecycle.SAVING);
      });

      it('should change to the saving state while saving', function() {
        expect(resource.save()).toBeTruthy();
        expect(resource.get('resourceState')).toBe(Ember.Resource.Lifecycle.SAVING);
      });

      it('should indicate that it is saving', function() {
        expect(resource.get('isSaving')).toBe(false);
        expect(resource.save()).toBeTruthy();
        expect(resource.get('isSaving')).toBe(true);
      });

      it('should change to previous state after save completes', function() {
        var previousState = resource.get('resourceState');
        expect(resource.save()).toBeTruthy();
        expect(resource.get('resourceState')).not.toBe(previousState);
        server.respond();
        expect(resource.get('resourceState')).toBe(previousState);
      });

      it('should not allow concurrent saves', function() {
        expect(resource.save()).toBeTruthy();
        expect(resource.save()).toBe(false);
        server.respond();
        expect(resource.save()).toBeTruthy();
      });
    });

  });

  describe('updating from response', function() {
    var resource;

    describe('with default Location header parsing', function() {
      beforeEach(function() {
        server.respondWith('POST', '/people', [201, {'Location': 'http://example.com/people/25.json'}, '']);
        resource = Model.create({ name: 'foo' });
      });

      it('should update with the id from the Location header', function() {
        resource.save();
        server.respond();
        expect(resource.get('id')).toBe(25);
      });
    });

    describe('with a custom Location header parser', function() {
      beforeEach(function() {
        server.respondWith('POST', '/people', [201, {'Location': 'http://example.com/people/25.json'}, '']);
        Model.reopenClass({
          idFromURL: function(url) {
            return 100;
          }
        });

        resource = Model.create({ name: 'foo' });
      });

      it('should update with the id from the custom parser', function() {
        resource.save();
        server.respond();
        expect(resource.get('id')).toBe(100);
      });
    });

    describe('from a response body', function() {
      beforeEach(function() {
        server.respondWith('POST', '/people', [201, { "Content-Type": "application/json" }, '{ "id": 1, "subject": "the subject" }']);
        resource = Model.create({ name: 'foo' });
      });

      it('should update with the data given', function() {
        resource.save();
        server.respond();
        expect(resource.get('id')).toBe(1);
        expect(resource.get('subject')).toBe('the subject');
        expect(resource.get('name')).toBe('foo');
      });

      it('should not update with the data if you pass the update: false option', function() {
        resource.save({update: false});
        server.respond();
        expect(resource.get('id')).toBeUndefined();
        expect(resource.get('subject')).toBeUndefined();
        expect(resource.get('name')).toBe('foo');
      })

      describe('resource has one embedded association', function() {
        beforeEach(function() {
          var Address = Ember.Resource.define({
            schema: {
              street: String,
              zip:    Number,
              city:   String
            }
          });
          var Person = Ember.Resource.define({
            schema: {
              id:   Number,
              name: String,
              address: {type: Address, nested: true}
            },
            url: '/persons'
          });
          server.respondWith('POST', '/persons', [201, { "Content-Type": "application/json" }, '{ "id": 1, "address": { "street": "baz" } }']);
          resource = Person.create({ name: 'foo' }, { address: { street: 'bar' } });
        });

        it("should update with the data given", function() {
          resource.save();
          server.respond();
          expect(resource.get('id')).toBe(1);
          expect(getPath(resource, 'address.street')).toBe('baz');
        });
      });
    });

  });
});
