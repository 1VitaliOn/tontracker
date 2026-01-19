// Ждем загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Получаем ссылки на все элементы управления
    
    // Рыночные данные (Текущие)
    const marketTonUsdInput = document.getElementById('market-ton-usd');
    const marketUsdRubInput = document.getElementById('market-usd-rub');
    const displayTonRub = document.getElementById('market-ton-rub');

    // Данные о покупке (История)
    const buyAmountInput = document.getElementById('buy-amount');
    const buyPriceTonInput = document.getElementById('buy-price-ton');
    const buyPriceUsdInput = document.getElementById('buy-price-usd');

    // Результаты
    const displayTotalSpend = document.getElementById('total-spend');
    const displayCurrentValue = document.getElementById('current-value');
    const displayProfitLoss = document.getElementById('profit-loss');
    const displayBreakeven = document.getElementById('breakeven-ton');

    // 2. Функция форматирования денег (делает красиво, например "10 000 ₽")
    function formatMoney(amount, currency = '₽') {
        return amount.toLocaleString('ru-RU', { 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 2 
        }) + ' ' + currency;
    }

    // 3. Основная функция расчетов
    function calculate() {
        // --- Сбор данных ---
        // parseFloat превращает текст в число. || 0 нужно, чтобы не было ошибок, если поле пустое
        const currentTonUsd = parseFloat(marketTonUsdInput.value) || 0;
        const currentUsdRub = parseFloat(marketUsdRubInput.value) || 0;

        const amount = parseFloat(buyAmountInput.value) || 0;
        const buyTonPrice = parseFloat(buyPriceTonInput.value) || 0;
        const buyUsdPrice = parseFloat(buyPriceUsdInput.value) || 0;

        // --- Рыночные расчеты ---
        // Сколько сейчас стоит 1 TON в рублях?
        const currentTonRubPrice = currentTonUsd * currentUsdRub;
        displayTonRub.textContent = formatMoney(currentTonRubPrice);

        // --- Расчеты по подарку (Портфель) ---
        
        // 1. Сколько рублей мы ПОТРАТИЛИ тогда?
        // Формула: Кол-во * Цена Тона тогда ($) * Курс доллара тогда (₽)
        const initialSpendRub = amount * buyTonPrice * buyUsdPrice;

        // 2. Сколько рублей мы получим СЕЙЧАС, если продадим?
        // Формула: Кол-во * Текущая цена Тона ($) * Текущий курс доллара (₽)
        const currentValueRub = amount * currentTonUsd * currentUsdRub;

        // 3. Разница (Прибыль или Убыток)
        const profit = currentValueRub - initialSpendRub;

        // --- Вывод результатов на экран ---
        displayTotalSpend.textContent = formatMoney(initialSpendRub);
        displayCurrentValue.textContent = formatMoney(currentValueRub);
        
        // Красим результат в зеленый или красный
        displayProfitLoss.textContent = formatMoney(profit);
        displayProfitLoss.className = ''; // Сброс классов
        if (profit >= 0) {
            displayProfitLoss.classList.add('text-green');
            displayProfitLoss.textContent = '+' + formatMoney(profit);
        } else {
            displayProfitLoss.classList.add('text-red');
        }

        // --- Расчет безубыточности (Break-even) ---
        // Вопрос: При каком курсе TON ($) мы выйдем в ноль, учитывая ТЕКУЩИЙ курс доллара?
        // Уравнение: (Amount * X * CurrentUsdRub) = InitialSpendRub
        // X = InitialSpendRub / (Amount * CurrentUsdRub)
        
        if (amount > 0 && currentUsdRub > 0) {
            const breakevenPrice = initialSpendRub / (amount * currentUsdRub);
            displayBreakeven.textContent = breakevenPrice.toFixed(3);
        } else {
            displayBreakeven.textContent = "---";
        }
    }

    // 4. Вешаем "слушателей" событий
    // Каждый раз, когда мы что-то вводим (input), запускается функция calculate
    const inputs = [
        marketTonUsdInput, 
        marketUsdRubInput, 
        buyAmountInput, 
        buyPriceTonInput, 
        buyPriceUsdInput
    ];

    inputs.forEach(input => {
        input.addEventListener('input', calculate);
    });

    // Запустить расчет один раз при загрузке страницы
    calculate();
});
