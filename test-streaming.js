#!/usr/bin/env node

// Test Script for O1 Streaming Reasoning
// This script tests the analyzeWithStreamingReasoning Firebase Function

const fetch = require('node-fetch');

async function testStreaming() {
  console.log('🧪 [STREAMING TEST] Starting streaming test...\n');
  
  try {
    console.log('🔗 [STREAMING TEST] Connecting to Firebase Functions emulator...');
    
    const response = await fetch('http://127.0.0.1:5001/medicalchartingapp/us-central1/analyzeWithStreamingReasoning', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        // Mock auth token for testing
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        transcript: 'Patient reports chest pain and shortness of breath for the past 2 hours.',
        patientContext: {
          age: 45,
          gender: 'male'
        },
        modelType: 'o1-mini'
      })
    });

    console.log('📡 [STREAMING TEST] Response status:', response.status);
    console.log('📡 [STREAMING TEST] Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [STREAMING TEST] HTTP Error:', response.status, errorText);
      return;
    }

    console.log('📖 [STREAMING TEST] Setting up SSE reader...');
    
    // Process Server-Sent Events
    let eventCount = 0;
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('📖 [STREAMING TEST] Stream completed. Total events:', eventCount);
        break;
      }
      
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('event: ')) {
          const eventType = line.substring(7).trim();
          console.log(`📨 [STREAMING TEST] Event #${++eventCount}:`, eventType);
        } else if (line.startsWith('data: ')) {
          const data = line.substring(6);
          if (data.trim()) {
            try {
              const parsed = JSON.parse(data);
              console.log('📊 [STREAMING TEST] Data:', JSON.stringify(parsed, null, 2).substring(0, 200) + '...');
            } catch (e) {
              console.log('📊 [STREAMING TEST] Raw data:', data.substring(0, 100) + '...');
            }
          }
        }
      }
    }
    
    console.log('\n✅ [STREAMING TEST] Test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ [STREAMING TEST] Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testStreaming().then(() => {
  console.log('\n🎯 [STREAMING TEST] Test finished.');
}).catch(error => {
  console.error('\n💥 [STREAMING TEST] Unhandled error:', error);
}); 