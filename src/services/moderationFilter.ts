/**
 * Automated Content Moderation & Abuse Filter (Two-Strike Rule)
 * Detects Urdu abuses, Roman Urdu abuses, English profanity, explicit sexual content, and links/spam.
 */

export interface ModerationCheckResult {
  isOffensive: boolean;
  category: 'abuse' | 'spam' | 'explicit' | 'underage' | 'safe';
  reason: string | null;
  matchedTerms: string[];
}

// Roman Urdu Bad Words & Abuses
const ROMAN_URDU_ABUSES = [
  'kutta', 'kutti', 'kutte', 'kuto', 'kutto',
  'harami', 'haraami', 'haramkhor', 'haram khor',
  'kanjar', 'kanjri', 'kanjaro',
  'chutiya', 'chootiya', 'chutya', 'chootya',
  'bhenchod', 'bhen chod', 'behenchod', 'behen chod', 'bc',
  'madarchod', 'madar chod', 'madarjaat', 'mc',
  'gandu', 'gaandu', 'gand', 'bund',
  'dalaal', 'dalal', 'dalle',
  'kaminey', 'kamina', 'kameena', 'kameeni',
  'ullu ke pathe', 'ullu k pathy',
  'haramzada', 'haram zada', 'haramzadi', 'haram zadi',
  'bhosdike', 'bhosdi k', 'bhosdi', 'bsdk',
  'choot', 'loda', 'lauda', 'lawda', 'lodu', 'lund',
  'tatte', 'tatta',
  'randi', 'raandi', 'gashti', 'gashtee', 'chinal',
  'soor', 'suar', 'khinzir', 'khinzeer',
  'jahil', 'paki',
];

// Urdu Script Bad Words & Abuses
const URDU_SCRIPT_ABUSES = [
  'کتا', 'کتیا', 'کتے',
  'حرامی', 'حرام خور', 'حرامخور',
  'کنجر', 'کنجری',
  'چوتیا', 'چوتیے',
  'بھین چود', 'بہن چود',
  'مادر چود',
  'گاندو', 'گنڈو',
  'دلال', 'دلے',
  'کمینہ', 'کمینے', 'کمینی',
  'حرامزادہ', 'حرام زادہ', 'حرام زادی',
  'بھوسڑی', 'بھوسڑی کے',
  'چھوٹ', 'لوڑا', 'لن', 'ٹٹے',
  'رنڈی', 'گشتی',
  'سور', 'خنزیر', 'چنال',
];

// English Vulgarities, Slurs, and Harassment terms
const ENGLISH_EXPLICIT_AND_ABUSES = [
  'fuck', 'fucking', 'fucker', 'motherfucker',
  'bitch', 'bitches', 'bitching',
  'asshole', 'assholes', 'bastard', 'bastards',
  'slut', 'sluts', 'whore', 'whores', 'cunt', 'cunts',
  'dick', 'pussy', 'cock', 'blowjob', 'handjob',
  'nude', 'nudes', 'send nudes', 'porn', 'porno',
  'prostitute', 'escort service', 'pay for sex', 'hooker',
  'kill yourself', 'die ugly', 'threat', 'stalk you',
];

// Spam, Financial Scam & Solicitation terms
const SPAM_SCAM_KEYWORDS = [
  'free money', 'gift card', 'gift cards',
  'crypto investment', 'crypto trade', 'forex signals', 'forex trading',
  'send money', 'wire transfer', 'western union', 'cashapp', 'venmo me',
  'bit-invest', 'make $5k', 'earn daily',
  'whatsapp me', 'telegram me', 'dm me on insta', 'dm me on telegram',
  'onlyfans', 'webcam show', 'click this link', 'free gift',
];

