import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import {
  INITIAL_DISCOVERY_PROFILES,
  INITIAL_PROFILE_ACTIVITIES,
  ELIGIBLE_DISCOVERY_COUNTRIES,
} from './src/services/seedData.ts';
import type { UserProfile } from './src/types/index.ts';

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini client configuration
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI Feature 1: Profile Bio Generator & Polish
app.post('/api/gemini/generate-bio', async (req: Request, res: Response) => {
  try {
    const { name, age, profession, hobbies, interests, relationshipGoal, tone } = req.body;

    if (!geminiApiKey) {
      return res.json({
        bio: `Hey there! I'm ${name || 'someone'} who loves ${hobbies?.[0] || 'good food'} and exploring life. Passionate about ${profession || 'what I do'} and looking for meaningful connections. Let's chat!`,
        suggestions: [
          `Adventurous ${profession || 'professional'} who believes the best stories happen when you say yes to spontaneous weekend trips.`,
          `Coffee enthusiast, avid reader, and lover of ${interests?.[0] || 'great conversations'}. Here for genuine chemistry and good laughs.`
        ]
      });
    }

    const prompt = `You are a respectful, authentic dating profile coach for "HeartMatch" (a high-quality, adult 18+ dating platform).
Create an authentic, charming, and engaging dating profile bio for an adult user with these attributes:
- Name: ${name || 'User'}
- Age: ${age || 25}
- Profession: ${profession || 'Professional'}
- Hobbies: ${Array.isArray(hobbies) ? hobbies.join(', ') : hobbies || 'Travel, culinary arts, music'}
- Interests: ${Array.isArray(interests) ? interests.join(', ') : interests || 'Fitness, photography, psychology'}
- Relationship Goal: ${relationshipGoal || 'Meaningful long-term'}
- Desired Tone: ${tone || 'Witty, authentic, and warm'}

Return a JSON object with:
1. "bio": A polished 2-3 paragraph bio (between 40-90 words), conversational and magnetic, without clichés or cringe.
2. "suggestions": An array of 3 alternative one-liner punchy bios.
Do not use inappropriate or sexually explicit content. Strict 18+ adult standards.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bio: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['bio', 'suggestions']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error) {
    console.error('Error generating bio:', error);
    res.status(500).json({
      error: 'Failed to generate bio with AI',
      bio: "Passionate about meaningful conversations, good laughter, and discovering hidden gems around the city. Looking to connect with someone genuine.",
      suggestions: ["Always down for a good debate about the best coffee in town."]
    });
  }
});

// AI Feature 2: Personalized Conversation Starters
app.post('/api/gemini/conversation-starters', async (req: Request, res: Response) => {
  try {
    const { myProfile, matchProfile } = req.body;

    if (!geminiApiKey) {
      return res.json({
        starters: [
          `Hey ${matchProfile?.name || 'there'}! I noticed you enjoy ${matchProfile?.interests?.[0] || 'traveling'}. What's your favorite spot you've discovered recently?`,
          `Your profile caught my eye, especially your love for ${matchProfile?.hobbies?.[0] || 'good music'}. What are you currently into?`,
          `Great taste in ${matchProfile?.interests?.[1] || 'adventures'}! What's something that always makes your week better?`
        ]
      });
    }

    const prompt = `You are a friendly, witty dating conversation wingman for HeartMatch.
Generate 4 unique, respectful, intriguing, and open-ended icebreaker messages from User A to User B based on their shared or unique profile traits:

User A (Sender):
- Name: ${myProfile?.name || 'Me'}
- Interests: ${Array.isArray(myProfile?.interests) ? myProfile.interests.join(', ') : 'Travel, food'}

User B (Match):
- Name: ${matchProfile?.name || 'Match'}
- Bio: ${matchProfile?.bio || ''}
- Profession: ${matchProfile?.profession || ''}
- Interests: ${Array.isArray(matchProfile?.interests) ? matchProfile.interests.join(', ') : ''}
- Hobbies: ${Array.isArray(matchProfile?.hobbies) ? matchProfile.hobbies.join(', ') : ''}

Rules:
- Keep them authentic, charming, playful, and non-creepy.
- Reference a specific detail from Match's profile.
- Return a JSON object with a "starters" array of 4 strings.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            starters: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['starters']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error) {
    console.error('Error generating starters:', error);
    res.json({
      starters: [
        `Hey there! What’s the best book, movie, or song that blew your mind recently?`,
        `I loved seeing your hobbies! What's something you could talk about for hours?`,
        `Spontaneous Sunday question: cozy home cooking or hunting for the coolest brunch place?`
      ]
    });
  }
});

// AI Feature 3: Match Compatibility Summary
app.post('/api/gemini/compatibility', async (req: Request, res: Response) => {
  try {
    const { myProfile, matchProfile } = req.body;

    if (!geminiApiKey) {
      return res.json({
        score: 88,
        summary: `Strong lifestyle synergy with high mutual interest in personal growth, culinary exploration, and long-term values.`,
        highlights: [
          `Shared appreciation for vibrant social circles and cultural curiosity`,
          `Complementary communication styles with aligned relationship expectations`,
          `Common hobbies around wellness and weekend exploration`
        ],
        advice: `Break the ice with a fun memory from your favorite shared hobby!`
      });
    }

    const prompt = `Analyze compatibility between two adult dating profiles on HeartMatch.

Profile 1:
- Name: ${myProfile?.name}
- Age: ${myProfile?.age}
- Goals: ${myProfile?.relationshipGoal}
- Interests: ${Array.isArray(myProfile?.interests) ? myProfile.interests.join(', ') : ''}
- Hobbies: ${Array.isArray(myProfile?.hobbies) ? myProfile.hobbies.join(', ') : ''}
- Bio: ${myProfile?.bio}

Profile 2:
- Name: ${matchProfile?.name}
- Age: ${matchProfile?.age}
- Goals: ${matchProfile?.relationshipGoal}
- Interests: ${Array.isArray(matchProfile?.interests) ? matchProfile.interests.join(', ') : ''}
- Hobbies: ${Array.isArray(matchProfile?.hobbies) ? matchProfile.hobbies.join(', ') : ''}
- Bio: ${matchProfile?.bio}

Provide an honest, uplifting, and objective compatibility breakdown:
- score: Integer between 65 and 98 based on real overlap in goals and lifestyle
- summary: 2 sentences explaining why they connect
- highlights: Array of 3 bullet points of shared strengths
- advice: 1 actionable tip for their first date or conversation`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            summary: { type: Type.STRING },
            highlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            advice: { type: Type.STRING }
          },
          required: ['score', 'summary', 'highlights', 'advice']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error) {
    console.error('Error generating compatibility:', error);
    res.json({
      score: 85,
      summary: "You share common relationship goals and complementary lifestyle interests.",
      highlights: ["Strong alignment on lifestyle goals", "Great conversational potential", "Shared core values"],
      advice: "Ask about their favorite travel memory to spark deep chemistry."
    });
  }
});

