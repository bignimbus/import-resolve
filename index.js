'use strict';

var ImportResolver = require('./lib/import-resolver');

module.exports = function importResolve (opts, fn, context) {
    var resolver = new ImportResolver(opts),
        dist = resolver.resolveImportStatements();

    fn = fn && fn.bind(context || this, dist);

    resolver.write(dist, fn);
};

