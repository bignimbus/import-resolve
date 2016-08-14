var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    regex = /@import[^'"]+?['"](.+?)['"];?/g;

function ImportResolver (opts) {
    this.cwd = '';
    this.dist = '';
    this.output = opts.output;
    this.alias = opts.alias || {};
    this.aliasKeys = Object.keys(this.alias);
    this.aliasKeysLength = this.aliasKeys.length;
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
    if (filename.indexOf(this.ext) !== -1) {
      filename = filename.split('.');
      filename = filename.length > 1 ? filename.slice(0, -1).join('.') : filename[0];
    }
    return filename;
};

ImportResolver.prototype.read = function (filename) {
    var stylesheet = '',
        filesToReadInPriority,
        filesToReadInPriorityLength,
        filenameWithPath,
        filenameWithPathAndExtension,
        filePath,
        aliasKey;

    if (path.isAbsolute(filename)) {
      filenameWithPath = filename;
    } else {
      filenameWithPath = path.join(this.root, this.cwd, filename);
    }

    filenameWithPathAndExtension = this.trimExtension(filenameWithPath) + this.ext;

    filesToReadInPriority = [
      filenameWithPathAndExtension,
      path.resolve(path.dirname(filenameWithPathAndExtension), '_' + path.basename(filenameWithPathAndExtension)) // Same path just with "_" before filename
    ];
    filesToReadInPriorityLength = filesToReadInPriority.length;

    for (var filesToReadInPriorityIndex = 0; filesToReadInPriorityIndex < filesToReadInPriorityLength; filesToReadInPriorityIndex++) {
      try {
          stylesheet = fs.readFileSync(filesToReadInPriority[filesToReadInPriorityIndex], {"encoding": "utf8"});
      } catch (e) {
          if (filesToReadInPriorityIndex === filesToReadInPriorityLength - 1) {
              console.log('\x1b[36m', 'to ', 'Cannot read file "' + filename + '"');
          }
      }
      if (stylesheet.length > 0) {
          break;
      }
    }

    if (this.aliasKeys.length !== 0) {
        for (var aliasKeysIndex = 0; aliasKeysIndex < this.aliasKeysLength; aliasKeysIndex++) {
            aliasKey = this.aliasKeys[aliasKeysIndex];
            if (stylesheet.match(aliasKey)) {
                stylesheet = stylesheet.replace(new RegExp(aliasKey, 'g'), this.alias[aliasKey]);
            }
        }
    }
    filePath = path.dirname(filenameWithPathAndExtension);
    if (regex.test(stylesheet)) {
        stylesheet = stylesheet.replace(regex, function (m, capture) {
            if (!path.isAbsolute(capture)) {
                return m && m.replace(capture, path.join(filePath, capture));
            } else {
                return m;
            }
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

module.exports = function importResolve (opts, fn, context) {
    var resolver = new ImportResolver(opts),
        dist = resolver.resolveImportStatements();

    fn = fn && fn.bind(context || this, dist);

    resolver.write(dist, fn);
};
