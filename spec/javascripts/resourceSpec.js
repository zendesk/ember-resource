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
        subject = Ember.Resource.define({
          url: "/users",
          sideloads: ["abilities", "weapons"]
        });
      });

      it("should not include the sideloads in resourceURL", function() {
        var user = subject.create({id: 1});
        expect(user.resourceURL()).toEqual("/users/1");
      });

      it("should send the sideloads in AJAX fetches", function() {
        var user = subject.create({id: 1});
        spyOn(Ember.Resource, 'ajax').andReturn($.when());
        user.fetch();
        expect(Ember.Resource.ajax).toHaveBeenCalledWith({
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
      spyOn(model, 'fetch');
      model.set('name', 'Patricia');
      expect(model.fetch).not.toHaveBeenCalled();
    });

    it('allows setting a property to undefined', function() {
      model.set('name', 'Carlos');
      expect(model.get('name')).toEqual('Carlos');
      model.set('name', undefined);
      expect(model.get('name')).toBeUndefined();
    });
  });

  describe('with a negative ID', function() {
    beforeEach(function() {
      model = Model.create({id: -1});
    });

    it('should not have a URL', function() {
      expect(model.resourceURL()).toBeUndefined();
    });
  });

  it('allows setting of properties not in the schema during creation', function() {
    model = Model.create({
      undefinedProperty: 'foo'
    });

    expect(model.get('undefinedProperty')).toEqual('foo');
  });

  it('allows setting functions during creation', function() {
    model = Model.create({
      undefinedProperty: function() { return 'foo'; }
    });

    expect(Ember.typeOf(model.undefinedProperty)).toEqual('function');
    expect(model.undefinedProperty()).toEqual('foo');
  });

  it('allows setting observers during creation', function() {
    var observerDidFire = false;
    model = Model.create({
      myObserver: function() { observerDidFire = true; }.observes('foo')
    });
    observerDidFire = false;
    model.set('foo', 'new value');

    expect(observerDidFire).toBe(true);
  });

  it('allows setting computed properties during creation', function() {
    model = Model.create({
      undefinedProperty: function() { return this.get('foo') + '!'; }.property('foo')
    });
    model.set('foo', 'foo');

    expect(model.get('undefinedProperty')).toEqual('foo!');
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
      expect(model.get('subject')).toBeUndefined();
      model = Model.create({id: 1, name: 'boo', subject: 'bar'});
      expect(model.get('name')).toBe('boo');
      expect(model.get('subject')).toBe('bar');
    });
  });

  describe('when setting a property value', function() {
    beforeEach(function() {
      model = Model.create({name: 'Aardvark'});
    });

    it('should execute callbacks with the property name and new value', function() {
      spyOn(model, 'resourcePropertyWillChange');
      spyOn(model, 'resourcePropertyDidChange');
      model.set('name', 'Zebra');
      expect(model.resourcePropertyWillChange).toHaveBeenCalledWith('name', 'Zebra');
      expect(model.resourcePropertyDidChange).toHaveBeenCalledWith('name', 'Zebra');
    });
  });

  describe('Given a model with no data', function() {
    beforeEach(function() {
      model = Model.create();
      model.set('data', undefined);
      expect(Ember.get(model, 'data')).toBe(undefined);
    });

    describe('updating that model with api data', function() {
      it('should not blow up', function() {
        model.updateWithApiData({ foo: 'bar' });
      });
    });
  });

  describe('Given a model that expires five minutes from now', function() {
    var time;
    beforeEach(function() {
      time = new Date();
      time.setSeconds(time.getSeconds() + (60*5));
      model = Model.create();
      model.set('expireAt', time);
      expect(model.get('isExpired')).toBeFalsy();
    });

    describe('Calling expire now', function() {
      beforeEach(function() {
        model.expireNow();
      });

      it('expires the model', function() {
        expect(model.get('isExpired')).toBeTruthy();
      });
    });

    describe('Calling refresh', function() {
      beforeEach(function() {
        model = Model.create();
        spyOn(model, 'fetch');
        model.refresh();
      });

      it('expires the model', function() {
        expect(model.get('isExpired')).toBeTruthy();
      });

      it('fetches the model', function() {
        expect(model.fetch).toHaveBeenCalled();
      });
    });
  });

});
