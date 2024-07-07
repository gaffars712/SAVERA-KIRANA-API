/**
 * Utility function to create a new object composed of selected properties from an input object.
 * @param {Object} object - The source object from which properties are picked.
 * @param {string[]} keys - An array of property keys to pick from the source object.
 * @returns {Object} - A new object containing only the selected properties.
 */
const pick = (object, keys) => {
  // Use the reduce function to iterate over the keys and build the new object.
  return keys.reduce((obj, key) => {
    // Check if the key exists in the source object before adding it to the new object.
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      // eslint-disable-next-line no-param-reassign
      obj[key] = object[key]; // Copy the selected property to the new object.
    }
    return obj;
  }, {});
};

// Export the pick function for use in other modules.
module.exports = pick;
