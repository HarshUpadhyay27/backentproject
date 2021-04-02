const dotenv = require('dotenv')
const express = require("express");
const path = require("path");
const hbs = require("hbs");
const app = express();
const bcrypt = require('bcryptjs')
const port = process.env.PORT || 5000;
require("./db/conn");
const Signup = require("./models/signup");
const cookieParser = require("cookie-parser")
const auth = require('./middleware/auth')

dotenv.config({path:"./config.env"})

app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }));

app.post("/signup", async (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.cpassword;
    if (password === cpassword) {
      const sigupPeople = new Signup({
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        address: req.body.address,
        phone: req.body.phone,
        password: password,
        cpassword: cpassword,
      });

      // console.log(sigupPeople)

      // create json web token
      const token = await sigupPeople.genrateAuthToken();
      // console.log('the token part' + token);

      // the cookies syntex
      // res.cookie(name, value, [Option])

      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 600000),
        httpOnly:true
      })

      const signup = await sigupPeople.save();
      res.status(201).render("index");
    } else {
      res.send("Password is not matching");
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

app.post("/signin", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const useremail = await Signup.findOne({ email: email });
    const isMatch = await bcrypt.compare(password, useremail.password)

    // create json web token
    const token = await useremail.genrateAuthToken();
    // console.log('the token part' + token);

    // cookies 
    res.cookie("jwt", token, {
      expires:new Date(Date.now() +600000),
      httpOnly:true
    })

    if(isMatch){
        res.status(201).render('index')
    }else{
        res.send('Inavlid details')
    }
    // console.log(useremail)
  } catch (error) {
      res.status(400).send('Invalid Details')
  }
});

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partial_path = path.join(__dirname, "../templates/partials");

app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partial_path);

app.use(express.static(static_path));

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/about", auth, (req, res) => {
  // console.log(req.cookies.jwt)
  res.render("about");
});
app.get("/signup", (req, res) => {
  res.render("signup");
});
app.get("/signin", (req, res) => {
  res.render("signin");
});
app.get("/logout",auth , async (req, res) => {
  try {
    // console.log(req.user)

    //delete from mongodb
    req.user.tokens=req.user.tokens.filter((currElem)=>{
      return currElem.token !== req.token
    })

    // //logout from all device
    // req.user.tokens = []

    res.clearCookie("jwt")
    console.log('logout successfully')
    await req.user.save()
    res.render('signin')
  } catch (error) {
    res.status(500).send(error)
  }
});

app.listen(port, () => {
  console.log(`server is running at port ${port}`);
});