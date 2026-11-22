export async function register() {
    if (process.env.NEXT_RUNTIME !== "nodejs") return;
    if (process.env.NEXT_PHASE === "phase-production-build") return;

    const { connectDB } = await import("./server/config/db");
    connectDB().catch((error) => console.error("Database warm-up failed:", error.message));
}
