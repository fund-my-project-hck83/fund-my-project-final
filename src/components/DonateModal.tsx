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
  //   const [currentUser, setCurrentUser] = useState<any>(null);
  //   const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  //   useEffect(() => {
  //     // Check if user is logged in
  //     const checkUser = async () => {
  //       try {
  //         const response = await fetch('/api/auth/me');
  //         if (response.ok) {
  //           const user = await response.json();
  //           setCurrentUser(user);
  //           setShowLoginPrompt(false);
  //           // Pre-fill donor name with user's name
  //           setDonationForm(prev => ({ ...prev, donorName: user.name }));
  //         } else {
  //           setShowLoginPrompt(true);
  //         }
  //       } catch (error) {
  //         setShowLoginPrompt(true);
  //       }
  //     };

  //     if (isOpen) {
  //       checkUser();
  //     }
  //   }, [isOpen]);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Support This Project
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {isFundingComplete ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Funding Complete!
            </h3>
            <p className="text-gray-600 mb-4">
              This project has reached its funding goal.
            </p>
            <div className="bg-green-100 rounded-lg p-4">
              <p className="text-green-800 font-semibold">
                Thank you for your support!
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-gray-600 text-sm">
                Your donation will help make this project a reality
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={donationForm.donorName}
                onChange={(e) =>
                  setDonationForm((prev) => ({
                    ...prev,
                    donorName: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Donation Amount (Rp)
              </label>
              <input
                type="number"
                value={donationForm.amount}
                onChange={(e) =>
                  setDonationForm((prev) => ({
                    ...prev,
                    amount: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1000"
                min="1000"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Minimum: Rp 1,000</p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isDonating}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
