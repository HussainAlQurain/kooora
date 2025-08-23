#!/bin/bash

echo "🚀 Kooora Application Test Suite"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_pattern="$3"
    
    echo -n "Testing $test_name... "
    
    result=$(eval "$test_command" 2>/dev/null)
    
    if [[ $result =~ $expected_pattern ]]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "  Expected pattern: $expected_pattern"
        echo "  Got: ${result:0:100}..."
        ((TESTS_FAILED++))
    fi
}

echo -e "\n📊 Backend API Tests"
echo "-------------------"

# Backend health check
run_test "Backend Health" \
    "curl -s http://localhost:8080/api/actuator/health" \
    '"status":"UP"'

# Public endpoints
run_test "Countries API" \
    "curl -s http://localhost:8080/api/public/countries" \
    'England'

run_test "Leagues API" \
    "curl -s http://localhost:8080/api/public/leagues" \
    'Premier League'

run_test "Teams API" \
    "curl -s http://localhost:8080/api/public/teams" \
    'Manchester City'

# Authentication tests
UNIQUE_USER="testuser_$(date +%s)"
run_test "User Signup" \
    "curl -s -X POST http://localhost:8080/api/auth/signup -H 'Content-Type: application/json' -d '{\"username\":\"$UNIQUE_USER\",\"email\":\"$UNIQUE_USER@example.com\",\"password\":\"password123\",\"firstName\":\"Test\",\"lastName\":\"User\"}'" \
    '"success":true'

run_test "User Login" \
    "curl -s -X POST http://localhost:8080/api/auth/login -H 'Content-Type: application/json' -d '{\"username\":\"$UNIQUE_USER\",\"password\":\"password123\"}'" \
    '"accessToken":'

echo -e "\n🌐 Frontend Tests"
echo "----------------"

# Frontend tests
run_test "Frontend Homepage" \
    "curl -s http://localhost:3000" \
    'Kooora - Football Live Scores'

run_test "Frontend Navigation" \
    "curl -s http://localhost:3000" \
    'Leagues.*Teams.*Players'

echo -e "\n📱 Integration Tests"
echo "------------------"

# Test frontend can reach backend (through proxy)
run_test "Frontend-Backend Integration" \
    "curl -s http://localhost:3000/api/public/countries" \
    'England'

echo -e "\n📈 Performance Tests"
echo "------------------"

# Response time tests (simplified without bc)
backend_time=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:8080/api/public/countries)
if [[ $(echo "$backend_time < 2.0" | awk '{print ($1 < $3)}') == 1 ]]; then
    echo -e "Backend Response Time: ${GREEN}✓ ${backend_time}s (< 2s)${NC}"
    ((TESTS_PASSED++))
else
    echo -e "Backend Response Time: ${RED}✗ ${backend_time}s (>= 2s)${NC}"
    ((TESTS_FAILED++))
fi

frontend_time=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:3000)
if [[ $(echo "$frontend_time < 3.0" | awk '{print ($1 < $3)}') == 1 ]]; then
    echo -e "Frontend Response Time: ${GREEN}✓ ${frontend_time}s (< 3s)${NC}"
    ((TESTS_PASSED++))
else
    echo -e "Frontend Response Time: ${RED}✗ ${frontend_time}s (>= 3s)${NC}"
    ((TESTS_FAILED++))
fi

echo -e "\n🔒 Security Tests"
echo "---------------"

# CORS test - check for CORS headers
run_test "CORS Headers" \
    "curl -s -H 'Origin: http://localhost:3000' -I http://localhost:8080/api/public/countries" \
    'Vary.*Origin'

# JWT validation test
run_test "JWT Protection" \
    "curl -s http://localhost:8080/api/admin/test" \
    '"status":401.*"error":"Unauthorized"'

echo -e "\n📋 Test Summary"
echo "==============="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}All tests passed! Application is working correctly.${NC}"
    exit 0
else
    echo -e "\n⚠️  ${YELLOW}Some tests failed. Please check the issues above.${NC}"
    exit 1
fi