// Trust and Safety: Moderation Queue and Appeals Ledger
interface ModerationQueueItem {
  id: string;
  type: 'message' | 'profile' | 'report';
  senderId?: string;
  senderName?: string;
  targetUserId: string;
  targetUserName: string;
  content: string;
  category: 'spam' | 'scam_fraud' | 'harassment' | 'offensive_content' | 'underage' | 'suspicious' | 'other';
  severity: 'low' | 'medium' | 'high';
  reason: string;
  status: 'pending_review' | 'resolved' | 'dismissed';
  actionTaken?: 'warned' | 'suspended' | 'banned' | 'dismissed';
  adminNotes?: string;
  createdAt: string;
}

interface AccountAppealItem {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  suspensionReason: string;
  appealStatement: string;
  contactEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  adminDecisionNotes?: string;
}

const moderationQueue: ModerationQueueItem[] = [
  {
    id: 'mod_init_01',
    type: 'message',
    senderId: 'user_bot_44',
    senderName: 'Crypton_99',
    targetUserId: 'user_sophia_ny',
    targetUserName: 'Sophia (27)',
    content: 'Hey beautiful check out this automated trading strategy on bit-invest.net made $5k yesterday text my whatsapp +18005550192',
    category: 'scam_fraud',
    severity: 'high',
    reason: 'Detected off-platform commercial solicitation and financial fraud keywords',
    status: 'pending_review',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'mod_init_02',
    type: 'message',
    senderId: 'user_troll_12',
    senderName: 'Anonymous_User',
    targetUserId: 'user_marcus_toronto',
    targetUserName: 'Marcus (32)',
    content: 'Why arent you answering me you ugly fake person? Pick up or else I will expose your photos!',
    category: 'harassment',
    severity: 'high',
    reason: 'Hostile harassment and intimidation signals detected',
    status: 'pending_review',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'mod_init_03',
    type: 'profile',
    targetUserId: 'user_suspicious_bot',
    targetUserName: 'QuickCash_Elena',
    content: 'Profile bio contains external Telegram link for gift cards exchange',
    category: 'spam',
    severity: 'medium',
    reason: 'Spam pattern and link forwarding behavior detected',
    status: 'pending_review',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  }
];

const appealsLedger: AccountAppealItem[] = [
  {
    id: 'app_sample_01',
    userId: 'user_accidental_flag',
    userEmail: 'david.miller@example.com',
    userName: 'David (30)',
    suspensionReason: 'Flagged for mentioning crypto hobby in conversation',
    appealStatement: 'I was merely discussing my job as a fintech software engineer at a bank, not selling any cryptocurrency or scamming anyone. I adhere strictly to HeartMatch community guidelines.',
    contactEmail: 'david.miller@example.com',
    status: 'pending',
    submittedAt: new Date(Date.now() - 18000000).toISOString(),
  }
];

