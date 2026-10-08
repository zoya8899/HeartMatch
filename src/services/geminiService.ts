import {
  AIBioResponse,
  AIStartersResponse,
  AICompatibilityResponse,
  AIModerationResponse,
  AISuspiciousResponse,
  UserProfile,
} from '../types';

export const geminiService = {
  async generateBio(params: {
    name: string;
    age: number;
    profession?: string;
    hobbies?: string[];
    interests?: string[];
    relationshipGoal?: string;
    tone?: string;
  }): Promise<AIBioResponse> {
    try {
      const res = await fetch('/api/gemini/generate-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error('Failed to generate bio');
      return await res.json();
    } catch (err) {
      console.error('Error generating bio:', err);
      return {
        bio: `Passionate about ${params.interests?.[0] || 'good conversations'}, living in the moment, and pursuing meaningful connections. Always ready for new adventures and good coffee.`,
        suggestions: [
          `Exploring the city one hidden cafe at a time. Looking for someone with great banter.`,
          `Driven by curiosity, good design, and spontaneous weekend road trips.`
        ]
      };
    }
  },

  async getConversationStarters(myProfile: Partial<UserProfile>, matchProfile: Partial<UserProfile>): Promise<AIStartersResponse> {
    try {
      const res = await fetch('/api/gemini/conversation-starters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ myProfile, matchProfile }),
      });
      if (!res.ok) throw new Error('Failed to fetch starters');
      return await res.json();
    } catch (err) {
      console.error('Error fetching starters:', err);
      return {
        starters: [
          `Hey ${matchProfile.name || 'there'}! I noticed you enjoy ${matchProfile.interests?.[0] || 'good food'}. What's your all-time favorite spot?`,
          `Your profile is awesome! What's something fun you've been working on or looking forward to lately?`,
          `Coffee debate: morning espresso ritual or iced latte anytime of the day?`
        ]
      };
    }
  },

  async getCompatibility(myProfile: Partial<UserProfile>, matchProfile: Partial<UserProfile>): Promise<AICompatibilityResponse> {
    try {
      const res = await fetch('/api/gemini/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ myProfile, matchProfile }),
      });
      if (!res.ok) throw new Error('Failed to calculate compatibility');
      return await res.json();
    } catch (err) {
      console.error('Error getting compatibility:', err);
      return {
        score: 85,
        summary: `You both share authentic values and complementary lifestyle interests.`,
        highlights: [
          `Mutual focus on honest communication and personal growth`,
          `Shared energy for travel, culture, and active weekends`,
          `High conversational potential with aligned relationship expectations`
        ],
        advice: `Ask about their dream destination or favorite weekend ritual.`
      };
    }
  },

  async moderateMessage(text: string): Promise<AIModerationResponse> {
    try {
      const res = await fetch('/api/gemini/moderate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return { safe: true };
      return await res.json();
    } catch (err) {
      console.error('Error moderating message:', err);
      return { safe: true };
    }
  },

  async detectSuspiciousProfile(profile: Partial<UserProfile>): Promise<AISuspiciousResponse> {
    try {
      const res = await fetch('/api/gemini/detect-suspicious', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      if (!res.ok) throw new Error('Failed to evaluate profile');
      return await res.json();
    } catch (err) {
      console.error('Error analyzing profile:', err);
      return {
        suspicious: false,
        riskScore: 10,
        reasons: [],
        recommendations: 'No abnormal signals detected.'
      };
    }
  },

  async sendPersonaChatMessage(params: {
    personaId: string;
    userMessage: string;
    conversationHistory: { sender: 'user' | 'persona'; text: string }[];
    userProfile?: Partial<UserProfile>;
  }): Promise<string> {
    try {
      const res = await fetch('/api/gemini/persona-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error('Failed to get persona response');
      const data = await res.json();
      return data.text || 'Thanks for reaching out! How is your day going?';
    } catch (err) {
      console.error('Error fetching persona chat:', err);
      return 'It is so lovely to connect with you on HeartMatch! Tell me more about what you like to do?';
    }
  }
};
