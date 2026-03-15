const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const watchlistItemSchema = new mongoose.Schema(
  {
    tmdbId: {
      type: Number,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ["movie", "tv"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    posterPath: {
      type: String,
      default: "",
    },
    backdropPath: {
      type: String,
      default: "",
    },
    overview: {
      type: String,
      default: "",
    },
    releaseDate: {
      type: String,
      default: "",
    },
    voteAverage: {
      type: Number,
      default: 0,
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    watchlist: {
      type: [watchlistItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword(
  candidatePassword,
) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
