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

  var slice = Array.prototype.slice;

  function failedPromise() {
    var dfd = new $.Deferred();
    dfd.reject();
    return dfd.promise();
  }

  exports.Ember.Resource.shouldResendRequest = function() {
    return failedPromise();
  };

  exports.Ember.Resource.ajax = function(options) {
    options.dataType = options.dataType || 'json';
    options.type     = options.type     || 'GET';

    if (options.error) {
      options.error = errorHandlerWithContext(options.error, options);
    } else if (exports.Ember.Resource.errorHandler) {
      options.error = errorHandlerWithContext(window.Ember.Resource.errorHandler, options);
    }

    var dfd = $.Deferred();
    doRequest(dfd, options);

    return dfd.promise();
  };

  function doRequest(deferred, options, retriedAlready) {
    $.ajax(options).done(function() {
      requestSucceeded(deferred, options, slice.apply(arguments));
    }).fail(function() {
      if (retriedAlready) {
        requestFailed(deferred, options, slice.apply(arguments));
      } else {
        retryRequest(deferred, options);
      }
    });

    return dfd.promise();
  }

  function retryRequest(deferred, options) {
    Ember.Resource.shouldResendRequest().done(function() {
      doRequest(deferred, options, true);
    }).fail(function() {
      requestFailed(deferred, options, slice.apply(arguments));
    });
  }

  function requestFailed(deferred, options, args) {
    Em.run(function() {
      deferred.rejectWith(options.context, args);
    });
  }

  function requestSucceeded(deferred, options, args) {
    Em.run(function() {
      deferred.resolveWith(options.context, args);
    });
  }

  exports.Em.Resource.fetch = function(resource) {
    return Em.Resource.ajax.apply(Em.Resource, slice.call(arguments, 1));
  };

}(this));
