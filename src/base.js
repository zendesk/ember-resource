(function () {

  window.Ember = window.Ember || window.SC;

  window.Ember.Resource = window.Ember.Object.extend({
    resourcePropertyWillChange: window.Ember.K,
    resourcePropertyDidChange: window.Ember.K
  });

  window.Ember.Resource.SUPPORT_AUTOFETCH = true;
}());
