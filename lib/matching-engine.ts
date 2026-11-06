import { 
  Profile, 
  MatchResult, 
  MatchBreakdownItem, 
  MatchingSettings, 
  EducationLevel 
} from './types';

export const DEFAULT_MATCHING_SETTINGS: MatchingSettings = {
  hardFilters: {
    oppositeGender: true,
    sameReligion: true,
    sameMaslak: true,
    sameCaste: true,
    minimumEducation: true,
    onlyActiveStatus: true,
  },
  weights: {
    ageRange: 25,
    city: 15,
    height: 10,
    maritalStatus: 15,
    professionIncome: 15,
    familySimilarity: 5,
    educationBonus: 10,
    softPreferences: 5,
  },
  tierThresholds: {
    minScoreToShow: 50,
    premiumScoreMin: 75,
  },
};

const EDUCATION_RANKS: Record<EducationLevel, number> = {
  'Matric': 1,
  'Intermediate': 2,
  'Bachelors': 3,
  'Masters': 4,
  'Professional/Other': 4,
  'MPhil/PhD': 5,
};

export function parseHeightInInches(heightStr: string): number {
  if (!heightStr) return 66; // default 5'6"
  const clean = heightStr.trim().toLowerCase();
  
  // Format like 5'10" or 5'10 or 5ft 10in
  const feetInchesMatch = clean.match(/(\d+)\s*(?:'|ft|feet)\s*(\d*)\s*(?:"|in|inches)?/);
  if (feetInchesMatch) {
    const feet = parseInt(feetInchesMatch[1], 10);
    const inches = feetInchesMatch[2] ? parseInt(feetInchesMatch[2], 10) : 0;
    return feet * 12 + inches;
  }

  // Format in cm like "175 cm" or "175"
  const cmMatch = clean.match(/(\d+)\s*cm/);
  if (cmMatch) {
    const cm = parseInt(cmMatch[1], 10);
    return Math.round(cm / 2.54);
  }

  // Pure single digit like 5.8
  const decimalMatch = clean.match(/^(\d)\.(\d+)$/);
  if (decimalMatch) {
    const feet = parseInt(decimalMatch[1], 10);
    const inches = parseInt(decimalMatch[2], 10);
    return feet * 12 + inches;
  }

  return 66;
}

export function checkHardFilters(
  a: Profile, 
  b: Profile, 
  filters = DEFAULT_MATCHING_SETTINGS.hardFilters
): { passes: boolean; failures: string[] } {
  const failures: string[] = [];

  // 1. Status: only available/active stock participates in matching
  if (filters.onlyActiveStatus) {
    const isAActive = a.status === 'available' || (a.status as any) === 'active';
    const isBActive = b.status === 'available' || (b.status as any) === 'active';
    if (!isAActive || !isBActive) {
      failures.push('One or both profiles are not available in stock');
    }
  }

  // 2. Gender: must be opposite
  if (filters.oppositeGender) {
    if (a.gender === b.gender) {
      failures.push('Same gender');
    }
  }

  // 3. Religion: must be the same
  if (filters.sameReligion) {
    if (a.religion !== b.religion) {
      failures.push('Different religion');
    }
  }

  // 4. Maslak: must be the same unless either is "Any / No Preference"
  if (filters.sameMaslak) {
    const aPref = a.preferences.maslak;
    const bPref = b.preferences.maslak;
    const isAnyA = !aPref || aPref === 'Any / No Preference' || a.maslak === 'Any / No Preference';
    const isAnyB = !bPref || bPref === 'Any / No Preference' || b.maslak === 'Any / No Preference';

    if (!isAnyA && !isAnyB) {
      if (a.maslak !== b.preferences.maslak || b.maslak !== a.preferences.maslak) {
        failures.push('Maslak / Sect mismatch');
      }
    }
  }

  // 5. Caste: must be acceptable to both sides
  if (filters.sameCaste) {
    const aCastes = a.preferences.castes || [];
    const bCastes = b.preferences.castes || [];
    const aAllowsAny = aCastes.length === 0 || aCastes.includes('Any') || aCastes.includes(b.caste);
    const bAllowsAny = bCastes.length === 0 || bCastes.includes('Any') || bCastes.includes(a.caste);

    if (!aAllowsAny || !bAllowsAny) {
      failures.push('Caste mismatch');
    }
  }

  // 6. Minimum Education
  if (filters.minimumEducation) {
    const bRank = EDUCATION_RANKS[b.educationLevel] || 1;
    const aReqRank = EDUCATION_RANKS[a.preferences.educationMin] || 1;
    const aRank = EDUCATION_RANKS[a.educationLevel] || 1;
    const bReqRank = EDUCATION_RANKS[b.preferences.educationMin] || 1;

    if (bRank < aReqRank || aRank < bReqRank) {
      failures.push('Minimum education requirement not met');
    }
  }

  return {
    passes: failures.length === 0,
    failures
  };
}

export function computeDirectionalScore(
  seeker: Profile,
  candidate: Profile,
  weights = DEFAULT_MATCHING_SETTINGS.weights
): { score: number; breakdown: MatchBreakdownItem[] } {
  const breakdown: MatchBreakdownItem[] = [];
  let totalScore = 0;
  const pref = seeker.preferences;

  // 1. Age (weight: 25)
  const ageMaxWeight = weights.ageRange;
  const cAge = candidate.age;
  let ageScore = 0;
  let ageMatched = false;
  let ageDetails = '';

  if (cAge >= pref.ageMin && cAge <= pref.ageMax) {
    ageScore = ageMaxWeight;
    ageMatched = true;
    ageDetails = `${cAge} years (Within preferred range ${pref.ageMin}-${pref.ageMax})`;
  } else {
    const diff = Math.min(Math.abs(cAge - pref.ageMin), Math.abs(cAge - pref.ageMax));
    if (diff <= 2) {
      ageScore = Math.round(ageMaxWeight * 0.6); // slight deduction for 1-2 years
      ageMatched = true;
      ageDetails = `${cAge} years (Close to range ${pref.ageMin}-${pref.ageMax})`;
    } else {
      ageScore = 0;
      ageMatched = false;
      ageDetails = `${cAge} years (Outside preferred range ${pref.ageMin}-${pref.ageMax})`;
    }
  }
  totalScore += ageScore;
  breakdown.push({
    key: 'age',
    labelEn: 'Age Compatibility',
    labelUr: 'عمر کی ہم آہنگی',
    matched: ageMatched,
    details: ageDetails,
    scoreContribution: ageScore,
    maxScore: ageMaxWeight,
  });

  // 2. City (weight: 15)
  const cityMaxWeight = weights.city;
  let cityScore = 0;
  let cityMatched = false;
  let cityDetails = '';

  const prefCities = pref.cities && pref.cities.length > 0 ? pref.cities : [seeker.city];
  const candidateCity = candidate.city.trim().toLowerCase();

  const isExactCity = prefCities.some(c => c.trim().toLowerCase() === candidateCity);
  if (isExactCity) {
    cityScore = cityMaxWeight;
    cityMatched = true;
    cityDetails = `${candidate.city} (Exact preferred city)`;
  } else if (prefCities.some(c => c.toLowerCase() === 'any' || c.toLowerCase() === 'all')) {
    cityScore = cityMaxWeight;
    cityMatched = true;
    cityDetails = `${candidate.city} (Any city acceptable)`;
  } else {
    // If candidate is in same province/neighbor
    cityScore = Math.round(cityMaxWeight * 0.3);
    cityMatched = false;
    cityDetails = `${candidate.city} (Preferred: ${prefCities.join(', ')})`;
  }
  totalScore += cityScore;
  breakdown.push({
    key: 'city',
    labelEn: 'City & Location',
    labelUr: 'شہر و رہائش',
    matched: cityMatched,
    details: cityDetails,
    scoreContribution: cityScore,
    maxScore: cityMaxWeight,
  });

  // 3. Height (weight: 10)
  const heightMaxWeight = weights.height;
  let heightScore = 0;
  let heightMatched = false;
  let heightDetails = '';

  const minHInches = parseHeightInInches(pref.heightMin || "5'0\"");
  const maxHInches = parseHeightInInches(pref.heightMax || "6'4\"");
  const candidateHInches = parseHeightInInches(candidate.height);

  if (candidateHInches >= minHInches && candidateHInches <= maxHInches) {
    heightScore = heightMaxWeight;
    heightMatched = true;
    heightDetails = `${candidate.height} (Matches preferred height)`;
  } else {
    const hDiff = Math.min(Math.abs(candidateHInches - minHInches), Math.abs(candidateHInches - maxHInches));
    if (hDiff <= 1) {
      heightScore = Math.round(heightMaxWeight * 0.7);
      heightMatched = true;
      heightDetails = `${candidate.height} (Close to height range)`;
    } else {
      heightScore = 0;
      heightMatched = false;
      heightDetails = `${candidate.height} (Outside preferred height range)`;
    }
  }
  totalScore += heightScore;
  breakdown.push({
    key: 'height',
    labelEn: 'Height Preference',
    labelUr: 'قد کی مناسبت',
    matched: heightMatched,
    details: heightDetails,
    scoreContribution: heightScore,
    maxScore: heightMaxWeight,
  });

  // 4. Marital Status (weight: 15)
  const msMaxWeight = weights.maritalStatus;
  let msScore = 0;
  let msMatched = false;
  let msDetails = '';

  const prefStatuses = pref.maritalStatuses && pref.maritalStatuses.length > 0 
    ? pref.maritalStatuses 
    : ['Never Married'];

  if (prefStatuses.includes(candidate.maritalStatus)) {
    msScore = msMaxWeight;
    msMatched = true;
    msDetails = `${candidate.maritalStatus} (Matches marital status preference)`;
  } else {
    msScore = 0;
    msMatched = false;
    msDetails = `${candidate.maritalStatus} (Acceptable: ${prefStatuses.join(', ')})`;
  }
  totalScore += msScore;
  breakdown.push({
    key: 'maritalStatus',
    labelEn: 'Marital Status',
    labelUr: 'ازدواجی حیثیت',
    matched: msMatched,
    details: msDetails,
    scoreContribution: msScore,
    maxScore: msMaxWeight,
  });

  // 5. Profession & Income (weight: 15)
  const piMaxWeight = weights.professionIncome;
  let piScore = 0;
  let piMatched = false;
  let piDetails = '';

  const prefIncome = pref.minIncome || 0;
  const candidateIncome = candidate.monthlyIncome || 0;

  if (candidateIncome >= prefIncome) {
    piScore = piMaxWeight;
    piMatched = true;
    piDetails = `${candidate.profession} (PKR ${candidateIncome.toLocaleString()} >= expected)`;
  } else {
    const incomeRatio = prefIncome > 0 ? candidateIncome / prefIncome : 1;
    piScore = Math.round(piMaxWeight * Math.max(0.3, Math.min(0.9, incomeRatio)));
    piMatched = incomeRatio >= 0.75;
    piDetails = `${candidate.profession} (PKR ${candidateIncome.toLocaleString()})`;
  }
  totalScore += piScore;
  breakdown.push({
    key: 'professionIncome',
    labelEn: 'Profession & Income',
    labelUr: 'پیشہ و ماہانہ آمدنی',
    matched: piMatched,
    details: piDetails,
    scoreContribution: piScore,
    maxScore: piMaxWeight,
  });

  // 6. Family Similarity (weight: 5)
  const famMaxWeight = weights.familySimilarity;
  let famScore = 0;
  let famMatched = false;

  const siblingDiff = Math.abs((seeker.totalSiblings || 0) - (candidate.totalSiblings || 0));
  if (siblingDiff <= 2) {
    famScore = famMaxWeight;
    famMatched = true;
  } else {
    famScore = Math.round(famMaxWeight * 0.5);
    famMatched = false;
  }
  totalScore += famScore;
  breakdown.push({
    key: 'family',
    labelEn: 'Family Background',
    labelUr: 'خاندانی پس منظر',
    matched: famMatched,
    details: `${candidate.caste} family (${candidate.totalSiblings} siblings)`,
    scoreContribution: famScore,
    maxScore: famMaxWeight,
  });

  // 7. Education Bonus (weight: 10)
  const eduMaxWeight = weights.educationBonus;
  let eduScore = 0;
  let eduMatched = false;

  const seekerEduRank = EDUCATION_RANKS[seeker.educationLevel] || 1;
  const candEduRank = EDUCATION_RANKS[candidate.educationLevel] || 1;

  if (candEduRank >= seekerEduRank) {
    eduScore = eduMaxWeight;
    eduMatched = true;
  } else {
    eduScore = Math.round(eduMaxWeight * 0.5);
    eduMatched = false;
  }
  totalScore += eduScore;
  breakdown.push({
    key: 'educationBonus',
    labelEn: 'Education Qualification',
    labelUr: 'تعلیمی قابلیت و ڈگری',
    matched: eduMatched,
    details: `${candidate.degree || candidate.educationLevel}`,
    scoreContribution: eduScore,
    maxScore: eduMaxWeight,
  });

  // 8. Soft Preferences (weight: 5)
  const softMaxWeight = weights.softPreferences;
  let softScore = softMaxWeight; // default positive
  let softMatched = true;

  if (pref.otherNotes && pref.otherNotes.trim().length > 0) {
    softScore = Math.round(softMaxWeight * 0.8);
    softMatched = true;
  }
  totalScore += softScore;
  breakdown.push({
    key: 'soft',
    labelEn: 'Cultural & Lifestyle Fit',
    labelUr: 'ثقافتی و گھریلو اقدار',
    matched: softMatched,
    details: 'Aligned with family values and background',
    scoreContribution: softScore,
    maxScore: softMaxWeight,
  });

  return {
    score: Math.min(100, Math.max(0, Math.round(totalScore))),
    breakdown,
  };
}

export function calculateMatch(
  profileA: Profile,
  profileB: Profile,
  settings: MatchingSettings = DEFAULT_MATCHING_SETTINGS
): MatchResult | null {
  // Check hard filters
  const hardCheck = checkHardFilters(profileA, profileB, settings.hardFilters);
  if (!hardCheck.passes) {
    return null;
  }

  // Calculate score A -> B (Does B satisfy A's preferences?)
  const resAB = computeDirectionalScore(profileA, profileB, settings.weights);

  // Calculate score B -> A (Does A satisfy B's preferences?)
  const resBA = computeDirectionalScore(profileB, profileA, settings.weights);

  // Final score is average of both directional scores
  const finalScore = Math.round((resAB.score + resBA.score) / 2);

  // Filter out matches below threshold (default 50%)
  if (finalScore < settings.tierThresholds.minScoreToShow) {
    return null;
  }

  // Determine tier
  const tier = finalScore >= settings.tierThresholds.premiumScoreMin ? 'premium' : 'matches';

  // Merge breakdown for display
  const combinedBreakdown: MatchBreakdownItem[] = resAB.breakdown.map((itemA, i) => {
    const itemB = resBA.breakdown[i];
    const bothMatched = itemA.matched && (itemB ? itemB.matched : true);
    return {
      key: itemA.key,
      labelEn: itemA.labelEn,
      labelUr: itemA.labelUr,
      matched: bothMatched,
      details: `${itemA.details || ''} • (Mutual: ${bothMatched ? 'Yes' : 'Partial'})`,
      scoreContribution: Math.round((itemA.scoreContribution + (itemB?.scoreContribution || 0)) / 2),
      maxScore: itemA.maxScore,
    };
  });

  return {
    id: `match_${profileA.id}_${profileB.id}`,
    profileAId: profileA.id,
    profileBId: profileB.id,
    partnerProfile: profileB,
    scoreAB: resAB.score,
    scoreBA: resBA.score,
    finalScore,
    tier,
    mutual: Math.abs(resAB.score - resBA.score) <= 15,
    breakdown: combinedBreakdown,
    computedAt: new Date().toISOString(),
  };
}

export function calculateMatchesForProfile(
  targetProfile: Profile,
  allProfiles: Profile[],
  settings: MatchingSettings = DEFAULT_MATCHING_SETTINGS
): MatchResult[] {
  const matches: MatchResult[] = [];

  for (const candidate of allProfiles) {
    if (candidate.id === targetProfile.id) continue;
    const match = calculateMatch(targetProfile, candidate, settings);
    if (match) {
      matches.push(match);
    }
  }

  // Sort descending by finalScore, then prioritize premium members
  return matches.sort((a, b) => {
    if (b.partnerProfile.premiumMember !== a.partnerProfile.premiumMember) {
      return b.partnerProfile.premiumMember ? 1 : -1;
    }
    return b.finalScore - a.finalScore;
  });
}

