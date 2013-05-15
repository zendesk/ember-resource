/*globals describe, it, beforeEach, expect, Em */
describe('resourceURL', function() {
  var subject, instance;
  describe("for a resource with a string #url", function() {
    beforeEach(function() {
      subject = Em.Resource.define({
        url: "/users/me"
      });
    });

    describe("for an instance with an id", function() {
      beforeEach(function() {
        instance = subject.create({id: 1});
      });

      it("should append the id to the string", function() {
        expect(instance.resourceURL()).toEqual("/users/me/1");
      });
    });

    describe("for an instance with no id", function() {
      beforeEach(function() {
        instance = subject.create();
      });

      it("should return the string", function() {
        expect(instance.resourceURL()).toEqual("/users/me");
      });
    });

    describe('for an instance with ID 0', function() {
      beforeEach(function() {
        instance = subject.create({ id: 0 });
      });

      it("should not have a URL", function() {
        expect(instance.resourceURL()).toBeUndefined();
      });
    });

    describe('for an instance with a negative ID', function() {
      beforeEach(function() {
        model = subject.create({ id: -1 });
      });

      it('should not have a URL', function() {
        expect(instance.resourceURL()).toBeUndefined();
      });
    });
  });

  describe("for a resource with a function #url", function() {
    beforeEach(function() {
      subject = Em.Resource.define({
        url: function(instance) {
          return "/users/%@".fmt(instance.get('id'));
        }
      });
    });

    describe("for an instance", function() {
      beforeEach(function() {
        instance = subject.create({id: 1});
      });
      it("should return the result of invoking the function with the instance", function() {
        spyOn(subject, 'url').andCallThrough();

        expect(instance.resourceURL()).toEqual("/users/1");
        expect(subject.url).toHaveBeenCalledWith(instance);
      });
    });

  });
});
