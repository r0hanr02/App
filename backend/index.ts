import { createServer } from "node:http";
import { app } from "./src/app.ts";
import { initSocket } from "./src/utils/socket.ts";
import { connectDb } from "./src/db/db.ts";

const server = createServer(app);
initSocket(server);

connectDb().then(() => {
  server.listen(
    Number(process.env.PORT) || 8000,
    process.env.HOST ?? "localhost",
    () => {
      console.log(`Server is running on port ${process.env.PORT || 8000}`);
      console.log(
        `For Documentation : http://${process.env.HOST || "localhost"}:8000/api/v1/docs`
      );
    }
  );
});
