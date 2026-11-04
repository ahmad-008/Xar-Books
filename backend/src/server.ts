import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db";
import { errorHandler, notFound } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";




const app = express();
const PORT = process.env.PORT || 8000;

// hosting services put a proxy in front of the app. Without this, every visitor
// would look like the same IP address to the rate limiter.
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

// allow our frontend to call this API and send cookies
app.use(
    cors(
        {
            origin: process.env.FRONTEND_URL || "http://localhost:3000",
            credentials: true,
        }
    )
);

// read JSON request bodies into req.body
app.use(express.json());


// read cookies into req.cookies
app.use(cookieParser());



// a simple route to check the server is alive
app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ success: true, message: "Xar Books API is running"});
});

app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);


const startServer = async () => {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing from .env");
        }

        await connectDB();

        // Express 5 also runs this when listening fails, for example if the port is busy
        app.listen(PORT, (error?: Error) => {
            if (error) {
                console.error(`Could not start server on port ${PORT}:`, error);
                process.exit(1);
            }

            console.log(`Server running on http://localhost:${PORT}`);
        });

        } catch (error) {
            console.error("Failed to start server:", error);
            process.exit(1);

        }
    };
    startServer();

