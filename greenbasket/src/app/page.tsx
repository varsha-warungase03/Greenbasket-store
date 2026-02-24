import { auth } from "@/auth";
import AdminDashboard from "@/component/AdminDashboard";
import DeliveryBoy from "@/component/DeliveryBoy";
// import DeliveryBoy from "@/component/DeliveryBoy";
import Editrole from "@/component/Editrole";
import Footer from "@/component/Footer";
import Geoupdater from "@/component/Geoupdater";
import Nav from "@/component/Nav";
import UserDashboard from "@/component/UserDashboard";


import connectDb from "@/config/db";
import Grocery, { IGrocery } from "@/models/grocery.model";
import User from "@/models/user.model";
import { redirect } from "next/navigation";


export  default  async function Home(props:{
  searchParams:Promise<{
    q:string
  }>
}) {

const searchParams=await props.searchParams


  await connectDb();
  const session=await auth()
  
  const user=await  User.findById(session?.user?.id)

  if(!user){
    redirect("/login")
  }

  const inComplete=!user.mobile || !user.role || (!user.mobile && user.role);


  if(inComplete){
    return <Editrole/>
  }

  const plainUser=JSON.parse(JSON.stringify(user));
  

  let groceryList :IGrocery[]=[]

  if(user.role==="user"){
   
    if(searchParams.q){
      groceryList=  await Grocery.find({
        $or:[
          {name:{ $regex: searchParams?.q || "", $options: "i"}},
          {category:{ $regex: searchParams?.q || "", $options: "i"}},
        ]
      }).lean()
    }else{
      groceryList=await Grocery.find({}).lean()
      
    }
  }
 
  return (
    <>
   
     <Nav user={plainUser}/>
     <Geoupdater userId={plainUser._id}/>
    {user.role=="user" ? (
      <UserDashboard  groceryList={groceryList}/>
    ) : user.role=="admin" ? (
      <AdminDashboard/>
    ) : <DeliveryBoy/>}
      <Footer/>
    </>
  );
}

