import { asyncHandler } from "../utiles/asyncHandler.js"
import {User} from "../models/user.js"
import  { uploadOnCloudinary } from "../utiles/cloudnary.js"
import { ApiRespones } from "../utiles/apiRespones.js"
import { ApiErrors } from "../utiles/apiError.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const generateAccessandrefreshtoken = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accesstoken = user.isGenerateAccessToken()
        const refreshtoken = user.isGenerateRefreshToken()
        user.refreshtoken = refreshtoken
        await user.save({ validateBeforeSave : false})
        return {accesstoken , refreshtoken }

    } catch (error) {
        throw new ApiErrors(500,"failed to generate token")
    }
}

 const registerUser = asyncHandler(async (req, res) =>{
    // get data from frontend
    // validation - not null
    // user exists
    // files available
    // upload cloudinary
    // save to database
    // get response

    const {fullname , email , username , password} = req.body
    console.log("email: " , email)

    // if(fullname === ""){
    //     return res.status(400).json({message: "Please enter your full name"})
    // }
    // if(email === ""){
    //     return res.status(400).json({message: "Please enter your  email"})
    // }
    // if(username === ""){
    //     return res.status(400).json({message: "Please enter your username"})
    // }
    // if(password === ""){
    //     return res.status(400).json({message: "Please enter your password"})
    // }
    if (
        [fullname , email, username ,password].some((field) => {
            field?.trim() === ""
        })
    ){
            return res.status(400).json({message: "Please enter all fields"})
    } 
    
    const existedUser = await User.findOne({
         $or : [{ username },{ username }]

    })
    if(existedUser){
        return res.status(400).json({message: "Username already exists"})
    }

    const avtarLocalPath = req.files?.avtar?.[0]?.path
    const coverimageLocalPath = req.files?.coverimage?.[0]?.path

    if(!avtarLocalPath){
        return res.status(400).json({message: "Please upload your avtar"})
    }

    const avtarPath = await  uploadOnCloudinary(avtarLocalPath)
    const coverimagePath = await  uploadOnCloudinary(coverimageLocalPath)
    
    
    if(!avtarPath){
        return res.status(500).json({message: "Failed to upload avtar on cloudinary "})
    }

    const user = await User.create({
        fullname ,
        email ,
        username ,
        password ,
        avtar : avtarPath?.url || "" ,
        coverimage : coverimagePath?.url || "" ,
    })

    const userCreated = await User.findById(user._id).select(" -password -refreshtoken")

    if(!userCreated){
        return res.status(500).json({message: "Failed to create user "})
    }

    return res.status(201).json(
        new ApiRespones(200,userCreated , "user has created suceesfully")
    )

 })


 const  loginUser = asyncHandler(async (req,res)=>{

    const {username, email , password} = req.body

    if(!username && !email){
        throw new ApiErrors(404,"username or email id required")
    }
    const user = await User.findOne({
        $or : [{ username },{ email }] 
    })
    if(!user){
        throw new ApiErrors(404,"user no exist")
    }
     
    const isMatch = await user.isPasswordCorrect(password)
    if(!isMatch){
        throw new ApiErrors(404,"password is incorrect")
    }

    const {accesstoken , refreshtoken} = await generateAccessandrefreshtoken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshtoken")
    const option = {
        httpOnly : true,
        secure : true,
    }

    return res
    .status(200)
    .cookie("refreshtoken" , refreshtoken , option)
    .cookie("accesstoken", accesstoken, option)
    .json(new ApiRespones(200,{
        loggedInUser,
        accesstoken,
        refreshtoken
    }, 
    "user logged in sucees"))
    
 })

 const logoutUser = asyncHandler (async (req , res) =>{
    await User.findByIdAndUpdate(req.user._id,
        {
        $set :{
            refreshtoken : undefined
        }
        },
        {
            new: true
        }
    )

    const option = {
        httpOnly : true,
        secure : true,
    }

    return res
    .status(200)
    .clearCookie("accesstoken",option)
    .clearCookie("refreshtoken",option)
    .json(new ApiRespones(200,"user logged out"))
 })

 const refreshAccessToken = asyncHandler(async (req,res)=>{
    try {
        const incomingRefreshToken = req.cookies.refreshtoken || req.body.refreshtoken
        if(!incomingRefreshToken){
            throw new ApiErrors(401,"Unauthorized request")
        }
        const decodedtoken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedtoken?._id)
        if(!user){
            throw new ApiErrors(404,"user not found")
        }
        if (incomingRefreshToken != user?.refreshtoken){
            throw new ApiErrors(401,"Refresh token expired plz login")
        }
    
        const option ={
            httpOnly : true,
            secure : true
        }
    
       const {accesstoken,refreshtoken} = await generateAccessandrefreshtoken(user._id)
         
       return res.status(201)
       .cookie("accesstoken", accesstoken,option)
       .cookie("refreshtoken", refreshtoken,option)
       .json(new ApiRespones(201,"refresh token generated"))
    } catch (error) {
        throw new ApiErrors(404, "token not renewed plz login again")
    }

 })

 const changepassword = asyncHandler(async(req,res)=>{
    const {oldpassword,newpassword} = req.body

    const user = await User.findById(req.user?._id)
    if(!user){
        throw new ApiErrors(404,"user not found")
    }
    const isPasswordCorrect = user.isPasswordCorrect(oldpassword)
    if(!isPasswordCorrect){
        throw new ApiErrors(401,"old password is incorrect")
    }
    user.password = newpassword
    await user.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(new ApiRespones(200,{},"password changed"))
    
 })

 const getuser = asyncHandler(async (req,res) => {
    return res
    .status(200)
    .json(new ApiRespones(200,req.user,"user found"))
 })

 const updateaccount = asyncHandler(async (req,res) =>{
    const {fullname,username} = req.body
    if(!fullname || !username){
        throw new ApiErrors(400,"fullname and username are required")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {   $set :{
            fullname : fullname,
            username : username
            }
        },
        {
            new : true,
        }
    ).select(" -password")

    return res
    .status(200)
    .json(new ApiRespones(200,user,"account updated"))

 })

 const updateavtar = asyncHandler(async (req,res)=>{
    
    const localavtarpath = req.file?.path

    if(!localavtarpath){
        throw new ApiErrors(400,"avtar is required")
    }

    const avtar = await uploadOnCloudinary(localavtarpath)

    if(!avtar.url){
        throw new ApiErrors(400,"avtar upload failed")
    }

    await User.findByIdAndUpdate(req.user?._id,
        {
        $set :{
            avtar : avtar.url
            }
        
        },
        {
            new : true
        }
    ).select("-password")
    return res
    .status(200)
    .json(new ApiRespones(200,req.user,"avtar updated"))

 })

 const updatecoverimage = asyncHandler(async (req,res)=>{
    
    const localcoverimagepath = req.file?.path

    if(!localcoverimagepath){
        throw new ApiErrors(400,"coverimage is required")
    }

    const coverimage = await uploadOnCloudinary(localcoverimagepath)

    if(!coverimage.url){
        throw new ApiErrors(400,"coverimage upload failed")
    }

    await User.findByIdAndUpdate(req.user?._id,
        {
        $set :{
            coverimage : coverimage.url
            }
        
        },
        {
            new : true
        }
    )
    return res
    .status(200)
    .json(new ApiRespones(200,req.user,"coverimage updated"))

 })

 
 export { registerUser, loginUser, logoutUser,refreshAccessToken , changepassword ,getuser , updateaccount , updateavtar , updatecoverimage} 