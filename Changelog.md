## 2.3.3 -- 2016-11-17

* Allow specifying specific fields to be sent over the network when saving a resource (#120)

## 2.3.2 -- 2016-03-05

* Add support for Ember 1.13+ (#117)

## 2.3.1 -- 2015-12-02
* Fix a bug where an Ember assertion is failed if an object is destroyed or marked for destruction after a call to fetch but before the fetch completes.

## 2.3.0 -- 2015-23-11
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
