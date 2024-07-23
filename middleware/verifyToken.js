import jwt from "jsonwebtoken";

export const verifyToken = (req,res,next) => {
    const token = req.cookies.token;

    if (!token) {
        console.log("No token found"); // changed for cookie issue
        return res.status(401).json({ message: "Not Authenticated" });
    }
jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload)=>{
    if (err) {
        console.log("Invalid token", err); // changed for cookie issue
        return res.status(403).json({ message: "Token is not valid, sorry" });
    }    req.userId = payload.id;
     console.log(req.userId);
    next();
});
}