(function(exports) {

  // CRUFT: when we move to ES6 modules, we can export this function
  // directly instead of as Ember.Resource.__find.
  exports.Ember.Resource.__find = function find(id) {
    Ember.assert(this + '.find requires an ID', id != null);
    initializeIdentityMap(this);
    return findByConstructedInstance(this, id) ||
           findByOutstandingRequest(this, id) ||
           findByNewRequest(this, id);
  };

  function initializeIdentityMap(klass) {
    // CRUFT: this is also in Ember.Resource.create.
    if (klass.useIdentityMap && !klass.identityMap) {
      klass.identityMap = new Ember.Resource.IdentityMap(klass.identityMapLimit);
    }
  }

  function findByConstructedInstance(klass, id) {
    var instance = klass.identityMap && klass.identityMap.get(id);
    if (instance) { return $.when(instance); }
  }

  function findByOutstandingRequest(klass, id) {
    var deferred = klass.identityMap && klass.identityMap.get('find:' + id);
    if (deferred) { return deferred.promise(); }
  }

  function findByNewRequest(klass, id) {
    var url = klass.resourceURL({ id: id });
    // CRUFT: Ember.Resource.ajax returns a promise that
    // has a "sticky" resolution context. That is, if you
    // chain a .then onto it, it will invoke the .then
    // at the right time, but future promises won't receive
    // the return value of that .then. If we change to
    // RSVP, we can just return .ajax(...).then(...);
    var deferred = $.Deferred(),
        cleanUpOustandingRequest = Em.K,
        onFail = deferred.reject.bind(deferred);

    function onSuccess(json) {
      deferred.resolve(klass.create({}, json));
    }

    if (klass.identityMap) {
      var key = 'find:' + id;
      klass.identityMap.put(key, deferred);
      cleanUpOustandingRequest = klass.identityMap.remove.bind(klass.identityMap, key);
    }

    Ember.Resource.ajax({ url: url })
      .then(onSuccess, onFail)
      .then(cleanUpOustandingRequest, cleanUpOustandingRequest);

    return deferred.promise();
  }

}(this));
