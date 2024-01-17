const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 8080;

let User = [];
let Admin = [];
let Courses = [];

app.use(bodyParser.json());

const adminAuth = (req, res, next) => {
  const { username, password } = req.headers;

  const ifAdmin = Admin.find(
    (admin) => admin.username === username && admin.password === password,
  );

  if (ifAdmin) {
    next();
  } else {
    res.status(403).json({
      message: "Admin not authenticated",
    });
  }
};

const userAuth = (req, res, next) => {
  const { username, password } = req.headers;

  const ifUser = User.find(
    (user) => user.username === username && user.password === password,
  );

  if (ifUser) {
    next();
  } else {
    res.status(403).json({
      message: "User not authenticated",
    });
  }
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
    Admin.push({ username, password });
    console.log(Admin);
    res.status(403).json({
      message: "Admin created succesfully!",
    });
  }
});

// signin Admin !
app.post("/admin/singin", adminAuth, (req, res) => {
  res.json({
    message: "Logged in succesfully!",
  });
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
    User.push({ username, password, purchasedCourses: [] });
    console.log(User);
    res.json({
      message: "User created succesfully!",
    });
  }
});

// user signin!
app.post("/users/login", userAuth, (req, res) => {
  console.log(User);
  res.json({
    message: "user loggedin succesfully!",
  });
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

  const user = User.find((user) => user.username === req.headers.username);

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
  const user = User.find((user) => user.username === req.headers.username);

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
