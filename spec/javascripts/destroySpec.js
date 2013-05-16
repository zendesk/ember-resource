describe('Destroying a resource instance', function() {
  var Model, model, server;

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

  describe('#destroy', function() {

    beforeEach(function() {
      model = Model.create({id: 1});
      expect(Model.identityMap.get(1)).toEqual(model);
      model.destroy();
    });

    it('should remove the object from the identity map', function() {
      expect(Model.identityMap.get(1)).toBe(undefined);
    });
  });

  describe('#destroy without an identityMap on the Model', function() {

    beforeEach(function() {
      model = Model.create();
      model.set('id', 1);
    });

    it('should not throw an exception', function() {
      expect(model.destroy.bind(model)).not.toThrow();
    });
  });

  describe('handling errors on resource destruction', function() {
    beforeEach(function() {
      server.respondWith('DELETE', '/people', [422, {}, '[["foo", "bar"]]']);
    });

    it('should pass a reference to the resource to the error handling function', function() {
      var spy = jasmine.createSpy();

      Ember.Resource.errorHandler = function(a, b, c, fourthArgument) {
        spy(fourthArgument.resource, fourthArgument.operation);
      };

      var resource = Model.create({ id: 1, name: 'f0o' });
      resource.destroyResource();
      server.respond();

      expect(spy).toHaveBeenCalledWith(resource, "destroy");
    });
  });
});
