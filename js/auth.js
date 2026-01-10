// 登入/登出相關函數

// 檢查登入狀態
function checkUser() {
  const storedUser = sessionStorage.getItem('childcare_user');
  if (storedUser) {
    state.user = JSON.parse(storedUser);
    state.userRole = state.user.role;
    if (state.userRole === 'provider') {
      fetchProviderData();
    } else if (state.userRole === 'parent') {
      fetchParentData();
    } else if (state.userRole === 'admin') {
      fetchAdminData();
    }
  }
}

// 登入
async function handleLogin(email, password) {
  state.error = '';
  if (!email || !password) {
    state.error = '請輸入帳號和密碼';
    render();
    return;
  }

  try {
    const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const authData = await authResponse.json();
    
    if (!authData.access_token) {
      state.error = '帳號或密碼錯誤';
      render();
      return;
    }

    const userId = authData.user.id;
    const token = authData.access_token;

    let userRole = await determineUserRole(userId, token);

    if (!userRole) {
      state.error = '此帳號未註冊為托育人員、家長或管理員';
      render();
      return;
    }

    state.user = { 
      id: userId, 
      email: authData.user.email, 
      token: token,
      role: userRole
    };
    state.userRole = userRole;
    sessionStorage.setItem('childcare_user', JSON.stringify(state.user));
    
    if (userRole === 'provider') {
      state.currentPage = 'profile';
      await fetchProviderData();
    } else if (userRole === 'parent') {
      state.currentPage = 'evaluate';
      await fetchParentData();
    } else if (userRole === 'admin') {
      state.currentPage = 'admin-dashboard';
      await fetchAdminData();
    }
    
  } catch (error) {
    console.error('登入錯誤:', error);
    state.error = '登入失敗，請稍後再試';
    render();
  }
}

// 判斷使用者身份
async function determineUserRole(userId, token) {
  // 檢查是否為托育人員
  const providerCheck = await fetch(`${SUPABASE_URL}/rest/v1/child_care_providers?user_id=eq.${userId}&select=id`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (providerCheck.ok) {
    const providerData = await providerCheck.json();
    if (providerData.length > 0) return 'provider';
  }

  // 檢查是否為家長
  const parentCheck = await fetch(`${SUPABASE_URL}/rest/v1/parents?user_id=eq.${userId}&select=id`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (parentCheck.ok) {
    const parentData = await parentCheck.json();
    if (parentData.length > 0) return 'parent';
  }

  // 檢查是否為管理員
  const adminCheck = await fetch(`${SUPABASE_URL}/rest/v1/admins?user_id=eq.${userId}&select=id`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (adminCheck.ok) {
    const adminData = await adminCheck.json();
    if (adminData.length > 0) return 'admin';
  }

  return null;
}

// 登出
function handleLogout() {
  resetState();
  sessionStorage.removeItem('childcare_user');
  render();
}
