import connectDb from "@/config/db";
import emitEventHandler from "@/config/emitEvent";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req:NextRequest){
    try {
        await connectDb()
        const {userId,items,paymentMethod,totalAmount,address}=await req.json()

        if(!items || !userId || !paymentMethod ||  !totalAmount || !address){
            return NextResponse.json(
                {message:"send all credentials"},
                {status:400}
               )  
        }

        const user=await  User.findById(userId)
        if(!user){
           return NextResponse.json(
            {message:"user not found"},
            {status:400}
           ) 
        }
        const newOrder=await Order.create({
            user:userId,
            items,
            paymentMethod,
            totalAmount,
            address
        })

        await emitEventHandler("new-order",newOrder)

        return NextResponse.json(
            newOrder,
            {status:201}
        )
    } catch (error) {
        return NextResponse.json(
            {message:`place order error ${error}`},
            {status:500}
        )
    }
}