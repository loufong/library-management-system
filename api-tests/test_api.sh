#!/bin/bash
# Library Management System API Test Script
# Exits immediately on command failure
set -e

API_URL=${1:-"http://localhost:8080/api"}
echo "Starting Library OS API validation tests against: $API_URL"

# Helper for headers
CONTENT_JSON="Content-Type: application/json"

# ==========================================
# 1. REGISTER AND LOGIN AS MEMBER
# ==========================================
echo -e "\n[Test 1] Registering a new member user..."
REG_RESP=$(curl -s -X POST "$API_URL/auth/register" \
  -H "$CONTENT_JSON" \
  -d '{"username": "testmember", "password": "password123", "email": "testmember@example.com", "role": "MEMBER"}')

echo "Registration response: $REG_RESP"
USER_ID=$(echo "$REG_RESP" | grep -o '"id":[0-9]*' | head -n1 | cut -d: -f2)
echo "Member User ID: $USER_ID"

echo -e "\n[Test 2] Logging in as the new member..."
LOGIN_RESP=$(curl -s -X POST "$API_URL/auth/login" \
  -H "$CONTENT_JSON" \
  -d '{"username": "testmember", "password": "password123"}')

MEMBER_TOKEN=$(echo "$LOGIN_RESP" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -z "$MEMBER_TOKEN" ]; then
  echo "Error: Failed to obtain Member login token!"
  exit 1
fi
echo "Member login JWT obtained successfully."

# ==========================================
# 2. LOGIN AS ADMIN (Admin is seeded in init.sql)
# ==========================================
echo -e "\n[Test 3] Logging in as Admin..."
ADMIN_LOGIN_RESP=$(curl -s -X POST "$API_URL/auth/login" \
  -H "$CONTENT_JSON" \
  -d '{"username": "admin", "password": "password"}')

ADMIN_TOKEN=$(echo "$ADMIN_LOGIN_RESP" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -z "$ADMIN_TOKEN" ]; then
  echo "Error: Failed to obtain Admin login token!"
  exit 1
fi
echo "Admin login JWT obtained successfully."

# ==========================================
# 3. ADMIN: ADD A BOOK
# ==========================================
echo -e "\n[Test 4] Adding a new book (Admin)..."
BOOK_RESP=$(curl -s -X POST "$API_URL/books" \
  -H "$CONTENT_JSON" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "title": "Continuous Delivery",
    "author": "Jez Humble & David Farley",
    "isbn": "9780321601919",
    "publisher": "Addison-Wesley",
    "publishedYear": 2010,
    "genre": "DevOps",
    "totalCopies": 2
  }')

echo "Book creation response: $BOOK_RESP"
BOOK_ID=$(echo "$BOOK_RESP" | grep -o '"id":[0-9]*' | head -n1 | cut -d: -f2)
echo "New Book ID: $BOOK_ID"

# ==========================================
# 4. MEMBER: SEARCH AND VIEW BOOK
# ==========================================
echo -e "\n[Test 5] Searching for the book (Member)..."
SEARCH_RESP=$(curl -s -X GET "$API_URL/books?search=DevOps" \
  -H "Authorization: Bearer $MEMBER_TOKEN")

echo "Search response: $SEARCH_RESP"
if [[ "$SEARCH_RESP" != *"Continuous Delivery"* ]]; then
  echo "Error: Book not found in search query!"
  exit 1
fi
echo "Book found in search results."

# ==========================================
# 5. MEMBER: BORROW BOOK
# ==========================================
echo -e "\n[Test 6] Borrowing the book (Member)..."
BORROW_RESP=$(curl -s -X POST "$API_URL/loans/borrow" \
  -H "$CONTENT_JSON" \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -d "{\"bookId\": $BOOK_ID, \"userId\": $USER_ID}")

echo "Borrow response: $BORROW_RESP"
LOAN_ID=$(echo "$BORROW_RESP" | grep -o '"id":[0-9]*' | head -n1 | cut -d: -f2)
echo "New Loan ID: $LOAN_ID"

# Verify availability has reduced
echo -e "\n[Test 7] Checking book availability details..."
VERIFY_BOOK_RESP=$(curl -s -X GET "$API_URL/books/$BOOK_ID" \
  -H "Authorization: Bearer $MEMBER_TOKEN")
echo "Book details: $VERIFY_BOOK_RESP"

if [[ $(echo "$VERIFY_BOOK_RESP" | grep -o '"availableCopies":1') == "" ]]; then
  echo "Error: Book availability was not updated!"
  exit 1
fi
echo "Book availability updated correctly (1/2 copies left)."

# ==========================================
# 6. MEMBER: RETURN BOOK
# ==========================================
echo -e "\n[Test 8] Returning the book (Member)..."
RETURN_RESP=$(curl -s -X POST "$API_URL/loans/return/$LOAN_ID" \
  -H "Authorization: Bearer $MEMBER_TOKEN")
echo "Return response: $RETURN_RESP"

# Verify availability has incremented back
echo -e "\n[Test 9] Re-verifying book availability details..."
VERIFY_RETURN_RESP=$(curl -s -X GET "$API_URL/books/$BOOK_ID" \
  -H "Authorization: Bearer $MEMBER_TOKEN")
echo "Book details after return: $VERIFY_RETURN_RESP"

if [[ $(echo "$VERIFY_RETURN_RESP" | grep -o '"availableCopies":2') == "" ]]; then
  echo "Error: Book availability was not updated on return!"
  exit 1
fi
echo "Book availability restored correctly (2/2 copies left)."

echo -e "\n=========================================="
echo "API Integration Tests: ALL TESTS PASSED!"
echo "=========================================="
