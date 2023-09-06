const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
  SELECT
    *
  FROM
    book
  ORDER BY
    book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});
/*post method*/
app.post("/users/", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedpassword = await bcrypt.hash(password, 10);
  const checkinguser = `select * from user where username='${username}';`;
  gettinguser = await db.get(checkinguser);
  if (gettinguser === undefined) {
    const addinguser = `
  INSERT INTO
    user (name,username, password, gender, location)
  VALUES
    (
      '${name}',
      '${username}',
      '${hashedpassword}',
      '${gender}',
      '${location}'  
    );`;
    await db.run(addinguser);
    response.send("user created suucessfully");
  } else {
    response.status(400);
    response.send("already exists");
  }
});
/*login details(authentication)*/
app.post("/login/", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const checkinguser = `select * from user where username='${username}';`;
  gettinguser = await db.get(checkinguser);
  if (gettinguser === undefined) {
    response.status(400);
    response.send("user didnt find");
  } else {
    const comparing = await bcrypt.compare(password, gettinguser.password);
    if (comparing === true) {
      response.send("login success");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});
