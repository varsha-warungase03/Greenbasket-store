import connectDb from "@/config/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb()
        const { message, role } = await req.json()

        const prompt = `You are a professional delivery assistant chatbot.
    You will be given:
    -role:either "user" or "delivery_boy"
    -last message:the last message sent in the conversation
    
    Your task:
    👉 If role is "user" → generate 3 short whatsApp-style suggestions that a user could send to the delivery boy.
    👉 If role is "delivery_boy" → generate 3 short whatsApp-style suggestions that a delivery boy could send to the user.
    
    ⚠️Follow these rules:
    -Replies must match the context of the last message.
    -keep replies short, human-like (max  5-6 words).-Use emojis naturally (max one per reply).
    -No generic replies like "okay" or "thank you".
    -Must be helpful, respectful, and relevant to delivery, status,help or location.
    -No numbering ,N extra instructions,No extra text.
    -Just return comma-separated reply suggestions.
    
    Return only the three reply suggestions.comma-separated.
    Role:${role}
    Last message:${message}`

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "contents": [
                    {
                        "parts": [
                            {
                                "text": prompt
                            }
                        ]
                    }
                ]
            })
        })

        const data=await response.json()
        const replyText=data.candidates?.[0].content.parts?.[0].text || ""
        const suggestions=replyText.split(",")
        .map((s:string)=>s.trim())
        


        return NextResponse.json(
            suggestions,{status:200}
        )
        // console.log(data);
    } catch (error) {
        return NextResponse.json(
            {message:`gemini error ${error }`},{status:200}
        )
    }
}