const express = require("express");
const app = express();
const port = 3000;

const getSum = (num) => {
  let sum = 0;
  for (let i = 0; i <= num; i++) {
    sum += i;
  }
  return sum;
};

app.get("/handleSum", (req, res) => {
  /* catches the 'number' searchQuery --->  baseURL/route?<searchQuery> = <value>
   it was like ----> localhost:3000/handleSum?number=<whatever number> */
  const number = req.query.number;
  const totalSum = getSum(number);
  res.send(`Sum of numbers from 0 to ${number} is ${totalSum}`); // Shows the result
});

app.get("/about", (req, res) => {
  console.log("Hello, how you doing?"); // This happens on server and has nothing to do with client side of the code!
  res.send("This is the about page!");
});

app.listen(port, () => {
  console.log("I am listening to port 3000!");
});

// Request Handelers - GET, PUT, POST, DELETE
// We can only send a GET request from URL bar of our browser, to send a Post request use postman!

app.post("/createUser", (req, res) => {
  res.send("Hello, this is a POST request");
});
