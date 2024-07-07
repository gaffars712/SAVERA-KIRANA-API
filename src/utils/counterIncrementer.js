// Importing the Mongoose model for counters
const Counters = require("../modules/counters/counter.modal");

// Async function to increment a counter based on the provided 'name'
const counterIncrementor = async (name) => {
    try {
        // Find and update the counter in the database
        let counter = await Counters.findOneAndUpdate(
            { name: name },
            { $inc: { seq: 1 }, name: name },
            { new: true } // Return the updated document
        );

        // If the counter exists, return the incremented value
        if (counter) {
            return counter.seq;
        } else {
            // If the counter doesn't exist, create a new one and return 1
            await Counters.create({ seq: 1, name: name });
            return 1;
        }
    } catch (error) {
        // Handle errors and return null
        console.error("Error in counterIncrementor:", error);
        return null;
    }
};

// Exporting the counterIncrementor function to be used in other modules
module.exports = counterIncrementor;
