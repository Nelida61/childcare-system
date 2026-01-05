// Supabase 設定
const SUPABASE_URL = 'https://utszytwaabadivssondj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0c3p5dHdhYWJhZGl2c3NvbmRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzQ1MDIsImV4cCI6MjA3NzkxMDUwMn0.Tq2RlCaOegGV7I8jYqgFLHOLpm-bic1RTuIpRzuwqaY';

// 評價項目定義
const EVALUATION_ITEMS = {
  communication: [
    '清楚表達托育理念及托育內容',
    '主動分享幼兒生活與成長狀況',
    '當有特殊狀況時(如:生病、受傷),能即時聯絡',
    '當我有疑問時,托育人員能確實回覆',
    '與托育人員溝通大致流暢良好'
  ],
  activity: [
    '提供孩子大致安全的活動環境',
    '能安排促進孩子發展的活動',
    '能考量孩子的特質調整活動',
    '能提供教材、玩具給孩子使用',
    '提供多元豐富的托育活動'
  ],
  routine: [
    '協助孩子建立良好作息(如:吃、睡等)',
    '幫助孩子養成良好生活習慣(如:不挑食、勤洗手等)',
    '能幫助孩子建立跟其他孩子相處的能力',
    '依孩子發展情況協助建立自理能力(如:用餐、如廁、收拾)',
    '當孩子有行為問題時,能妥適輔導(如:咬人、打人)'
  ],
  relationship: [
    '能考量我的需求,彈性調整托育內容',
    '能共同討論育兒問題、協商處理方式',
    '托育人員能尊重我的教育理念與教養方式',
    '我感覺與托育人員是夥伴關係',
    '我相信孩子受到妥善的照顧'
  ]
};
