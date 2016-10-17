/**
 * This file manage files and folders
 * Author: Aureliano
 */

"use strict";

// built-in node file module
const MODULE_NAME = 'FileService';
const fs = require('fs');
const path = require('path');
const ASQ = require('asynquence-contrib');

var cache = {};

/**
 * Return an array of filenames in a folder
 * @param folderpath the path of the folder
 * @param onComplete(list of results,error)
 */
function _getFilenamesInFolder(folderpath, onComplete) {
  folderpath = path.normalize(folderpath);
  if (cache && cache[folderpath]) {
    var value = cache[folderpath];
    console.log(MODULE_NAME + ' cache HIT!');
    onComplete(null, value);
  } else {
    ASQ((done)=> {
      fs.readdir(folderpath, done.errfcb);
    }).then((done, list)=> {
      if (list) {
        cache[folderpath] = list;
        console.log(MODULE_NAME + ': _getFilenamesInFolder  ' + folderpath + ' files[' + list.toString() + ']');
      } else {
        console.log(MODULE_NAME + ' _getFilenamesInFolder: ' + folderpath + ' is empty');
      }
      onComplete(null, list);
      done();
    }).or((err)=> {
      console.error(MODULE_NAME + ': _getFilenamesInFolder cannot get ' + folderpath + ' files');
      console.log(MODULE_NAME + ': _getFilenamesInFolder cannot get ' + folderpath + ' files');
      onComplete(err, null);
    });
  }

}

/**
 * get the path absolute for the application
 * @param inputPath application based
 */
function _getPath(inputPath) {
  var normalizedPath = path.normalize(global.__base + inputPath);
  return normalizedPath;
}

/** EXPORTS */
exports.getFilenamesInFolder = _getFilenamesInFolder;
exports.getPath = _getPath;

