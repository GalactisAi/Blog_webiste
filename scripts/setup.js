// Setup script to initialize the default admin user with proper password hash
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

async function setup() {
  console.log("Setting up default admin user...");
  
  const hash = await bcrypt.hash("admin123", 10);
  const dataDir = path.join(__dirname, "..", "data");
  const usersFile = path.join(dataDir, "users.json");

  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const defaultUsers = [
    {
      id: "1",
      email: "admin@galactis.ai",
      password: hash,
      name: "Admin",
    },
  ];

  fs.writeFileSync(usersFile, JSON.stringify(defaultUsers, null, 2));
  
  console.log("✅ Default admin user created!");
  console.log("Email: admin@galactis.ai");
  console.log("Password: admin123");
  console.log("\nYou can now start the server with: npm run dev");
}

setup().catch(console.error);

