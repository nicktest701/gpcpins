
const { randomBytes } = require("crypto");

const generateId = (length) => {
    const id = randomBytes(length || 8).toString("hex");

    return id
}
module.exports = generateId