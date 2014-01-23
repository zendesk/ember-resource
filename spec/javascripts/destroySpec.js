describe('Destroying resources', function() {
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
      expect(Model.identityMap.get(1)).to.equal(model);
      model.destroy();
    });

    it('should remove the object from the identity map', function() {
      expect(Model.identityMap.get(1)).to.be.undefined;
    });
  });

  describe('#destroy without an identityMap on the Model', function() {

    beforeEach(function() {
      model = Model.create();
      model.set('id', 1);
    });

    it('should not throw an exception', function() {
      expect(model.destroy.bind(model)).to.not.throw(Error);
    });
  });

  describe('destroyResource', function() {
    var resource;

    describe('instance destruction', function() {
      beforeEach(function() {
        server.respondWith('DELETE', '/people/1', [200, {}, '[["foo", "bar"]]']);
        resource = Model.create({ id: 1, name: 'f0o' });
        resource.destroyResource();
        server.respond();
      });

      it('should defer destroying the Em.Resource instance till the next run loop', function(done) {
        expect(resource.get('isDestroyed')).to.not.be.ok;

        // The destroy happens in the "next" run loop.
        Em.run.next(function() {

          // In the loop *after* that one, we check the resource state.
          Em.run.next(function() {
            expect(resource.get('isDestroyed')).to.be.ok;
            done();
          });
        });
      });
    });

    describe('handling errors', function() {
      beforeEach(function() {
        server.respondWith('DELETE', '/people/1', [422, {}, '[["foo", "bar"]]']);
      });

      it('should pass a reference to the resource to the error handling function', function() {
        var spy = sinon.spy();

        Ember.Resource.errorHandler = function(a, b, c, fourthArgument) {
          spy(fourthArgument.resource, fourthArgument.operation);
        };

        resource = Model.create({ id: 1, name: 'f0o' });
        resource.destroyResource();
        server.respond();

        expect(spy.calledWith(resource, "destroy")).to.be.ok;
      });
    });
  });
});
