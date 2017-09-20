# files-extractor

> Extract files that have changed between the specified date.
>
> [![NPM Version][npm-image]][npm-url]
> [![Download Status][download-image]][npm-url]
> ![Node Version][node-image]
> [![Dependencies][david-image]][david-url]

### Install
[![NPM](https://nodei.co/npm/files-extractor.png)](https://nodei.co/npm/files-extractor/)

### Introduction:
##### command line
```
>fextract -h

  Usage: fextract [options]

  Extract files that have changed between the specified date.


  Options:

    -V, --version        output the version number
    -f, --files <files>  set the files of extract
    -o, --output <path>  set the output dir of extract
    -s, --start <date>   set the start date of extract
    -e, --end <date>     set the end date of extract
    -t, --type <type>    set the filter type of extract
    -d, --dot            extract dot files
    -h, --help           output usage information


  Documentation can be found at https://github.com/nuintun/files-extractor#readme.
```

##### fextract.yml
```yml
files: # pattern to search for files (see: node-glob)
  "**/*"
output: # output dir of extract
  .extract
start: # filter start date of extract
  2017/9/19
end: # filter end date of extract
  2017/9/20
type: # filter type of extract, only one of [mtime, ctime, atime, birthtime]
  mtime
dot: # include dot files (see: node-glob)
  false
ignore: # pattern for exclude search (see: node-glob)
  - node_modules/**/*
```

[david-image]: http://img.shields.io/david/nuintun/files-extractor.svg?style=flat-square
[david-url]: https://david-dm.org/nuintun/files-extractor
[node-image]: http://img.shields.io/node/v/files-extractor.svg?style=flat-square
[npm-image]: http://img.shields.io/npm/v/files-extractor.svg?style=flat-square
[npm-url]: https://www.npmjs.org/package/files-extractor
[download-image]: http://img.shields.io/npm/dm/files-extractor.svg?style=flat-square
