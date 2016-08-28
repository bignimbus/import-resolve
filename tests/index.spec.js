var jasmine = require('jasmine-node'),
    importResolve = require('../index.js'),
    fs = require('fs'),
    rmdir = require('rmdir');

describe('importResolve integration', function () {
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

describe('importResolve integration', function () {
    it('should resolve all import statements for styl files in simple structures', function () {
        importResolve({
            "pathToMain": "tests/styl/main.styl",
            "ext": "styl"
        }, function (output) {
            expect(output).toBe('.foo\n    color: #333\n\n$bar = #444\n\n$variable_1 = 16px\n$variable_2 = 3em\n\n.foo\n    background: #000');
        });
    });

    it('should resolve all import statements for less files in simple structures', function () {
        importResolve({
            "pathToMain": "tests/less/main.less",
            "ext": "less"
        }, function (output) {
            expect(output).toBe('@font-size: 12px;\n\n.mixin() {\n    font-weight: bold;\n}\n#foo {\n    font-size: @font_size;\n}\n.bar {\n    .mixin();\n}\n');
        });
    });

    it('should resolve all import statements for complex structures', function () {
        importResolve({
            "pathToMain": "tests/complex/static/main.styl",
            "ext": "styl"
        }, function (output) {
            expect(output).toBe('$variable_1 = 16px\n$variable_2 = 3em\n\n$another_var = #444\n\n.some-div\n    background: $another_var\n\n#some-id\n    font-weight: normal');
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
