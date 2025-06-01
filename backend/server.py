from fastapi import FastAPI, APIRouter, HTTPException, status
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import bcrypt
import jwt
import httpx
import asyncio
import json
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="MgeniLog Visitor Management System", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# JWT Configuration
JWT_SECRET = "mgenilog-secret-key-2025"
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DELTA = timedelta(days=7)

# M-pesa Configuration (from user's credentials)
MPESA_CONSUMER_KEY = "V4dFvkKtAogAB9lI8GrAIgc6YJfJGhpFXNz5tL0LTaDwt4sb"
MPESA_CONSUMER_SECRET = "M1CVAHM2qxzwAsDExon2nBalzxnUqKyYF5zEcoLHKEiIh6SK0tgG5tIVTK2nSh4n"
MPESA_ENVIRONMENT = "sandbox"
MPESA_PASSKEY = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
MPESA_SHORTCODE = "174379"

# Pesapal Configuration
PESAPAL_CONSUMER_KEY = "qkURHvaZGi4+5J2ymX2MynDKh6Vpf7rr"
PESAPAL_CONSUMER_SECRET = "Ouvl3Mly69arFkxgOhtoU1OScus="
PESAPAL_ENVIRONMENT = "sandbox"

# --- Models ---

class OrganizationCreate(BaseModel):
    name: str
    email: str
    password: str
    firstName: str
    lastName: str
    phone: Optional[str] = None
    industry: Optional[str] = None

