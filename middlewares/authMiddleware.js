// const jwt = require("jsonwebtoken");

// const authenticateToken = (req, res, next) => {
//   // Retrieve the token from the Authorization header
//   const token = req.cookies.authToken;
//   // const token = authHeader && authHeader.split(" ")[1]; // Expect 'Bearer <token>'
//   if (!token) {
//     return res.status(401).json({ message: "Access Denied: No Token Provided", success: false });
//   }
//   // Verify the token
//   jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
//     if (err) {
//       return res.status(403).json({ message: "Invalid or Expired Token", success: false });
//     }
//     // Attach user information to the request object
//     req.user = user;
//     next();
//   });
// };

// module.exports = authenticateToken;
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  // 🔹 Get token from `cookies` OR `Authorization` header
  const token = req.cookies.authToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access Denied: No Token Provided", success: false });
  }

  // 🔹 Verify the token
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or Expired Token", success: false });
    }
    req.user = user; // ✅ Attach user info to request
    next();
  });
};

module.exports = authenticateToken;
