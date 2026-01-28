// 全域狀態管理
const state = {
  user: null,
  userRole: null,
  providerData: null,
  parentData: null,
  adminData: null,
  adminStats: {
    totalParents: 0,
    evaluatedParents: 0
  },
  assignedProviders: [],
  allProviders: [],
  selectedProviderForAdmin: null,
  providerEvaluationsDetail: [],
  currentEvaluation: null,
  currentComment: null,
  selectedProvider: null,
  evaluationStats: null,
  news: [],
  selectedNewsId: null, // 🔥 新增這一行
  currentPage: 'home',
  error: ''
};

// 狀態操作函數
function setState(updates) {
  Object.assign(state, updates);
  render();
}

function resetState() {
  state.user = null;
  state.userRole = null;
  state.providerData = null;
  state.parentData = null;
  state.adminData = null;
  state.adminStats = { totalParents: 0, evaluatedParents: 0 };
  state.assignedProviders = [];
  state.allProviders = [];
  state.selectedProviderForAdmin = null;
  state.providerEvaluationsDetail = [];
  state.currentEvaluation = null;
  state.currentComment = null;
  state.selectedProvider = null;
  state.evaluationStats = null;
  state.selectedNewsId = null; // 🔥 新增這一行
  state.currentPage = 'home';
  state.error = '';
}
