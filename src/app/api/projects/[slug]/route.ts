import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/server/config/mongodb";
// import { Project } from "@/types";
import { ObjectId } from 'mongodb';
import { 
  IDonation, 
  IProject, 
  IUser, 
  IProjectResponse, 
  PaymentStatus 
} from '@/interfaces/interfaces';

export async function GET(
  request: NextRequest,
  context: { params: { slug: string } }
) {
  try {
    const { slug } = await context.params;

    // console.log(request, "ini yang baruuuuuuuu")
    
    const db = getDb();
    
    // Ensure collections exist
    await db.createCollection('projects').catch(() => {});
    await db.createCollection('users').catch(() => {});
    await db.createCollection('donations').catch(() => {});
    
    const project = await db.collection<IProject>('projects').findOne({
      slug: slug
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get project owner info - convert ownerId to ObjectId for proper querying
    const owner = await db.collection<IUser>('users').findOne({
      _id: new ObjectId(project.ownerId)
    });

    // Get recent donations
    const donations = await db.collection<IDonation>('donations')
      .find({ projectId: project._id, paymentStatus: PaymentStatus.SUCCESS })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    const response: IProjectResponse = {
      ...project,
      owner: owner ? {
        id: owner._id.toString(),
        name: owner.name,
        avatarUrl: owner.profilePicture,
      } : null,
      donations: donations.map(d => ({
        amount: d.amount,
        donorName: d.donorName,
        createdAt: d.createdAt,
        isExcess: d.isExcess
      }))
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
} 

// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ slug: string }> }
// ) {
//   try {
//     const { slug } = await params;
//     const db = getDb();
//     const collection = db.collection<Project>('projects');

//     const project = await collection.findOne({ slug });

//     if (!project) {
//       return NextResponse.json(
//         { error: 'Project not found' },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(project);
    
//   } catch (error) {
//     console.error('Error fetching project:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch project' },
//       { status: 500 }
//     );
//   }
// }

// export async function PATCH(
//   request: NextRequest,
//   { params }: { params: Promise<{ slug: string }> }
// ) {
//   try {
//     const { slug } = await params;
//     const db = getDb();
//     const collection = db.collection<Project>('projects');

//     const body = await request.json();
    
//     const result = await collection.updateOne(
//       { slug },
//       { 
//         $set: { 
//           ...body,
//           updatedAt: new Date()
//         }
//       }
//     );

//     if (result.matchedCount === 0) {
//       return NextResponse.json(
//         { error: 'Project not found' },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({ success: true });
    
//   } catch (error) {
//     console.error('Error updating project:', error);
//     return NextResponse.json(
//       { error: 'Failed to update project' },
//       { status: 500 }
//     );
//   }
// }