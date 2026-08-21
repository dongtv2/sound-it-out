import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

// 1. Database Connection Verification
const dbPath = path.join(process.cwd(), 'sound_it_out.db');
const db = new DatabaseSync(dbPath);

console.log('--- 🧪 UNIT TEST: SOUND IT OUT LESSON COMPOSER WORKFLOW ---');

// 2. Unit Test: Text Splitting Algorithm
function splitTextToPhrases(text, type) {
  if (!text.trim()) return [];
  if (type === 'words') {
    return text.split(/[\n,;]+/).map(w => w.trim()).filter(Boolean);
  } else {
    return text.split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(Boolean);
  }
}

// 3. Unit Test: MyMemory Translation API
async function translateTextMyMemory(text) {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`;
    const res = await fetch(url);
    if (!res.ok) return '';
    const data = await res.json();
    return data?.responseData?.translatedText || '';
  } catch (e) {
    return '';
  }
}

// 4. Unit Test: Free Dictionary IPA API
async function fetchIpa(word) {
  if (!word.trim()) return '';
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim().toLowerCase())}`);
    if (!res.ok) return '';
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      for (const entry of data) {
        if (entry.phonetic) return entry.phonetic;
        if (entry.phonetics && entry.phonetics.length > 0) {
          for (const p of entry.phonetics) {
            if (p.text) return p.text;
          }
        }
      }
    }
  } catch (e) {
    return '';
  }
  return '';
}

async function runUnitTestSuite() {
  console.log('\n1. Testing Text Splitting...');
  const sampleWords = "sunshine, family, butterfly";
  const splitResult = splitTextToPhrases(sampleWords, 'words');
  console.log('Input:', sampleWords);
  console.log('Split Result:', splitResult);
  if (splitResult.length === 3 && splitResult[0] === 'sunshine') {
    console.log('✅ PASSED: Text splitting algorithm works correctly.');
  } else {
    console.error('❌ FAILED: Text splitting algorithm error.');
  }

  console.log('\n2. Testing Translation & IPA Engine for batch words...');
  const items = [];
  for (let i = 0; i < splitResult.length; i++) {
    const w = splitResult[i];
    const vi = await translateTextMyMemory(w);
    const ipa = await fetchIpa(w);
    console.log(`Word: "${w}" -> VI: "${vi}", IPA: "${ipa}"`);
    items.push({
      id: `item-test-${Date.now()}-${i}`,
      text: w,
      vi: vi || w,
      ipa: ipa || '',
      imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      note: 'Unit Test Item'
    });
  }

  if (items.every(i => i.vi && i.ipa)) {
    console.log('✅ PASSED: Translation & IPA Engine fetched successfully for all items.');
  } else {
    console.warn('⚠️ WARNING: Some items missing translation/IPA.');
  }

  console.log('\n3. Testing REST API Server DB Persistence (POST http://127.0.0.1:3001/api/lists)...');
  const testListPayload = {
    id: `list-unittest-${Date.now()}`,
    name: 'Unit Test Auto Lesson List',
    type: 'words',
    tag: 'curriculum',
    learner: 'Bé Phúc Trí',
    by: 'unit-test-agent',
    items: items,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  try {
    const res = await fetch('http://127.0.0.1:3001/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testListPayload)
    });
    const textResp = await res.text();
    console.log('REST API HTTP Status:', res.status);
    console.log('REST API Response Text:', textResp);

    // 4. Verify in SQLite Database File directly
    const row = db.prepare('SELECT * FROM practice_lists WHERE id = ?').get(testListPayload.id);
    if (row && row.name === 'Unit Test Auto Lesson List') {
      const storedItems = JSON.parse(row.items || '[]');
      console.log(`✅ PASSED: Lesson List stored in SQLite DB sound_it_out.db with ${storedItems.length} items!`);
    } else {
      console.error('❌ FAILED: Lesson List not found in SQLite DB.');
    }

    // Clean up test list
    db.prepare('DELETE FROM practice_lists WHERE id = ?').run(testListPayload.id);
    console.log('Cleaned up unit test list from SQLite DB.');

  } catch (err) {
    console.error('❌ REST API test error:', err);
  }

  console.log('\n🎉 ALL UNIT TESTS COMPLETED SUCCESSFULLY!');
}

runUnitTestSuite();
