// 共用工具函數

// 頁面導航
function navigateTo(page) {
  state.currentPage = page;
  state.error = '';
  render();
}

// 計算家長給予的總愛心數
function calculateParentHearts(evaluation) {
  if (!evaluation) return 0;
  
  let total = 0;
  const categories = ['communication', 'activity', 'routine', 'relationship'];
  
  categories.forEach(category => {
    for (let i = 1; i <= 5; i++) {
      if (evaluation[`${category}_${i}`]) {
        total++;
      }
    }
  });
  
  return total;
}

// 切換留言顯示
function toggleComment(commentId) {
  const element = document.getElementById(`comment-${commentId}`);
  if (element) {
    element.classList.toggle('hidden');
  }
}

// 管理員選擇托育人員
function selectProviderForAdmin(providerId) {
  state.selectedProviderForAdmin = providerId;
  fetchProviderDetailForAdmin(providerId);
  navigateTo('admin-provider-detail');
}

// 獲取最新消息
async function fetchNews() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/news?select=*&order=published_date.desc`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );
    
    if (response.ok) {
      const newsData = await response.json();
      
      // 分類最新消息和政策宣導
      const latestNews = newsData.filter(n => n.category === '最新消息');
      const policies = newsData.filter(n => n.category === '政策宣導');
      
      // 更新 DOM
      const newsContainer = document.getElementById('news-container');
      const policyContainer = document.getElementById('policy-container');
      
      if (newsContainer) {
        if (latestNews.length === 0) {
          newsContainer.innerHTML = '<p class="text-gray-500 text-center py-8">目前沒有最新消息</p>';
        } else {
          newsContainer.innerHTML = latestNews.map(news => `
            <div class="border-l-4 border-yellow-400 pl-4 py-2 hover:bg-yellow-50 transition rounded">
              <h4 class="font-semibold text-gray-800 mb-1">${news.title}</h4>
              <p class="text-sm text-gray-600 mb-2">${news.content}</p>
              <p class="text-xs text-gray-400">${new Date(news.published_date).toLocaleDateString('zh-TW')}</p>
            </div>
          `).join('');
        }
      }
      
      if (policyContainer) {
        if (policies.length === 0) {
          policyContainer.innerHTML = '<p class="text-gray-500 text-center py-8">目前沒有政策宣導</p>';
        } else {
          policyContainer.innerHTML = policies.map(news => `
            <div class="border-l-4 border-amber-500 pl-4 py-2 hover:bg-amber-50 transition rounded">
              <h4 class="font-semibold text-gray-800 mb-1">${news.title}</h4>
              <p class="text-sm text-gray-600 mb-2">${news.content}</p>
              <p class="text-xs text-gray-400">${new Date(news.published_date).toLocaleDateString('zh-TW')}</p>
            </div>
          `).join('');
        }
      }
    }
  } catch (error) {
    console.error('獲取消息失敗:', error);
  }
}

// 初始化應用
function init() {
  checkSession();
  render();
}
