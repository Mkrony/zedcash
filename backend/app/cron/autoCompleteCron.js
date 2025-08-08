import cron from "node-cron";
import processExpiredPendingTasks from "../controller/autoCompleteOldPendingTasks.js"; // adjust path if needed

// Run every day at 3:00 AM
cron.schedule("0 3 * * *", async () => {
    console.log("⏰ Running scheduled pending → completed check...");
    await processExpiredPendingTasks();
});
