// 主渲染函數

function navigateTo(page) {
  state.currentPage = page;
  state.error = '';
  state.selectedProvider = null;
  state.currentEvaluation = null;
  render();
}

function render() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    ${renderNavigation()}
    ${renderMainContent()}
    ${renderFooter()}
  `;
}

function renderNavigation() {
  return `
    <nav class="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
              <span class="text-2xl">👶</span>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-white drop-shadow-md">托育人員鼓勵機制試辦計畫</h1>
              <p class="text-xs text-yellow-100">Child Care Provider Incentive Pilot Program</p>
            </div>
          </div>
          
          ${renderNavigationButtons()}
        </div>
      </div>
    </nav>
  `;
}

function renderNavigationButtons() {
  if (!state.user) {
    return `
      <div class="flex items-center space-x-4">
        <button onclick="navigateTo('home')" class="flex items-center space-x-2 px-4 py-2 rounded-lg transition ${state.currentPage === 'home' ? 'bg-white text-yellow-600' : 'text-white hover:bg-yellow-500'}">
          ${ICONS.home}
          <span>首頁</span>
        </button>
        <button onclick="navigateTo('login')" class="px-6 py-2 bg-white text-yellow-600 rounded-lg font-semibold hover:bg-yellow-50 transition shadow-md">
          登入
        </button>
      </div>
    `;
  }

  const buttons = [`
    <button onclick="navigateTo('home')" class="flex items-center space-x-2 px-4 py-2 rounded-lg transition ${state.currentPage === 'home' ? 'bg-white text-yellow-600' : 'text-white hover:bg-yellow-500'}">
      ${ICONS.home}
      <span class="hidden sm:inline">首頁</span>
    </button>
  `];

  if (state.userRole === 'provider') {
    buttons.push(`
      <button onclick="navigateTo('profile')" class="flex items-center space-x-2 px-4 py-2 rounded-lg transition ${state.currentPage === 'profile' ? 'bg-white text-yellow-600' : 'text-white hover:bg-yellow-500'}">
        ${ICONS.user}
        <span class="hidden sm:inline">個人資料</span>
      </button>
    `);
  } else if (state.userRole === 'parent') {
    buttons.push(`
      <button onclick="navigateTo('evaluate')" class="flex items-center space-x-2 px-4 py-2 rounded-lg transition ${state.currentPage.startsWith('evaluate') ? 'bg-white text-yellow-600' : 'text-white hover:bg-yellow-500'}">
        ${ICONS.heart}
        <span class="hidden sm:inline">評價托育人員</span>
      </button>
    `);
  } else if (state.userRole === 'admin') {
    buttons.push(`
      <button onclick="navigateTo('admin-dashboard')" class="flex items-center space-x-2 px-4 py-2 rounded-lg transition ${state.currentPage.startsWith('admin') ? 'bg-white text-yellow-600' : 'text-white hover:bg-yellow-500'}">
        ${ICONS.star}
        <span class="hidden sm:inline">管理總覽</span>
      </button>
    `);
  }

  buttons.push(`
    <button onclick="handleLogout()" class="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
      ${ICONS.logout}
      <span class="hidden sm:inline">登出</span>
    </button>
  `);

  return `<div class="flex items-center space-x-4">${buttons.join('')}</div>`;
}

function renderMainContent() {
  return `
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      ${getPageContent()}
    </main>
  `;
}

function getPageContent() {
  switch (state.currentPage) {
    case 'home':
      return renderHomePage();
    case 'login':
      return renderLoginPage();
    case 'profile':
      return renderProfilePage();
    case 'evaluate':
      return renderEvaluatePage();
    case 'evaluate-detail':
      return renderEvaluateDetailPage();
    case 'admin-dashboard':
      return renderAdminDashboard();
    case 'admin-provider-detail':
      return renderAdminProviderDetail();
    case 'news-detail':
      return renderNewsDetailPage();
    default:
      return renderHomePage();
  }
}

function renderFooter() {
  return `
    <footer class="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 mt-20">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <div class="text-center text-white space-y-2">
          <p class="text-sm font-semibold">© ${CENTER_INFO.name} All Rights Reserved.</p>
          <div class="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs text-yellow-100">
            <span>📍 地址：${CENTER_INFO.address}</span>
            <span>📞 電話：<a href="tel:${CENTER_INFO.phone}" class="hover:text-white underline">${CENTER_INFO.phone}</a></span>
            <span>📠 傳真：${CENTER_INFO.fax}</span>
            <span>📧 電子郵件：<a href="mailto:${CENTER_INFO.email}" class="hover:text-white underline">${CENTER_INFO.email}</a></span>
          </div>
          <div class="mt-3 flex justify-center items-center gap-4">
            <a href="${CENTER_INFO.website}" target="_blank" rel="noopener" class="text-xs text-yellow-100 underline decoration-1 hover:text-white">🌐 中心網站</a>
            <a href="${CENTER_INFO.facebook}" target="_blank" rel="noopener" class="text-xs text-yellow-100 underline decoration-1 hover:text-white">🔵 Facebook</a>
          </div>
          <p class="text-xs mt-3 text-yellow-100">提供專業、安全、溫馨的托育服務</p>
        </div>
      </div>
    </footer>
  `;
}