class Organization(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    logoUrl: Optional[str] = None
    industry: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class Site(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    organizationId: str
    name: str
    address: Optional[str] = None
    contactPerson: Optional[str] = None
    contactEmail: Optional[str] = None
    contactPhone: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    organizationId: str
    siteId: Optional[str] = None
    email: str
    passwordHash: str
    firstName: str
    lastName: str
    role: str  # org_admin, site_admin, site_user
    isActive: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class Host(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    siteId: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    department: str
    position: Optional[str] = None
    isActive: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class Visitor(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    organizationId: str
    name: str
    phone: str
    idNumber: Optional[str] = None
    gender: Optional[str] = None
    firstVisit: datetime = Field(default_factory=datetime.utcnow)
    lastVisit: datetime = Field(default_factory=datetime.utcnow)
    visitCount: int = 1
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class VisitorData(BaseModel):
    name: str
    phone: str
    idNumber: Optional[str] = None
    gender: Optional[str] = None

class Visit(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    visitorId: str
    siteId: str
    hostId: str
    purpose: Optional[str] = None
    valuables: List[str] = []
    checkInTime: datetime = Field(default_factory=datetime.utcnow)
    expectedCheckOutTime: Optional[datetime] = None
    actualCheckOutTime: Optional[datetime] = None
    status: str = "checked_in"  # checked_in, checked_out
    checkInBy: str
    checkOutBy: Optional[str] = None
    notes: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class VisitCreate(BaseModel):
    organizationId: str
    siteId: str
    visitorData: VisitorData
    hostId: str
    purpose: Optional[str] = None
    valuables: List[str] = []
    expectedDuration: Optional[int] = None  # in minutes
    checkInBy: str

class Payment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    organizationId: str
    amount: float
    currency: str = "KES"
    paymentMethod: str  # mpesa, pesapal
    paymentReference: Optional[str] = None
    status: str = "pending"  # pending, completed, failed
    paymentDate: Optional[datetime] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class TestPaymentRequest(BaseModel):
    method: str  # mpesa or pesapal
    amount: float
    phoneNumber: Optional[str] = None

# --- Utility Functions ---

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(payload: dict) -> str:
    payload['exp'] = datetime.utcnow() + JWT_EXPIRATION_DELTA
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def mask_phone_number(phone: str) -> str:
    if len(phone) <= 4:
        return phone
    return phone[:2] + '*' * (len(phone) - 6) + phone[-4:]

def mask_id_number(id_num: str) -> str:
    if len(id_num) <= 4:
        return id_num
    return '*' * (len(id_num) - 4) + id_num[-4:]

# --- M-pesa Integration ---

async def get_mpesa_access_token():
    url = f"https://{'sandbox' if MPESA_ENVIRONMENT == 'sandbox' else 'api'}.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    
    auth = httpx.BasicAuth(MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET)
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, auth=auth)
            response.raise_for_status()
            return response.json()["access_token"]
        except Exception as e:
            logging.error(f"Failed to get M-pesa access token: {e}")
            raise HTTPException(status_code=500, detail="Failed to authenticate with M-pesa")

async def initiate_stk_push(phone_number: str, amount: float, account_reference: str, transaction_desc: str):
    access_token = await get_mpesa_access_token()
    
    url = f"https://{'sandbox' if MPESA_ENVIRONMENT == 'sandbox' else 'api'}.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    password = f"{MPESA_SHORTCODE}{MPESA_PASSKEY}{timestamp}"
    password_encoded = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    
    payload = {
        "BusinessShortCode": MPESA_SHORTCODE,
        "Password": password_encoded,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": phone_number,
        "PartyB": MPESA_SHORTCODE,
        "PhoneNumber": phone_number,
        "CallBackURL": "https://example.com/callback",  # Would be configured properly in production
        "AccountReference": account_reference,
        "TransactionDesc": transaction_desc
    }
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, headers=headers)
            return response.json()
        except Exception as e:
            logging.error(f"STK Push failed: {e}")
            return {"success": False, "message": str(e)}

# --- API Routes ---

@api_router.get("/")
async def root():
    return {"message": "MgeniLog Visitor Management System API", "version": "1.0.0"}

@api_router.post("/auth/register")
async def register_organization(org_data: OrganizationCreate):
    # Check if organization email already exists
    existing_org = await db.organizations.find_one({"email": org_data.email})
    if existing_org:
        raise HTTPException(status_code=400, detail="Organization with this email already exists")
    
    # Check if user email already exists
    existing_user = await db.users.find_one({"email": org_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    try:
        # Create organization
        organization = Organization(
            name=org_data.name,
            email=org_data.email,
            phone=org_data.phone,
            industry=org_data.industry
        )
        await db.organizations.insert_one(organization.dict())
        
        # Create admin user
        user = User(
            organizationId=organization.id,
            email=org_data.email,
            passwordHash=hash_password(org_data.password),
            firstName=org_data.firstName,
            lastName=org_data.lastName,
            role="org_admin"
        )
        await db.users.insert_one(user.dict())
        
        # Create default site
        site = Site(
            organizationId=organization.id,
            name="Main Office",
            address=""
        )
        await db.sites.insert_one(site.dict())
        
        # Create sample hosts for the demo
        sample_hosts = [
            Host(siteId=site.id, name="John Doe", department="HR", email="john@example.com"),
            Host(siteId=site.id, name="Jane Smith", department="Finance", email="jane@example.com"),
            Host(siteId=site.id, name="Mike Johnson", department="IT", email="mike@example.com"),
            Host(siteId=site.id, name="Sarah Wilson", department="Operations", email="sarah@example.com")
        ]
        
        for host in sample_hosts:
            await db.hosts.insert_one(host.dict())
        
        return {
            "success": True,
            "organizationId": organization.id,
            "userId": user.id,
            "siteId": site.id,
            "message": "Organization registered successfully"
        }
        
    except Exception as e:
        logging.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Failed to register organization")

@api_router.post("/test-payment")
async def test_payment(payment_request: TestPaymentRequest):
    try:
        if payment_request.method == "mpesa":
            if not payment_request.phoneNumber:
                raise HTTPException(status_code=400, detail="Phone number required for M-pesa payment")
            
            # Format phone number
            phone = payment_request.phoneNumber.replace("+", "")
            if phone.startswith("0"):
                phone = "254" + phone[1:]
            elif not phone.startswith("254"):
                phone = "254" + phone
            
            result = await initiate_stk_push(
                phone_number=phone,
                amount=payment_request.amount,
                account_reference=f"test-{uuid.uuid4()}",
                transaction_desc=f"MgeniLog Test Payment - KES {payment_request.amount}"
            )
            
            return {
                "success": True,
                "message": f"M-pesa STK Push initiated for KES {payment_request.amount}/-",
                "data": result
            }
            
        elif payment_request.method == "pesapal":
            # Simulate Pesapal integration
            return {
                "success": True,
                "message": f"Pesapal payment initiated for KES {payment_request.amount}/-",
                "data": {
                    "order_id": str(uuid.uuid4()),
                    "redirect_url": "https://pesapal.com/payment-form"
                }
            }
        else:
            raise HTTPException(status_code=400, detail="Invalid payment method")
            
    except Exception as e:
        logging.error(f"Payment test error: {e}")
        return {
            "success": False,
            "message": f"Payment test failed: {str(e)}"
        }

@api_router.get("/visitors/search")
async def search_visitor(phone: str, organizationId: str):
    try:
        visitor = await db.visitors.find_one({
            "organizationId": organizationId,
            "phone": phone
        })
        
        if not visitor:
            return {
                "found": False,
                "message": "No visitor found with this phone number"
            }
        
        # Get recent visits
        recent_visits = await db.visits.find({
            "visitorId": visitor["id"]
        }).sort("createdAt", -1).limit(5).to_list(5)
        
        # Mask sensitive data
        masked_visitor = {
            "id": visitor["id"],
            "name": visitor["name"],
            "phone": mask_phone_number(visitor["phone"]),
            "idNumber": mask_id_number(visitor["idNumber"]) if visitor.get("idNumber") else None,
            "gender": visitor.get("gender"),
            "visitCount": visitor.get("visitCount", 1),
            "visits": recent_visits
        }
        
        return {
            "found": True,
            "visitor": masked_visitor
        }
        
    except Exception as e:
        logging.error(f"Visitor search error: {e}")
        raise HTTPException(status_code=500, detail="Failed to search visitor")

@api_router.post("/visits/checkin")
async def checkin_visitor(visit_data: VisitCreate):
    try:
        # Find or create visitor
        existing_visitor = await db.visitors.find_one({
            "organizationId": visit_data.organizationId,
            "phone": visit_data.visitorData.phone
        })
        
        if existing_visitor:
            # Update existing visitor
            visitor_id = existing_visitor["id"]
            await db.visitors.update_one(
                {"id": visitor_id},
                {
                    "$set": {
                        "name": visit_data.visitorData.name,
                        "idNumber": visit_data.visitorData.idNumber,
                        "gender": visit_data.visitorData.gender,
                        "lastVisit": datetime.utcnow(),
                        "updatedAt": datetime.utcnow()
                    },
                    "$inc": {"visitCount": 1}
                }
            )
        else:
            # Create new visitor
            visitor = Visitor(
                organizationId=visit_data.organizationId,
                name=visit_data.visitorData.name,
                phone=visit_data.visitorData.phone,
                idNumber=visit_data.visitorData.idNumber,
                gender=visit_data.visitorData.gender
            )
            await db.visitors.insert_one(visitor.dict())
            visitor_id = visitor.id
        
        # Calculate expected checkout time
        expected_checkout = None
        if visit_data.expectedDuration:
            expected_checkout = datetime.utcnow() + timedelta(minutes=visit_data.expectedDuration)
        
        # Create visit record
        visit = Visit(
            visitorId=visitor_id,
            siteId=visit_data.siteId,
            hostId=visit_data.hostId,
            purpose=visit_data.purpose,
            valuables=visit_data.valuables,
            expectedCheckOutTime=expected_checkout,
            checkInBy=visit_data.checkInBy
        )
        await db.visits.insert_one(visit.dict())
        
        return {
            "success": True,
            "visit": visit.dict(),
            "message": "Visitor checked in successfully"
        }
        
    except Exception as e:
        logging.error(f"Check-in error: {e}")
        raise HTTPException(status_code=500, detail="Failed to check in visitor")

@api_router.get("/visits/active")
async def get_active_visits(siteId: str, organizationId: str):
    try:
        # Get active visits
        visits = await db.visits.find({
            "siteId": siteId,
            "status": "checked_in"
        }).sort("checkInTime", -1).to_list(100)
        
        # Enrich with visitor and host data
        enriched_visits = []
        for visit in visits:
            # Get visitor data
            visitor = await db.visitors.find_one({"id": visit["visitorId"]})
            if not visitor:
                continue
                
            # Get host data
            host = await db.hosts.find_one({"id": visit["hostId"]})
            if not host:
                continue
            
            # Get site data
            site = await db.sites.find_one({"id": visit["siteId"]})
            
            enriched_visit = {
                "id": visit["id"],
                "checkInTime": visit["checkInTime"],
                "expectedCheckOutTime": visit.get("expectedCheckOutTime"),
                "purpose": visit.get("purpose"),
                "valuables": visit.get("valuables", []),
                "status": visit["status"],
                "visitor": {
                    "id": visitor["id"],
                    "name": visitor["name"],
                    "phone": mask_phone_number(visitor["phone"]),
                    "idNumber": mask_id_number(visitor["idNumber"]) if visitor.get("idNumber") else None,
                    "gender": visitor.get("gender")
                },
                "host": {
                    "id": host["id"],
                    "name": host["name"],
                    "department": host.get("department")
                },
                "site": {
                    "id": site["id"] if site else siteId,
                    "name": site["name"] if site else "Unknown Site"
                }
            }
            enriched_visits.append(enriched_visit)
        
        return {
            "success": True,
            "visits": enriched_visits,
            "count": len(enriched_visits)
        }
        
    except Exception as e:
        logging.error(f"Active visits error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch active visits")

@api_router.get("/hosts")
async def get_hosts(siteId: str):
    try:
        hosts = await db.hosts.find({"siteId": siteId, "isActive": True}).to_list(100)
        return {
            "success": True,
            "hosts": hosts
        }
    except Exception as e:
        logging.error(f"Get hosts error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch hosts")

@api_router.post("/visits/{visit_id}/checkout")
async def checkout_visitor(visit_id: str):
    try:
        result = await db.visits.update_one(
            {"id": visit_id, "status": "checked_in"},
            {
                "$set": {
                    "status": "checked_out",
                    "actualCheckOutTime": datetime.utcnow(),
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Visit not found or already checked out")
        
        return {
            "success": True,
            "message": "Visitor checked out successfully"
        }
        
    except Exception as e:
        logging.error(f"Check-out error: {e}")
        raise HTTPException(status_code=500, detail="Failed to check out visitor")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()