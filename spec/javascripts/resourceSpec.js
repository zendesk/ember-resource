/*globals Ember*/

describe('A Resource instance', function () {
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
  });

  describe("defining a resource", function() {
    describe("with a sideloads attribute", function() {
      var subject;
      beforeEach(function() {
        sinon.stub(Ember.Resource, 'ajax').returns($.when());
        subject = Ember.Resource.define({
          url: "/users",
          sideloads: ["abilities", "weapons"]
        });
      });

      afterEach(function() {
        Ember.Resource.ajax.restore();
      });

      it("should not include the sideloads in resourceURL", function() {
        var user = subject.create({id: 1});
        expect(user.resourceURL()).to.equal("/users/1");
      });

      it("should send the sideloads in AJAX fetches", function() {
        var user = subject.create({id: 1});
        user.fetch();
        expect(Ember.Resource.ajax.callCount).to.equal(1);
        expect(Ember.Resource.ajax.getCall(0).args[0]).to.deep.equal({
          url: "/users/1",
          resource: user,
          operation: 'read',
          data: {include: "abilities,weapons"}
        });
      });
    });
  });

  describe('with no ID', function() {
    beforeEach(function() {
      model = Model.create({});
    });

    it('does not fetch when setting an attribute', function() {
      sinon.spy(model, 'fetch');
      model.set('name', 'Patricia');
      expect(model.fetch.callCount).to.equal(0);
    });

    it('allows setting a property to undefined', function() {
      model.set('name', 'Carlos');
      expect(model.get('name')).to.equal('Carlos');
      model.set('name', undefined);
      expect(model.get('name')).to.be.undefined;
    });
  });

  it('allows setting of properties not in the schema during creation', function() {
    model = Model.create({
      undefinedProperty: 'foo'
    });

    expect(model.get('undefinedProperty')).to.equal('foo');
  });

  it('allows setting functions during creation', function() {
    model = Model.create({
      undefinedProperty: function() { return 'foo'; }
    });

    expect(Ember.typeOf(model.undefinedProperty)).to.equal('function');
    expect(model.undefinedProperty()).to.equal('foo');
  });

  it('allows setting observers during creation', function() {
    var observerDidFire = false;
    model = Model.create({
      myObserver: function() { observerDidFire = true; }.observes('foo')
    });
    observerDidFire = false;
    model.set('foo', 'new value');

    expect(observerDidFire).to.equal(true);
  });

  it('allows setting computed properties during creation', function() {
    model = Model.extend({
      undefinedProperty: function() { return this.get('foo') + '!'; }.property('foo')
    }).create();
    model.set('foo', 'foo');

    expect(model.get('undefinedProperty')).to.equal('foo!');
  });

  it('allows setting of properties not in the schema during creation, considering paths', function() {
    Model = Ember.Resource.define({
      schema: {
        id:       Number,
        name:     String,
        foo:      {type: String, path: 'data.foo'}
      },
      url: '/people'
    });

    model = Model.create({ id: 1, undefinedProperty: 'foo', entry_id: 1, foo: 'bar' });
  });

  describe('updating objects already in identity map', function() {
    beforeEach(function() {
      model = Model.create({id: 1, name: 'blah'});
    });

    it('should update objects in the identity map with new data', function() {
      expect(model.get('subject')).to.be.undefined;
      model = Model.create({id: 1, name: 'boo', subject: 'bar'});
      expect(model.get('name')).to.equal('boo');
      expect(model.get('subject')).to.equal('bar');
    });
  });

  describe('when setting a property value', function() {
    beforeEach(function() {
      model = Model.create({name: 'Aardvark'});
    });

    it('should execute callbacks with the property name and new value', function() {
      sinon.spy(model, 'resourcePropertyWillChange');
      sinon.spy(model, 'resourcePropertyDidChange');
      model.set('name', 'Zebra');
      expect(model.resourcePropertyWillChange.calledWith('name', 'Zebra')).to.be.ok;
      expect(model.resourcePropertyDidChange.calledWith('name', 'Zebra')).to.be.ok;
    });
  });

  describe('Given a model with no data', function() {
    beforeEach(function() {
      model = Model.create();
      model.set('data', undefined);
      expect(Ember.get(model, 'data')).to.be.undefined;
    });

    describe('updating that model with api data', function() {
      it('should not blow up', function() {
        model.updateWithApiData({ foo: 'bar' });
      });
    });
  });

  describe('Given a model that expires five minutes from now', function() {
    beforeEach(function() {
      var now = new Date(),
          fiveMinutesFromNow = new Date(+now + 5 * 60 * 1000);
      model = Model.create();
      Ember.run(model.set.bind(model, 'expireAt', fiveMinutesFromNow));
    });

    it('is not expired', function() {
      expect(model.get('isExpired')).to.not.be.ok;
    });

    describe('Calling expire now', function() {
      beforeEach(function() {
        Ember.run(model.expireNow.bind(model));
      });

      it('expires the model', function() {
        expect(model.get('isExpired')).to.be.ok;
      });
    });

    describe('Calling refresh', function() {
      beforeEach(function() {
        sinon.spy(model, 'fetch');
        sinon.spy(model, 'expireNow');
        model.refresh();
      });

      it('expires the model', function() {
        expect(model.expireNow.callCount).to.equal(1);
      });

      it('fetches the model', function() {
        expect(model.fetch.callCount).to.equal(1);
      });
    });
  });

  describe("extending schema", function() {
    beforeEach(function() {
      Model.extendSchema({
        description: String
      });
    });

    it("should change the schema", function() {
      model = Model.create({description: "Boo"});
      expect(model.toJSON().description).to.equal("Boo");
    });
  });
});
