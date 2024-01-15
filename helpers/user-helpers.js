var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { response } = require('express')
// var objectId=require('mongodb').ObjectId
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');


module.exports={
    doSignup:(userData)=>{
        return new Promise (async(resolve,reject)=>{
        //  userData.password=  salt=   await bcrypt.genSalt(10);
        userData.password=await bcrypt.hash(userData.password,10)
               
                  db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                    resolve(data) 
                                    
                });
                });
             
     },
        
     doLogin:(userData)=>{
        return new Promise(async (resolve, reject)=> {
            let loginStatus = false
            let response = {}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({ email:userData.email })
             if (user) {
// check if password matches    
       bcrypt.compare(userData.password,user.password).then((status)=> {
                console.log(user.password)
                console.log(userData.password)
              
                    if(status){
                        console.log("login success");
                        response.user=user
                        response.status=true
                        resolve(response)

                    }else{

                        console.log('login failed');
                        resolve({status:false})

                    }
                })
            }else{
                console.log("login falied")
                resolve({status: false})
            }
        })

    },

    addToCart:(proId,userId)=>{
        return new Promise(async(resolve,reject)=>{
            let productId=new mongoose.Types.ObjectId(proId)
            let convertUserId=new mongoose.Types.ObjectId(userId)
           let userCart= await db.get().collection(collection.CART_COLLECTION).findOne({user:convertUserId})
           if(userCart){
                db.get().collection(collection.CART_COLLECTION).updateOne({user: convertUserId},
                {
                    
                        $push:{product:productId}
                    
                }
                ).then((response)=>{
                    resolve()
                })
           }
           else{
            let cartObj={
                user: convertUserId,
                product:[productId]
            }
            db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                resolve()
            })
           }
        })
    },

    getCartProducts:(userId)=>{
        console.log(userId)
        return new Promise(async(resolve,reject)=>{
            let cartId=new mongoose.Types.ObjectId(userId)
            let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
                $match:{user:cartId}
            },
            {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    let:{prodList:'$product'},
                    pipeline:[
                        {
                            $match:{
                                $expr:{
                                    $in:['$_id','$$prodList']
                                }
                            }
                        }
                    ],
                    as:'cartItems'
                }
            }
        ]).toArray()
        console.log(cartItems)
        resolve(cartItems)
        })
    },

    // getCartCount:(userId)=>{
    //     return new Promise(async(resolve,reject)=>{
    //         let count=0
    //         let countId=new mongoose.Types.ObjectId(userId)
    //         let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:countId})
    //         if(cart){
    //             count=cart.products.length
    //         }
    //         resolve(count)
    //     })
    // }

    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let countId = new mongoose.Types.ObjectId(userId);
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: countId });
    
            // Check if cart and cart.products are not undefined
            if (cart && cart.products) {
                count = cart.products.length
            }
    
            resolve(count);
        });
    }
    
  
}



