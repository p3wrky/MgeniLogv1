'use client'

import { useState, useEffect } from 'react'
import { Search, UserPlus, Users, Clock, CreditCard, CheckCircle, XCircle, Phone, User, Building2, Shield } from 'lucide-react'

interface Visitor {
  id: string
  name: string
  phone: string
  idNumber?: string
  gender?: string
  visitCount?: number
  found?: boolean
}

interface Visit {
  id: string
  checkInTime: string
  expectedCheckOutTime?: string
  purpose?: string
  status: string
  visitor: {
    id: string
    name: string
    phone: string
    idNumber?: string
    gender?: string
  }
  host: {
    id: string
    name: string
    department?: {
      id: string
      name: string
    }
  }
  site: {
    id: string
    name: string
  }
}

interface PaymentResult {
  success: boolean
  message: string
  checkoutRequestId?: string
  paymentId?: string
}

export default function MgeniLogApp() {
  const [currentView, setCurrentView] = useState<'signup' | 'dashboard' | 'checkin' | 'payment'>('signup')
  const [searchPhone, setSearchPhone] = useState('')
  const [foundVisitor, setFoundVisitor] = useState<Visitor | null>(null)
  const [activeVisits, setActiveVisits] = useState<Visit[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'pesapal'>('mpesa')
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)
  const [organizationId, setOrganizationId] = useState('')
  const [siteId, setSiteId] = useState('')

  // Sample data for demo
  const [hosts] = useState([
    { id: '1', name: 'John Doe', department: 'HR' },
    { id: '2', name: 'Jane Smith', department: 'Finance' },
    { id: '3', name: 'Mike Johnson', department: 'IT' },
    { id: '4', name: 'Sarah Wilson', department: 'Operations' }
  ])

  const [newVisitor, setNewVisitor] = useState({
    name: '',
    phone: '',
    idNumber: '',
    gender: '',
    hostId: '',
    purpose: '',
    valuables: '',
    expectedDuration: 60
  })

  const [organization, setOrganization] = useState({
    name: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    industry: ''
  })

  // Search for visitor by phone
  const searchVisitor = async () => {
    if (!searchPhone.trim() || !organizationId) {
      alert('Please enter a phone number')
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/visitors/search?phone=${searchPhone}&organizationId=${organizationId}`)
      const data = await response.json()
      
      if (data.found) {
        setFoundVisitor(data.visitor)
        setNewVisitor(prev => ({
          ...prev,
          name: data.visitor.name,
          phone: searchPhone,
          idNumber: data.visitor.idNumber || '',
          gender: data.visitor.gender || ''
        }))
      } else {
        setFoundVisitor(null)
        setNewVisitor(prev => ({
          ...prev,
          name: '',
          phone: searchPhone,
          idNumber: '',
          gender: ''
        }))
      }
    } catch (error) {
      console.error('Search error:', error)
      alert('Failed to search visitor')
    } finally {
      setIsSearching(false)
    }
  }

  // Check in visitor
  const checkInVisitor = async () => {
    if (!newVisitor.name || !newVisitor.phone || !newVisitor.hostId) {
      alert('Please fill in all required fields')
      return
    }

    setIsCheckingIn(true)
    try {
      const response = await fetch('/api/visits/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        })
      })

      const data = await response.json()
      
      if (data.success) {
        alert('Visitor checked in successfully!')
        setNewVisitor({
          name: '',
          phone: '',
          idNumber: '',
          gender: '',
          hostId: '',
          purpose: '',
          valuables: '',
          expectedDuration: 60
        })
        setFoundVisitor(null)
        setSearchPhone('')
        loadActiveVisits()
      } else {
        alert(data.error || 'Failed to check in visitor')
      }
    } catch (error) {
      console.error('Check-in error:', error)
      alert('Failed to check in visitor')
    } finally {
      setIsCheckingIn(false)
    }
  }

  // Load active visits
  const loadActiveVisits = async () => {
    if (!organizationId || !siteId) return

    try {
      const response = await fetch(`/api/visits/active?siteId=${siteId}&organizationId=${organizationId}`)
      const data = await response.json()
      
      if (data.success) {
        setActiveVisits(data.visits)
      }
    } catch (error) {
      console.error('Failed to load active visits:', error)
    }
  }

  // Register organization
  const registerOrganization = async () => {
    if (!organization.name || !organization.email || !organization.password || !organization.firstName || !organization.lastName) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(organization)
      })

      const data = await response.json()
      
      if (data.success) {
        setOrganizationId(data.organizationId)
        setSiteId(data.siteId)
        setCurrentView('payment')
      } else {
        alert(data.error || 'Failed to register organization')
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('Failed to register organization')
    }
  }

  // Test payment
  const testPayment = async () => {
    try {
      const response = await fetch('/api/test-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: paymentMethod,
          amount: paymentAmount,
          phoneNumber: paymentMethod === 'mpesa' ? '254700000000' : undefined
        })
      })

      const data = await response.json()
      setPaymentResult(data)
      
      if (data.success) {
        setTimeout(() => {
          setCurrentView('dashboard')
        }, 3000)
      }
    } catch (error) {
      console.error('Payment error:', error)
      setPaymentResult({
        success: false,
        message: 'Payment test failed'
      })
    }
  }

  useEffect(() => {
    if (currentView === 'dashboard') {
      loadActiveVisits()
    }
  }, [currentView, organizationId, siteId])

  if (currentView === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-indigo-600" />
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
          </div>
        </div>
      </div>
    )
  }

  if (currentView === 'payment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-green-600" />
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
                  <Phone className="w-5 h-5 mx-auto mb-1" />
                  M-Pesa
                </button>
                <button
                  onClick={() => setPaymentMethod('pesapal')}
                  className={`p-3 border rounded-lg text-center font-medium transition-colors ${
                    paymentMethod === 'pesapal'
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1" />
                  Card
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
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mr-2" />
                  )}
                  <span className={`text-sm font-medium ${
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
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-indigo-100 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                <Shield className="w-6 h-6 text-indigo-600" />
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
                <UserPlus className="w-6 h-6 mr-2 text-indigo-600" />
                Check-In Visitor
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
                      <Search className="w-5 h-5" />
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
                    <Users className="w-6 h-6 text-blue-600" />
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
                    <Clock className="w-6 h-6 text-green-600" />
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
                    <Building2 className="w-6 h-6 text-purple-600" />
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
                          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No active visitors</p>
                          <p className="text-sm">Check in your first visitor to see them here</p>
                        </td>
                      </tr>
                    ) : (
                      activeVisits.map((visit) => (
                        <tr key={visit.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{visit.visitor.name}</div>
                                <div className="text-sm text-gray-500">{visit.visitor.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{visit.host.name}</div>
                            <div className="text-sm text-gray-500">{visit.host.department?.name}</div>
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
  )
}