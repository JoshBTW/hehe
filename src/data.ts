import { JournalConfig } from './types';

export const PRESET_IMAGES = {
  cover: '/src/assets/images/scrapbook_cover_1781623447171.jpg',
  couple: '/src/assets/images/cozy_couple_1781623463629.jpg',
  polaroid: '/src/assets/images/polaroid_memory_1781623479443.jpg',
  heart: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop',
  stars: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=800&auto=format&fit=crop',
  flowers: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=800&auto=format&fit=crop',
};

export const DEFAULT_CONFIG: JournalConfig = {
  partnerName: 'My Sweetheart',
  senderName: 'Joshua',
  relationshipDate: '2024-10-12', // Anniversary / relation start date
  themeColor: 'pink',
  musicEnabled: true,
  slides: [
    {
      id: 'slide-1',
      type: 'envelope',
      title: 'A Little Surprise For You',
      subtitle: 'Open to see our journey',
      description: 'I crafted this digital journal just for you to keep our special moments close. Click below to crack open the seal and step into memory lane...',
      image: PRESET_IMAGES.cover,
    },
    {
      id: 'slide-2',
      type: 'counter',
      title: 'Our Beautiful Days Together',
      subtitle: 'Counting every single blessing',
      description: 'We have been building our quiet paradise daily. Every moment we share becomes a cherished page in our book of life.',
      image: PRESET_IMAGES.polaroid,
    },
    {
      id: 'slide-3',
      type: 'memory',
      title: 'The Rain & Warm Cocoa',
      subtitle: 'Remember our little escape?',
      description: 'We sat at that tiny yellow table laughing at how wet we got from the sudden shower. Hand in hand, watching steam rise from our cups, I knew right there that my home would always be with you.',
      date: 'Oct 14, 2024',
      image: PRESET_IMAGES.couple,
    },
    {
      id: 'slide-4',
      type: 'quiz',
      title: 'A Cute Little Checkup',
      subtitle: 'Do you know my heart?',
      description: 'I hold onto everything about us, big and small. Let me ask you: What is my absolute favorite thing about you?',
      quizQuestion: 'Select your answer:',
      quizAnswers: [
        'The magical light in your gorgeous eyes',
        'How warm and safe your hand feels in mine',
        'Your kind heart and brilliant sweet mind',
        'All of the above (and a million more!)'
      ],
      correctAnswerIndex: 3,
      successMessage: 'A thousand times correct! Every single part of you makes my world shine. ❤️',
      image: PRESET_IMAGES.polaroid,
    },
    {
      id: 'slide-5',
      type: 'letter',
      title: 'My Heartsong Letter',
      subtitle: 'A love note from me to you',
      description: 'Tap on the letter cover below to slip out my hand-written note...',
      letterBody: 'My dearest,\n\nI want you to know how deeply and unconditionally you are adored. You are my calm in a busy storm, my silly midnight laughter, and my favorite reason to look forward to tomorrow.\n\nThank you for loving me as I am, for sharing your hopes, and for filling my life with your radiant light. Every page of our story makes me fall in love with you all over again.\n\nForever and always yours,\nJoshua',
      image: PRESET_IMAGES.cover,
    },
    {
      id: 'slide-6',
      type: 'ending',
      title: 'Write Our Next Chapter',
      subtitle: 'The journey continues...',
      description: 'Will you go on another cute date with me this weekend? (Warning: the negative response option seems to have a gravity of its own!)',
      image: PRESET_IMAGES.couple,
    }
  ],
};

/**
 * Encodes the configuration object into a shortened base64 string for URL sharing
 */
export function encodeConfig(config: JournalConfig): string {
  try {
    const jsonStr = JSON.stringify(config);
    // Convert to Base64 (supporting unicode safely)
    const encoder = new TextEncoder();
    const data = encoder.encode(jsonStr);
    let binStr = '';
    for (let i = 0; i < data.length; i++) {
      binStr += String.fromCharCode(data[i]);
    }
    return btoa(binStr);
  } catch (err) {
    console.error('Failed to encode love story config:', err);
    return '';
  }
}

/**
 * Decodes the base64 string from the URL hash into the configuration object
 */
export function decodeConfig(hashStr: string): JournalConfig | null {
  if (!hashStr || hashStr.length < 5) return null;
  try {
    const decodedBin = atob(hashStr);
    const uint8Array = new Uint8Array(decodedBin.length);
    for (let i = 0; i < decodedBin.length; i++) {
      uint8Array[i] = decodedBin.charCodeAt(i);
    }
    const decoder = new TextDecoder();
    const jsonStr = decoder.decode(uint8Array);
    const parsed = JSON.parse(jsonStr) as JournalConfig;
    
    // Quick validation of shape
    if (parsed && typeof parsed.partnerName === 'string' && Array.isArray(parsed.slides)) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.warn('Failed to decode love story config from URL. Using default.');
    return null;
  }
}
