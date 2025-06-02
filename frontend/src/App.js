import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Icons as React components
const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const UserPlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="19" y1="8" x2="19" y2="14"/>
    <line x1="22" y1="11" x2="16" y2="11"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

const CreditCardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22,4 12,14.01 9,11.01"/>
  </svg>
);

const XCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

const Building2Icon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
    <path d="M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2"/>
    <path d="M10 6h4"/>
    <path d="M10 10h4"/>
    <path d="M10 14h4"/>
    <path d="M10 18h4"/>
  </svg>
);

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const FileTextIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10,9 9,9 8,9"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m17-4a4 4 0 0 1-8 0 4 4 0 0 1 8 0zM7 17a4 4 0 0 1-8 0 4 4 0 0 1 8 0z"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6,9 12,15 18,9"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9,18 15,12 9,6"/>
  </svg>
);

const LogOutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16,17 21,12 16,7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

function MgeniLogApp() {
  const [currentView, setCurrentView] = useState('signup');
  const [currentSubView, setCurrentSubView] = useState('overview');
  const [searchPhone, setSearchPhone] = useState('');
  const [foundVisitor, setFoundVisitor] = useState(null);
  const [activeVisits, setActiveVisits] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [paymentResult, setPaymentResult] = useState(null);
  const [organizationId, setOrganizationId] = useState(localStorage.getItem('mgenilog_org_id') || '');
  const [siteId, setSiteId] = useState(localStorage.getItem('mgenilog_site_id') || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedModules, setExpandedModules] = useState({
    visitors: true,
    sites: false,
    reports: false,
    settings: false
  });

  const [newVisitor, setNewVisitor] = useState({
    name: '',
    phone: '',
    idNumber: '',
    gender: '',
    hostId: '',
    purpose: '',
    valuables: '',
    expectedDuration: 60
  });

  const [organization, setOrganization] = useState({
    name: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    industry: ''
  });

  useEffect(() => {
    // Check if we have session data and should skip to dashboard
    const storedOrgId = localStorage.getItem('mgenilog_org_id');
    const storedSiteId = localStorage.getItem('mgenilog_site_id');
    
    if (storedOrgId && storedSiteId && currentView === 'signup') {
      setOrganizationId(storedOrgId);
      setSiteId(storedSiteId);
      setCurrentView('dashboard');
    }
    
    if (currentView === 'dashboard' || currentView === 'checkin') {
      loadActiveVisits();
      loadHosts();
    }
  }, [currentView, organizationId, siteId]);

  // Navigation modules configuration
  const navigationModules = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: <DashboardIcon />,
      submodules: []
    },
    {
      id: 'visitors',
      name: 'Visitors',
      icon: <UsersIcon />,
      submodules: [
        { id: 'checkin', name: 'Check-In', icon: <UserPlusIcon /> },
        { id: 'active', name: 'Active Visitors', icon: <ClockIcon /> },
        { id: 'log', name: 'Visitor Log', icon: <FileTextIcon /> }
      ]
    },
    {
      id: 'sites',
      name: 'Sites',
      icon: <Building2Icon />,
      submodules: [
        { id: 'management', name: 'Site Management', icon: <SettingsIcon /> },
        { id: 'hosts', name: 'Hosts', icon: <UserIcon /> },
        { id: 'departments', name: 'Departments', icon: <Building2Icon /> }
      ]
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: <FileTextIcon />,
      submodules: [
        { id: 'visitor-reports', name: 'Visitor Reports', icon: <FileTextIcon /> },
        { id: 'analytics', name: 'Analytics', icon: <DashboardIcon /> }
      ]
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: <SettingsIcon />,
      submodules: [
        { id: 'organization', name: 'Organization', icon: <Building2Icon /> },
        { id: 'users', name: 'Users', icon: <UsersIcon /> },
        { id: 'billing', name: 'Billing', icon: <CreditCardIcon /> }
      ]
    }
  ];

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleNavigation = (moduleId, submoduleId = null) => {
    if (moduleId === 'dashboard') {
      setCurrentView('dashboard');
      setCurrentSubView('overview');
    } else if (moduleId === 'visitors') {
      if (submoduleId === 'checkin') {
        setCurrentView('checkin');
        setCurrentSubView('checkin');
      } else if (submoduleId === 'active') {
        setCurrentView('dashboard');
        setCurrentSubView('active');
      } else if (submoduleId === 'log') {
        setCurrentView('dashboard');
        setCurrentSubView('log');
      }
    } else if (moduleId === 'sites') {
      setCurrentView('sites');
      setCurrentSubView(submoduleId || 'management');
    } else if (moduleId === 'reports') {
      setCurrentView('reports');
      setCurrentSubView(submoduleId || 'visitor-reports');
    } else if (moduleId === 'settings') {
      if (submoduleId === 'billing') {
        setCurrentView('payment');
        setCurrentSubView('billing');
      } else {
        setCurrentView('settings');
        setCurrentSubView(submoduleId || 'organization');
      }
    }
  };

  // Search for visitor by phone
  const searchVisitor = async () => {
    if (!searchPhone.trim() || !organizationId) {
      alert('Please enter a phone number');
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(`${API}/visitors/search`, {
        params: { phone: searchPhone, organizationId: organizationId }
      });
      
      if (response.data.found) {
        setFoundVisitor(response.data.visitor);
        setNewVisitor(prev => ({
          ...prev,
          name: response.data.visitor.name,
          phone: searchPhone,
          idNumber: response.data.visitor.idNumber || '',
          gender: response.data.visitor.gender || ''
        }));
      } else {
        setFoundVisitor(null);
        setNewVisitor(prev => ({
          ...prev,
          name: '',
          phone: searchPhone,
          idNumber: '',
          gender: ''
        }));
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search visitor');
    } finally {
      setIsSearching(false);
    }
  };

  // Check in visitor
  const checkInVisitor = async () => {
    if (!newVisitor.name || !newVisitor.phone || !newVisitor.hostId) {
      alert('Please fill in all required fields');
      return;
    }

    setIsCheckingIn(true);
    try {
      const response = await axios.post(`${API}/visits/checkin`, {
        organizationId,
        siteId,
        visitorData: {
          name: newVisitor.name,
          phone: newVisitor.phone,
          idNumber: newVisitor.idNumber,
          gender: newVisitor.gender
        },
        hostId: newVisitor.hostId,
        purpose: newVisitor.purpose,
        valuables: newVisitor.valuables ? [newVisitor.valuables] : [],
        expectedDuration: newVisitor.expectedDuration,
        checkInBy: 'reception'
      });

      if (response.data.success) {
        alert('Visitor checked in successfully!');
        setNewVisitor({
          name: '',
          phone: '',
          idNumber: '',
          gender: '',
          hostId: '',
          purpose: '',
          valuables: '',
          expectedDuration: 60
        });
        setFoundVisitor(null);
        setSearchPhone('');
        loadActiveVisits();
      } else {
        alert(response.data.error || 'Failed to check in visitor');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      alert('Failed to check in visitor');
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Load active visits
  const loadActiveVisits = async () => {
    if (!organizationId || !siteId) return;

    try {
      const response = await axios.get(`${API}/visits/active`, {
        params: { siteId, organizationId }
      });
      
      if (response.data.success) {
        setActiveVisits(response.data.visits);
      }
    } catch (error) {
      console.error('Failed to load active visits:', error);
    }
  };

  // Load hosts
  const loadHosts = async () => {
    if (!siteId) return;

    try {
      const response = await axios.get(`${API}/hosts`, {
        params: { siteId }
      });
      
      if (response.data.success) {
        setHosts(response.data.hosts);
      }
    } catch (error) {
      console.error('Failed to load hosts:', error);
      // Use fallback hosts if API fails
      setHosts([
        { id: '1', name: 'John Doe', department: 'HR' },
        { id: '2', name: 'Jane Smith', department: 'Finance' },
        { id: '3', name: 'Mike Johnson', department: 'IT' },
        { id: '4', name: 'Sarah Wilson', department: 'Operations' }
      ]);
    }
  };

  // Register organization
  const registerOrganization = async () => {
    if (!organization.name || !organization.email || !organization.password || !organization.firstName || !organization.lastName) {
      setError('Please fill in all required fields');
      return;
    }

    setError('');
    try {
      const response = await axios.post(`${API}/auth/register`, organization);
      
      if (response.data.success) {
        const orgId = response.data.organizationId;
        const sId = response.data.siteId;
        
        setOrganizationId(orgId);
        setSiteId(sId);
        
        // Persist to localStorage
        localStorage.setItem('mgenilog_org_id', orgId);
        localStorage.setItem('mgenilog_site_id', sId);
        
        setSuccess('Organization registered successfully!');
        setTimeout(() => {
          setCurrentView('payment');
        }, 1000);
      } else {
        setError(response.data.error || 'Failed to register organization');
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response && error.response.data && error.response.data.detail) {
        setError(error.response.data.detail);
      } else {
        setError('Failed to register organization. Please try again.');
      }
    }
  };

  // Test payment
  const testPayment = async () => {
    try {
      const response = await axios.post(`${API}/test-payment`, {
        method: paymentMethod,
        amount: paymentAmount,
        phoneNumber: paymentMethod === 'mpesa' ? '254700000000' : undefined
      });

      setPaymentResult(response.data);
      
      if (response.data.success) {
        setTimeout(() => {
          setCurrentView('dashboard');
        }, 3000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentResult({
        success: false,
        message: 'Payment test failed'
      });
    }
  };

  // Show appropriate main content based on current view
  const renderMainContent = () => {
    if (currentView === 'checkin') {
      return renderCheckInContent();
    } else if (currentView === 'dashboard') {
      return renderDashboardContent();
    } else if (currentView === 'sites') {
      return renderSitesContent();
    } else if (currentView === 'reports') {
      return renderReportsContent();
    } else if (currentView === 'settings') {
      return renderSettingsContent();
    }
    return renderDashboardContent(); // Default
  };

  const renderCheckInContent = () => (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check-In Visitor</h1>
        <p className="text-gray-600">Register a new visitor or search for returning visitors</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Phone Search */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search by Phone Number</label>
          <div className="flex space-x-2">
            <input
              type="tel"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="254700000000"
            />
            <button
              onClick={searchVisitor}
              disabled={isSearching}
              className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <SearchIcon />
              )}
            </button>
          </div>
          {foundVisitor && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Returning visitor found:</strong> {foundVisitor.name} 
                {foundVisitor.visitCount && ` (${foundVisitor.visitCount} visits)`}
              </p>
            </div>
          )}
        </div>

        {/* Visitor Details Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={newVisitor.name}
              onChange={(e) => setNewVisitor(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
            <input
              type="text"
              value={newVisitor.idNumber}
              onChange={(e) => setNewVisitor(prev => ({ ...prev, idNumber: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="12345678"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              value={newVisitor.gender}
              onChange={(e) => setNewVisitor(prev => ({ ...prev, gender: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Host *</label>
            <select
              value={newVisitor.hostId}
              onChange={(e) => setNewVisitor(prev => ({ ...prev, hostId: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select Host</option>
              {hosts.map(host => (
                <option key={host.id} value={host.id}>
                  {host.name} - {host.department}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Visit</label>
            <input
              type="text"
              value={newVisitor.purpose}
              onChange={(e) => setNewVisitor(prev => ({ ...prev, purpose: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Business meeting"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valuables</label>
            <input
              type="text"
              value={newVisitor.valuables}
              onChange={(e) => setNewVisitor(prev => ({ ...prev, valuables: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Laptop, Phone"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Expected Duration (minutes)</label>
          <input
            type="number"
            value={newVisitor.expectedDuration}
            onChange={(e) => setNewVisitor(prev => ({ ...prev, expectedDuration: parseInt(e.target.value) }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="60"
          />
        </div>

        <button
          onClick={checkInVisitor}
          disabled={isCheckingIn}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50"
        >
          {isCheckingIn ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Checking In...
            </div>
          ) : (
            'Check In Visitor'
          )}
        </button>
      </div>
    </div>
  );

  const renderDashboardContent = () => (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {organization.firstName || 'Admin'}</h1>
        <p className="text-gray-600">Overview of your visitor management system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Visits</p>
              <p className="text-3xl font-bold text-gray-900">{activeVisits.length + 15}</p>
              <p className="text-xs text-gray-500">Last week</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileTextIcon />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Visitors</p>
              <p className="text-3xl font-bold text-gray-900">{activeVisits.length}</p>
              <p className="text-xs text-gray-500">On site now</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <UsersIcon />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
              <p className="text-3xl font-bold text-gray-900">{Math.max(activeVisits.length, 3)}</p>
              <p className="text-xs text-gray-500">Last week</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <UserIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Visitor Types Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Visitor Types</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">New Visitors</span>
              </div>
              <span className="text-sm font-medium">65%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Returning Visitors</span>
              </div>
              <span className="text-sm font-medium">35%</span>
            </div>
          </div>
        </div>

        {/* Visitor Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Visitor Trend</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-xs bg-indigo-100 text-indigo-600 rounded">Day</button>
              <button className="px-3 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded">Week</button>
              <button className="px-3 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded">Month</button>
            </div>
          </div>
          <div className="h-32 flex items-end justify-between space-x-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <div key={day} className="flex flex-col items-center flex-1">
                <div className={`w-full rounded-t ${index === 2 ? 'bg-indigo-500 h-16' : index === 4 ? 'bg-indigo-500 h-12' : 'bg-gray-200 h-8'}`}></div>
                <span className="text-xs text-gray-500 mt-2">{day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Visitors Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Active Visitors</h3>
          <p className="text-sm text-gray-500">Visitors currently on premises</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Host</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeVisits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <UsersIcon />
                    <p className="mt-4">No active visitors</p>
                    <p className="text-sm">Check in your first visitor to see them here</p>
                  </td>
                </tr>
              ) : (
                activeVisits.map((visit) => (
                  <tr key={visit.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center">
                          <UserIcon />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{visit.visitor.name}</div>
                          <div className="text-sm text-gray-500">{visit.visitor.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{visit.host.name}</div>
                      <div className="text-sm text-gray-500">{visit.host.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{visit.purpose || 'Not specified'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(visit.checkInTime).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSitesContent = () => (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Site Management</h1>
        <p className="text-gray-600">Manage your organization's sites and locations</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-500">Site management features coming soon...</p>
      </div>
    </div>
  );

  const renderReportsContent = () => (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600">Generate and download visitor reports</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-500">Reporting features coming soon...</p>
      </div>
    </div>
  );

  const renderSettingsContent = () => (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your organization and account settings</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-500">Settings features coming soon...</p>
      </div>
    </div>
  );

  // Sidebar component
  const renderSidebar = () => (
    <div className={`bg-slate-800 text-white h-screen flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center">
          <div className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
            <ShieldIcon />
          </div>
          {!sidebarCollapsed && (
            <span className="text-xl font-bold text-white">MgeniLog</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {navigationModules.map((module) => (
          <div key={module.id} className="mb-1">
            <button
              onClick={() => {
                if (module.submodules.length > 0) {
                  toggleModule(module.id);
                } else {
                  handleNavigation(module.id);
                }
              }}
              className={`w-full flex items-center px-4 py-3 text-sm text-left hover:bg-slate-700 transition-colors ${
                currentView === module.id ? 'bg-slate-700 border-r-4 border-indigo-500' : ''
              }`}
            >
              <span className="mr-3">{module.icon}</span>
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1">{module.name}</span>
                  {module.submodules.length > 0 && (
                    <span className="ml-2">
                      {expandedModules[module.id] ? <ChevronDownIcon /> : <ChevronRightIcon />}
                    </span>
                  )}
                </>
              )}
            </button>
            
            {/* Submodules */}
            {!sidebarCollapsed && expandedModules[module.id] && module.submodules.length > 0 && (
              <div className="ml-4">
                {module.submodules.map((submodule) => (
                  <button
                    key={submodule.id}
                    onClick={() => handleNavigation(module.id, submodule.id)}
                    className={`w-full flex items-center px-4 py-2 text-sm text-left hover:bg-slate-700 transition-colors ${
                      currentSubView === submodule.id ? 'bg-slate-700 text-indigo-300' : 'text-slate-300'
                    }`}
                  >
                    <span className="mr-3 text-xs">{submodule.icon}</span>
                    <span>{submodule.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center">
          <div className="bg-gray-600 w-8 h-8 rounded-full flex items-center justify-center mr-3">
            <UserIcon />
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium">{organization.firstName} {organization.lastName}</p>
              <p className="text-xs text-slate-400">{organization.email}</p>
            </div>
          )}
        </div>
        
        {!sidebarCollapsed && (
          <button
            onClick={() => {
              localStorage.removeItem('mgenilog_org_id');
              localStorage.removeItem('mgenilog_site_id');
              setOrganizationId('');
              setSiteId('');
              setCurrentView('signup');
              setError('');
              setSuccess('');
            }}
            className="w-full mt-3 flex items-center px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors"
          >
            <LogOutIcon />
            <span className="ml-2">Sign Out</span>
          </button>
        )}
      </div>
    </div>
  );

  if (currentView === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldIcon />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">MgeniLog</h1>
            <p className="text-gray-600">Visitor Management System for Kenya</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
              <input
                type="text"
                value={organization.name}
                onChange={(e) => setOrganization(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Acme Corporation"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={organization.firstName}
                  onChange={(e) => setOrganization(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={organization.lastName}
                  onChange={(e) => setOrganization(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={organization.email}
                onChange={(e) => setOrganization(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="admin@acme.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={organization.password}
                onChange={(e) => setOrganization(prev => ({ ...prev, password: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
              <input
                type="tel"
                value={organization.phone}
                onChange={(e) => setOrganization(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="+254700000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry (Optional)</label>
              <select
                value={organization.industry}
                onChange={(e) => setOrganization(prev => ({ ...prev, industry: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select Industry</option>
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="retail">Retail</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button
              onClick={registerOrganization}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-medium"
            >
              Register Organization
            </button>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}
          </div>

          {/* Reset Session Button */}
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                localStorage.removeItem('mgenilog_org_id');
                localStorage.removeItem('mgenilog_site_id');
                setOrganizationId('');
                setSiteId('');
                setCurrentView('signup');
                setError('');
                setSuccess('');
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'payment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCardIcon />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Payment Integration</h2>
            <p className="text-gray-600">Choose amount and payment method to test</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Test Amount (KES)</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 10, 100].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setPaymentAmount(amount)}
                    className={`p-3 border rounded-lg text-center font-medium transition-colors ${
                      paymentAmount === amount
                        ? 'bg-green-100 border-green-500 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    KES {amount}/-
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`p-3 border rounded-lg text-center font-medium transition-colors ${
                    paymentMethod === 'mpesa'
                      ? 'bg-green-100 border-green-500 text-green-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <PhoneIcon />
                  <div className="mt-1">M-Pesa</div>
                </button>
                <button
                  onClick={() => setPaymentMethod('pesapal')}
                  className={`p-3 border rounded-lg text-center font-medium transition-colors ${
                    paymentMethod === 'pesapal'
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <CreditCardIcon />
                  <div className="mt-1">Card</div>
                </button>
              </div>
            </div>

            <button
              onClick={testPayment}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium"
            >
              Test Payment - KES {paymentAmount}/-
            </button>

            {paymentResult && (
              <div className={`p-4 rounded-lg ${
                paymentResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center">
                  {paymentResult.success ? (
                    <CheckCircleIcon />
                  ) : (
                    <XCircleIcon />
                  )}
                  <span className={`ml-2 text-sm font-medium ${
                    paymentResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {paymentResult.message}
                  </span>
                </div>
                {paymentResult.success && (
                  <p className="text-xs text-green-600 mt-2">Redirecting to dashboard...</p>
                )}
              </div>
            )}

            <button
              onClick={() => setCurrentView('dashboard')}
              className="w-full text-gray-600 py-2 text-sm hover:text-gray-800 transition-colors"
            >
              Skip for now →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-indigo-100 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                <ShieldIcon />
              </div>
              <h1 className="text-xl font-bold text-gray-900">MgeniLog</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('checkin')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'checkin'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Check-In
              </button>
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'checkin' ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <UserPlusIcon />
                <span className="ml-2">Check-In Visitor</span>
              </h2>

              {/* Phone Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search by Phone Number</label>
                <div className="flex space-x-2">
                  <input
                    type="tel"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="254700000000"
                  />
                  <button
                    onClick={searchVisitor}
                    disabled={isSearching}
                    className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                  >
                    {isSearching ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <SearchIcon />
                    )}
                  </button>
                </div>
                {foundVisitor && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Returning visitor found:</strong> {foundVisitor.name} 
                      {foundVisitor.visitCount && ` (${foundVisitor.visitCount} visits)`}
                    </p>
                  </div>
                )}
              </div>

              {/* Visitor Details Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={newVisitor.name}
                    onChange={(e) => setNewVisitor(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                  <input
                    type="text"
                    value={newVisitor.idNumber}
                    onChange={(e) => setNewVisitor(prev => ({ ...prev, idNumber: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="12345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={newVisitor.gender}
                    onChange={(e) => setNewVisitor(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Host *</label>
                  <select
                    value={newVisitor.hostId}
                    onChange={(e) => setNewVisitor(prev => ({ ...prev, hostId: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select Host</option>
                    {hosts.map(host => (
                      <option key={host.id} value={host.id}>
                        {host.name} - {host.department}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Visit</label>
                  <input
                    type="text"
                    value={newVisitor.purpose}
                    onChange={(e) => setNewVisitor(prev => ({ ...prev, purpose: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Business meeting"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valuables</label>
                  <input
                    type="text"
                    value={newVisitor.valuables}
                    onChange={(e) => setNewVisitor(prev => ({ ...prev, valuables: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Laptop, Phone"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Duration (minutes)</label>
                <input
                  type="number"
                  value={newVisitor.expectedDuration}
                  onChange={(e) => setNewVisitor(prev => ({ ...prev, expectedDuration: parseInt(e.target.value) }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="60"
                />
              </div>

              <button
                onClick={checkInVisitor}
                disabled={isCheckingIn}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50"
              >
                {isCheckingIn ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Checking In...
                  </div>
                ) : (
                  'Check In Visitor'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center">
                    <UsersIcon />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Visitors</p>
                    <p className="text-2xl font-bold text-gray-900">{activeVisits.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center">
                    <ClockIcon />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Today's Check-ins</p>
                    <p className="text-2xl font-bold text-gray-900">{activeVisits.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Building2Icon />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Sites</p>
                    <p className="text-2xl font-bold text-gray-900">1</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Visitors Table */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Active Visitors</h3>
                <p className="text-sm text-gray-500">Visitors currently on premises</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Host</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activeVisits.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          <UsersIcon />
                          <p className="mt-4">No active visitors</p>
                          <p className="text-sm">Check in your first visitor to see them here</p>
                        </td>
                      </tr>
                    ) : (
                      activeVisits.map((visit) => (
                        <tr key={visit.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center">
                                <UserIcon />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{visit.visitor.name}</div>
                                <div className="text-sm text-gray-500">{visit.visitor.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{visit.host.name}</div>
                            <div className="text-sm text-gray-500">{visit.host.department}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{visit.purpose || 'Not specified'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(visit.checkInTime).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  const [currentView, setCurrentView] = useState('signup');
  const [organizationId, setOrganizationId] = useState('');
  const [siteId, setSiteId] = useState('');

  useEffect(() => {
    // Check if we have session data and should skip to dashboard
    const storedOrgId = localStorage.getItem('mgenilog_org_id');
    const storedSiteId = localStorage.getItem('mgenilog_site_id');
    
    if (storedOrgId && storedSiteId && currentView === 'signup') {
      setOrganizationId(storedOrgId);
      setSiteId(storedSiteId);
      setCurrentView('dashboard');
    }
    
    if (currentView === 'dashboard' || currentView === 'checkin') {
      loadActiveVisits();
      loadHosts();
    }
  }, [currentView, organizationId, siteId]);

  return (
    <div className="App">
      <MgeniLogApp />
    </div>
  );

  useEffect(() => {
    // Check if we have session data and should skip to dashboard
    const storedOrgId = localStorage.getItem('mgenilog_org_id');
    const storedSiteId = localStorage.getItem('mgenilog_site_id');
    
    if (storedOrgId && storedSiteId && currentView === 'signup') {
      setOrganizationId(storedOrgId);
      setSiteId(storedSiteId);
      setCurrentView('dashboard');
    }
    
    if (currentView === 'dashboard' || currentView === 'checkin') {
      loadActiveVisits();
      loadHosts();
    }
  }, [currentView, organizationId, siteId]);
}

export default App;