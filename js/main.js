// 主初始化函數

function init() {
  checkUser();
  if (!state.user) {
    fetchNews();
  }
  render();
}

// 當頁面載入完成後啟動應用
init();
