const verifyAdmin = (req, res, next) => {
  const { role } = req?.user;
  const ADMIN_ROLE = parseInt(process.env.ADMIN_ID);
  const ROLE = parseInt(role);
  // console.log(ROLE === ADMIN_ROLE)

  if (ROLE === ADMIN_ROLE) {
    next();
  } else {
    return res.sendStatus(204);
  }
};

module.exports = verifyAdmin;
