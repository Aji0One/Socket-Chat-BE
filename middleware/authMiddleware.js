const jwt = require("jsonwebtoken");
const user = require("../models/userModel");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      //decode token
      const decode = jwt.verify(token, process.env.SECRET_KEY);

      req.user = await user.findById(decode.id).select("-password");

      next();
    } catch (err) {
      res.status(401).json({ msg: "Not Authorized, token Field" });
    }
  }
  if (!token) {
    return res.status(401).json({ msg: "Not Authorized, no token" });
  }
});

module.exports = { protect };
