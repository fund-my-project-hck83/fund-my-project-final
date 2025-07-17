import { NextRequest } from "next/server";
import ProjectModel from "@/server/models/ProjectModel";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '12');
        const includeCompleted = searchParams.get('includeCompleted') === 'true';
        
        // Menggunakan method baru yang tidak filter berdasarkan hari
        // Fokus pada proyek yang benar-benar mau habis berdasarkan fundraisingEndDate
        const projects = await ProjectModel.findUrgentProjects(limit, includeCompleted);
        
        return new Response(JSON.stringify(projects), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching urgent projects:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
