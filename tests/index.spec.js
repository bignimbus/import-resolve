#!/usr/bin/env node

var jasmine = require('jasmine-node'),
    importResolve = require('../index.js');

describe('importResolve', function () {
    it('should exist', function () {
        expect(importResolve).toBeDefined();
    });

    it('should resolve all import statements for styl files in simple structures', function () {
        var output = importResolve({
            "pathToMain": "tests/styl/main.styl",
            "ext": "styl"
        });
        expect(output).toBe('.foo\n    color: #333\n\n$bar = #444\n\n$variable_1 = 16px\n$variable_2 = 3em\n\n.foo\n    background: #000');
    });

    it('should resolve all import statements for less files in simple structures', function () {
        var output = importResolve({
            "pathToMain": "tests/less/main.less",
            "ext": "less"
        });
        expect(output).toBe('@font-size: 12px;\n\n.mixin() {\n    font-weight: bold;\n}\n#foo {\n    font-size: @font_size;\n}\n.bar {\n    .mixin();\n}');
    });

    it('should resolve all import statements for complex structures', function () {
        var output = importResolve({
            "pathToMain": "tests/complex/static/main.styl",
            "ext": "styl"
        });
        expect(output).toBe('$variable_1 = 16px\n$variable_2 = 3em\n\n$another_var = #444\n\n.some-div\n    background: $another_var\n\n#some-id\n    font-weight: normal');
    });
});
