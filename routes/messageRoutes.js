const router = require("express").Router();
const { sendMessage, allMessage } = require("../controller/messageController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").post(protect, sendMessage);
router.route("/:chatId").get(protect, allMessage);

module.exports = router;
