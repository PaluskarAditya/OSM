"use client";

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { User, Key, Building, CreditCard, Mail } from 'lucide-react';

const Page = () => {
  const tabs = [
    { id: 'user', label: 'Institute User', icon: User },
    { id: 'ip_config', label: 'IP Config & 2FA', icon: Key },
    { id: 'profile', label: 'Institute Profile', icon: Building },
    { id: 'permissions', label: 'Observer Permissions', icon: CreditCard },
    { id: 'email', label: 'Edit Examiner Email', icon: Mail },
  ];

  const [activeTab, setActiveTab] = useState('user');
  const [users, setUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    RollNo: '', PRNNumber: '', Gender: '', Email: '', FirstName: '',
    MiddleName: '', LastName: '', MobileNo: '', IsPHCandidate: 'No',
    CampusName: '', subjects: [], course: '', combined: ''
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [examinerEmail, setExaminerEmail] = useState('');
  const [configs, setConfigs] = useState({
    questionWiseRoundOff: false,
    countRecheck: false,
    subscriptionEndDate: '',
    rollNoAsBookletName: false,
    examinerMayBeReval: false,
    isProctored: false,
    isModeration: false,
    moderationPercentage: 0,
    minBookletModeration: 0,
    removeAssignmentOnRuleChange: false,
    showHalfAnnotation: false,
    showQuarterAnnotation: false,
    showRemunerationReport: false,
    downloadReport: false,
    isIPRestrict: false,
    twoFactorAuth: false,
    enableFacultyForm: false,
    showExaminerAnnotations: false,
  });
  const [instituteImage, setInstituteImage] = useState(null);
  const [certHeaderImage, setCertHeaderImage] = useState(null);
  const [certFooterImage, setCertFooterImage] = useState(null);
  const [permittedPages, setPermittedPages] = useState([]);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, activeUsersRes, configsRes, pagesRes] = await Promise.all([
          axios.get('/api/v1/candidates'),
          axios.get('/api/v1/users/active'),
          axios.get('/api/v1/config'),
          axios.get('/api/v1/users/permitted-pages')
        ]);
        setUsers(usersRes.data);
        setActiveUsers(activeUsersRes.data);
        setConfigs(configsRes.data);
        setPermittedPages(pagesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error.response?.data?.message || error.message);
      }
    };
    fetchData();
  }, []);

  // Handle input changes
  const handleUserInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectedUserChange = useCallback((e) => {
    const { name, value } = e.target;
    setSelectedUser(prev => ({ ...prev, [name]: name === 'subjects' ? value.split(',').map(s => s.trim()) : value }));
  }, []);

  // Create new user
  const createUser = async () => {
    try {
      const response = await axios.post('/api/v1/candidates', { data: [{ ...newUser, subjects: newUser.subjects }] });
      setUsers(prev => [...prev, ...response.data]);
      setNewUser({
        RollNo: '', PRNNumber: '', Gender: '', Email: '', FirstName: '',
        MiddleName: '', LastName: '', MobileNo: '', IsPHCandidate: 'No',
        CampusName: '', subjects: [], course: '', combined: ''
      });
      alert('User created successfully');
    } catch (error) {
      alert('Error creating user: ' + (error.response?.data?.message || error.message));
    }
  };

  // Import users
  const importUsers = async () => {
    if (!importFile) return alert('Please select a file');
    const formData = new FormData();
    formData.append('file', importFile);
    formData.append('course', newUser.course);
    formData.append('combined', newUser.combined);
    try {
      const response = await axios.post('/api/v1/candidates/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUsers(prev => [...prev, ...response.data]);
      setImportFile(null);
      document.getElementById('importFileInput').value = '';
      alert('Users imported successfully');
    } catch (error) {
      alert('Error importing users: ' + (error.response?.data?.message || error.message));
    }
  };

  // Export users
  const exportUsers = async () => {
    try {
      const response = await axios.get('/api/v1/candidates/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert('Error exporting users: ' + (error.response?.data?.message || error.message));
    }
  };

  // Edit user
  const editUser = async () => {
    if (!selectedUser) return;
    try {
      const response = await axios.put(`/api/v1/candidates/${selectedUser._id}`, selectedUser);
      setUsers(prev => prev.map(user => user._id === selectedUser._id ? response.data : user));
      setSelectedUser(null);
      alert('User updated successfully');
    } catch (error) {
      alert('Error updating user: ' + (error.response?.data?.message || error.message));
    }
  };

  // Assign Examiner role
  const assignExaminerRole = async (userId) => {
    try {
      await axios.post(`/api/v1/users/${userId}/assign-examiner`);
      setUsers(prev => prev.map(user => user._id === userId ? { ...user, role: 'Examiner' } : user));
      alert('Examiner role assigned');
    } catch (error) {
      alert('Error assigning examiner role: ' + (error.response?.data?.message || error.message));
    }
  };

  // Edit Examiner email
  const updateExaminerEmail = async () => {
    if (!selectedUser || !examinerEmail) return;
    try {
      await axios.put(`/api/v1/users/${selectedUser._id}/email`, { email: examinerEmail });
      setUsers(prev => prev.map(user => user._id === selectedUser._id ? { ...user, Email: examinerEmail } : user));
      setExaminerEmail('');
      setSelectedUser(null);
      alert('Examiner email updated');
    } catch (error) {
      alert('Error updating examiner email: ' + (error.response?.data?.message || error.message));
    }
  };

  // Reset login session
  const resetLoginSession = async (userId) => {
    try {
      await axios.post(`/api/v1/users/${userId}/reset-session`);
      setActiveUsers(prev => prev.filter(user => user._id !== userId));
      alert('Login session reset');
    } catch (error) {
      alert('Error resetting login session: ' + (error.response?.data?.message || error.message));
    }
  };

  // Toggle config flags with debouncing
  const toggleConfig = useCallback(async (key) => {
    try {
      const updatedConfigs = { ...configs, [key]: !configs[key] };
      await axios.put('/api/v1/config', updatedConfigs);
      setConfigs(updatedConfigs);
      alert(`${key} updated`);
    } catch (error) {
      alert(`Error updating ${key}: ` + (error.response?.data?.message || error.message));
    }
  }, [configs]);

  // Handle number inputs for configs
  const handleConfigNumberChange = useCallback(async (key, value) => {
    try {
      const updatedConfigs = { ...configs, [key]: parseInt(value) || 0 };
      await axios.put('/api/v1/config', updatedConfigs);
      setConfigs(updatedConfigs);
      alert(`${key} updated`);
    } catch (error) {
      alert(`Error updating ${key}: ` + (error.response?.data?.message || error.message));
    }
  }, [configs]);

  // Handle image uploads
  const uploadImage = async (type, file) => {
    if (!file) return alert('Please select an image');
    const formData = new FormData();
    formData.append('image', file);
    try {
      await axios.post(`/api/v1/config/upload-${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(`${type} image uploaded successfully`);
      if (type === 'institute-profile') setInstituteImage(null);
      if (type === 'cert-header') setCertHeaderImage(null);
      if (type === 'cert-footer') setCertFooterImage(null);
      document.getElementById(`${type}Input`).value = '';
    } catch (error) {
      alert(`Error uploading ${type} image: ` + (error.response?.data?.message || error.message));
    }
  };

  const renderContent = () => {
    const contentData = {
      user: {
        title: 'Institute User Management',
        description: 'Manage user profiles, roles, and access rights for all institute members.',
        stats: [
          { label: 'Active Users', value: activeUsers.length, change: '' },
          { label: 'Total Users', value: users.length, change: '' },
          { label: 'Examiners', value: users.filter(u => u.role === 'Examiner').length, change: '' }
        ]
      },
      ip_config: {
        title: 'IP Configuration and Two-Factor Authentication',
        description: 'Secure your institute\'s access by configuring trusted IP addresses and enforcing 2FA policies.',
        stats: [
          { label: 'IP Restriction', value: configs.isIPRestrict ? 'Enabled' : 'Disabled', change: '' },
          { label: '2FA Enabled', value: configs.twoFactorAuth ? 'Enabled' : 'Disabled', change: '' },
          { label: 'Moderation', value: configs.isModeration ? 'Enabled' : 'Disabled', change: '' }
        ]
      },
      profile: {
        title: 'Institute Profile Settings',
        description: 'Update your institute\'s profile, including logo and configurations.',
        stats: [
          { label: 'Proctored Exams', value: configs.isProctored ? 'Enabled' : 'Disabled', change: '' },
          { label: 'Subscription End', value: configs.subscriptionEndDate || 'N/A', change: '' },
          { label: 'Moderation %', value: `${configs.moderationPercentage}%`, change: '' }
        ]
      },
      permissions: {
        title: 'Observer Permissions',
        description: 'View and manage permitted pages for observers.',
        stats: [
          { label: 'Permitted Pages', value: permittedPages.length, change: '' },
          { label: 'Last Updated', value: 'Today', change: '' },
          { label: 'Recent Changes', value: '0', change: '' }
        ]
      },
      email: {
        title: 'Edit Examiner Email',
        description: 'Modify the official email addresses used for communication with examiners.',
        stats: [
          { label: 'Selected User', value: selectedUser ? `${selectedUser.FirstName} ${selectedUser.LastName}` : 'None', change: '' },
          { label: 'Current Email', value: selectedUser ? selectedUser.Email : 'N/A', change: '' },
          { label: 'Last Verified', value: 'Today', change: '' }
        ]
      }
    };

    const currentContent = contentData[activeTab];

    return (
      <div className="space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentContent.stats.map((stat, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <div className="flex items-baseline mt-1">
                <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
                {stat.change && (
                  <span className={`ml-2 text-sm ${stat.change.startsWith('+') ? 'text-green-600' : stat.change.startsWith('-') ? 'text-red-600' : 'text-gray-500'}`}>
                    {stat.change}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">{currentContent.title}</h3>
          <p className="mt-2 text-gray-600">{currentContent.description}</p>

          <div className="mt-6 space-y-4">
            {activeTab === 'user' && (
              <>
                {/* Create New User */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">Create New User</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded border border-gray-200">
                    <input type="text" name="RollNo" value={newUser.RollNo} onChange={handleUserInputChange} placeholder="Roll No" className="p-2 border rounded" />
                    <input type="text" name="PRNNumber" value={newUser.PRNNumber} onChange={handleUserInputChange} placeholder="PRN Number" className="p-2 border rounded" />
                    <select name="Gender" value={newUser.Gender} onChange={handleUserInputChange} className="p-2 border rounded">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <input type="email" name="Email" value={newUser.Email} onChange={handleUserInputChange} placeholder="Email" className="p-2 border rounded" />
                    <input type="text" name="FirstName" value={newUser.FirstName} onChange={handleUserInputChange} placeholder="First Name" className="p-2 border rounded" />
                    <input type="text" name="MiddleName" value={newUser.MiddleName} onChange={handleUserInputChange} placeholder="Middle Name" className="p-2 border rounded" />
                    <input type="text" name="LastName" value={newUser.LastName} onChange={handleUserInputChange} placeholder="Last Name" className="p-2 border rounded" />
                    <input type="text" name="MobileNo" value={newUser.MobileNo} onChange={handleUserInputChange} placeholder="Mobile No" className="p-2 border rounded" />
                    <select name="IsPHCandidate" value={newUser.IsPHCandidate} onChange={handleUserInputChange} className="p-2 border rounded">
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                    <input type="text" name="CampusName" value={newUser.CampusName} onChange={handleUserInputChange} placeholder="Campus Name" className="p-2 border rounded" />
                    <input type="text" name="subjects" value={newUser.subjects.join(',')} onChange={(e) => setNewUser(prev => ({ ...prev, subjects: e.target.value.split(',').map(s => s.trim()) }))} placeholder="Subjects (comma-separated)" className="p-2 border rounded" />
                    <input type="text" name="course" value={newUser.course} onChange={handleUserInputChange} placeholder="Course" className="p-2 border rounded" />
                    <input type="text" name="combined" value={newUser.combined} onChange={handleUserInputChange} placeholder="Combined" className="p-2 border rounded" />
                    <button onClick={createUser} className="col-span-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Create User</button>
                  </div>
                </div>

                {/* Import Users */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">Import Users</h4>
                  <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <input id="importFileInput" type="file" accept=".xlsx,.xls" onChange={(e) => setImportFile(e.target.files[0])} className="mb-2" />
                    <button onClick={importUsers} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Import</button>
                  </div>
                </div>

                {/* User List */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">Users</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User className="h-5 w-5 text-gray-500" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.FirstName} {user.LastName}</div>
                                  <div className="text-sm text-gray-500">{user.Email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.RollNo}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'Examiner' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                                {user.role || 'Member'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {activeUsers.some(u => u._id === user._id) ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button onClick={() => setSelectedUser(user)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                              <button onClick={() => assignExaminerRole(user._id)} className="text-green-600 hover:text-green-900 mr-3">Assign Examiner</button>
                              <button onClick={() => { setSelectedUser(user); setExaminerEmail(user.Email); setActiveTab('email'); }} className="text-blue-600 hover:text-blue-900">Edit Email</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Edit User */}
                {selectedUser && activeTab === 'user' && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-800">Edit User</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded border border-gray-200">
                      <input type="text" name="RollNo" value={selectedUser.RollNo} onChange={handleSelectedUserChange} placeholder="Roll No" className="p-2 border rounded" />
                      <input type="text" name="PRNNumber" value={selectedUser.PRNNumber} onChange={handleSelectedUserChange} placeholder="PRN Number" className="p-2 border rounded" />
                      <select name="Gender" value={selectedUser.Gender} onChange={handleSelectedUserChange} className="p-2 border rounded">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <input type="email" name="Email" value={selectedUser.Email} onChange={handleSelectedUserChange} placeholder="Email" className="p-2 border rounded" />
                      <input type="text" name="FirstName" value={selectedUser.FirstName} onChange={handleSelectedUserChange} placeholder="First Name" className="p-2 border rounded" />
                      <input type="text" name="MiddleName" value={selectedUser.MiddleName} onChange={handleSelectedUserChange} placeholder="Middle Name" className="p-2 border rounded" />
                      <input type="text" name="LastName" value={selectedUser.LastName} onChange={handleSelectedUserChange} placeholder="Last Name" className="p-2 border rounded" />
                      <input type="text" name="MobileNo" value={selectedUser.MobileNo} onChange={handleSelectedUserChange} placeholder="Mobile No" className="p-2 border rounded" />
                      <select name="IsPHCandidate" value={selectedUser.IsPHCandidate} onChange={handleSelectedUserChange} className="p-2 border rounded">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                      <input type="text" name="CampusName" value={selectedUser.CampusName} onChange={handleSelectedUserChange} placeholder="Campus Name" className="p-2 border rounded" />
                      <input type="text" name="subjects" value={selectedUser.subjects.join(',')} onChange={handleSelectedUserChange} placeholder="Subjects (comma-separated)" className="p-2 border rounded" />
                      <input type="text" name="course" value={selectedUser.course} onChange={handleSelectedUserChange} placeholder="Course" className="p-2 border rounded" />
                      <input type="text" name="combined" value={selectedUser.combined} onChange={handleSelectedUserChange} placeholder="Combined" className="p-2 border rounded" />
                      <div className="col-span-2 flex space-x-2">
                        <button onClick={editUser} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Save Changes</button>
                        <button onClick={() => setSelectedUser(null)} className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600">Cancel</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Active Login Users */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">Active Login Users</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {activeUsers.map((user) => (
                          <tr key={user._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User className="h-5 w-5 text-gray-500" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.FirstName} {user.LastName}</div>
                                  <div className="text-sm text-gray-500">{user.Email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.RollNo}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button onClick={() => resetLoginSession(user._id)} className="text-red-600 hover:text-red-900">Reset Session</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'ip_config' && (
              <>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">IP Configuration</h4>
                  <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <label className="flex items-center">
                      <input type="checkbox" checked={configs.isIPRestrict} onChange={() => toggleConfig('isIPRestrict')} className="mr-2" />
                      Restrict IP Access
                    </label>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono">192.168.1.0/24</span>
                        <button className="text-red-600 text-sm font-medium">Remove</button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-mono">10.0.0.0/8</span>
                        <button className="text-red-600 text-sm font-medium">Remove</button>
                      </div>
                      <button className="text-blue-600 text-sm font-medium flex items-center mt-2">
                        <span>+ Add IP Range</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">Two-Factor Authentication</h4>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded border border-gray-200">
                    <div>
                      <p className="font-medium">Status: <span className={configs.twoFactorAuth ? 'text-green-600' : 'text-red-600'}>{configs.twoFactorAuth ? 'Enabled' : 'Disabled'}</span></p>
                      <p className="text-sm text-gray-600">Toggle to enable/disable 2FA for all users</p>
                    </div>
                    <button onClick={() => toggleConfig('twoFactorAuth')} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700">
                      {configs.twoFactorAuth ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">Evaluator Configurations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded border border-gray-200">
                    <label className="flex items-center">
                      <input type="checkbox" checked={configs.showHalfAnnotation} onChange={() => toggleConfig('showHalfAnnotation')} className="mr-2" />
                      Show Half Annotation
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" checked={configs.showQuarterAnnotation} onChange={() => toggleConfig('showQuarterAnnotation')} className="mr-2" />
                      Show Quarter Annotation
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" checked={configs.showRemunerationReport} onChange={() => toggleConfig('showRemunerationReport')} className="mr-2" />
                      Show Remuneration Report
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" checked={configs.downloadReport} onChange={() => toggleConfig('downloadReport')} className="mr-2" />
                      Download Report
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" checked={configs.enableFacultyForm} onChange={() => toggleConfig('enableFacultyForm')} className="mr-2" />
                      Enable Faculty Form
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" checked={configs.showExaminerAnnotations} onChange={() => toggleConfig('showExaminerAnnotations')} className="mr-2" />
                      Show Examiner Annotations for Moderator
                    </label>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'profile' && (
              <>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">Admin Configurations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded border border-gray-200">
                    <label className="flex items-center">
                      <input type="checkbox" checked={configs.questionWiseRoundOff} onChange={() => toggleConfig('questionWiseRoundOff')} className="mr-2" />
                      Question Wise Round Off
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" checked={configs.countRecheck} onChange={() => toggleConfig('countRecheck')} className="mr-2" />
                      Count Recheck
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" checked={configs.rollNoAsBookletName} onChange={() => toggleConfig('rollNoAsBookletName')} className="mr-2" />
                      Roll No as Booklet Name
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" checked={configs.examinerMayBeReval} onChange={() => toggleConfig('examinerMayBeReval')} className="mr-2" />
                      Examiner May Be Reval
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" checked={configs.isProctored} onChange={() => toggleConfig('isProctored')} className="mr-2" />
                      Is Proctored
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" checked={configs.isModeration} onChange={() => toggleConfig('isModeration')} className="mr-2" />
                      Is Moderation
                    </label>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Moderation Checking Percentage</label>
                      <input type="number" value={configs.moderationPercentage} onChange={(e) => handleConfigNumberChange('moderationPercentage', e.target.value)} className="p-2 border rounded w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Minimum Booklets for Moderation</label>
                      <input type="number" value={configs.minBookletModeration} onChange={(e) => handleConfigNumberChange('minBookletModeration', e.target.value)} className="p-2 border rounded w-full" />
                    </div>
                    <label className="flex items-center">
                      <input type="checkbox" checked={configs.removeAssignmentOnRuleChange} onChange={() => toggleConfig('removeAssignmentOnRuleChange')} className="mr-2" />
                      Remove Assignment on Rule Change
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">Image Uploads</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded border border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Institute Profile Image</label>
                      <input id="institute-profileInput" type="file" accept="image/*" onChange={(e) => setInstituteImage(e.target.files[0])} className="mb-2" />
                      <button onClick={() => uploadImage('institute-profile', instituteImage)} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Upload</button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Certificate Header Image</label>
                      <input id="cert-headerInput" type="file" accept="image/*" onChange={(e) => setCertHeaderImage(e.target.files[0])} className="mb-2" />
                      <button onClick={() => uploadImage('cert-header', certHeaderImage)} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Upload</button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Certificate Footer Image</label>
                      <input id="cert-footerInput" type="file" accept="image/*" onChange={(e) => setCertFooterImage(e.target.files[0])} className="mb-2" />
                      <button onClick={() => uploadImage('cert-footer', certFooterImage)} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Upload</button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'permissions' && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Permitted Pages</h4>
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                  <ul className="list-disc pl-5">
                    {permittedPages.map((page, index) => (
                      <li key={index} className="text-gray-600">{page}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Edit Examiner Email</h4>
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                  <input
                    type="email"
                    value={examinerEmail}
                    onChange={(e) => setExaminerEmail(e.target.value)}
                    placeholder="Examiner Email"
                    className="p-2 border rounded w-full mb-2"
                    disabled={!selectedUser}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={updateExaminerEmail}
                      className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                      disabled={!selectedUser}
                    >
                      Update Email
                    </button>
                    <button
                      onClick={() => { setExaminerEmail(''); setSelectedUser(null); }}
                      className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 p-6 min-h-screen w-full">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Institute Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Edit and manage details, profiles, and users in your Institute
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={exportUsers} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Export Data
            </button>
            <button onClick={() => setActiveTab('user')} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
              Add New
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="md:w-64 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center px-4 py-3 text-sm font-medium rounded-md
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                    transition-colors duration-150
                  `}
                >
                  <tab.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Page;