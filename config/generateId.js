
const { randomBytes } = require("crypto");

const generateId = (length) => {
    const id = randomBytes(length || 6).toString("hex");

    return id?.toUpperCase()
}
module.exports = generateId