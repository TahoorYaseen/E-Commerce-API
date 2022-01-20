const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')
const {checkPermsissions} = require('../utils')
const Product = require('../models/product')
const Review = require('../models/Review')

const createReview = async(req,res)=>{
    
    const {product:productID} = req.body
    const isProductValid = await Product.findOne({_id:productID})
    if(!isProductValid){
        throw new CustomError.NotFoundError(`no product with id ${productID}`)
    }
    const alreadySubmitted = await Review.findOne({product:productID,user:req.user.userID})
    if(alreadySubmitted){
        throw new CustomError.BadRequestError('already submitted review')
    }
    req.body.user = req.user.userID
    const review = await Review.create(req.body)
    res.status(StatusCodes.CREATED).json({review})
}
const getAllReviews = async(req,res)=>{
    const reviews = await Review.find({}).populate({path:'product',select:'name price company'});
    res.status(StatusCodes.OK).json({reviews,count:reviews.length})
}
const getSingleReview = async(req,res)=>{
    const {id:reviewID} = req.params
    const review = await Review.findOne({_id:reviewID})
    if(!review){
        throw new CustomError.BadRequestError(`no review with id ${reviewID}`);
    }
    res.status(StatusCodes.OK).json({review});
}
const updateReview = async(req,res)=>{
    const {id:reviewID} = req.params
    const review = await Review.findOne({_id:reviewID})
    if(!review){
        throw new CustomError.BadRequestError(`no review with id ${reviewID}`);
    }
    const {rating,title,comment} = req.body
    checkPermsissions(req.user,review.user)
    review.rating = rating;
    review.title = title;
    review.comment = comment;
    await review.save();
    res.status(StatusCodes.OK).json({review})
}
const deleteReview = async(req,res)=>{
    const {id:reviewID} = req.params
    const review = await Review.findOne({_id:reviewID})
    if(!review){
        throw new CustomError.BadRequestError(`no review with id ${reviewID}`);
    }
    checkPermsissions(req.user,review.user)
    await review.remove();
    res.status(StatusCodes.OK).json({msg:`successfully deleted review`})
}

const getSingleProductReviews = async(req,res)=>{
    const {id:productID} = req.params;
    const reviews = await Review.find({product:productID})
    res.status(StatusCodes.OK).json({reviews})
}

module.exports = {createReview,getAllReviews,getSingleReview,updateReview,deleteReview,getSingleProductReviews}