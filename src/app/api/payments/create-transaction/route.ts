import { getDb } from "@/server/config/mongodb";
import {
  IDonateForm,
  IDonation,
  IProject,
  PaymentStatus,
} from "@/interfaces/interfaces";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body: IDonateForm = await request.json();
    const { projectId, amount, donorName } = body;

    // Validate inputs
    if (!projectId || !amount || !donorName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (amount < 1000) {
      return NextResponse.json({ error: 'Minimum donation is Rp 1,000' }, { status: 400 });
    }

    if (!ObjectId.isValid(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const db = getDb();

    // Check if project exists and is still accepting donations
    const project = await db
      .collection<IProject>("projects")
      .findOne({ _id: new ObjectId(projectId) });
      
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.isFundingComplete) {
      return NextResponse.json({ error: 'Project funding is already complete' }, { status: 400 });
    }

    // Generate shorter unique order ID (Midtrans limit ~50 characters)
    const timestamp = Date.now().toString();
    const randomStr = Math.random().toString(36).substring(2, 8); // 6 chars
    const projectShort = projectId.slice(-8); // Last 8 chars of project ID
    const orderId = `don-${projectShort}-${timestamp.slice(-10)}-${randomStr}`;

    console.log('Creating transaction:', { orderId, projectId, amount, donorName });

    const projectName = project.name.length > 10 
    ? project.name.slice(0, 10) + '...'
    : project.name;

    // Create donation record with PENDING status (will be updated on confirmation)
    const donationResult = await db.collection<IDonation>("donations").insertOne({
      projectId: new ObjectId(projectId),
      amount,
      donorName,
      midtransTransactionId: orderId,
      midtransToken: "",
      paymentStatus: PaymentStatus.PENDING,
      isExcess: false,
      excessAmount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create Midtrans transaction
    const response = await fetch(
      "https://app.sandbox.midtrans.com/snap/v1/transactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            process.env.MIDTRANS_SERVER_KEY + ":"
          ).toString("base64")}`,
        },
        body: JSON.stringify({
          transaction_details: { order_id: orderId, gross_amount: amount },
          customer_details: { first_name: donorName },
          item_details: [
            {
              id: "donation",
              price: amount,
              quantity: 1,
              name: `Donation for ${projectName}`,
            },
          ],
          callbacks: {
            finish: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/projects/${project.slug}?donation_success=true&order_id=${orderId}`,
          },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      // If Midtrans fails, delete the donation record
      await db.collection("donations").deleteOne({ _id: donationResult.insertedId });
      throw new Error(
        data.error_messages?.[0] || "Failed to create transaction"
      );
    }

    // Update donation with token
    await db.collection("donations").updateOne(
      { _id: donationResult.insertedId },
      { $set: { midtransToken: data.token } }
    );

    console.log('Transaction created successfully:', { orderId, donationId: donationResult.insertedId });

    return NextResponse.json({ 
      token: data.token, 
      orderId,
      donationId: donationResult.insertedId.toString()
    });
  } catch (error) {
    console.error("Transaction error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to create transaction";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
