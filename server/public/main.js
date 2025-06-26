// main.js
const plans = {
  daily: { name: "daily", amount: 4 },
  weekly: { name: "weekly", amount: 25 },
  monthly: { name: "monthly", amount: 100 }
};

let selectedPlan = null;

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
