/**
 * This file manage all the external configurations
 * Author: Aureliano
 */
"use strict";

/** global requires and vars */
const MODULE_NAME = 'BasicConfigurationService';
const PROPERTIES_SUFFIX = '.properties';
const PropertiesReader = require('properties-reader');
const AdvancedString = require('string');

/** singleton enforcer */
let singleton = Symbol();
let singletonEnforcer = Symbol();


/**
 * Basic Configuration Service
 */
class BasicConfigurationService {

  /**
   * constructor
   */
  constructor(enforcer) {
    // singleton enforcer pattern
    if (enforcer != singletonEnforcer) {
      throw "Cannot construct singleton";
    }
    this._properties = null;
    this.initcomplete = false;
    this.fileService = require('../objectFactory/ObjectFactory').fileService;
  }

  /**
   * get the instance
   * @returns {*}
   */
  static get instance() {
    if (!this[singleton]) {
      this[singleton] = new BasicConfigurationService(singletonEnforcer);
    }
    return this[singleton];
  }

  /**
   * Return if the configuration service is initiated
   * @returns {boolean} if the configuration service is initiated
   */
  isInit() {
    return this.initcomplete;
  }

  /**
   * Init the configuration services
   * @param propertiesLocation the location of the properties files
   * @param onInitComplete
   */
  init(propertiesLocation, onInitComplete) {
    let th = this;
    if (this.isInit() && (this.propertiesLocation == propertiesLocation)) {
      // INIT OK
      onInitComplete(null, true);
    } else {
      // configure location on this
      this.propertiesLocation = propertiesLocation;
      this.propertiesLocationPath = this.fileService.getPath(propertiesLocation);

      // get the files in the folder
      this.fileService.getFilenamesInFolder(
        this.propertiesLocationPath,
        function onFilesRead(error, files) {

          if (files) {
            // iterate through files
            files.forEach(
              function (filename) {
                // is it a property?
                var fileNameStr = AdvancedString(filename);
                if (fileNameStr && fileNameStr.endsWith(PROPERTIES_SUFFIX)) {
                  // if is a properties file, load it
                  if (th._properties) {
                    // append
                    th._properties.append(th.propertiesLocationPath + filename);
                  } else {
                    // init
                    th._properties = PropertiesReader(th.propertiesLocationPath + filename);
                  }
                  console.log(MODULE_NAME + ': properties file loaded [' + th.propertiesLocationPath + filename + ']');
                }
              });

            // ok
            global.__properties = th._properties;
            th.initcomplete = true;

            // calback
            onInitComplete(null, true);
          } else if (error) {
            // error
            onInitComplete(error, false);
          } else {
            // empty file list
            onInitComplete(Error("no properties file in folder" + th.propertiesLocationPath), false);
          }


        });

    }
  }

  /**
   * get a property
   * @param key the key of the property
   * @param onGetComplete
   */
  getProperty(key, onGetComplete) {
    if (this.initcomplete) {
      let value = this._properties.get(key);
      onGetComplete(null, value);
    } else {
      console.log(MODULE_NAME + " getProperty: properties not init-ed");
      onGetComplete(new Error(MODULE_NAME + ' not initiated', null));
    }
  }

  /**
   * get a property array data
   * @param key
   * @param onGetComplete
   */
  getPropertiesArray(key, onGetComplete) {
    // get the complete property and split
    this.getProperty(key, function (error, value) {
      if (value) {
        // split and return
        let valueArray = value.split(',');
        onGetComplete(null, valueArray);
      } else if (error) {
        // error
        onGetComplete(error, null);
      } else {
        // not found, return null
        onGetComplete(null, null);
      }
    });
  }

  /**
   * get a property json complete
   * @param root
   * @param onGetComplete
   */
  getPropertiesJsonByRoot(root, onGetComplete) {
    if (this.initcomplete) {
      let jsonObj = this._properties.getByRoot(root)
      onGetComplete(null, jsonObj);
    } else {
      console.log(MODULE_NAME + " getProperty: properties not init-ed");
      onGetComplete(new Error(MODULE_NAME + ' not initiated', null));
    }
  }
}

/**
 * exports
 */
module.exports = BasicConfigurationService;

