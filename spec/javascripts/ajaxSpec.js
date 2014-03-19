describe('Ember.Resource.ajax', function() {

  beforeEach(function () {
    sinon.stub($, "ajax", function() { return $.when(); });
  });

  afterEach(function () {
    $.ajax.restore();
  });

  describe('when Ember.Resource.errorHandler is set', function() {

    beforeEach(function() {
      this.originalErrorHandler = Ember.Resource.errorHandler;
      Ember.Resource.errorHandler = Em.K;
    });

    afterEach(function() {
      Ember.Resource.errorHandler = this.originalErrorHandler;
    });

    it('passes an "error" option to $.ajax', function() {
      Ember.Resource.ajax({ url: '/not/found/1' });
      expect($.ajax.called).to.be.ok;
      expect($.ajax.args[0][0].error).not.to.be.undefined;
    });

    it('passes an "error" option to $.ajax even if passed a String', function() {
      Ember.Resource.ajax('/not/found/2');
      expect($.ajax.called).to.be.ok;
      expect($.ajax.args[0][0].error).not.to.be.undefined;
    });

  });

});
