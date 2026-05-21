const db = require("../config/knex");

async function saveRefreshToken(userId, refreshToken, expiresAt) {
  await db("user_tokens").insert({
    user_id: userId,
    refresh_token: refreshToken,
    expiresAt,
  });
}

async function findRefreshToken(token) {
  return db("user_tokens")
    .where({ refresh_token: token })
    .first();
}

async function deleteRefreshToken(token) {
  return db("user_tokens")
    .where({ refresh_token: token })
    .delete();
}

module.exports = {
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
};