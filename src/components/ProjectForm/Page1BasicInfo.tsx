'use client';

import { ProjectFormData } from './FormWrapper';

interface Page1Props {
  formData: ProjectFormData;
  updateFormData: (data: Partial<ProjectFormData>) => void;
  errors: { [key: string]: string };
}

export default function Page1BasicInfo({ formData, updateFormData, errors }: Page1Props) {
  
  const handleChange = (field: keyof ProjectFormData, value: string) => {
    updateFormData({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
          Project Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:border-gray-800 transition-colors text-black bg-white placeholder-gray-500 font-normal ${
            errors.name ? 'border-red-500' : 'border-black'
          }`}
          placeholder="Enter your project name"
        />
        {errors.name && (
          <p className="mt-2 text-sm text-red-600 font-normal">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-black mb-2">
          Project Description *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={4}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-gray-800 transition-colors text-black bg-white placeholder-gray-500 font-normal resize-none ${
            errors.description ? 'border-red-500' : 'border-black'
          }`}
          placeholder="Describe your project in detail..."
        />
        {errors.description && (
          <p className="mt-2 text-sm text-red-600 font-normal">{errors.description}</p>
        )}
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-black mb-2">
          Project Location *
        </label>
        <input
          type="text"
          id="location"
          value={formData.location}
          onChange={(e) => handleChange('location', e.target.value)}
          className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:border-gray-800 transition-colors text-black bg-white placeholder-gray-500 font-normal ${
            errors.location ? 'border-red-500' : 'border-black'
          }`}
          placeholder="City, Country"
        />
        {errors.location && (
          <p className="mt-2 text-sm text-red-600 font-normal">{errors.location}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="projectStartDate" className="block text-sm font-medium text-black mb-2">
            Project Start Date *
          </label>
          <input
            type="date"
            id="projectStartDate"
            value={formData.projectStartDate}
            onChange={(e) => handleChange('projectStartDate', e.target.value)}
            className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:border-gray-800 transition-colors text-black bg-white font-normal ${
              errors.projectStartDate ? 'border-red-500' : 'border-black'
            }`}
          />
          {errors.projectStartDate && (
            <p className="mt-2 text-sm text-red-600 font-normal">{errors.projectStartDate}</p>
          )}
        </div>

        <div>
          <label htmlFor="projectEndDate" className="block text-sm font-medium text-black mb-2">
            Project End Date *
          </label>
          <input
            type="date"
            id="projectEndDate"
            value={formData.projectEndDate}
            onChange={(e) => handleChange('projectEndDate', e.target.value)}
            className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:border-gray-800 transition-colors text-black bg-white font-normal ${
              errors.projectEndDate ? 'border-red-500' : 'border-black'
            }`}
          />
          {errors.projectEndDate && (
            <p className="mt-2 text-sm text-red-600 font-normal">{errors.projectEndDate}</p>
          )}
        </div>
      </div>
    </div>
  );
}