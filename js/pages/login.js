// 登入頁面渲染

function renderLoginPage() {
  return `
    <div class="max-w-md mx-auto">
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="bg-gradient-to-r from-yellow-400 to-amber-400 px-8 py-6 text-center">
          <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span class="text-4xl">🔐</span>
          </div>
          <h2 class="text-3xl font-bold text-white">登入系統</h2>
          <p class="text-yellow-100 mt-2">請輸入您的帳號密碼</p>
        </div>
        
        <div class="p-8">
          ${state.error ? `
            <div class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              ${state.error}
            </div>
          ` : ''}
          
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">電子郵件</label>
              <input type="email" id="email" placeholder="請輸入電子郵件"
                     class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition">
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">密碼</label>
              <input type="password" id="password" placeholder="請輸入密碼"
                     class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition">
            </div>
            
            <button onclick="handleLogin(document.getElementById('email').value, document.getElementById('password').value)"
                    class="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-400 text-white font-bold rounded-lg hover:from-yellow-500 hover:to-amber-500 transition shadow-lg transform hover:scale-105">
              登入
            </button>
          </div>
          
          <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p class="text-sm text-gray-600 mb-3">
              <strong class="text-yellow-700">測試帳號：</strong>
            </p>
            <div class="text-xs text-gray-600 space-y-1">
              <p><strong>托育人員：</strong> provider1@example.com / password123</p>
              <p><strong>家長：</strong> parent1@example.com / password123</p>
              <p class="text-yellow-700 mt-2">💡 系統會自動判斷您的身份</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
