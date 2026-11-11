import React from 'react'
import Dashboard from './Components/Dashboard'
import Sidebar from './Components/Sidebar'
import Topbar from './Components/Topbar'
import Signin from './Components/Signin'
import Payment from './Components/Payment'
import Acategory from './Components/Acategory'
import Product from './Components/Product'
import Customer from './Components/Customer'
import Orders from './Components/Orders'
import Report from './Components/Report'
import Review from './Components/Review'
import { BrowserRouter ,Routes , Route, useLocation,Navigate} from 'react-router-dom'
import Inventory from './Components/inventory'
import Updatecat from './Components/Updatecat'
import Updateproduct from './Components/Updateproduct'
import Updatecustomer from './Components/ucustomer'



 function Appcontent() {
  const location = useLocation()
  console.log(location)
  const hideappbar = location.pathname === '/signin' ||
  location.pathname === '/Signin'
  return (
    <div>
      {!hideappbar && <Sidebar/>}
      {!hideappbar && <Topbar/>}
      
     
      <Routes>

        <Route path='/' element={<Navigate to='/signin' replace/>}/>
        <Route path='/Dashboard' element={<Dashboard/>}/>
        <Route path='/signin' element={<Signin/>}/>
        <Route path='/payment' element={<Payment/>}/>
        <Route path='/category' element={<Acategory/>}/>
        <Route path='/addproduct' element={<Product/>}/>
        <Route path='/users' element={<Customer/>}/>
        <Route path='/order' element={<Orders/>}/>
        <Route path='/report' element={<Report/>}/>
        <Route path='/review' element={<Review/>}/>
        <Route path='/Manageproduct' element={<Inventory/>}/>
        <Route path='/updatecat/:cid' element={<Updatecat/>}/>
        <Route path='/updateproduct/:pid' element={<Updateproduct/>}/>
        <Route path='/updatecustomer/:uid' element={<Updatecustomer/>}/>
       
        
       
      </Routes>
      
   

    </div>
  )
}
export default function App() {
  return (
    <div>
      <Appcontent/>
    </div>
  )}