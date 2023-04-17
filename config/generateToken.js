const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  const create = jwt.sign({ id }, process.env.SECRET_KEY, { expiresIn: "15d" });
  return create;
};

module.exports = generateToken;
