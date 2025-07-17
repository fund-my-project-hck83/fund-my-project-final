import { NextRequest } from "next/server";
import ProjectModel from "@/server/models/ProjectModel";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '8');
        const method = searchParams.get('method') || 'advanced'; // 'advanced', 'percentage', 'amount'
        
        let projects;
        
        switch (method) {
            case 'percentage':
                projects = await ProjectModel.findTrendingByFundingPercentage(limit);
                break;
            case 'amount':
                projects = await ProjectModel.findTrendingByAmount(limit);
                break;
            case 'advanced':
            default:
                projects = await ProjectModel.findTrendingProjects(limit);
                break;
        }
        
        return new Response(JSON.stringify(projects), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching trending projects:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
