const asyncHandler = require("express-async-handler"); // to handle exceptions in async function
const user = require("../models/userModel");
const generateToken = require("../config/generateToken");
const bcrypt = require("bcrypt");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Some Input fields are Missing" });
  }

  const userExists = await user.findOne({ email });

  if (userExists) {
    return res.status(400).json({ msg: "User Already Exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const Password = await bcrypt.hash(password, salt);

  const User = await user.create({
    name,
    email,
    password: Password,
    pic,
  });

  if (!User) {
    return res.status(400).json({ msg: "Failed to Create User" });
  }

  return res.status(201).json({
    _id: User._id,
    name: User.name,
    email: User.email,
    pic: User.pic,
    token: generateToken(User._id),
  });
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const User = await user.findOne({ email });

  if (!email || !password) {
    return res.status(400).json({ msg: "Kindly Fill all the Input Fields" });
  }

  const check = await bcrypt.compare(password, User.password);

  if (check) {
    return res.status(200).json({
      _id: User._id,
      name: User.name,
      email: User.email,
      pic: User.pic,
      token: generateToken(User._id),
    });
  } else {
    return res.status(400).json({ msg: "Invalid Email Or Password" });
  }
});

const allUser = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const User = await user.find(keyword).find({ _id: { $ne: req.user._id } });

  res.send(User);
});
module.exports = { registerUser, authUser, allUser };
