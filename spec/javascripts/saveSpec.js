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
      var spy = sinon.spy();
      Ember.Resource.errorHandler = function(a, b, c, fourthArgument) {
        spy(fourthArgument.resource, fourthArgument.operation);
      };

      var resource = Model.create({ name: 'foo' });
      resource.save();
      server.respond();

      expect(spy.calledWith(resource, "create")).to.be.ok;
    });
  });

  describe('handling errors on create', function() {
    beforeEach(function() {
      server.respondWith('PUT', '/people/1', [422, {}, '[["foo", "bar"]]']);
    });

    it('should pass a reference to the resource to the error handling function', function() {
      var spy = sinon.spy();
      Ember.Resource.errorHandler = function(a, b, c, fourthArgument) {
        spy(fourthArgument.resource, fourthArgument.operation);
      };

      var resource = Model.create({ name: 'foo' });
      resource.set('isNew', false);
      resource.set('id', 1);

      resource.save();
      server.respond();

      expect(spy.calledWith(resource, "update")).to.be.ok;
    });
  });

  describe('resourceState', function() {
    describe('saving', function() {
      var resource;

      beforeEach(function() {
        server.respondWith('POST', '/people', [201, {}, '{}']);
        resource = Model.create({ name: 'foo' });
        expect(resource.get('resourceState')).not.to.equal(Ember.Resource.Lifecycle.SAVING);
      });

      it('should change to the saving state while saving', function() {
        expect(resource.save()).to.be.ok;
        expect(resource.get('resourceState')).to.equal(Ember.Resource.Lifecycle.SAVING);
      });

      it('should indicate that it is saving', function() {
        expect(resource.get('isSaving')).to.equal(false);
        expect(resource.save()).to.be.ok;
        expect(resource.get('isSaving')).to.equal(true);
      });

      it('should change to previous state after save completes', function() {
        var previousState = resource.get('resourceState');
        expect(resource.save()).to.be.ok;
        expect(resource.get('resourceState')).not.to.equal(previousState);
        server.respond();
        expect(resource.get('resourceState')).to.equal(previousState);
      });

      it('should not allow concurrent saves', function() {
        expect(resource.save().state()).to.equal('pending');
        expect(resource.save().state()).to.equal('rejected');
        server.respond();
        expect(resource.save().state()).to.equal('pending');
      });

      it("should not allow setting the value of isSaving", function() {
        expect(resource.get('isSaving')).to.equal(false);
        expect(function() { resource.set('isSaving', 'custom_value'); }).to.throw(Error);
      });
    });

  });

  describe('save callbacks:', function() {
    var resource, eventHandler;

    describe('when saving succeeds', function() {
      beforeEach(function() {
        resource = Model.create({ name: 'foo' });
        sinon.spy(resource, 'didSave');
        server.respondWith('POST', '/people', [201, {}, '{}']);
        resource.save();
        server.respond();
      });

      it('should call "didSave"', function() {
        expect(resource.didSave.called).to.be.ok;
      });
    });

    describe('when saving fails', function() {
      beforeEach(function() {
        resource = Model.create({ name: 'foo' });
        sinon.spy(resource, 'didSave');
        server.respondWith('POST', '/people', [500, {}, '{}']);
        resource.save();
        server.respond();
      });

      it('should call "didFail"', function() {
        expect(resource.didSave.called).to.not.be.ok;
      });
    });

    describe('when saving a new record', function() {
      beforeEach(function() {
        server.respondWith('POST', '/people', [201, {}, '{}']);
        resource = Model.create({ name: 'foo' });
        sinon.spy(resource, 'didSave');
        resource.save();
        server.respond();
      });

      it('should pass created: true to didSave', function() {
        expect(resource.didSave.calledWith({created: true, data: {}})).to.be.ok;
      });
    });

    describe('when saving an existing record', function() {
      beforeEach(function() {
        server.respondWith('PUT', '/people/1', [200, {}, '{}']);
        resource = Model.create({ id: 1, name: 'foo' });
        sinon.spy(resource, 'didSave');
        resource.save();
        server.respond();
      });

      it('should pass created: false to didSave', function() {
        expect(resource.didSave.calledWith({created: false, data: {}})).to.be.ok;
      });
    });

    describe('when saving a record', function() {
      var response = { people: { name: 'foo'}};

      beforeEach(function() {
        server.respondWith('PUT', '/people/1', [200, {}, JSON.stringify(response)]);
        resource = Model.create({ id: 1, name: 'foo' });
        sinon.spy(resource, 'didSave');
        resource.save();
        server.respond();
      });

      it('should pass returned data to didSave', function() {
        expect(resource.didSave.calledWith({created: false, data: response})).to.be.ok;
      });
    });

  });

  describe('updating from response', function() {
    var resource;

    describe('with default Location header parsing', function() {
      beforeEach(function() {
        server.respondWith('POST', '/people', [201, {'Location': 'http://example.com/people/25.json'}, '{}']);
        resource = Model.create({ name: 'foo' });
      });

      it('should update with the id from the Location header', function() {
        resource.save();
        server.respond();
        expect(resource.get('id')).to.equal(25);
      });
    });

    describe('with a custom Location header parser', function() {
      beforeEach(function() {
        server.respondWith('POST', '/people', [201, {'Location': 'http://example.com/people/25.json'}, '{}']);
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
        expect(resource.get('id')).to.equal(100);
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
        expect(resource.get('id')).to.equal(1);
        expect(resource.get('subject')).to.equal('the subject');
        expect(resource.get('name')).to.equal('foo');
      });

      it('should not update with the data if you pass the update: false option', function() {
        resource.save({update: false});
        server.respond();
        expect(resource.get('id')).to.be.undefined;
        expect(resource.get('subject')).to.be.undefined;
        expect(resource.get('name')).to.equal('foo');
      });

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
          expect(resource.get('id')).to.equal(1);
          expect(getPath(resource, 'address.street')).to.equal('baz');
        });
      });
    });

  });

  describe('payload for save requests', function() {
    var resource;
    beforeEach(function() {
      resource = Model.create({ name: 'foo', id: 12, subject: 'hello world!' });
    });

    it('saves requested fields when specified', function() {
      resource.save({fields: ['name', 'id']});
      expect(server.requests[0].requestBody).to.equal('{"name":"foo","id":12}');
    });

    it('saves all fields', function() {
      resource.save();
      expect(server.requests[0].requestBody).to.equal('{"id":12,"name":"foo","subject":"hello world!"}');
    });
  });
});
