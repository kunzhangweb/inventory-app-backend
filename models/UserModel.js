const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please enter a user name"],
    },
    email: {
      type: String,
      required: [true, "Please enter an email address"],
      unique: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
        "Email entered is not valid.",
      ],
    },
    password: {
      type: String,
      required: [true, "Please enter a password"],
      minLength: [6, "The password must contain at least 6 characters"],
      maxLength: [60, "The password must contain no more than 30 characters"],
    },
    photo: {
      type: String,
      required: [true, "A photo is needed"],
      default: "../../frontend/src/assets/JohnDoe.png",
    },
    phone: {
      type: String,
      default: "+646",
    },
    biography: {
      type: String,
      maxLength: [255, "255 characters are enough"],
      default: "bio",
    },
  },
  { timestamps: true }
);

// encrypt user's password before saving it to database
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    // if no password change
    return next(); // jump to next step
  }
  // hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
