// 管理員相關函數

// 獲取所有托育人員（管理員用）
async function fetchAllProvidersForAdmin() {
  if (!state.user) return;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/child_care_providers?select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`
        }
      }
    );

    if (response.ok) {
      state.allProviders = await response.json();
      await fetchAdminStats();
      await fetchCommentCounts();
      render();
    }
  } catch (error) {
    console.error('獲取托育人員列表失敗:', error);
  }
}

// 獲取管理員統計資料
async function fetchAdminStats() {
  if (!state.user) return;

  try {
    // 獲取總家長數
    const parentsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/parents?select=id`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`
        }
      }
    );

    if (parentsResponse.ok) {
      const parents = await parentsResponse.json();
      state.adminStats.totalParents = parents.length;
    }

    // 獲取已評價的家長數
    const evaluationsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/evaluations?select=parent_user_id`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`
        }
      }
    );

    if (evaluationsResponse.ok) {
      const evaluations = await evaluationsResponse.json();
      const uniqueParents = new Set(evaluations.map(e => e.parent_user_id));
      state.adminStats.evaluatedParents = uniqueParents.size;
    }

    // 獲取統計資料
    const statsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/provider_evaluation_stats?select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`
        }
      }
    );

    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      state.allProviders = state.allProviders.map(provider => {
        const providerStats = stats.find(s => s.provider_id === provider.id);
        return {
          ...provider,
          stats: providerStats || {
            total_hearts: 0,
            total_parents: 0,
            communication_hearts: 0,
            activity_hearts: 0,
            routine_hearts: 0,
            relationship_hearts: 0
          }
        };
      });
    }
  } catch (error) {
    console.error('獲取統計失敗:', error);
  }
}

// 獲取留言數量
async function fetchCommentCounts() {
  if (!state.user) return;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/parent_comments?select=provider_id`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`
        }
      }
    );

    if (response.ok) {
      const comments = await response.json();
      const commentCounts = {};
      
      comments.forEach(comment => {
        commentCounts[comment.provider_id] = (commentCounts[comment.provider_id] || 0) + 1;
      });

      state.allProviders = state.allProviders.map(provider => ({
        ...provider,
        commentCount: commentCounts[provider.id] || 0
      }));
    }
  } catch (error) {
    console.error('獲取留言數量失敗:', error);
  }
}

// 獲取托育人員詳細資料（管理員用）
async function fetchProviderDetailForAdmin(providerId) {
  if (!state.user) return;

  try {
    // 獲取所有評價明細
    const evaluationsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/evaluations?provider_id=eq.${providerId}&select=*,parents(name)`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`
        }
      }
    );

    if (evaluationsResponse.ok) {
      state.providerEvaluationsDetail = await evaluationsResponse.json();
    }

    // 獲取所有留言
    const commentsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/parent_comments?provider_id=eq.${providerId}&select=*,parents(name)`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`
        }
      }
    );

    if (commentsResponse.ok) {
      state.providerComments = await commentsResponse.json();
    }

    render();
  } catch (error) {
    console.error('獲取詳細資料失敗:', error);
  }
}

