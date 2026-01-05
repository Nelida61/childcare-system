// 認證相關函數

// 檢查 Session
async function checkSession() {
  const storedUser = sessionStorage.getItem('childcare_user');
  if (storedUser) {
    state.user = JSON.parse(storedUser);
    await determineUserRole();
  }
}

// 判斷使用者角色
async function determineUserRole() {
  if (!state.user) return;

  try {
    // 檢查是否為托育人員
    const providerResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/child_care_providers?user_id=eq.${state.user.id}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`
        }
      }
    );

    if (providerResponse.ok) {
      const providerData = await providerResponse.json();
      if (providerData.length > 0) {
        state.userRole = 'provider';
        state.providerData = providerData[0];
        await fetchProviderStats();
        render();
        return;
      }
    }

    // 檢查是否為家長
    const parentResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/parents?user_id=eq.${state.user.id}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`
        }
      }
    );

    if (parentResponse.ok) {
      const parentData = await parentResponse.json();
      if (parentData.length > 0) {
        state.userRole = 'parent';
        state.parentData = parentData[0];
        await fetchAssignedProviders();
        render();
        return;
      }
    }

    // 檢查是否為管理員
    const adminResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/admins?user_id=eq.${state.user.id}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${state.user.token}`
        }
      }
    );

    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      if (adminData.length > 0) {
        state.userRole = 'admin';
        state.adminData = adminData[0];
        await fetchAllProvidersForAdmin();
        render();
        return;
      }
    }

    // 如果都不是，清除登入狀態
    handleLogout();
    
  } catch (error) {
    console.error('判斷角色失敗:', error);
    state.error = '無法判斷使用者角色';
    render();
  }
}

// 登入
async function handleLogin(email, password) {
  // 清除之前的錯誤訊息
  state.error = '';
  
  if (!email || !password) {
    state.error = '請輸入帳號和密碼';
    render();
    return;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.access_token) {
      state.user = {
        id: data.user.id,
        email: data.user.email,
        token: data.access_token
      };
      sessionStorage.setItem('childcare_user', JSON.stringify(state.user));
      
      // 判斷角色並自動跳轉
      await determineUserRole();
      
      // 登入成功後跳轉到首頁（會自動導向對應頁面）
      navigateTo('home');
    } else {
      state.error = '帳號或密碼錯誤';
      render();
    }
  } catch (error) {
    state.error = '登入失敗，請稍後再試';
    render();
  }
}

// 登出
function handleLogout() {
  state.user = null;
  state.userRole = null;
  state.providerData = null;
  state.parentData = null;
  state.adminData = null;
  state.currentPage = 'home';
  sessionStorage.removeItem('childcare_user');
  render();
}
