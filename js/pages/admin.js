// 管理員頁面渲染

function renderAdminDashboard() {
  if (!state.user || state.userRole !== 'admin') {
    navigateTo('login');
    return '';
  }

  if (state.allProviders.length === 0) {
    return `
      <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-12 text-center">
        <div class="animate-spin w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-gray-600">載入中...</p>
      </div>
    `;
  }

  return `
    <div class="max-w-6xl mx-auto">
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 px-8 py-6">
          <h2 class="text-3xl font-bold text-white flex items-center gap-3">
            <span>⭐</span>
            托育人員管理總覽
          </h2>
          <p class="text-purple-100 mt-2">查看所有托育人員的評價統計</p>
        </div>

        <div class="p-8">
          ${renderAdminStats()}
          ${renderProvidersList()}
        </div>
      </div>
    </div>
  `;
}

function renderAdminStats() {
  return `
    <div class="grid md:grid-cols-3 gap-6 mb-8">
      <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 text-center">
        <p class="text-sm font-semibold text-gray-600 mb-2">托育人員總數</p>
        <p class="text-5xl font-bold text-blue-500">${state.allProviders.length}</p>
        <p class="text-xs text-gray-500 mt-2">👥 位托育人員</p>
      </div>
      <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200 text-center">
        <p class="text-sm font-semibold text-gray-600 mb-2">家長總數</p>
        <p class="text-5xl font-bold text-green-500">${state.adminStats.totalParents}</p>
        <p class="text-xs text-gray-500 mt-2">👪 位家長</p>
      </div>
      <div class="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200 text-center">
        <p class="text-sm font-semibold text-gray-600 mb-2">已評價的家長人數</p>
        <p class="text-5xl font-bold text-purple-500">${state.adminStats.evaluatedParents}</p>
        <p class="text-xs text-gray-500 mt-2">✅ 位已給予評價</p>
      </div>
    </div>
  `;
}

function renderProvidersList() {
  return `
    <div class="space-y-4">
      <h3 class="text-xl font-bold text-gray-800 mb-4">托育人員列表</h3>
      ${state.allProviders.map(provider => `
        <div class="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-lg transition cursor-pointer"
             onclick="selectProviderForAdmin(${JSON.stringify(provider).replace(/"/g, '&quot;')})">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
                <span class="text-3xl">${provider.gender === '男' ? '👨‍🏫' : '👩‍🏫'}</span>
              </div>
              <div>
                <h4 class="text-xl font-bold text-gray-800">${provider.name}</h4>
                <p class="text-sm text-gray-600">${provider.gender} · @${provider.account}</p>
              </div>
            </div>
            <div class="flex items-center gap-6">
              <div class="text-center">
                <p class="text-3xl font-bold text-red-500">${provider.stats.total_hearts || 0}</p>
                <p class="text-xs text-gray-500">總愛心</p>
              </div>
              <div class="text-center">
                <p class="text-3xl font-bold text-blue-500">${provider.stats.total_parents || 0}</p>
                <p class="text-xs text-gray-500">評價人數</p>
              </div>
              <div class="text-center">
                <p class="text-3xl font-bold text-orange-500" id="comment-count-${provider.id}">-</p>
                <p class="text-xs text-gray-500">留言</p>
              </div>
              <button class="px-6 py-2 bg-gradient-to-r from-yellow-400 to-amber-400 text-white font-semibold rounded-lg hover:from-yellow-500 hover:to-amber-500 transition">
                查看詳情 →
              </button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

async function selectProviderForAdmin(provider) {
  state.selectedProviderForAdmin = provider;
  await fetchProviderDetailForAdmin(provider.id);
  state.currentPage = 'admin-provider-detail';
  render();
}

function renderAdminProviderDetail() {
  if (!state.selectedProviderForAdmin) {
    navigateTo('admin-dashboard');
    return '';
  }

  const provider = state.selectedProviderForAdmin;
  const stats = provider.stats;

  return `
    <div class="max-w-5xl mx-auto">
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        ${renderAdminProviderHeader(provider)}
        
        <div class="p-8 space-y-8">
          ${renderAdminProviderOverview(stats)}
          ${renderAdminProviderThemeStats(stats)}
          ${renderAdminProviderEvaluations()}
        </div>
      </div>
    </div>
  `;
}

function renderAdminProviderHeader(provider) {
  return `
    <div class="bg-gradient-to-r from-purple-400 to-pink-400 px-8 py-8">
      <button onclick="navigateTo('admin-dashboard')" class="text-white hover:text-purple-100 mb-4 flex items-center gap-2">
        ← 返回總覽
      </button>
      <div class="flex items-center gap-6">
        <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
          <span class="text-5xl">${provider.gender === '男' ? '👨‍🏫' : '👩‍🏫'}</span>
        </div>
        <div>
          <h2 class="text-3xl font-bold text-white mb-2">${provider.name}</h2>
          <p class="text-purple-100">${provider.gender} · @${provider.account}</p>
        </div>
      </div>
    </div>
  `;
}

