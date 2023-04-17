const router = require("express").Router();
const {
  registerUser,
  authUser,
  allUser,
} = require("../controller/userController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").post(registerUser).get(protect, allUser);

router.post("/login", authUser);

module.exports = router;
