export const PROMOTION_LIST = [
  {
    code: 'NO_PROMO',
    title: 'No Promotion Selected',
    minDeposit: 0,
    bonusRate: 0,
    turnoverX: 0,
    eligibleGames: [],
    maxWithdrawLimit: null,
    usageType: 'none', // or 'optional'
  },

  {
    code: 'PROMO_150_SLOT',
    title: '150% bonus (Slot + Fishing)',
    minDeposit: 1000,
    bonusRate: 1.5,
    turnoverX: 22,
    eligibleGames: ['slot', 'fishing'],
    maxWithdrawLimit: null,
    usageType: 'once', // changed from 'always'
  },

  {
    code: 'PROMO_100_ALL',
    title: '100% bonus (All games)',
    minDeposit: 1000,
    bonusRate: 1,
    turnoverX: 20,
    eligibleGames: ['all'],
    maxWithdrawLimit: null,
    usageType: 'once', // changed from 'always'
  },

  // {
  //   code: 'PROMO_150_LIVE',
  //   title: '150% bonus (Live games)',
  //   minDeposit: 1000,
  //   bonusRate: 1.5,
  //   turnoverX: 25,
  //   eligibleGames: ['live'],
  //   maxWithdrawLimit: null,
  //   usageType: 'once', // changed from 'always'
  // },

  // {
  //   code: 'PROMO_100_SLOT',
  //   title: '100% refund bonus (Slot + Fishing)',
  //   minDeposit: 1000,
  //   bonusRate: 1,
  //   turnoverX: 25,
  //   eligibleGames: ['slot', 'fishing'],
  //   maxWithdrawLimit: null,
  //   usageType: 'once', // ✅ can only be triggered once
  //   refundTrigger: true, // ✅ bonus given only when balance reaches 0
  // },

  {
    code: 'PROMO_300_FIXED',
    title: 'Fixed 300TK bonus on 500TK deposit',
    minDeposit: 500,
    bonusRate: 0, // special case: fixed bonus
    fixedBonus: 300,
    turnoverX: 8,
    eligibleGames: ['all'],
    maxWithdrawLimit: 5000,
    usageType: 'once', // changed from 'always'
  },

  {
    code: 'PROMO_25_DAILY',
    title: '25% reload bonus (daily)',
    minDeposit: 1000,
    bonusRate: 0.25,
    turnoverX: 18,
    eligibleGames: ['slot', 'fishing'],
    maxWithdrawLimit: null,
    usageType: 'daily', // ✅ once per calendar day
    maxBonusCap: 5000, // ✅ max cumulative bonus allowed for this promo
  },

  {
    code: 'PROMO_30_LIVE_ONCE',
    title: '30% reload bonus (Live games)',
    minDeposit: 1000,
    bonusRate: 0.3,
    turnoverX: 18,
    eligibleGames: ['live'],
    maxWithdrawLimit: null,
    usageType: 'always',
    maxBonusCap: 5000, // ✅ max cumulative bonus allowed for this promo
  },
];

