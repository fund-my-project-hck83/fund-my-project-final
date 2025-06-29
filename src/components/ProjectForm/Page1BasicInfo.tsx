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
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Project Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Enter your project name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Project Description *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.description ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Describe your project in detail..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
          Project Location *
        </label>
        <input
          type="text"
          id="location"
          value={formData.location}
          onChange={(e) => handleChange('location', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.location ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="City, Country"
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-600">{errors.location}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="projectStartDate" className="block text-sm font-medium text-gray-700 mb-2">
            Project Start Date *
          </label>
          <input
            type="date"
            id="projectStartDate"
            value={formData.projectStartDate}
            onChange={(e) => handleChange('projectStartDate', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.projectStartDate ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.projectStartDate && (
            <p className="mt-1 text-sm text-red-600">{errors.projectStartDate}</p>
          )}
        </div>

        <div>
          <label htmlFor="projectEndDate" className="block text-sm font-medium text-gray-700 mb-2">
            Project End Date *
          </label>
          <input
            type="date"
            id="projectEndDate"
            value={formData.projectEndDate}
            onChange={(e) => handleChange('projectEndDate', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.projectEndDate ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.projectEndDate && (
            <p className="mt-1 text-sm text-red-600">{errors.projectEndDate}</p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <div className="w-5 h-5 text-blue-400">ℹ️</div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Next Steps
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>After this page, you&apos;ll define your project&apos;s impact metrics and add visuals to make your project more compelling to potential donors.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}