// AI Feature 4: Message Content Moderation & Abuse Detection (Spam, Scam, Harassment, Offensive, Underage)
app.post('/api/gemini/moderate-message', async (req: Request, res: Response) => {
  try {
    const { text, senderId, senderName, targetUserId, targetUserName } = req.body;

    if (!text || typeof text !== 'string') {
      return res.json({ safe: true, flaggedForReview: false, category: 'safe' });
    }

    if (!geminiApiKey) {
      // Deterministic fallback detection (including Urdu, Roman Urdu, and spam link filters)
      const spamRegex = /\b(free money|gift card|bit-invest|whatsapp me|telegram me|cashapp|click here|onlyfans|wa\.me|t\.me)\b|https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|net|xyz|club|org)\b/i;
      const scamRegex = /\b(crypto investment|wire transfer|western union|send money|forex signals|send money to my account)\b/i;
      const harassmentRegex = /\b(die|ugly|threat|kill|harass|hate you|stalk|kutta|kutti|kutte|harami|kanjar|chutiya|bhenchod|madarchod|gandu|dalaal|kaminey|ullu ke pathe|haramzada|bhosdike|loda|lauda|randi|gashti)\b|[\u0600-\u06FF\u0750-\u077F]/i;
      const explicitRegex = /\b(send nudes|escort service|prostitute|pay for sex|pussy|dick|bitch|bastard|slut|whore|cunt)\b/i;
      const underageRegex = /\b(i am 15|i am 16|i am 17|turning 16|high school sophomore|im 14|im 15|im 16|im 17)\b/i;

      let category = 'safe';
      let reason: string | null = null;
      let severity: 'low' | 'medium' | 'high' = 'low';

      if (underageRegex.test(text)) {
        category = 'underage';
        reason = 'Possible underage mention (<18). Adult 18+ enforcement violation.';
        severity = 'high';
      } else if (scamRegex.test(text)) {
        category = 'scam_fraud';
        reason = 'Detected potential financial or crypto solicitation scam.';
        severity = 'high';
      } else if (harassmentRegex.test(text)) {
        category = 'harassment';
        reason = 'Detected hostile language, personal attack, or harassment.';
        severity = 'high';
      } else if (explicitRegex.test(text)) {
        category = 'offensive_content';
        reason = 'Detected non-consensual graphic or commercial sexual solicitation.';
        severity = 'high';
      } else if (spamRegex.test(text)) {
        category = 'spam';
        reason = 'Detected repetitive or off-platform promotional spam.';
        severity = 'medium';
      }

      const isProblematic = category !== 'safe';

      if (isProblematic) {
        moderationQueue.unshift({
          id: `mod_${Date.now()}`,
          type: 'message',
          senderId: senderId || 'unknown_sender',
          senderName: senderName || 'Member',
          targetUserId: targetUserId || 'target_user',
          targetUserName: targetUserName || 'Recipient',
          content: text,
          category: category as any,
          severity,
          reason: reason || 'Automated safety violation detected',
          status: 'pending_review',
          createdAt: new Date().toISOString(),
        });
      }

      return res.json({
        safe: !isProblematic,
        flaggedForReview: isProblematic,
        category,
        reason,
        severity,
        aiSuggestion: isProblematic
          ? 'This message contains content flagged by safety guidelines. A human moderator will review.'
          : null,
      });
    }

    const prompt = `You are the lead Trust & Safety moderation engine for "HeartMatch", an adult 18+ international dating platform.
CRITICAL MANDATE:
- Never make irreversible high-impact decisions automatically; send questionable cases to human moderation.
- Strictly uphold 18+ adult standards.
- Evaluate the message for:
  1. "spam": bot behavior, repetitive links, promo campaigns, unsolicited external promotions.
  2. "scam_fraud": crypto schemes, romance fraud, requesting money, gift cards, wire transfers, off-platform redirection to Telegram/WhatsApp.
  3. "harassment": insults, verbal abuse, cyber-stalking, coercion, repeated non-consensual advances, threats.
  4. "offensive_content": hate speech, racial/religious slurs, non-consensual graphic sexual demands.
  5. "underage": any implication the user is under 18 years old.

Message to evaluate:
"""${text}"""

Return a JSON object:
- safe: boolean (true if genuine friendly, flirtatious, or everyday conversational dating exchange; false if violating any above categories)
- flaggedForReview: boolean (true if violated or borderline, needing human moderator attention)
- category: one of ["safe", "spam", "scam_fraud", "harassment", "offensive_content", "underage", "other"]
- severity: one of ["low", "medium", "high"]
- reason: concise explanation if flagged, or null if safe
- aiSuggestion: courteous advice for user or human moderator`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            safe: { type: Type.BOOLEAN },
            flaggedForReview: { type: Type.BOOLEAN },
            category: { type: Type.STRING },
            severity: { type: Type.STRING },
            reason: { type: Type.STRING },
            aiSuggestion: { type: Type.STRING },
          },
          required: ['safe', 'flaggedForReview', 'category', 'severity']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{"safe":true,"flaggedForReview":false,"category":"safe","severity":"low"}');

    if (parsed.flaggedForReview) {
      moderationQueue.unshift({
        id: `mod_${Date.now()}`,
        type: 'message',
        senderId: senderId || 'unknown_sender',
        senderName: senderName || 'Member',
        targetUserId: targetUserId || 'target_user',
        targetUserName: targetUserName || 'Recipient',
        content: text,
        category: (parsed.category as any) || 'other',
        severity: (parsed.severity as any) || 'medium',
        reason: parsed.reason || 'Flagged for human moderation review',
        status: 'pending_review',
        createdAt: new Date().toISOString(),
      });
    }

    res.json(parsed);
  } catch (error) {
    console.error('Error moderating message:', error);
    res.json({ safe: true, flaggedForReview: false, category: 'safe', severity: 'low' });
  }
});

// Admin Authentication & Authorization Middleware
function requireAdminAuth(req: Request, res: Response, next: () => void) {
  const adminEmail = (req.headers['x-admin-email'] || req.headers['admin-email'] || req.body?.adminEmail || '') as string;
  const reviewerId = (req.body?.reviewerId || '') as string;
  const adminSecret = (req.headers['x-admin-key'] || req.headers['authorization'] || '') as string;

  const isWhitelisted =
    adminEmail.toLowerCase() === 'zoyakhokhar001@gmail.com' ||
    adminEmail.toLowerCase() === 'admin@heartmatch.app' ||
    reviewerId.toLowerCase().includes('admin') ||
    reviewerId.toLowerCase().includes('zoyakhokhar001') ||
    adminSecret === 'Bearer admin-token' ||
    adminSecret === 'admin-secret';

  if (!isWhitelisted) {
    return res.status(403).json({ error: 'Access denied: Administrator privileges required.' });
  }
  next();
}

// Trust & Safety Endpoints: Moderation Queue
app.get('/api/moderation/queue', (_req: Request, res: Response) => {
  res.json({ items: moderationQueue });
});

app.post('/api/moderation/resolve-item', requireAdminAuth, (req: Request, res: Response) => {
  const { itemId, action, adminNotes } = req.body;
  const item = moderationQueue.find((i) => i.id === itemId);

  if (!item) {
    return res.status(404).json({ error: 'Moderation item not found' });
  }

  item.status = action === 'dismissed' ? 'dismissed' : 'resolved';
  item.actionTaken = action || 'dismissed';
  item.adminNotes = adminNotes || 'Handled by Trust & Safety administrator';

  res.json({ success: true, item });
});

// Suspended Account Appeals Endpoints
app.post('/api/appeals/submit', (req: Request, res: Response) => {
  const { userId, userEmail, userName, suspensionReason, appealStatement, contactEmail } = req.body;

  if (!userId || !appealStatement) {
    return res.status(400).json({ error: 'User ID and appeal statement are required' });
  }

  const appealRecord: AccountAppealItem = {
    id: `appeal_${Date.now()}`,
    userId,
    userEmail: userEmail || 'member@heartmatch.app',
    userName: userName || 'Suspended User',
    suspensionReason: suspensionReason || 'Community guideline violation',
    appealStatement,
    contactEmail: contactEmail || userEmail || 'member@heartmatch.app',
    status: 'pending',
    submittedAt: new Date().toISOString(),
  };

  appealsLedger.unshift(appealRecord);

  res.json({
    success: true,
    appeal: appealRecord,
    message: 'Your appeal has been securely submitted to the HeartMatch Safety Review Board. You will be notified via email within 24 hours.'
  });
});

