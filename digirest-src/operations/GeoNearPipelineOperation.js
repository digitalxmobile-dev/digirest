/**
 * Created by Aureliano on 22/09/2015.
 * This operation create a pipeline with a geonear stage
 */

'use strict';

/** global requires and vars */
const MODULE_NAME = 'GeoNearPipelineOperation';


/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _addPipeline(funcParamObj, onExecuteComplete) {

  /** default object content of an operation */
  let operationObj = funcParamObj.operationRef;
  let httpResponse = funcParamObj.response;
  let data = funcParamObj.payload;

  /** operation configuration */
  let pipelineFieldName = operationObj.conf['params.payload.pipelinename.to'] ? operationObj.conf['params.payload.pipelinename.to'] : 'pipeline';
  let geoNearCoordinates = operationObj.conf['params.payload.coordinates.from'];
  let qualifications = operationObj.conf['params.payload.qualifications'].split(',');
  let distancemultiplier = operationObj.conf['params.geonear.distance.multiplier'];
  let spherical = operationObj.conf['params.geonear.spherical'];
  let distanceField = operationObj.conf['params.geonear.distancefield'];
  let invertCoords = operationObj.conf['params.geonear.flip.coordinates'];
  let maxDistance = operationObj.conf['params.geonear.maxdistance'];


  // containers
  let pipelineArray = [];
  let geonearStage = {};
  let geonearSubStage = {};

  // crea il near:
  geonearSubStage.near = {}
  geonearSubStage.near.type = 'Point';
  geonearSubStage.near.coordinates = data[geoNearCoordinates];

  // valida la presenza delle coordinate (obbligatorie)
  if (!geonearSubStage.near.coordinates) {
    _badRequest(httpResponse)
    return;
  }

  // valuta se convertire le coordinate
  if ((typeof geonearSubStage.near.coordinates[0]) === 'string') {
    geonearSubStage.near.coordinates[0] = parseFloat(geonearSubStage.near.coordinates[0]);
  }
  if ((typeof geonearSubStage.near.coordinates[1]) === 'string') {
    geonearSubStage.near.coordinates[1] = parseFloat(geonearSubStage.near.coordinates[1]);
  }

  // valida i valori delle coordinate
  if (isNaN(geonearSubStage.near.coordinates[0]) || isNaN(geonearSubStage.near.coordinates[1])) {
    _badRequest(httpResponse);
    return;
  }

  // inverte le coordinate, se configurato
  if (invertCoords && invertCoords == true) {
    let swap = geonearSubStage.near.coordinates[0];
    geonearSubStage.near.coordinates[0] = geonearSubStage.near.coordinates[1];
    geonearSubStage.near.coordinates[1] = swap;
  }


  //distance field:
  if (distanceField) {
    geonearSubStage.distanceField = distanceField;
  }

  //maxdistance
  if (maxDistance) {
    geonearSubStage.maxDistance = maxDistance;
  }

  //distance multiplier
  // TODO Bug Mongo Driver? This is ignored
  if (distancemultiplier) {
    geonearSubStage.distanceMultiplier = distancemultiplier;
  }

  // spherical
  if (spherical) {
    geonearSubStage.spherical = true;
  }

  // query
  let objQualification = {};
  for (let i = 0; i < qualifications.length; i++) {
    let fieldName = qualifications[i];
    if (!(typeof data[fieldName] === 'undefined')) {
      objQualification[fieldName] = data[fieldName];
    }
  }
  geonearSubStage.query = objQualification;

  // build up togheter
  geonearStage['$geoNear'] = geonearSubStage;
  pipelineArray[0] = geonearStage;

  // load in payload
  if (pipelineFieldName) {
    data[pipelineFieldName] = pipelineArray;
  } else {
    data = pipelineArray;
  }

  /** callback with funcParamObj updated - maybe */
  funcParamObj.payload = data;
  onExecuteComplete(null, funcParamObj);

}

/**
 * manage bad requests
 * @param response
 * @private
 */
function _badRequest(response) {
  response.sendStatus(400);
  response.send();
}
/** exports */
exports.addPipeline = _addPipeline;
exports.invoke = _addPipeline;