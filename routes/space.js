const express = require("express");
const router = express.Router();

const {
  getSpaceById,
  getSpace,
  getAllSpaces,
  createSpace,
  updateSpace,
  removeSpace,
} = require("../controllers/space.js");
const { isSignedIn, isAuthenticated } = require("../controllers/auth.js");

router.param("spaceId", getSpaceById);

router.get("/space/:spaceId", isSignedIn, isAuthenticated, getSpace);
router.get("/spaces", isSignedIn, isAuthenticated, getAllSpaces);
router.post("/space", createSpace);
router.put("/space/:spaceId", updateSpace);
router.delete("/space/:spaceId", removeSpace);

module.exports = router;