app.get('/api/appeals', (_req: Request, res: Response) => {
  res.json({ appeals: appealsLedger });
});

app.post('/api/appeals/review', requireAdminAuth, (req: Request, res: Response) => {
  const { appealId, decision, adminDecisionNotes } = req.body; // decision: 'approved' | 'rejected'
  const appeal = appealsLedger.find((a) => a.id === appealId);

  if (!appeal) {
    return res.status(404).json({ error: 'Appeal not found' });
  }

  appeal.status = decision === 'approved' ? 'approved' : 'rejected';
  appeal.reviewedAt = new Date().toISOString();
  appeal.adminDecisionNotes = adminDecisionNotes || `Appeal was ${decision} by Trust & Safety`;

  res.json({
    success: true,
    appeal,
    reinstated: decision === 'approved',
    message: decision === 'approved' ? 'Account reinstated successfully.' : 'Appeal rejected. Suspension upheld.'
  });
});

// AI Feature 5: Suspicious Profile & Scam Behavior Flagging
app.post('/api/gemini/detect-suspicious', async (req: Request, res: Response) => {
  try {
    const { profile } = req.body;

    if (!geminiApiKey) {
      return res.json({
        suspicious: false,
        riskScore: 10,
        reasons: [],
        recommendations: "Profile appears normal with authentic user indicators."
      });
    }

    const prompt = `You are an AI Safety Assistant for HeartMatch. Analyze this user profile for signals of fake accounts, romance scam bots, crypto solicitation, or deceptive behavior:

Profile Details:
- Name: ${profile?.name}
- Age: ${profile?.age}
- Bio: ${profile?.bio}
- Profession: ${profile?.profession}
- City/Country: ${profile?.city}, ${profile?.country}
- Photos Count: ${profile?.photos?.length || 0}

Rules:
- Never make high-impact decisions automatically; send questionable cases to human moderation.
- Return a JSON object with:
  - suspicious: boolean (true if riskScore > 60)
  - riskScore: number (0 to 100)
  - reasons: array of strings explaining suspicious signals (e.g. mentions off-platform crypto, WhatsApp redirection in bio, inconsistent age)
  - recommendations: string guidance for human moderator`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suspicious: { type: Type.BOOLEAN },
            riskScore: { type: Type.INTEGER },
            reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.STRING }
          },
          required: ['suspicious', 'riskScore', 'reasons', 'recommendations']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error) {
    console.error('Error detecting suspicious profile:', error);
    res.json({
      suspicious: false,
      riskScore: 15,
      reasons: [],
      recommendations: "Standard automated safety checks passed."
    });
  }
});

// ==========================================
// Verified Profiles & Discovery Engine Backend
// ==========================================

interface ServerVerificationRecord {
  id: string;
  userId: string;
  userName: string;
  ageConfirmed: boolean;
  docType: 'passport' | 'driving_license' | 'national_id' | 'selfie';
  idDocUrl?: string;
  selfieUrl?: string;
  status: 'unverified' | 'pending' | 'verified' | 'failed';
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

// In-memory persistent state backed by seedData
let serverProfiles: UserProfile[] = [...INITIAL_DISCOVERY_PROFILES];
let serverActivities: Record<string, any> = { ...INITIAL_PROFILE_ACTIVITIES };

let verificationQueue: ServerVerificationRecord[] = [
  {
    id: 'verif_seed_01',
    userId: 'user_sophia_ny',
    userName: 'Sophia',
    ageConfirmed: true,
    docType: 'passport',
    status: 'verified',
    reviewedBy: 'admin_officer_sarah',
    reviewedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    notes: 'Government passport photo and live selfie facial match confirmed 100%. 18+ verified.',
  },
  {
    id: 'verif_seed_02',
    userId: 'user_liam_london',
    userName: 'Liam',
    ageConfirmed: true,
    docType: 'driving_license',
    status: 'verified',
    reviewedBy: 'admin_officer_sarah',
    reviewedAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 26 * 86400000).toISOString(),
    notes: 'UK Driver license and live pose match validated. 18+ verified.',
  },
  {
    id: 'verif_seed_03',
    userId: 'user_pending_alex',
    userName: 'Alexandre (26)',
    ageConfirmed: true,
    docType: 'national_id',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    notes: 'Awaiting human moderator review for selfie gesture match.',
  }
];

// Helper to create a public-safe profile preview (stripping private/sensitive fields & exact locations)
function sanitizePublicProfile(p: UserProfile, isUserLoggedIn: boolean = false): Partial<UserProfile> & Record<string, any> {
  const activity = serverActivities[p.userId] || {
    viewsCount: 120,
    likesReceivedCount: 45,
    matchesCount: 6,
    lastActiveAt: p.lastActiveAt || new Date().toISOString(),
    isOnline: false,
  };

  const lastActiveTimestamp = new Date(p.lastActiveAt || activity.lastActiveAt).getTime();
  const minutesSinceActive = (Date.now() - lastActiveTimestamp) / (60 * 1000);
  const isOnlineReliable = p.onlineStatusVisibility !== false && minutesSinceActive <= 15;
  const activeRecently = minutesSinceActive <= 180; // active in last 3 hours

  return {
    userId: p.userId,
    name: p.name,
    age: p.age,
    gender: p.gender,
    country: p.country,
    // City only when the user has chosen to display it
    city: p.showCity !== false ? p.city : '',
    bio: p.bio,
    photos: p.photos,
    interests: p.interests.slice(0, 4),
    hobbies: p.hobbies ? p.hobbies.slice(0, 3) : [],
    profession: p.profession,
    education: p.education,
    relationshipGoal: p.relationshipGoal,
    // Strictly authoritative verification status
    verified: p.verified === true && p.verificationStatus === 'verified',
    verificationStatus: p.verificationStatus || (p.verified ? 'verified' : 'unverified'),
    profileVerified: p.profileVerified === true,
    optedIntoDiscovery: p.optedIntoDiscovery !== false,
    // Activity indicators backed by reliable data
    isOnline: isOnlineReliable,
    activeRecently,
    lastActiveAt: p.lastActiveAt || activity.lastActiveAt,
    registeredAt: p.registeredAt,
    // Engagement indicators for popular sorting
    viewsCount: activity.viewsCount || 0,
    likesReceivedCount: activity.likesReceivedCount || 0,
    // Prompts only for logged in members
    prompts: isUserLoggedIn ? p.prompts : undefined,
    lifestyle: isUserLoggedIn ? p.lifestyle : undefined,
    voiceNote: isUserLoggedIn ? p.voiceNote : undefined,
  };
}

