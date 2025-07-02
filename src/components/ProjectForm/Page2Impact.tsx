'use client';

import { ProjectFormData } from './FormWrapper';

interface Page2Props {
  formData: ProjectFormData;
  updateFormData: (data: Partial<ProjectFormData>) => void;
  errors: { [key: string]: string };
}

export default function Page2Impact({ formData, updateFormData, errors }: Page2Props) {
  
  const handleImpactChange = (index: number, field: 'number' | 'description', value: string) => {
    const newImpactMetrics = [...formData.impactMetrics];
    newImpactMetrics[index] = {
      ...newImpactMetrics[index],
      [field]: value
    };
    updateFormData({ impactMetrics: newImpactMetrics });
  };

  const addImpactMetric = () => {
    const newImpactMetrics = [...formData.impactMetrics, { number: '', description: '' }];
    updateFormData({ impactMetrics: newImpactMetrics });
  };

  const removeImpactMetric = (index: number) => {
    if (formData.impactMetrics.length > 1) {
      const newImpactMetrics = formData.impactMetrics.filter((_, i) => i !== index);
      updateFormData({ impactMetrics: newImpactMetrics });
    }
  };

  const handleImageChange = (value: string) => {
    updateFormData({ projectImageUrl: value });
  };

  return (
    <div className="space-y-8">
      {/* Impact Metrics Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-black">
            Impact Metrics
            <span className="text-sm font-normal text-gray-600 ml-2">(at least 1 required)</span>
          </h3>
          {formData.impactMetrics.length < 5 && (
            <button
              type="button"
              onClick={addImpactMetric}
              className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors text-sm font-normal flex items-center space-x-2"
            >
              <span>+</span>
              <span>Add Impact</span>
            </button>
          )}
        </div>
        
        <p className="text-sm text-gray-600 font-normal mb-6">
          Impact yang ingin kamu hasilkan dari project ini, dalam angka dan kata
        </p>
        
        {formData.impactMetrics.map((metric, index) => (
          <div key={index} className="relative grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            {/* Remove button - only show if more than 1 metric */}
            {formData.impactMetrics.length > 1 && (
              <button
                type="button"
                onClick={() => removeImpactMetric(index)}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center text-sm font-normal"
                title="Remove this impact metric"
              >
                ×
              </button>
            )}
            
            <div>
              <label htmlFor={`impact-number-${index}`} className="block text-sm font-medium text-black mb-2">
                Impact Number {index + 1} *
              </label>
              <input
                type="number"
                id={`impact-number-${index}`}
                value={metric.number}
                onChange={(e) => handleImpactChange(index, 'number', e.target.value)}
                className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:border-gray-800 transition-colors text-black bg-white placeholder-gray-500 font-normal ${
                  errors[`impactMetrics.${index}.number`] ? 'border-red-500' : 'border-black'
                }`}
                placeholder="500"
                min="1"
              />
              {errors[`impactMetrics.${index}.number`] && (
                <p className="mt-2 text-sm text-red-600 font-normal">{errors[`impactMetrics.${index}.number`]}</p>
              )}
            </div>

            <div>
              <label htmlFor={`impact-desc-${index}`} className="block text-sm font-medium text-black mb-2">
                Impact Description {index + 1} *
              </label>
              <input
                type="text"
                id={`impact-desc-${index}`}
                value={metric.description}
                onChange={(e) => handleImpactChange(index, 'description', e.target.value)}
                className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:border-gray-800 transition-colors text-black bg-white placeholder-gray-500 font-normal ${
                  errors[`impactMetrics.${index}.description`] ? 'border-red-500' : 'border-black'
                }`}
                placeholder="families fed"
              />
              {errors[`impactMetrics.${index}.description`] && (
                <p className="mt-2 text-sm text-red-600 font-normal">{errors[`impactMetrics.${index}.description`]}</p>
              )}
            </div>
          </div>
        ))}

        {/* Quick add more hint */}
        {formData.impactMetrics.length < 5 && formData.impactMetrics.length === 1 && (
          <div className="text-center">
            <p className="text-sm text-gray-500 font-normal">
              You can add up to 5 impact metrics to showcase your project&apos;s reach
            </p>
          </div>
        )}
      </div>

      {/* Project Image Section */}
      <div>
        <h3 className="text-lg font-medium text-black mb-4">Project Visual</h3>
        <div>
          <label htmlFor="projectImageUrl" className="block text-sm font-medium text-black mb-2">
            Project Header Image URL *
          </label>
          <input
            type="url"
            id="projectImageUrl"
            value={formData.projectImageUrl}
            onChange={(e) => handleImageChange(e.target.value)}
            className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:border-gray-800 transition-colors text-black bg-white placeholder-gray-500 font-normal ${
              errors.projectImageUrl ? 'border-red-500' : 'border-black'
            }`}
            placeholder="https://example.com/your-project-image.jpg"
          />
          {errors.projectImageUrl && (
            <p className="mt-2 text-sm text-red-600 font-normal">{errors.projectImageUrl}</p>
          )}
          <p className="text-sm text-gray-600 font-normal mt-2">
            Add a compelling image that represents your project. This will be the main visual that potential donors see.
          </p>
        </div>

        {/* Image Preview */}
        {formData.projectImageUrl && (
          <div className="mt-4">
            <p className="text-sm font-medium text-black mb-2">Preview:</p>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <img
                src={formData.projectImageUrl}
                alt="Project preview"
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Impact Tips */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <div className="w-5 h-5 text-gray-600">🎯</div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-black">
              Impact Tip
            </h3>
            <div className="mt-2 text-sm text-gray-600 font-normal">
              <p>Make your impact metrics specific and measurable. Examples:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>&quot;500 families&quot; + &quot;provided with clean water&quot;</li>
                <li>&quot;200 children&quot; + &quot;educated in rural areas&quot;</li>
                <li>&quot;50 homes&quot; + &quot;built for displaced families&quot;</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}