function renderAdminProviderOverview(stats) {
  return `
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border-2 border-red-200 text-center">
        <p class="text-sm font-semibold text-gray-600 mb-2">總愛心數</p>
        <p class="text-5xl font-bold text-red-500">${stats.total_hearts || 0}</p>
        <p class="text-xs text-gray-500 mt-2">💝 共獲得的肯定</p>
      </div>
      
      <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 text-center">
        <p class="text-sm font-semibold text-gray-600 mb-2">評價人數</p>
        <p class="text-5xl font-bold text-blue-500">${stats.total_parents || 0}</p>
        <p class="text-xs text-gray-500 mt-2">👥 位家長給予評價</p>
      </div>
    </div>
  `;
}

function renderAdminProviderThemeStats(stats) {
  return `
    <div class="bg-gray-50 rounded-xl p-6">
      <h4 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>📊</span>
        四大主題獲得愛心數
      </h4>
      <div class="grid md:grid-cols-2 gap-4">
        <div class="bg-white p-4 rounded-lg border-2 border-purple-200">
          <div class="flex justify-between items-center">
            <span class="font-semibold text-gray-700">一、保親溝通</span>
            <span class="text-2xl font-bold text-purple-500">${stats.communication_hearts || 0}</span>
          </div>
        </div>

        <div class="bg-white p-4 rounded-lg border-2 border-green-200">
          <div class="flex justify-between items-center">
            <span class="font-semibold text-gray-700">二、托育活動安排</span>
            <span class="text-2xl font-bold text-green-500">${stats.activity_hearts || 0}</span>
          </div>
        </div>

        <div class="bg-white p-4 rounded-lg border-2 border-blue-200">
          <div class="flex justify-between items-center">
            <span class="font-semibold text-gray-700">三、作息安排與生活習慣</span>
            <span class="text-2xl font-bold text-blue-500">${stats.routine_hearts || 0}</span>
          </div>
        </div>

        <div class="bg-white p-4 rounded-lg border-2 border-pink-200">
          <div class="flex justify-between items-center">
            <span class="font-semibold text-gray-700">四、保親關係</span>
            <span class="text-2xl font-bold text-pink-500">${stats.relationship_hearts || 0}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderAdminProviderEvaluations() {
  return `
    <div class="bg-white rounded-xl border-2 border-gray-200">
      <div class="bg-gradient-to-r from-yellow-100 to-amber-100 px-6 py-4 border-b-2 border-yellow-200">
        <h4 class="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span>👥</span>
          家長評價明細
        </h4>
      </div>
      
      <div class="p-6">
        ${state.providerEvaluationsDetail.length === 0 ? `
          <div class="text-center py-12">
            <div class="text-6xl mb-4">📋</div>
            <p class="text-gray-500 text-lg">尚未有家長評價</p>
          </div>
        ` : `
          <div class="space-y-6">
            ${state.providerEvaluationsDetail.map(evaluation => renderEvaluationDetail(evaluation)).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

function renderEvaluationDetail(evaluation) {
  const hearts = calculateParentHearts(evaluation);
  const hasComment = evaluation.comment && evaluation.comment.trim() !== '';
  
  return `
    <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow">
            <span class="text-2xl">👤</span>
          </div>
          <div>
            <h5 class="text-lg font-bold text-gray-800">${evaluation.parent_name}</h5>
            <p class="text-xs text-gray-500">評價時間：${new Date(evaluation.updated_at).toLocaleDateString('zh-TW')}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          ${hasComment ? `
            <button onclick="toggleComment('comment-${evaluation.id || evaluation.comment_id}')" 
                    class="px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition flex items-center gap-2">
              💬 查看留言
            </button>
          ` : ''}
          <div class="text-center bg-white px-4 py-2 rounded-lg border-2 border-red-200">
            <p class="text-3xl font-bold text-red-500">${hearts.total}/20</p>
            <p class="text-xs text-gray-500">總愛心</p>
          </div>
        </div>
      </div>
      
      ${hasComment ? `
        <div id="comment-${evaluation.id || evaluation.comment_id}" class="hidden mt-4 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
          <div class="flex items-start gap-2 mb-2">
            <span class="text-lg">💬</span>
            <div class="flex-1">
              <p class="text-sm font-bold text-orange-800 mb-1">家長留言：</p>
              <p class="text-gray-700 whitespace-pre-wrap">${evaluation.comment}</p>
            </div>
          </div>
        </div>
      ` : ''}
      
      ${renderEvaluationDetailItems(evaluation, hearts)}
    </div>
  `;
}

function renderEvaluationDetailItems(evaluation, hearts) {
  return `
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 ${evaluation.comment ? 'mt-4' : ''}">
      <div class="bg-white p-3 rounded-lg text-center border border-purple-200">
        <p class="text-xs text-gray-600 mb-1">保親溝通</p>
        <p class="text-2xl font-bold text-purple-500">${hearts.communication}/5</p>
        <p class="text-xs text-gray-500">${'❤️'.repeat(hearts.communication)}${'🤍'.repeat(5-hearts.communication)}</p>
      </div>
      <div class="bg-white p-3 rounded-lg text-center border border-green-200">
        <p class="text-xs text-gray-600 mb-1">托育活動</p>
        <p class="text-2xl font-bold text-green-500">${hearts.activity}/5</p>
        <p class="text-xs text-gray-500">${'❤️'.repeat(hearts.activity)}${'🤍'.repeat(5-hearts.activity)}</p>
      </div>
      <div class="bg-white p-3 rounded-lg text-center border border-blue-200">
        <p class="text-xs text-gray-600 mb-1">作息習慣</p>
        <p class="text-2xl font-bold text-blue-500">${hearts.routine}/5</p>
        <p class="text-xs text-gray-500">${'❤️'.repeat(hearts.routine)}${'🤍'.repeat(5-hearts.routine)}</p>
      </div>
      <div class="bg-white p-3 rounded-lg text-center border border-pink-200">
        <p class="text-xs text-gray-600 mb-1">保親關係</p>
        <p class="text-2xl font-bold text-pink-500">${hearts.relationship}/5</p>
        <p class="text-xs text-gray-500">${'❤️'.repeat(hearts.relationship)}${'🤍'.repeat(5-hearts.relationship)}</p>
      </div>
    </div>
    
    <!-- 顯示詳細評價項目 -->
    <div class="mt-4 bg-white p-4 rounded-lg border border-gray-200">
      <button onclick="toggleEvaluationItems('items-${evaluation.id || evaluation.comment_id}')" 
              class="w-full text-left font-semibold text-gray-700 hover:text-gray-900 flex items-center justify-between">
        <span>📋 查看詳細評價項目</span>
        <span>▼</span>
      </button>
      <div id="items-${evaluation.id || evaluation.comment_id}" class="hidden mt-4 space-y-4">
        ${renderDetailedEvaluationItems(evaluation)}
      </div>
    </div>
  `;
}

function renderDetailedEvaluationItems(evaluation) {
  return `
    <div>
      <h6 class="font-bold text-purple-700 mb-2">一、保親溝通</h6>
      <div class="space-y-1 text-sm">
        ${EVALUATION_ITEMS.communication.map(item => `
          <div class="flex items-center gap-2">
            <span>${evaluation[item.key] ? '❤️' : '🤍'}</span>
            <span class="${evaluation[item.key] ? 'text-gray-700' : 'text-gray-400'}">${item.text}</span>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div>
      <h6 class="font-bold text-green-700 mb-2">二、托育活動安排</h6>
      <div class="space-y-1 text-sm">
        ${EVALUATION_ITEMS.activity.map(item => `
          <div class="flex items-center gap-2">
            <span>${evaluation[item.key] ? '❤️' : '🤍'}</span>
            <span class="${evaluation[item.key] ? 'text-gray-700' : 'text-gray-400'}">${item.text}</span>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div>
      <h6 class="font-bold text-blue-700 mb-2">三、作息安排與生活習慣</h6>
      <div class="space-y-1 text-sm">
        ${EVALUATION_ITEMS.routine.map(item => `
          <div class="flex items-center gap-2">
            <span>${evaluation[item.key] ? '❤️' : '🤍'}</span>
            <span class="${evaluation[item.key] ? 'text-gray-700' : 'text-gray-400'}">${item.text}</span>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div>
      <h6 class="font-bold text-pink-700 mb-2">四、保親關係</h6>
      <div class="space-y-1 text-sm">
        ${EVALUATION_ITEMS.relationship.map(item => `
          <div class="flex items-center gap-2">
            <span>${evaluation[item.key] ? '❤️' : '🤍'}</span>
            <span class="${evaluation[item.key] ? 'text-gray-700' : 'text-gray-400'}">${item.text}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function toggleComment(commentId) {
  const element = document.getElementById(commentId);
  if (element) {
    element.classList.toggle('hidden');
  }
}

function toggleEvaluationItems(itemsId) {
  const element = document.getElementById(itemsId);
  if (element) {
    element.classList.toggle('hidden');
  }
                                                             }
