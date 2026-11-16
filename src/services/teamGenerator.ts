export type VibeType = 'Tech' | 'Creative' | 'Business / Professional' | 'Bold & Fierce';

export interface VibeData {
  id: VibeType;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  accentColor: string;
  gradient: string;
  adjectives: string[];
  nouns: string[];
}

/**
 * Word banks mapped to industries and vibes
 * Directly preserving and replicating the exact word banks from the Jupyter Notebook
 */
export const ADJECTIVES: Record<VibeType, string[]> = {
  Creative: [
    'Apex',
    'Quantum',
    'Vivid',
    'Cognitive',
    'Synapse',
    'Prismatic',
    'Nexus',
    'Elysian',
    'Catalyst',
    'Aether'
  ],
  Tech: [
    'Cyber',
    'Binary',
    'Vector',
    'Algorithmic',
    'Cloud',
    'Helix',
    'Silicon',
    'Neural',
    'Matrix',
    'Syntax'
  ],
  'Business / Professional': [
    'Summit',
    'Vanguard',
    'Synergy',
    'Pinnacle',
    'Alliance',
    'Crest',
    'Legacy',
    'Beacon',
    'Charter',
    'Apex'
  ],
  'Bold & Fierce': [
    'Rogue',
    'Maverick',
    'Titan',
    'Vortex',
    'Blaze',
    'Phoenix',
    'Phantom',
    'Apex',
    'Velocity',
    'Obsidian'
  ]
};

export const NOUNS: Record<VibeType, string[]> = {
  Creative: [
    'Guild',
    'Lab',
    'Studio',
    'Collective',
    'Forge',
    'Minds',
    'Wave',
    'Engine',
    'Canvas',
    'Innovators'
  ],
  Tech: [
    'Systems',
    'Nodes',
    'Bots',
    'Labs',
    'Devs',
    'Network',
    'Logic',
    'Matrix',
    'Architects',
    'Coders'
  ],
  'Business / Professional': [
    'Consulting',
    'Partners',
    'Group',
    'Holdings',
    'Ventures',
    'Capital',
    'Advisors',
    'Strategies',
    'Syndicate'
  ],
  'Bold & Fierce': [
    'Warriors',
    'Squad',
    'Force',
    'Knights',
    'Wolves',
    'Raiders',
    'Outlaws',
    'Brigade',
    'Rangers'
  ]
};

export const VIBE_METADATA: Record<VibeType, {
  label: string;
  shortLabel: string;
  description: string;
  iconName: string;
  accentColor: string;
  borderColor: string;
  gradient: string;
}> = {
  Tech: {
    label: 'Tech',
    shortLabel: 'Tech',
    description: 'Algorithmic, digital, and futuristic identities for engineering & developer squads',
    iconName: 'Cpu',
    accentColor: '#22D3EE', // Electric cyan
    borderColor: 'border-cyan-500/30',
    gradient: 'from-cyan-500/20 to-blue-500/10'
  },
  Creative: {
    label: 'Creative',
    shortLabel: 'Creative',
    description: 'Imaginative, vivid, and conceptual names for studios, designers, and innovators',
    iconName: 'Palette',
    accentColor: '#8B5CF6', // Vibrant violet
    borderColor: 'border-violet-500/30',
    gradient: 'from-violet-500/20 to-purple-500/10'
  },
  'Business / Professional': {
    label: 'Business / Professional',
    shortLabel: 'Business',
    description: 'Prestigious, strategic, and authoritative naming for consulting, finance, & corporate teams',
    iconName: 'Briefcase',
    accentColor: '#B8F34A', // Lime green
    borderColor: 'border-lime-400/30',
    gradient: 'from-lime-400/20 to-emerald-500/10'
  },
  'Bold & Fierce': {
    label: 'Bold & Fierce',
    shortLabel: 'Bold',
    description: 'High-energy, competitive, and formidable names for esports, sports, & hackathons',
    iconName: 'Flame',
    accentColor: '#F43F5E', // Rose / Ember
    borderColor: 'border-rose-500/30',
    gradient: 'from-rose-500/20 to-amber-500/10'
  }
};

export type PatternOption = 'auto' | 'keyword-noun' | 'adj-keyword' | 'the-adj-keyword-noun' | 'adj-noun';
export type CasingOption = 'title' | 'upper' | 'lower';

export interface GenerationOptions {
  vibe: VibeType | 'All';
  keyword?: string;
  count?: number;
  patternMode?: PatternOption;
  casing?: CasingOption;
}

export interface GeneratedTeamConcept {
  id: string;
  name: string;
  rawName: string;
  vibe: VibeType;
  adjective: string;
  noun: string;
  keyword?: string;
  patternUsed: string;
  acronym: string;
  tagline: string;
  timestamp: number;
}

// Helper to pick a random item from an array
function sample<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate an acronym from a name
export function generateAcronym(name: string): string {
  const clean = name.replace(/^The\s+/i, '');
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return clean.slice(0, 3).toUpperCase();
  }
  return words.map(w => w[0].toUpperCase()).join('');
}

