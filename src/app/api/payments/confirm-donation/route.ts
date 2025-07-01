import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/server/config/mongodb";
import {
  IConfirmDonationForm,
  IDonation,
  IProject,
  PaymentStatus,
} from "@/interfaces/interfaces";
import { pusherServer } from "@/lib/pusher";

export async function POST(request: NextRequest) {
  try {
    // Check if request has content
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 400 }
      );
    }

    // Get the raw text first to debug
    const rawBody = await request.text();
    
    if (!rawBody || rawBody.trim() === '') {
      return NextResponse.json(
        { error: "Request body is empty" },
        { status: 400 }
      );
    }

    // Parse JSON with error handling
    let body: IConfirmDonationForm;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw body:', rawBody);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { orderId, transactionId, paymentType } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    console.log('Confirming donation:', { orderId, transactionId, paymentType });

    const db = getDb();

    // Find the donation record
    const donation = await db
      .collection<IDonation>("donations")
      .findOne({ midtransTransactionId: orderId });

    if (!donation) {
      return NextResponse.json(
        { error: "Donation not found" },
        { status: 404 }
      );
    }

    // Check if already processed
    if (donation.paymentStatus === PaymentStatus.SUCCESS) {
      return NextResponse.json({ message: "Donation already processed" });
    }

    // Get project info
    const project = await db
      .collection<IProject>("projects")
      .findOne({ _id: donation.projectId });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Calculate funding details
    const newCurrentFunding = project.currentFunding + donation.amount;
    const isFundingComplete = newCurrentFunding >= project.fundingGoal;
    const isExcess = newCurrentFunding > project.fundingGoal;
    const excessAmount = isExcess ? newCurrentFunding - project.fundingGoal : 0;

    // Update donation status
    await db.collection("donations").updateOne(
      { midtransTransactionId: orderId },
      {
        $set: {
          paymentStatus: PaymentStatus.SUCCESS,
          transactionId,
          paymentType,
          isExcess,
          excessAmount,
          updatedAt: new Date(),
        },
      }
    );

    // Update project funding
    await db.collection<IProject>("projects").updateOne(
      { _id: donation.projectId },
      {
        $set: {
          currentFunding: newCurrentFunding,
          isFundingComplete,
          ...(isFundingComplete && { completedAt: new Date() }),
          updatedAt: new Date(),
        },
      }
    );

    console.log('Donation confirmed successfully:', {
      donationId: donation._id,
      projectId: donation.projectId,
      amount: donation.amount,
      newFunding: newCurrentFunding,
      isComplete: isFundingComplete
    });

    // Get project slug for Pusher channel
    const projectSlug = project.slug;

    // Trigger real-time updates via Pusher
    try {
      // Update funding progress
      await pusherServer.trigger(`project-${projectSlug}-funding`, 'funding-updated', {
        currentFunding: newCurrentFunding,
        isFundingComplete,
        completedAt: isFundingComplete ? new Date() : null,
        progressPercentage: Math.min((newCurrentFunding / project.fundingGoal) * 100, 100)
      });

      // Update recent donations
      const newDonation = {
        amount: donation.amount,
        donorName: donation.donorName,
        createdAt: new Date(),
        isExcess,
        excessAmount
      };

      await pusherServer.trigger(`project-${projectSlug}-donations`, 'new-donation', newDonation);

      console.log('Pusher events triggered for project:', projectSlug);
    } catch (pusherError) {
      console.error('Pusher error:', pusherError);
      // Don't fail the request if Pusher fails
    }

    return NextResponse.json({
      success: true,
      donation: {
        id: donation._id,
        amount: donation.amount,
        projectFunding: newCurrentFunding,
        isComplete: isFundingComplete,
      },
    });
  } catch (error) {
    console.error("Confirm donation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to confirm donation",
      },
      { status: 500 }
    );
  }
}
