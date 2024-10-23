const asyncHandler = (requestHandler) =>{
    return (req,res,next) =>{
        Promise.resolve(requestHandler(req,res,next)).catch((err) => {
            next(err);
        })
    }
}

export {asyncHandler}

// const asyncHandler = async (fn) = async (req,res,next) =>{
//     try {
//         await fn(req,res,next)
//     }
//     catch (error) {
//         res.status(err.code || 500).json( {
//             message: err.message,
//             status: err.status || 'error',
//             sucess : false
//         })
//         }
// }