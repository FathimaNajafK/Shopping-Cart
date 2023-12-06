
var db=require('../config/connection')

module.exports={

    addProduct:(product,callback)=>{
        console.log(product)
        console.log("reached here")

        
            console.log(db.get())
        db.get().collection('product').insertOne(product).then((data)=>{
            console.log(data)
            callback(data)
        })
   
    }
}
