describe('deepMerge', function() {
  it('should add missing keys', function() {
    var obj = {};
    Ember.Resource.deepMerge(obj, {a: 'foo'});

    expect(obj.a).to.not.equal(undefined);
    expect(obj.a).to.equal('foo');
  });

  it('should override keys', function() {
    var obj = {a: 'foo'};
    Ember.Resource.deepMerge(obj, {a: 'bar'});

    expect(obj.a).to.not.equal(undefined);
    expect(obj.a).to.equal('bar');
  });

  it('should leave other keys', function() {
    var obj = {a: 'foo'};
    Ember.Resource.deepMerge(obj, {b: 'bar'});

    expect(obj.a).to.not.equal(undefined);
    expect(obj.a).to.equal('foo');
  });

  it('merge recursively', function() {
    var obj = {a: {b: 'foo'}};
    Ember.Resource.deepMerge(obj, {a: {b: 'bar'}});

    expect(obj.a.b).to.not.equal(undefined);
    expect(obj.a.b).to.equal('bar');
  });
});
