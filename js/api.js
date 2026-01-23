// API 呼叫函數

// 通用 fetch 函數
async function fetchAPI(endpoint, options = {}) {
  const defaultHeaders = {
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': 'application/json'
  };

  if (state.user && state.user.token) {
    defaultHeaders['Authorization'] = `Bearer ${state.user.token}`;
  }

  const response = await fetch(`${SUPABASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });

  return response;
}

// 獲取最新消息
async function fetchNews() {
  try {
    const response = await fetchAPI('/rest/v1/news?select=*&order=published_date.desc');
    if (response.ok) {
      state.news = await response.json();
      render();
    }
  } catch (error) {
    console.error('獲取消息失敗:', error);
  }
}

// 獲取托育人員資料
async function fetchProviderData() {
  if (!state.user) return;
  
  try {
    const response = await fetchAPI(`/rest/v1/child_care_providers?user_id=eq.${state.user.id}&select=*`);
    if (response.ok) {
      const data = await response.json();
      state.providerData = data[0];
      await fetchEvaluationStats();
      render();
    }
  } catch (error) {
    console.error('獲取資料失敗:', error);
  }
}

// 獲取托育人員的評價統計
async function fetchEvaluationStats() {
  if (!state.providerData) return;
  
  try {
    const response = await fetchAPI(`/rest/v1/provider_evaluation_stats?provider_id=eq.${state.providerData.id}&select=*`);
    if (response.ok) {
      const data = await response.json();
      state.evaluationStats = data[0] || null;
      render();
    }
  } catch (error) {
    console.error('獲取評價統計失敗:', error);
  }
}

// 獲取家長資料
async function fetchParentData() {
  if (!state.user) return;
  
  try {
    const response = await fetchAPI(`/rest/v1/parents?user_id=eq.${state.user.id}&select=*`);
    
    if (response.ok) {
      const parentData = await response.json();
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
    const assignmentRes = await fetchAPI(`/rest/v1/parent_provider_assignments?parent_user_id=eq.${state.user.id}&select=provider_id`);
    
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
    const providerRes = await fetchAPI(`/rest/v1/child_care_providers?id=in.(${providerIds.join(',')})&select=*`);
    
    if (providerRes.ok) {
      const providers = await providerRes.json();
      state.assignedProviders = providers;
      render();
    }
  } catch (error) {
    console.error('獲取分配的托育人員失敗:', error);
    state.assignedProviders = [];
    render();
  }
}

// 獲取評價
async function fetchEvaluation(providerId) {
  if (!state.user) return;
  
  try {
    const response = await fetchAPI(`/rest/v1/evaluations?parent_user_id=eq.${state.user.id}&provider_id=eq.${providerId}&select=*`);
    if (response.ok) {
      const data = await response.json();
      state.currentEvaluation = data[0] || null;
      render();
    }
  } catch (error) {
    console.error('獲取評價失敗:', error);
  }
}

// 獲取留言
async function fetchComment(providerId) {
  if (!state.user) return;
  
  try {
    const response = await fetchAPI(`/rest/v1/parent_comments?parent_user_id=eq.${state.user.id}&provider_id=eq.${providerId}&select=*`);
    if (response.ok) {
      const data = await response.json();
      state.currentComment = data.length > 0 ? data[0] : null;
    }
  } catch (error) {
    console.error('獲取留言失敗:', error);
  }
}

// 儲存評價
async function saveEvaluation(providerId, evaluationData) {
  if (!state.user) return;
  
  if (state.currentEvaluation && state.currentEvaluation.id) {
    alert('您已經提交過評價，無法重複提交或修改');
    return;
  }
  
  if (!confirm('確定要提交評價嗎？\n\n⚠️ 評價提交後將無法修改，請確認所有項目都已正確勾選。')) {
    return;
  }
  
  try {
    const response = await fetchAPI('/rest/v1/evaluations', {
      method: 'POST',
      headers: {
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        ...evaluationData,
        parent_user_id: state.user.id,
        provider_id: providerId
      })
    });

    if (response.ok) {
      const responseData = await response.json();
      if (responseData && responseData.length > 0) {
        state.currentEvaluation = responseData[0];
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        await fetchEvaluation(providerId);
      }
      alert('評價已成功提交！\n\n評價內容已鎖定，無法修改。');
      render();
    } else {
      const errorText = await response.text();
      console.error('評價提交失敗:', errorText);
      if (errorText.includes('duplicate') || errorText.includes('unique') || errorText.includes('Unique')) {
        alert('您已經提交過評價了！');
        await fetchEvaluation(providerId);
        render();
      } else {
        alert('儲存失敗，請稍後再試');
      }
    }
  } catch (error) {
    console.error('儲存評價失敗:', error);
    alert('儲存失敗，請稍後再試');
  }
}

// 儲存留言
async function saveComment(providerId) {
  if (!state.user) return;
  
  if (state.currentComment) {
    alert('您已提交過留言，無法重複提交或修改');
    return;
  }
  
  const commentText = document.getElementById('parentComment').value.trim();
  
  if (!commentText) {
    alert('請輸入留言內容');
    return;
  }
  
  if (!confirm('確定要提交留言嗎？\n\n留言提交後將無法修改或刪除，請確認內容無誤。')) {
    return;
  }
  
  try {
    const response = await fetchAPI('/rest/v1/parent_comments', {
      method: 'POST',
      headers: {
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        parent_user_id: state.user.id,
        provider_id: providerId,
        comment: commentText
      })
    });
    
    if (response.ok) {
      const responseData = await response.json();
      if (responseData && responseData.length > 0) {
        state.currentComment = responseData[0];
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        await fetchComment(providerId);
      }
      alert('留言已成功提交給管理員！\n\n留言內容已鎖定，無法修改。');
      render();
    } else {
      const errorText = await response.text();
      console.error('留言提交失敗:', errorText);
      if (errorText.includes('duplicate') || errorText.includes('unique') || errorText.includes('Unique')) {
        alert('您已經提交過留言了！');
        await fetchComment(providerId);
        render();
      } else {
        alert('提交留言失敗，請稍後再試');
      }
    }
  } catch (error) {
    console.error('儲存留言失敗:', error);
    alert('系統錯誤，請稍後再試');
  }
}

// 獲取管理員資料
async function fetchAdminData() {
  if (!state.user) return;
  
  try {
    const adminRes = await fetchAPI(`/rest/v1/admins?user_id=eq.${state.user.id}&select=*`);
    
    if (adminRes.ok) {
      const adminData = await adminRes.json();
      state.adminData = adminData[0];
    }

    await fetchAllProvidersWithStats();
    render();
  } catch (error) {
    console.error('獲取管理員資料失敗:', error);
  }
}

// 獲取所有托育人員及其統計
async function fetchAllProvidersWithStats() {
  if (!state.user) return;
  
  try {
    const providersRes = await fetchAPI('/rest/v1/child_care_providers?select=*&order=name');
    
    if (!providersRes.ok) return;
    
    const providers = await providersRes.json();
    
    const statsRes = await fetchAPI('/rest/v1/provider_evaluation_stats?select=*');
    
    let stats = [];
    if (statsRes.ok) {
      stats = await statsRes.json();
    }
    
    state.allProviders = providers.map(provider => {
      const stat = stats.find(s => s.provider_id === provider.id);
      return {
        ...provider,
        stats: stat || {
          total_hearts: 0,
          total_parents: 0,
          communication_hearts: 0,
          activity_hearts: 0,
          routine_hearts: 0,
          relationship_hearts: 0
        }
      };
    });
    
    await fetchParentStats();
    await fetchCommentCounts();
  } catch (error) {
    console.error('獲取托育人員統計失敗:', error);
  }
}

// 獲取留言數量
async function fetchCommentCounts() {
  if (!state.user) return;
  
  try {
    const commentsRes = await fetchAPI('/rest/v1/parent_comments?select=provider_id');
    
    if (commentsRes.ok) {
      const comments = await commentsRes.json();
      
      const commentCounts = {};
      comments.forEach(comment => {
        commentCounts[comment.provider_id] = (commentCounts[comment.provider_id] || 0) + 1;
      });
      
      setTimeout(() => {
        state.allProviders.forEach(provider => {
          const count = commentCounts[provider.id] || 0;
          const el = document.getElementById(`comment-count-${provider.id}`);
          if (el) el.textContent = count;
        });
      }, 100);
    }
  } catch (error) {
    console.error('獲取留言數量失敗:', error);
  }
}

// 獲取家長統計
async function fetchParentStats() {
  if (!state.user) return;
  
  try {
    const parentsRes = await fetchAPI('/rest/v1/parents?select=user_id');
    
    let totalParents = 0;
    let evaluatedParents = 0;
    
    if (parentsRes.ok) {
      const parents = await parentsRes.json();
      totalParents = parents.length;
      
      const evaluationsRes = await fetchAPI('/rest/v1/evaluations?select=parent_user_id');
      
      if (evaluationsRes.ok) {
        const evaluations = await evaluationsRes.json();
        const uniqueParents = new Set(evaluations.map(e => e.parent_user_id));
        evaluatedParents = uniqueParents.size;
      }
    }
    
    state.adminStats.totalParents = totalParents;
    state.adminStats.evaluatedParents = evaluatedParents;
    render();
    
  } catch (error) {
    console.error('獲取家長統計失敗:', error);
  }
}

// 獲取特定托育人員的詳細評價
async function fetchProviderDetailForAdmin(providerId) {
  if (!state.user) return;
  
  try {
    const evaluationsRes = await fetchAPI(`/rest/v1/evaluations?provider_id=eq.${providerId}&select=*`);
    
    if (!evaluationsRes.ok) return;
    
    const evaluations = await evaluationsRes.json();
    
    const commentsRes = await fetchAPI(`/rest/v1/parent_comments?provider_id=eq.${providerId}&select=*`);
    
    let comments = [];
    if (commentsRes.ok) {
      comments = await commentsRes.json();
    }
    
    const parentIds = [...new Set([
      ...evaluations.map(e => e.parent_user_id),
      ...comments.map(c => c.parent_user_id)
    ])];
    
    if (parentIds.length > 0) {
      const parentsRes = await fetchAPI(`/rest/v1/parents?user_id=in.(${parentIds.join(',')})&select=*`);
      
      if (parentsRes.ok) {
        const parents = await parentsRes.json();
        
        state.providerEvaluationsDetail = evaluations.map(evaluation => {
          const parent = parents.find(p => p.user_id === evaluation.parent_user_id);
          const comment = comments.find(c => c.parent_user_id === evaluation.parent_user_id);
          return {
            ...evaluation,
            parent_name: parent ? parent.name : '未知家長',
            comment: comment ? comment.comment : null,
            comment_id: comment ? comment.id : null
          };
        });
        
        comments.forEach(comment => {
          const hasEvaluation = evaluations.some(e => e.parent_user_id === comment.parent_user_id);
          if (!hasEvaluation) {
            const parent = parents.find(p => p.user_id === comment.parent_user_id);
            state.providerEvaluationsDetail.push({
              parent_user_id: comment.parent_user_id,
              parent_name: parent ? parent.name : '未知家長',
              comment: comment.comment,
              comment_id: comment.id,
              updated_at: comment.updated_at,
              communication_1: false,
              communication_2: false,
              communication_3: false,
              communication_4: false,
              communication_5: false,
              activity_1: false,
              activity_2: false,
              activity_3: false,
              activity_4: false,
              activity_5: false,
              routine_1: false,
              routine_2: false,
              routine_3: false,
              routine_4: false,
              routine_5: false,
              relationship_1: false,
              relationship_2: false,
              relationship_3: false,
              relationship_4: false,
              relationship_5: false
            });
          }
        });
      }
    } else {
      state.providerEvaluationsDetail = [];
    }
    
    render();
  } catch (error) {
    console.error('獲取評價詳細資料失敗:', error);
  }
}
