'use strict';

var ImportResolver = require('../../lib/import-resolver'),
    fs = require('fs');

describe('ImportResolver', function () {
    var subject;
    describe('constructor', function () {
        beforeEach(function () {
            subject = new ImportResolver({
                "output": "foo",
                "ext": "bar",
                "pathToMain": "baz/bing"
            });
        });
        afterEach(function () {
            subject = null;
        });

        it('should set the output file', function () {
            expect(subject.output).toBe('foo');
        });
        it('should set the extension', function() {
            expect(subject.ext).toBe('.bar');
        });
        it('should set the root path', function () {
            expect(subject.root).toEqual(process.cwd().split('/').concat(['baz', 'bing']));
        });
    });

    describe('#writeToFile', function (done) {
        beforeEach(function () {
            subject = new ImportResolver({
                "output": "foo",
                "ext": "bar",
                "pathToMain": "baz/bing"
            });
        });
        afterEach(function () {
            subject = null;
        });

        it('should be able to call a callback function', function () {
            subject.writeToFile('./foo', function () {
                fs.unlinkSync('./foo');
                expect(1).toBe(1);
                done();
            });
        });
    });

    describe('#trimExtension', function () {
        beforeEach(function () {
            subject = ImportResolver.prototype.trimExtension;
        });
        afterEach(function () {
            subject = null;
        });

        it('should remove the extension from the provided path', function () {
            expect(subject('foo/bar/baz.bing')).toBe('foo/bar/baz');
            expect(subject('foo/bar/baz.bing.qux')).toBe('foo/bar/baz.bing');
            expect(subject('foo.bar/baz.bing.qux')).toBe('foo.bar/baz.bing');
            expect(subject('./foo.bar/baz.bing.qux')).toBe('./foo.bar/baz.bing');
            expect(subject('./foo/bar/baz')).toBe('./foo/bar/baz');
            expect(subject('../foo/bar/baz')).toBe('../foo/bar/baz');
        });
    });

    describe('#getFile', function () {
        beforeEach(function () {
            subject = new ImportResolver({
                "output": "foo",
                "ext": "bar",
                "pathToMain": "baz/bing"
            });
            spyOn(fs, 'readFileSync').andCallFake(function (str, encoding) {
                switch(str) {
                    case 'foo/bar':
                        return 'bar';
                    case 'foo/_baz':
                        return 'baz';
                    default:
                        throw new Error();
                }
            });
        });
        afterEach(function () {
            subject = null;
        });

        it('should return the result of reading the cwd plus the filename', function () {
            subject.cwd = 'foo/';
            var output = subject.getFile('bar');
            expect(fs.readFileSync).toHaveBeenCalledWith('foo/bar', {"encoding": "utf8"});
            expect(output).toBe('bar');
        });

        it('should also try reading "_filename" if "filename" does not exist', function () {
            subject.cwd = 'foo/';
            var output = subject.getFile('baz');
            expect(fs.readFileSync).toHaveBeenCalledWith('foo/baz', {"encoding": "utf8"});
            expect(output).toBe('baz');
        });
    });

    describe('#read', function () {
        beforeEach(function () {

        });
        afterEach(function () {
            subject = null;
        });
    });
});

