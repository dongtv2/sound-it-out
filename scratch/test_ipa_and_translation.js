async function fetchIpa(word) {
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

async function test() {
  console.log('Testing IPA lookup for "sunshine"...');
  const ipa = await fetchIpa('sunshine');
  console.log('Result IPA for sunshine:', ipa);

  console.log('Testing IPA lookup for "family"...');
  const ipa2 = await fetchIpa('family');
  console.log('Result IPA for family:', ipa2);

  console.log('Testing IPA lookup for "star"...');
  const ipa3 = await fetchIpa('star');
  console.log('Result IPA for star:', ipa3);
}

test();
