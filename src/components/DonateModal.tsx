"use client";

import { useState } from "react";
import { IDonateForm } from "@/interfaces/interfaces";
import { Heart, CheckCircle } from "lucide-react";

interface MidtransResult {
  transaction_id: string;
  payment_type: string;
  order_id: string;
}

interface MidtransSnap {
  pay: (
    token: string,
    callbacks: {
      onSuccess: (result: MidtransResult) => void;
      onPending: () => void;
      onError: () => void;
      onClose: () => void;
    }
  ) => void;
}

declare global {
  interface Window {
    snap: MidtransSnap;
  }
}

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  isFundingComplete: boolean;
  onDonationSuccess: (amount: number) => void;
}

export default function DonateModal({
  isOpen,
  onClose,
  projectId,
  isFundingComplete,
  onDonationSuccess,
}: DonateModalProps) {
  const [donationForm, setDonationForm] = useState<IDonateForm>({
    amount: 1000,
    donorName: "",
    projectId: projectId,
  });
  const [isDonating, setIsDonating] = useState(false);
  const [error, setError] = useState("");

  // Format number with commas for display
  const formatCurrency = (value: number) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleAmountChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    const numericValue = parseInt(cleanValue) || 0;
    setDonationForm((prev) => ({ ...prev, amount: numericValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (donationForm.amount < 1000) {
      setError("Minimum donation amount is Rp 1,000");
      return;
    }

    if (!donationForm.donorName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (isFundingComplete) {
      setError("This project is already fully funded");
      return;
    }

    setIsDonating(true);
    setError("");

    try {
      // Create transaction
      const transactionResponse = await fetch(
        "/api/payments/create-transaction",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(donationForm),
        }
      );

      if (!transactionResponse.ok) {
        throw new Error("Failed to create transaction");
      }

      const { token, orderId } = await transactionResponse.json();

      // Open Midtrans Snap
      if (typeof window !== "undefined" && window.snap) {
        window.snap.pay(token, {
          onSuccess: async (result: MidtransResult) => {
            await confirmDonation(
              orderId,
              result.transaction_id,
              result.payment_type
            );
          },
          onPending: () => {
            setError(
              "Payment is pending. You will be notified when it is completed."
            );
          },
          onError: () => {
            setError("Payment failed. Please try again.");
          },
          onClose: () => {
            setError(
              "Payment window closed. You can complete the payment later through Midtrans simulator."
            );
          },
        });
      } else {
        setError(
          `Transaction created with order ID: ${orderId}. You can complete the payment through Midtrans simulator.`
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process donation"
      );
    } finally {
      setIsDonating(false);
    }
  };

  const confirmDonation = async (
    orderId: string,
    transactionId: string,
    paymentType: string
  ) => {
    try {
      const response = await fetch("/api/payments/confirm-donation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, transactionId, paymentType }),
      });

      if (!response.ok) {
        throw new Error("Failed to confirm donation");
      }

      await response.json();

      // Call success callback
      onDonationSuccess(donationForm.amount);

      // Reset form and close modal
      setDonationForm((prev) => ({ ...prev, amount: 1000, donorName: "" }));
      onClose();
    } catch {
      setError("Failed to confirm donation");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 px-4">
      <div className="bg-white border border-black rounded-lg p-8 max-w-md mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-medium text-black">
            Support This Project
          </h1>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-200 text-black rounded-full hover:bg-gray-300 transition-colors flex items-center justify-center font-normal"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-normal mb-6">
            {error}
          </div>
        )}

        {isFundingComplete ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-black mb-2">
              Funding Complete!
            </h3>
            <p className="text-gray-600 font-normal mb-4">
              This project has reached its funding goal.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-normal">
                Thank you for your support!
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-gray-600 text-sm font-normal">
                Kontribusi kamu bisa membuat project ini jadi nyata
              </p>
            </div>

            <div>
              <label
                htmlFor="donorName"
                className="block text-sm font-medium text-black mb-2"
              >
                Your Name *
              </label>
              <input
                type="text"
                id="donorName"
                value={donationForm.donorName}
                onChange={(e) =>
                  setDonationForm((prev) => ({
                    ...prev,
                    donorName: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-black rounded-full focus:outline-none focus:border-gray-800 transition-colors text-black bg-white placeholder-gray-500 font-normal"
                placeholder="Nama yang akan ditampilkan"
                required
              />
            </div>

            <div>
              <label
                htmlFor="donationAmount"
                className="block text-sm font-medium text-black mb-2"
              >
                Donation Amount (Rupiah) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500 font-normal">
                  Rp
                </span>
                <input
                  type="text"
                  id="donationAmount"
                  value={formatCurrency(donationForm.amount)}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-black rounded-full focus:outline-none focus:border-gray-800 transition-colors text-black bg-white placeholder-gray-500 font-normal"
                  placeholder="1,000"
                />
              </div>
              <p className="text-sm text-gray-600 font-normal mt-2">
                Minimum donation: Rp 1,000
              </p>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-black text-black py-3 px-4 rounded-full font-normal hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isDonating}
                className={`flex-1 py-3 px-4 rounded-full font-normal transition-colors ${
                  isDonating
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {isDonating ? "Processing..." : "Donate Now"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
