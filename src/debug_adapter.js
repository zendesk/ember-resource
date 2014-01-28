if (Ember.DataAdapter) {
  var get = Ember.get, capitalize = Ember.String.capitalize, underscore = Ember.String.underscore;

  var Resource = Ember.Resource;

  var DebugAdapter = Ember.DataAdapter.extend({
    getFilters: function() {
      return [
        { name: 'isInitializing', desc: 'Initializing' },
        { name: 'isFetchable', desc: 'Fetchable' },
        { name: 'isFetching', desc: 'Fetching' },
        { name: 'isFetched', desc: 'Fetched' },
        { name: 'isSaving', desc: 'Saving' },
        { name: 'isSavable', desc: 'Savable' },
        { name: 'isExpired', desc: 'Expired' }
      ];
    },

    detect: function(klass) {
      return klass !== Resource && Resource.detect(klass);
    },

    columnsForType: function(type) {
      var columns = [], count = 0, limit = 10;
      for (var key in type.schema) {
        if (count++ === limit) { break; }
        columns.push({name: key, desc: key});
      }
      return columns;
    },

    getRecords: function(type) {
      var records = [],
          cache = type.identityMap && type.identityMap.cache,
          current = cache && cache.head;

      while (current) {
        records.push(current.value);
        current = current.newer;
      }

      return records;
    },

    getRecordColumnValues: function(record) {
      return record.data;
    },

    getRecordKeywords: function(record) {
      var keywords = [];
      for (var key in record.data) {
        keywords.push(record.data[key]);
      }
      return keywords;
    },

    getRecordFilterValues: function(record) {
      return record.getProperties(this.getFilters().mapProperty('name'));
    },

    getRecordColor: function(record) {
      var color = 'black';
      if (record.get('isExpired')) { color = 'red'; }
      return color;
    },

    observeRecord: function(record, recordUpdated) {
    /*
      TODO: Here's the code from Ember Data, we need to figure out how we want to observe records ourselves.

      var releaseMethods = Ember.A(), self = this,
          keysToObserve = Ember.A(['id', 'isNew', 'isDirty']);

      record.eachAttribute(function(key) {
        keysToObserve.push(key);
      });

      keysToObserve.forEach(function(key) {
        var handler = function() {
          recordUpdated(self.wrapRecord(record));
        };
        Ember.addObserver(record, key, handler);
        releaseMethods.push(function() {
          Ember.removeObserver(record, key, handler);
        });
      });

      var release = function() {
        releaseMethods.forEach(function(fn) { fn(); } );
      };

      return release;
    */
      return function() {};
    }

  });

  Ember.onLoad('Ember.Application', function(Application) {
    Application.initializer({
      name: "dataAdapter",

      initialize: function(container, application) {
        application.register('dataAdapter:main', DebugAdapter);
      }
    });
  });
}