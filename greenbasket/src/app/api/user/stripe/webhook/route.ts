import connectDb from "@/config/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";


const stripe=new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req:NextRequest){
    const sig=req.headers.get("stripe-signature")
    const rawBody=await req.text()
    let event;
    try {
        event=stripe.webhooks.constructEvent(
            rawBody,
            sig!,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    if(event.type==="checkout.session.completed"){
        
        const session = event.data.object as Stripe.Checkout.Session

        const orderId = session.metadata?.orderId
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID missing in metadata" },
        { status: 400 }
      )
    }

        await connectDb()
        

        await Order.findByIdAndUpdate(orderId, {
            isPaid: true,
            paidAt: new Date(),
            status: "pending", 
            paymentResult: {
              id: session.id,
              status: session.payment_status,
              email: session.customer_details?.email,
            },
          })
        
      
    }

    return NextResponse.json({recieved:true},{status:200})

}