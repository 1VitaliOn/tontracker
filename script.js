document.addEventListener('DOMContentLoaded', () => {
    // Элементы интерфейса
    const marketTonUsdInput = document.getElementById('market-ton-usd');
    const marketUsdRubInput = document.getElementById('market-usd-rub');
    const displayTonRub = document.getElementById('market-ton-rub');
    const buyAmountInput = document.getElementById('buy-amount');
    const buyPriceTonInput = document.getElementById('buy-price-ton');
    const buyPriceUsdInput = document.getElementById('buy-price-usd');
    const displayTotalSpend = document.getElementById('total-spend');
    const displayCurrentValue = document.getElementById('current-value');
    const displayProfitLoss = document.getElementById('profit-loss');
    const displayBreakeven = document.getElementById('breakeven-ton');
    const refreshBtn = document.getElementById('refresh-api');
    const apiStatus = document.getElementById('api-status');

    function formatMoney(amount, currency = '₽') {
        return amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + currency;
    }

    // ГЛАВНАЯ ФУНКЦИЯ РАСЧЕТА (осталась прежней)
    function calculate() {
        const currentTonUsd = parseFloat(marketTonUsdInput.value) || 0;
        const currentUsdRub = parseFloat(marketUsdRubInput.value) || 0;
        const amount = parseFloat(buyAmountInput.value) || 0;
        const buyTonPrice = parseFloat(buyPriceTonInput.value) || 0;
        const buyUsdPrice = parseFloat(buyPriceUsdInput.value) || 0;

        const currentTonRubPrice = currentTonUsd * currentUsdRub;
        displayTonRub.textContent = formatMoney(currentTonRubPrice);

        const initialSpendRub = amount * buyTonPrice * buyUsdPrice;
        const currentValueRub = amount * currentTonUsd * currentUsdRub;
        const profit = currentValueRub - initialSpendRub;

        displayTotalSpend.textContent = formatMoney(initialSpendRub);
        displayCurrentValue.textContent = formatMoney(currentValueRub);
        
        displayProfitLoss.className = '';
        if (profit >= 0) {
            displayProfitLoss.classList.add('text-green');
            displayProfitLoss.textContent = '+' + formatMoney(profit);
        } else {
            displayProfitLoss.classList.add('text-red');
            displayProfitLoss.textContent = formatMoney(profit);
        }

        if (amount > 0 && currentUsdRub > 0) {
            const breakevenPrice = initialSpendRub / (amount * currentUsdRub);
            displayBreakeven.textContent = breakevenPrice.toFixed(3);
        }
    }

    // НОВАЯ ФУНКЦИЯ: ЗАГРУЗКА КУРСОВ ИЗ СЕТИ
    async function fetchRates() {
        apiStatus.textContent = "⏳ Загрузка актуальных курсов...";
        refreshBtn.disabled = true;

        try {
            // 1. Получаем курс TON к USD через CoinGecko
            const tonRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd');
            const tonData = await tonRes.json();
            const tonPrice = tonData['the-open-network'].usd;

            // 2. Получаем курс доллара к рублю (через открытое API курсов валют)
            const rubRes = await fetch('https://open.er-api.com/v6/latest/USD');
            const rubData = await rubRes.json();
            const usdToRub = rubData.rates.RUB;

            // Заполняем поля
            if (tonPrice) marketTonUsdInput.value = tonPrice;
            if (usdToRub) marketUsdRubInput.value = usdToRub.toFixed(2);

            apiStatus.textContent = `✅ Обновлено в ${new Date().toLocaleTimeString()}`;
            calculate(); // Сразу пересчитываем всё

        } catch (error) {
            console.error(error);
            apiStatus.textContent = "❌ Ошибка загрузки. Введите курсы вручную.";
        } finally {
            refreshBtn.disabled = false;
        }
    }

    // Слушатели событий
    [marketTonUsdInput, marketUsdRubInput, buyAmountInput, buyPriceTonInput, buyPriceUsdInput].forEach(input => {
        input.addEventListener('input', calculate);
    });

    refreshBtn.addEventListener('click', fetchRates);

    // При загрузке страницы: сначала считаем дефолт, потом пробуем обновить из сети
    calculate();
    fetchRates(); 
});
