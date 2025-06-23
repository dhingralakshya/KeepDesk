const app = require("./app");
const PORT = process.env.port || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
