
import Product from "../Models/Product.js";
import Review from "../Models/Review.js";
import Order from "../Models/Order.js";
  
export const Addproduct = async(req,res)=>{
 try{
  const {pname,pdesc,pprice,pmrp,catid,pstock,pbrand,featured}= req.body
  const uploadedImages = (req.files || []).map(file => file.filename)
  const sellingPrice = Number(pprice)
  const mrp = pmrp === undefined || pmrp === '' ? sellingPrice : Number(pmrp)

  if (!Number.isFinite(sellingPrice) || sellingPrice < 0 ||
      !Number.isFinite(mrp) || mrp < sellingPrice) {
    return res.status(400).json({
      success: false,
      message: 'MRP must be equal to or greater than the selling price'
    })
  }

  const newproduct = new Product({
    name:pname,
    description:pdesc,
    category:catid,
    price:sellingPrice,
    mrp,
    stock:pstock,
    brand :pbrand,
    image:uploadedImages[0] || '',
    images:uploadedImages.slice(1),
    featured:featured === 'true'
  })

  await newproduct.save();

  res.status(200).json({message:'product added',newproduct})

 }catch(error){
  console.log(error)
  res.status(500).json({message:'server error',error:error.message})
 }
}

export const viewproduct = async (req,res)=>{
  try {
    const products = await Product.find().populate('category')
    const productIds = products.map(product => product._id)
    const [reviewStats, purchaseStats] = await Promise.all([
      Review.aggregate([
        {
          $match: {
            product: { $in: productIds },
            isVisible: true
          }
        },
        {
          $group: {
            _id: '$product',
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ]),
      Order.aggregate([
        {
          $match: {
            orderStatus: { $nin: ['Cancelled', 'Returned'] },
            paymentStatus: { $nin: ['Failed', 'Refunded'] },
            'items.product': { $in: productIds }
          }
        },
        { $unwind: '$items' },
        {
          $match: {
            'items.product': { $in: productIds }
          }
        },
        {
          $group: {
            _id: '$items.product',
            totalPurchased: { $sum: '$items.quantity' }
          }
        }
      ])
    ])
    const reviewStatsByProduct = new Map(
      reviewStats.map(stats => [String(stats._id), stats])
    )
    const purchaseStatsByProduct = new Map(
      purchaseStats.map(stats => [String(stats._id), stats.totalPurchased])
    )
    const allproduct = products.map(product => {
      const stats = reviewStatsByProduct.get(String(product._id))

      return {
        ...product.toObject(),
        averageRating: stats ? Number(stats.averageRating.toFixed(1)) : 0,
        totalReviews: stats?.totalReviews || 0,
        totalPurchased: purchaseStatsByProduct.get(String(product._id)) || 0
      }
    })

    console.log('fetched product',allproduct)
    res.status(200).json({message:"fetched all product",allproduct})
  } catch (error) {
    console.log("View Product Error:", error.message)
    res.status(500).json({
      message:'Server Error',
      error: error.message
    })
  }
}

export const deleteproduct = async (req,res)=>{
  try {
    const {pid}= req.params
    console.log('Delete Product',pid)
    const dproduct = await Product.findByIdAndDelete(pid)
    console.log("Product Deleted",dproduct)
    res.status(200).json({message:'Product Deleted',dproduct})

  } catch (error) {
    console.log(error)
    res.status(500).json({message:'Server Error',error:error.message})
    
  }
}



export const updateproduct = async (req,res)=>{
 try {
   console.log('Update product ID:',req.params.pid)
   console.log('Content Type:',req.headers['content-type'])
   console.log('Update product body:',req.body)
   console.log('Uploaded image:',req.file)

   if(!req.body){
     return res.status(400).json({
       message:'Request body is missing. Check Multer middleware and FormData request.'
     })
   }

   const {pid} = req.params
   const {pname,pdesc,pprice,pmrp,catid,pstock,pbrand,featured} = req.body
   const sellingPrice = Number(pprice)
   const mrp = pmrp === undefined || pmrp === ''
     ? sellingPrice
     : Number(pmrp)

   if (!Number.isFinite(sellingPrice) || sellingPrice < 0 ||
       !Number.isFinite(mrp) || mrp < sellingPrice) {
     return res.status(400).json({
       success: false,
       message: 'MRP must be equal to or greater than the selling price'
     })
   }

   const updatedata = {
     name:pname,
     description:pdesc,
     category:catid,
     price:sellingPrice,
     mrp,
     stock:pstock,
     brand:pbrand
   }

   if(featured !== undefined){
     updatedata.featured = featured === 'true' || featured === true
   }

   if(req.file){
     updatedata.image = req.file.filename
   }

   const uproduct = await Product.findByIdAndUpdate(
     pid,
     updatedata,
     {new:true,runValidators:true}
   )

   if(!uproduct){
     return res.status(404).json({message:'Product not found'})
   }

   console.log("update product:",uproduct)

   res.status(200).json({
     message:'Updated Product',
     uproduct
   })

 } catch (error) {
  console.log('Update Product Error:',error.message)

  res.status(500).json({
    message:'Server Error',
    error:error.message
  })
 }
}



export const getproduct = async (req,res)=>{
  try {
    console.log(req.params)
    const {pid}=req.params
    const singleproduct= await Product.findById(pid).populate('category')
   
    if(!singleproduct){
      return res.status(404).json({message:'Product not found'})
    }

    console.log('Product fetched by id',singleproduct)
    res.status(200).json({message:'product found : ',singleproduct})

  } catch (error) {
    console.log(error)
    res.status(500).json({message:'Server Error : ',error:error.message})
  }
}
