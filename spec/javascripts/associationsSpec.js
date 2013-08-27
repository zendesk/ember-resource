describe('associations', function() {
  var getPath = Ember.Resource.getPath;

  var Address = Ember.Resource.define({
    schema: {
      id:     Number,
      street: String,
      zip:    Number,
      city:   String
    },

    parse: function(json) {
      json.city = json.city || json.city_name;
      delete json.city_name;
      return json;
    }
  });

  describe("has one remote", function() {
    var subject;

    beforeEach(function() {
      var Person = Ember.Resource.define({
        schema: {
          name: String,
          address: {type: Address}
        }
      });
      subject = Person.create({}, { "address_id": 1 });
      sinon.spy(subject, 'updateWithApiData');
      subject.get('address');
    });

    it("shouldn't call updateWithApiData when getting resource", function() {
      expect(subject.updateWithApiData.callCount).to.equal(0);
    });
  });

  describe('has one embedded', function() {
    var data;

    beforeEach(function() {
      data = {
        name: 'Joe Doe',
        address: {
          street: '1 My Street',
          zip: 12345
        }
      };
    });

    it('should use embedded data', function() {
      var Person = Ember.Resource.define({
        schema: {
          name: String,
          address: {type: Address, nested: true}
        }
      });

      var instance = Person.create({}, data);
      var address  = instance.get('address');

      expect(address instanceof Address).to.equal(true);
      expect(address.get('street')).to.equal('1 My Street');
      expect(address.get('zip')).to.equal(12345);

      instance.set('address', Address.create({street: '2 Your Street'}));
      expect(getPath(instance, 'data.address.street')).to.equal('2 Your Street');
      expect(getPath(instance, 'data.address.zip')).to.be.undefined;
    });

    it('should support path overriding', function() {
      var Person = Ember.Resource.define({
        schema: {
          name: String,
          address: {type: Address, nested: true, path: 'addresses.home'}
        }
      });

      data.addresses = { home: data.address };
      delete data.address;

      var instance = Person.create({}, data);
      var address  = instance.get('address');

      expect(address instanceof Address).to.equal(true);
      expect(address.get('street')).to.equal('1 My Street');
      expect(address.get('zip')).to.equal(12345);

      instance.set('address', Address.create({street: '2 Your Street'}));
      expect(getPath(instance, 'data.addresses.home.street')).to.equal('2 Your Street');
      expect(getPath(instance, 'data.addresses.home.zip')).to.be.undefined;
    });

    it('should have an id accessor', function() {
      var Person = Ember.Resource.define({
        schema: {
          name: String,
          address: {type: Address, nested: true}
        }
      });

      data.address.id = '1';

      var instance = Person.create({}, data);
      data = instance.get('data');
      var address  = instance.get('address');

      expect(instance.get('address_id')).to.equal(1);

      instance.set('address_id', '2');

      expect(instance.get('address_id')).to.equal(2);
      expect(instance.get('address')).not.to.equal(address);
      expect(getPath(instance, 'address.id')).to.equal(2);
    });
  });

  describe('has many', function() {
    var Person;

    describe('with url', function() {

      beforeEach(function() {
        Person = Ember.Resource.define({
          schema: {
            id:   Number,
            name: String,
            home_addresses: {
              type: Ember.ResourceCollection,
              itemType: Address,
              url: '/people/%@/addresses'
            },
            work_addresses: {
              type: Ember.ResourceCollection,
              itemType: Address,
              url: function(instance) {
                return '/people/' + instance.get('id') + '/addresses';
              }
            }
          }
        });
      });

      it('should support url strings', function() {
        var person = Person.create({id: 1, name: 'Mick Staugaard'});
        var homeAddresses = person.get('home_addresses');

        expect(homeAddresses).to.not.equal(undefined);
        expect(homeAddresses instanceof Ember.ResourceCollection).to.equal(true);
        expect(homeAddresses.type).to.equal(Address);
        expect(homeAddresses.url).to.equal('/people/1/addresses');
      });

      it('should support url functions', function() {
        var person = Person.create({id: 1, name: 'Mick Staugaard'});
        var workAddresses = person.get('work_addresses');

        expect(workAddresses).to.not.equal(undefined);
        expect(workAddresses instanceof Ember.ResourceCollection).to.equal(true);
        expect(workAddresses.type).to.equal(Address);
        expect(workAddresses.url).to.equal('/people/1/addresses');
      });
    });

    describe('nested', function() {
      beforeEach(function() {
        Person = Ember.Resource.define({
          schema: {
            name: String,
            home_addresses: {
              type: Ember.ResourceCollection,
              itemType: Address,
              nested: true
            },
            work_addresses: {
              type: Ember.ResourceCollection,
              itemType: Address,
              nested: true,
              path: 'office_addresses'
            }
          }
        });
      });

      it('should use the nested data', function() {
        var data = {
          name: 'Joe Doe',
          home_addresses: [
            {
              street: '1 My Street',
              zip: 12345
            },
            {
              street: '2 Your Street',
              zip: 23456
            }
          ]
        };

        var person = Person.create({}, data);
        var homeAddresses = person.get('home_addresses');

        expect(homeAddresses).to.not.equal(undefined);
        expect(homeAddresses instanceof Ember.ResourceCollection).to.equal(true);
        expect(homeAddresses.type).to.equal(Address);
        expect(homeAddresses.get('length')).to.equal(2);

        var address;
        for (var i=0; i < data.home_addresses.length; i++) {
          address = homeAddresses.objectAt(i);
          expect(address).to.not.equal(undefined);
          expect(address instanceof Address).to.equal(true);
          expect(address.get('street')).to.equal(data.home_addresses[i].street);
          expect(address.get('zip')).to.equal(data.home_addresses[i].zip);
        }

        address = homeAddresses.objectAt(0);

        address.set('street', '3 Other Street');
        expect(address.get('street')).to.equal('3 Other Street');
      });

      it("should use the class's parse method", function() {
        var data = {
          name: 'Joe Doe',
          home_addresses: [
            {
              street: '1 My Street',
              zip: 12345,
              city_name: 'Anytown'
            }
          ]
        };

        var person = Person.create({}, data),
            address = person.get('home_addresses').objectAt(0);

        expect(address).to.be.ok;
        expect(address.get('city')).to.equal('Anytown');
      });
    });

    describe('in array', function() {
      beforeEach(function() {
        Person = Ember.Resource.define({
          schema: {
            name: String,
            home_addresses: {
              type: Ember.ResourceCollection,
              itemType: Address,
              path: 'home_address_ids'
            }
          }
        });
      });

      it("should use the ids in the array", function() {
        var data = {
          name: 'Joe Doe',
          home_address_ids: [1, 2]
        };

        var person    = Person.create({}, data),
            addresses = person.get('home_addresses');

        expect(addresses.get('length')).to.equal(2);
        expect(addresses.objectAt(0).get('id')).to.equal(1);
        expect(addresses.objectAt(1).get('id')).to.equal(2);
      });
    });

  });
});
