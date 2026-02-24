import connectDb from "@/config/db";
import emitEventHandler from "@/config/emitEvent";
import DeliveryAssignment from "@/models/delivery.model";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    try {
        await connectDb()
        const {orderId,otp}=await req.json()
        if(!orderId || !otp){
            return NextResponse.json(
                {message:"orderId or otp  not found"},
                {status:400}
            )
        }

        const order=await Order.findById(orderId)

        if(!order){
            return NextResponse.json(
                {message:"order not found"},
                {status:400}
            )
        }

    if(order.deliveryOtp !== otp){
        return NextResponse.json(
            {message:"incorrect or expired otp"},
            {status:400}
        )
    }

    order.status="delivered"
    order.deliveryOtpVerify=true
    order.deliveredAt=new Date()

    await order.save()
    await emitEventHandler("order-status-update", { orderId: order._id, status: order.status })


    await DeliveryAssignment.updateOne(
        {order:orderId},
        {$set :{assignedTo:null, status:"completed"}}
    )

    return NextResponse.json(
        {message:"delivery successfully completed"},
        {status:200}
    )

    } catch (error) {
        return NextResponse.json(
            {message:`verify otp error ${error}`},
            {status:500}
        )
    }
}