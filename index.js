#!/usr/bin/env node

var cwd = '',
    root = '',
    dist = '',
    fs = require('fs'),
    path = require('path'),
    regex = /@import\s['"](.+?)['"];?/g;

function read (filename) {
    var cwdStr = '',
        stylesheet = '',
        dir = filename.split('/');
    filename = dir.pop();
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

module.exports = function importResolve (pathToMain, output) {
    cwd = '';
    root = '';
    dist = '';
    var oldFile, resolved, filename;

    root = (process.cwd() + '/' + pathToMain).split('/');
    filename = root.pop();
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

    if (output) {
        fs.writeFileSync(output, dist);
    } else {
        return dist;
    }
    console.log('stylesheets concatenated!');
}
