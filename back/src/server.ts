import "dotenv/config";
import { assertAdminConfiguration } from "./auth.js";
import { app } from "./app.js";

const port = Number(process.env.PORT ?? 4000);

assertAdminConfiguration();

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("PORT должен быть целым числом от 1 до 65535");
}

app.listen(port, () => {
  console.log(`Mimo API запущен: http://localhost:${port}`);
});