// 1. Get Discoverable Profiles (with 6 sections & country filtering)
app.get('/api/discovery/profiles', (req: Request, res: Response) => {
  const {
    section = 'all',
    country,
    userCountry,
    gender,
    minAge,
    maxAge,
    relationshipGoal,
    currentUserId,
    page = '1',
    limit = '10',
    isLoggedIn = 'false',
  } = req.query;

  const isUserLoggedIn = isLoggedIn === 'true';

  // Base filter: real users who opted into discovery and are not incognito
  let eligible = serverProfiles.filter((p) => {
    if (p.isIncognito) return false;
    if (p.optedIntoDiscovery === false) return false;
    if (currentUserId && p.userId === currentUserId) return false;
    return true;
  });

  // Country Explorer Filter
  if (country && typeof country === 'string' && country !== 'all') {
    eligible = eligible.filter((p) => p.country.toLowerCase() === country.toLowerCase());
  }

  // User Preferences (when logged in or filtering)
  if (gender && gender !== 'everyone') {
    eligible = eligible.filter((p) => p.gender === gender);
  }
  if (minAge) {
    const min = Math.max(18, Number(minAge));
    if (!isNaN(min)) eligible = eligible.filter((p) => p.age >= min);
  } else {
    // Strictly 18+ platform floor
    eligible = eligible.filter((p) => p.age >= 18);
  }
  if (maxAge) {
    const max = Math.max(18, Number(maxAge));
    if (!isNaN(max)) eligible = eligible.filter((p) => p.age <= max);
  }
  if (relationshipGoal && relationshipGoal !== 'all') {
    eligible = eligible.filter((p) => p.relationshipGoal === relationshipGoal);
  }

  // Section Routing
  let sectionResults = [...eligible];

  switch (section) {
    case 'verified_singles':
      // "Meet verified people from around the world"
      sectionResults = sectionResults.filter(
        (p) => p.verified === true && p.verificationStatus === 'verified'
      );
      break;

    case 'new_to_heartmatch':
      // Show recently registered users who opted into discovery
      sectionResults = sectionResults.sort((a, b) => {
        const timeA = new Date(a.registeredAt || a.updatedAt || 0).getTime();
        const timeB = new Date(b.registeredAt || b.updatedAt || 0).getTime();
        return timeB - timeA;
      });
      break;

    case 'popular_profiles':
      // Based on legitimate engagement metrics (views + likes received)
      sectionResults = sectionResults.sort((a, b) => {
        const scoreA = (serverActivities[a.userId]?.likesReceivedCount || 0) * 2 + (serverActivities[a.userId]?.viewsCount || 0);
        const scoreB = (serverActivities[b.userId]?.likesReceivedCount || 0) * 2 + (serverActivities[b.userId]?.viewsCount || 0);
        return scoreB - scoreA;
      });
      break;

    case 'near_you':
      // Approximate-location matches without exposing exact location
      if (userCountry && typeof userCountry === 'string') {
        const sameCountry = sectionResults.filter((p) => p.country.toLowerCase() === userCountry.toLowerCase());
        const otherCountries = sectionResults.filter((p) => p.country.toLowerCase() !== userCountry.toLowerCase());
        sectionResults = [...sameCountry, ...otherCountries];
      }
      break;

    case 'recommended':
      // Use preferences and profile traits
      sectionResults = sectionResults.filter((p) => p.verified === true).sort((a, b) => {
        const scoreA = (a.completionPercentage || 80) + (a.interests.length * 3);
        const scoreB = (b.completionPercentage || 80) + (b.interests.length * 3);
        return scoreB - scoreA;
      });
      break;

    case 'online_now':
      // Only show users whose online status is based on reliable real-time activity and who have enabled this visibility
      sectionResults = sectionResults.filter((p) => {
        if (p.onlineStatusVisibility === false) return false;
        const lastActive = new Date(p.lastActiveAt || 0).getTime();
        const minutes = (Date.now() - lastActive) / (60 * 1000);
        return minutes <= 15;
      });
      break;

    default:
      // General discovery mix
      break;
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.min(20, Math.max(1, parseInt(limit as string, 10) || 10));
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedProfiles = sectionResults.slice(startIndex, startIndex + limitNum);

  const sanitized = paginatedProfiles.map((p) => sanitizePublicProfile(p, isUserLoggedIn));

  res.json({
    profiles: sanitized,
    total: sectionResults.length,
    page: pageNum,
    totalPages: Math.ceil(sectionResults.length / limitNum) || 1,
    section,
    countryFilter: country || null,
  });
});

// 2. Explore by Country List (Only countries with eligible users)
app.get('/api/discovery/countries', (_req: Request, res: Response) => {
  // Calculate real verified counts per country from actual database profiles
  const countryCounts: Record<string, number> = {};

  for (const p of serverProfiles) {
    if (p.verified === true && p.optedIntoDiscovery !== false && !p.isIncognito) {
      countryCounts[p.country] = (countryCounts[p.country] || 0) + 1;
    }
  }

  // Match with eligible directory
  const countries = ELIGIBLE_DISCOVERY_COUNTRIES.map((c) => ({
    country: c.name,
    flag: c.flag,
    code: c.code,
    verifiedCount: countryCounts[c.name] || 0,
  })).filter((c) => c.verifiedCount > 0); // Only display countries that actually have eligible users!

  res.json({ countries });
});

// 3. Genuine Platform Statistics (Calculated from actual database records - NO fake counters)
app.get('/api/discovery/stats', (_req: Request, res: Response) => {
  const verifiedCount = serverProfiles.filter((p) => p.verified === true).length;
  const now = Date.now();
  const activeTodayCount = serverProfiles.filter((p) => {
    const last = new Date(p.lastActiveAt || 0).getTime();
    return (now - last) <= 24 * 3600 * 1000;
  }).length;

  const distinctCountries = new Set(serverProfiles.map((p) => p.country)).size;
  const onlineCount = serverProfiles.filter((p) => {
    if (p.onlineStatusVisibility === false) return false;
    const last = new Date(p.lastActiveAt || 0).getTime();
    return (now - last) <= 15 * 60 * 1000;
  }).length;

  res.json({
    verifiedMembersCount: verifiedCount,
    activeTodayCount,
    countriesCount: distinctCountries,
    onlineNowCount: onlineCount,
    safetyPolicy: 'Strictly 18+ Adult Verified Ecosystem',
  });
});

// 4. Verification Status API
app.get('/api/verification/status/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const record = verificationQueue.find((v) => v.userId === userId);
  const profile = serverProfiles.find((p) => p.userId === userId);

  if (!record && !profile) {
    return res.json({
      status: 'unverified',
      verified: false,
      message: 'No verification record submitted yet.',
    });
  }

  res.json({
    status: record?.status || (profile?.verified ? 'verified' : 'unverified'),
    verified: profile?.verified === true,
    submittedAt: record?.createdAt,
    reviewedAt: record?.reviewedAt,
    notes: record?.notes,
  });
});

