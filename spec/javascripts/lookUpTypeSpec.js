describe('lookUpType', function() {

  describe('by default', function() {
    var Type,
        lookup = Ember.lookup || window;

    beforeEach(function() {
      Type = Ember.Object.extend();
      lookup.TestNamespace = { MyType: Type };
    });

    afterEach(function() {
      lookup.TestNamespace = undefined;
    });

    it('looks up types as globals', function() {
      expect( Ember.Resource.lookUpType('TestNamespace.MyType') ).toBe(Type);
    });
  });

  it('is used to look up type strings in schemas', function() {
    var Child = Ember.Resource.define({ schema: { id: Number }});
    spyOn(Ember.Resource, 'lookUpType').andReturn(Child);

    var child = Ember.Resource.define({
      schema: {
        child: { type: 'Child', nested: true }
      }
    }).create({}, { child: { id: 4 } }).get('child');

    expect( child instanceof Child ).toBeTruthy();
    expect(child.get('id')).toBe(4);
  });

});
