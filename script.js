"use strict";

// Запускаем код после того, как браузер разберёт HTML-документ.
document.addEventListener("DOMContentLoaded", function () {
    // Получаем элементы формы и области вывода результата.
    const quantityInput = document.getElementById("quantity");
    const serviceInputs = document.querySelectorAll('input[name="service"]');
    const optionGroup = document.getElementById("option-group");
    const deliveryOption = document.getElementById("delivery-option");
    const propertyGroup = document.getElementById("property-group");
    const urgentCheckbox = document.getElementById("urgent");
    const priceOutput = document.getElementById("price");
    const detailsOutput = document.getElementById("price-details");
    const errorOutput = document.getElementById("error-message");

    // Базовая цена каждой услуги за одну единицу.
    const basePrices = {
        basic: 500,
        delivery: 700,
        setup: 1000
    };

    // Доплаты за варианты доставки за одну единицу.
    const deliverySurcharges = {
        standard: 0,
        express: 300,
        scheduled: 500
    };

    // Доплата за срочное выполнение настройки.
    const urgentSurcharge = 400;

    // Возвращает тип услуги, выбранный радиокнопкой.
    function getSelectedService() {
        const selectedInput = document.querySelector('input[name="service"]:checked');
        return selectedInput.value;
    }

    // Показывает дополнительные поля только для соответствующего типа услуги.
    function updateConditionalFields() {
        const service = getSelectedService();

        // У доставки есть список вариантов, но нет чекбокса.
        optionGroup.hidden = service !== "delivery";

        // У настройки есть чекбокс свойства, но нет списка вариантов.
        propertyGroup.hidden = service !== "setup";

        // Сбрасываем скрытые параметры, чтобы они не влияли на будущий расчёт.
        if (service !== "delivery") {
            deliveryOption.selectedIndex = 0;
        }
        if (service !== "setup") {
            urgentCheckbox.checked = false;
        }
    }

    // Форматирует число по русским правилам и добавляет знак рубля.
    function formatPrice(amount) {
        return amount.toLocaleString("ru-RU") + " ₽";
    }

    // Пересчитывает стоимость без перезагрузки страницы.
    function calculatePrice() {
        const service = getSelectedService();
        const quantityText = quantityInput.value.trim();
        const quantity = Number(quantityText);
        let unitPrice = basePrices[service];
        let description = "";
        let total;

        errorOutput.textContent = "";

        // Проверяем, что количество — безопасное целое число больше нуля.
        if (
            quantityText === "" ||
            !Number.isSafeInteger(quantity) ||
            quantity < 1
        ) {
            priceOutput.textContent = "—";
            detailsOutput.textContent = "";
            errorOutput.textContent = "Введите целое положительное количество.";
            return;
        }

        // Для доставки прибавляем доплату выбранного варианта.
        if (service === "delivery") {
            unitPrice += deliverySurcharges[deliveryOption.value];
            description = "Доставка";
            if (deliveryOption.value === "express") {
                description += " (экспресс)";
            } else if (deliveryOption.value === "scheduled") {
                description += " (к определённому времени)";
            } else {
                description += " (стандартная)";
            }
        } else if (service === "setup") {
            // Для настройки учитываем выбранный чекбокс срочного выполнения.
            description = "Настройка";
            if (urgentCheckbox.checked) {
                unitPrice += urgentSurcharge;
                description += " (срочное выполнение)";
            }
        } else {
            description = "Базовая услуга";
        }

        // Общая стоимость равна цене за единицу, умноженной на количество.
        total = unitPrice * quantity;

        // Не показываем неточный результат при слишком большом числе.
        if (!Number.isSafeInteger(total)) {
            priceOutput.textContent = "—";
            detailsOutput.textContent = "";
            errorOutput.textContent = "Сумма слишком большая для точного расчёта.";
            return;
        }

        priceOutput.textContent = formatPrice(total);
        detailsOutput.textContent =
            description + ": " + formatPrice(unitPrice) + " × " + quantity;
    }

    // Изменение количества сразу пересчитывает стоимость.
    quantityInput.addEventListener("input", calculatePrice);

    // Смена услуги обновляет видимость полей и итоговую стоимость.
    serviceInputs.forEach(function (input) {
        input.addEventListener("change", function () {
            updateConditionalFields();
            calculatePrice();
        });
    });

    // Изменение списка или чекбокса сразу пересчитывает стоимость.
    deliveryOption.addEventListener("change", calculatePrice);
    urgentCheckbox.addEventListener("change", calculatePrice);

    // При отправке формы не перезагружаем страницу.
    document.getElementById("calculator-form").addEventListener("submit", function (event) {
        event.preventDefault();
        calculatePrice();
    });

    // Настраиваем отображение полей и рассчитываем начальную стоимость.
    updateConditionalFields();
    calculatePrice();
});
