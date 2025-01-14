import mongoose from "mongoose";
import bCrypt from "bcryptjs";

const { Schema } = mongoose;

const generateRandomHexColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

const userSchema = new Schema(
  {
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    username: {
      type: String,
      unique: true,
    },
    token: {
      type: String,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    newBalance: {
      type: Number,
      default: 0,
    },
    totalIncome: {
      type: Number,
      default: 0,
    },
    totalExpense: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'manager'],
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    avatarColor: {
      type: String,
      default: generateRandomHexColor
    }
  },
  { versionKey: false, timestamps: true }
);

userSchema.methods.setPassword = async function (password) {
  this.password = await bCrypt.hash(password, 10);
};

userSchema.methods.validatePassword = async function (password) {
  return await bCrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
