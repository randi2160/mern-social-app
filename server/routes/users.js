import express from "express";
import {
  getUser,
  getUserFriends,
  addRemoveFriend,
  follow,
  unfollow
} from "../controllers/users.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/:id", verifyToken, getUser);
router.get("/:id/friends", verifyToken, getUserFriends);

/* UPDATE */
router.patch("/:id/:friendId", verifyToken, addRemoveFriend);
router.post('/:id/:friendId/follow', verifyToken, follow);

router.post(
  '/:id/:friendId/unfollow',verifyToken,unfollow);
/*
router.get(
  '/profiles/followers',
  middlewares.authenticate,
  followersController.followers
);

router.get(
  '/profiles/following',
  middlewares.authenticate,
  followersController.followers
);*/

export default router;
