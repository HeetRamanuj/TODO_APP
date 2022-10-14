require("dotenv").config();

const express = require("express");
const Joi = require("@hapi/joi");
const bodyParser = require("body-parser");
const JWT = require("jsonwebtoken");

const router = express.Router();
// router.use(express.json());

router.use(bodyParser.json({ extended: true }));
router.use(bodyParser.urlencoded({ extended: true }));

const userSchemaModel = require("../models/usersSchema");

const auth = require("../middleware/check_auth");

router.get("/", (req, res) => {
  console.log("user Router Route -> /");
  res.send("Welcome :- USER ROOT");
});

// SIGN IN

router.post("/signIn", async (req, res) => {
  console.log("user Router Route -> /signIn");

  try {
    const email = req.body.email;
    const password = req.body.password;

    if (email.length > 0 && password.length > 0) {
      // const data = await userSchemaModel.findOne({
      //     email: email,
      //     password: password,
      // });

      const data = await userSchemaModel.findOne({
        email: email,
        password: password,
      });

      console.log("login create token");
      console.log(req.body);

      // Access Token...

      const token = JWT.sign(
        { user_id: data._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "1h",
        }
      );

      data.token = token;
      console.log(token);

      // Refresh Token...

      const refreshToken = JWT.sign(
        { user_id: data._id, email },
        process.env.REFRESH_TOKEN_KEY,
        {
          expiresIn: "3h",
        }
      );

      data.refreshToken = refreshToken;
      console.log(refreshToken);

      const result = [
        {
          email: data.email,
          password: data.password,
        },
      ];

      console.table(result);

      return res.json({
        data: data,
        token: token,
        refreshToken: refreshToken,
        message: "Log In Successfull....",
      });
    } else {
      console.log("Error : Invalid Data...");
      return res.status(401).json({ message: "Invalid Data IF..." });
    }
  } catch (error) {
    console.log("Error : Invalid Data...");
    return res.status(401).json({ message: "Invalid Data..." });
  }

  // res.json({ data: "Welcome :- USER SIGNIN" })
});

// SIGN UP

router.post("/signUp", async (req, res) => {
  console.log("user Router Route -> /signUp");

  // console.log(name)
  // console.log(email)
  // console.log(password)

  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    console.log("\n ==================== \n in \n ==================== \n");

    const oldUser = await userSchemaModel.findOne({ email: email });

    console.log(oldUser);

    if (oldUser !== null) {
      console.log("OLD USER");
      return res.send({
        data: "Error",
        ecode: 401,
      });
    } else {
      console.log("**** Creating User ****");

      const data = await userSchemaModel.create({
        name: name,
        email: email,
        password: password,
      });

      // Create Token...

      console.log("**** Creating Token ****");

      const token = JWT.sign(
        { user_id: data._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "1h",
        }
      );

      data.token = token;

      console.log("\n token = \n ", token, "\n ");

      const result = [
        {
          name: data.name,
          email: data.email,
          password: data.password,
          TOKEN: token,
        },
      ];

      console.log("Createting User...");
      console.table(result);

      console.log("-------------------------------------------");

      return res.json({
        data: data,
        token: token,
        message: "Sign Up Successfullll....",
      });
    }
  } catch (error) {
    console.log(error);
    console.log("catchhhh ===== ");
    return res.status(401).json({ message: "Email Must Be Unique..." });
  }
});

// TEST...

// const middleware = (req, res, next) => {

//     console.log("\n \t Get Users")

//     console.log(" \n \t ADDING VALIDTION \n")

//     const scema = Joi.object({
//         name: Joi.string().min(3).max(30).required
//     })

//     const result = scema.validate(req.body)

//     next()

// }

router.post("/testAddUser", async (req, res, next) => {
  console.log("AddUser... \n");

  // console.log(req.body)

  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  const pattern = "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!#.])";

  const scema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().required().email(),
    password: Joi.string().regex(RegExp(pattern)).min(5).max(20),
  });

  const result = scema.validate(req.body);

  console.log(result);

  if (result.error) {
    return res.json({
      error: "Error : Invalid Credentials...",
    });
  } else {
    return res.json({
      data: req.body,
    });
  }
});

module.exports = router;
