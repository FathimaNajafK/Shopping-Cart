var express = require('express');
// const {render}=require('../app');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers');
const { route } = require('./admin');
const dbConnection = require('../config/connection');


// const verifyLogin=(req,res,next)=>{
//   if(req.session.loggedIn){
//     next()
//   }
//   else{
//     res.redirect('/login')
//   }
// }

/* GET users listing. */
router.get('/', function(req, res, next) {

  productHelpers.getAllProducts().then((products)=>{
    console.log(products);
    res.render('admin/view-products',{admin:true,products});
  })

});


router.get("/add-product",function(req,res){
  res.render('admin/add-product')
})
router.post("/add-product",(req,res)=>{
  console.log(req.body);
  console.log(req.files.Image);

  productHelpers.addProduct(req.body,(id)=>{
    let image=req.files.Image
    image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.render("admin/add-product")
      }
      else{
        console.log(err)
      }
    })
    
   
  })


})

router.get('/admin/delete-product/:id',(req,res)=>{
  let proId=req.params.id
  console.log(proId)
  console.log("hello")
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/')
  })
})

router.get('/admin/edit-product/:id', async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id);
  console.log(product);
  res.render('admin/edit-product',{product});  
});

router.post('/admin/edit-product/:id',(req,res)=>{
  console.log(req.params.id);
  let id=req.params.id;
  productHelpers.updateProduct(id,req.body).then(()=>{
    res.redirect('/admin');
    if(req.files.Image){
      let image=req.files.Image
      image.mv('./public/product-images/'+id+'.jpg')
    }
})
})
module.exports = router;
