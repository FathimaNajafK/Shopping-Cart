var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { response } = require('express')
// var objectId=require('mongodb').ObjectId
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const Razorpay = require('razorpay');
const { resolve } = require('path');

var instance = new Razorpay({
    key_id: 'rzp_test_QYx0u2Wmrhbq6m',
    key_secret: 'Ym4F8PyMkTrUyuCBZAC51tbs',
});


module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            //  userData.password=  salt=   await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, 10)

            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(data)

            });
        });

    },

    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                // check if password matches    
                bcrypt.compare(userData.password, user.password).then((status) => {
                    console.log(user.password)
                    console.log(userData.password)

                    if (status) {
                        console.log("login success");
                        response.user = user
                        response.status = true
                        resolve(response)

                    } else {

                        console.log('login failed');
                        resolve({ status: false })

                    }
                })
            } else {
                console.log("login falied")
                resolve({ status: false })
            }
        })

    },

    addToCart: (proId, userId) => {
        let productId = new mongoose.Types.ObjectId(proId)
        let proObj = {
            item: productId,
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            console.log("yes")
            //  let productId=new mongoose.Types.ObjectId(proId)
            let convertUserId = new mongoose.Types.ObjectId(userId)
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: convertUserId })
            if (userCart) {
                let proExist = userCart.product.findIndex(product => product.item == proId)
                console.log(proExist);
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: convertUserId, 'product.item': productId },
                            {
                                $inc: { 'product.$.quantity': 1 }
                            }
                        ).then(() => {
                            resolve()
                        })
                }
                else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: convertUserId },
                        {

                            $push: { product: proObj }

                        }
                    ).then((response) => {
                        resolve()
                    })
                }
            }
            else {
                let cartObj = {
                    user: convertUserId,
                    product: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }

        })
    },

    getCartProducts: (userId) => {
        console.log(userId)
        console.log("done")
        return new Promise(async (resolve, reject) => {
            let cartId = new mongoose.Types.ObjectId(userId)
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: cartId }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        item: '$product.item',
                        quantity: '$product.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }

                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }


            ]).toArray()

            resolve(cartItems)
        })
    },



    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let countId = new mongoose.Types.ObjectId(userId);
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: countId });


            // Check if cart and cart.products are not undefined
            if (cart && cart.product) {
                count = cart.product.length
            }

            resolve(count);
        });
    },

    changeProductQuantity: (details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)

        console.log(details)
        console.log("reached")
        details.count = parseInt(details.count)
        return new Promise((resolve, reject) => {
            let productId = new mongoose.Types.ObjectId(details.product)
            let Id = new mongoose.Types.ObjectId(details.cart)
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: Id },
                        {
                            $pull: { product: { item: productId } }
                        }

                    ).then((response) => {
                        resolve({ removeProduct: true })
                    })
            }
            else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: Id, 'product.item': productId },
                        {
                            $inc: { 'product.$.quantity': details.count }
                        }
                    ).then((response) => {
                        resolve({ status: true })
                    })
            }
        })
    },

    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log("wait")
            let cartId = new mongoose.Types.ObjectId(userId)
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: cartId }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        item: '$product.item',
                        quantity: '$product.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }

                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        // _id:null,
                        // total:{$sum:{$multiply:['$quantity','$product.Price']}}

                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', { $convert: { input: '$product.Price', to: 'int' } }] } }
                    }
                }

            ]).toArray()
            console.log(total);
            resolve(total[0].total)
        })
    },

    placeOrder: (order, products, total) => {
        return new Promise((resolve, reject) => {
            // let orderId=new mongoose.Types.ObjectId(order)
            console.log(order, products, total);
            let status = order['payment-method'] === 'COD' ? 'placed' : 'pending'
            let orderObj = {
                deliveryDetails: {
                    mobile: order.mobile,
                    address: order.address,
                    pincode: order.pincode
                },
                userId: new ObjectId(order.userId),
                paymentMethod: order['payment-method'],
                products: products,
                totalAmount: total,
                status: status,
                date: new Date()
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collection.CART_COLLECTION).deleteOne({ userId: new ObjectId(order.userId) })
                console.log("order id:", response.insertedId)
                resolve(response.insertedId)
            })
        })

    },

    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartId = new mongoose.Types.ObjectId(userId)
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: cartId })
            resolve(cart.product)
        })
    },

    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log(userId);
            let orders = await db.get().collection(collection.ORDER_COLLECTION).
                find({ userId: new ObjectId(userId) }).toArray()
            console.log(orders);
            resolve(orders)
        })
    },

    getOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let Id = new mongoose.Types.ObjectId(orderId)
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: Id }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }

                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }


            ]).toArray()
            console.log(orderItems)
            resolve(orderItems)
        })

    },

    // generateRazorpay: (orderId, total) => {
    //     console.log(orderId);
    //     return new Promise((resolve, reject) => {
    //         var options = {
    //             amount: total,  // amount in the smallest currency unit
    //             currency: "INR",
    //             receipt: "" + orderId
    //         };
    //         instance.orders.create(options, function (err, order) {

    //             if (err) {
    //                 console.log(err);
    //             }
    //             else {
    //                 console.log("New order:", order);
    //                 resolve(order)
    //             }
    //         });
    //     })
    // },

    generateRazorpay: (orderId, total) => {
        console.log("Input orderId:", orderId);
        return new Promise((resolve, reject) => {
            var options = {
                amount: total*100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: "" + orderId
            };
    
            console.log("Options before creating order:", options);
    
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log("Error creating order:", err);
                    reject(err);
                } else {
                    console.log("New order:", order);
                    resolve(order);
                }
            });
        });
    },
    

    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');

            let hmac = crypto.createHmac('sha256', 'Ym4F8PyMkTrUyuCBZAC51tbs');

            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);

            hmac=hmac.digest('hex')
            if(hmac==details['payment[razorpay_signature]']){
                resolve()
            }
            else{
                reject()
            }
        })
    },

    changePaymentStatus:(orderId)=>{
        return new Promise((resolve,reject)=>{
            let Id = new mongoose.Types.ObjectId(orderId)
            db.get().collection(collection.ORDER_COLLECTION).
            updateOne({_id:Id},
                {
                    $set:{
                        status:'placed'
                    }
                }
                ).then(()=>{
                    resolve()
                })
        })
    }
}

