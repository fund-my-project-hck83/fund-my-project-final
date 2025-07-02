'use client';

import { ProjectFormData } from './FormWrapper';

interface Page3Props {
  formData: ProjectFormData;
  updateFormData: (data: Partial<ProjectFormData>) => void;
  errors: { [key: string]: string };
}

export default function Page3Fundraising({ formData, updateFormData, errors }: Page3Props) {
  
  const handleChange = (field: keyof ProjectFormData, value: string) => {
    updateFormData({ [field]: value });
  };

  // Format number with commas for display
  const formatCurrency = (value: string) => {
    const number = value.replace(/\D/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleFundingGoalChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    updateFormData({ fundingGoal: cleanValue });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-black mb-4">Funding Goal</h3>
        <div>
          <label htmlFor="fundingGoal" className="block text-sm font-medium text-black mb-2">
            How much funding do you need? (Rupiah) *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-gray-500 font-normal">Rp</span>
            <input
              type="text"
              id="fundingGoal"
              value={formatCurrency(formData.fundingGoal)}
              onChange={(e) => handleFundingGoalChange(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-full focus:outline-none focus:border-gray-800 transition-colors text-black bg-white placeholder-gray-500 font-normal ${
                errors.fundingGoal ? 'border-red-500' : 'border-black'
              }`}
              placeholder="50,000,000"
            />
          </div>
          {errors.fundingGoal && (
            <p className="mt-2 text-sm text-red-600 font-normal">{errors.fundingGoal}</p>
          )}
          <p className="text-sm text-gray-600 font-normal mt-2">
            Set a realistic funding goal based on your project needs and timeline.
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-black mb-4">Fundraising Timeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="fundraisingStartDate" className="block text-sm font-medium text-black mb-2">
              Fundraising Start Date *
            </label>
            <input
              type="date"
              id="fundraisingStartDate"
              value={formData.fundraisingStartDate}
              onChange={(e) => handleChange('fundraisingStartDate', e.target.value)}
              className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:border-gray-800 transition-colors text-black bg-white font-normal ${
                errors.fundraisingStartDate ? 'border-red-500' : 'border-black'
              }`}
            />
            {errors.fundraisingStartDate && (
              <p className="mt-2 text-sm text-red-600 font-normal">{errors.fundraisingStartDate}</p>
            )}
          </div>

          <div>
            <label htmlFor="fundraisingEndDate" className="block text-sm font-medium text-black mb-2">
              Fundraising End Date *
            </label>
            <input
              type="date"
              id="fundraisingEndDate"
              value={formData.fundraisingEndDate}
              onChange={(e) => handleChange('fundraisingEndDate', e.target.value)}
              className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:border-gray-800 transition-colors text-black bg-white font-normal ${
                errors.fundraisingEndDate ? 'border-red-500' : 'border-black'
              }`}
            />
            {errors.fundraisingEndDate && (
              <p className="mt-2 text-sm text-red-600 font-normal">{errors.fundraisingEndDate}</p>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 font-normal mt-2">
          Choose a realistic timeframe for your fundraising campaign. Most successful campaigns run for 30-60 days.
        </p>
      </div>

      {/* Summary Box */}
      {formData.fundingGoal && formData.fundraisingStartDate && formData.fundraisingEndDate && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-black mb-2">Campaign Summary</h4>
          <div className="space-y-1 text-sm text-gray-700 font-normal">
            <p><strong>Goal:</strong> Rp {formatCurrency(formData.fundingGoal)}</p>
            <p><strong>Duration:</strong> {new Date(formData.fundraisingStartDate).toLocaleDateString()} - {new Date(formData.fundraisingEndDate).toLocaleDateString()}</p>
            <p><strong>Days:</strong> {Math.ceil((new Date(formData.fundraisingEndDate).getTime() - new Date(formData.fundraisingStartDate).getTime()) / (1000 * 60 * 60 * 24))} days</p>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <div className="w-5 h-5 text-gray-600">💡</div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-black">
              Fundraising Tips
            </h3>
            <div className="mt-2 text-sm text-gray-600 font-normal">
              <ul className="list-disc list-inside space-y-1">
                <li>Research similar projects to set realistic funding goals</li>
                <li>Account for platform fees and unexpected costs (add 10-15% buffer)</li>
                <li>Shorter campaigns often create more urgency and better results</li>
                <li>Plan to launch your campaign when you can actively promote it</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}