export const promotions = [
  {
    id: 1,
    image: "/images/promotions/PROMO_25_DAILY.png",
    title: "২৫% রিলোড বোনাস (প্রতিদিন)",
    buttonText: "আরো",
    description:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.",
    minDeposit: 1000,
    bonusRate: "25%",
    turnover: "18x",
  },
  {
    id: 2,
    image: "/images/promotions/PROMO_30_LIVE_ONCE.png",
    title: "৩০% রিলোড বোনাস (লাইভ গেম)",
    buttonText: "আরো",
    description:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.",
    minDeposit: 1000,
    bonusRate: "30%",
    turnover: "18x",
  },
  {
    id: 3,
    image: "/images/promotions/PROMO_100_ALL.png",
    title: "১০০% বোনাস (সকল খেলা)",
    buttonText: "আরো",
    description:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.",
    minDeposit: 1000,
    bonusRate: "100%",
    turnover: "20x",
  },
   {
    id: 4,
    image: "/images/promotions/PROMO_150_SLOT.png",
    title: "১৫০% বোনাস (স্লট + মাছ ধরা)",
    buttonText: "আরো",
    description:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.",
    minDeposit: 100,
    bonusRate: "150%",
    turnover: "18x",
  },
  {
    id: 5,
    image: "/images/promotions/PROMO_300_FIXED.png",
    title: "৫০০ টাকা জমার উপর স্থির ৩০০ টাকা বোনাস",
    buttonText: "আরো",
    description:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.",
    minDeposit: 500,
    bonusRate: "0%",
    turnover: "8x",
  },
 
  // {
  //   id: 5,
  //   image: "/images/promotions/promo-5.png",
  //   title: "স্পেশাল উইকএন্ড অফার — সীমিত সময়ের জন্য!",
  //   buttonText: "আরো",
  //   description:
  //     "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.",
  //   minDeposit: 500,
  //   bonusRate: "10%",
  //   turnover: "5x",
  // },
  // {
  //   id: 6,
  //   image: "/images/promotions/promo-6.png",
  //   title: "টপ আপ করলে পাচ্ছেন ১০% এক্সট্রা বোনাস।",
  //   buttonText: "আরো",
  //   description:
  //     "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.",
  //   minDeposit: 500,
  //   bonusRate: "10%",
  //   turnover: "5x",
  // },
  // {
  //   id: 7,
  //   image: "/images/promotions/promo-7.png",
  //   title: "মিক্সড বোনাস অফার — প্রতিদিনই কিছু না কিছু জিতুন!",
  //   buttonText: "আরো",
  //   description:
  //     "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.",
  //   minDeposit: 500,
  //   bonusRate: "10%",
  //   turnover: "5x",
  // },
  // {
  //   id: 8,
  //   image: "/images/promotions/promo-8.png",
  //   title: "ক্যাশ রিওয়ার্ড আনলক করুন নির্দিষ্ট কাজ সম্পন্ন করে।",
  //   buttonText: "আরো",
  //   description:
  //     "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.",
  //   minDeposit: 500,
  //   bonusRate: "10%",
  //   turnover: "5x",
  // },
  // {
  //   id: 9,
  //   image: "/images/promotions/promo-9.png",
  //   title: "মাসিক লয়্যালটি রিওয়ার্ড — শুধু আপনাদের জন্য।",
  //   buttonText: "আরো",
  //   description:
  //     "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.",
  //   minDeposit: 500,
  //   bonusRate: "10%",
  //   turnover: "5x",
  // },
  // {
  //   id: 10,
  //   image: "/images/promotions/promo-10.png",
  //   title: "বিশেষ উপলক্ষে পাচ্ছেন মেগা বোনাস!",
  //   buttonText: "আরো",
  //   description:
  //     "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.",
  //   minDeposit: 500,
  //   bonusRate: "10%",
  //   turnover: "5x",
  // },
  // {
  //   id: 11,
  //   image: "/images/promotions/promo-11.png",
  //   title: "দ্রুত উইথড্র পেয়ে যান — ফি ছাড়াই!",
  //   buttonText: "আরো",
  //   description:
  //     "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.",
  //   minDeposit: 500,
  //   bonusRate: "10%",
  //   turnover: "5x",
  // },
  // {
  //   id: 12,
  //   image: "/images/promotions/promo-12.png",
  //   title: "ফ্রি স্পিন ইভেন্ট — জিতে নিন দুর্দান্ত পুরস্কার।",
  //   buttonText: "আরো",
  //   description:
  //     "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.",
  //   minDeposit: 500,
  //   bonusRate: "10%",
  //   turnover: "5x",
  // },
  // {
  //   id: 13,
  //   image: "/images/promotions/promo-13.png",
  //   title: "প্রতিদিন লগইন করলে পাচ্ছেন ডেইলি রিওয়ার্ড।",
  //   buttonText: "আরো",
  //   description:
  //     "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.",
  //   minDeposit: 500,
  //   bonusRate: "10%",
  //   turnover: "5x",
  // },
  // {
  //   id: 14,
  //   image: "/images/promotions/promo-14.png",
  //   title: "সাপ্তাহিক বোনাস মিশন — সম্পন্ন করুন এবং জিতুন!",
  //   buttonText: "আরো",
  //   description:
  //     "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.",
  //   minDeposit: 500,
  //   bonusRate: "10%",
  //   turnover: "5x",
  // },
  // {
  //   id: 15,
  //   image: "/images/promotions/promo-15.png",
  //   title: "নির্দিষ্ট গেম খেললে ক্যাশব্যাক নিশ্চিত!",
  //   buttonText: "আরো",
  //   description:
  //     "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.",
  //   minDeposit: 500,
  //   bonusRate: "10%",
  //   turnover: "5x",
  // },
  // {
  //   id: 16,
  //   image: "/images/promotions/promo-16.png",
  //   title: "সীমিত সময়ের ফ্ল্যাশ সেল — এখনই অংশ নিন!",
  //   buttonText: "আরো",
  //   description:
  //     "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.",
  //   minDeposit: 500,
  //   bonusRate: "10%",
  //   turnover: "5x",
  // },
  // {
  //   id: 17,
  //   image: "/images/promotions/promo-17.png",
  //   title: "প্রতি সপ্তাহে মিস্ট্রি বক্স — খুললেই চমক।",
  //   buttonText: "আরো",
  //   description:
  //     "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.",
  //   minDeposit: 500,
  //   bonusRate: "10%",
  //   turnover: "5x",
  // },
];
