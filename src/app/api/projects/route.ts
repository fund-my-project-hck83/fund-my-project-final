import { NextRequest } from "next/server";
import ProjectModel from "@/server/models/ProjectModel";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '2');
        const limit = parseInt(searchParams.get('limit') || '10');
        
        const projects = await ProjectModel.findWithPagination(search, page, limit);
        return new Response(JSON.stringify(projects), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching projects:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}