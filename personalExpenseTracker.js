document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expense-form');
    const expenseTableBody = document.querySelector('#expense-table tbody');
    const totalSpentSpan = document.getElementById('total-spent');
    const filterCategorySelect = document.getElementById('filter-category');
    const budgetLimitInput = document.getElementById('budget-limit');
    const budgetAlertDiv = document.getElementById('budget-alert');

    // 1. Load data from localStorage immediately
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    let budgetLimit = parseFloat(localStorage.getItem('budgetLimit')) || 0;

    const formatter = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
    });

    // 2. Initial Setup: Fill the budget input if a value exists
    function init() {
        if (budgetLimit > 0) {
            budgetLimitInput.value = budgetLimit;
        }
        renderExpenses();
    }

    function renderExpenses() {
        const selectedCategory = filterCategorySelect.value;
        
        // Filter logic
        const filtered = selectedCategory === 'All' 
            ? expenses 
            : expenses.filter(exp => exp.category === selectedCategory);

        expenseTableBody.innerHTML = '';
        let filteredTotal = 0;

        filtered.forEach((expense) => {
            // Find true index in the master 'expenses' array
            const mainIndex = expenses.indexOf(expense);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${expense.name}</td>
                <td>${formatter.format(expense.amount)}</td>
                <td><span class="badge bg-${expense.category}">${expense.category}</span></td>
                <td>${expense.date}</td>
                <td><button class="delete-btn" onclick="deleteExpense(${mainIndex})">Delete</button></td>
            `;
            expenseTableBody.appendChild(row);
            filteredTotal += expense.amount;
        });

        totalSpentSpan.textContent = formatter.format(filteredTotal);
        checkBudgetStatus();
    }

    function checkBudgetStatus() {
        // Calculate grand total of ALL expenses regardless of filter
        const grandTotal = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        
        if (budgetLimit > 0 && grandTotal >= (budgetLimit * 0.8)) {
            budgetAlertDiv.textContent = `⚠️ Warning: Total spending (${formatter.format(grandTotal)}) has reached 80% of your ${formatter.format(budgetLimit)} budget!`;
            budgetAlertDiv.classList.remove('hidden');
        } else {
            budgetAlertDiv.classList.add('hidden');
        }
    }

    // 3. Handle adding an expense
    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('expense-name').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const category = document.getElementById('expense-category').value;
        const date = document.getElementById('expense-date').value;

        if(!category) {
            alert("Please select a category");
            return;
        }

        const newExpense = { name, amount, category, date };
        expenses.push(newExpense);
        
        saveData(); // Save both expenses and current budget
        expenseForm.reset();
        renderExpenses();
    });

    // 4. Handle Budget changes - saves immediately to prevent loss
    budgetLimitInput.addEventListener('input', (e) => {
        budgetLimit = parseFloat(e.target.value) || 0;
        localStorage.setItem('budgetLimit', budgetLimit);
        checkBudgetStatus(); // Update alert in real-time
    });

    window.deleteExpense = (index) => {
        expenses.splice(index, 1);
        saveData();
        renderExpenses();
    };

    filterCategorySelect.addEventListener('change', renderExpenses);

    function saveData() {
        localStorage.setItem('expenses', JSON.stringify(expenses));
        localStorage.setItem('budgetLimit', budgetLimit);
    }

    init();
});