// Patterns for external URLs and off-platform redirect links
const URL_PATTERN = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|net|org|xyz|club|online|top|io|me|info|live|cc|site|link)\b)/i;
const SOCIAL_REDIRECT_PATTERN = /(t\.me\/|wa\.me\/|telegram|whatsapp|bit\.ly\/|tinyurl\.com\/)/i;
// Phone number patterns commonly used to solicit off-platform (e.g. Pakistani 03xx or international format)
const PHONE_PATTERN = /(\+?92[-\s]?[0-9]{3}[-\s]?[0-9]{7}|03[0-9]{2}[-\s]?[0-9]{7}|\+?[0-9]{10,14})/i;

// Underage violations
const UNDERAGE_PATTERN = /\b(i am 15|i am 16|i am 17|turning 16|high school sophomore|im 14|im 15|im 16|im 17)\b/i;

/**
 * Checks a text string for abuses, bad words, explicit content, spam, and links.
 */
export function checkContentForAbuse(text: string): ModerationCheckResult {
  if (!text || typeof text !== 'string') {
    return { isOffensive: false, category: 'safe', reason: null, matchedTerms: [] };
  }

  const normalized = text.toLowerCase().trim();
  const matchedTerms: string[] = [];

  // 1. Underage Check (Absolute zero tolerance)
  if (UNDERAGE_PATTERN.test(normalized)) {
    return {
      isOffensive: true,
      category: 'underage',
      reason: 'HeartMatch is strictly 18+. Mentions of minor age are prohibited.',
      matchedTerms: ['underage indicator'],
    };
  }

  // 2. Links & Off-Platform Spam Filter
  if (URL_PATTERN.test(normalized) || SOCIAL_REDIRECT_PATTERN.test(normalized)) {
    return {
      isOffensive: true,
      category: 'spam',
      reason: 'Sharing external links, spam, or off-platform redirect URLs is strictly prohibited.',
      matchedTerms: ['link/spam url'],
    };
  }

  // 3. Off-platform phone solicitation
  if (PHONE_PATTERN.test(normalized) && (normalized.includes('call') || normalized.includes('whatsapp') || normalized.includes('text') || normalized.includes('number'))) {
    return {
      isOffensive: true,
      category: 'spam',
      reason: 'Sharing phone numbers for off-platform solicitation is not permitted.',
      matchedTerms: ['phone solicitation'],
    };
  }

  // 4. Commercial / Scam keywords
  for (const term of SPAM_SCAM_KEYWORDS) {
    if (normalized.includes(term)) {
      matchedTerms.push(term);
    }
  }
  if (matchedTerms.length > 0) {
    return {
      isOffensive: true,
      category: 'spam',
      reason: 'Promotional, commercial, or financial scam content is strictly prohibited.',
      matchedTerms,
    };
  }

  // 5. Roman Urdu Abuses
  for (const abuse of ROMAN_URDU_ABUSES) {
    // Word boundary check for short terms, substring for longer
    const regex = new RegExp(`\\b${abuse}\\b`, 'i');
    if (regex.test(normalized) || normalized.includes(abuse)) {
      matchedTerms.push(abuse);
    }
  }

  // 6. Urdu Script Abuses
  for (const abuse of URDU_SCRIPT_ABUSES) {
    if (normalized.includes(abuse)) {
      matchedTerms.push(abuse);
    }
  }

  // 7. English Abuses & Explicit Language
  for (const term of ENGLISH_EXPLICIT_AND_ABUSES) {
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    if (regex.test(normalized)) {
      matchedTerms.push(term);
    }
  }

  if (matchedTerms.length > 0) {
    return {
      isOffensive: true,
      category: 'abuse',
      reason: 'Inappropriate, abusive, or explicit language is strictly prohibited under our Trust & Safety charter.',
      matchedTerms,
    };
  }

  return {
    isOffensive: false,
    category: 'safe',
    reason: null,
    matchedTerms: [],
  };
}

export const STRIKE_1_WARNING_BANNER =
  'Warning: Abuse and inappropriate content are strictly prohibited. Further violations will result in an immediate account ban.';