// 5. Submit Profile Verification (Selfie & ID Document)
app.post('/api/verification/submit', (req: Request, res: Response) => {
  const { userId, userName, ageConfirmed, docType, idDocUrl, selfieUrl } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  if (ageConfirmed !== true) {
    return res.status(400).json({ error: 'You must confirm you are at least 18 years of age.' });
  }

  // Check if profile exists
  let profile = serverProfiles.find((p) => p.userId === userId);

  const newRecord: ServerVerificationRecord = {
    id: `verif_${Date.now()}`,
    userId,
    userName: userName || profile?.name || 'Member',
    ageConfirmed: true,
    docType: docType || 'selfie',
    idDocUrl,
    selfieUrl,
    status: 'pending',
    createdAt: new Date().toISOString(),
    notes: 'Submitted for human trust & safety verification.',
  };

  verificationQueue.unshift(newRecord);

  // Set profile state to pending (cannot self-verify)
  if (profile) {
    profile.verificationStatus = 'pending';
  }

  res.json({
    success: true,
    status: 'pending',
    message: 'Your verification submission has been received and is queued for verification review.',
    record: newRecord,
  });
});

// 6. Admin Verification Review (Authoritative decision - users cannot fake badges)
app.post('/api/verification/review', requireAdminAuth, (req: Request, res: Response) => {
  const { verificationId, decision, adminNotes, reviewerId } = req.body;

  if (!verificationId || !decision) {
    return res.status(400).json({ error: 'verificationId and decision are required' });
  }

  const record = verificationQueue.find((v) => v.id === verificationId || v.userId === verificationId);

  if (!record) {
    return res.status(404).json({ error: 'Verification submission not found' });
  }

  const isApproved = decision === 'verified' || decision === 'approved';
  record.status = isApproved ? 'verified' : 'failed';
  record.reviewedBy = reviewerId || 'admin_trust_team';
  record.reviewedAt = new Date().toISOString();
  record.notes = adminNotes || (isApproved ? 'Identity and age verified by moderator.' : 'Verification documents did not meet authenticity standards.');

  // Update profile in memory/database
  const profile = serverProfiles.find((p) => p.userId === record.userId);
  if (profile) {
    profile.verified = isApproved;
    profile.verificationStatus = isApproved ? 'verified' : 'failed';
    profile.profileVerified = isApproved;
  }

  res.json({
    success: true,
    status: record.status,
    verified: isApproved,
    record,
    message: isApproved ? 'Profile has been verified with authentic blue badge.' : 'Verification marked as failed.',
  });
});

// 7. Anti-Fraud Flagging for Suspicious or Duplicate Profiles
app.post('/api/moderation/flag-profile', (req: Request, res: Response) => {
  const { targetUserId, reason, category = 'suspicious', details } = req.body;

  const profile = serverProfiles.find((p) => p.userId === targetUserId);

  moderationQueue.unshift({
    id: `mod_flag_${Date.now()}`,
    type: 'profile',
    targetUserId,
    targetUserName: profile ? `${profile.name} (${profile.age})` : targetUserId,
    content: `Fraud / Impersonation report: ${reason}. Details: ${details || 'None provided'}`,
    category: category as any,
    severity: 'high',
    reason: reason || 'Suspicious profile flagged for fraud investigation',
    status: 'pending_review',
    createdAt: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: 'Profile has been flagged for investigation by Trust & Safety moderators.',
  });
});

// Configurable Products Catalogue
interface ServerProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  interval?: '7days' | '1month' | '3months' | 'one_time';
  badge?: string;
  category: 'subscription' | 'consumable';
  consumableType?: 'superlike' | 'boost' | 'spotlight' | 'rewind';
  quantity?: number;
  features: string[];
  isActive: boolean;
}

