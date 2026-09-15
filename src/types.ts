export enum Suit {
  MAJOR_ARCANA = 'Major Arcana',
  WANDS = 'Wands',
  CUPS = 'Cups',
  SWORDS = 'Swords',
  PENTACLES = 'Pentacles',
  // Playing Card Suits
  HEARTS = 'Hearts',
  DIAMONDS = 'Diamonds',
  CLUBS = 'Clubs',
  SPADES = 'Spades',
}

export enum DeckType {
  TAROT = 'TAROT',
  PLAYING_CARDS = 'PLAYING_CARDS',
}

export type TarotDeckStyle = 'rider-waite' | 'marseille' | 'sola-busca';

export interface TarotCard {
  id: string;
  name: string;
  suit: Suit;
  value: string;
  image: string;
  imageKrates?: string;
  imageMarseille?: string;
  imageSolaBusca?: string;
  arcana?: 'major' | 'minor';
  element?: string;
  planet?: string;
  zodiac?: string;
  yesNo?: string;
  yesNoReversed?: string;
  keywordsUpright?: string[];
  keywordsReversed?: string[];
  meaningUpright: string;
  meaningReversed: string;
  description: string;
  love?: string;
  loveReversed?: string;
  career?: string;
  careerReversed?: string;
  spiritual?: string;
  spiritualReversed?: string;
}

export enum SpreadType {
  ONE_CARD = 'ONE_CARD',
  THREE_CARDS = 'THREE_CARDS',
  CELTIC_CROSS = 'CELTIC_CROSS',
}

export enum ReadingTheme {
  LOVE = 'LOVE',
  STUDY = 'STUDY',
  CAREER = 'CAREER',
  OVERVIEW = 'OVERVIEW',
}

export interface UserInfo {
  fullName: string;
  gender?: string; // Nam / Nữ / Khác
  birthDate?: string; // dd/mm/yyyy
  birthYear?: string; // fallback or derived year
  birthTime?: string; // e.g. "08:30" or "08:30 AM" (optional)
  request?: string;
}

export type AIProvider = 'auto' | 'gemini' | 'deepseek' | 'groq' | 'openai' | 'openrouter';

export interface CustomApiKeys {
  gemini?: string;
  deepseek?: string;
  groq?: string;
  openai?: string;
  openrouter?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  effectsEnabled: boolean;
  soundEnabled: boolean;
  aiProvider: AIProvider;
  aiModel?: string;
  allowFallback?: boolean;
  customKeys: CustomApiKeys;
  tarotDeckStyle?: TarotDeckStyle;
}

export interface SystemSettings {
  announcement: string;
  announcementActive: boolean;
  globalAiProvider: AIProvider;
  globalAiModel?: string;
  aiProviderPriority?: AIProvider[];
  allowFallback?: boolean;
  enableGuestReadings: boolean;
  enableClarificationCards: boolean;
  enableCosmicEffects: boolean;
  maxGuestReadingsPerDay: number;
  enabledAiProviders?: Partial<Record<AIProvider, boolean>>;
  enabledDeckTypes?: Partial<Record<DeckType, boolean>>;
  enabledTarotStyles?: Partial<Record<TarotDeckStyle, boolean>>;
  customSystemPrompt?: string;
  systemApiKeys?: CustomApiKeys;
  adminEmails?: string[];
  updatedAt?: string;
  updatedBy?: string;
}

export interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
  positionName?: string;
}

export interface FollowUpMessage {
  id: string;
  question: string;
  answer: string;
  timestamp: number;
  newCards?: DrawnCard[];
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  role?: 'admin' | 'user';
  isAdmin?: boolean;
  assignedProvider?: string;
  assignedModel?: string;
  createdAt?: string;
}

export interface ReadingResult {
  id: string;
  userId: string;
  timestamp: number;
  question: string;
  theme: ReadingTheme;
  spreadType: SpreadType;
  deckType: DeckType;
  userInfo: UserInfo;
  drawnCards: DrawnCard[];
  aiInterpretation?: string;
  followUps?: FollowUpMessage[];
}
