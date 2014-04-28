# Ember-Resource

A simple library to connect your Ember.js application to JSON backends.

* Current stable version: `2.0`
* Download: \[[Development version][1]] \[[Minified version][2]]
* CDN: `//cdnjs.cloudflare.com/ajax/libs/ember-resource.js/2.0.0/ember-resource.min.js`

## Ember Resource 2.0

Notable `2.0` features:

* The Ember Resource Clock is not enabled by default -- this has been known to cause performance problems in large applications.
* Ember Resource `2.0` has `Ember 1.x` support.

## The Mandatory Todo Appplication

I've created a modified version of the todo application that the Ember.js Tutorial walks you through.
https://github.com/staugaard/sproutcore-resource-todos
This version persists the todo items on the server using a very small sinatra application and MongoDB.

## Examples

We will provide you with some documentation and stuff, but for now here's a little inspiration:

Think about running Wordpress.org. This is the schema you would use:

Assuming that /users/1 returns this JSON:

```javascript
{
  id:   1,
  name: "Mick Staugaard"
}
```

You would use this user model:

```javascript
MyApp.User = Ember.Resource.define({
  url: '/users',
  schema: {
    id:    Number,
    name:  String,
    blogs: {
      type:     Ember.ResourceCollection,
      itemType: 'MyApp.Blog',
      url:      '/users/%@/blogs'
    }
  }
});
```

Assuming that /blogs/1 returns this JSON:

```javascript
{
  id:      1,
  name:    "My awesome blog",
  owner_id: 1
}
```

You would use this blog model:

```javascript
MyApp.Blog = Ember.Resource.define({
  url: '/blogs'
  schema: {
    id:    Number,
    name:  String,
    owner: {
      type: MyApp.User
    },
    posts: {
      type:     Ember.ResourceCollection,
      itemType: 'MyApp.Post',
      url:      '/blogs/%@/posts'
    }
  }
});
```

Assuming that /posts/1 returns this JSON:

```javascript
{
  id:      1,
  title:   "Welcome to the blog",
  body:    "OMG I started a blog!",
  blog_id: 1
}
```

You would use this post model:

```javascript
MyApp.Post = Ember.Resource.define({
  url: '/posts',
  schema: {
    id:    Number,
    title: String,
    body:  String,
    blog: {
      type: MyApp.Blog
    },
    comments: {
      type:     Ember.ResourceCollection,
      itemType: 'MyApp.Comment',
      url:      '/posts/%@/comments'
    }
  }
});
```

Assuming that /comments/1 returns this JSON:

```javascript
{
  id:      1,
  body:    "I have something constructive to say.",
  post_id: 1,
  author: {
    id:   2,
    name: "Comment Author"
  }
}
```

You would use this comment model:

```javascript
MyApp.Comment = Ember.Resource.define({
  url: '/comments',
  schema: {
    id:   Number,
    body: String,
    post: {
      type: MyApp.Post
    },
    author: {
      type:   MyApp.User,
      nested: true
    }
  }
});
```

### Fetching, Saving, and Destroying

Fetch a resource with `fetch`:

```javascript
MyApp.Comment = Ember.Resource.define({...});
MyApp.Comment.create({ id: 13 }).fetch();
```

Calling `fetch` will issue an AJAX request to the resource's URL. It will
return a [promise](http://promises-aplus.github.io/promises-spec/). If the
AJAX request responds normally, the promise will resolve with the API response.
If it fails, the promised will fail with the AJAX error.

The success callbacks for `save` and `destroyResource` have a slightly
different signature. Those promises resolve with the data returned
from the server when saving or destroying the resource..

Note about `destroyResource`: when you destroy a resource, the Em.Resource
instance in memory is also `destroy`-ed, in that `.destroy()` is called on
it. This action is, however, deferred to the next run-loop after the AJAX
callbacks run. This is to allow any UI behavior that requires to access this
Em.Resource instance to work without any errors.


## Testing

Tests can be run from the command line, or in a browser:

### Browser

To run the Ember Resource test suite in a browser, just open `spec/runner.html`
in your favorite browser.

On Mac OS:

    open spec/runner.html

### Command line

To run the test suite from the command line run the `make test` command:

    make test

## Building a distribution

To build your very own copy of Ember Resource run the `make dist` task:

    make dist

The output will be put in the `dist/` folder.

## Copyright and license

Copyright 2013 Zendesk

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

[1]: https://cdnjs.cloudflare.com/ajax/libs/ember-resource.js/2.0.0/ember-resource.js
[2]: https://cdnjs.cloudflare.com/ajax/libs/ember-resource.js/2.0.0/ember-resource.min.js
[3]: http://semver.org/
[4]: https://github.com/zendesk/ember-resource/tree/2-0-stable
