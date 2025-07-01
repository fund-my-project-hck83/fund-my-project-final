import { NextRequest, NextResponse } from "next/server";
import ProjectModel from "@/server/models/ProjectModel";
import { generateUniqueSlug } from "@/utils/slugify";
import { getDb } from "@/server/config/mongodb";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const includeCompleted = searchParams.get('includeCompleted') === 'true';
        const sortBy = searchParams.get('sortBy') as 'endDate' | 'funding' | 'created' | 'name' || 'endDate';
        
        // Use the new method if includeCompleted is true
        if (includeCompleted) {
            const projects = await ProjectModel.findAllWithSorting(search, page, limit, sortBy);
            return new Response(JSON.stringify(projects), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }
        
        // Default behavior: only active projects
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

export async function POST(request: NextRequest) {
  console.log('API route called');
  try {
    console.log('Attempting to connect to MongoDB...');
    const db = getDb();
    const collection = db.collection('projects');

    console.log('Getting request body...');
    const body = await request.json();
    console.log('Request body:', body);

    const userId = request.headers.get("x-user-id");
    
    // Get existing slugs to ensure uniqueness
    const existingProjects = await collection.find({}, { projection: { slug: 1 } }).toArray();
    const existingSlugs = existingProjects.map(p => p.slug);
    
    // Generate unique slug
    const slug = generateUniqueSlug(body.name, existingSlugs);
    console.log('Generated slug:', slug);
    
    const newProject = {
      ownerId: userId,
      name: body.name,
      description: body.description,
      fundingGoal: body.fundingGoal,
      currentFunding: 0,
      fundraisingStartDate: new Date(body.fundraisingStartDate),
      fundraisingEndDate: new Date(body.fundraisingEndDate),
      projectStartDate: new Date(body.projectStartDate),
      projectEndDate: new Date(body.projectEndDate),
      location: body.location,
      impactMetrics: body.impactMetrics || [],
      projectImage: body.projectImageUrl,
      slug,
      isFundingComplete: false,
      isLive: false,
      // AI-generated content
      aiProposal: body.aiProposal,
      proposalDocumentUrl: body.proposalDocumentUrl,
      aiInsights: body.aiInsights,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Inserting project:', newProject);
    const result = await collection.insertOne(newProject);
    console.log('Insert result:', result);
    
    return NextResponse.json({ 
      success: true, 
      projectId: result.insertedId,
      slug 
    });
    
  } catch (error: unknown) {
    console.error('Error creating project:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to create project', details: errorMessage },
      { status: 500 }
    );
  }
}