const verifyAdminORAgent = (req, res, next) => {
  const { role } = req?.user;

  if (!role || ![process.env.ADMIN_ID, process.env.AGENT_ID].includes(role)) {
    return res.sendStatus(204);
  }

  next();
};

module.exports = verifyAdminORAgent;
