// Simple test to verify dataset loading
const fs = require('fs');
const path = require('path');

const datasetPath = path.join(__dirname, 'app/public/evaluation/datasets/merged_medical_qa.jsonl');

if (fs.existsSync(datasetPath)) {
    console.log('✅ Dataset file exists');
    
    const content = fs.readFileSync(datasetPath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    console.log(`✅ Dataset has ${lines.length} records`);
    
    // Test parsing first few records
    const records = lines.slice(0, 3).map(line => JSON.parse(line));
    console.log('✅ Sample records:');
    records.forEach((record, index) => {
        console.log(`${index + 1}. Q: ${record.question.substring(0, 50)}...`);
        console.log(`   A: ${record.answer.substring(0, 50)}...`);
        console.log(`   Source: ${record.source}`);
        console.log('');
    });
    
    console.log('🎉 Integration test passed! The AI Evaluation Dashboard should now work.');
    console.log('📱 Navigate to http://localhost:5173/evaluation to test it.');
    
} else {
    console.log('❌ Dataset file not found at:', datasetPath);
    console.log('Run the following commands to fix:');
    console.log('  cd evaluation/scripts');
    console.log('  python3 fetch_webmd_dataset.py --output ../datasets/webmd_symptom_qa.jsonl --sample_size 1000');
    console.log('  cp ../datasets/webmd_symptom_qa.jsonl ../app/public/evaluation/datasets/merged_medical_qa.jsonl');
} 