// Generate contextual team motto / slogan based on vibe and name
export function generateTagline(name: string, vibe: VibeType): string {
  const techMottos = [
    'Engineering the future, one node at a time.',
    'Scalable precision through algorithmic mastery.',
    'Where logic meets architectural brilliance.',
    'Pioneering modern paradigms and digital frontiers.'
  ];
  const creativeMottos = [
    'Where visionary imagination sparks reality.',
    'Crafting the next wave of creative resonance.',
    'Minds united in pure design exploration.',
    'Redefining aesthetic boundaries and expression.'
  ];
  const businessMottos = [
    'Strategic leadership powering enterprise momentum.',
    'Delivering elite excellence, capital, and impact.',
    'The premier syndicate for visionary growth.',
    'Guiding high-stakes navigation and lasting legacy.'
  ];
  const boldMottos = [
    'Relentless energy, unstoppable domination.',
    'Forged in intensity, united in victory.',
    'Dominating the arena with fierce resolve.',
    'Fear no challenge, claim every summit.'
  ];

  const pool = {
    Tech: techMottos,
    Creative: creativeMottos,
    'Business / Professional': businessMottos,
    'Bold & Fierce': boldMottos
  }[vibe];

  return sample(pool);
}

// Format casing according to preference
export function formatCasing(text: string, casing: CasingOption = 'title'): string {
  if (casing === 'upper') return text.toUpperCase();
  if (casing === 'lower') return text.toLowerCase();
  
  // Title case
  return text
    .split(' ')
    .map(word => {
      if (word.toLowerCase() === 'the') return 'The';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Core Team Name Generation Algorithm
 * Exactly preserves the logic from `Team name generater.ipynb`
 * 
 * In Python notebook:
 *   adj = random.choice(adjectives[vibe])
 *   noun = random.choice(nouns[vibe])
 *   if kw:
 *       pattern = random.choice([
 *           f"{kw} {noun}",
 *           f"{adj} {kw}",
 *           f"The {adj} {kw} {noun}"
 *       ])
 *   else:
 *       pattern = f"{adj} {noun}"
 */
export function generateTeamNames(options: GenerationOptions): GeneratedTeamConcept[] {
  const {
    vibe,
    keyword = '',
    count = 3,
    patternMode = 'auto',
    casing = 'title'
  } = options;

  const kw = keyword.trim();
  const results: GeneratedTeamConcept[] = [];
  const generatedNamesSet = new Set<string>();

  const allVibes: VibeType[] = ['Tech', 'Creative', 'Business / Professional', 'Bold & Fierce'];

  // Attempt to generate unique names
  const maxAttempts = count * 15;
  let attempts = 0;

  while (results.length < count && attempts < maxAttempts) {
    attempts++;

    // Select target vibe
    const currentVibe: VibeType = vibe === 'All' ? sample(allVibes) : vibe;

    const adj = sample(ADJECTIVES[currentVibe]);
    const noun = sample(NOUNS[currentVibe]);

    let rawName = '';
    let patternUsed = '';

    if (kw) {
      if (patternMode === 'keyword-noun') {
        rawName = `${kw} ${noun}`;
        patternUsed = '{Keyword} {Noun}';
      } else if (patternMode === 'adj-keyword') {
        rawName = `${adj} ${kw}`;
        patternUsed = '{Adjective} {Keyword}';
      } else if (patternMode === 'the-adj-keyword-noun') {
        rawName = `The ${adj} ${kw} ${noun}`;
        patternUsed = 'The {Adjective} {Keyword} {Noun}';
      } else {
        // Exact notebook random choice behavior
        const choice = sample([1, 2, 3]);
        if (choice === 1) {
          rawName = `${kw} ${noun}`;
          patternUsed = '{Keyword} {Noun}';
        } else if (choice === 2) {
          rawName = `${adj} ${kw}`;
          patternUsed = '{Adjective} {Keyword}';
        } else {
          rawName = `The ${adj} ${kw} ${noun}`;
          patternUsed = 'The {Adjective} {Keyword} {Noun}';
        }
      }
    } else {
      rawName = `${adj} ${noun}`;
      patternUsed = '{Adjective} {Noun}';
    }

    const formattedName = formatCasing(rawName, casing);

    if (!generatedNamesSet.has(formattedName.toLowerCase())) {
      generatedNamesSet.add(formattedName.toLowerCase());

      const concept: GeneratedTeamConcept = {
        id: `${Date.now()}-${results.length}-${Math.random().toString(36).substring(2, 7)}`,
        name: formattedName,
        rawName,
        vibe: currentVibe,
        adjective: adj,
        noun: noun,
        keyword: kw || undefined,
        patternUsed,
        acronym: generateAcronym(formattedName),
        tagline: generateTagline(formattedName, currentVibe),
        timestamp: Date.now()
      };

      results.push(concept);
    }
  }

  return results;
}

