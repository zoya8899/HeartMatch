// Dynamic Multi-Country Couple Generator and Live Activity Service
// HeartMatch Live Activity Ticker

export interface TickerPairing {
  id: string;
  type: 'cross_country' | 'local' | 'international';
  person1: {
    name: string;
    city: string;
    country: string;
    countryCode: string;
  };
  person2: {
    name: string;
    city: string;
    country: string;
    countryCode: string;
  };
  message: string;
  emoji: string;
  timestamp: string;
}

// 1. Rich pools of realistic names & locations
export const PAKISTANI_NAMES = {
  males: ['Hamza', 'Bilal', 'Daniyal', 'Usman', 'Zayan', 'Raheel', 'Farhan', 'Shahmeer', 'Haris', 'Zubair', 'Saad', 'Faizan'],
  females: ['Sana', 'Ayesha', 'Maham', 'Zara', 'Hania', 'Noor', 'Anum', 'Kinza', 'Alizeh', 'Rabia', 'Maryam', 'Mehak'],
  cities: ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Peshawar', 'Multan'],
  country: 'Pakistan',
  countryCode: 'PK',
};

export const UK_NAMES = {
  males: ['Oliver', 'Harry', 'Liam', 'George', 'Ethan', 'Jack', 'Arthur', 'Noah', 'Charlie', 'Thomas', 'Freddie', 'Archie'],
  females: ['Emma', 'Sophie', 'Olivia', 'Chloe', 'Charlotte', 'Mia', 'Amelia', 'Isabella', 'Freya', 'Grace', 'Emily', 'Lily'],
  cities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Bristol', 'Edinburgh', 'Glasgow', 'Liverpool'],
  country: 'UK',
  countryCode: 'GB',
};

export const US_NAMES = {
  males: ['Lucas', 'Alexander', 'James', 'Daniel', 'Julian', 'Mason', 'Elijah', 'Logan'],
  females: ['Ava', 'Emily', 'Maya', 'Jessica', 'Harper', 'Samantha', 'Ella', 'Aria'],
  cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'San Francisco', 'Boston'],
  country: 'USA',
  countryCode: 'US',
};

export const CANADA_NAMES = {
  males: ['Liam', 'Benjamin', 'Marcus', 'Gabriel', 'Owen', 'Felix'],
  females: ['Chloe', 'Zoe', 'Sarah', 'Hannah', 'Leah', 'Clara'],
  cities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'],
  country: 'Canada',
  countryCode: 'CA',
};

export const UAE_NAMES = {
  males: ['Zayd', 'Tariq', 'Rayan', 'Omar', 'Rashid', 'Farid', 'Kareem', 'Sami'],
  females: ['Layla', 'Yasmin', 'Mariam', 'Dina', 'Reem', 'Nour', 'Salma', 'Huda'],
  cities: ['Dubai', 'Abu Dhabi', 'Sharjah'],
  country: 'UAE',
  countryCode: 'AE',
};

// Queue of recently used names to guarantee NO repetition
const recentNamesQueue: string[] = [];
const MAX_RECENT_NAMES = 24;

