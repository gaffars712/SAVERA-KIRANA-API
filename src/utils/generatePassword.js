/* eslint-disable no-plusplus */
/**
 * Generates a random password of the specified length.
 * The password includes uppercase letters, lowercase letters, and digits.
 * 
 * @param {number} length - The length of the password to generate.
 * @returns {string} - The randomly generated password.
 */
function generatePassword(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Exporting the generatePassword function for use in other modules.
module.exports.generatePassword = generatePassword;
