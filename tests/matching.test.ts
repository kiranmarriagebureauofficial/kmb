import { 
  checkHardFilters, 
  computeDirectionalScore, 
  calculateMatch, 
  DEFAULT_MATCHING_SETTINGS,
  parseHeightInInches
} from '../lib/matching-engine';
import { Profile } from '../lib/types';
import { SEED_PROFILES } from '../lib/db/seed-data';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

export function runMatchingEngineTests() {
  console.log('\n=============================================');
  console.log('RUNNING MATCHING ENGINE UNIT TEST SUITE');
  console.log('=============================================\n');

  // Test 1: Height parser
  console.log('Test 1: Height parsing');
  assert(parseHeightInInches("5'10\"") === 70, "5'10\" should parse to 70 inches");
  assert(parseHeightInInches("5'5\"") === 65, "5'5\" should parse to 65 inches");
  assert(parseHeightInInches("6'0\"") === 72, "6'0\" should parse to 72 inches");
  assert(parseHeightInInches("175 cm") === 69, "175 cm should parse to ~69 inches");

  // Test 2: Hard Filters - Gender rejection
  console.log('\nTest 2: Hard Filters - Opposite Gender Check');
  const maleA = { ...SEED_PROFILES[0] };
  const maleB = { ...SEED_PROFILES[2] };
  const femaleA = { ...SEED_PROFILES[1] };

  const genderCheckSame = checkHardFilters(maleA, maleB);
  assert(!genderCheckSame.passes, 'Same gender candidates must fail hard filters');
  assert(genderCheckSame.failures.includes('Same gender'), 'Failure reason must mention gender');

  const genderCheckOpposite = checkHardFilters(maleA, femaleA);
  assert(genderCheckOpposite.passes, 'Opposite gender candidates must pass hard filters');

  // Test 3: Hard Filters - Status
  console.log('\nTest 3: Hard Filters - Active Status Check');
  const pendingMale = { ...maleA, status: 'pending_approval' as const };
  const statusCheck = checkHardFilters(pendingMale, femaleA);
  assert(!statusCheck.passes, 'Non-active profiles (pending_approval) must fail hard filters');

  // Test 4: Hard Filters - Caste
  console.log('\nTest 4: Hard Filters - Caste Compatibility');
  const arainMale = { ...maleA, caste: 'Arain', preferences: { ...maleA.preferences, castes: ['Arain'] } };
  const rajputFemale = { ...femaleA, caste: 'Rajput', preferences: { ...femaleA.preferences, castes: ['Rajput'] } };
  const casteCheckMismatched = checkHardFilters(arainMale, rajputFemale);
  assert(!casteCheckMismatched.passes, 'Strict caste preference mismatch must fail hard filters');

  const openCasteMale = { ...maleA, caste: 'Arain', preferences: { ...maleA.preferences, castes: ['Any'] } };
  const openCasteFemale = { ...femaleA, caste: 'Rajput', preferences: { ...femaleA.preferences, castes: ['Any'] } };
  const casteCheckOpen = checkHardFilters(openCasteMale, openCasteFemale);
  assert(casteCheckOpen.passes, '"Any" caste preference must pass hard filters');

  // Test 5: Hard Filters - Sect / Maslak
  console.log('\nTest 5: Hard Filters - Maslak Compatibility');
  const sunniMale = { ...maleA, maslak: 'Sunni / Hanafi' as const, preferences: { ...maleA.preferences, maslak: 'Sunni / Hanafi' as const } };
  const shiaFemale = { ...femaleA, maslak: 'Shia' as const, preferences: { ...femaleA.preferences, maslak: 'Shia' as const } };
  const sectCheckMismatch = checkHardFilters(sunniMale, shiaFemale);
  assert(!sectCheckMismatch.passes, 'Sect mismatch must fail hard filters');

  // Test 6: Two-Way Scoring & Tiers
  console.log('\nTest 6: Two-Way Scoring & Tier Classification');
  // Bilal (Male Arain 28) and Dr. Ayesha (Female Arain 25)
  const matchResult = calculateMatch(SEED_PROFILES[0], SEED_PROFILES[1]);
  assert(matchResult !== null, 'Bilal and Dr. Ayesha should match');
  if (matchResult) {
    assert(matchResult.finalScore >= 75, `Final score should be >= 75% for ideal pair (got ${matchResult.finalScore}%)`);
    assert(matchResult.tier === 'premium', '75%+ match should be categorized in "premium" tier');
    assert(matchResult.mutual === true, 'Balanced two-way scoring should flag mutual = true');
    assert(matchResult.breakdown.length === 8, 'Breakdown must contain all 8 compatibility criteria');
  }

  // Test 7: Threshold cutoff (< 50% not shown)
  console.log('\nTest 7: Minimum Threshold Cutoff');
  // Create an edge case profile with mismatched age, location, and income to score < 50
  const distantCandidate: Profile = {
    ...femaleA,
    id: 'distant-001',
    age: 48, // way outside preferred 22-26
    height: "4'10\"", // outside 5'3"-5'8"
    city: 'Peshawar', // outside Lahore
    monthlyIncome: 10000,
    educationLevel: 'Matric',
    preferences: {
      ...femaleA.preferences,
      ageMin: 45,
      ageMax: 55,
      cities: ['Peshawar'],
    }
  };

  const distantMatch = calculateMatch(maleA, distantCandidate);
  assert(distantMatch === null, 'Pairs scoring below 50% must return null (never displayed)');

  // Test 8: Custom Manually-Entered Caste, Education and Maslak Compatibility
  console.log('\nTest 8: Custom / Manual Entry Compatibility');
  const customCandidateMale: Profile = {
    ...maleA,
    id: 'custom-male-001',
    caste: 'Bajwa',
    educationLevel: 'Dars-e-Nizami (Alim Course)',
    city: 'Kasur',
    maslak: 'Sunni / Hanafi',
    preferences: {
      ...maleA.preferences,
      castes: ['Bajwa', 'Any'],
      cities: ['Kasur', 'Lahore'],
    }
  };

  const customCandidateFemale: Profile = {
    ...femaleA,
    id: 'custom-female-001',
    caste: 'Bajwa',
    educationLevel: 'Bachelors',
    city: 'Kasur',
    maslak: 'Sunni / Hanafi',
    preferences: {
      ...femaleA.preferences,
      castes: ['Bajwa'],
      cities: ['Kasur'],
    }
  };

  const customMatch = calculateMatch(customCandidateMale, customCandidateFemale);
  assert(customMatch !== null, 'Custom manually entered caste "Bajwa" must match when acceptable to both sides');
  if (customMatch) {
    assert(customMatch.finalScore >= 50, `Custom pair should score above 50% threshold (got ${customMatch.finalScore}%)`);
  }

  console.log('\n=============================================');
  console.log('ALL MATCHING ENGINE TESTS PASSED SUCCESSFULLY!');
  console.log('=============================================\n');
}

// Auto-run if executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runMatchingEngineTests();
}

