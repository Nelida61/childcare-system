// Supabase 設定
const SUPABASE_URL = 'https://utszytwaabadivssondj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0c3p5dHdhYWJhZGl2c3NvbmRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzQ1MDIsImV4cCI6MjA3NzkxMDUwMn0.Tq2RlCaOegGV7I8jYqgFLHOLpm-bic1RTuIpRzuwqaY';

// 評價項目定義
const EVALUATION_ITEMS = {
  communication: [
    { key: 'communication_1', text: '清楚表達托育理念及托育內容' },
    { key: 'communication_2', text: '主動分享幼兒生活與成長狀況' },
    { key: 'communication_3', text: '當有特殊狀況時(如:生病、受傷),能即時聯絡' },
    { key: 'communication_4', text: '當我有疑問時,托育人員能確實回覆' },
    { key: 'communication_5', text: '與托育人員溝通大致流暢良好' }
  ],
  activity: [
    { key: 'activity_1', text: '提供孩子大致安全的活動環境' },
    { key: 'activity_2', text: '能安排促進孩子發展的活動' },
    { key: 'activity_3', text: '能考量孩子的特質調整活動' },
    { key: 'activity_4', text: '能提供教材、玩具給孩子使用' },
    { key: 'activity_5', text: '提供多元豐富的托育活動' }
  ],
  routine: [
    { key: 'routine_1', text: '協助孩子建立良好作息(如:吃、睡等)' },
    { key: 'routine_2', text: '幫助孩子養成良好生活習慣(如:不挑食、勤洗手等)' },
    { key: 'routine_3', text: '能幫助孩子建立跟其他孩子相處的能力' },
    { key: 'routine_4', text: '依孩子發展情況協助建立自理能力(如:用餐、如廁、收拾)' },
    { key: 'routine_5', text: '當孩子有行為問題時,能妥適輔導(如:咬人、打人)' }
  ],
  relationship: [
    { key: 'relationship_1', text: '能考量我的需求,彈性調整托育內容' },
    { key: 'relationship_2', text: '能共同討論育兒問題、協商處理方式' },
    { key: 'relationship_3', text: '托育人員能尊重我的教育理念與教養方式' },
    { key: 'relationship_4', text: '我感覺與托育人員是夥伴關係' },
    { key: 'relationship_5', text: '我相信孩子受到妥善的照顧' }
  ]
};

// 圖示 SVG
const ICONS = {
  home: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
  user: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
  logout: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>',
  news: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path><path d="M18 14h-8"></path><path d="M15 18h-5"></path><path d="M10 6h8v4h-8V6Z"></path></svg>',
  megaphone: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>',
  heart: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
  star: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>'
};

// 居托中心聯絡資訊
const CENTER_INFO = {
  name: '新北市三重區居家托育服務中心',
  address: '新北市三重區三和路三段81號2樓',
  phone: '02-29760376',
  fax: '02-29760375',
  email: 'baby29760376@gmail.com'
};
