// Only frontend logic (no API keys)
const plans = {
  daily: { amount: 4, name: "daily" },
  weekly: { amount: 25, name: "weekly" },
  monthly: { amount: 100, name: "monthly" }
};

let selectedPlan = null;

// ✅ Attach functions to window so HTML onclick="..." can access them
window.selectPlan = function(planType) {
  selectedPlan = plans[planType];
  document.getElementById('emailModal').style.display = 'flex';
};

window.closeModal = function() {
  document.getElementById('emailModal').style.display = 'none';
};

window.closeCredentialsModal = function() {
  document.getElementById('credentialsModal').style.display = 'none';
};
