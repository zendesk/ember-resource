describe('Auto fetching', function() {
  var Person, server;

  beforeEach(function() {
    Person = Ember.Resource.define({
      url: '/people',
      schema: {
        id:       Number,
        name:     String
      }
    });

    server = sinon.fakeServer.create();
    Ember.Resource.Lifecycle.clock.tick();
  });

  afterEach(function() {
    server.restore();
  });

  describe('of models', function() {
    var person;

    beforeEach(function() {
      server.respondWith("GET", "/people/1",
                         [200, { "Content-Type": "application/json" },
                         '{ "id": 1, "name": "Mick Staugaard" }']);
      person = Person.create({id: 1});
    });

    it('getting known attributes should not schedule a fetch', function() {
      spyOn(person, 'fetch');
      runs(function() {
        expect(person.get('id')).toBe(1);
      });

      waits(100);

      runs(function() {
        expect(person.fetch).not.toHaveBeenCalled();
      });
    });

    it('getting known attributes that are not defined should schedule a fetch', function() {
      runs(function() {
        expect(person.get('name')).toBeUndefined();
      });

      waits(100);

      runs(function() {
        server.respond();
        expect(person.get('name')).toBe('Mick Staugaard');
      });
    });

    it('getting unknown attributes should not schedule a fetch', function() {
      spyOn(person, 'fetch');
      runs(function() {
        expect(person.get('notInSchema')).toBeUndefined();
      });

      waits(100);

      runs(function() {
        expect(person.fetch).not.toHaveBeenCalled();
      });
    });

    it('should not fetch when autoFetch is false', function() {
      spyOn(person, 'fetch');
      person.set('autoFetch', false);

      runs(function() {
        expect(person.get('name')).toBeUndefined();
      });

      waits(100);

      runs(function() {
        expect(person.fetch).not.toHaveBeenCalled();
      });
    });
  });

  describe('of collections', function() {
    var people;

    beforeEach(function() {
      server.respondWith("GET", "/people",
                         [200, { "Content-Type": "application/json" },
                         '[{ "id": 1, "name": "Mick Staugaard" }]']);
      people = Ember.ResourceCollection.create({type: Person});
      server.respond();
    });

    it('should not fetch on creation', function() {
      var hasFetched = false;
      var TestCollection = Ember.ResourceCollection.extend({
        fetch: function() {
          hasFetched = true;
        }
      });

      runs(function() {
        people = TestCollection.create({type: Person});
      });

      waits(100);

      runs(function() {
        expect(hasFetched).toBe(false);
      });
    });

    describe('that are fetched', function() {
      beforeEach(function() {
        people.fetch();
        server.respond();

        waitsFor(function() {
          return people.get('length') > 0;
        }, 'collection never fetched', 1000);

        runs(function() {
          server.restore();
          server = sinon.fakeServer.create();
          server.respondWith("GET", "/people",
                             [200, { "Content-Type": "application/json" },
                             '[{ "id": 1, "name": "Mick Staugaard" }, { "id": 2, "name": "Shajith Chacko" }]']);
        });
      });

      it('should not be refetched', function() {
        runs(function() {
           people.fetch();
           server.respond();
        });

        waits(1000);

        runs(function() {
          expect(people.get('length')).toBe(1);
        });
      });

      it('should return a resolved deferred', function() {
        var result = people.fetch();
        expect(result).not.toBeUndefined();
        expect(result.state()).toBe('resolved');
      });

      describe('and expired', function() {
        beforeEach(function() {
          runs(function() {
            people.expire();
          });

          waitsFor(function() {
            return people.get('isExpired');
          }, 'collection never expired', 1000);
        });

        xit('should refetch', function() {
          waitsFor(function() {
            server.respond();
            return people.get('length') === 2;
          }, 'collection never refetched', 2000);
        });

        describe('and autofetch turned off', function(){
          beforeEach(function() {

            runs(function() {
              people.set('autoFetch', false);
              people.expire();
            });

          });

          describe('and has Array Observers ', function(){
            beforeEach(function() {
              people.addArrayObserver({});

              runs(function() {
                spyOn(people, 'fetch');
              });

              waitsFor(function() {
                return people.get('isExpired');
                }, 'collection never expired', 1000);
            });

            it('should not refetch', function() {
              expect(people.fetch).not.toHaveBeenCalled();
            });

          });

          describe('and has no Array Observers ', function(){
            beforeEach(function() {

              runs(function() {
                spyOn(people, 'fetch');
              });

              waitsFor(function() {
                return people.get('isExpired');
                }, 'collection never expired', 1000);
            });

            it('should not refetch', function() {
              expect(people.fetch).not.toHaveBeenCalled();
            });

          });

        });

        describe('and autofetch turned on', function(){
          beforeEach(function() {
            runs(function() {
              people.set('autoFetch', true);
              people.expire();
            });
           });

           describe('and has Array Observers ', function(){
             beforeEach(function() {
               people.addArrayObserver({});

               runs(function() {
                 spyOn(people, 'fetch');
               });

               waitsFor(function() {
                 return people.get('isExpired');
                 }, 'collection never expired', 1000);
              });

              xit('should refetch', function() {
                expect(people.fetch).toHaveBeenCalled();
              });

            });

           describe('and has no Array Observers ', function(){
             beforeEach(function() {

               runs(function() {
                 spyOn(people, 'fetch');
               });

               waitsFor(function() {
                 return people.get('isExpired');
                 }, 'collection never expired', 1000);
              });

              it('should not refetch', function() {
                expect(people.fetch).not.toHaveBeenCalled();
              });

            });

        });

      });

    });

  });

});
