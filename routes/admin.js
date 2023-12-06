var express = require('express');
// const {render}=require('../app');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers');

// const dbConnection = require('../config/connection');

/* GET users listing. */
router.get('/', function(req, res, next) {

  let products=[
    {
      Name:"Iphone 15",
      Category:"mobile",
      Description:"good mobile",
      Image:"https://th.bing.com/th/id/OIP.pwYgLdJTd7JAb6bNAVy0MAHaHa?rs=1&pid=ImgDetMain"
    },
    {
      Name:"Samsung s23",
      Category:"mobile",
      Description:"good mobile",
      Image:"https://th.bing.com/th/id/OIP.EpOneILOTSgWrM5_jwb-5QHaHa?w=196&h=196&c=7&r=0&o=5&dpr=1.5&pid=1.7"
    },
    {
      Name:"Oppo",
      Category:"mobile",
      Description:"good mobile",
      Image:"https://th.bing.com/th/id/OIP.pwYgLdJTd7JAb6bNAVy0MAHaHa?rs=1&pid=ImgDetMain"
    },
    {
      Name:"Iphone 11",
      Category:"mobile",
      Description:"good mobile",
      Image:"https://th.bing.com/th/id/OIP.7HTpW4qNsT3tsVOnz8Wv4wHaFj?w=287&h=215&c=7&r=0&o=5&dpr=1.5&pid=1.7"
    }

  ]
  res.render('admin/view-products',{admin:true,products});
});


router.get("/add-product",function(req,res){
  res.render('admin/add-product')
})
router.post("/add-product",(req,res)=>{
  

  console.log(req.body);
  // console.log(req.files.Image);

  productHelpers.addProduct(req.body,(result)=>{
    res.render("admin/add-product")
    console.log(result)
  })
})

module.exports = router;
