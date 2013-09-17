(function(exports) {

  // Gives custom error handlers access to the resource object.
  // 1. `this` will refer to the Ember.Resource object.
  // 2. `resource` will be passed as the last argument
  //
  //     function errorHandler() {
  //       this; // the Ember.Resource
  //     }
  //
  //     function errorHandler(jqXHR, textStatus, errorThrown, resource) {
  //       resource; // another way to reference the resource object
  //     }
  //
  var errorHandlerWithContext = function(errorHandler, context) {
    return function() {
      var args = Array.prototype.slice.call(arguments, 0);
      args.push(context);
      errorHandler.apply(context, args);
    };
  };

  exports.Ember.Resource.ajax = function(options) {
    options.dataType = options.dataType || 'json';
    options.type     = options.type     || 'GET';

    if (options.error) {
      options.error = errorHandlerWithContext(options.error, options);
    } else if (exports.Ember.Resource.errorHandler) {
      options.error = errorHandlerWithContext(window.Ember.Resource.errorHandler, options);
    }

    return $.ajax(options);
  };


  var slice = Array.prototype.slice;

  exports.Em.Resource.fetch = function(resource) {
    return Em.Resource.ajax.apply(Em.Resource, slice.call(arguments, 1));
  };

}(this));
