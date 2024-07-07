
function convertToJSON(str) {
    var str1 = str.replace(/[{}]/g, '');
    var properties = str1.split(',');
    var obj = {};
    properties.forEach(function(property) {
        var tup = property.split(':');
        obj[tup[0]] = tup[1];
    });
    return obj;
}

module.exports = {
    convertToJSON
};
/*
  This JavaScript file exports a utility function for converting a string representation
  of a simple key-value pair object into a JavaScript object in JSON format.

  Usage:
  The 'convertToJSON' function takes a string as input, removes curly braces ('{}'),
  splits the string into key-value pairs, and constructs a JavaScript object with
  these pairs. The resulting object is returned in JSON format.

  Example:
  Input: "{name: 'John', age: 25, city: 'New York'}"
  Output: { name: 'John', age: '25', city: 'New York' }

  Note:
  - This function assumes a simple key-value pair format without nested structures.
  - It may not handle all edge cases, and additional validation may be needed
    depending on the specific use case.

  Author: [Your Name]
  Date: [Current Date]
*/