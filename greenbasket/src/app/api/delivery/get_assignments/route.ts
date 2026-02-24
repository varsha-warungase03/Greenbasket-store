import { auth } from "@/auth";
import connectDb from "@/config/db";
import DeliveryAssignment from "@/models/delivery.model";
import { NextResponse } from "next/server";
import "@/models/order.model"

export async function GET(){
    try {
        await connectDb()
        const session=await auth()
        const assignments=await DeliveryAssignment.find({
            broadcastedTo:session?.user?.id,
            status:"broadcasted"
        }).populate({
            path: "order",
            populate: {
              path: "user" 
            }
          });
        return NextResponse.json(
            assignments,
            {status:200}
        )
    } catch (error) {
        return NextResponse.json(
           {message:`get assignment error ${error}`},
            {status:200}
        )
    }
}