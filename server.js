const http = require("http");
const path = require("path");
const fs = require("fs");
const { json } = require("stream/consumers");

const filePath = path.join(__dirname, "./db/todo.json");



const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  const pathName = url.pathname;

  console.log(req.url);
  //   console.log(req, res);
  //   res.end("Welcome to ToDo App Server");
  //get all todos
  if (pathName === "/todos" && req.method === "GET") {
    const data = fs.readFileSync(filePath, { encoding: "utf-8" });
    // res.end("All todos");

    res.writeHead(200, {
      // "content-type": "text/plain",
      "content-type": "application/json",
      // email: "test@gmail.com",
    });

    // res.setHeader("content-type", "text/plain");
    // res.setHeader("email", "ph@mail.com");
    // res.statusCode = 201;

    // res.end("hello todo");
    //res.end(JSON.stringify(data));
    res.end(data);
  }

  //Post a todo..........
  else if (req.url === "/todos/create-todo" && req.method === "POST") {
    let data = "";

    req.on("data", (chunk) => {
      data = data + chunk;
    });

    req.on("end", () => {
      console.log(data);
      const { title, body } = JSON.parse(data);
      console.log({ title, body });

      const createdAt = new Date().toLocaleString();

      const allToDos = fs.readFileSync(filePath, { encoding: "utf-8" });
      const parseAllToDos = JSON.parse(allToDos);

      console.log(allToDos);
      parseAllToDos.push({ title, body, createdAt });

      fs.writeFileSync(filePath, JSON.stringify(parseAllToDos, null, 2), {
        encoding: "utf8",
      });

      res.end(JSON.stringify({ title, body, createdAt }, null, 2));
    });
  }
  //get single todo...............
  else if (pathName === "/todo" && req.method === "GET") {
    console.log(req.url, "single todo");

    const title = url.searchParams.get("title");
    console.log(title);

    const data = fs.readFileSync(filePath, { encoding: "utf-8" });

    const parseData = JSON.parse(data);

    const todo = parseData.find((todo) => todo.title === title);

    const stringifiedTodo = JSON.stringify(todo);

    res.writeHead(200, {
      "content-type": "application/json",
    });

    res.end(stringifiedTodo);
  }

  //update-single todo.............
  else if (pathName === "/todos/update-todo" && req.method === "PATCH") {
    const title = url.searchParams.get("title");
    let data = "";

    req.on("data", (chunk) => {
      data = data + chunk;
    });

    req.on("end", () => {
      const { body } = JSON.parse(data);

      const allToDos = fs.readFileSync(filePath, { encoding: "utf-8" });
      const parseAllToDos = JSON.parse(allToDos);

      const todoIdx = parseAllToDos.findIndex((todo) => todo.title === title);

      parseAllToDos[todoIdx].body = body;

      fs.writeFileSync(filePath, JSON.stringify(parseAllToDos, null, 2), {
        encoding: "utf8",
      });

      res.end(
        JSON.stringify(
          { title, body, createdAt: parseAllToDos[todoIdx].createdAt },
          null,
          2
        )
      );
    });
  }

  //delete single todo........
  else if (pathName === "/todos/delete-todo" && req.method === "DELETE") {
    const title = url.searchParams.get("title");

    console.log(title);

    const allToDos = fs.readFileSync(filePath, { encoding: "utf-8" });
    const parseAllToDos = JSON.parse(allToDos);

    const remainingData = parseAllToDos.filter((todo) => todo.title !== title);

    fs.writeFileSync(filePath, JSON.stringify(remainingData, null, 2), {
      encoding: "utf8",
    });

    res.end("Deleted Successfully");
  } else {
    res.end("Route not found");
  }
});

server.listen(5000, "127.0.0.1", () => {
  console.log("Server listening on port 5000");
});
