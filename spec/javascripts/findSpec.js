describe('Model.find', function() {
  var Dish, server;

  beforeEach(function() {
    Dish = Ember.Resource.define({
      url: '/dishes',
      schema: {
        id:       Number,
        name:     String
      }
    });

    server = sinon.fakeServer.create();
  });

  afterEach(function() {
    server.restore();
  });

  describe('for a resource that exists', function() {
    beforeEach(function() {
      var json = { id: 48, name: 'sashimi platter' };

      server.respondWith("GET", "/dishes/48",
                         [200, { "Content-Type": "application/json" },
                          JSON.stringify(json) ]);
    });

    it('returns a promise that resolves with the resource instance', function() {
      var callback = sinon.spy();
      Dish.find(48).then(callback);
      server.respond();
      expect(callback.called).to.be.ok;

      var dish = callback.args[0][0];
      expect(dish instanceof Dish).to.be.ok;
      expect(dish.get('id')).to.equal(48);
      expect(dish.get('name')).to.equal('sashimi platter');
    });

    it("caches outstanding requests", function() {
      Dish.find(48);
      Dish.find(48);
      expect(server.requests.length).to.equal(1);
    });

    it("uses the class's identity map if present", function() {
      var dish1, dish2;
      Dish.find(48).then(function(dish) { dish1 = dish; });
      server.respond();
      Dish.find(48).then(function(dish) { dish2 = dish; });
      expect(server.requests.length).to.equal(1);
      expect(dish1).to.equal(dish2);
    });
  });

  describe('for a resource that cannot be found', function() {
    beforeEach(function() {
      server.respondWith("GET", "/dishes/999",
                         [404, { "Content-Type": "application/json" }, '""']);
    });

    it('returns a promise that rejects with the jqXHR', function() {
      var onSuccess = sinon.spy(), onFail = sinon.spy();
      Dish.find(999).then(onSuccess, onFail);
      server.respond();
      expect(onFail.called).to.be.ok;
      var jqXHR = onFail.args[0][0];
      expect(jqXHR.getResponseHeader('Content-Type')).to.equal('application/json');
    });
  });

});
