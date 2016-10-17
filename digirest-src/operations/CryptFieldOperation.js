/**
 * Created by Aureliano on 16/09/2016.
 */
/**
 * Created by Aureliano on 25/01/2016.
 * This operation check for duplicates
 */

'use strict';

/** global requires and vars */
const MODULE_NAME = 'CryptFieldOperation';
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _crypt(funcParamObj, onExecuteComplete) {

  /** pre - operations on data */
  let decrypt = funcParamObj.operationRef.conf['params.op.decrypt'];
  let rawData = funcParamObj.payload[funcParamObj.operationRef.conf['params.field.from']];

  if (rawData) {
    let data;
    if (!decrypt) {
      data = _encrypt(JSON.stringify(rawData));
    } else {
      data = _decrypt(rawData);
    }

    funcParamObj.payload[funcParamObj.operationRef.conf['params.field.to'] || funcParamObj.operationRef.conf['params.field.from']] = data;

  }

  onExecuteComplete(null, funcParamObj);

}


/**
 * encrypt
 * @param text
 * @returns {*}
 * @private
 */
function _encrypt(text) {
  var cipher = crypto.createCipher(algorithm, require('../security/SecretConfig').secret);
  var crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex');
  return crypted;
}

/**
 * decrypt
 * @param text
 * @returns {*}
 * @private
 */
function _decrypt(text) {
  var decipher = crypto.createDecipher(algorithm, require('../security/SecretConfig').secret);
  var dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8');
  return dec;
}


/** exports */
exports.crypt = _crypt;
exports.invoke = _crypt;

