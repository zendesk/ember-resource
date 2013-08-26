/*globals Em*/

describe('ResourceCollection', function() {
  var Model;
  beforeEach(function() {
    Model = Em.Resource.define({
      url: '/url/from/resource'
    });
  });

  it("reads from its url property if present", function() {

    var collection = Em.ResourceCollection.extend({
      type: Model,

      url: function() {
        return '/url/from/collection';
      }.property().cacheable()
    }).create();

    expect(collection.resolveUrl()).toEqual('/url/from/collection');
  });

  describe("when prepopulated", function() {

    beforeEach(function()  {
      this.collection = Em.ResourceCollection.create({
        type: Object,
        content: [ { name: 'hello' } ]
      });
    });

    it('knows it is prePopulated', function() {
      expect(this.collection.get('prePopulated')).toBeTruthy();
    });

    it('returns a resolved deferred for #fetch', function() {
      var result = this.collection.fetch();
      expect(result).not.toBeUndefined();
      expect(result.isResolved()).toBeTruthy();
    });

  });

  describe('Given a ResourceCollection instance', function() {
    var instance;
    beforeEach(function() {
      instance = Em.ResourceCollection.create({
        type: Model,
        url: '/url/from/collection'
      });
    });

    it('should be present in the identity map', function() {
      var id = instance.get('id');
      expect(Em.ResourceCollection.identityMap.get(id)).toBeTruthy();
    });

    describe('when destroyed', function() {
      beforeEach(function() {
        instance.destroy();
      });

      it('should remove it from the identity map', function() {
        var id = instance.get('id');
        expect(Em.ResourceCollection.identityMap.get(id)).toBeFalsy();
      });
    });

  });
});
