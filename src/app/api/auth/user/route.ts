import { getAllUsers } from "@/lib/db/store";
import { NextResponse } from "next/server";

// 모든 유저보기

export async function GET(){
    const users = await getAllUsers();

    return new NextResponse(JSON.stringify({ users }), {
        headers: { "Content-Type": "application/json" }
    });
}