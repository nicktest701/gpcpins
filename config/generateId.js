
const { randomBytes } = require("crypto");

const generateId = (length) => {
    const id = randomBytes(length || 10).toString("hex");

    return id?.toUpperCase()
}
module.exports = generateId