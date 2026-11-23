export async function register() {
    if (process.env.NEXT_RUNTIME !== "nodejs") return;
    if (process.env.NEXT_PHASE === "phase-production-build") return;

    const { connectDB } = await import("./server/config/db");
    connectDB().catch((error) => console.error("Database warm-up failed:", error.message));

    const {cancelStaleCodOrders} = await import("./server/jobs/cancelStaleCodOrders");
    const runJob = () => 
        cancelStaleCodOrders()
        .then((count) => count > 0 && console.log(`Auto-cancelled ${count} old cash-on-delivery order(s)`))
        .catch((error) => console.error("Auto-cancel failed:", error.message));

        runJob();
        setInterval(runJob, 60 * 60 * 1000);

}
