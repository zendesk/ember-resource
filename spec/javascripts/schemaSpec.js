describe('schema definition', function() {
  var getPath = Ember.Resource.getPath;

  describe('of attributes', function() {
    var Model;

    beforeEach(function() {
      Model = Ember.Resource.define({
        schema: {
          id:       {type: Number, path: 'somewhere.deep.id'},
          size:     {type: Number},
          age:      Number,
          name:     String,
          birthday: Date,
          single:   Boolean
        }
      });
    });

    it('should use the specified path if given', function() {
      expect(Model.schema.id.path).to.equal('somewhere.deep.id');
    });

    it('should use the attribute name as path if not specified', function() {
      expect(Model.schema.size.path).to.equal('size');
    });

    it('should support Number', function() {
      expect(Model.schema.age.get('type')).to.equal(Number);
      expect(Model.schema.age.path).to.equal('age');
    });

    it('should support String', function() {
      expect(Model.schema.name.get('type')).to.equal(String);
      expect(Model.schema.name.path).to.equal('name');
    });

    it('should support Date', function() {
      expect(Model.schema.birthday.get('type')).to.equal(Date);
      expect(Model.schema.birthday.path).to.equal('birthday');
    });

    it('should support Boolean', function() {
      expect(Model.schema.single.get('type')).to.equal(Boolean);
      expect(Model.schema.single.path).to.equal('single');
    });
  });

  describe('of has-one associations', function() {
    var Model, Person, Address;

    beforeEach(function() {
      Address = Ember.Resource.define({
        schema: {
          street: String,
          zip:    Number
        }
      });

      Model = Ember.Resource.define({
        schema: {
          home_address:  {type: Address},
          work_address:  {type: Address, path: 'work_addr_id'},
          work_addr_id:  String,
          other_address: {type: Address, nested: true}
        }
      });
    });

    it('should use the specified path when given', function() {
      expect(Model.schema.work_address.get('path')).to.equal('work_addr_id');
    });

    it('should guess a path from the name when not given', function() {
      expect(Model.schema.home_address.get('path')).to.equal('home_address_id');
    });

    it('should define a Number attribute at the path if not present', function() {
      expect(Model.schema.home_address_id).to.not.equal(undefined);
      expect(Model.schema.home_address_id.get('type')).to.equal(Number);
    });

    it('should not override the attribute at the path if present', function() {
      expect(Model.schema.work_addr_id).to.not.equal(undefined);
      expect(Model.schema.work_addr_id.get('type')).to.equal(String);
    });

    it('should create an *_id attribute for nested associations', function() {
      expect(Model.schema.other_address).to.not.equal(undefined);
      expect(Model.schema.other_address_id).to.not.equal(undefined);
      expect(Model.schema.other_address_id instanceof Ember.Resource.HasOneNestedIdSchemaItem).to.equal(true);
      expect(Model.schema.other_address_id.get('association')).to.equal(Model.schema.other_address);
      expect(Model.schema.other_address_id.get('path')).to.equal('other_address.id');
    });
  });

  it('should create Number properties', function() {
    var Model = Ember.Resource.define({
      schema: {
        id:   Number,
        size: Number
      }
    });
    var data = {id: 1, size: '5'};
    var instance = Model.create({}, data);
    data = instance.get('data');

    expect(instance.get('id')).to.equal(1);
    expect(instance.get('size')).to.equal(5);

    instance.set('id', '2');
    expect(getPath(instance, 'data.id')).to.equal(2);

    instance.set('size', 3);
    expect(getPath(instance, 'data.size')).to.equal(3);

    instance.set('size', 'foo');
    expect(instance.get('size')).to.be.undefined;
    expect(getPath(instance, 'data.size')).to.be.undefined;

    instance.set('size', NaN);
    expect(instance.get('size')).to.be.undefined;
    expect(getPath(instance, 'data.size')).to.be.undefined;
  });

  it('should create String properties', function() {
    var Model = Ember.Resource.define({
      schema: {
        id:   String,
        size: String
      }
    });
    var data = {id: 1, size: 'large'};
    var instance = Model.create({}, data);
    data = instance.get('data');

    expect(instance.get('id')).to.equal('1');
    expect(instance.get('size')).to.equal('large');

    instance.set('id', 2);
    expect(getPath(instance, 'data.id')).to.equal('2');

    instance.set('size', 'small');
    expect(getPath(instance, 'data.size')).to.equal('small');
  });

  it('should create Date properties', function() {
    var date = new Date();
    var dateString = date.toJSON();

    var Model = Ember.Resource.define({
      schema: {
        createdAt: Date,
        updatedAt: Date
      }
    });
    var data = {createdAt: dateString, updatedAt: date};
    var instance = Model.create({}, data);
    data = instance.get('data');

    expect(+instance.get('createdAt')).to.equal(+date);
    expect(+instance.get('updatedAt')).to.equal(+date);

    date = new Date();
    dateString = date.toJSON();

    instance.set('createdAt', date);
    expect(getPath(instance, 'data.createdAt')).to.equal(dateString, "convert a Date instance to a string");

    instance.set('updatedAt', dateString);
    expect(getPath(instance, 'data.updatedAt')).to.equal(dateString, 'convert a string ("' + dateString + '") to a string');
  });

  it('should create Boolean properties', function() {
    var Model = Ember.Resource.define({
      schema: {
        'public': Boolean,
        active:   Boolean,
        good:     Boolean,
        bad:      Boolean
      }
    });
    var data = {'public': true, active: false, good: 'true', bad: 'false'};
    var instance = Model.create({}, data);
    data = instance.get('data');

    expect(instance.get('public')).to.equal(true);
    expect(instance.get('active')).to.equal(false);
    expect(instance.get('good')).to.equal(true);
    expect(instance.get('bad')).to.equal(false);

    instance.set('public', 'true');
    expect(getPath(instance, 'data.public')).to.equal(true, "convert 'true' to true");

    instance.set('public', 'false');
    expect(getPath(instance, 'data.public')).to.equal(false, "convert 'false' to false");

    instance.set('public', true);
    expect(getPath(instance, 'data.public')).to.equal(true, "convert true to true");

    instance.set('public', false);
    expect(getPath(instance, 'data.public')).to.equal(false, "convert false to false");
  });
});
