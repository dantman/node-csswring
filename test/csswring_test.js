/* jshint node: true */
'use strict';

var fs = require('fs');
var path = require('path');
var postcss = require('postcss');

var csswring = require('../index');

var dirFixtures = path.join(__dirname, 'fixtures');
var dirExpected = path.join(__dirname, 'expected');
var input = '';
var expected = '';
var opts = {};
var loadInput = function (name) {
  return fs.readFileSync(path.join(dirFixtures, name + '.css'), {
    encoding: 'utf8'
  });
};
var loadExpected = function (name) {
  return fs.readFileSync(path.join(dirExpected, name + '.css'), {
    encoding: 'utf8'
  });
};

exports.testPublicInterfaces = function (test) {
  test.expect(13);

  input = '.foo{color:black}';
  expected = postcss.parse(input);

  // csswring.wring()
  test.strictEqual(csswring.wring(input).css, expected.toString());

  // csswring().wring()
  test.strictEqual(csswring().wring(input).css, expected.toString());

  opts.map = true;
  test.deepEqual(
    csswring.wring(input, opts).map,
    expected.toResult(opts).map
  );
  opts.map = undefined;

  // csswring.postcss
  test.strictEqual(
    postcss().use(csswring.postcss).process(input).css,
    expected.toString()
  );

  // csswring.processor alias
  test.strictEqual(
    postcss().use(csswring.processor).process(input).css,
    expected.toString()
  );

  // csswring().postcss
  test.strictEqual(
    postcss().use(csswring().postcss).process(input).css,
    expected.toString()
  );

  // preserveHacks
  csswring.preserveHacks = true;
  var testCase = 'preserve-hacks';
  var preserveHacksInput = loadInput(testCase);
  var preserveHacksExpected = loadExpected(testCase);
  test.strictEqual(csswring.wring(preserveHacksInput).css, preserveHacksExpected);
  csswring.preserveHacks = false;

  // removeAllComments
  csswring.removeAllComments = true;
  opts.map = true;
  testCase = 'remove-all-comments';
  var removeAllCommentsInput = loadInput(testCase);
  var removeAllCommentsExpected = loadExpected(testCase);
  test.strictEqual(csswring.wring(removeAllCommentsInput, opts).css, removeAllCommentsExpected);
  csswring.removeAllComments = false;
  opts.map = undefined;

  // csswring.wring(css, options)
  test.strictEqual(csswring.wring(preserveHacksInput, {preserveHacks: true}).css, preserveHacksExpected);

  // csswring(options).wring()
  test.strictEqual(csswring({preserveHacks: true}).wring(preserveHacksInput).css, preserveHacksExpected);

  // csswring(options).postcss
  test.strictEqual(
    postcss()
      .use(csswring({preserveHacks: true}).postcss)
      .process(preserveHacksInput)
      .css,
    preserveHacksExpected
  );

  // instances do not share settings
  var a = csswring({preserveHacks: true});
  var b = csswring();

  test.strictEqual(
    postcss()
      .use(a.postcss)
      .process(preserveHacksInput)
      .css,
    preserveHacksExpected
  );

  test.strictEqual(
    postcss()
      .use(b.postcss)
      .process(input)
      .css,
    expected.toString()
  );

  test.done();
};

exports.testRealCSS = function (test) {
  test.expect(6);

  var testCases = [
    'simple',
    'extra-semicolons',
    'empty-declarations',
    'single-charset',
    'value',
    'issue3'
  ];

  for (var i = 0, l = testCases.length; i < l; i++) {
    var testCase = testCases[i];
    input = loadInput(testCase);
    expected = loadExpected(testCase);
    test.strictEqual(csswring.wring(input).css, expected);
  }

  test.done();
};
