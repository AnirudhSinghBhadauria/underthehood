const express = require("express");
const app = express();
const port = 3000;

const getSum = (num) => {
  let sum = 0;
  for (let i = 0; i < num; i++) {
    sum += i;
  }
  return sum;
};

app.get("/handleSum", (req, res) => {
  const totalSum = getSum(100);
  res.send(`Result of your evaluation is ${totalSum}`);
});

app.get("/about", (req, res) => {
  res.send("This is the about page!");
});

app.listen(port, () => {
  console.log("I am listening to port 3000!");
});
