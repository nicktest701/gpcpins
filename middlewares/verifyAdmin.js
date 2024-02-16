const verifyAdmin = (req, res, next) => {
  const { role } = req?.user;

  if (!role || role !== process.env.ADMIN_ID) {
    return res.sendStatus(204);
  }

  next();
};

module.exports = verifyAdmin;
