import { NextRequest } from "next/server";
import ProjectModel from "@/server/models/ProjectModel";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '7');
        const limit = parseInt(searchParams.get('limit') || '5');
        
        const projects = await ProjectModel.findEndingSoon(days, limit);
        return new Response(JSON.stringify(projects), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching ending soon projects:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
