const express = require("express");
const bodyParser = require("body-parser"); // this lib parses body for us!
const app = express();
const port = 3000;

// Middlewares! functions that captures/Interceps the request from user before reaching it to the route callback,
// processes the request, and send request to the callback using next();

// Getting the total number of request to the server!!
let requests = 0;
// This is a global middleware, and captures all the requests coming to any route, doesnt matter!
const middleware = (req, res, next) => {
  requests += 1;
  // console.log(req.headers.counter); // logs the result on the server itself!
  console.log("Total number of requests are " + requests);
  next();
};

// In order to register this middleware,
// app.use(middleware);
app.use(bodyParser.json()); // added a middleware to our request flow that will capture the request and parse body before reaching the route handeler!

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
  // Response can be object, HTML, JSON, plainText etc.

  const welcomeResponse = {
    message: "Hey Hello, How was your day?",
    ifAuth: true,
  };

  // res.send("Hey Hello, How was your day?");
  res.send(welcomeResponse);
});

// 3 ways of getting user input - using searchQueries, headers, body!
// Server also sends Status codes, Body, Headers
// mostly body is used for getting user data with the request.

app.post("/handleSum", (req, res) => {
  /* catches the 'number' searchQuery --->  baseURL/route?<searchQuery> = <value>
   it was like ----> localhost:3000/handleSum?number=<whatever number> */

  const number = req.body.number; // getting body from body-parser

  if (number < 1000) {
    const totalSum = getSum(number);
    //after defining the body-parse middleware we can do req.body to get the body!
    // console.log(req.body);

    // console.log(req.query);  Get all searchQueries  eg. req.query.number
    // console.log(req.headers);  Get all headers   eg. req.headers.number

    let responseObj = {
      sum: totalSum,
    };
    // res.send() is also good! res.status(<code>).send(); will specify the code!

    res.status(200).send(responseObj); // Sends the response to the client!
  } else {
    res.status(411).send("Number is too big for me!");
  }
});

app.get("/about", (req, res) => {
  console.log("Hello, how you doing?"); // This happens on server and has nothing to do with client side of the code!
  res.send("This is the about page!");
});

// Request Handelers - GET, PUT, POST, DELETE
// We can only send a GET request from URL bar of our browser, to send a Post request use postman!

// POST Request!
app.post("/createUser", (req, res) => {
  res.send("Hello, this is a POST request");
});

// PUT Request!
app.put("/profile", (req, res) => {
  res.send({ name: "Anriudh Singh Bhadauria", age: 20 });
});

// DELETE Request
app.delete("/deleteAccount", (req, res) => {
  res.send("Account deleted succesfully!");
});
