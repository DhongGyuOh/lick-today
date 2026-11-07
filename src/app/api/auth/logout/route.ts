export default async function POST() : Promise<Response> {
    

    return new Response(JSON.stringify({ message: "Logged out successfully" }), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}