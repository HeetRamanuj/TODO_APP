const express = require("express");
const JWT = require("jsonwebtoken");
const router = express.Router();
const config = process.env;

const toDoListModel = require("../models/todoSchema");
const usersModel = require("../models/usersSchema");

const auth = require("../middleware/check_auth");

const generateAccessTokenFromRefreshToken = async (
  refreshToken,
  userEmail,
  req,
  res,
  next
) => {
  console.log("REFERSH TOKEN GENERATION....");

  console.log("\n Refresh Token = ", refreshToken);

  if (!refreshToken) {
    return res
      .status(403)
      .send("A refresh token is require for authentication");
  }

  console.log("\n TRY \n");

  // console.log(refreshToken);

  let userToken = await usersModel
    .find({
      email: userEmail,
    })
    .sort({
      createdAt: -1,
    })
    .limit(1);

  console.log(userToken);

  const refToken = JWT.sign(
    {
      _id: userToken._id,
      userEmail,
    },
    process.env.TOKEN_KEY,
    {
      expiresIn: "1m",
    }
  );

  userToken.token = refToken;
  console.log(refToken);

  const data = await usersModel.findOneAndUpdate(
    {
      email: userEmail,
    },
    {
      $set: {
        refreshToken: refToken,
      },
    }
  );

  console.log(data);
  console.log("\n DONE \n");
};

const verifyToken = (req, res, next) => {
  const userEmail = req.params.current_user;

  // const token = req.headers["authorization"];
  const token = req.headers["x-access-token"];
  const refreshToken = req.headers["x-refresh-token"];

  console.log("\n \t ACCESS TOKEN === ", token); 
  console.log("\n \t refresh token :- ", refreshToken);

  if (!token) {
    return res.status(403).send("A token is require for authentication");
  }
  if (!refreshToken) {
    return res.status(403).send("A refreshToken is require for authentication");
  }

  try {
    // let myToken = token.split(' ');

    // console.log("\n TRY NEW ===  \n", myToken[1]);

    // const decoded = JWT.verify(myToken[1], config.TOKEN_KEY);
    // req.user_id = decoded;

    console.log("\n TRY NEW ===  \n", token);

    // const decoded = JWT.verify(myToken[1], config.TOKEN_KEY);
    const decoded = JWT.verify(token, config.TOKEN_KEY);
    req.user_id = decoded;

    // console.log("\n END \n")
  } catch (error) {
    // return res.status(401).send(error)
    console.log("\n AUTH ERROR \n");

    if (error) {
      try {
        console.log("1");

        const refDecoded = JWT.verify(refreshToken, config.REFRESH_TOKEN_KEY);
        req.user_id = refDecoded;

        console.log("ref token available");
        generateAccessTokenFromRefreshToken(refreshToken, userEmail);
      } catch (error) {
        console.log("error from 2nd catch");
        console.log("\n \t LOG OUT \t \n ");
        return res
          .status(406)
          .send("LOG OUT :- A refreshToken is require for authentication");
      }
    }
  }

  return next();
};

// TO-DO :- Display

router.get("/todo_list/:current_user", verifyToken, async (req, res) => {
  console.log("TODO PICK UP -> ROOT");

  const current_user = req.params.current_user;

  console.log("current_user ===== ", current_user);

  try {
    const data = await toDoListModel
      .find({
        email: current_user,
      })
      .sort({
        creation_todo_date: -1,
      });

    // const { page = 1, limit = 100 } = req.query;

    // const data = await toDoListModel.find({
    //     email: current_user
    // }).sort({
    //     creation_todo_date: -1
    // }).limit(limit * 1).skip((page - 1) * limit)

    // const data = await toDoListModel.find({
    //     email: current_user
    // })

    const result = [
      {
        "Session User Email": data[0].email,
        title: data[0].title,
        description: data[0].description,
        creation_todo_date: data[0].creation_todo_date,
      },
    ];

    data.forEach((i) => {
      result.push({
        title: i.title,
        description: i.description,
        creation_todo_date: i.creation_todo_date,
        email: i.email,
      });
    });

    // console.log("data   =======", data)
    console.log("result   =======", req.params.current_user);
    console.table(result);

    return res.json({
      data: data,
    });
  } catch (error) {
    console.table(error);
    return res.json({
      message: "Error While Displaying TODO LIST........",
    });
  }

  // res.send("TODO PICK UP -> ROOT")
});

// TO-DO: -ADD TODO

router.post("/addTodo", verifyToken, async (req, res) => {
  console.log("TODO PICK UP -> ADD TO-DO");

  // console.log("Data = ", req.params.key)

  const email = req.body.email;
  const title = req.body.title;
  const description = req.body.description;
  const creation_todo_date = req.body.creation_todo_date;

  console.log(typeof creation_todo_date, creation_todo_date);

  try {
    const data = await toDoListModel.create({
      email: email,
      title: title,
      description: description,
      creation_todo_date: creation_todo_date,
    });

    const result = [
      {
        "Session User Email": data.email,
        title: data.title,
        description: data.description,
        creation_todo_date: data.creation_todo_date,
      },
    ];

    console.log("Createting TODO LIST...");
    console.table(result);

    return res.json({
      data: data,
      message: "ToDo Created Successfullll....",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Invalid Data...",
    });
  }
});

