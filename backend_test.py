import requests
import json
import time
import uuid
from datetime import datetime

class MgeniLogAPITester:
    def __init__(self, base_url="https://b82892db-06e8-4c01-9885-236d2602494c.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.organization_id = None
        self.site_id = None
        self.visitor_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            
            print(f"URL: {url}")
            print(f"Status Code: {response.status_code}")
            
            try:
                response_data = response.json()
                print(f"Response: {json.dumps(response_data, indent=2)}")
            except:
                print(f"Response: {response.text}")
                response_data = {}
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
            
            return success, response_data
        
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_register_organization(self):
        """Test organization registration"""
        org_id = str(uuid.uuid4())[:8]
        data = {
            "name": f"Test Organization {org_id}",
            "email": f"test{org_id}@example.com",
            "password": "Password123!",
            "firstName": "Test",
            "lastName": "User",
            "phone": "254700000000",
            "industry": "technology"
        }
        
        success, response = self.run_test(
            "Register Organization",
            "POST",
            "auth/register",
            200,
            data=data
        )
        
        if success and response.get('success'):
            self.organization_id = response.get('organizationId')
            self.site_id = response.get('siteId')
            print(f"Organization ID: {self.organization_id}")
            print(f"Site ID: {self.site_id}")
            return True
        return False

    def test_payment(self, method="mpesa", amount=1):
        """Test payment integration"""
        data = {
            "method": method,
            "amount": amount,
            "phoneNumber": "254700000000" if method == "mpesa" else None
        }
        
        success, response = self.run_test(
            f"Test Payment ({method}, KES {amount}/-)",
            "POST",
            "test-payment",
            200,
            data=data
        )
        
        return success and response.get('success')

    def test_search_visitor(self, phone="254700000000"):
        """Test visitor search by phone"""
        if not self.organization_id:
            print("❌ Organization ID not set, skipping test")
            return False
            
        params = {
            "phone": phone,
            "organizationId": self.organization_id
        }
        
        success, response = self.run_test(
            "Search Visitor",
            "GET",
            "visitors/search",
            200,
            params=params
        )
        
        return success

    def test_checkin_visitor(self):
        """Test visitor check-in"""
        if not self.organization_id or not self.site_id:
            print("❌ Organization ID or Site ID not set, skipping test")
            return False
            
        visitor_id = str(uuid.uuid4())[:8]
        data = {
            "organizationId": self.organization_id,
            "siteId": self.site_id,
            "visitorData": {
                "name": f"Test Visitor {visitor_id}",
                "phone": "254700000000",
                "idNumber": "12345678",
                "gender": "male"
            },
            "hostId": "1",  # Using sample host ID from the frontend
            "purpose": "API Testing",
            "valuables": ["Laptop"],
            "expectedDuration": 60,
            "checkInBy": "reception"
        }
        
        success, response = self.run_test(
            "Check In Visitor",
            "POST",
            "visits/checkin",
            200,
            data=data
        )
        
        return success and response.get('success')

    def test_get_active_visits(self):
        """Test getting active visits"""
        if not self.organization_id or not self.site_id:
            print("❌ Organization ID or Site ID not set, skipping test")
            return False
            
        params = {
            "organizationId": self.organization_id,
            "siteId": self.site_id
        }
        
        success, response = self.run_test(
            "Get Active Visits",
            "GET",
            "visits/active",
            200,
            params=params
        )
        
        return success and response.get('success')

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting MgeniLog API Tests")
        print("=" * 50)
        
        # Test organization registration
        if not self.test_register_organization():
            print("❌ Organization registration failed, stopping tests")
            return self.print_results()
        
        # Test payment integration
        self.test_payment(method="mpesa", amount=1)
        self.test_payment(method="pesapal", amount=10)
        
        # Test visitor search
        self.test_search_visitor()
        
        # Test visitor check-in
        if not self.test_checkin_visitor():
            print("❌ Visitor check-in failed")
        
        # Test getting active visits
        self.test_get_active_visits()
        
        return self.print_results()
    
    def print_results(self):
        """Print test results"""
        print("\n" + "=" * 50)
        print(f"📊 Tests passed: {self.tests_passed}/{self.tests_run}")
        print("=" * 50)
        
        return self.tests_passed == self.tests_run

if __name__ == "__main__":
    tester = MgeniLogAPITester()
    tester.run_all_tests()
