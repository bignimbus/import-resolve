# import-resolve
resolve @import statements in css preprocessors

## What this does
What if you have some less or stylus files that you want to smash together into a master file, without compiling to css?  Just use import-resolve and all your dreams will come true.  All `@import` statements will be resolved and you'll be left with one file containing all your precious mixins, variables and declarations.

### Example:

```less
// foo.less
@color_1: #444444;
@color_2: #555555;

// random-dir/bar.less
.mixin () {
    font-size: 16px;
}

// main.less
@import 'foo.less';
@import 'random-dir/bar.less';

#it-worked {
    color: green;
}
```

becomes...

```less
@color_1: #444444;
@color_2: #555555;

.mixin () {
    font-size: 16px;
}

#it-worked {
    color: green;
}

```

## Using import-resolve

```
npm install import-resolve
```

```js
// some-node-thing.js
var importResolve = require('import-resolve');

// spits out a master dist file with all your wonderful stylesheet
// things concatenated
importResolve({
    "ext": "less",
    "pathToMain": "path/to/main.less",
    "output": "path/to/output.less"
});

// if you don't specify an output file, output accepts a callback parameter
// and passes the concatenated file text
var output = importResolve({
    "ext": "styl",
    "pathToMain": "path/to/main.styl"
}, function (output) {
    fs.writeFile('foo.styl', output, function (){
        console.log('did it myself.');
    });
});

// You can pass aliases if you have some files which have alias in your build process
importResolve({
    "ext": "less",
    "pathToMain": "path/to/main.less",
    "output": "path/to/output.less",
    "aliases": {
        "~myUniqueAlias": "path/to/unique/file.less"
    }
});

// You can pass an array of import paths that you'd like the resolver to ignore. Ignored imports will remain in the output file.
importResolve({
    "ext": "less",
    "pathToMain": "path/to/main.less",
    "output": "path/to/output.less",
    "ignorePaths": [
        "path/to/ignored/file.less"
    ]
});

// You can also ignore imports based on a RegExp pattern. Ignored imports will remain in the output file.
importResolve({
    "ext": "less",
    "pathToMain": "path/to/main.less",
    "output": "path/to/output.less",
    "ignorePathPattern": /^~/
});
```

## Using import-resolve from CLI
You can also use cli version of import resolve as described below.
```bash 
import-resolve inputfile outputfile [extension]
```
  
* first parameter is inputfile  
* second parameter is outputfile  
* third (optional) parameter is extension type (default is scss) 

## Tests

```bash
npm test

# Due to a bug in `jasmine-node`, Windows users should run: 
npm run-script win-test
```

