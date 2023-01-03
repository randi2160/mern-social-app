import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    lastName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 5,
    },
    picturePath: {
      type: String,
      default: "",
    },
    friends: {
      type: Array,
      default: [],
    },
    
    location: String,
    occupation: String,
    viewedProfile: Number,
    impressions: Number,
  },
  
  { timestamps: true }
);



const User = mongoose.model("User", UserSchema);
User.associate = (models) => {
  User.hasOne(models.Profile, { foreignKey: 'userId' });
  User.belongsToMany(models.User, {
    foreignKey: 'userId',
    as: 'followers',
    through: models.UserFollowers
  });
  User.belongsToMany(models.User, {
    foreignKey: 'followerId',
    as: 'following',
    through: models.UserFollowers
  });
};
export default User;
