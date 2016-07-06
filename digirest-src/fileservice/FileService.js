/**
 * This file manage files and folders
 * Author: Aureliano
 */

"use strict";

// built-in node file module
var MODULE_NAME = 'FileService';
var fs=require('fs');
var path=require('path');
var cache = {};

/**
 * Return an array of filenames in a folder
 * @param folderpath the path of the folder
 * @param onComplete(list of results,error)
 */
function _getFilenamesInFolder(folderpath,onComplete){
    // TODO async
    var results = [];
    folderpath = path.normalize(folderpath);
    if(cache && cache[folderpath]){
        var value = cache[folderpath];
        console.log(MODULE_NAME + ' cache HIT!');
        onComplete(value,null);
    }
    //console.log(MODULE_NAME + ': _getFilenamesInFolder ' + folderpath);
    fs.readdir(folderpath, function(err,list){
            if (err){
                console.error(MODULE_NAME + ': _getFilenamesInFolder cannot get ' + folderpath + ' files');
                console.log(MODULE_NAME + ': _getFilenamesInFolder cannot get ' + folderpath + ' files');
            } else if (list){
                // TODO verify if each content is a file
                results = list;
                cache[folderpath]=results;
                console.log(MODULE_NAME + ': _getFilenamesInFolder  ' + folderpath + ' files[' + results.toString() + ']');
            } else {
                console.log(MODULE_NAME + ' _getFilenamesInFolder: ' + folderpath + ' is empty');
            }
            onComplete(results,err);
            return results;
    });

}

/**
 * get the path absolute for the application
 * @param inputPath application based
 */
function _getPath(inputPath){
    var normalizedPath = path.normalize(global.__base + inputPath);
    return normalizedPath;
}

/** EXPORTS */
exports.getFilenamesInFolder = _getFilenamesInFolder;
exports.getPath=_getPath;

