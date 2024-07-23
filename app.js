import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import postRoute from "./routes/post.route.js"
import authRoute from "./routes/auth.route.js"
import testRoute from "./routes/test.route.js"
import userRoute from "./routes/user.route.js"
import { verifyToken } from "./middleware/verifyToken.js";


const app = express();

const allowedOrigins = [
    process.env.CLIENT_URL,
    "https://estateapp-ui.vercel.app",
    "https://estateapp-j1vixhlnj-priyanshi1908s-projects.vercel.app"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); // Allow requests with no origin
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
// app.use(cors({origin: process.env.CLIENT_URL, credentials:true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/users",verifyToken, userRoute);
app.use("/api/posts",verifyToken, postRoute);
app.use("/api/test", testRoute);


app.listen(8800, ()=> {
    console.log("Server is running, yey!");
});