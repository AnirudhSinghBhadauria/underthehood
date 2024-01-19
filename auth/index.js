const express = require("express");
const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const port = process.env.SERVER_PORT;
const app = express();

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
});

const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  imageLink: String,
  published: Boolean,
});

const User = mongoose.model("User", userSchema);
const Admin = mongoose.model("Admin", adminSchema);
const Course = mongoose.model("Course", courseSchema);

mongoose.connect(process.env.CONNECT_MONGODB, {
  dbName: "course-selling-db",
});

app.use(bodyParser.json());

const generateAdminToken = (payload) => {
  const token = jwt.sign(payload, process.env.ADMIN_JWT_SECRET);
  return token;
};

const generateUserToken = (payload) => {
  const token = jwt.sign(payload, process.env.USER_JWT_SECRET);
  return token;
};

const adminAuth = async (req, res, next) => {
  const adminAuthorization = req.headers.authorization;
  const token = adminAuthorization.split(" ")[1];

  const adminVerification = jwt.verify(
    token,
    process.env.ADMIN_JWT_SECRET,
    async (err, username) => {
      console.log(`username by jwt: ${username}`);
      const admin = await Admin.findOne({ username });

      if (err || !admin) {
        res.status(403).json({
          message: "Admin access denied!",
        });
      } else {
        console.log(`${admin.username} is logged in!`);
        console.log(admin);
        req.admin = admin;
        next();
      }
    },
  );
};

const userAuth = async (req, res, next) => {
  const userAutherization = req.headers.authorization;
  const token = userAutherization.split(" ")[1];

  const userVerfication = jwt.verify(
    token,
    process.env.USER_JWT_SECRET,
    async (err, username) => {
      const user = await User.findOne({ username });

      if (err || !user) {
        res.status(403).json({
          message: "User access denied",
        });
      } else {
        console.log(`${username} is logged in!`);
        req.user = user;
        next();
      }
    },
  );
};

app.get("/", (req, res) => {
  res.json({
    message: "Hello welcome to our auth system",
  });
});

// admin routes !

// admin signup !
app.post("/admin/signup", async (req, res) => {
  const { username, password } = req.body;
  const ifAlreadyAdmin = await Admin.findOne({ username });

  if (ifAlreadyAdmin) {
    res.json({
      message: "User already exists, please sign in!",
    });
  } else {
    const adminToken = generateAdminToken(username);
    const newAdmin = new Admin({ username, password });
    await newAdmin.save();
    console.log(`Admin - ${username} just signedup!`);
    console.log(await Admin.find({}));
    res.status(403).json({
      message: "Admin created succesfully!",
      token: adminToken,
    });
  }
});

// signin Admin !
app.post("/admin/login", async (req, res) => {
  const { username, password } = req.headers;
  const admin = await Admin.findOne({ username, password });

  if (admin) {
    const adminToken = generateAdminToken(admin.username);
    console.log(`Admin - ${username} just loggedin!`);
    console.log(await Admin.find({}));
    res.json({ message: "Logged in successfully", token: adminToken });
  } else {
    res.status(403).json({ message: "Admin authentication failed" });
  }
});

// make cources !
app.post("/admin/courses", adminAuth, async (req, res) => {
  const course = req.body;
  course.id = Date.now();

  const newCourse = new Course(course);
  await newCourse.save();
  console.log(newCourse);
  res.json({
    message: "Course created successfully",
    courseId: course.id,
  });
});

// admin edit course
app.put("/admin/courses/:courseId", adminAuth, async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.courseId, req.body, {
    new: true,
  });

  if (course) {
    res.json({ message: "Course updated successfully" });
  } else {
    res.status(403).json({
      message: "Course not found!",
    });
  }
});

// returns all the courses!
app.get("/admin/courses", adminAuth, async (req, res) => {
  const courses = await Course.find({});
  res.json({ courses });
});

// User routes ---

// create new user!
app.post("/users/signup", async (req, res) => {
  const { username, password } = req.body;

  const ifUser = await User.findOne({ username });

  if (ifUser) {
    res.status(403).json({
      message: "User already exists, please signin!",
    });
  } else {
    const userToken = generateUserToken(username);
    const newUser = new User({ username, password, purchasedCourses: [] });
    await newUser.save();
    console.log(`User - ${username} just signed up!`);
    console.log(await User.find({}));
    res.json({
      message: "User created succesfully!",
      token: userToken,
    });
  }
});

// user signin!
app.post("/users/login", async (req, res) => {
  const { username, password } = req.headers;
  const user = await User.findOne({ username, password });
  if (user) {
    const userToken = generateUserToken(username);
    console.log(`${user.username} just logged in!`);
    console.log(await User.find({}));
    res.json({
      message: "user loggedin succesfully!",
      token: userToken,
    });
  } else {
    res.status(403).json({
      message: "User not authenticated!",
    });
  }
});

// list pusblished courses to user!
app.get("/users/courses", userAuth, async (req, res) => {
  let courses = await Course.find({ published: true });

  console.log(courses);
  res.json({ courses });
});

// user purchase course!
app.post("/users/courses/:courseId", userAuth, async (req, res) => {
  const purchasedCourseId = Number(req.params.courseId);
  const purchasedCourse = await Course.findById(purchasedCourseId);

  const user = req.user;

  if (purchasedCourse) {
    user.purchasedCourses.push(purchasedCourse);
    console.log(user);
    res.json({ message: "Course purchased succesfully" });
  } else {
    res.status(404).json({
      message: "Course is either not found or published!",
    });
  }
});

// list all purchased courses by user!
app.get("/users/purchasedCourses", userAuth, async (req, res) => {
  const user = await User.findOne({ username: req.user.username }).populate(
    "purchasedCourses",
  );
  if (user) {
    res.json({ purchasedCourses: user.purchasedCourses || [] });
  } else {
    res.status(403).json({ message: "User not found" });
  }
});

app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
