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
  navigateTo('admin-provider-detail');
}

// 初始化應用
function init() {
  checkSession();
  render();
}
