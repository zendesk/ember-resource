# Ember-Resource [![Build Status](https://secure.travis-ci.org/zendesk/ember-resource.png)](http://travis-ci.org/zendesk/ember-resource)

A simple library to connect your Ember.js application to JSON backends.

## Ember Resource 2.0

We're big fans of semantic versioning. Unfortunately Ember Resource has not
shipped a proper release yet :( Even so, we realize that Ember Resource is
being used out in the wild. So, what to do?

We're following in the footsteps of the Rails project and the Ember project and
creating a `1-0-stable` branch. Ember Resource in its current form will live
on in the `1-0-stable` branch.

Henceforth, the `master` branch of Ember Resource will undergo breaking API
changes, and thus, will eventually be named Ember Resource 2.0.

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
    title: Sting,
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

## Copyright and license

Copyright 2013 Zendesk

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
