const verifyScanner = (req, res, next) => {
  const { role } = req?.user;


  if (!role || Number(role) !== Number(process.env.SCANNER_ID)) {
    return res.sendStatus(204);
  }

  next();
};

module.exports = verifyScanner;
