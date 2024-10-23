import mongoose , {Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from 'dotenv';
dotenv.config();


const userSchema = new Schema({
    username :{
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true
    },

    email :{
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true
    },

    fullname :{
        type : String,
        required : true,
        trim : true,
        index : true,
    },

    avtar :{
        type : String, // cloudnary 
        required : true,
    },

    coverimage :{
        type : String, // cloudnary 
    },

    watchhistory :[
        {
            type : Schema.Types.ObjectId,
            ref : "video"
        }
    ],

    password : {
        type : String,
        required : [true, " password is required"]
    },
    refreshtoken :{
        type : String
    }
},
{
    timestamps : true
});

userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password,8)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
        return await bcrypt.compare(password,this.password)
}

userSchema.methods.isGenerateAccessToken = function () {
    return jwt.sign(
        { 
            _id: this._id,
            email: this.email,
            username : this.username

        }, 
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.isGenerateRefreshToken = function ()  {
    return jwt.sign(
        { 
            _id: this._id,

        }, 
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema)

