const express = require("express");
const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const port = process.env.SERVER_PORT;
const app = express();

let User = [];
let Admin = [];
let Courses = [];

app.use(bodyParser.json());

const generateAdminToken = (payload) => {
  const token = jwt.sign(payload, process.env.ADMIN_JWT_SECRET);
  return token;
};

const generateUserToken = (payload) => {
  const token = jwt.sign(payload, process.env.USER_JWT_SECRET);
  return token;
};

const adminAuth = (req, res, next) => {
  const adminAuthorization = req.headers.authorization;
  const token = adminAuthorization.split(" ")[1];

  const adminVerification = jwt.verify(
    token,
    process.env.ADMIN_JWT_SECRET,
    (err, username) => {
      const admin = Admin.find((admin) => admin.username === username);

      if (err || !admin) {
        res.status(403).json({
          message: "Admin access denied!",
        });
      } else {
        console.log(`${admin.username} is logged in!`);
        console.log(Admin);
        req.admin = admin;
        next();
      }
    },
  );
};

const userAuth = (req, res, next) => {
  const userAutherization = req.headers.authorization;
  const token = userAutherization.split(" ")[1];

  const userVerfication = jwt.verify(
    token,
    process.env.USER_JWT_SECRET,
    (err, username) => {
      const user = User.find((user) => user.username === username);

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
app.post("/admin/signup", (req, res) => {
  const { username, password } = req.body;
  const ifAlreadyAdmin = Admin.find(
    (admin) => admin.username === username && admin.password === password,
  );

  if (ifAlreadyAdmin) {
    res.json({
      message: "User already exists, please sign in!",
    });
  } else {
    const adminToken = generateAdminToken(username);
    Admin.push({ username, password });
    console.log(`Admin - ${username} just signedup!`);
    console.log(Admin);
    res.status(403).json({
      message: "Admin created succesfully!",
      token: adminToken,
    });
  }
});

// signin Admin !
app.post("/admin/login", (req, res) => {
  const { username, password } = req.headers;
  const admin = Admin.find(
    (admin) => admin.username === username && admin.password === password,
  );

  if (admin) {
    const adminToken = generateAdminToken(admin.username);
    console.log(`Admin - ${username} just loggedin!`);
    console.log(Admin);
    res.json({ message: "Logged in successfully", token: adminToken });
  } else {
    res.status(403).json({ message: "Admin authentication failed" });
  }
});

// make cources !
app.post("/admin/courses", adminAuth, (req, res) => {
  const course = req.body;
  course.id = Date.now();

  Courses.push(course);
  console.log(Courses);
  res.json({
    message: "Course created successfully",
    courseId: course.id,
  });
});

// admin edit course
app.put("/admin/courses/:courseId", adminAuth, (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const courseToBeEdited = Courses.find((course) => course.id === courseId);

  const { title, description, price, imageLink, publlished } = req.body;

  if (courseToBeEdited) {
    Object.assign(courseToBeEdited, req.body);
    console.log(Courses);

    res.json({ message: "Course updated successfully" });
  } else {
    res.status(403).json({
      message: "Course not found!",
    });
  }
});

// returns all the courses!
app.get("/admin/courses", adminAuth, (req, res) => {
  res.json({ courses: Courses });
});

// User routes ---

// create new user!
app.post("/users/signup", (req, res) => {
  const { username, password } = req.body;

  const ifUser = User.find(
    (user) => user.username === username && user.password === password,
  );

  if (ifUser) {
    res.status(403).json({
      message: "User already exists, please signin!",
    });
  } else {
    const userToken = generateUserToken(username);
    User.push({ username, password, purchasedCourses: [] });
    console.log(`User - ${username} just signed up!`);
    console.log(User);
    res.json({
      message: "User created succesfully!",
      token: userToken,
    });
  }
});

// user signin!
app.post("/users/login", (req, res) => {
  const { username, password } = req.headers;
  const user = User.find(
    (user) => user.username === username && user.password === password,
  );

  if (user) {
    const userToken = generateUserToken(username);
    console.log(`${user.username} just logged in!`);
    console.log(User);
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
app.get("/users/courses", userAuth, (req, res) => {
  let publishedCourses = [];

  for (let i = 0; i < Courses.length; i++) {
    if (Courses[i].published) {
      publishedCourses.push(Courses[i]);
    }
  }
  console.log(publishedCourses);
  res.json({ courses: publishedCourses });
});

// user purchase course!
app.post("/users/courses/:courseId", userAuth, (req, res) => {
  const purchasedCourseId = Number(req.params.courseId);
  const purchasedCourse = Courses.find(
    (course) => course.id === purchasedCourseId && course.published,
  );

  // const user = User.find((user) => user.username === req.headers.username);
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
app.get("/users/purchasedCourses", userAuth, (req, res) => {
  // const user = User.find((user) => user.username === req.headers.username);
  const user = req.user;

  if (user.purchasedCourses.length > 0) {
    console.log(user.purchasedCourses);
    res.json({ userCourses: user.purchasedCourses });
  } else {
    res.status(403).json({
      message: "You have not purchased any course yet!",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
