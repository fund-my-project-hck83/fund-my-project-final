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
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white border border-black rounded-lg p-8 max-w-md mx-4 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-medium text-black mb-4">{title}</h2>
        <p className="text-gray-600 mb-6 font-normal">
          {message}
          {amount && (
            <span className="font-medium"> Rp {amount.toLocaleString()}</span>
          )}
        </p>
        {showFundingUpdate && (
          <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-normal">Project funding updated in real-time!</p>
          </div>
        )}
        <button
          onClick={onClose}
          className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors font-normal"
        >
          Continue
        </button>
      </div>
    </div>
  );
}