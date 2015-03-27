# import-resolve
resolve @import statements in css preprocessors

## What this does
What if you have some less or stylus files that you want to smash together into a master file, without compiling to css?  Just use import-resolve and all your dreams will come true.

## Using import-resolve
Once this is published in npm...

```
npm install import-resolve
```

```js
// some-node-thing.js
var importResolve = require('import-resolve');

// spits out a master dist file with all your wonderful stylesheet
// things concatenated
importResolve('path/to/main.less', 'path/to/output.less');

// returns a string of the concatenated file without doing anything
// with it
var output = importResolve('path/to/main.styl');
```

## Tests
`npm test`
