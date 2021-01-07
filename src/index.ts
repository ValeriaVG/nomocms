import server from "./server";
const port = 8080;
server.listen(port, () => {
  console.log(`http://localhost:${port}/`);
});
