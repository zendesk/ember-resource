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

}());
