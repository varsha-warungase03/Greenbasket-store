import { auth } from "@/auth";
import connectDb from "@/config/db";
import emitEventHandler from "@/config/emitEvent";
import DeliveryAssignment from "@/models/delivery.model";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(res:NextRequest,context:{params:Promise<{id:string;}>;}){
    try {
        await connectDb()
        const {id}=await context.params
        const session=await auth()
        const deliveryBoyId=session?.user?.id

            if(!deliveryBoyId){
                return NextResponse.json({message:"unauthorize"},{status:400})
            }

            const assignment=await DeliveryAssignment.findById(id)
            if(!assignment){
                return NextResponse.json({message:"assignment not found"},{status:400})
            }

            if(assignment.status !== "broadcasted"){
                return NextResponse.json({message:"assignment expired"},{status:400})
            }

            const alreadyAssigned=await DeliveryAssignment.findOne({
                assignedTo:deliveryBoyId,
                status:{$nin :["broadcasted","completed"]}
            })
            if(alreadyAssigned){
                return NextResponse.json({message:"already assgned to other order"},{status:400})
            }

            assignment.assignedTo=deliveryBoyId
            assignment.status="assigned"
            assignment.acceptedAt=new Date()
            await assignment.save()

            const order=await Order.findById(assignment.order)

            if(!order){
                return NextResponse.json({message:"order not found"},{status:400})
            }

            order.assignedDeliveryBoy=deliveryBoyId
            await order.save()

            await order.populate("assignedDeliveryBoy")
            await emitEventHandler("order-assigned",{orderId:order._id, assignedDeliveryBoy:order.assignedDeliveryBoy})

            await DeliveryAssignment.updateMany({_id:{$ne:assignment._id},
            broadcastedTo:deliveryBoyId,
            status:"broadcasted"
        },
        {
            $pull:{broadcastedTo:deliveryBoyId} 
        })
        
        return NextResponse.json({message:"order accepted succesfully"},{status:200})

    } catch (error) {
        return NextResponse.json({message:`accept assignment error ${error}`},{status:400})
    }
}