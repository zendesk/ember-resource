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
      this._expiryCallback = null;

      if (this.get('remoteExpiryKey')) {
        this._listenerHandlers = {
          didFetch: function() {
            this.subscribeForExpiry();
          }
        };
        Ember.addListener(this, 'didFetch', this, this._listenerHandlers.didFetch);
      }
    },

    subscribeForExpiry: function() {
      var remoteExpiryScope = this.get('remoteExpiryKey');

      if (!remoteExpiryScope) {
        return;
      }

      if (this._expiryCallback) {
        return;
      }

      this._expiryCallback = this.updateExpiry.bind(this);

      Ember.Resource.PushTransport.subscribe(remoteExpiryScope, this._expiryCallback);

    },

    willDestroy: function() {
      var remoteExpiryScope = this.get('remoteExpiryKey');

      if (this._listenerHandlers) {
        Ember.removeListener(this, 'didFetch', this, this._listenerHandlers.didFetch);
      }

      if (!remoteExpiryScope) {
        return;
      }

      if (!this._expiryCallback) {
        return;
      }

      Ember.Resource.PushTransport.unsubscribe(remoteExpiryScope, this._expiryCallback);
      this._super && this._super();
    },

    refetchOnExpiry: function() {
      this.expireNow();
      this.fetch();
    },

    updateExpiry: function(message) {
      var updatedAt = message && message.updatedAt;
      if (!updatedAt) return;
      if (this.stale(updatedAt)) {
        this.set('expiryUpdatedAt', updatedAt);
        if (this.get('remoteExpiryAutoFetch')) {
          this.refetchOnExpiry();
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
