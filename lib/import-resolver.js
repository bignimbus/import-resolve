'use strict';
var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    regex = /@import[^'"]+?['"](.+?)['"];?/g;

function ImportResolver (opts) {
    this.aliases = opts.aliases;
    this.cwd = '';
    this.dist = '';
    this.output = opts.output;
    this.ext = ('.' + opts.ext).replace(/\.{2}/, '.');
    this.root = path.resolve(process.cwd(), opts.pathToMain).split(path.sep);
    this.resolveImportStatements = function () {
        var oldFile = '',
            resolved = false,
            filename = this.root.pop();
        filename = this.trimExtension(filename);

        this.root = this.root.join(path.sep) + path.sep;

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
    var prefix = filename.match(/^\.*/);
    prefix = prefix && prefix.length ? prefix[0] : '';
    filename = filename.slice(prefix.length).split('.');
    filename = filename.length > 1 ? filename.slice(0, -1).join('.') : filename[0];
    return prefix + filename;
};

ImportResolver.prototype.getFile = function (filename) {
    var str = '';
    try {
        str = fs.readFileSync(this.cwd + filename, {"encoding": "utf8"});
    } catch (e) {
        try {
            str = fs.readFileSync(this.cwd + '_' + filename, {"encoding": "utf8"});
        } catch (er) {
            console.log('\x1b[36m', 'to ', 'Cannot read file "' + filename + '"');
        }
    }
    return str;
};

ImportResolver.prototype.normalizeImport = function (str) {
    if (regex.test(str)) {
        str = str.replace(regex, function (m, capture) {
            var p = path.resolve(this.cwd, capture);
            return m && m.replace(capture, p);
        }.bind(this));
    }
    return str;
};

ImportResolver.prototype.read = function (filename) {
    var stylesheet = '',
        dir = filename.split(path.sep);

    filename = dir.pop();
    console.log('\x1b[34m', 'Reading ' + filename);
    filename = this.trimExtension(filename) + this.ext;
    dir = dir.join(path.sep);

    this.cwd = path.resolve(this.root, this.cwd, dir) + path.sep;

    stylesheet = this.getFile(filename);
    stylesheet = this.normalizeImport(stylesheet);

    return stylesheet;
};

ImportResolver.prototype.resolve = function (oldFile) {
    return oldFile.replace(regex, function (m, capture) {
        return this.read(capture);
    }.bind(this));
};

ImportResolver.prototype.write = function (dist, fn) {
    if (this.output) {
        var output = this.output.split(path.sep),
            outPath;
        output.reverse();
        outPath = /\./.test(output[0]) ? output.reverse().slice(0, -1).join(path.sep) : output.reverse().join(path.sep);
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

