describe('toJSON', function() {
  var setPath = (function() {
    var o = { object: {} };
    Ember.set(o, 'object.path', 'value');
    var setSupportsPath = o.object.path === 'value';
    return setSupportsPath ? Ember.set : Ember.setPath;
  }());

  it('should use toJSON of each of the schema items', function() {
    var Book = Ember.Resource.define({
      schema: {
        id: Number,
        title: String
      }
    });

    var book = Book.create({id: 1, title: 'Rework'});

    sinon.stub(Book.schema.id,    'toJSON').returns(1);
    sinon.stub(Book.schema.title, 'toJSON').returns(undefined);

    var json = book.toJSON();

    expect(Book.schema.id.toJSON.calledWith(book)).to.be.ok;
    expect(Book.schema.title.toJSON.calledWith(book)).to.be.ok;

    expect(json).to.deep.equal({id: 1});
  });

  describe('nested objects', function() {
    var Address = Ember.Resource.define({
      schema: {
        city: String
      }
    });

    var Person = Ember.Resource.define({
      schema: {
        id:   Number,
        name: String,
        address: {
          type: Address,
          nested: true
        }
      }
    });

    var attributes = {
      name: 'John Smit',
      address: {
        city: 'London'
      }
    };

    it('should return updated values of nested objects', function() {
      var person  = Person.create(attributes),
          newCity = 'Liverpool',
          newName = 'Smit Johnson';

      setPath(person, 'address.city', newCity);
      Ember.set(person, 'name', newName);

      var json = person.toJSON();

      expect(json).to.deep.equal({
        name: newName,
        address: { city: newCity }
      });
    });
  });

  describe('remote has one associations', function() {
    var Address = Ember.Resource.define({
      schema: {
        id:   Number,
        city: String
      }
    });

    var Person = Ember.Resource.define({
      schema: {
        id:   Number,
        name: String,
        address: { type: Address }
      }
    });

    it('should return the id of the association at the path', function() {
      var address = Address.create({id: 1, city: 'San Francisco'});
      var person  = Person.create({id: 1, name: 'Mick Staugaard', address: address});

      var json = person.toJSON();
      expect(json.address).to.be.undefined;
      expect(json.address_id).to.equal(1);
    });

  });

  describe('remote has many associations', function() {
    var Book = Ember.Resource.define({
      schema: {
        id: Number,
        title: String
      }
    });

    var Library = Ember.Resource.define({
      schema: {
        name: String,

        books: {
          type: Ember.ResourceCollection,
          itemType: Book,
          url: '/libraries/%@/books'
        }
      }
    });

    it('should not be included', function() {
      var library = Library.create({name: 'The Robarts Library'});
      setPath(library, 'books.content', [{ id: 1, title: 'The Hobbit' }]);
      expect(library.toJSON()).to.deep.equal({ name: 'The Robarts Library' });
    });
  });

  describe('has many in array associations', function() {
    var Book = Ember.Resource.define({
      schema: {
        id: Number,
        title: String
      }
    });

    var Library = Ember.Resource.define({
      schema: {
        name: String,

        books: {
          type: Ember.ResourceCollection,
          itemType: Book
        }
      }
    });

    it('should include the ids of the items', function() {
      var library = Library.create({}, {
        name: 'The Robarts Library',
        books_ids: [1,2,3]
      });

      expect(library.toJSON()).to.deep.equal({
        name: 'The Robarts Library',
        books_ids: [1,2,3]
      });
    });
  });
});
