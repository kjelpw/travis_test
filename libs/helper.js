/**
	Copyright 2019 University of Denver

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.

	You may obtain a copy of the License at
	http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

const config = require('../config/' + process.env.CONFIGURATION_FILE);
const Kaltura = require('../libs/kaltura');
const sanitizeHtml = require('sanitize-html');

/*
 * 
 */
exports.testObject = function(object) {
	return (object && typeof object != "undefined");
}

/*
 * 
 */
exports.getDateMonthString = function(monthVal) {
  const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
  ];
  return monthNames[monthVal];
}

/*
 * 
 */
exports.isParentObject = function(object) {
  return (object && (object.is_compound == true || object.object_type == "compound" || object.type == "compound"));
}

/*
 * 
 */
exports.isObjectEmpty = function(object) {
	for(var key in object) {
        if(object.hasOwnProperty(key))
            return false;
    }
    return true;
}

/*
 * 
 */
exports.removeHtmlEntities = function(string) {
	return string.replace(/&amp;/g, "").replace(/&lt;/g, "").replace(/&gt;/g, "").replace(/&quot;/g, "");
}

/*
 * data can be a string or an array of strings, single or multi dimension 
 */
var stripHtmlTags = function(data) {
	if(typeof data == "string") {
		data = data.replace(/<\/{0,1}[a-zA-Z]+>/g, "");
	}
	else if(typeof data == "object") {
		for(var index in data) {
			if(typeof data[index] == "string") {
				data[index] = data[index].replace(/<\/{0,1}[a-zA-Z]+>/g, "");
			}
			else if(typeof data[index] == "object") {
				stripHtmlTags(data[index]);
			}
		}
	}

	return data;
}
exports.stripHtmlTags = stripHtmlTags;

/*
 * 
 */
exports.sanitizeHttpParamsObject = function(object) {
	for(var key in object) {
		if(typeof object[key] == 'object') {
			for(index in object[key]) {
				if(key == "f") {
					for(facet in object[key][index]) {
						object[key][index][facet] = sanitizeHtml(object[key][index][facet]);
					}
				}
				else {
					object[key][index] = sanitizeHtml(object[key][index]);
				}
			}
		}
		else {
			object[key] = sanitizeHtml(object[key]);
		}
	}
}

exports.getCompoundObjectPart = function(object, partIndex) {
	var parts = [],
		objectPart = null;
		
	// Get the parts array	
	if(object.parts) {
		parts = object.parts;
	}
	else if(object.compound) {
		parts = object.compound;
	}
	else if(object[config.displayRecordField] && object[config.displayRecordField].parts) {
		parts = object[config.displayRecordField].parts;
	}

	if(partIndex == -1) {
		objectPart = parts;
	}
	else if(parts.length > 0 && parts[partIndex-1]) {
		objectPart = parts[partIndex-1];
	}

	return objectPart;
}

var getFileExtensionFromFilePath = function(filename) {
  let extIndex = filename.lastIndexOf("."),
      extension = filename.substring(extIndex+1);
  return extension;
}
exports.getFileExtensionFromFilePath = getFileExtensionFromFilePath;

/**
 * Return the file extension that a mimetype is associated with
 *
 * @param {String} mimeType - Object mime type (ex "audio/mp3")
 * @return {String} file extension
 */
var getFileExtensionForMimeType = function(mimeType) {
	var extension = null;
	for(key in config.fileExtensions) {
      if(config.fileExtensions[key].includes(mimeType)) {
      	extension = key;
        break;
      }
    }
    return extension;
}
exports.getFileExtensionForMimeType = getFileExtensionForMimeType;

 /**
 * Finds the DDU object type that corresponds with an object's mime type
 *
 * @param {String} mimeType - Object mime type (ex "audio/mp3")
 * @return {String} DDU object type
 */
var getObjectType = function(mimeType) {
  let type = "";
  for(var key in config.objectTypes) {
    if(config.objectTypes[key].includes(mimeType)) {
      type = key;
    }
  }
  return type;
}
exports.getObjectType = getObjectType;

 /**
 * Finds the DDU object type that corresponds with an object's mime type
 *
 * @param {String} extension - a file extension (no '.' prefix)
 * @return {Boolean} true if extension is valid (in configuration) false if not recognized 
 */
var isValidExtension = function(extension) {
	let isValid = false;
	for(var key in config.fileExtensions) {
		if(extension == key) {
			isValid = true;
		}
	}
	return isValid;
}
exports.isValidExtension = isValidExtension;

 /**
 * Returns the HTTP response "content-type" for an object, based on its object file extension TODO: move to AH
 *
 * @param {String} datastream - Object datastream ID
 * @param {String} mimeType - Object mime type (ex "audio/mp3")
 * @return {String} HTTP content type
 */
var getContentType = function(datastream, object, part, mimeType) {
  // Default content type
  var contentType = "application/octet-stream";
  if(part && object.display_record.parts) {
    part = parseInt(part);
    object = object.display_record.parts[part-1] || null;
  }
  // Thumbnail datastream, use specified file type
  if(datastream.toLowerCase() == "tn") {
    contentType = "image/" + config.thumbnailFileExtension || "jpg";
  }
  // File type specific datasreeam (mp3, jpg, etc)
  else if(datastream.toLowerCase() != "object") {
    contentType = config.contentTypes[datastream] || "";
  }
  // Determine the file type via the object path file extension
  else if(object && object.object) {
    let ext = getFileExtensionFromFilePath(object.object);
    contentType = config.contentTypes[ext] || "";

  }
  return contentType;
}
exports.getContentType = getContentType;

 /**
 * Finds the DDU datastream ID that corresponds with an object's mime type
 *
 * @param {String} mimeType - Object mime type (ex "audio/mp3")
 * @return {String} DDU datastream ID
 */
exports.getDsType = function(mimeType) {
  let datastreams = config.datastreams,
      datastream = "",
      objectType = null;

  for(var key in datastreams) {
    if(datastreams[key].includes(mimeType)) {
      datastream = key;
    }
  }

  return datastream;
}