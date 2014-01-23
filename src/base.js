(function() {

  window.Ember = window.Ember || window.SC;

  window.Ember.Resource = window.Ember.Object.extend({
    resourcePropertyWillChange: window.Ember.K,
    resourcePropertyDidChange: window.Ember.K
  });

  window.Ember.Resource.getPath = (function() {
    var o = { object: { path: 'value' } },
        getSupportsPath = Ember.get(o, 'object.path') === 'value';
    //                       Ember 1.0 : Ember 0.9
    return getSupportsPath ? Ember.get : Ember.getPath;
  }());

  window.Ember.Resource.sendEvent = (function() {
    if (Ember.sendEvent.length === 2) {
      // If Ember 0.9, make an Ember 1.0-style function out of the
      // Ember 0.9 one:
      return function sendEvent(obj, eventName, params, actions) {
        Ember.warn("Ember.Resources.sendEvent can't do anything with actions on Ember 0.9", !actions);
        params = params || [];
        params.unshift(eventName);
        params.unshift(obj);
        return Ember.sendEvent.apply(Ember, params);
      };
    }

    return function sendEvent(obj, eventName, params, actions) {
      return Ember.sendEvent(obj, eventName, params, actions);
    };
  }());

}());
