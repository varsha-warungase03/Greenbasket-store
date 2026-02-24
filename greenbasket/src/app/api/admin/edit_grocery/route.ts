import { auth } from "@/auth";
import uploadonCloudinary from "@/config/cloudinary";
import connectDb from "@/config/db";
import Grocery from "@/models/grocery.model";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    try {
      await connectDb();
  
      const session = await auth();
      if (session?.user?.role !== "admin") {
        return NextResponse.json(
          { message: "you are not admin" },
          { status: 403 }
        );
      }
  
      const formData = await req.formData();
  
      const groceryId = formData.get("groceryId") as string;
      const name = formData.get("name") as string;
      const category = formData.get("category") as string;
      const unit = formData.get("unit") as string;
      const price = formData.get("price") as string;
      const file = formData.get("image") as Blob | null;
  
      const updateData: any = {
        name,
        category,
        unit,
        price: Number(price),
      };
  
      if (file && file.size > 0) {
        updateData.image = await uploadonCloudinary(file);
      }
  
      const grocery = await Grocery.findByIdAndUpdate(
        groceryId,
        updateData,
        { new: true }
      );
  
      return NextResponse.json(grocery, { status: 200 });
  
    } catch (error) {
      return NextResponse.json(
        { message: `edit grocery error ${error}` },
        { status: 500 }
      );
    }
  }


  