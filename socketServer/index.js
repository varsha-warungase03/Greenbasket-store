
import express from "express";
import http from "http"
import dotenv from "dotenv"
import axios from "axios";
import { Server } from "socket.io";
dotenv.config()
const app=express()
app.use(express.json())


const server=http.createServer(app)
const port=process.env.PORT || 5000

const io=new Server(server,{
    cors:{
        origin:process.env.NEXT_BASE_URL
    }
})

io.on("connection",(socket)=>{
    

    socket.on("identity",async (userId)=>{
        
        await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/connect`,{userId,socketId:socket.id})
    })

    socket.on("update-location", async({userId,latitude,longitude})=>{
        const location={
            type:"Point",
            coordinates:[longitude,latitude]
        }
        await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/update-location`, {userId,location})
        
        io.emit("update-delivery-location",{userId,location})
    })

   socket.on("join-room", (roomId)=>{
    console.log("join room", roomId);
    socket.join(roomId)
   })

   socket.on("send-message", async(message)=>{
    console.log(message);
    if (!message.roomId) return;

     const roomId = message.roomId.toString();

    const payload = { ...message, roomId };

    

    await axios.post(`${process.env.NEXT_BASE_URL}/api/chat/save`,payload)
    io.to(roomId).emit("send-message",payload)
   })

    socket.on("disconnect", ()=>{
        console.log("user disconnect",socket.id);
    })
})

app.post("/notify",(req,res)=>{
    const {event,data,socketId}=req.body;
    if(socketId){
        io.to(socketId).emit(event,data)
    }else{
        io.emit(event,data);
    }
    return  res.status(200).json({"success":true})
})

server.listen(port,()=>{
    console.log("server started at", port);
})