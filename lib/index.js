#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const argv = require('yargs')
    .alias('f', 'file')
    .boolean('force').argv;
const glob = require('glob');

let originalContents = null;
let totalScriptletLines = 0;
let totalLines = 0;
let globPattern = "**/*.jsp*"
let isSingleFile = false;

let countLines = function(contents) {
    let lines = contents.match(/\n/g);
    let lineCount = lines ? lines.length: 0;
    // one based count
    return lineCount + 1;
};

let removeBlankLines = function(contents) {
    // remove windows returns, any space before hard returns, and any lines that are left blank
    return contents = contents.replace(/\r/g, '').replace(/(\s*\n)/g, "\n").replace(/(^\n)/gm, "");
};

let removeJSPComments = function(contents) {
    return contents.replace(/<%--.*--%>/g, '');
};

let transformJSPTags = function(contents) {
    // 1) mark expressions, taglibs, page imports and comments as allowed
    // 2) transform scriptlet start to more html-like syntax for parser
    // 3) all end tags will be </scriptlet>, but that doesn't matter to the parser
    return contents.replace(/<%[!@=]/g, '<allowed-jsp-stuff>').replace(/<%/g, '<scriptlet>\n').replace(/%>/g, '</scriptlet>');
};

let processFile = function(inputFileName) {
    let originalContents = fs.readFileSync(inputFileName, 'utf8');
    originalContents = removeJSPComments(originalContents);
    originalContents = removeBlankLines(originalContents);

    // fix the jsp tags to be more proper HTML style for the parser
    let fixedContents = transformJSPTags(originalContents);
    let originalLines = countLines(fixedContents);
    totalLines += originalLines;

    let scriptletLines = 0;
    const htmlparser = require("htmlparser2");

    let isScriptlet = false;
    let scriptletText = "";
    let parser = new htmlparser.Parser({
        onopentag: function(name, attribs){
            if(name === "scriptlet" ){
                isScriptlet = true;
                scriptletText = "";
            }
        },
        ontext: function(text){
            if (isScriptlet) {
                scriptletText += text;
            }
        },
        onclosetag: function(tagname){
            if(tagname === "scriptlet"){
                let textLines = countLines(scriptletText);
                scriptletLines += textLines;
                isScriptlet = false;
            }
        }
    }, {decodeEntities: true});

    parser.write(fixedContents);
    parser.end();

    totalScriptletLines += scriptletLines;

    let percentScriptlet = Math.round(scriptletLines / originalLines * 100);
    let relativePath = path.relative('.', inputFileName);

    console.log(relativePath.padEnd(70, ' ') + ',' +
        ('' + originalLines).padStart(9, ' ') +
        ' , ' +
        ('' + scriptletLines).padStart(9, ' ') +
        ' , ' +
        ('' + percentScriptlet) + '%');

};

if(argv.file) {
    if (fs.existsSync(argv.file)) {
        globPattern = argv.file;
        isSingleFile = true;
    }
}

console.log("FileName".padEnd(70, ' ') + "," + " original , scriptlet , percent");

let options = {};
// options is optional
glob(globPattern, options, function (er, files) {
    if (!er) {
        for (let i=0; i<files.length; i++) {
            processFile(files[i]);
        }
        console.log("".padEnd(70, ' ') + "," + "--------- , --------- , -------");
        let percentScriptlet = Math.round(totalScriptletLines / totalLines * 100);
        console.log('TOTAL'.padEnd(70, ' ') + ',' +
            ('' + totalLines).padStart(9, ' ') +
            ' , ' +
            ('' + totalScriptletLines).padStart(9, ' ') +
            ' , ' +
            ('' + percentScriptlet) + '%');
    }
});
