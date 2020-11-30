const mongoose = require("mongoose");
const shortid = require("shortid");
const { resolve } = require("path");
const moment = require("moment");

const time = require("./../lib/timeLib");
const passwordLib = require("./../lib/passwordLib");
const validateInput = require("../lib/paramsValidation");
const check = require("../lib/checkLib");
const token = require("../lib/tokenLib");
const response = require("../lib/response");
const tokenLib = require("../lib/tokenLib");
const checkLib = require("../lib/checkLib");

const AuthModel = mongoose.model("Auth");
const UserModel = mongoose.model("User");
const BlogModel = mongoose.model("Blog");

let signUpFunction = (req, res) => {
  let validateUserInput = () => {
    return new Promise((resolve, reject) => {
      if (req.body.email) {
        if (!validateInput.Email(req.body.email)) {
          reject(response.generate(400, "email does not meet requirments", null));
        } else if (check.isEmpty(req.body.password)) {
          reject(response.generate(400, "password missing", null));
        } else {
          resolve(req);
        }
      } else {
        reject(response.generate(400, "one or more parameters missing", null));
      }
    });
  };
  let createUser = () => {
    return new Promise((resolve, reject) => {
      UserModel.findOne({ email: req.body.email }).exec((err, foundUserDetails) => {
        if (err) {
          reject(response.generate(500, "failed to create user", null));
        } else if (check.isEmpty(foundUserDetails)) {
          let newUser = new UserModel({
            userId: shortid.generate(),
            name: req.body.name,
            email: req.body.email.toLowerCase(),
            password: passwordLib.hashpassword(req.body.password),
            blogs: [],
          });
          newUser.save((err, newUser) => {
            if (err) {
              reject(response.generate(500, "failed to create user", null));
            } else {
              let obj = newUser.toObject();
              resolve(obj);
            }
          });
        } else {
          reject(response.generate(403, foundUserDetails.email + " already exists in our databse", null));
        }
      });
    });
  };
  validateUserInput()
    .then(createUser)
    .then((resolve) => {
      console.log("resolve", resolve);
      delete resolve.password;
      res.send(response.generate(200, "User created", resolve));
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
};

let loginFunction = (req, res) => {
  console.log("[loginFunction]");
  let findUser = () => {
    return new Promise((resolve, reject) => {
      if (req.body.email) {
        UserModel.findOne({ email: req.body.email }).exec((err, userDetails) => {
          if (err) {
            reject(response.generate(500, "failed to find user", null));
          } else if (check.isEmpty(userDetails)) {
            reject(response.generate(400, "no user details found", null));
          } else {
            resolve(userDetails);
          }
        });
      } else {
        reject(response.generate(400, "email parameter missing", null));
      }
    });
  };
  let validatePassword = (userDetails) => {
    return new Promise((resolve, reject) => {
      passwordLib.comparePassword(req.body.password, userDetails.password, (err, isMatch) => {
        if (err) {
          reject(response.generate(400, "login failed", null));
        } else if (isMatch) {
          let isMatchedObj = userDetails.toObject();
          delete isMatchedObj.password;
          delete isMatchedObj._id;
          delete isMatchedObj.__v;
          resolve(isMatchedObj);
        } else {
          reject(response.generate(400, "wrong password, login failed", null));
        }
      });
    });
  };
  let generateToken = (userDetails) => {
    return new Promise((resolve, reject) => {
      tokenLib.generateToken(userDetails, (err, tokenDetails) => {
        if (err) {
          reject(response.generate(400, "failed to generate token", null));
        } else {
          console.log("[generateToken tokenDetails]", tokenDetails);
          tokenDetails.userId = userDetails.userId;
          tokenDetails.userDetails = userDetails;
          resolve(tokenDetails);
        }
      });
    });
  };
  let saveToken = (tokenDetails) => {
    return new Promise((resolve, reject) => {
      AuthModel.findOne({ userId: tokenDetails.userId }).exec((err, retrievedTokenDetails) => {
        if (err) {
          reject(response.generate(400, "failed to save token", null));
        } else if (checkLib.isEmpty(retrievedTokenDetails)) {
          let newAuthToken = new AuthModel({
            userId: tokenDetails.userId,
            token: tokenDetails.token,
            tokenSecret: tokenDetails.tokenSecret,
            tokenGeneratedTime: time.now(),
          });
          newAuthToken.save((err, newTokenDetails) => {
            if (err) {
              reject(response.generate(400, "failed to generate fresh token", null));
            } else {
              resolve({ authToken: newTokenDetails.authToken, userDetails: tokenDetails.userDetails });
            }
          });
        } else {
          retrievedTokenDetails.authToken = tokenDetails.authToken;
          retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret;
          retrievedTokenDetails.tokenGenerationTime = time.now();
          retrievedTokenDetails.save((err, newTokenDetails) => {
            if (err) {
              reject(response.generate(400, "failed to generate token for existing token", null));
            } else {
              resolve({ authToken: newTokenDetails.authToken, userDetails: tokenDetails.userDetails });
            }
          });
        }
      });
    });
  };
  findUser()
    .then(validatePassword)
    .then(generateToken)
    .then(saveToken)
    .then((resolve) => {
      res.send(response.generate(200, "Login successfull", resolve));
    })
    .catch((err) => {
      reject(response.generate(500, "Something went wrong", null));
    });
};

let addBlog = (req, res) => {
  let findUser = () =>
    new Promise((resolve, reject) => {
      console.log("FIND USERRRRRRRRRRRRRRR");
      return UserModel.findOne({ userId: req.body.userId }, (err, result) => {
        if (err) {
          reject({ code: 500, message: err });
        } else if (!result) {
          reject({ code: 404, message: "No Data Found" });
        } else {
          resolve(result);
        }
      });
    });

  let addUserBlogs = (foundUser) =>
    new Promise((resolve, reject) => {
      console.log("FIND updateBlog");
      let newBlog = new BlogModel({
        blogId: shortid.generate(),
        title: req.body.title,
        userId: req.body.userId,
        description: req.body.description,
        isPublished: true,
        created: moment().unix(),
        lastModified: moment().unix(),
        postedUserId: String(foundUser._id),
      });

      return BlogModel.create(newBlog, (err, blogRes) => {
        if (err) {
          reject(err);
        }
        resolve(blogRes);
      });
    });

  let updateUser = (blog) =>
    new Promise((resolve, reject) => {
      return UserModel.findOneAndUpdate(
        { userId: req.body.userId },
        { $push: { blogs: String(blog._id.toString()) } },
        { new: true },
        (err, result) => {
          if (err) {
            reject(err);
          }
          console.log(result);
          resolve(result);
        }
      );
    });

  return findUser()
    .then(addUserBlogs)
    .then(updateUser)
    .then((data) => {
      res.send(response.generate(200, "sucess", data));
    })
    .catch((err) => {
      console.log("err....", err);
      if (err instanceof Error) {
        res.send(response.generate(500, "Internal Server Error"));
      }
      res.send(response.generate(err.code, err.message));
    });
};

module.exports = {
  signUpFunction: signUpFunction,
  loginFunction: loginFunction,
  addBlog: addBlog,
};