// 渲染管理員總覽頁面
function renderAdminDashboard() {
  return `
    <div class="max-w-7xl mx-auto">
      <h2 class="text-3xl font-bold text-gray-800 mb-8">管理總覽</h2>

      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <h3 class="text-lg font-semibold mb-2">托育人員總數</h3>
          <p class="text-5xl font-bold">${state.allProviders.length}</p>
        </div>
        <div class="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-xl p-8 text-white">
          <h3 class="text-lg font-semibold mb-2">家長總數</h3>
          <p class="text-5xl font-bold">${state.adminStats.totalParents}</p>
        </div>
        <div class="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
          <h3 class="text-lg font-semibold mb-2">已評價家長數</h3>
          <p class="text-5xl font-bold">${state.adminStats.evaluatedParents}</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="bg-gradient-to-r from-purple-400 to-purple-600 px-8 py-6">
          <h3 class="text-2xl font-bold text-white">托育人員列表</h3>
        </div>
        <div class="p-8">
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${state.allProviders.map(provider => `
              <div class="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-400 hover:shadow-lg transition cursor-pointer"
                   onclick="selectProviderForAdmin('${provider.id}')">
                <div class="flex items-center mb-4">
                  <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <span class="text-3xl">${provider.gender === '男' ? '👨‍🏫' : '👩‍🏫'}</span>
                  </div>
                  <div>
                    <h4 class="font-bold text-lg text-gray-800">${provider.name}</h4>
                    <p class="text-sm text-gray-500">@${provider.account}</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div class="bg-pink-50 p-2 rounded">
                    <p class="text-pink-600 font-bold">${provider.stats?.total_hearts || 0}</p>
                    <p class="text-gray-600">總愛心</p>
                  </div>
                  <div class="bg-blue-50 p-2 rounded">
                    <p class="text-blue-600 font-bold">${provider.stats?.total_parents || 0}</p>
                    <p class="text-gray-600">評價數</p>
                  </div>
                  <div class="bg-orange-50 p-2 rounded col-span-2">
                    <p class="text-orange-600 font-bold">${provider.commentCount || 0}</p>
                    <p class="text-gray-600">留言數</p>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

// 渲染托育人員詳細頁面（管理員用）
function renderAdminProviderDetail() {
  const provider = state.allProviders.find(p => p.id === state.selectedProviderForAdmin);
  if (!provider) return '';

  return `
    <div class="max-w-6xl mx-auto">
      <button onclick="navigateTo('admin-dashboard')" 
              class="mb-6 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
        ← 返回總覽
      </button>

      <div class="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
        <div class="bg-gradient-to-r from-purple-400 to-purple-600 p-8 text-center">
          <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span class="text-5xl">${provider.gender === '男' ? '👨‍🏫' : '👩‍🏫'}</span>
          </div>
          <h2 class="text-3xl font-bold text-white">${provider.name}</h2>
          <p class="text-purple-100">@${provider.account}</p>
        </div>

        <div class="p-8">
          <h3 class="text-2xl font-bold text-gray-800 mb-6">整體統計</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div class="text-center p-4 bg-pink-50 rounded-lg">
              <p class="text-3xl font-bold text-pink-600">${provider.stats?.total_hearts || 0}</p>
              <p class="text-sm text-gray-600">總愛心數</p>
            </div>
            <div class="text-center p-4 bg-pink-50 rounded-lg">
              <p class="text-3xl font-bold text-pink-600">${provider.stats?.total_parents || 0}</p>
              <p class="text-sm text-gray-600">評價人數</p>
            </div>
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <p class="text-3xl font-bold text-blue-600">${provider.stats?.communication_hearts || 0}</p>
              <p class="text-sm text-gray-600">保親溝通</p>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <p class="text-3xl font-bold text-green-600">${provider.stats?.activity_hearts || 0}</p>
              <p class="text-sm text-gray-600">托育活動</p>
            </div>
            <div class="text-center p-4 bg-purple-50 rounded-lg">
              <p class="text-3xl font-bold text-purple-600">${provider.stats?.routine_hearts || 0}</p>
              <p class="text-sm text-gray-600">作息習慣</p>
            </div>
            <div class="text-center p-4 bg-orange-50 rounded-lg">
              <p class="text-3xl font-bold text-orange-600">${provider.stats?.relationship_hearts || 0}</p>
              <p class="text-sm text-gray-600">保親關係</p>
            </div>
          </div>

          <h3 class="text-2xl font-bold text-gray-800 mb-6">家長評價明細</h3>
          ${state.providerEvaluationsDetail.length === 0 ? `
            <p class="text-gray-500 text-center py-8">尚無評價記錄</p>
          ` : `
            <div class="space-y-6">
              ${state.providerEvaluationsDetail.map((evaluation, index) => {
                const parentHearts = calculateParentHearts(evaluation);
                const comment = state.providerComments?.find(c => c.parent_user_id === evaluation.parent_user_id);
                
                return `
                  <div class="border-2 border-gray-200 rounded-xl p-6">
                    <div class="flex justify-between items-start mb-4">
                      <div>
                        <h4 class="font-bold text-lg text-gray-800">${evaluation.parents?.name || '家長'}</h4>
                        <p class="text-sm text-gray-500">${new Date(evaluation.created_at).toLocaleString('zh-TW')}</p>
                      </div>
                      <div class="text-right">
                        <p class="text-3xl font-bold text-pink-600">${parentHearts}</p>
                        <p class="text-sm text-gray-600">總愛心</p>
                      </div>
                    </div>
                    
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div class="bg-blue-50 p-3 rounded-lg text-center">
                        <p class="text-xl font-bold text-blue-600">${['communication_1', 'communication_2', 'communication_3', 'communication_4', 'communication_5'].filter(k => evaluation[k]).length}</p>
                        <p class="text-xs text-gray-600">保親溝通</p>
                      </div>
                      <div class="bg-green-50 p-3 rounded-lg text-center">
                        <p class="text-xl font-bold text-green-600">${['activity_1', 'activity_2', 'activity_3', 'activity_4', 'activity_5'].filter(k => evaluation[k]).length}</p>
                        <p class="text-xs text-gray-600">托育活動</p>
                      </div>
                      <div class="bg-purple-50 p-3 rounded-lg text-center">
                        <p class="text-xl font-bold text-purple-600">${['routine_1', 'routine_2', 'routine_3', 'routine_4', 'routine_5'].filter(k => evaluation[k]).length}</p>
                        <p class="text-xs text-gray-600">作息習慣</p>
                      </div>
                      <div class="bg-orange-50 p-3 rounded-lg text-center">
                        <p class="text-xl font-bold text-orange-600">${['relationship_1', 'relationship_2', 'relationship_3', 'relationship_4', 'relationship_5'].filter(k => evaluation[k]).length}</p>
                        <p class="text-xs text-gray-600">保親關係</p>
                      </div>
                    </div>

                    ${comment ? `
                      <button onclick="toggleComment('${index}')" 
                              class="w-full py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition">
                        查看留言
                      </button>
                      <div id="comment-${index}" class="hidden mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <p class="text-gray-700">${comment.comment}</p>
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}
