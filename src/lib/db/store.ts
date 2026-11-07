import { supabase } from "@/lib/db/dbconn";
import {Users} from "@/types/users"; 

export async function getAllUsers(): Promise<Users[]> {
    const response = await supabase
        .from("Users")
        .select("*");

    console.log("Supabase 응답 결과:", response); 

    if (response.error) {
        throw new Error(response.error.message);
    }

    // data가 null일 경우를 대비해 빈 배열([])을 반환하도록 처리
    return (response.data as Users[]) || [];
}