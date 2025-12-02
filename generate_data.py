import pandas as pd
import random
from datetime import datetime, timedelta
import uuid
import os

# --- НАСТРОЙКИ ---
COUNT = 1000
# Берем текущий год (2025), чтобы данные были актуальны
YEAR = 2025 

# --- КАТЕГОРИИ (как в types.ts) ---
EXPENSE_CONFIG = {
    "Продукты": (500, 7000), "Комуналка": (3000, 10000), "Интернет": (500, 1000),
    "Моб. связь": (300, 1500), "Кредиты": (10000, 30000), "Химия": (200, 2000),
    "Одежда": (1500, 15000), "Обувь": (2000, 10000), "Ремонт": (1000, 20000),
    "Мебель": (5000, 50000), "Кафе": (500, 5000), "Кино": (300, 1500),
    "Спорт": (2000, 5000), "Хобби": (500, 10000), "Путешествия": (15000, 100000),
    "Бензин": (1000, 3000), "ТО": (5000, 20000), "Страховка": (5000, 15000),
    "Такси": (200, 1500), "Общ. транспорт": (50, 2000), "Подарки": (1000, 10000),
    "Медицина": (500, 15000), "Обучение": (1000, 50000),
    "Благотворительность": (100, 5000), "Другое": (100, 5000)
}

INCOME_CONFIG = {
    "Зарплата": (60000, 150000), "Премия": (10000, 50000), "Подработка": (1000, 15000),
    "Дивиденды": (500, 5000), "Проценты": (100, 2000), "Аренда": (15000, 30000),
    "Подарок": (1000, 10000), "Возврат долга": (500, 5000), "Продажа вещей": (500, 20000)
}

DESCRIPTIONS = ["Оплата", "Покупка", "Перевод", "Платеж", "Взнос", "Транзакция"]

data = []
start_date = datetime(YEAR, 1, 1)
# Генерируем данные до сегодняшнего дня (декабрь 2025)
end_date = datetime(YEAR, 12, 31) 
days_range = (end_date - start_date).days

print(f"Генерация данных за {YEAR} год...")

for i in range(COUNT):
    random_days = random.randint(0, days_range)
    date_obj = start_date + timedelta(days=random_days)
    date_str = date_obj.strftime('%Y-%m-%d')
    
    is_salary_day = date_obj.day in [5, 20]
    
    if is_salary_day and random.random() > 0.3:
        r_type = 'Доход'
        category = "Зарплата"
        amount = random.randint(*INCOME_CONFIG["Зарплата"])
        desc = f"Зарплата {date_obj.strftime('%m.%Y')}"
    else:
        if random.random() < 0.15:
            r_type = 'Доход'
            category = random.choice(list(INCOME_CONFIG.keys()))
            min_a, max_a = INCOME_CONFIG[category]
            amount = random.randint(min_a, max_a)
            desc = random.choice(DESCRIPTIONS)
        else:
            r_type = 'Расход'
            category = random.choice(list(EXPENSE_CONFIG.keys()))
            min_a, max_a = EXPENSE_CONFIG[category]
            amount = random.randint(min_a, max_a)
            desc = "-"

    if random.random() > 0.2:
        amount = round(amount / 10) * 10

    row = {
        'Тип': r_type, 'Дата': date_str, 'Категория': category,
        'Сумма': amount, 'Описание': desc, 'ID (Не трогать)': str(uuid.uuid4())
    }
    data.append(row)

df = pd.DataFrame(data).sort_values(by='Дата')
filename = f'budget_{YEAR}_data.xlsx'
df.to_excel(filename, index=False)

# ВАЖНО: Вывод полного пути
full_path = os.path.abspath(filename)
print(f"\n✅ УСПЕШНО! Файл создан: {filename}")
print(f"📂 Полный путь к файлу: {full_path}")
print("Теперь в приложении нажми 'Загрузить Excel' и выбери этот файл.")