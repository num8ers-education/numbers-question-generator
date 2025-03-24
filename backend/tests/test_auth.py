import pytest
from fastapi.testclient import TestClient
from bson import ObjectId
from datetime import datetime
import os
import sys

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.auth.auth_handler import get_password_hash
from main import app

client = TestClient(app)

# Test user data
test_user = {
    "email": "test@example.com",
    "password": "testpassword123",
    "full_name": "Test User",
    "role": "teacher"
}

# Mock database functions
def setup_module(module):
    """Setup before all tests"""
    from app.config.db import users_collection
    
    # Create a test user
    hashed_password = get_password_hash(test_user["password"])
    user_data = {
        "_id": ObjectId(),
        "email": test_user["email"],
        "full_name": test_user["full_name"],
        "role": test_user["role"],
        "hashed_password": hashed_password,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Check if user already exists
    existing_user = users_collection.find_one({"email": test_user["email"]})
    if not existing_user:
        users_collection.insert_one(user_data)

def teardown_module(module):
    """Teardown after all tests"""
    from app.config.db import users_collection
    
    # Delete test user
    users_collection.delete_one({"email": test_user["email"]})

def test_login_success():
    """Test successful login"""
    response = client.post(
        "/api/login",
        json={
            "email": test_user["email"],
            "password": test_user["password"]
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "user_id" in data
    assert data["role"] == test_user["role"]

def test_login_wrong_password():
    """Test login with incorrect password"""
    response = client.post(
        "/api/login",
        json={
            "email": test_user["email"],
            "password": "wrongpassword"
        }
    )
    
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

def test_login_nonexistent_user():
    """Test login with non-existent user"""
    response = client.post(
        "/api/login",
        json={
            "email": "nonexistent@example.com",
            "password": "anypassword"
        }
    )
    
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

def test_protected_route_without_token():
    """Test accessing a protected route without a token"""
    response = client.get("/api/curriculum")
    
    assert response.status_code == 403
    assert "Invalid authentication" in response.json()["detail"]

def test_protected_route_with_token():
    """Test accessing a protected route with a valid token"""
    # First, get a token
    login_response = client.post(
        "/api/login",
        json={
            "email": test_user["email"],
            "password": test_user["password"]
        }
    )
    
    token = login_response.json()["access_token"]
    
    # Now try to access a protected route
    response = client.get(
        "/api/curriculum", 
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # Even if there's no curricula, we should get a 200 with an empty list
    assert response.status_code == 200

if __name__ == "__main__":
    pytest.main()