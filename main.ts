import express from "express";

let app = express();

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.get("/api/data", (req, res) => {
  res.json({ message: "Data received" });
});

app.get("/api/aa", (req, res) => {
  res.json({ message: "Data received" });
});

console.log("Server is running on port 3000");
