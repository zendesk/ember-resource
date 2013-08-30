describe('Inheritance', function() {
  var Person;

  var keys = function(object) {
    var keys = [];
    for (var key in object) {
      if (object.hasOwnProperty(key)) keys.push(key);
    }
    return keys.sort();
  };

  beforeEach(function() {
    Person = Ember.Resource.define({
      url: '/people',
      schema: {
        id:       Number,
        name:     String
      }
    });
  });

  it('should support many levels of inheritance', function() {
    expect(keys(Person.schema)).to.deep.equal(['id', 'name']);

    var Worker = Person.define({
      schema: {
        salary: Number
      }
    });

    expect(keys(Worker.schema)).to.deep.equal(['id', 'name', 'salary']);

    var LuckyBastard = Worker.define({
      schema: {
        stockOptions: Number
      }
    });

    expect(keys(LuckyBastard.schema)).to.deep.equal(['id', 'name', 'salary', 'stockOptions']);
  });

  it('should blow up when you try to redifine properties', function() {
    var defineBadSubclass = function() {
      return Person.define({
        schema: {
          name: String
        }
      });
    };
    expect(defineBadSubclass).to.throw("Schema item 'name' is already defined");
  });

  it('should inherit the resource url', function() {
    var personUrl = Person.url;

    expect(personUrl).to.not.equal(undefined);

    var Worker = Person.define({
      schema: {
        salary: Number
      }
    });

    expect(Worker.url).to.equal(personUrl);
  });

  it('should allow overriding the url', function() {
    var personUrl = Person.url;

    expect(personUrl).to.not.equal(undefined);
    expect(personUrl).to.not.equal('/workers');

    var Worker = Person.define({
      url: '/workers',
      schema: {
        salary: Number
      }
    });

    expect(Worker.url).to.equal('/workers');

  });

});
