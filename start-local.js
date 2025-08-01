// Simple Node.js script to start the server on Windows with localhost binding
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set environment variables
process.env.NODE_ENV = "development";
process.env.PORT = "5000";

// Create a modified server file for local development
const serverPath = path.join(__dirname, "server", "index.ts");
const localServerPath = path.join(__dirname, "server", "index-local.ts");

// Read the original server file
let serverContent = fs.readFileSync(serverPath, "utf8");

// Replace the server.listen configuration for Windows compatibility
serverContent = serverContent.replace(
  'server.listen({\n    port,\n    host: "0.0.0.0",\n    reusePort: true,\n  }, () => {',
  'server.listen(port, () => {'
);

// Write the modified version
fs.writeFileSync(localServerPath, serverContent);

console.log("Starting healthcare search application for local development...");
console.log("Server will be available at: http://127.0.0.1:5000");

// Start the server
const child = spawn("npx", ["tsx", "server/index-local.ts"], {
  stdio: "inherit",
  shell: true,
});

child.on("error", (error) => {
  console.error("Failed to start server:", error);
});

child.on("close", (code) => {
  // Clean up the temporary file
  if (fs.existsSync(localServerPath)) {
    fs.unlinkSync(localServerPath);
  }
  console.log(`Server process exited with code ${code}`);
});

// Clean up on CTRL+C
process.on("SIGINT", () => {
  console.log("\nShutting down server...");
  if (fs.existsSync(localServerPath)) {
    fs.unlinkSync(localServerPath);
  }
  child.kill();
  process.exit();
});
