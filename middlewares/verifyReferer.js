const verifyReferer = (req, res, next) => {
  const referer = req.headers['referer'] || req.headers['Referer'];

  // Define your valid subdomains
  const validSubdomains = [
    'https://gpcpins.onrender.com',
    'https://gpcpins.com',
    'https://www.gpcpins.com',
    'https://admin.gpcpins.com',
    'http://192.168.0.175:5000',
    'http://192.168.0.175:5001',
    'http://localhost:5001',
    'http://localhost:5002',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://127.0.0.1:5001',
    'http://127.0.0.1:5002',
    process.env.CLIENT_URL,
  ];

  // Check if referer header is present and matches any valid subdomain

  if (
    referer &&
    validSubdomains.some((subdomain) => referer?.startsWith(subdomain))
  ) {
    // Do something when the referer is valid
    next();
  } else {
    // Respond with an error or redirect as needed
    res.status(403).send('Forbidden');
  }
};

// Your other routes and middleware go here
module.exports = verifyReferer;
