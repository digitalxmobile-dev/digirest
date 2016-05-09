/**
 * Created by Aureliano on 22/09/2015.
 * This operation create a pipeline with a geonear stage
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'GeoNearPipelineOperation';


/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _addPipeline(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    var operationObj = funcParamObj.operationRef;
    var httpRequest = funcParamObj.request;
    var httpResponse = funcParamObj.response;
    var data = funcParamObj.payload;

    /** operation configuration */
    var pipelineFieldName = operationObj.conf['params.payload.pipelinename.to'] ? operationObj.conf['params.payload.pipelinename.to'] : 'pipeline';
    var geoNearCoordinates = operationObj.conf['params.payload.coordinates.from'];
    var qualifications = operationObj.conf['params.payload.qualifications'].split(',');
    var distancemultiplier = operationObj.conf['params.geonear.distance.multiplier'];
    var spherical = operationObj.conf['params.geonear.spherical'];
    var distanceField  = operationObj.conf['params.geonear.distancefield'];
    var invertCoords = operationObj.conf['params.geonear.flip.coordinates'];
    var maxDistance = operationObj.conf['params.geonear.maxdistance'];

    try {

        // containers
        var pipelineArray = [];
        var geonearStage = {};
        var geonearSubStage = {};

        // crea il near:
        geonearSubStage.near={}
        geonearSubStage.near.type='Point';
        geonearSubStage.near.coordinates=data[geoNearCoordinates];

        // valida la presenza delle coordinate (obbligatorie)
        if(!geonearSubStage.near.coordinates){
            _badRequest(httpResponse)
            return;
        }

        // valuta se convertire le coordinate
        if((typeof geonearSubStage.near.coordinates[0])==='string'){
            geonearSubStage.near.coordinates[0] = parseFloat(geonearSubStage.near.coordinates[0] );
        }
        if((typeof geonearSubStage.near.coordinates[1])==='string'){
            geonearSubStage.near.coordinates[1] = parseFloat(geonearSubStage.near.coordinates[1] );
        }

        // valida i valori delle coordinate
        if(isNaN(geonearSubStage.near.coordinates[0]) || isNaN(geonearSubStage.near.coordinates[1])){
            _badRequest(httpResponse);
            return;
        }

        // inverte le coordinate, se configurato
        if(invertCoords && invertCoords==true){
            var swap = geonearSubStage.near.coordinates[0];
            geonearSubStage.near.coordinates[0] = geonearSubStage.near.coordinates[1];
            geonearSubStage.near.coordinates[1] = swap;
        }


        //distance field:
        if(distanceField) {
            geonearSubStage.distanceField=distanceField;
        }

        //maxdistance
        if(maxDistance){
            geonearSubStage.maxDistance=maxDistance;
        }

        //distance multiplier
        // TODO Bug Mongo Driver? This is ignored
        if(distancemultiplier){
            geonearSubStage.distanceMultiplier=distancemultiplier;
        }

        // spherical
        if(spherical){
            geonearSubStage.spherical=true;
        }

        // query
        var objQualification = {};
        for(var i=0; i<qualifications.length; i++){
            var fieldName = qualifications[i];
            if(!(typeof data[fieldName] === 'undefined')) {
                objQualification[fieldName] = data[fieldName];
            }
        }
        geonearSubStage.query=objQualification;

        // build up togheter
        geonearStage['$geoNear']=geonearSubStage;
        pipelineArray[0] = geonearStage;

        // load in payload
        if(pipelineFieldName) {
            data[pipelineFieldName] = pipelineArray;
        }else{
            data = pipelineArray;
        }

        /** callback with funcParamObj updated - maybe */
        funcParamObj.payload = data;
        onExecuteComplete(null, funcParamObj);

    }catch(error){

        /** dispatch the error to the next op in chain */
        onExecuteComplete(error,funcParamObj);

    }
}

/**
 * manage bad requests
 * @param response
 * @private
 */
function _badRequest(response){
    response.sendStatus(400);
    response.send();
}
/** exports */
exports.addPipeline=_addPipeline;
exports.invoke=_addPipeline;