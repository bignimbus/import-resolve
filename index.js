#!/usr/bin/env node

var cwd = '',
    ext = '',
    root = '',
    dist = '',
    fs = require('fs'),
    path = require('path'),
    regex = /@import\s['"](.+?)['"];?/g;

function trimExtension (filename) {
    filename = filename.split('.');
    if (filename.length > 1) {
        filename = filename.slice(0, -1).join('.');
    } else {
        filename = filename[0];
    }
    return filename;
}

function read (filename) {
    var cwdStr = '',
        stylesheet = '',
        dir = filename.split('/');
    filename = dir.pop();
    console.log('\x1b[34m', 'Reading ' + filename);
    filename = trimExtension(filename) + ext;
    dir = dir.join('/');

    cwd = path.resolve(root, cwd, dir) + '/';

    stylesheet =  fs.readFileSync(cwd + filename, {"encoding": "utf8"});
    stylesheet = stylesheet.replace(regex, function (m, capture) {
        return m && m.replace(capture, cwd + capture);
    });
    return stylesheet;
}

function resolve (oldFile) {
    return oldFile.replace(regex, function (m, capture) {
        return read(capture);
    });
}

module.exports = function importResolve (opts) {
    cwd = '';
    root = '';
    dist = '';
    opts = opts || {};
    ext = ('.' + opts.ext).replace(/\.{2}/, '.');

    var oldFile,
        resolved,
        filename,
        pathToMain = opts.pathToMain,
        output = opts.output;

    root = (process.cwd() + '/' + pathToMain).split('/');

    filename = root.pop();
    filename = trimExtension(filename);

    root = root.join('/') + '/';

    dist = read(filename);
    resolved = false;

    while (!resolved) {
        oldFile = dist;
        dist = resolve(oldFile);
        if (dist === oldFile) {
            resolved = true;
        }
    }

    console.log('\x1b[32m', 'stylesheets concatenated!');

    if (output) {
        fs.writeFileSync(output, dist);
        console.log('\x1b[36m', 'to ', output);
    } else {
        return dist;
    }
}
