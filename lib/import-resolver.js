'use strict';
var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    regex = /@import[^'"]+?['"](.+?)['"];?/g;

function ImportResolver (opts) {
    this.cwd = '';
    this.dist = '';
    this.output = opts.output;
    this.ext = ('.' + opts.ext).replace(/\.{2}/, '.');
    this.root = (process.cwd() + '/' + opts.pathToMain).split('/');
    this.resolveImportStatements = function () {
        var oldFile = '',
            resolved = false,
            filename = this.root.pop();
        filename = this.trimExtension(filename);

        this.root = this.root.join('/') + '/';

        this.dist = this.read(filename);

        while (!resolved) {
            oldFile = this.dist;
            this.dist = this.resolve(oldFile);
            if (this.dist === oldFile) {
                resolved = true;
            }
        }

        console.log('\x1b[32m', 'stylesheets concatenated!');

        return this.dist;
    };
}

ImportResolver.prototype.writeToFile = function (dist, fn) {
    fs.writeFile(this.output, dist, function () {
        console.log('\x1b[36m', 'to ', this.output);
        if (fn) {
            fn();
        }
    }.bind(this));
};

ImportResolver.prototype.trimExtension = function (filename) {
    filename = filename.split('.');
    filename = filename.length > 1 ? filename.slice(0, -1).join('.') : filename[0];
    return filename;
};

ImportResolver.prototype.read = function (filename) {
    var stylesheet = '',
        dir = filename.split('/');

    filename = dir.pop();
    console.log('\x1b[34m', 'Reading ' + filename);
    filename = this.trimExtension(filename) + this.ext;
    dir = dir.join('/');

    this.cwd = path.resolve(this.root, this.cwd, dir) + '/';

    try {
        stylesheet = fs.readFileSync(this.cwd + filename, {"encoding": "utf8"});
    } catch (e) {
        try {
            stylesheet = fs.readFileSync(this.cwd + '_' + filename, {"encoding": "utf8"});
        } catch (er) {
            console.log('\x1b[36m', 'to ', 'Cannot read file "' + filename + '"');
        }
    }

    if (regex.test(stylesheet)) {
        stylesheet = stylesheet.replace(regex, function (m, capture) {
            return m && m.replace(capture, this.cwd + capture);
        }.bind(this));
    }

    return stylesheet;
};

ImportResolver.prototype.resolve = function (oldFile) {
    return oldFile.replace(regex, function (m, capture) {
        return this.read(capture);
    }.bind(this));
};

ImportResolver.prototype.write = function (dist, fn) {
    if (this.output) {
        var output = this.output.split('/'),
            outPath;
        output.reverse();
        outPath = /\./.test(output[0]) ? output.reverse().slice(0, -1).join('/') : output.reverse().join('/');
        fs.stat(outPath, function (err, stats) {
            if (err) {
                mkdirp.sync(outPath);
            }
            this.writeToFile(dist, fn);
        }.bind(this));
    } else if (fn) {
        fn();
    }
};

module.exports = ImportResolver;

