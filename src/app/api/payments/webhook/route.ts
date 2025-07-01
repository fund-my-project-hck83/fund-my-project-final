import { getDb } from "@/server/config/mongodb";
import { IDonation, PaymentStatus } from "@/interfaces/interfaces";
import { NextRequest, NextResponse } from "next/server";

interface WebhookBody {
    order_id: string;
    transaction_status: string;
    gross_amount: string;
    payment_type: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: WebhookBody = await request.json()
        const { order_id, transaction_status, gross_amount, payment_type } = body

        console.log("=== WEBHOOK RECEIVED ===");
        console.log("Order ID:", order_id);
        console.log("Status:", transaction_status);
        console.log("Amount:", gross_amount);
        console.log("Payment Type:", payment_type);

        const db = getDb();

        const donation = await db.collection<IDonation>("donations").findOne({ midtransTransactionId: order_id })

        if (!donation) {
            console.log("❌ Donation not found for order:", order_id);
            return NextResponse.json({
                error: "Donation not found"
            }, { status: 404 })
        }

        await db.collection<IDonation>("donations").updateOne(
            { midtransTransactionId: order_id },
            {
                $set: {
                    midtransResponse: body,
                    updatedAt: new Date(),
                }
            }
        );

        if (
            transaction_status === "settlement" ||
            transaction_status === "capture"
        ) {
            console.log("✅ Payment SUCCESS for order:", order_id);

            if (donation.paymentStatus !== PaymentStatus.SUCCESS) {
                await db
                    .collection<IDonation>("donations")
                    .updateOne(
                        { midtransTransactionId: order_id },
                        { $set: { paymentStatus: PaymentStatus.SUCCESS } }
                    );

                const projectResult = await db
                    .collection("projects")
                    .findOneAndUpdate(
                        { _id: donation.projectId },
                        { $inc: { currentFunding: parseFloat(gross_amount) } },
                        { returnDocument: "after" }
                    );

                if (!projectResult || !projectResult.value) {
                    console.log("❌ Project not found:", donation.projectId);
                    return NextResponse.json(
                        { error: "Project not found" },
                        { status: 404 }
                    );
                }

                const updatedProject = projectResult.value;
                if (updatedProject.currentFunding >= updatedProject.fundingGoal) {
                    console.log("🎉 Project funding COMPLETED:", donation.projectId);

                    await db.collection("projects").updateOne(
                        { _id: donation.projectId },
                        {
                            $set: {
                                isFundingComplete: true,
                                completedAt: new Date(),
                            },
                        }
                    );

                    const previousFunding =
                        updatedProject.currentFunding - parseFloat(gross_amount);
                    if (previousFunding < updatedProject.fundingGoal) {
                        await db
                            .collection("donations")
                            .updateOne(
                                { midtransTransactionId: order_id },
                                { $set: { isExcess: true } }
                            );
                        console.log("💰 Donation marked as excess funding");
                    }
                }
            }
        } else if (transaction_status === "pending") {
            console.log("⏳ Payment PENDING for order:", order_id);
            await db
                .collection<IDonation>("donations")
                .updateOne(
                    { midtransTransactionId: order_id },
                    { $set: { paymentStatus: PaymentStatus.PENDING } }
                );
        } else if (
            ["deny", "cancel", "expire", "failure"].includes(transaction_status)
        ) {
            console.log(
                "❌ Payment FAILED for order:",
                order_id,
                "Status:",
                transaction_status
            );
            await db
                .collection<IDonation>("donations")
                .updateOne(
                    { midtransTransactionId: order_id },
                    { $set: { paymentStatus: PaymentStatus.FAILED } }
                );
        }

        return NextResponse.json({ status: "OK" });

    } catch (error) {
        console.error("Webhook processing error:", error);
        return NextResponse.json({
            error: "Webhook processing failed"
        }, { status: 500 });
    }
}