import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";


export const getUsers = async (req, res) => {
    try {
      const users = await prisma.user.findMany();
      res.status(200).json(users);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Failed to get users!" });
    }
  };
  


  export const getUser = async (req, res) => {
    const isValidObjectId = (id) => /^[a-fA-F0-9]{24}$/.test(id);

    const id = req.params.id;
     // Validate ObjectID format
     if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
  }
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          posts: true, // Ensure that posts is a valid relation objectId data error
          savedPosts: true, // Ensure that savedPosts is a valid relation object id error
        },
      });
      res.status(200).json(user);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Failed to get user!" });
    }
  };

export const updateUser = async(req,res)=>{
    const id = req.params.id;
    const tokenUserId = req.userId;
    const {password,avatar, ...inputs} = req.body;

    if(id !== tokenUserId){
        return res.status(403).json({message: "Not Authorized"});
    }

let updatedPassword = null;

    try{

        if(password){
            updatedPassword = await bcrypt.hash(password,10)
        }

        const updatedUser = await prisma.user.update({
            where:{id},
            data: {

                ...inputs,
                ...(updatedPassword && {password:updatedPassword}),
                ...(avatar && {avatar}),

            },
        });

        const {password:userPassword, ...rest} = updatedUser
      res.status(200).json(rest);
    }catch(err){
       console.log(err);
       res.status(500).json({message:"Failed to update User"});
    }
};


export const deleteUser = async(req,res)=>{


    const id = req.params.id;
    const tokenUserId = req.userId;

    if(id !== tokenUserId){
        return res.status(403).json({message: "Not Authorized"});
    };

    try{

        await prisma.user.delete({
            where:{id},
        });

       res.status(200).json({message:"User Deleted Successfully!"});

    }catch(err){
       console.log(err);
       res.status(500).json({message:"Failed to delete User"});
    }
};


export const savePost = async(req,res)=>{
     
    const postId = req.body.postId;   //during revision make sure you understand this once again ~personal
    const tokenUserId = req.userId;

   
    try{

        const savedPost = await prisma.savedPost.findUnique({
            where:{
                userId_postId:{
                    userId:tokenUserId,
                    postId,
                },
            },
        });
 
        if(savedPost){
            await prisma.savedPost.delete({
                where:{
                    id: savedPost.id,
                },
            });
            res.status(200).json({message:"Post Removed from Saved List"});

        }
        else{
            await prisma.savedPost.create({
                data:{
                    userId: tokenUserId,
                    postId,
                },
            });
            res.status(200).json({message:"Post Saved !!!"});

        }

    }catch(err){
       console.log(err);
       res.status(500).json({message:"Failed to Save Post"});
    }
};


export const profilePosts = async (req, res) => {
  const isValidObjectId = (id) => /^[a-fA-F0-9]{24}$/.test(id); //added for uninformed object error

    const tokenUserId = req.userId;

    console.log("Incoming request to /profilePosts");
    console.log("Received tokenUserId:", tokenUserId);
    
    if (!isValidObjectId(tokenUserId)) {
      console.log("Invalid user ID format");
      return res.status(400).json({ message: "Invalid user ID format" });
  }

    try {
      const userPosts = await prisma.post.findMany({
        where: { 
            userId:tokenUserId,
         },
      });

      console.log("User posts fetched:", userPosts);

      const saved = await prisma.savedPost.findMany({
        where: { 
            userId:tokenUserId,
         },
         include:{
            post:true,
         }
      });


      const savedPosts = saved.map(item=>item.post)
      console.log("Saved posts fetched:", savedPosts);

      res.status(200).json({userPosts, savedPosts});
    } catch (err) {
      console.error("Error in profilePosts controller:", err);
      res.status(500).json({ message: "Failed to get profile Posts" });
    }
  };