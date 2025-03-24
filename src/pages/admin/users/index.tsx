import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/templates/AdminLayout/AdminLayout';
import { Button } from '@/components/atoms/Button/Button';
import { Input } from '@/components/atoms/Input/Input';
import { Select } from '@/components/atoms/Select/Select';
import { Badge } from '@/components/atoms/Badge/Badge';
import { Alert } from '@/components/atoms/Alert/Alert';
import { User } from '@/types/auth';

// Mock user service (would be replaced with actual API service)
const userService = {
  getUsers: async (): Promise<User[]> => {
    return [
      {
        id: '1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      },
      {
        id: '2',
        email: 'student1@example.com',
        firstName: 'John',
        lastName: 'Smith',
        role: 'student',
        createdAt: '2023-01-02T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
      },
      {
        id: '3',
        email: 'student2@example.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'student',
        createdAt: '2023-01-03T00:00:00.000Z',
        updatedAt: '2023-01-03T00:00:00.000Z',
      },
      {
        id: '4',
        email: 'teacher@example.com',
        firstName: 'Michael',
        lastName: 'Williams',
        role: 'admin',
        createdAt: '2023-01-04T00:00:00.000Z',
        updatedAt: '2023-01-04T00:00:00.000Z',
      },
      {
        id: '5',
        email: 'student3@example.com',
        firstName: 'Emma',
        lastName: 'Brown',
        role: 'student',
        createdAt: '2023-01-05T00:00:00.000Z',
        updatedAt: '2023-01-05T00:00:00.000Z',
      },
    ];
  },
  
  deleteUser: async (userId: string): Promise<void> => {
    console.log(`Deleting user with ID: ${userId}`);
    // This would normally make an API call
    return Promise.resolve();
  },
};

const UserManagementPage: NextPage = () => {
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'student'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      
      try {
        const usersData = await userService.getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setAlert({
          type: 'danger',
          message: 'Failed to load users. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Filter users based on search query and role filter
  useEffect(() => {
    let filtered = [...users];
    
    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }
    
    setFilteredUsers(filtered);
    
    // Clear selected users when filters change
    setSelectedUsers([]);
  }, [users, searchQuery, roleFilter]);
  
  // Toggle user selection
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };
  
  // Select/deselect all users
  const toggleAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };
  
  // Delete selected users
  const deleteSelectedUsers = async () => {
    if (selectedUsers.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)?`)) {
      return;
    }
    
    try {
      await Promise.all(selectedUsers.map(id => userService.deleteUser(id)));
      
      // Remove deleted users from state
      setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
      
      setAlert({
        type: 'success',
        message: `Successfully deleted ${selectedUsers.length} user(s).`,
      });
      
      setSelectedUsers([]);
    } catch (error) {
      console.error('Failed to delete users:', error);
      setAlert({
        type: 'danger',
        message: 'Failed to delete the selected users. Please try again.',
      });
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <AdminLayout title="User Management">
      <div className="space-y-6">
        {alert && (
          <Alert
            variant={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}
        
        {/* Actions Bar */}
        <div className="bg-white shadow-card rounded-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <Button 
                variant="primary"
                onClick={() => router.push('/admin/users/new')}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                }
              >
                Add User
              </Button>
              
              {selectedUsers.length > 0 && (
                <Button 
                  variant="danger"
                  onClick={deleteSelectedUsers}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  }
                >
                  Delete Selected
                </Button>
              )}
            </div>
            
            <div className="flex space-x-4">
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'student')}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins</option>
                <option value="student">Students</option>
              </Select>
              
              <div className="w-64">
                <Input 
                  placeholder="Search users..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Users Table */}
        <div className="bg-white shadow-card rounded-card overflow-hidden">
          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-neutral-200 rounded"></div>
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-16 bg-neutral-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-neutral-900">No users found</h3>
              <p className="mt-1 text-sm text-neutral-500">
                {searchQuery || roleFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Get started by creating a new user.'}
              </p>
              {!searchQuery && roleFilter === 'all' && (
                <div className="mt-6">
                  <Button 
                    onClick={() => router.push('/admin/users/new')}
                  >
                    Add User
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={toggleAllUsers}
                        />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Date Added
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {filteredUsers.map((user) => (
                    <tr 
                      key={user.id}
                      className={`${
                        selectedUsers.includes(user.id) ? 'bg-primary-50' : ''
                      } hover:bg-neutral-50`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="font-medium text-primary-600">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-neutral-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-neutral-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={user.role === 'admin' ? 'primary' : 'secondary'}>
                          {user.role === 'admin' ? 'Admin' : 'Student'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => router.push(`/admin/users/${user.id}`)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => router.push(`/admin/users/${user.id}/courses`)}
                            className="text-secondary-600 hover:text-secondary-900"
                          >
                            Courses
                          </button>
                          <button
                            onClick={() => {
                              toggleUserSelection(user.id);
                              deleteSelectedUsers();
                            }}
                            className="text-danger-600 hover:text-danger-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserManagementPage;