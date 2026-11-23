import mongoose from "mongoose";
 const email = process.argv[2]?.trim().toLowerCase();
 if(!email){
    console.log("Usage: npm run make-admin  -- you@example.com");
    process.exit(1);
 }

await mongoose.connect(process.env.MONGODB_URI);
const result= await mongoose.connection.collection("users").updateOne({email}, {$set: {role: "admin"}});
await mongoose.disconnect();

if(result.matchedCount === 0){
    console.log(`No account found for ${email}. Sign up on the site first.`);
    process.exit(1);
}
console.log(`${email} is now an admin. Log out and back in to see the dashboard.`);