import { Suit, TarotCard } from '../types';

const generatePlayingCards = (): TarotCard[] => {
  const suits = [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const cards: TarotCard[] = [];

  const suitNames: Record<string, string> = {
    [Suit.HEARTS]: 'Cơ',
    [Suit.DIAMONDS]: 'Rô',
    [Suit.CLUBS]: 'Chuồn',
    [Suit.SPADES]: 'Bích'
  };

  const suitCodes: Record<string, string> = {
    [Suit.HEARTS]: 'H',
    [Suit.DIAMONDS]: 'D',
    [Suit.CLUBS]: 'C',
    [Suit.SPADES]: 'S'
  };

  const valueNames: Record<string, string> = {
    'J': 'Bồi',
    'Q': 'Đầm',
    'K': 'Già',
    'A': 'Át'
  };

  const valueCodes: Record<string, string> = {
    '10': '0',
    'J': 'J',
    'Q': 'Q',
    'K': 'K',
    'A': 'A'
  };

  suits.forEach((suit) => {
    values.forEach((value) => {
      const id = `${suit.toLowerCase()}-${value.toLowerCase()}`;
      const vName = valueNames[value] || value;
      const sName = suitNames[suit];
      
      const vCode = valueCodes[value] || value;
      const sCode = suitCodes[suit];
      
      cards.push({
        id,
        name: `${vName} ${sName}`,
        suit,
        value,
        // Using real playing card images for authenticity
        image: `https://deckofcardsapi.com/static/img/${vCode}${sCode}.png`,
        meaningUpright: `Lá ${vName} ${sName} đại diện cho năng lượng của bộ ${sName} trong bói toán bài Tây.`,
        meaningReversed: `Lá ${vName} ${sName} (ngược) mang ý nghĩa cảnh báo hoặc trì hoãn trong bộ ${sName}.`,
        description: `Lá bài ${vName} thuộc bộ ${sName}.`
      });
    });
  });

  return cards;
};

export const playingCards: TarotCard[] = generatePlayingCards();
