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
  TU_VI = 'TU_VI',
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

export type AIProvider = 'auto' | 'gemini' | 'openrouter';

export interface CustomApiKeys {
  gemini?: string;
  openrouter?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  effectsEnabled: boolean;
  autoOptimizeHardware?: boolean;
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

export type Can = 'Giáp' | 'Ất' | 'Bính' | 'Đinh' | 'Mậu' | 'Kỷ' | 'Canh' | 'Tân' | 'Nhâm' | 'Quý';
export type Chi = 'Tý' | 'Sửu' | 'Dần' | 'Mão' | 'Thìn' | 'Tỵ' | 'Ngọ' | 'Mùi' | 'Thân' | 'Dậu' | 'Tuất' | 'Hợi';
export type NguHanh = 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';

export type CungChuc =
  | 'Mệnh'
  | 'Phụ Mẫu'
  | 'Phúc Đức'
  | 'Điền Trạch'
  | 'Quan Lộc'
  | 'Nô Bộc'
  | 'Thiên Di'
  | 'Tật Ách'
  | 'Tài Bạch'
  | 'Tử Tức'
  | 'Phu Thê'
  | 'Huynh Đệ';

export interface SaoTuVi {
  name: string;
  type: 'chinh-tinh' | 'cat-tinh' | 'hung-tinh' | 'hoa-tinh' | 'luu-tinh';
  status?: 'Miếu' | 'Vượng' | 'Đắc' | 'Bình' | 'Hãm';
  element: NguHanh;
  meaning?: string;
  tuHoa?: 'Hóa Lộc' | 'Hóa Quyền' | 'Hóa Khoa' | 'Hóa Kỵ';
  isLuu?: boolean;
}

export interface CungLaSo {
  chi: Chi;
  can: Can;
  canChiShort: string; // e.g. "K.Tỵ", "C.Ngọ", "T.Mùi"
  amDuongSign: '+' | '-';
  cungChuc: CungChuc;
  isThan: boolean;
  daiHan: number;
  tieuHan?: string;
  vongTrangSinh?: string;
  nguyetHan?: number; // Tháng 1 -> 12
  chinhTinh: SaoTuVi[];
  phuTinh: SaoTuVi[];
  catTinhList: SaoTuVi[];
  hungTinhList: SaoTuVi[];
  nguHanhCung: NguHanh;
  isTuan?: boolean;
  isTriet?: boolean;
  tamHop?: Chi[];
  xungChieu?: Chi;
  yNghia?: string;
}

export interface LaSoTuViData {
  chuSo: {
    fullName: string;
    gender: string;
    amDuongNamNu: string;
    solarDate: string;
    lunarDateStr: string;
    lunarDay: number;
    lunarMonth: number;
    lunarYear: number;
    isLeapMonth: boolean;
    calendarType?: 'solar' | 'lunar';
    tietKhi?: string;
    noiSinh?: string;
    selectedFocus?: string;
    selectedTopics?: string[];
    canhGio: string;
    canhGioTime: string;
    birthTimeStr: string;
    yearCanChi: string;
    monthCanChi: string;
    dayCanChi: string;
    hourCanChi: string;
    banMenhNapAm: string;
    banMenhElement: NguHanh;
    cuc: string;
    cucNumber: number;
    menhCungChi: Chi;
    thanCungChi: Chi;
    chuMenh: string;
    chuThan: string;
    canLuongChi: string;
    cungLaiNhan: string;
    thanCu: string;
    tuanKhong: Chi[];
    trietKhong: Chi[];
    tuongQuanMenhCuc: string;
    viewingYear: number;
    viewingYearCanChi: string;
  };
  cungList: CungLaSo[];
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
  tuViData?: LaSoTuViData;
}