// TO-DO :- Update TO-DO

router.put("/updateTodo/:id", verifyToken, async (req, res) => {
  console.log("TODO PICK UP -> UPDATE TO-DO");

  try {
    const id = req.params.id;

    console.log(req.params.id);
    console.log(req.body);

    const title = req.body.title;
    const description = req.body.description;
    const creation_todo_date = req.body.creation_todo_date;

    const updateTodo = await toDoListModel.findOneAndUpdate(
      {
        _id: id,
      },
      {
        title: title,
        description: description,
        creation_todo_date: creation_todo_date,
      },
      {
        new: true,
      }
    );

    return res.json({
      data: req.body,
      data1: updateTodo,
      message: "TO-DO Updated Successfully...",
    });
  } catch (error) {
    console.log("ERROR : Error While Updating Data...");
    return res.json({
      message: "ERROR : Error While Updating Data...",
    });
  }

  // res.send("TODO PICK UP -> UPDATE TO-DO")
});

router.delete("/deleteTodo/:key", verifyToken, async (req, res) => {
  console.log("TODO PICK UP -> DELETE TO-DO");

  try {
    const key = req.params.key;

    const data = await toDoListModel.findOneAndDelete({
      _id: key,
    });

    const result = [
      {
        ID: data._id,
        TITLE: data.title,
        DESCRIPTION: data.description,
      },
    ];

    console.table(result);

    return res.json({
      data: data,
      message: "TO_DO Deleted Successfully...",
    });
  } catch (error) {
    console.log("Error : Error While Deleting TO-DO");
    return res.json({
      message: "Error : Error While Deleting TO-DO",
    });
  }

  // return res.send("TODO PICK UP -> DELETE TO-DO")
});

// SEARCH TODO BY TITILE AND DATE DYNAMIC

router.get("/searchTodo/:current_user/:key", verifyToken, async (req, res) => {
  console.log("TODO PICK UP -> SEARCH TO-DO");

  try {
    const current_user = req.params.current_user;
    const key = req.params.key;

    console.log(key);

    const data = await toDoListModel.find({
      email: current_user,
      // title: { $regex: '.*' + key + '.*' },
      $or: [
        {
          title: {
            $regex: ".*" + key + ".*",
          },
        },
        {
          creation_todo_date: {
            $regex: ".*" + key + ".*",
          },
        },
      ],
    });

    return res.json({
      message: "Data fetched...",
      data: data,
    });
  } catch (error) {
    return res.json({
      message: "Error While Searching...",
    });
  }

  // res.send("TODO PICK UP -> DELETE TO-DO")
});

// SORTING TO - DO   ===> Title Wise

router.get(
  "/getSortedData/:current_user/:sort_type",
  verifyToken,
  async (req, res) => {
    try {
      const key = req.params.sort_type;
      const current_user = req.params.current_user;

      if (key == "ASC" || key == "asc") {
        final_sort_key = 1;
      } else {
        final_sort_key = -1;
      }

      const data = await toDoListModel
        .find({
          email: current_user,
        })
        .sort({
          title: final_sort_key,
        });

      const result = [
        {
          METHOD: key,
          TITLE: data.title,
          DESCRIPTION: data.description,
        },
      ];

      data.forEach((i) => {
        result.push({
          title: i.title,
          description: i.description,
          creation_todo_date: i.creation_todo_date,
          email: i.email,
        });
      });

      console.table(result);

      return res.json({
        data: data,
        message: "Sorted Data Fetched Successfully...",
      });
    } catch (error) {
      console.log("ERROR : Error While Get Sorted Data...");
      return res.json({
        message: "ERROR : Error While Get Sorted Data...",
      });
    }

    // return res.send("Get Sorted Data...")
  }
);

// SORTING TO - DO   ===> DATE Wise

router.get(
  "/getSortedData_Date/:current_user/:sort_type",
  verifyToken,
  async (req, res) => {
    try {
      const key = req.params.sort_type;
      const current_user = req.params.current_user;

      if (key == "ASC" || key == "asc") {
        final_sort_key = 1;
      } else {
        final_sort_key = -1;
      }

      const data = await toDoListModel
        .find({
          email: current_user,
        })
        .sort({
          creation_todo_date: final_sort_key,
        });

      const result = [
        {
          METHOD: key,
          TITLE: data.title,
          DESCRIPTION: data.description,
        },
      ];

      data.forEach((i) => {
        result.push({
          title: i.title,
          description: i.description,
          creation_todo_date: i.creation_todo_date,
          email: i.email,
        });
      });

      console.table(result);

      return res.json({
        data: data,
        message: "Sorted Data Fetched Successfully...",
      });
    } catch (error) {
      console.log("ERROR : Error While Get Sorted Data...");
      return res.json({
        message: "ERROR : Error While Get Sorted Data...",
      });
    }

    // return res.send("Get Sorted Data...")
  }
);

module.exports = router;
