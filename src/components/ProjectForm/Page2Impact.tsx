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

  const handleImageChange = (value: string) => {
    updateFormData({ projectImageUrl: value });
  };

  return (
    <div className="space-y-8">
      {/* Impact Metrics Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Impact Metrics
          <span className="text-sm font-normal text-gray-600 ml-2">(3 required)</span>
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Define the measurable impact your project will have. Examples: &quot;500 families fed&quot;, &quot;10 wells built&quot;, &quot;200 students educated&quot;
        </p>
        
        {formData.impactMetrics.map((metric, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
            <div>
              <label htmlFor={`impact-number-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                Impact Number {index + 1} *
              </label>
              <input
                type="number"
                id={`impact-number-${index}`}
                value={metric.number}
                onChange={(e) => handleImpactChange(index, 'number', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors[`impactMetrics.${index}.number`] ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="500"
                min="1"
              />
              {errors[`impactMetrics.${index}.number`] && (
                <p className="mt-1 text-sm text-red-600">{errors[`impactMetrics.${index}.number`]}</p>
              )}
            </div>

            <div>
              <label htmlFor={`impact-desc-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                Impact Description {index + 1} *
              </label>
              <input
                type="text"
                id={`impact-desc-${index}`}
                value={metric.description}
                onChange={(e) => handleImpactChange(index, 'description', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors[`impactMetrics.${index}.description`] ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="families fed"
              />
              {errors[`impactMetrics.${index}.description`] && (
                <p className="mt-1 text-sm text-red-600">{errors[`impactMetrics.${index}.description`]}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Project Image Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Project Visual</h3>
        <div>
          <label htmlFor="projectImageUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Project Header Image URL *
          </label>
          <input
            type="url"
            id="projectImageUrl"
            value={formData.projectImageUrl}
            onChange={(e) => handleImageChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.projectImageUrl ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="https://example.com/your-project-image.jpg"
          />
          {errors.projectImageUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.projectImageUrl}</p>
          )}
          <p className="text-sm text-gray-600 mt-2">
            Add a compelling image that represents your project. This will be the main visual that potential donors see.
          </p>
        </div>

        {/* Image Preview */}
        {formData.projectImageUrl && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <div className="border border-gray-200 rounded-md overflow-hidden">
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

      {/* Info Box */}
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <div className="w-5 h-5 text-green-400">🎯</div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Impact Tip
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>Make your impact metrics specific and measurable. Instead of &quot;help people&quot;, say &quot;provide clean water to 500 families&quot; or &quot;educate 200 children in rural areas&quot;.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}