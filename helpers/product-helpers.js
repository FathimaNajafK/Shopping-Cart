var db = require('../config/connection');
var collection=require('../config/collections');
const { response } = require('../app');
var objectId=require('mongodb').ObjectId
const mongoose = require('mongoose');


module.exports = {
    addProduct: (product, callback) => {
        console.log(product);
        db.get().collection('product').insertOne(product, (err, data) => {
            if (err) {
                console.error('Error inserting product:', err);
                return callback(err);
            }
            callback(data.insertedId);
        });
    },
    getAllProducts:()=>{
        return new Promise(async(resolve, reject) => {
            let products= await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },

    deleteProduct:(proId)=>{
        return new Promise((resolve, reject) => {
            console.log("okay")
            let Id=new mongoose.Types.ObjectId(proId)
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:Id}).then((response)=>{
                console.log(response);
                console.log("done");
                resolve(response)
            })
        })
    },

    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            let productId=new mongoose.Types.ObjectId(proId)
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:productId}).then((product)=>{
                resolve(product)
            })
        })
    },

    updateProduct: (proId, proDetails) => {
        return new Promise((resolve, reject) => {
            // Convert proId to ObjectId
            let updateId = new mongoose.Types.ObjectId(proId);
    
            // Update document in the collection
            db.get().collection(collection.PRODUCT_COLLECTION)
                .updateOne(
                    { _id: updateId },
                    {
                        $set: {
                            Name: proDetails.Name,
                            Description: proDetails.Description,
                            Price: proDetails.Price,
                            Category: proDetails.Category
                        }
                    }
                )
                .then((response) => {
                    resolve();
                })
                
        });
    }
    
};