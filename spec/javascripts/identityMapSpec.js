describe('identity map', function() {
  var Address = Em.Resource.define({
    identityMapLimit: 10
  });

  describe('that wants to skip the identity map', function() {
    var Model;
    beforeEach(function() {
      Model = Em.Resource.define({
        useIdentityMap: false
      });
    });

    it('should not have an identity map', function() {
      expect(Model.identityMap).toBeUndefined();
    });

    it('should not get an identity map when you create an instance', function() {
      Model.create({id: 1});
      expect(Model.identityMap).toBeUndefined();
    });

  });

  it('should default to a limit of DEFAULT_IDENTITY_MAP_LIMIT', function() {
    var Foo = Em.Resource.define();
    Foo.create({id: 1});
    expect(Foo.identityMap.limit()).toBe(Ember.Resource.IdentityMap.DEFAULT_IDENTITY_MAP_LIMIT);
  });

  it('should return the same object when requested multiple times', function() {
    var address1 = Address.create({id: 1});
    var address2 = Address.create({id: 1});
    expect(address1).toBe(address2);
  });

  it('should limit the number of objects retained', function() {
    var address;
    for(var i=1; i<=20; i++) {
      address = Address.create({id: i});
    }

    expect(Address.identityMap.size()).toBe(10);
  });

  it('should not clobber the resourceState of an already cached object', function() {
    var address = Address.create({id: 1});
    address.set('resourceState', 50);
    address = Address.create({id: 1});
    expect(address.get('resourceState')).toBe(50);
  });

  describe("for resource collections", function() {
    var Addresses = Em.ResourceCollection.extend();

    Addresses.reopenClass({
      identityMapLimit: 10
    });

    it('should default to a limit of 5x DEFAULT_IDENTITY_MAP_LIMIT', function() {
      var Foo = Em.ResourceCollection.extend();
      Foo.create({type: Address, url: '/foo'});
      expect(Foo.identityMap.limit()).toBe(Ember.Resource.IdentityMap.DEFAULT_IDENTITY_MAP_LIMIT * 5);
    });

    it('should return the same object when requested multiple times', function() {
      var addresses1 = Addresses.create({type: Address, url: '/address/'});
      var addresses2 = Addresses.create({type: Address, url: '/address/'});

      expect(addresses1).toBe(addresses2);
    });

    it('should limit the number of objects retained', function() {
      var address;
      for(var i=1; i<=20; i++) {
        address = Addresses.create({type: Address, url: '/address/' + i});
      }

      expect(Address.identityMap.size()).toBe(10);
    });


  });

  describe("Who wish to opt out of the identity map", function() {
    var Collection;

    beforeEach(function() {
      Collection = Em.ResourceCollection.extend().reopenClass({
        useIdentityMap: false
      });
    });

    it("should return different collections when requested multiple times", function() {
      var addresses1 = Collection.create({ type: Address, url: '/addresses' });
      var addresses2 = Collection.create({ type: Address, url: '/addresses' });

      expect(addresses1).not.toBe(addresses2);
    });
  });

});
