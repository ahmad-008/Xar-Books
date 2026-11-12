import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db";
import { errorHandler, notFound } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import cartRoutes from "./routes/cart.routes";


const app = express();
const PORT = process.env.PORT || 8000;

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

//Signup route
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

app.use(notFound);
app.use(errorHandler);


const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);})

        } catch (error) {
            console.error("Failed to start server:", error);
            process.exit(1);

        }
    };
    startServer();

