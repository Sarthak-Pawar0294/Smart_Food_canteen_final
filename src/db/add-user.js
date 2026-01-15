// src/db/add-user.js

// LIST OF USERS TO SEED
const users = [
  {
    email: "harshad.1251090072@vit.edu",
    full_name: "Harshad Pawar",
    role: "STUDENT",
    prn_hash: "1251090072"
  },
  {
    email: "sarthak.1251090107@vit.edu",
    full_name: "Sarthak Pawar",
    role: "STUDENT",
    prn_hash: "1251090107"
  },
  {
    // Fixed Typo: Added missing '1' (1251090175)
    email: "gaurav.1251090175@vit.edu",
    full_name: "Gaurav Pawar",
    role: "STUDENT",
    prn_hash: "1251090175"
  },
  {
    email: "sanyam.1251090397@vit.edu",
    full_name: "Sanyam Pawar",
    role: "STUDENT",
    prn_hash: "1251090397"
  },
  {
    email: "canteen@vit.edu",
    full_name: "Canteen Admin",
    role: "OWNER",
    prn_hash: "canteen"
  }
];

// Function to run the seeding using the main server's database connection
export function seedUsers(db) {
  console.log("🔄 Loading user list from src/db/add-user.js...");
  
  const insert = db.prepare(`
    INSERT OR IGNORE INTO users (email, full_name, role, prn_hash) 
    VALUES (?, ?, ?, ?)
  `);

  let count = 0;
  users.forEach((u) => {
    const result = insert.run(u.email, u.full_name, u.role, u.prn_hash);
    if (result.changes > 0) count++;
  });

  console.log(`✔ Seeded ${count} new users from external list.`);
}
