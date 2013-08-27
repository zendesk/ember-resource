describe('lookUpType', function() {

  afterEach(function() {
    var unstub = Ember.Resource.lookUpType.restore;
    unstub && unstub();
  });

  describe('by default', function() {
    var Type,
        lookup = Ember.lookup || window;

    beforeEach(function() {
      Type = Ember.Object.extend();
      Type.toString = function() { return 'Type'; };
      lookup.TestNamespace = { MyType: Type };
    });

    afterEach(function() {
      lookup.TestNamespace = undefined;
    });

    it('looks up types as globals', function() {
      expect( Ember.Resource.lookUpType('TestNamespace.MyType') ).to.equal(Type);
    });
  });

  it('is used to look up type strings in schemas', function() {
    var Child = Ember.Resource.define({ schema: { id: Number }});
    sinon.stub(Ember.Resource, 'lookUpType').returns(Child);

    var child = Ember.Resource.define({
      schema: {
        child: { type: 'Child', nested: true }
      }
    }).create({}, { child: { id: 4 } }).get('child');

    expect( child instanceof Child ).to.be.ok;
    expect(child.get('id')).to.equal(4);
  });

});
