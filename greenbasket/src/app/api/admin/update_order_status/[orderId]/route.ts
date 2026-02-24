import connectDb from "@/config/db";
import emitEventHandler from "@/config/emitEvent";
import DeliveryAssignment from "@/models/delivery.model";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, context:{params:Promise<{orderId:string;}>;}) {

    try {
        await connectDb()
        const { orderId } =await context.params
        const { status } = await req.json()
        const order = await Order.findById(orderId).populate('user')

        if (!order) {
            return NextResponse.json(
                { message: "order not found" },
                { status: 400 }
            )
        }

        order.status = status
        let DeliveryBoysPayload: any[] = []

        // && !order.assignment
        if (status === "out of delivery") {

            const activeAssignment = await DeliveryAssignment.findOne({
                order: order._id,
                status: { $in: ["completed", "cancelled"] },
            });

            const latitude = Number(order.address.latitude);
      const longitude = Number(order.address.longitude);

            
            const nearByDeliveryBoys = await User.find({
                role: "deliveryBoy",
                location: {
                    $near: {
                        $geometry: {
                             type: "Point", coordinates: [longitude, latitude],
                        },
                        $maxDistance: 800000
                    }
                }

            });

            // console.log("Total delivery boys:", nearByDeliveryBoys.length);
            // console.log("Sample location:", nearByDeliveryBoys[0]?.location);

            const nearByIds = nearByDeliveryBoys.map((b) => b._id)
            const busyIds = await DeliveryAssignment.find({
                assignedTo: { $in: nearByIds },
                status: { $nin: ["broadcasted", "completed"] }
            }).distinct("assignedTo")
            const busyIdSet = new Set(busyIds.map(b => String(b)))
            const availableDeliveryBoys = nearByDeliveryBoys.filter(
                b => !busyIdSet.has(String(b._id))
            )
            const candidates = availableDeliveryBoys.map(b => b._id)

            if (candidates.length == 0) {
                await order.save()

                await emitEventHandler("order-status-update", { orderId: order._id, status: order.status })

                return NextResponse.json(
                    { message: "NO Delivery boys available.." },
                    { status: 200 }
                )
            }

            const deliveryAssignment = await DeliveryAssignment.create({
                order: order._id,
                broadcastedTo: candidates,
                status: "broadcasted"
            })

            for (const boyId of candidates) {
                const boy = await User.findById(boyId)
                if (boy.socketId) {
                    await emitEventHandler("new-assignment", deliveryAssignment, boy.socketId)
                }
            }

            order.assignment = deliveryAssignment._id,
                DeliveryBoysPayload = availableDeliveryBoys.map(b => ({
                    id: b._id,
                    name: b.name,
                    mobile: b.mobile,
                    latitude: b.location.coordinates[1],
                    longitude: b.location.coordinates[0]
                }))
            await deliveryAssignment.populate("order")


        }
        await order.save()
        await order.populate("user")
        await emitEventHandler("order-status-update", { orderId: order._id, status: order.status })

        return NextResponse.json({
            assignment: order.assignment?._id,
            availablBoys: DeliveryBoysPayload
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json(
            { message: `update status eror ${error}` },
            { status: 500 })
    }
}