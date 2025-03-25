// src/app/curricula/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Layout from '@/app/layout/Layout';
import CurriculaGrid from './CurriculaGrid';
import { curriculumAPI } from '@/services/api';
import { Plus, Search } from 'lucide-react';

interface FormData {
  name: string;
  description: string;
}

interface AddCurriculumModalProps {
  onClose: () => void;
}

interface APIError {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

const CurriculaPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Layout allowedRoles={['admin', 'teacher']}>
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Curricula</h1>
          <button 
            onClick={handleOpenModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add Curriculum
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input 
              type="text" 
              className="w-full p-2 pl-10 border border-gray-300 rounded-md" 
              placeholder="Search curricula..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Curricula Grid */}
        <CurriculaGrid />

        {/* Add Curriculum Modal */}
        {isModalOpen && (
          <AddCurriculumModal onClose={handleCloseModal} />
        )}
      </div>
    </Layout>
  );
};

// This would be a separate component in a real application
const AddCurriculumModal = ({ onClose }: AddCurriculumModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await curriculumAPI.createCurriculum(formData);
      onClose();
      window.location.reload();
    } catch (err) {
      console.error('Error creating curriculum:', err);
      const apiError = err as APIError;
      setError(apiError.response?.data?.detail || 'Failed to create curriculum');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add New Curriculum</h2>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 text-sm text-red-700">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Curriculum'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CurriculaPage;