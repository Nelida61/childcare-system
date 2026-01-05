// 家長相關函數

// 獲取家長被分配的托育人員列表
async function fetchAssignedProviders() {
  if (!state.user) return;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/parent_provider_assignments?parent_user_id=eq.${state.user.id}&select=provider_id,child_care_providers(*)`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      state.assignedProviders = data.map(item => item.child_care_providers);
      render();
    }
  } catch (error) {
    console.error('獲取托育人員列表失敗:', error);
  }
}

// 獲取評價記錄
async function fetchEvaluation(providerId) {
  if (!state.user) return null;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/evaluations?parent_user_id=eq.${state.user.id}&provider_id=eq.${providerId}`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data[0] || null;
    }
  } catch (error) {
    console.error('獲取評價失敗:', error);
  }
  return null;
}

// 獲取留言記錄
async function fetchComment(providerId) {
  if (!state.user) return null;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/parent_comments?parent_user_id=eq.${state.user.id}&provider_id=eq.${providerId}`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data[0] || null;
    }
  } catch (error) {
    console.error('獲取留言失敗:', error);
  }
  return null;
}

// 獲取托育人員統計（家長查看用）
async function fetchProviderStatsForParent(providerId) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/provider_evaluation_stats?provider_id=eq.${providerId}`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data[0] || null;
    }
  } catch (error) {
    console.error('獲取統計失敗:', error);
  }
  return null;
}

// 選擇托育人員進行評價
async function selectProvider(providerId) {
  state.selectedProvider = state.assignedProviders.find(p => p.id === providerId);
  state.currentEvaluation = await fetchEvaluation(providerId);
  state.currentComment = await fetchComment(providerId);
  state.evaluationStats = await fetchProviderStatsForParent(providerId);
  navigateTo('evaluate-detail');
}

// 儲存評價
async function saveEvaluation(providerId, evaluationData, comment) {
  if (!state.user) return;

  // 確認對話框
  if (!confirm('評價提交後將無法修改，確定要提交嗎？')) {
    return;
  }

  try {
    // 儲存評價
    const evalResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/evaluations`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          parent_user_id: state.user.id,
          provider_id: providerId,
          ...evaluationData
        })
      }
    );

    if (!evalResponse.ok) {
      const error = await evalResponse.json();
      throw new Error(error.message || '評價提交失敗');
    }

    // 如果有留言，儲存留言
    if (comment && comment.trim()) {
      const commentResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/parent_comments`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${state.user.token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            parent_user_id: state.user.id,
            provider_id: providerId,
            comment: comment.trim()
          })
        }
      );

      if (!commentResponse.ok) {
        console.error('留言提交失敗');
      }
    }

    alert('評價提交成功！');
    
    // 重新載入評價資料
    state.currentEvaluation = await fetchEvaluation(providerId);
    state.currentComment = await fetchComment(providerId);
    state.evaluationStats = await fetchProviderStatsForParent(providerId);
    render();

  } catch (error) {
    console.error('提交失敗:', error);
    alert('評價提交失敗：' + error.message);
  }
}

