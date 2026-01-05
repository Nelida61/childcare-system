// 托育人員相關函數

// 獲取托育人員統計資料
async function fetchProviderStats() {
  if (!state.providerData) return;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/provider_evaluation_stats?provider_id=eq.${state.providerData.id}`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      state.evaluationStats = data[0] || {
        total_hearts: 0,
        total_parents: 0,
        communication_hearts: 0,
        activity_hearts: 0,
        routine_hearts: 0,
        relationship_hearts: 0
      };
      render();
    }
  } catch (error) {
    console.error('獲取統計失敗:', error);
  }
}

// 渲染托育人員個人資料頁面
function renderProviderProfile() {
  if (!state.providerData) return '';

  const stats = state.evaluationStats || {
    total_hearts: 0,
    total_parents: 0,
    communication_hearts: 0,
    activity_hearts: 0,
    routine_hearts: 0,
    relationship_hearts: 0
  };

  return `
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="bg-gradient-to-r from-blue-400 to-indigo-500 px-8 py-12 text-center">
          <div class="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl border-4 border-blue-200">
            <span class="text-6xl">${state.providerData.gender === '男' ? '👨‍🏫' : '👩‍🏫'}</span>
          </div>
          <h2 class="text-4xl font-bold text-white mb-2">${state.providerData.name}</h2>
          <p class="text-blue-100 text-lg">@${state.providerData.account}</p>
        </div>

        <div class="p-8 space-y-6">
          <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
              <p class="text-sm font-semibold text-gray-600 mb-2">性別</p>
              <p class="text-2xl font-bold text-gray-800">${state.providerData.gender}</p>
            </div>

            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
              <p class="text-sm font-semibold text-gray-600 mb-2">帳號</p>
              <p class="text-2xl font-bold text-gray-800">${state.providerData.account}</p>
            </div>
          </div>

          <div class="bg-gradient-to-br from-pink-50 to-red-50 p-6 rounded-xl border-2 border-pink-200">
            <h3 class="text-xl font-bold text-gray-800 mb-4">評價統計</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div class="text-center">
                <p class="text-3xl font-bold text-pink-600">${stats.total_hearts}</p>
                <p class="text-sm text-gray-600">總愛心數</p>
              </div>
              <div class="text-center">
                <p class="text-3xl font-bold text-pink-600">${stats.total_parents}</p>
                <p class="text-sm text-gray-600">評價人數</p>
              </div>
              <div class="text-center">
                <p class="text-3xl font-bold text-blue-600">${stats.communication_hearts}</p>
                <p class="text-sm text-gray-600">保親溝通</p>
              </div>
              <div class="text-center">
                <p class="text-3xl font-bold text-green-600">${stats.activity_hearts}</p>
                <p class="text-sm text-gray-600">托育活動</p>
              </div>
              <div class="text-center">
                <p class="text-3xl font-bold text-purple-600">${stats.routine_hearts}</p>
                <p class="text-sm text-gray-600">作息習慣</p>
              </div>
              <div class="text-center">
                <p class="text-3xl font-bold text-orange-600">${stats.relationship_hearts}</p>
                <p class="text-sm text-gray-600">保親關係</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
