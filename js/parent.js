// 家長相關函數

// 獲取家長資料
async function fetchParentData() {
  if (!state.user) return;
  
  try {
    const parentRes = await fetch(`${SUPABASE_URL}/rest/v1/parents?user_id=eq.${state.user.id}&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${state.user.token}`
      }
    });
    
    if (parentRes.ok) {
      const parentData = await parentRes.json();
      state.parentData = parentData[0];
    }

    await fetchAssignedProviders();
    render();
  } catch (error) {
    console.error('獲取家長資料失敗:', error);
  }
}

// 獲取家長可評價的托育人員
async function fetchAssignedProviders() {
  if (!state.user) return;
  
  try {
    const assignmentUrl = `${SUPABASE_URL}/rest/v1/parent_provider_assignments?parent_user_id=eq.${state.user.id}&select=provider_id`;
    
    const assignmentRes = await fetch(assignmentUrl, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${state.user.token}`
      }
    });
    
    if (!assignmentRes.ok) {
      state.assignedProviders = [];
      render();
      return;
    }
    
    const assignments = await assignmentRes.json();
    
    if (assignments.length === 0) {
      state.assignedProviders = [];
      render();
      return;
    }
    
    const providerIds = assignments.map(a => a.provider_id);
    const providerUrl = `${SUPABASE_URL}/rest/v1/child_care_providers?id=in.(${providerIds.join(',')})&select=*`;
    
    const providerRes = await fetch(providerUrl, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${state.user.token}`
      }
    });
    
    if (providerRes.ok) {
      const providers = await providerRes.json();
      state.assignedProviders = providers;
      render();
    }
  } catch (error) {
    console.error('獲取分配托育人員失敗:', error);
    state.assignedProviders = [];
    render();
  }
}

// 選擇要評價的托育人員
async function selectProvider(provider) {
  state.selectedProvider = provider;
  await fetchEvaluation(provider.id);
  await fetchComment(provider.id);
  state.currentPage = 'evaluate-detail';
  render();
}

// 渲染家長評價頁面（列表）
function renderEvaluatePage() {
  if (!state.user || state.userRole !== 'parent') {
    navigateTo('login');
    return '';
  }

  if (state.assignedProviders.length === 0) {
    return `
      <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-12 text-center">
        <div class="text-6xl mb-4">👶</div>
        <h3 class="text-2xl font-bold text-gray-800 mb-2">尚未分配托育人員</h3>
        <p class="text-gray-600">請聯絡管理員為您分配可評價的托育人員</p>
      </div>
    `;
  }

  return `
    <div class="max-w-5xl mx-auto">
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="bg-gradient-to-r from-yellow-400 to-amber-400 px-8 py-6">
          <h2 class="text-3xl font-bold text-white flex items-center gap-3">
            <span>❤️</span>
            評價托育人員
          </h2>
          <p class="text-yellow-100 mt-2">點選托育人員進行評價</p>
        </div>

        <div class="p-8">
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${state.assignedProviders.map(provider => `
              <div class="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-lg transition cursor-pointer"
                   onclick="(async () => { await selectProvider(${JSON.stringify(provider).replace(/"/g, '&quot;')}); })()">
                <div class="flex flex-col items-center text-center">
                  <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-md">
                    <span class="text-4xl">${provider.gender === '男' ? '👨‍🏫' : '👩‍🏫'}</span>
                  </div>
                  <h3 class="text-xl font-bold text-gray-800 mb-1">${provider.name}</h3>
                  <p class="text-sm text-gray-600 mb-3">${provider.gender}</p>
                  <button class="px-6 py-2 bg-gradient-to-r from-yellow-400 to-amber-400 text-white font-semibold rounded-lg hover:from-yellow-500 hover:to-amber-500 transition">
                    開始評價
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

