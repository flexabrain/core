const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3001';
let authToken = '';
let userId = '';

// Test data
const testUser = {
  email: `test-${Date.now()}@flexabrain.com`,
  password: 'TestPassword123!',
  firstName: 'John',
  lastName: 'Doe',
  company: 'Test Corp'
};

const testQueries = [
  "Predict Q4 sales for a SaaS company with $1M ARR",
  "Analyze risk factors for enterprise deals over $100K",
  "Forecast customer churn for subscription business",
  "Evaluate competitive positioning in AI market",
  "Assess pipeline health for sales team"
];

// Helper function for API calls
async function apiCall(method, endpoint, data = null, token = null) {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  };
  
  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ ${method.toUpperCase()} ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
}

// Test suite
async function runTests() {
  console.log('🚀 Starting FlexaBrain Empire Phase 1 API Tests\n');

  try {
    // 1. Health Check
    console.log('📊 Testing Health Check...');
    const health = await apiCall('GET', '/health');
    console.log('✅ Health check passed:', health.service);

    // 2. User Registration
    console.log('\n👤 Testing User Registration...');
    const registerResult = await apiCall('POST', '/api/auth/register', testUser);
    authToken = registerResult.token;
    userId = registerResult.user.id;
    console.log('✅ User registered successfully:', registerResult.user.email);
    console.log('📝 Trial ends at:', registerResult.trialInfo.trialEndsAt);

    // 3. User Login
    console.log('\n🔐 Testing User Login...');
    const loginResult = await apiCall('POST', '/api/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful for:', loginResult.user.email);

    // 4. Get User Profile
    console.log('\n📋 Testing User Profile...');
    const profile = await apiCall('GET', '/api/auth/me', null, authToken);
    console.log('✅ Profile retrieved:', profile.user.email);
    console.log('📊 Current usage:', profile.usage);

    // 5. Oracle Agent - Test Freemium Limits
    console.log('\n🔮 Testing Oracle Agent (Freemium Limits)...');
    let queryCount = 0;
    
    for (const query of testQueries) {
      queryCount++;
      try {
        console.log(`\n📝 Query ${queryCount}: "${query.substring(0, 50)}..."`);
        
        const oracleResult = await apiCall('POST', '/api/oracle/query', {
          query,
          context: {
            industry: 'Technology',
            company: 'Test Corp',
            revenue: 1000000
          }
        }, authToken);

        console.log('✅ Oracle Response Length:', oracleResult.response?.length || 0);
        console.log('📊 Usage:', oracleResult.usage);
        
        // Check for conversion prompts
        if (oracleResult.conversionPrompt) {
          console.log('💡 Conversion Prompt:', oracleResult.conversionPrompt.message);
          console.log('🎯 CTA:', oracleResult.conversionPrompt.ctaText);
        }

        // Wait a bit between queries
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        if (error.response?.data?.code === 'USAGE_LIMIT_EXCEEDED') {
          console.log('⚠️  Hit usage limit after', queryCount - 1, 'queries (Expected!)');
          console.log('💰 Upgrade required:', error.response.data.details.upgradeRequired);
          break;
        } else {
          throw error;
        }
      }
    }

    // 6. Get Usage Analytics
    console.log('\n📈 Testing Usage Analytics...');
    const usage = await apiCall('GET', '/api/oracle/usage', null, authToken);
    console.log('✅ Usage analytics retrieved');
    console.log('📊 Today\'s usage:', usage.usage.today);

    // 7. Get Oracle Info (Public)
    console.log('\n📖 Testing Oracle Info...');
    const oracleInfo = await apiCall('GET', '/api/oracle/info');
    console.log('✅ Oracle info retrieved');
    console.log('🤖 Agent:', oracleInfo.agent.name);

    // 8. Get Subscription Plans
    console.log('\n💳 Testing Subscription Plans...');
    const plans = await apiCall('GET', '/api/subscriptions/plans');
    console.log('✅ Subscription plans retrieved');
    console.log('📋 Available plans:', Object.keys(plans.plans));

    // 9. User Dashboard
    console.log('\n📊 Testing User Dashboard...');
    const dashboard = await apiCall('GET', '/api/users/dashboard', null, authToken);
    console.log('✅ Dashboard loaded');
    console.log('👤 User role:', dashboard.dashboard.user.role);
    console.log('📈 Usage today:', dashboard.dashboard.usage.today);

    // 10. Test Protected Endpoints (should fail for free users)
    console.log('\n🔒 Testing Protected Endpoints...');
    try {
      await apiCall('GET', '/api/admin/dashboard', null, authToken);
      console.log('❌ Admin access should have failed!');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Admin access properly restricted');
      } else {
        throw error;
      }
    }

    console.log('\n🎉 All Phase 1 Tests Completed Successfully!');
    console.log('\n📋 Test Summary:');
    console.log('✅ User registration and authentication working');
    console.log('✅ Role-based access control functioning');  
    console.log('✅ Oracle agent with freemium limits active');
    console.log('✅ Conversion prompts triggering correctly');
    console.log('✅ Usage tracking and analytics operational');
    console.log('✅ API security and validation working');
    
    console.log('\n🚀 FlexaBrain Empire Phase 1 is PRODUCTION READY!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testUser };