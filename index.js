const express = require("express");
const app = express();
const port = 3000;

// The expensive calculation that client want us to get done!
const getSum = (num) => {
  let sum = 0;
  for (let i = 0; i <= num; i++) {
    sum += i;
  }
  return sum;
};

// Whenever a new request to server is made, the server starts listening to the client, and it will keep listening to the client indefinetly on the mentioned port!
app.listen(port, () => {
  console.log("I am listening to port 3000!");
});

// Home route, '/'
app.get("/", (req, res) => {
  res.send("Hello, How you doing? Welcome to our homepage!");
});

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

// Request Handelers - GET, PUT, POST, DELETE
// We can only send a GET request from URL bar of our browser, to send a Post request use postman!

app.post("/createUser", (req, res) => {
  res.send("Hello, this is a POST request");
});
