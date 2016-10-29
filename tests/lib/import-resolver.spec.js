'use strict';

var ImportResolver = require('../../lib/import-resolver'),
    fs = require('fs'),
    path = require('path');

function normalize (str) {
    return path.normalize(str);
}

describe('ImportResolver', function () {
    var subject;
    describe('constructor', function () {
        beforeEach(function () {
            subject = new ImportResolver({
                "output": "foo",
                "ext": "bar",
                "pathToMain": normalize("baz/bing"),
                "aliases": {
                    "myAlias": "qux"
                }
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
            expect(subject.root).toEqual(process.cwd().split(path.sep).concat(['baz', 'bing']));
        });
        it('should set aliases', function () {
            expect(subject.aliases).toEqual({
                "myAlias": "qux"
            });
        });
    });

    describe('#writeToFile', function (done) {
        beforeEach(function () {
            subject = new ImportResolver({
                "output": "foo",
                "ext": "bar",
                "pathToMain": normalize("baz/bing")
            });
        });
        afterEach(function () {
            subject = null;
        });

        it('should be able to call a callback function', function () {
            subject.writeToFile(normalize('./foo'), function () {
                fs.unlinkSync(normalize('./foo'));
                expect(1).toBe(1);
                done();
            });
        });
    });

    describe('#trimExtension', function () {
        beforeEach(function () {
            subject = ImportResolver.prototype.trimExtension.bind({
                ext: 'qux'
            });
        });
        afterEach(function () {
            subject = null;
        });

        it('should remove the extension from the provided path', function () {
            expect(subject(normalize('foo/bar/baz.qux'))).toBe(normalize('foo/bar/baz'));
            expect(subject(normalize('foo/bar/baz.bing.qux'))).toBe(normalize('foo/bar/baz.bing'));
            expect(subject(normalize('foo.bar/baz.bing.qux'))).toBe(normalize('foo.bar/baz.bing'));
            expect(subject(normalize('./foo.bar/baz.bing.qux'))).toBe(normalize('./foo.bar/baz.bing'));
            expect(subject(normalize('./foo/bar/baz'))).toBe(normalize('./foo/bar/baz'));
            expect(subject(normalize('../foo/bar/baz'))).toBe(normalize('../foo/bar/baz'));
        });

        it('should not trim the string after the last "." if that string is not the extension', function () {
            expect(subject(normalize('foo/bar/baz.bing.qux'))).toBe(normalize('foo/bar/baz.bing'));
            expect(subject(normalize('foo/bar/baz.bing'))).toBe(normalize('foo/bar/baz.bing'));
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
                    case 'foo' + path.sep + 'bar':
                        return 'bar';
                    case 'foo' + path.sep + '_baz':
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
            subject.cwd = 'foo' + path.sep;
            var output = subject.getFile('bar');
            expect(fs.readFileSync).toHaveBeenCalledWith('foo' + path.sep + 'bar', {"encoding": "utf8"});
            expect(output).toBe('bar');
        });

        it('should also try reading "_filename" if "filename" does not exist', function () {
            subject.cwd = 'foo' + path.sep;
            var output = subject.getFile('baz');
            expect(fs.readFileSync).toHaveBeenCalledWith('foo' + path.sep + 'baz', {"encoding": "utf8"});
            expect(output).toBe('baz');
        });
    });

    describe('#normalizeImport', function () {
        beforeEach(function () {
            subject = ImportResolver.prototype.normalizeImport.bind({
                "cwd": "foo" + path.sep,
                "aliases": {
                    "myAlias": "./bar/baz/qux"
                }
            });
        });
        afterEach(function () {
            subject = null;
        });

        it('should not mutate the string if there are no statements matching the default import regular expression', function () {
            var str = '.foo { display: none; }';
            expect(subject(str)).toBe(str);
        });

        it('should replace "@import path/to/file" with a normalized file path via the cwd', function () {
            var str = '@import "bar/baz"; .foo { display: none; }';
            expect(subject(str)).toBe('@import "' + normalize(process.cwd() + '/foo/bar/baz') + '"; .foo { display: none; }');
            str = '@import "./bar/baz"; .foo { display: none; }';
            expect(subject(str)).toBe('@import "' + normalize(process.cwd() + '/foo/bar/baz') + '"; .foo { display: none; }');
            str = '@import "../bar/baz"; .foo { display: none; }';
            expect(subject(str)).toBe('@import "' + normalize(process.cwd() + '/bar/baz') + '"; .foo { display: none; }');
            str = '@import "baz"; .foo { display: none; }';
            expect(subject(str)).toBe('@import "' + normalize(process.cwd() + '/foo/baz') + '"; .foo { display: none; }');
            str = '@import "./baz"; .foo { display: none; }';
            expect(subject(str)).toBe('@import "' + normalize(process.cwd() + '/foo/baz') + '"; .foo { display: none; }');
        });

        it('should replace "@import {{alias}}" with a normalized file path via the cwd', function () {
            var str = '@import "myAlias"; .foo { display: none; }';
            expect(subject(str)).toBe('@import "' + normalize(process.cwd() + '/foo/bar/baz/qux') + '"; .foo { display: none; }');
            str = '@import "myAliasJK"; .foo { display: none; }';
            expect(subject(str)).toBe('@import "' + normalize(process.cwd() + '/foo/myAliasJK') + '"; .foo { display: none; }');
        });
    });

    describe('#read', function () {
        // TODO add unit tests
    });

    describe('#resolve', function () {
         beforeEach(function () {
            subject = new ImportResolver({
                "output": "foo",
                "ext": "scss",
                "pathToMain": "./tests/import-regex/testimports.scss"
            });
            var filename = subject.root.pop();
            filename = subject.trimExtension(filename);

            subject.root = subject.root.join(path.sep) + path.sep;

            subject.dist = subject.read(filename);

            spyOn(subject, 'read')
         });

        afterEach(function () {
            subject = null;
        });
        
        it('should resolve imports correctly', function(){
            
            subject.resolve(subject.dist);

            let matches = subject.read.argsForCall; 
            expect(path.basename(matches[0][0])).toBe('custom')
            expect(path.basename(matches[1][0])).toBe('variables')
            expect(path.basename(matches[2][0])).toBe('mixins')
            expect(path.basename(matches[3][0])).toBe('normalize')
            expect(path.basename(matches[4][0])).toBe('namespace-styles')
            
                    
         });
        
    });

    describe('#write', function () {
        // TODO add unit tests
    });
});