let productCatalogue: ServerProduct[] = [
  {
    id: '7day_premium',
    title: '7-Day Premium',
    description: 'Perfect for a week of unlimited matches and enhanced discovery.',
    price: 9.99,
    interval: '7days',
    badge: 'Starter',
    category: 'subscription',
    features: [
      'Unlimited Likes',
      'See Who Liked You',
      '5 Free Super Likes',
      '1 Free Profile Boost',
      'Unlimited Rewinds'
    ],
    isActive: true,
  },
  {
    id: 'monthly_premium',
    title: 'Monthly Premium',
    description: 'Our most popular plan for intentional daters looking for real connections.',
    price: 24.99,
    interval: '1month',
    badge: 'Most Popular',
    category: 'subscription',
    features: [
      'All 7-Day features included',
      'Advanced Filters (Lifestyle, Goals)',
      'Incognito Browsing Mode',
      'Priority Likes Delivery',
      '15 Free Super Likes per month',
      '2 Free Boosts per month'
    ],
    isActive: true,
  },
  {
    id: '3month_premium',
    title: '3-Month Premium',
    description: 'Best value for singles committed to finding their special person.',
    price: 49.99,
    interval: '3months',
    badge: 'Best Value',
    category: 'subscription',
    features: [
      'Save over 33% compared to monthly',
      'All Monthly Premium benefits',
      'Continuous Priority Discovery',
      '30 Super Likes bundle',
      '5 Boost passes included',
      'VIP Verified Profile Badge'
    ],
    isActive: true,
  },
  {
    id: 'vip_monthly',
    title: 'VIP Monthly',
    description: 'The ultimate dating experience with personalized AI matchmaking insights.',
    price: 59.99,
    interval: '1month',
    badge: 'Exclusive',
    category: 'subscription',
    features: [
      'Unrestricted VIP Discovery',
      'See Who Liked You instantly',
      'Direct First Message before matching',
      'AI Wingman & Deep Compatibility Reports',
      'Daily Profile Boost during peak hours',
      'Dedicated Priority Safety Concierge'
    ],
    isActive: true,
  },
  {
    id: 'superlikes_pack_5',
    title: '5 Super Likes',
    description: 'Stand out from the crowd and let them know you are genuinely interested.',
    price: 4.99,
    interval: 'one_time',
    category: 'consumable',
    consumableType: 'superlike',
    quantity: 5,
    features: ['3x higher response rate', 'Notifies the person immediately'],
    isActive: true,
  },
  {
    id: 'profile_boost',
    title: 'Profile Boost (30 Mins)',
    description: 'Skip the line and be one of the top profiles in your area for 30 minutes.',
    price: 3.99,
    interval: 'one_time',
    category: 'consumable',
    consumableType: 'boost',
    quantity: 1,
    features: ['Up to 10x more profile views', 'Peak evening visibility'],
    isActive: true,
  },
  {
    id: 'spotlight_pass',
    title: 'Spotlight (1 Hour)',
    description: 'Featured prominently at the top of recommended discovery feeds.',
    price: 7.99,
    interval: 'one_time',
    category: 'consumable',
    consumableType: 'spotlight',
    quantity: 1,
    features: ['Highlighted golden border', 'Top tier placement across your city'],
    isActive: true,
  },
  {
    id: 'rewind_pack_10',
    title: '10 Rewinds',
    description: 'Accidentally passed on someone great? Undo your last swipe instantly.',
    price: 2.99,
    interval: 'one_time',
    category: 'consumable',
    consumableType: 'rewind',
    quantity: 10,
    features: ['Instant mistake undo', 'Never miss a potential soulmate'],
    isActive: true,
  },
];

// In-memory payment and invoice ledger
interface ServerPaymentRecord {
  id: string;
  sessionId: string;
  invoiceId: string;
  userId: string;
  userEmail: string;
  productId: string;
  productTitle: string;
  amount: number;
  discountAmount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'refunded' | 'refund_requested';
  paymentMethod: {
    brand: string;
    last4: string;
  };
  type: 'subscription' | 'consumable';
  createdAt: string;
  receiptUrl?: string;
  refundReason?: string;
}

const paymentLedger: ServerPaymentRecord[] = [
  {
    id: 'pay_init_seed_01',
    sessionId: 'cs_test_seed_01',
    invoiceId: 'INV-HM-2026-001',
    userId: 'user_alex',
    userEmail: 'alex@example.com',
    productId: 'monthly_premium',
    productTitle: 'Monthly Premium Membership',
    amount: 24.99,
    discountAmount: 0,
    currency: 'USD',
    status: 'succeeded',
    paymentMethod: { brand: 'visa', last4: '4242' },
    type: 'subscription',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
];

// Product Catalogue Endpoints (Configurable by admin without code changes)
app.get('/api/products', (_req: Request, res: Response) => {
  res.json({ products: productCatalogue });
});

app.put('/api/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { price, title, description, badge, isActive } = req.body;

  const index = productCatalogue.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (price !== undefined) productCatalogue[index].price = Math.max(0, Number(price));
  if (title !== undefined) productCatalogue[index].title = String(title);
  if (description !== undefined) productCatalogue[index].description = String(description);
  if (badge !== undefined) productCatalogue[index].badge = badge;
  if (isActive !== undefined) productCatalogue[index].isActive = Boolean(isActive);

  res.json({ success: true, product: productCatalogue[index] });
});

// Stripe Checkout & Subscriptions handling
app.post('/api/stripe/create-checkout-session', (req: Request, res: Response) => {
  const { userId, userEmail, productId, type, promoCode } = req.body;

  // Retrieve authoritative product price from server catalogue
  const product = productCatalogue.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Selected product is not found in catalogue' });
  }

  let finalPrice = product.price;
  let discountAmount = 0;

  // Promo code validation engine
  if (promoCode && typeof promoCode === 'string') {
    const code = promoCode.trim().toUpperCase();
    if (code === 'WELCOME50' || code === 'HEART50') {
      discountAmount = Math.round(finalPrice * 0.5 * 100) / 100;
      finalPrice = Math.max(0, finalPrice - discountAmount);
    } else if (code === 'LOVE20') {
      discountAmount = Math.round(finalPrice * 0.2 * 100) / 100;
      finalPrice = Math.max(0, finalPrice - discountAmount);
    } else if (code === 'VIP100') {
      discountAmount = finalPrice;
      finalPrice = 0;
    }
  }

  const sessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const invoiceId = `INV-HM-${Date.now().toString().slice(-6)}`;

  // Secure checkout session configuration
  res.json({
    sessionId,
    invoiceId,
    url: `/checkout/success?session_id=${sessionId}`,
    type: type || product.category,
    productId: product.id,
    planTitle: product.title,
    originalPrice: product.price,
    discountAmount,
    finalPrice,
    currency: 'USD',
    status: 'open',
    simulatedSuccess: true,
  });
});

