/*globals Ember, LRUCache*/

(function () {
  Ember.Resource.IdentityMap = function (limit) {
    this.cache = new LRUCache(limit || Ember.Resource.IdentityMap.DEFAULT_IDENTITY_MAP_LIMIT);
  };

  Ember.Resource.IdentityMap.prototype = {
    get: function () {
      return LRUCache.prototype.get.apply(this.cache, arguments);
    },

    put: function () {
      return LRUCache.prototype.put.apply(this.cache, arguments);
    },

    remove: function () {
      return LRUCache.prototype.remove.apply(this.cache, arguments);
    },

    clear: function () {
      return LRUCache.prototype.removeAll.apply(this.cache, arguments);
    },

    size: function () {
      return this.cache.size;
    },

    limit: function () {
      return this.cache.limit;
    }

  };

  Ember.Resource.IdentityMap.DEFAULT_IDENTITY_MAP_LIMIT = 500;

}());
