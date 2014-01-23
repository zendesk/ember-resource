/*globals Em*/

describe('ResourceCollection', function() {
  var Model;
  beforeEach(function() {
    Model = Em.Resource.define({
      schema: { name: String },
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

    expect(collection.resolveUrl()).to.equal('/url/from/collection');
  });

  describe('.parse', function() {
    it("uses the model's parse method", function() {
      Model.toString = function() { return 'Model'; };
      Model.parse = function(json) { return { name: this + ' ' + json.name }; };
      var collection = Em.ResourceCollection.create({
        type: Model,
        content: [ { name: 'instance' } ]
      });
      expect(collection.objectAt(0).get('name')).to.equal('Model instance');
    });
  });

  describe("when prepopulated", function() {

    beforeEach(function()  {
      this.collection = Em.ResourceCollection.create({
        type: Object,
        content: [ { name: 'hello' } ]
      });
    });

    it('knows it is prePopulated', function() {
      expect(this.collection.get('prePopulated')).to.be.ok;
    });

    it('returns a resolved deferred for #fetch', function() {
      var result = this.collection.fetch();
      expect(result).not.to.be.undefined;
      expect(result.state()).to.equal('resolved');
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
      expect(Em.ResourceCollection.identityMap.get(id)).to.be.ok;
    });

    describe('when destroyed', function() {
      beforeEach(function() {
        instance.destroy();
      });

      it('should remove it from the identity map', function() {
        var id = instance.get('id');
        expect(Em.ResourceCollection.identityMap.get(id)).to.not.be.ok;
      });
    });

  });

  describe("isFresh", function() {
    var collection, server, isFresh;
    beforeEach(function() {
      isFresh = sinon.stub();
      server = sinon.fakeServer.create();
      server.respondWith("GET", "/people",
                         [200, { "Content-Type": "application/json" },
                          JSON.stringify([{id: 1, name: "Foo"}]) ]);

      collection = Em.ResourceCollection.extend({
        type: Model,

        url: function() {
          return '/people';
        }.property().cacheable(),

        isFresh: isFresh

      }).create();

    });

    afterEach(function() {
      server.restore();
    });

    describe("when data is fresh", function() {
      beforeEach(function() {
        isFresh.returns(true);
      });

      it("should update data", function() {
        collection.fetch();
        server.respond();
        expect(collection.get("length")).to.equal(1);
      });
    });

    describe("when data is not fresh", function() {
      beforeEach(function() {
        isFresh.returns(false);
      });

      it("should update data", function() {
        collection.fetch();
        server.respond();
        expect(collection.get("length")).to.equal(0);
      });
    });

  });

});
