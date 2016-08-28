'use strict';

var ImportResolver = require('../../lib/import-resolver');

describe('ImportResolver', function () {
    var subject;
    describe('constructor', function () {
        subject = new ImportResolver({
            "output": "foo",
            "ext": "bar",
            "pathToMain": "baz/bing"
        });
        expect(subject.output).toBe('foo');
        expect(subject.ext).toBe('.bar');
        expect(subject.root).toEqual(process.cwd().split('/').concat(['baz', 'bing']));
    });
});

