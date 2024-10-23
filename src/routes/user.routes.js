import { Router } from "express";
import {registerUser , loginUser , logoutUser , refreshAccessToken} from "../controllers/user.Controller.js";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/auth.js"

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name : "avtar",
            maxCount : 1
        },
        {
            name : "coverimage",
            maxCount : 1
        }

    ]),
    registerUser
)

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refreshtoken").post(refreshAccessToken)
export default router
