'use client';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  amount?: number;
  showFundingUpdate?: boolean;
}

export default function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  amount,
  showFundingUpdate = false
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
        <div className="text-green-500 text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">
          {message}
          {amount && (
            <span className="font-semibold"> Rp {amount.toLocaleString()}</span>
          )}
        </p>
        {showFundingUpdate && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-semibold">Project funding updated in real-time!</p>
          </div>
        )}
        <button
          onClick={onClose}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
} 