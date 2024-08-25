const { signMainToken } = require("../../config/token");
const knex = require("../../db/knex");





async function getVerifier(id) {
    const verifier = await knex("verifiers")
        .select(
            "_id",
            "_id as id",
            "firstname",
            "lastname",
            knex.raw("CONCAT(firstname,' ',lastname) as name"),
            "email",
            "dob",
            "role",
            "permissions",
            "phonenumber",
            "profile",
            'active',
            'isAdmin'
        )
        .where("_id", id).limit(1).first();


    const { active, isAdmin, permissions, ...rests } = verifier;
    delete rests._id
    const authVerifier = {
        ...rests,
        active: Boolean(active),
        isAdmin: Boolean(isAdmin)

    };


    return authVerifier
}

module.exports = {
    getVerifier
}