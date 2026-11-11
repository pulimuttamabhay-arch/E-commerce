import categorymodel from '../Models/Category.js';

// export const addcategory = async (req,res)=>{
//   try {
//     console.log('client request detail:',req.body)
//     const{cname,cdesc,status} = req.body

//     const newcategory = new categorymodel({
//       name:cname,
//       description:cdesc,
//       status:status,
//       image: req.file ? req.file.filename : ''
//     })

//     await newcategory.save()
//     console.log('saved category:', newcategory)
//     res.status(200).json({message:'Category added successfully',newcategory})
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({
//       message:'sever error',error
//     })
//   }
// }




export const addcategory = async (req, res) => {
  try {
    console.log('Client request detail:', req.body);

    const { cname, cdesc, status } = req.body;

    if (!cname || !cname.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    // Check whether the category already exists.
    const existingCategory = await categorymodel.findOne({
      name: cname.trim(),
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: 'This category already exists',
      });
    }

    const category = await categorymodel.create({
      name: cname.trim(),
      cdesc,
      status,
    });

    return res.status(201).json({
      success: true,
      message: 'Category added successfully',
      category,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This category already exists',
      });
    }

    console.error('Add category error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to add category',
    });
  }
};

export const viewcategory = async (req,res)=>{
  try {
    console.log('request details',req)
    const allcategory= await categorymodel.find()
    res.status(200).json({message:'All Category:',allcategory})

  } catch (error) {
    console.log(error)
    res.status(500).json({message:'Server Error:',error})
  }
}

export const deletecategory = async (req,res)=>{
try {
        const { cid } = req.params
        console.log("Deleting Category Id:", cid)
        const dCategory = await categorymodel.findByIdAndDelete(cid)
        console.log("Deleted Category : ", dCategory)
        res.status(200).json({ message: 'Category Deleted ',dCategory })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server Error' })
    }
}

export const updatecategory = async (req,res)=>{
  try {
    const {cid}= req.params
    const {cname,cdesc,status}=req.body

    const updatedata = {
      name:cname,
      description:cdesc,
      status:status
    }

    if(req.file){
      updatedata.image = req.file.filename
    }

    const updatecategory = await categorymodel.findByIdAndUpdate(
      cid,
      updatedata,
      {new:true}
    )

    console.log('category ',updatecategory)
    res.status(200).json({message:'Category updated successfully',updatecategory})
  } catch (error) {
    console.log(error)
    res.status(500).json({message:'Internal Server Error',error})
  }
}

export const getcategory = async (req,res)=>{
  try {
    const {cid}=req.params
    const singleCategory = await categorymodel.findById(cid)
    console.log('category fletched by id :',singleCategory)
    res.status(200).json({message:'category founded : ',singleCategory})
  } catch (error) {
    console.log(error)
    res.status(500).json({message:'Internal Server Error',error})
  }
}