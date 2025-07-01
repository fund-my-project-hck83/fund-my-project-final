import { NextRequest, NextResponse } from 'next/server';
import { getDb } from "@/server/config/mongodb";

export async function GET(
  request: NextRequest,
  context: { params: { slug: string } }
) {
  try {
    const { slug } = await context.params;
    
    const db = getDb();
    
    const project = await db.collection('projects').findOne({
      slug: slug
    }, {
      projection: {
        currentFunding: 1,
        fundingGoal: 1,
        isFundingComplete: 1,
        status: 1,
        slug: 1
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      currentFunding: project.currentFunding,
      fundingGoal: project.fundingGoal,
      isFundingComplete: project.isFundingComplete,
      status: project.status,
      progressPercentage: (project.currentFunding / project.fundingGoal) * 100
    });
  } catch (error) {
    console.error('Error fetching project funding:', error);
    return NextResponse.json({ error: 'Failed to fetch funding data' }, { status: 500 });
  }
} 