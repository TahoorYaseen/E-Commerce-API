const {isTokenValid} = require('../utils');
const CustomError = require('../errors');

const authenticateUser = async (req,res,next)=>{
    const token = req.signedCookies.token
    if(!token){
        throw new CustomError.UnauthenticatedError('Authentication Invalid')
    }
    try {
        const {name,userID,role} = isTokenValid({token});
        req.user = {name,userID,role}
         next()
    } catch (error) {
         throw new CustomError.UnauthenticatedError('Authentication Invalid')
    }
}

const authorizePermissions = (...roles)=>{
   return (req,res,next)=>{
       if(!roles.includes(req.user.role)){
           throw new CustomError.UnauthorizedError('not authorized to this route')
       }
       next();
   } 
}

// const authorizePermissions = (req,res,next)=>{
//     if(req.user.role !== 'admin'){
//          throw new CustomError.UnauthorizedError('not authorized to this route')
//     }
//     next()
// }
module.exports = {authenticateUser,authorizePermissions}