function pickUniqueName(pool: string[]): string {
  const available = pool.filter((name) => !recentNamesQueue.includes(name));
  const candidatePool = available.length > 0 ? available : pool;
  const picked = candidatePool[Math.floor(Math.random() * candidatePool.length)];

  recentNamesQueue.push(picked);
  if (recentNamesQueue.length > MAX_RECENT_NAMES) {
    recentNamesQueue.shift();
  }
  return picked;
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate a randomized couple pairing with rich variations
 */
export function generateRandomMatchNotification(): TickerPairing {
  const id = `ticker_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const timeLabel = 'just now';

  // Choose pairing style: 40% Cross-country, 35% Local, 25% International
  const randStyle = Math.random();
  let type: 'cross_country' | 'local' | 'international' = 'cross_country';

  let p1: { name: string; city: string; country: string; countryCode: string };
  let p2: { name: string; city: string; country: string; countryCode: string };
  let message = '';
  let emoji = '💖';

  if (randStyle < 0.40) {
    // 1. Cross-country Pairing (e.g. UK + Pakistan, or USA + Pakistan, or UAE + UK)
    type = 'cross_country';
    const subType = Math.random();

    if (subType < 0.5) {
      // UK female + Pakistani male (or vice versa)
      const isUkFemale = Math.random() > 0.5;
      if (isUkFemale) {
        p1 = {
          name: pickUniqueName(UK_NAMES.females),
          city: getRandomItem(UK_NAMES.cities),
          country: UK_NAMES.country,
          countryCode: UK_NAMES.countryCode,
        };
        p2 = {
          name: pickUniqueName(PAKISTANI_NAMES.males),
          city: getRandomItem(PAKISTANI_NAMES.cities),
          country: PAKISTANI_NAMES.country,
          countryCode: PAKISTANI_NAMES.countryCode,
        };
      } else {
        p1 = {
          name: pickUniqueName(PAKISTANI_NAMES.females),
          city: getRandomItem(PAKISTANI_NAMES.cities),
          country: PAKISTANI_NAMES.country,
          countryCode: PAKISTANI_NAMES.countryCode,
        };
        p2 = {
          name: pickUniqueName(UK_NAMES.males),
          city: getRandomItem(UK_NAMES.cities),
          country: UK_NAMES.country,
          countryCode: UK_NAMES.countryCode,
        };
      }
    } else if (subType < 0.75) {
      // US/Canada + Pakistan
      const poolAmericas = Math.random() > 0.5 ? US_NAMES : CANADA_NAMES;
      p1 = {
        name: pickUniqueName(poolAmericas.females),
        city: getRandomItem(poolAmericas.cities),
        country: poolAmericas.country,
        countryCode: poolAmericas.countryCode,
      };
      p2 = {
        name: pickUniqueName(PAKISTANI_NAMES.males),
        city: getRandomItem(PAKISTANI_NAMES.cities),
        country: PAKISTANI_NAMES.country,
        countryCode: PAKISTANI_NAMES.countryCode,
      };
    } else {
      // UAE + UK or Pakistan
      p1 = {
        name: pickUniqueName(UAE_NAMES.females),
        city: getRandomItem(UAE_NAMES.cities),
        country: UAE_NAMES.country,
        countryCode: UAE_NAMES.countryCode,
      };
      p2 = {
        name: pickUniqueName(UK_NAMES.males),
        city: getRandomItem(UK_NAMES.cities),
        country: UK_NAMES.country,
        countryCode: UK_NAMES.countryCode,
      };
    }

    const templates = [
      () => ({
        msg: `HeartMatch congratulations 🎉 ${p1.name} (${p1.city}, ${p1.country}) & ${p2.name} (${p2.city}, ${p2.country}) just matched!`,
        emo: '💖',
      }),
      () => ({
        msg: `🔥 New cross-border connection made between ${p1.city} and ${p2.city}!`,
        emo: '🔥',
      }),
      () => ({
        msg: `💬 ${p1.name} (${p1.city}) and ${p2.name} (${p2.city}) started chatting!`,
        emo: '💬',
      }),
      () => ({
        msg: `✨ Sparks flying! ${p1.name} (${p1.city}, ${p1.country}) & ${p2.name} (${p2.city}, ${p2.country}) exchanged mutual likes!`,
        emo: '✨',
      }),
    ];
    const picked = getRandomItem(templates)();
    message = picked.msg;
    emoji = picked.emo;
  } else if (randStyle < 0.75) {
    // 2. Local Pairing (e.g. Zara in Karachi & Daniyal in Islamabad)
    type = 'local';
    const city1 = getRandomItem(PAKISTANI_NAMES.cities);
    let city2 = getRandomItem(PAKISTANI_NAMES.cities);
    if (city1 === city2) {
      city2 = city1 === 'Lahore' ? 'Islamabad' : 'Lahore';
    }

    p1 = {
      name: pickUniqueName(PAKISTANI_NAMES.females),
      city: city1,
      country: PAKISTANI_NAMES.country,
      countryCode: PAKISTANI_NAMES.countryCode,
    };
    p2 = {
      name: pickUniqueName(PAKISTANI_NAMES.males),
      city: city2,
      country: PAKISTANI_NAMES.country,
      countryCode: PAKISTANI_NAMES.countryCode,
    };

    const templates = [
      () => ({
        msg: `HeartMatch congratulations 🎉 ${p1.name} (${p1.city}) & ${p2.name} (${p2.city}) just matched!`,
        emo: '🎉',
      }),
      () => ({
        msg: `🔥 ${p1.name} (${p1.city}) & ${p2.name} (${p2.city}) started chatting!`,
        emo: '🔥',
      }),
      () => ({
        msg: `💬 New conversation unlocked between ${p1.name} and ${p2.name} in Pakistan!`,
        emo: '💬',
      }),
      () => ({
        msg: `💖 Mutual attraction! ${p1.name} (${p1.city}) and ${p2.name} (${p2.city}) just connected!`,
        emo: '💖',
      }),
    ];
    const picked = getRandomItem(templates)();
    message = picked.msg;
    emoji = picked.emo;
  } else {
    // 3. International Pairing (e.g. UK cities, US cities, UAE)
    type = 'international';
    const isUk = Math.random() > 0.3;
    if (isUk) {
      const city1 = getRandomItem(UK_NAMES.cities);
      let city2 = getRandomItem(UK_NAMES.cities);
      if (city1 === city2) {
        city2 = city1 === 'London' ? 'Manchester' : 'London';
      }
      p1 = {
        name: pickUniqueName(UK_NAMES.females),
        city: city1,
        country: UK_NAMES.country,
        countryCode: UK_NAMES.countryCode,
      };
      p2 = {
        name: pickUniqueName(UK_NAMES.males),
        city: city2,
        country: UK_NAMES.country,
        countryCode: UK_NAMES.countryCode,
      };
    } else {
      p1 = {
        name: pickUniqueName(US_NAMES.females),
        city: getRandomItem(US_NAMES.cities),
        country: US_NAMES.country,
        countryCode: US_NAMES.countryCode,
      };
      p2 = {
        name: pickUniqueName(CANADA_NAMES.males),
        city: getRandomItem(CANADA_NAMES.cities),
        country: CANADA_NAMES.country,
        countryCode: CANADA_NAMES.countryCode,
      };
    }

    const templates = [
      () => ({
        msg: `HeartMatch congratulations 🎉 ${p1.name} (${p1.city}, ${p1.country}) & ${p2.name} (${p2.city}, ${p2.country}) matched!`,
        emo: '🎉',
      }),
      () => ({
        msg: `💬 ${p1.name} (${p1.city}) and ${p2.name} (${p2.city}) are now chatting!`,
        emo: '💬',
      }),
      () => ({
        msg: `🔥 New connection made between ${p1.city} and ${p2.city}!`,
        emo: '🔥',
      }),
    ];
    const picked = getRandomItem(templates)();
    message = picked.msg;
    emoji = picked.emo;
  }

  return {
    id,
    type,
    person1: p1,
    person2: p2,
    message,
    emoji,
    timestamp: timeLabel,
  };
}

/**
 * Natural Active Members Counter Simulation
 * Fluctuates naturally around 140 - 165 members (e.g. 148 -> 153 -> 142 -> 149)
 */
let currentActiveMembers = 148;

export function getNextActiveMembersCount(): number {
  // Delta between -4 and +5 with boundary preservation
  const delta = Math.floor(Math.random() * 9) - 4; // -4 to +4
  let next = currentActiveMembers + delta;

  // Keep within realistic 24/7 bustling activity window [138, 168]
  if (next < 138) next = 142 + Math.floor(Math.random() * 5);
  if (next > 168) next = 162 - Math.floor(Math.random() * 5);

  currentActiveMembers = next;
  return next;
}

export function getCurrentActiveMembersCount(): number {
  return currentActiveMembers;
}
