import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/templates/AdminLayout/AdminLayout';
import { Button } from '@/components/atoms/Button/Button';
import { Input } from '@/components/atoms/Input/Input';
import { Select } from '@/components/atoms/Select/Select';
import { Alert } from '@/components/atoms/Alert/Alert';
import { RegisterCredentials } from '@/types/auth';

// Mock user creation (would be replaced with actual API service)
const createUser = async (userData: RegisterCredentials) => {
  console.log('Creating user:', userData);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Return a mock user object
  return {
    id: Math.random().toString(36).substring(2, 15),
    ...userData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

const NewUserPage: NextPage = () => {
  const router = useRouter();
  
  const [formData, setFormData] = useState<RegisterCredentials & { confirmPassword: string }>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'student',
  });
  
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
    general?: string;
  }>({});
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Name validation
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setAlert(null);
    
    try {
      // Create user
      const userData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
      };
      
      const user = await createUser(userData);
      
      setAlert({
        type: 'success',
        message: 'User created successfully!',
      });
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        role: 'student',
      });
      
      // Redirect to user management after a short delay
      setTimeout(() => {
        router.push('/admin/users');
      }, 1500);
    } catch (error) {
      console.error('Failed to create user:', error);
      setAlert({
        type: 'danger',
        message: 'Failed to create user. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <AdminLayout title="Create New User">
      <div className="max-w-3xl mx-auto">
        {alert && (
          <Alert
            variant={alert.type}
            message={alert.message}
            className="mb-6"
            onClose={() => setAlert(null)}
          />
        )}
        
        <div className="bg-white shadow-card rounded-card p-6">
          <h2 className="text-xl font-semibold mb-6">Add New User</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                error={errors.firstName}
                required
              />
              
              <Input
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                error={errors.lastName}
                required
              />
            </div>
            
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
              error={errors.email}
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.password}
                required
              />
              
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.confirmPassword}
                required
              />
            </div>
            
            <Select
              label="User Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="student">Student</option>
              <option value="admin">Administrator</option>
            </Select>
            
            <div className="pt-4 border-t border-neutral-200 flex items-center justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/users')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Create User
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default NewUserPage;