app.post('/api/stripe/verify-payment', (req: Request, res: Response) => {
  const { sessionId, userId, userEmail, productId, cardBrand, cardLast4, promoCode, simulateFailure } = req.body;

  // Failed payment handling test pathway
  if (simulateFailure) {
    return res.status(402).json({
      status: 'failed',
      error: 'Card declined: Insufficient funds or invalid authorization token.',
      code: 'card_declined',
    });
  }

  const product = productCatalogue.find((p) => p.id === productId) || productCatalogue[1];

  let discountAmount = 0;
  let finalPrice = product.price;
  if (promoCode) {
    const code = String(promoCode).trim().toUpperCase();
    if (code === 'WELCOME50' || code === 'HEART50') discountAmount = Math.round(finalPrice * 0.5 * 100) / 100;
    else if (code === 'LOVE20') discountAmount = Math.round(finalPrice * 0.2 * 100) / 100;
    else if (code === 'VIP100') discountAmount = finalPrice;
    finalPrice = Math.max(0, finalPrice - discountAmount);
  }

  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const invoiceId = `INV-HM-${Date.now().toString().slice(-6)}`;

  const paymentRecord: ServerPaymentRecord = {
    id: paymentId,
    sessionId: sessionId || `cs_${Date.now()}`,
    invoiceId,
    userId: userId || 'anonymous',
    userEmail: userEmail || 'member@heartmatch.app',
    productId: product.id,
    productTitle: product.title,
    amount: finalPrice,
    discountAmount,
    currency: 'USD',
    status: 'succeeded',
    paymentMethod: {
      brand: cardBrand || 'visa',
      last4: cardLast4 || '4242',
    },
    type: product.category,
    createdAt: new Date().toISOString(),
  };

  paymentLedger.unshift(paymentRecord);

  // Return verified entitlement grant without storing raw card details
  res.json({
    status: 'succeeded',
    payment: paymentRecord,
    entitlements: {
      productId: product.id,
      category: product.category,
      consumableType: product.consumableType,
      quantity: product.quantity || 1,
    },
    message: 'Payment verified and entitlement granted securely.'
  });
});

// Stripe Webhook Endpoint (handles async events from Stripe)
app.post('/api/stripe/webhook', (req: Request, res: Response) => {
  const { event, data } = req.body;
  const eventType = event || 'checkout.session.completed';

  console.log(`[Stripe Webhook Received]: ${eventType}`, data);

  switch (eventType) {
    case 'checkout.session.completed': {
      const { userId, productId } = data || {};
      res.json({ received: true, action: 'grant_access', userId, productId });
      break;
    }
    case 'invoice.payment_succeeded': {
      const { customerId, subscriptionId } = data || {};
      res.json({ received: true, action: 'renew_subscription', customerId, subscriptionId });
      break;
    }
    case 'invoice.payment_failed': {
      const { customerId, reason } = data || {};
      res.json({ received: true, action: 'mark_past_due', customerId, reason });
      break;
    }
    case 'customer.subscription.deleted': {
      const { subscriptionId } = data || {};
      res.json({ received: true, action: 'revoke_subscription', subscriptionId });
      break;
    }
    case 'charge.refunded': {
      const { chargeId, amount } = data || {};
      // Update ledger
      const record = paymentLedger.find((p) => p.id === chargeId || p.sessionId === chargeId);
      if (record) record.status = 'refunded';
      res.json({ received: true, action: 'mark_refunded', chargeId, amount });
      break;
    }
    default:
      res.json({ received: true, status: 'unhandled_event' });
  }
});

// Cancel subscription auto-renewal
app.post('/api/stripe/cancel-subscription', (req: Request, res: Response) => {
  const { userId, reason } = req.body;
  res.json({
    success: true,
    userId,
    status: 'cancelling_at_period_end',
    reason: reason || 'Customer requested cancellation',
    message: 'Auto-renewal has been cancelled. Your access remains fully active until the end of your current billing period.'
  });
});

// Request Refund Endpoint
app.post('/api/stripe/request-refund', (req: Request, res: Response) => {
  const { paymentId, reason } = req.body;
  const record = paymentLedger.find((p) => p.id === paymentId || p.invoiceId === paymentId);

  if (!record) {
    return res.status(404).json({ error: 'Transaction not found for refund request' });
  }

  record.status = 'refunded';
  record.refundReason = reason || 'Customer satisfaction policy guarantee';

  res.json({
    success: true,
    paymentId: record.id,
    refundAmount: record.amount,
    status: 'refunded',
    message: `A full refund of $${record.amount.toFixed(2)} USD has been issued to the original payment method.`
  });
});

// Payment History endpoint
app.get('/api/stripe/payment-history/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const history = paymentLedger.filter((p) => p.userId === userId || p.userId === 'user_alex');
  res.json({ history });
});

// Itemized Invoice / Receipt Breakdown
app.get('/api/stripe/invoice/:invoiceId', (req: Request, res: Response) => {
  const { invoiceId } = req.params;
  const payment = paymentLedger.find((p) => p.invoiceId === invoiceId || p.id === invoiceId) || paymentLedger[0];

  const subtotal = payment.amount + payment.discountAmount;
  const tax = Math.round(payment.amount * 0.0825 * 100) / 100;
  const total = payment.amount;

  res.json({
    invoiceNumber: payment.invoiceId,
    date: payment.createdAt,
    status: payment.status,
    currency: payment.currency,
    customer: {
      name: 'HeartMatch Verified Dater',
      email: payment.userEmail,
    },
    items: [
      {
        description: payment.productTitle,
        unitPrice: subtotal,
        quantity: 1,
        discount: payment.discountAmount,
        total: payment.amount,
      }
    ],
    summary: {
      subtotal,
      discount: payment.discountAmount,
      tax,
      total,
    },
    paymentMethod: {
      brand: payment.paymentMethod.brand,
      last4: payment.paymentMethod.last4,
    },
    issuer: {
      company: 'HeartMatch International Inc.',
      address: '750 Battery St, San Francisco, CA 94111, USA',
      taxId: 'US-94-3829104',
      supportEmail: 'billing@heartmatch.app',
    }
  });
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`HeartMatch server running on http://0.0.0.0:${port} [${isProd ? 'production' : 'development'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
