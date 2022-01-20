const CustomError = require('../errors')

const checkPermsissions = (requestUser,resourceUserID)=>{
    if(requestUser.role === 'admin') return;
    if(requestUser.userID === resourceUserID.toString()) return;
    throw new CustomError.UnauthorizedError('not authorized to access this route')
}

module.exports = checkPermsissions;