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

ImportResolver.prototype.write = function (dist) {
    fs.writeFile(this.output, dist, function () {
        console.log('\x1b[36m', 'to ', this.output);
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

    stylesheet = fs.readFileSync(this.cwd + filename, {"encoding": "utf8"});
    stylesheet = stylesheet.replace(regex, function (m, capture) {
        return m && m.replace(capture, this.cwd + capture);
    }.bind(this));

    return stylesheet;
};

ImportResolver.prototype.resolve = function (oldFile) {
    return oldFile.replace(regex, function (m, capture) {
        return this.read(capture);
    }.bind(this));
};

ImportResolver.prototype.writeToFile = function (dist, callback) {
    var output = this.output.split('/'),
        outPath = /\./.test(output.reverse()[0]) ? output.slice(0, -1).join('/') : output;
    fs.stat(outPath, function (err, stats) {
        if (err) {
            mkdirp.sync(outPath);
        }
        this.write();
    }.bind(this));
};

module.exports = function importResolve (opts, callback, context) {
    var resolver = new ImportResolver(opts),
        dist = resolver.resolveImportStatements();

    if (resolver.output) {
        resolver.writeToFile(dist);
        resolver.write(dist);
    }

    callback = callback && callback.bind(context || this, dist);
    if (callback) {
        callback();
    }
};
