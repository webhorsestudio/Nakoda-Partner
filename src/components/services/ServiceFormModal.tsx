import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Service, ServiceFormData } from "@/types/services";

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceFormData) => void;
  service?: Service | null; // null for add, Service object for edit
}

export default function ServiceFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  service
}: ServiceFormModalProps) {
  const isEditMode = !!service;
  
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    is_active: true
  });

  const [errors, setErrors] = useState<Partial<ServiceFormData>>({});

  // Initialize form data when service changes (edit mode)
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || "",
        is_active: service.is_active
      });
    } else {
      // Reset form for add mode
      setFormData({
        name: "",
        description: "",
        is_active: true
      });
    }
    setErrors({});
  }, [service]);

  const handleInputChange = (field: keyof ServiceFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ServiceFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Service name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {isEditMode ? "Edit Service" : "Add New Service"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Service Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Service Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter service name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter service description"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleInputChange("is_active", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
              Active Service
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isEditMode ? "Update Service" : "Create Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
