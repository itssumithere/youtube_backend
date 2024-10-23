import { User }  from "../models/user.js";
import { ApiErrors } from "../utiles/apiError.js";
import { asyncHandler } from "../utiles/asyncHandler.js";
import jwt from "jsonwebtoken"
import dotenv from 'dotenv';
dotenv.config();
 



export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ", "")
  
    if(!token){
      throw new ApiErrors(401 , "Unauthorized user")
    }
  
    const decodedtoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decodedtoken._id).select(" -password -refreshtoken")
  
    if(!user){
      throw new ApiErrors(400,"invalid access token")
    }

    req.user = user
    next()
  } catch (error) {
        throw new ApiErrors(401, "fail to verify the token")
  }


  


}) 

