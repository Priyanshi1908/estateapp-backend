import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";



//REGISTER
//
//
//
//
export const register = async (req,res)=>{
    const{username,email,password} = req.body;

    //Hashing the password first for security & privacy

    try{
    const hashedPassword = await bcrypt.hash(password,10);

    console.log(hashedPassword);

    //Creating new user and saving it to DB
    const newUser = await prisma.user.create({
     
        data:{
            username,
            email,
            password: hashedPassword,
        },
    });

    console.log(newUser);
    res.status(201).json({message: "User created Successfully!"});

 }catch(err){
    console.log();
    res.status(500).json({message:"Failed to create new User"});
 }
};


//LOGIN 
//
//
//
//
export const login = async (req,res)=>{
    //db operation basically
    const{username,password} = req.body;

    try{

//Check if USER EXISTS
const user = await prisma.user.findUnique({
   where:{username} 
})
if(!user) return res.status(401).json({message:"Invalid Credentials"});


// CHECK IF PASSWORD IS CORRECT by using bcrypt compare method
const isPasswordValid = await bcrypt.compare(password, user.password);

if(!isPasswordValid) return res.status(401).json({message:"Invalid Credentials"});


//GENERATE COOKIE TOKEN & SEND TO USER
// res.setHeader("Set-Cookie", "test=" + "myValue").json("success")

const age = 1000 * 60 * 60 * 24 * 7

const token = jwt.sign({
    id:user.id,
    isAdmin:false,
}, process.env.JWT_SECRET_KEY, {expiresIn: age})

const {password: userPassword, ...userInfo} = user;

res.cookie("token", token, {
    httpOnly:true,
    // secure:true  use this during production, not rn,
    maxAge: age,
}).status(200).json(userInfo);

}catch(err){
    console.log(err);
    res.status(500).json({message:"Failed to login"});
}
};


//LOGOUT
//
//
//
//
export const logout = (req,res)=>{
    res.clearCookie("token").status(200).json({message:"Logout Successful"});
};