// 渲染家長的托育人員列表頁面
function renderParentProviderList() {
  if (state.assignedProviders.length === 0) {
    return `
      <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-2xl shadow-xl p-12 text-center">
          <p class="text-gray-500 text-lg">目前沒有被分配的托育人員</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl font-bold text-gray-800 mb-8">我的托育人員</h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${state.assignedProviders.map(provider => `
          <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition cursor-pointer"
               onclick="selectProvider('${provider.id}')">
            <div class="bg-gradient-to-r from-yellow-400 to-amber-400 p-6 text-center">
              <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span class="text-5xl">${provider.gender === '男' ? '👨‍🏫' : '👩‍🏫'}</span>
              </div>
              <h3 class="text-2xl font-bold text-white">${provider.name}</h3>
              <p class="text-yellow-100">@${provider.account}</p>
            </div>
            <div class="p-6">
              <button class="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-400 text-white font-bold rounded-lg hover:from-yellow-500 hover:to-amber-500 transition">
                查看 / 評價
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// 渲染評價詳細頁面
function renderEvaluateDetailPage() {
  if (!state.selectedProvider) return '';

  const provider = state.selectedProvider;
  const evaluation = state.currentEvaluation;
  const comment = state.currentComment;
  const hasEvaluated = evaluation !== null;
  const hasCommented = comment !== null;

  return `
    <div class="max-w-4xl mx-auto">
      <button onclick="navigateTo('evaluate')" 
              class="mb-6 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
        ← 返回列表
      </button>

      <div class="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
        <div class="bg-gradient-to-r from-yellow-400 to-amber-400 p-8 text-center">
          <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span class="text-5xl">${provider.gender === '男' ? '👨‍🏫' : '👩‍🏫'}</span>
          </div>
          <h2 class="text-3xl font-bold text-white">${provider.name}</h2>
          <p class="text-yellow-100">@${provider.account}</p>
        </div>

        ${hasEvaluated ? renderEvaluationSectionReadOnly(evaluation) : renderEvaluationSection()}

        <div class="p-8 border-t ${hasCommented ? 'bg-gray-50' : ''}">
          <h3 class="text-xl font-bold text-gray-800 mb-4">文字留言（僅管理員可見）</h3>
          ${hasCommented ? `
            <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p class="text-gray-700">${comment.comment}</p>
              <p class="text-xs text-gray-400 mt-2">已於 ${new Date(comment.created_at).toLocaleString('zh-TW')} 提交</p>
            </div>
          ` : `
            <textarea id="commentInput" 
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none" 
                      rows="4" 
                      placeholder="您可以在此留言給管理員（選填）"></textarea>
          `}
        </div>

        ${!hasEvaluated ? `
          <div class="p-8 bg-gradient-to-r from-yellow-50 to-amber-50 border-t">
            <button onclick="submitEvaluation()" 
                    class="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-400 text-white font-bold text-lg rounded-lg hover:from-yellow-500 hover:to-amber-500 transition shadow-lg">
              提交評價
            </button>
            <p class="text-sm text-gray-600 text-center mt-4">評價提交後將無法修改</p>
          </div>
        ` : ''}
      </div>

      ${state.evaluationStats ? renderProviderStats() : ''}
    </div>
  `;
}

// 渲染評價表單（可編輯）
function renderEvaluationSection() {
  const categories = {
    communication: { title: '一、保親溝通', color: 'blue' },
    activity: { title: '二、托育活動安排', color: 'green' },
    routine: { title: '三、作息安排與生活習慣', color: 'purple' },
    relationship: { title: '四、保親關係', color: 'orange' }
  };

  return `
    <div class="p-8 space-y-8">
      ${Object.entries(categories).map(([key, { title, color }]) => `
        <div>
          <h3 class="text-xl font-bold text-gray-800 mb-4">${title}</h3>
          <div class="space-y-3">
            ${EVALUATION_ITEMS[key].map((item, index) => `
              <label class="flex items-start space-x-3 p-3 rounded-lg hover:bg-${color}-50 cursor-pointer transition">
                <input type="checkbox" 
                       id="${key}_${index + 1}" 
                       class="mt-1 w-5 h-5 text-${color}-600 rounded focus:ring-2 focus:ring-${color}-500">
                <span class="flex-1 text-gray-700">${index + 1}. ${item}</span>
              </label>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// 渲染評價表單（唯讀）
function renderEvaluationSectionReadOnly(evaluation) {
  const categories = {
    communication: { title: '一、保親溝通', color: 'blue' },
    activity: { title: '二、托育活動安排', color: 'green' },
    routine: { title: '三、作息安排與生活習慣', color: 'purple' },
    relationship: { title: '四、保親關係', color: 'orange' }
  };

  return `
    <div class="p-8 space-y-8 bg-gray-50 opacity-75">
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
        您已於 ${new Date(evaluation.created_at).toLocaleString('zh-TW')} 提交評價
      </div>
      ${Object.entries(categories).map(([key, { title, color }]) => `
        <div>
          <h3 class="text-xl font-bold text-gray-800 mb-4">${title}</h3>
          <div class="space-y-3">
            ${EVALUATION_ITEMS[key].map((item, index) => `
              <div class="flex items-start space-x-3 p-3 rounded-lg bg-white">
                <span class="text-2xl">${evaluation[`${key}_${index + 1}`] ? '❤️' : '🤍'}</span>
                <span class="flex-1 text-gray-700">${index + 1}. ${item}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// 渲染托育人員統計
function renderProviderStats() {
  const stats = state.evaluationStats;
  if (!stats) return '';

  return `
    <div class="bg-white rounded-2xl shadow-xl p-8">
      <h3 class="text-2xl font-bold text-gray-800 mb-6">整體統計</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div class="text-center p-4 bg-pink-50 rounded-lg">
          <p class="text-3xl font-bold text-pink-600">${stats.total_hearts}</p>
          <p class="text-sm text-gray-600">總愛心數</p>
        </div>
        <div class="text-center p-4 bg-pink-50 rounded-lg">
          <p class="text-3xl font-bold text-pink-600">${stats.total_parents}</p>
          <p class="text-sm text-gray-600">評價人數</p>
        </div>
        <div class="text-center p-4 bg-blue-50 rounded-lg">
          <p class="text-3xl font-bold text-blue-600">${stats.communication_hearts}</p>
          <p class="text-sm text-gray-600">保親溝通</p>
        </div>
        <div class="text-center p-4 bg-green-50 rounded-lg">
          <p class="text-3xl font-bold text-green-600">${stats.activity_hearts}</p>
          <p class="text-sm text-gray-600">托育活動</p>
        </div>
        <div class="text-center p-4 bg-purple-50 rounded-lg">
          <p class="text-3xl font-bold text-purple-600">${stats.routine_hearts}</p>
          <p class="text-sm text-gray-600">作息習慣</p>
        </div>
        <div class="text-center p-4 bg-orange-50 rounded-lg">
          <p class="text-3xl font-bold text-orange-600">${stats.relationship_hearts}</p>
          <p class="text-sm text-gray-600">保親關係</p>
        </div>
      </div>
    </div>
  `;
}

// 提交評價
function submitEvaluation() {
  if (!state.selectedProvider) return;

  const evaluationData = {};
  const categories = ['communication', 'activity', 'routine', 'relationship'];

  categories.forEach(category => {
    for (let i = 1; i <= 5; i++) {
      const checkbox = document.getElementById(`${category}_${i}`);
      evaluationData[`${category}_${i}`] = checkbox ? checkbox.checked : false;
    }
  });

  const commentInput = document.getElementById('commentInput');
  const comment = commentInput ? commentInput.value : '';

  saveEvaluation(state.selectedProvider.id, evaluationData, comment);
}
