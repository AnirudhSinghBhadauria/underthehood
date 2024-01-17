const express = require("express");
const app = express();
const port = 8080;

const User = [];
const Admin = [];

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to our auth system!",
  });
});

app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
