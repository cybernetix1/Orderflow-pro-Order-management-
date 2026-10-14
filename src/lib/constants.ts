export const CAKE_PRICES: Record<number, Record<number, { 'Buttercream': number; 'Whipped Cream': number }>> = {
  7: {
    1: { 'Buttercream': 16000, 'Whipped Cream': 20000 },
    2: { 'Buttercream': 30000, 'Whipped Cream': 38000 },
    3: { 'Buttercream': 44000, 'Whipped Cream': 56000 },
  },
  8: {
    1: { 'Buttercream': 20000, 'Whipped Cream': 25000 },
    2: { 'Buttercream': 38000, 'Whipped Cream': 48000 },
    3: { 'Buttercream': 56000, 'Whipped Cream': 71000 },
  },
  9: {
    1: { 'Buttercream': 24000, 'Whipped Cream': 30000 },
    2: { 'Buttercream': 46000, 'Whipped Cream': 58000 },
    3: { 'Buttercream': 68000, 'Whipped Cream': 87000 },
  },
  10: {
    1: { 'Buttercream': 30000, 'Whipped Cream': 37000 },
    2: { 'Buttercream': 58000, 'Whipped Cream': 72000 },
    3: { 'Buttercream': 86000, 'Whipped Cream': 107000 },
  },
  11: {
    1: { 'Buttercream': 38000, 'Whipped Cream': 42000 },
    2: { 'Buttercream': 72000, 'Whipped Cream': 82000 },
    3: { 'Buttercream': 102000, 'Whipped Cream': 122000 },
  },
  12: {
    1: { 'Buttercream': 47000, 'Whipped Cream': 52000 },
    2: { 'Buttercream': 92000, 'Whipped Cream': 102000 },
    3: { 'Buttercream': 132000, 'Whipped Cream': 152000 },
  },
};

export const SMALL_CHOPS_PRICES: Record<string, { price: number; commission: number }> = {
  'Just Me Package': { price: 2550, commission: 400 },
  'Just Me Chicken Package': { price: 2950, commission: 200 },
  'Yummy Combo 1': { price: 4500, commission: 475 },
  'Yummy Combo 2': { price: 5550, commission: 300 },
  'Deluxe Combo': { price: 7550, commission: 500 },
  'Mini Platter': { price: 19000, commission: 1000 },
  'Midi Platter': { price: 28000, commission: 1500 },
  'Maxi Platter': { price: 32000, commission: 2000 },
  'Special Platter': { price: 44000, commission: 2000 },
  'VVIP Platter': { price: 55500, commission: 2750 },
};

export const CAKE_SIZES = [7, 8, 9, 10, 11, 12];
export const CAKE_LAYERS = [1, 2, 3];
export const FROSTING_TYPES = ['Buttercream', 'Whipped Cream'] as const;
export const DELIVERY_TYPES = ['Room Delivery', 'Pickup', 'Delivery Pickup', 'Wrong Delivery'] as const;
export const PAYMENT_STATUSES = ['Pending', 'Partial', 'Paid'] as const;
export const ORDER_STATUSES = ['Pending', 'In Progress', 'Completed', 'Delivered'] as const;
export const CAKE_FLAVORS = ['Vanilla', 'Chocolate', 'Red Velvet', 'Strawberry', 'Carrot', 'Coconut', 'Marble'];

export const DELIVERY_COSTS: Record<string, number> = {
  'Pickup': 1000,
  'Room Delivery': 1500,
  'Delivery Pickup': 1000,
  'Wrong Delivery': 1500,
};

export const DELIVERY_COMMISSIONS: Record<string, number> = {
  'Pickup': 500,
  'Room Delivery': 750,
  'Delivery Pickup': 500,
  'Wrong Delivery': 750,
};

export const ENCOURAGING_MESSAGES = [
  "You're doing amazing, Princess! 🎀",
  "Don't give up, your hard work is paying off! ✨",
  "The world needs your magic! 🪄",
  "Every order is a step toward your dreams! 🍰",
  "You are stronger than you think! 💪",
  "Keep shining, you're a star! 🌟",
  "Success looks good on you! 👑",
  "Take a deep breath, you've got this! 🌬️",
  "Your business is blooming! 🌸",
  "Believe in yourself as much as I believe in you! 💖",
  "You're making life sweeter, one cake at a time! 🧁",
  "Don't quit now, the best is yet to come! 🌈",
  "You are a boss babe! 💼",
  "Your creativity has no limits! 🎨",
  "Stay focused and stay fabulous! 💅",
  "You're turning your dreams into reality! ☁️",
  "A little progress each day adds up to big results! 📈",
  "You're the CEO of your own happiness! 😊",
  "Keep going, you're doing beautiful things! 🌺",
  "You are unstoppable! 🚀",
  "Your dedication is truly inspiring! 🙌",
  "Remember why you started, you're almost there! 🏁",
  "You're a diamond, they can't break you! 💎",
  "Handle business like the queen you are! 🏰",
  "Mistakes are just lessons in disguise! 📖",
  "Your passion is your power! 🔥",
  "Keep that crown straight, Princess! 👸",
  "The hustle is hard, but the reward is sweet! 🍬",
  "You're creating a masterpiece! 🖼️",
  "One day at a time, Princess! 🗓️",
  "You are loved and appreciated! ❤️",
  "Stay positive and keep baking! 🍰",
  "Your energy is contagious! ⚡",
  "You're a natural leader! 🗣️",
  "Don't let anything dim your glow! 💡",
  "You're a goal getter! 🎯",
  "Beautiful things take time to grow! 🌱",
  "You are worth the effort! 💸",
  "Your future self will thank you! 🕰️",
  "Keep reaching for the moon! 🌙",
  "You're a spark of light! ✨",
  "Spread your wings and fly! 🦋",
  "You're making an impact! 🌍",
  "Keep your head up and your heart open! 💓",
  "You are unique and wonderful! 🦄",
  "The struggle is part of the story! 📚",
  "Your potential is endless! ♾️",
  "Be your own kind of beautiful! 🌷",
  "You're a warrior in a dress! ⚔️",
  "The sun always shines after the rain! ☀️",
  "You're a masterpiece in progress! 🎨",
  "Keep your standards high and your bows pink! 🎀",
  "You're making magic happen! ✨",
  "Believe in your inner magic! 🪄",
  "Every small win is a big victory! 🏆",
  "You are a visionary! 👁️",
  "Keep your heart light and your mind bright! 💡",
  "You're the author of your own story! ✍️",
  "Stay true to your beautiful self! 💖",
  "You're a force of nature! 🌬️",
  "The best is yet to come, Princess! 👑",
  "You're doing better than you realize! 🌈"
];
