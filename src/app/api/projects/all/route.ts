import { NextRequest } from "next/server";
import ProjectModel from "@/server/models/ProjectModel";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const sortBy = searchParams.get('sortBy') as 'endDate' | 'funding' | 'created' | 'name' || 'endDate';
        
        const projects = await ProjectModel.findAllWithSorting(search, page, limit, sortBy);
        return new Response(JSON.stringify(projects), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching all projects:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
