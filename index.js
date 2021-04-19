const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname))

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.listen(port, () => console.log("Web server running."));