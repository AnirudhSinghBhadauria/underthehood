const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.use(bodyParser.json());

app.listen(port, () => {
  console.log("Server running on port 3000!");
});

let todos = [];

const getSpecificTodo = (arr, index) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id === index) {
      return i;
    }
  }

  return -1;
};

const deleteSpecificTodo = (arr, index) => {
  todos = arr.filter((x) => x.id !== index);
};

app.get("/", (req, res) => {
  res.send({
    name: "Server-1",
    role: "todo",
  });
});

app.get("/todo", (req, res) => {
  if (todos.length !== 0) {
    console.log(todos);
    res.status(200).json(todos);
  } else {
    res.status(404).json({
      status: "No todo found!",
    });
  }
});

app.get("/todo/:id", (req, res) => {
  const specificTodo = getSpecificTodo(todos, parseInt(req.params.id));
  if (specificTodo !== -1) {
    console.log(todos);
    res.status(200).json(todos[specificTodo]);
  } else {
    res.status(404).json({
      status: "No todo found!",
    });
  }
});

app.post("/todo", (req, res) => {
  const newTodo = {
    id: Math.floor(Math.random() * 100),
    title: req.body.title,
    description: req.body.description,
    completed: true,
  };

  todos.push(newTodo);
  console.log(todos);
  res.status(201).json({ message: "Todo was created!", id: newTodo.id });
});

app.put("/todo/:id", (req, res) => {
  const specificTodo = getSpecificTodo(todos, parseInt(req.params.id));

  if (specificTodo !== -1) {
    todos[specificTodo].title = req.body.title;
    todos[specificTodo].completed = req.body.completed;
    console.log(todos);
    res.status(200).json({
      message: "Todo was found and updated!",
    });
  } else {
    res.status(404).json({
      message: "Todo not found!",
    });
  }
});

app.delete("/todo/:id", (req, res) => {
  const specificTodo = getSpecificTodo(todos, parseInt(req.params.id));

  if (specificTodo !== -1) {
    deleteSpecificTodo(todos, todos[specificTodo].id);
    console.log(todos);
    res.json({
      message: "Todo Deleted Succesfully!",
    });
  } else {
    res.status(404).json({
      message: "Todo not found!",
    });
  }
});
