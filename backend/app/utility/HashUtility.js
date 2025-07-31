const crypto = require('crypto');

// Secret key shared with the offerwall company
const SECRET_KEY = 'your-secret-key-here'; // Replace with your actual secret key

function verifyHash(params, receivedHash) {
    // Combine parameters in a specific order as instructed by the offerwall
    const stringToHash = `${params.userID}|${params.transactionID}|${params.revenue}|${SECRET_KEY}`;

    // Generate the hash using HMAC with SHA256
    const generatedHash = crypto.createHmac('sha256', SECRET_KEY)
        .update(stringToHash)
        .digest('hex');

    // Compare the generated hash with the received hash
    return generatedHash === receivedHash;
}

module.exports = { verifyHash };
