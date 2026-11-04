import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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
app.get("/api/health", (_req:Request, res:Response) => {
    res.json({success: true, message: " Xar Books API is running"});
});

app.listen(PORT, ()=>{
    console.log(`Server running on http://localhost:${PORT}`);
});