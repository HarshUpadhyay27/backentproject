const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signupSchema = new mongoose.Schema({
  fname: {
    type: String,
    require: true,
    minlength: 3,
  },
  lname: {
    type: String,
    require: true,
    minlength: 3,
  },
  email: {
    type: String,
    require: true,
    unique: [true, "Email already Exist"],
    validator(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid Email");
      }
    },
  },
  pnumber: {
    type: Number,
    require: true,
  },
  address: {
    type: String,
  },
  password: {
    type: String,
    require: true,
  },
  cpassword: {
    type: String,
    require: true,
  },
  tokens: [{
    token: {
      type:String,
      require:true
    }
  }]
});

//genrating webtoken
signupSchema.methods.genrateAuthToken = async function () {
  try {
    console.log(this._id);
    const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({token:token})
    // console.log(token)
    await this.save(); 
    return token;
  } catch (e) {
    res.send("the error part is " + e);
  }
};

// convert passsword into hash
signupSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    // console.log(`the current password is ${this.password}`);
    this.password = await bcrypt.hash(this.password, 10);
    // console.log(`the current password is ${this.password}`);
    this.cpassword = undefined;
  }
  next();
});

const Signup = new mongoose.model("Signup", signupSchema);

module.exports = Signup;
