const express = require("express")

const {getAllPosts, getPostById, createPost, updatePost, deletePost} = require("../controllers/postController")
const {protectRoute, restrictTo} = require("../controllers/authController")

const router = express.Router()

router.route("/all").get(protectRoute, restrictTo("user", "admin"), getAllPosts)
router.route("/:id").get(protectRoute, getPostById)
router.route("/").post(protectRoute, createPost)
router.route("/:id").patch(protectRoute, updatePost)
router.route("/:id").delete(protectRoute, deletePost)

module.exports = router