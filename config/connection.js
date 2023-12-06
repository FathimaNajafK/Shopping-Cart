const mongoClient=require('mongodb').MongoClient
const state={
    db:null
}

module.exports.connect=function(done){
     const url = 'mongodb://localhost:27017' 
    const dbName = 'ShoppingCart'
    console.log("connecting")

    mongoClient.connect(url,(err,data)=>{
        console.log("dbconnect")
        if (err) 
        { console.log(err)
            return done(err)}
        state.db=data.db(dbName)
        console.log("connection establish")
        done()
    })
   
}

module.exports.get=function(){
    return state.db
}
