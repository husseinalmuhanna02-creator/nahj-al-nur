import { LibraryItem } from '../types';

export const libraryBooks: LibraryItem[] = [
  {
    id: 'alkafi',
    title: "كتاب الكافي",
    author: "الشيخ الكليني",
    category: "كتب",
    subItems: [
      { id: 'alkafi-1', title: "الجزء الأول", url: "https://drive.google.com/file/d/1H_RJ9nKnNBth8OYZKC70Vu9x7gQjVxuV/preview" },
      { id: 'alkafi-2', title: "الجزء الثاني", url: "https://drive.google.com/file/d/1OZPSUI-7KBaT47JQZduH13l2Z0c7SJ2l/preview" },
      { id: 'alkafi-3', title: "الجزء الثالث", url: "https://drive.google.com/file/d/1t-JRysIe4NK4ztFp_pb8HVjoCn94cG49/preview" },
      { id: 'alkafi-4', title: "الجزء الرابع", url: "https://drive.google.com/file/d/1X8k4ms49PB2grSmpI7ivEV4AMqNLs1NB/preview" },
    ]
  },
  {
    id: 'diaa-al-salihin',
    title: "كتاب ضياء الصالحين",
    author: "الشيخ محمد صالح الجوهرجي",
    category: "كتب",
    url: "https://drive.google.com/file/d/1pHLKFYMeoLhqaW0qCe4XoM6jUkWgBhty/preview"
  },
  {
    id: 'mafatih-al-jinan',
    title: "مفاتيح الجنان",
    author: "الشيخ عباس القمي",
    category: "كتب",
    url: "https://drive.google.com/file/d/1VVOd1DMWvpnp-USY4MHCDOC42x0lVp7C/preview"
  },
  {
    id: 'kamel-al-ziyarat',
    title: "كامل الزيارات",
    author: "الشيخ ابن قولويه القمي",
    category: "كتب",
    url: "https://drive.google.com/file/d/1ODT-t9XOiB0AE0iOtC7cgSm2v6KSRvNV/preview"
  }
];
