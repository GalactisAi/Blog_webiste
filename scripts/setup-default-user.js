// Script to generate a proper bcrypt hash for the default admin password
// Run: node scripts/setup-default-user.js
const bcrypt = require("bcryptjs");

async function setup() {
  const hash = await bcrypt.hash("admin123", 10);
  console.log("Default admin password hash:", hash);
  console.log("\nEmail: admin@galactis.ai");
  console.log("Password: admin123");
  console.log("\nCopy this hash to blogger-cms/lib/db.ts in the defaultUsers array");
}

setup();

