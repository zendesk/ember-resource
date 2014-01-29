(function(exports) {

  var Ember = exports.Ember, NullTransport = {
    subscribe: Ember.K,
    unsubscribe: Ember.K
  };

  Ember.Resource.PushTransport = NullTransport;

  var RemoteExpiry = Ember.Mixin.create({
    init: function() {
      var self = this;

      this._super();
      this._subscribedForExpiry = false;

      if (this.get('remoteExpiryKey')) {
        Ember.addListener(this, 'didFetch', this, function() {
          self.subscribeForExpiry();
        });
      }
    },

    subscribeForExpiry: function() {
      var remoteExpiryScope = this.get('remoteExpiryKey'),
          self = this;

      if (!remoteExpiryScope) {
        return;
      }

      if (this._subscribedForExpiry) {
        return;
      }

      Ember.Resource.PushTransport.subscribe(remoteExpiryScope, function(message) {
        self.updateExpiry(message);
      });

      this._subscribedForExpiry = true;
    },

    updateExpiry: function(message) {
      var updatedAt = message && message.updatedAt;
      if (!updatedAt) return;
      if (this.stale(updatedAt)) {
        this.set('expiryUpdatedAt', updatedAt);
        if (this.get('remoteExpiryAutoFetch')) {
          this.expireNow();
          this.fetch();
        } else {
          this.expire();
        }
      }
    },

    stale: function(updatedAt) {
      return !this.get('expiryUpdatedAt') || (+this.get('expiryUpdatedAt') < +updatedAt);
    }
  });

  Ember.Resource.RemoteExpiry = RemoteExpiry;

}(this));