// 渲染評價詳細頁面
function renderEvaluateDetailPage() {
  if (!state.selectedProvider) {
    navigateTo('evaluate');
    return '';
  }

  const provider = state.selectedProvider;
  const evaluation = state.currentEvaluation || {};
  
  const hasEvaluated = evaluation.id && Object.keys(evaluation).some(key => 
    key.startsWith('communication_') || 
    key.startsWith('activity_') || 
    key.startsWith('routine_') || 
    key.startsWith('relationship_')
  );

  const calculateHearts = (category) => {
    const items = EVALUATION_ITEMS[category];
    let count = 0;
    items.forEach(item => {
      if (evaluation[item.key]) count++;
    });
    return count;
  };

  const communicationHearts = calculateHearts('communication');
  const activityHearts = calculateHearts('activity');
  const routineHearts = calculateHearts('routine');
  const relationshipHearts = calculateHearts('relationship');
  const totalHearts = communicationHearts + activityHearts + routineHearts + relationshipHearts;

  return `
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="bg-gradient-to-r from-yellow-400 to-amber-400 px-8 py-8">
          <button onclick="navigateTo('evaluate')" class="text-white hover:text-yellow-100 mb-4 flex items-center gap-2">
            ← 返回列表
          </button>
          <div class="flex items-center gap-6">
            <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span class="text-5xl">${provider.gender === '男' ? '👨‍🏫' : '👩‍🏫'}</span>
            </div>
            <div>
              <h2 class="text-3xl font-bold text-white mb-2">${provider.name}</h2>
              <p class="text-yellow-100">${hasEvaluated ? '您已完成評價' : '正在評價這位托育人員'}</p>
            </div>
          </div>
        </div>

        ${hasEvaluated ? `
          <div class="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-4 border-b-2 border-green-200">
            <p class="text-green-800 flex items-center gap-2 font-semibold">
              <span>✓</span>
              您已提交評價，評價內容已鎖定無法修改
            </p>
          </div>
        ` : `
          <div class="bg-yellow-50 px-8 py-4 border-b-2 border-yellow-200">
            <p class="text-yellow-800 flex items-center gap-2">
              <span>⚠️</span>
              <strong>請注意：評價只能提交一次，提交後將無法修改，請謹慎填寫。</strong>
            </p>
          </div>
        `}

        ${state.currentEvaluation && hasEvaluated ? `
          <div class="bg-gradient-to-r from-pink-50 to-red-50 px-8 py-6 border-b-2 border-pink-200">
            <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📊</span>
              您給予的評價統計
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div class="bg-white p-4 rounded-lg text-center border-2 border-purple-200">
                <p class="text-sm text-gray-600 mb-1">保親溝通</p>
                <p class="text-2xl font-bold text-purple-500">${communicationHearts}/5</p>
                <p class="text-xs text-gray-500 mt-1">${'❤️'.repeat(communicationHearts)}${'🤍'.repeat(5-communicationHearts)}</p>
              </div>
              <div class="bg-white p-4 rounded-lg text-center border-2 border-green-200">
                <p class="text-sm text-gray-600 mb-1">托育活動</p>
                <p class="text-2xl font-bold text-green-500">${activityHearts}/5</p>
                <p class="text-xs text-gray-500 mt-1">${'❤️'.repeat(activityHearts)}${'🤍'.repeat(5-activityHearts)}</p>
              </div>
              <div class="bg-white p-4 rounded-lg text-center border-2 border-blue-200">
                <p class="text-sm text-gray-600 mb-1">作息習慣</p>
                <p class="text-2xl font-bold text-blue-500">${routineHearts}/5</p>
                <p class="text-xs text-gray-500 mt-1">${'❤️'.repeat(routineHearts)}${'🤍'.repeat(5-routineHearts)}</p>
              </div>
              <div class="bg-white p-4 rounded-lg text-center border-2 border-pink-200">
                <p class="text-sm text-gray-600 mb-1">保親關係</p>
                <p class="text-2xl font-bold text-pink-500">${relationshipHearts}/5</p>
                <p class="text-xs text-gray-500 mt-1">${'❤️'.repeat(relationshipHearts)}${'🤍'.repeat(5-relationshipHearts)}</p>
              </div>
              <div class="bg-gradient-to-br from-red-100 to-pink-100 p-4 rounded-lg text-center border-2 border-red-300">
                <p class="text-sm text-gray-600 mb-1">總愛心數</p>
                <p class="text-3xl font-bold text-red-500">${totalHearts}/20</p>
                <p class="text-xs text-gray-500 mt-1">${Math.round(totalHearts/20*100)}%</p>
              </div>
            </div>
          </div>
        ` : ''}

        <div class="p-8">
          ${hasEvaluated ? `
            <div class="space-y-6 opacity-75">
              ${renderEvaluationSectionReadOnly('一、保親溝通', 'communication', EVALUATION_ITEMS.communication, evaluation)}
              ${renderEvaluationSectionReadOnly('二、托育活動安排', 'activity', EVALUATION_ITEMS.activity, evaluation)}
              ${renderEvaluationSectionReadOnly('三、作息安排與生活習慣', 'routine', EVALUATION_ITEMS.routine, evaluation)}
              ${renderEvaluationSectionReadOnly('四、保親關係', 'relationship', EVALUATION_ITEMS.relationship, evaluation)}
            </div>
            
            <div class="mt-8 text-center py-8 bg-green-50 rounded-xl border-2 border-green-200">
              <div class="text-6xl mb-4">✓</div>
              <p class="text-xl font-bold text-green-700 mb-2">評價已提交</p>
              <p class="text-gray-600">您的評價內容已鎖定，無法修改</p>
            </div>
          ` : `
            <form id="evaluationForm" onsubmit="handleSubmitEvaluation(event, '${provider.id}')">
              ${renderEvaluationSection('一、保親溝通', 'communication', EVALUATION_ITEMS.communication, evaluation)}
              ${renderEvaluationSection('二、托育活動安排', 'activity', EVALUATION_ITEMS.activity, evaluation)}
              ${renderEvaluationSection('三、作息安排與生活習慣', 'routine', EVALUATION_ITEMS.routine, evaluation)}
              ${renderEvaluationSection('四、保親關係', 'relationship', EVALUATION_ITEMS.relationship, evaluation)}

              <div class="mt-8 space-y-4">
                <button type="submit" class="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-400 text-white font-bold text-lg rounded-lg hover:from-yellow-500 hover:to-amber-500 transition shadow-lg">
                  提交評價（僅此一次）
                </button>
                
                <button type="button" onclick="navigateTo('evaluate')" class="w-full px-8 py-4 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition">
                  取消
                </button>
                
                <p class="text-center text-sm text-red-600">
                  ⚠️ 提交後將無法修改，請確認所有評價項目都已正確勾選
                </p>
              </div>
            </form>
          `}

          <!-- 文字留言區塊 -->
          <div class="mt-8 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-200">
            <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span>💬</span>
              給居托中心管理員的文字留言（選填）
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              如果您有任何建議或認為需要改善的地方，可以在此留言給管理員。<br>
              <strong class="text-orange-700">此留言只有居托中心管理人員能看到，托育人員不會看到您的留言內容。</strong>
              ${state.currentComment ? '<br><strong class="text-red-600">留言提交後無法修改，請謹慎填寫。</strong>' : '<br><strong class="text-red-600">⚠️ 留言只能提交一次，提交後無法修改，請謹慎填寫。</strong>'}
            </p>
            
            ${state.currentComment ? `
              <div class="bg-white border-2 border-orange-300 rounded-lg p-4 mb-4">
                <div class="flex items-start gap-2 mb-2">
                  <span class="text-lg">✓</span>
                  <div class="flex-1">
                    <p class="text-sm font-bold text-green-700 mb-2">您已提交留言給管理員：</p>
                    <p class="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">${state.currentComment.comment}</p>
                    <p class="text-xs text-gray-500 mt-2">提交時間：${new Date(state.currentComment.created_at).toLocaleString('zh-TW')}</p>
                  </div>
                </div>
              </div>
              <div class="text-center py-4 bg-green-50 rounded-lg border-2 border-green-200">
                <p class="text-green-700 font-semibold">留言已提交，無法修改</p>
                <p class="text-xs text-gray-600 mt-1">居托中心人員會查看您的留言並進行處理</p>
              </div>
            ` : `
              <textarea id="parentComment" 
                        rows="5" 
                        placeholder="請輸入您的建議或意見..."
                        class="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:border-orange-400 focus:outline-none transition resize-none"></textarea>
              
              <button onclick="saveComment('${provider.id}')" 
                      class="mt-4 w-full py-3 bg-gradient-to-r from-orange-400 to-red-400 text-white font-bold rounded-lg hover:from-orange-500 hover:to-red-500 transition shadow-lg">
                💌 提交留言給管理員（僅此一次）
