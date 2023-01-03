import User from "../models/User.js";
//import { userModel as Users } from '../models';
import aws from 'aws-sdk';
/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );
    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/*ADD NEW USER ID TO USERS FOLLOWING ARRAY*/

export const follow = async (request, response, next)=> {
  const { user, params: { username } } = request;

  try {
    const { followable, follower } = await User.validateFollowable(user, username);
    await followable.addFollower(follower);
    return Response.send(response, 200, followable, `${MESSAGE.FOLLOW_SUCCESS} ${username}`);
  } catch (error) {
    next(error);
  }
};



/*UNFOLLOW*/

  export const unfollow = async (request, response, next)=>{
    const { user, params: { username } } = request;

    try {
      const { followable, follower } = await User.validateFollowable(user, username);
      const existingFollower = await followable.hasFollowers(follower);
      if (!existingFollower) {
        next(createError(400, MESSAGE.UNFOLLOW_ERROR));
      }

      await followable.removeFollower(follower);
      return Response.send(response, 200, followable, `${MESSAGE.UNFOLLOW_SUCCESS} ${username}`);
    } catch (error) {
      next(error);
    }
  };

/* UPDATE */
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((id) => id !== friendId);
      friend.friends = friend.friends.filter((id) => id !== id);
    } else {
      user.friends.push(friendId);
      friend.friends.push(id);
    }
    await user.save();
    await friend.save();

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );

    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
