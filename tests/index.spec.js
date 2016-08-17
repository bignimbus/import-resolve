var jasmine = require('jasmine-node'),
    importResolve = require('../index.js'),
    fs = require('fs'),
    path = require('path'),
    rmdir = require('rmdir');

describe('importResolve', function () {
    it('should exist', function () {
        expect(importResolve).toBeDefined();
    });
});

describe('importResolve', function () {
    var error;
    beforeEach(function (done) {
        try {
            importResolve({
                "pathToMain": "tests/styl/main.styl",
                "ext": "styl"
            });
        } catch (e) {
            error = e;
        }
        done();
    });

    afterEach(function () {
        error = null;
    });

    it('should function without a callback', function (done) {
        expect(error).toBeUndefined();
        done();
    });

});

// On windows there are some characters that are added to the output, removed them
var removeSomeChars = function(str) {
  return unescape(escape(str).replace(/%0D/g, ''));
}
describe('importResolve', function () {
    it('should resolve all import statements for styl files in simple structures', function () {
        importResolve({
            "pathToMain": "tests/styl/main.styl",
            "ext": "styl"
        }, function (output) {
            expect(removeSomeChars(output)).toBe('.foo\n    color: #333\n\n$bar = #444\n\n$variable_1 = 16px\n$variable_2 = 3em\n\n.foo\n    background: #000');
        });
    });

    it('should resolve all import statements for less files in simple structures', function () {
        importResolve({
            "pathToMain": "tests/less/main.less",
            "ext": "less"
        }, function (output) {
            expect(removeSomeChars(output)).toBe('@font-size: 12px;\n\n.mixin() {\n    font-weight: bold;\n}\n#foo {\n    font-size: @font_size;\n}\n.bar {\n    .mixin();\n}\n');
        });
    });

    it('should resolve all import statements for complex structures', function () {
        importResolve({
            "pathToMain": "tests/complex/static/main.styl",
            "ext": "styl"
        }, function (output) {
            expect(removeSomeChars(output)).toBe('$variable_1 = 16px\n$variable_2 = 3em\n\n$another_var = #444\n\n.some-div\n    background: $another_var\n\n#some-id\n    font-weight: normal');
        });
    });

    it('should resolve all import and use alias when needed', function() {
      importResolve({
          "pathToMain": "tests/less/alias.less",
          "ext": "less",
          "alias": {
            "~myAlias": "./main.less"
          }
      }, function (output) {
          expect(removeSomeChars(output)).toBe('@font-size: 12px;\n\n.mixin() {\n    font-weight: bold;\n}\n#foo {\n    font-size: @font_size;\n}\n.bar {\n    .mixin();\n}\n');
      });
    });
    it('should work for absolute paths too', function() {
      importResolve({
          "pathToMain": path.join(__dirname, 'less', 'main.less'),
          "ext": "less"
      }, function (output) {
          expect(removeSomeChars(output)).toBe('@font-size: 12px;\n\n.mixin() {\n    font-weight: bold;\n}\n#foo {\n    font-size: @font_size;\n}\n.bar {\n    .mixin();\n}\n');
      });
    });
});

describe('file write system', function () {
    beforeEach(function (done) {
        rmdir('tests/output', function () {
            fs.mkdir('tests/output', done);
        });
    });

    afterEach(function () {
        rmdir('tests/output', function () {
            console.log('tests finished');
        });
    });

    it('should write to the file specified in the optional "output" settings param', function (done) {
        var error = 'no errors!',
            output = 'tests/output/path/doesnt/exist/yet.styl';

        importResolve({
                "pathToMain": "tests/complex/static/main.styl",
                "ext": "styl",
                "output": output
            }, function () {
                try {
                    fs.statSync(output);
                } catch (e) {
                    error = e;
                }

                expect(error).toBe('no errors!');
                expect(fs.readFileSync(output, {"encoding": "utf8"})).toBeDefined();
                done();
            });
    });
});
