describe('findAndExpire', function() {

  var Class = Em.Resource.define({
    schema: {
      id: Number
    }
  });

  it('finds and expires instances by id', function() {
    var instance1 = Class.create({id: 1}); 
    var instance2 = Class.create({id: 2}); 

    expect(instance1.get('isExpired')).to.equal(false);
    expect(instance2.get('isExpired')).to.equal(false);

    Class.findAndExpire([1, 2, 3, 4]);

    expect(instance1.get('isExpired')).to.equal(true);
    expect(instance2.get('isExpired')).to.equal(true);
    expect(Class.identityMap.cache.keys().join()).to.equal("1,2");
  });

  it('finds and expires an instance by id', function() {
    var instance10 = Class.create({id: 10}); 

    expect(instance10.get('isExpired')).to.equal(false);

    Class.findAndExpire(10);

    expect(instance10.get('isExpired')).to.equal(true);    
  });

});
