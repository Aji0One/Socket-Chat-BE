const asyncHandler = require("express-async-handler");
const chat = require("../models/chatModel");
const user = require("../models/userModel");

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ msg: "userId params not sent with req" });
  }

  var isChat = await chat
    .find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await user.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    return res.send(isChat[0]);
  } else {
    const chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createChat = await chat.create(chatData);

      const fullChat = await chat
        .findOne({ _id: createChat._id })
        .populate("users", "-password");

      res.status(200).json(fullChat);
    } catch (err) {
      console.log(err.message);
      res.status(400).json(err.message);
    }
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  await chat
    .find({ users: { $elemMatch: { $eq: req.user._id } } })
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage")
    .sort({ updatedAt: -1 })
    .then(async (results) => {
      results = await user.populate(results, {
        path: "latestMessage.sender",
        select: "name pic email",
      });
      res.status(200).json(results);
    })
    .catch((err) => {
      res.status(400).json(err.message);
    });
});

const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).json({ msg: "Please fill all the Fields" });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .json({ msg: "More Two People are required to form a group" });
  }

  users.push(req.user);

  try {
    const groupChat = await chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await chat
      .findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (err) {
    console.log(err.message);
    res.status(400).json(err.message);
  }
});

const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updateChat = await chat
    .findByIdAndUpdate(chatId, { $set: { chatName } }, { new: true })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updateChat) {
    return res.status(400).json({ msg: "Can't find Group" });
  }

  res.status(200).json(updateChat);
});

const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const add = await chat
    .findByIdAndUpdate(chatId, { $push: { users: userId } }, { new: true })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!add) {
    return res.status(400).json({ msg: "Can't find Chat" });
  }

  res.status(200).json(add);
});

const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const remove = await chat
    .findByIdAndUpdate(chatId, { $pull: { users: userId } }, { new: true })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!remove) {
    return res.status(400).json({ msg: "Can't find Chat" });
  }

  res.status(200).json(remove);
});
module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
