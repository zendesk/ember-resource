## 2.1.1 -- 2015-23-11
* Add Support for `abortCallback` Option in Em.Resource.ajax (#113)

## 2.1.0 -- 2015-15-10
* Adds a handler for LRU evictions (#109)
* Ember.Resource.save() should always return a promise (#108)
* Fixed Ember 1.12 deprecation warnings (#105)

## 2.1.0 -- 2015-05-08

* Adds a hasBeenFetched property to resources and collections
* ResourceCollection supports primitive JS types for items
* Removed `cacheable` on schema generated properties

## 2.0.1 -- 2014-07-28

* `Ember.Resource#fetch` always returns a Promise, even if `resourceURL()` returns `undefined`

## 2.0 -- 2014-04-02

* Disable the Ember Resource Clock by default
* Add Ember `1.x` support

## 1.0 -- 2013-02-26

* Initial release
