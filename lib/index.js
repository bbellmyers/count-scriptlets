#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const argv = require('yargs')
    .alias('f', 'file')
    .boolean('force').argv;
const glob = require('glob');

var originalContents = null;
var totalScriptletLines = 0;
var totalLines = 0;

var countLines = function(contents) {
    var matches = contents.match(/\n/g);
    return matches ? matches.length : 1;
};

var removeBlankLines = function(contents) {
    // remove windows returns
    var contents = contents.replace(/\r/g, '');
    // remove white space before all returns
    contents = contents.replace(/(\s*\n)/g, "\n");
    // remove all lines that are only a return
    return contents.replace(/(^\n)/gm, "");
};

var removeJSPComments = function(contents) {
    return contents.replace(/<%--.*--%>\r\n/g, '');
};

var processFile = function(inputFileName) {
    originalContents = fs.readFileSync(inputFileName, 'utf8');
    originalContents = removeJSPComments(originalContents);
    originalContents = removeBlankLines(originalContents);
    var originalLines = countLines(originalContents);
    totalLines += originalLines;

    var scriptletLines = 0;
    var scriptletMatches = originalContents.match(/<%[^@=-][^%]*%>/g);
    if (scriptletMatches) {
        for (var m = 0; m < scriptletMatches.length; m++) {
            scriptletLines += countLines(scriptletMatches[m]);
        }
    }
    totalScriptletLines += scriptletLines;

    var percentScriptlet = Math.round(scriptletLines / originalLines * 100);
    var relativePath = path.relative('.', inputFileName);

    console.log(relativePath.padEnd(70, ' ') + ',' +
        ('' + originalLines).padStart(9, ' ') +
        ' , ' +
        ('' + scriptletLines).padStart(9, ' ') +
        ' , ' +
        ('' + percentScriptlet) + '%');

};

var globPattern = "**/*.jsp*"

if(argv.file) {
    if (fs.existsSync(argv.file)) {
        globPattern = argv.file;
    }
}

console.log("FileName".padEnd(70, ' ') + "," + " original , scriptlet , percent");

var options = {};
// options is optional
glob(globPattern, options, function (er, files) {
    if (!er) {
        for (var i=0; i<files.length; i++) {
            processFile(files[i]);
        }
        console.log("".padEnd(70, ' ') + "," + "--------- , --------- , -------");
        var percentScriptlet = Math.round(totalScriptletLines / totalLines * 100);
        console.log('TOTAL'.padEnd(70, ' ') + ',' +
            ('' + totalLines).padStart(9, ' ') +
            ' , ' +
            ('' + totalScriptletLines).padStart(9, ' ') +
            ' , ' +
            ('' + percentScriptlet) + '%');
    }
});
