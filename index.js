#!/usr/bin/env node

var fs = require('fs'),
    homedir = './',
    dist = '';

function read (filename) {
    return fs.readFileSync(homedir + filename, {"encoding": "utf8"});
}

function resolve (oldFile) {
    return oldFile.replace(/@import\s['"](.+?)['"];?/g, function (m, capture) {
        return read(capture);
    });
}

module.exports = function styleCompile (path, output) {
    path = path.split('/');
    var oldFile, resolved, filename = path.pop();
    homedir = path.join('/') + '/';

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
