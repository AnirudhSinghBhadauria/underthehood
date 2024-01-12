// This is how my node process or frontend talks to a server, using fetch(), which is another library
// like express and fs!

// fetch() give out a promise that we handle using .then().catch() or async await!

// GET request!
fetch("http://localhost:3000", {
  method: "GET",
}).then((data) => {
  data.json().then((jsonData) => {
    console.log(jsonData);
  });
});

// POST request!
fetch("http://localhost:3000/handleSum", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    number: 67,
  }),
}).then((data) => {
  data.json().then((jsonData) => {
    console.log(jsonData);
  });
});

// using Async Await to handle promises!
// const fetchData = async () => {
//   const res = await fetch("http://localhost:3000", {
//     method: "GET",
//   });
//
//   const result = await res.json();
//
//   console.log(result);
// };
//
// fetchData();
