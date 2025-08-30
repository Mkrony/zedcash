import cron from "node-cron";
import processExpiredPendingTasks from "../controller/autoCompleteOldPendingTasks.js";
import mongoose from "mongoose";
import { DATABASE } from "../config/config.js";

// Ensure DB is connected before cron runs
mongoose.connect(DATABASE, { autoIndex: true })
    .then(() => console.log("✅ Cron connected to MongoDB"))
    .catch((err) => console.error("❌ Cron DB connection failed", err));

// Run every day at 2:00 AM server time
cron.schedule("0 2 * * *", async () => {
    console.log("⏳ Cron job started: Processing expired pending tasks...");
    await processExpiredPendingTasks();
    console.log("✅ Cron job finished.");
});
