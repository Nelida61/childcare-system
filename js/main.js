// 主程式進入點

function init() {
  checkUser();
  fetchNews();
  render();
}

// 當 DOM 載入完成後執行初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
