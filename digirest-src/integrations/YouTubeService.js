/**
 * Created by Aureliano on 01/12/2015.
 * This file manage youtube integrations
 */


var MODULE_NAME = 'YouTubeService';
var API_KEY = 'AIzaSyCSeL3oaHjdhWOqHAX8qsU7X8nW5Jps82Y';
var YOUTUBE_ROUTE = 'https://www.googleapis.com/youtube/v3'
//var Youtube = require('youtube-api');
var https = require('https');
var request = require('request');

/**
 * get single info about a video
 * @param videoId
 * @param onGetComplete
 * @private
 */
function _getVideoItem(videoId,onGetComplete){

    // create path
    var  path = YOUTUBE_ROUTE + '/videos?part=contentDetails,snippet&fields=items&key=' + API_KEY + '&id=' + videoId;
    //GET https://www.googleapis.com/youtube/v3/videos?part=snippet&id=vTpQZoKWyv4&fields=items&key={YOUR_API_KEY}

    console.log(MODULE_NAME + ': request for video to YT ' + videoId );

    // create request object
    var options = {
        url : path,
        method : 'GET'
    };

    request(
        options,
        function onGet(err,res,body){
            if(!err){
                if(body){
                    body = JSON.parse(body);
                }
                // get video information
                var ret = {};
                if(_existVideo(body)){
                    ret = body.items[0];
                }
                onGetComplete(null,ret);
            }else{
                console.error(JSON.stringify(err));
                onGetComplete(err,null);
            }
        }
    )

}

/**
 * external function of the recursive one
 * @param playlistId
 * @param onGetComplete
 * @private
 */
function _getPlaylistItems(playlistId,onGetComplete){
    _getPlaylistItemsRecursive(playlistId,null,null,onGetComplete)
}

/**
 * Inner method of getPLaylistItem - recursive
 * @param playlistId
 * @param nextPageToken
 * @param videoArray
 * @param onGetComplete
 * @private
 */
function _getPlaylistItemsRecursive(playlistId,nextPageToken,videoArray,onGetComplete) {

    // create path
    var  path = YOUTUBE_ROUTE + '/playlistItems?part=snippet&fields=items%2Fsnippet%2CnextPageToken&key=' + API_KEY + '&playlistId=' + playlistId;
    //GET https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=PLcdldg7-_SUH_bl3pwEMK83mHTU0_-HNe&fields=items%2Fsnippet%2CnextPageToken&key={YOUR_API_KEY}

    // if is not the first page, put the token
    if(nextPageToken){
        path = path + '&pageToken=' + nextPageToken;
        console.log(MODULE_NAME + ': request for page ' + nextPageToken );
    }else{
        console.log(MODULE_NAME + ': request for first page of  ' + playlistId );
    }

    // init the array, if needed
    if(!videoArray){
        videoArray = [];
    }

    // create request object
    var options = {
        url : path,
        method : 'GET'
    };

    request(
        options,
        function onGet(err,res,body){
            if(!err){
                if(body){
                    body = JSON.parse(body);
                }
                // extract videos id
                videoArray = _getVideosFromPlaylist(body,videoArray);
                console.log(MODULE_NAME + ': readed playlist - got videos ' +  videoArray);
                if(body && body.nextPageToken){
                    // recur if there are more pages
                    _getPlaylistItemsRecursive(playlistId,body.nextPageToken,videoArray,onGetComplete);
                }else{
                    // else, complete
                    onGetComplete(null,videoArray);
                }
            }else{
                console.error(JSON.stringify(err));
                onGetComplete(err,null);
            }
        }
    )

}

/**
 * read playlistItem server response and extract in array
 * @param serverResp
 * @param videoArray
 * @returns {*}
 * @private
 */
function _getVideosFromPlaylist(serverResp,videoArray){
    if(serverResp && serverResp.items){
        for(var iterator in serverResp.items){
            var item = serverResp.items[iterator];
            if(item && item.snippet && item.snippet.resourceId && item.snippet.resourceId.videoId){
                videoArray.push(item.snippet.resourceId.videoId);
            }
        }
    }
    return videoArray;
}

/**
 * test if exist basic video informations
 * @param body
 * @returns {*|DataTransferItemList}
 * @private
 */
function _existVideo(body){
    return (body.items && body.items && body.items[0] && body.items[0].snippet && body.items[0].snippet.title);
}

/** Exports */
exports.getPlaylistItems=_getPlaylistItems;
exports.getVideoItem=_getVideoItem;