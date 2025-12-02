import pandas as pd
import random
from datetime import datetime, timedelta
import uuid
import os

# --- НАСТРОЙКИ ---
YEAR = 2025
COUNT_EXPENSE = 900
COUNT_INCOME = 100

# --- КАТЕГОРИИ ИЗ ТВОЕГО TYPES.TS ---
EXPENSE_CATS = [
    # Фикс
    "Коммуналка", "ЭЭ", "Вода", "Газ", "Гараж", "Телефон", "Интернет", "Авто",
    # Еда
    "Еда вне дома", "Продукты", "Сладости", "Кафе и рестораны",
    # Разное
    "Транспорт", "Одежда", "Здоровье", "Для дома", "Красота и уход", 
    "Развлечения и хобби", "Домашние животные", "Подарки", 
    "Путешествия и поездки", "Прочее"
]

INCOME_CATS = [
    # Активный
    "Зарплата", "Аванс", "Бонус", "Премия", "Подработка",
    # Пассивный
    "Кэшбэк", "Проценты по вкладу", "Дивиденды", "Аренда",
    # Прочее
    "Подарки", "Продажа вещей", "Возврат долга", "Другое"
]

# --- ГЕНЕРАЦИЯ ---
data = []
start_date = datetime(YEAR, 1, 1)
end_date = datetime(YEAR, 12, 31)
days_in_year = (end_date - start_date).days

print(f"Генерируем данные за {YEAR} год...")
print(f"Расходов: {COUNT_EXPENSE}, Доходов: {COUNT_INCOME}")

# 1. ГЕНЕРАЦИЯ РАСХОДОВ
for _ in range(COUNT_EXPENSE):
    random_days = random.randint(0, days_in_year)
    date_str = (start_date + timedelta(days=random_days)).strftime('%Y-%m-%d')
    
    cat = random.choice(EXPENSE_CATS)
    
    # Примерная логика сумм для реалистичности
    if cat in ["Коммуналка", "Авто", "Одежда", "Путешествия и поездки"]:
        amount = random.randint(3000, 15000)
    elif cat in ["Продукты", "Кафе и рестораны", "Здоровье"]:
        amount = random.randint(500, 5000)
    elif cat in ["ЭЭ", "Вода", "Газ", "Интернет", "Телефон"]:
        amount = random.randint(300, 1500)
    else:
        amount = random.randint(200, 3000)

    # Округляем
    if random.random() > 0.3: amount = round(amount / 100) * 100

    data.append({
        'Тип': 'Расход',
        'Дата': date_str,
        'Категория': cat,
        'Сумма': amount,
        'Описание': 'Тестовый расход',
        'ID (Не трогать)': str(uuid.uuid4())
    })

# 2. ГЕНЕРАЦИЯ ДОХОДОВ
for _ in range(COUNT_INCOME):
    random_days = random.randint(0, days_in_year)
    date_str = (start_date + timedelta(days=random_days)).strftime('%Y-%m-%d')
    
    cat = random.choice(INCOME_CATS)
    
    if cat in ["Зарплата", "Премия", "Аренда"]:
        amount = random.randint(40000, 120000)
    elif cat in ["Аванс", "Бонус"]:
        amount = random.randint(15000, 30000)
    else:
        amount = random.randint(500, 5000) # Кэшбэк и прочее

    data.append({
        'Тип': 'Доход',
        'Дата': date_str,
        'Категория': cat,
        'Сумма': amount,
        'Описание': 'Поступление',
        'ID (Не трогать)': str(uuid.uuid4())
    })

# Сортировка и сохранение
df = pd.DataFrame(data).sort_values(by='Дата')
filename = f'budget_{YEAR}_strict.xlsx'
df.to_excel(filename, index=False)

print(f"\n✅ Файл создан: {filename}")
print(f"Полный путь: {os.path.abspath(filename)}")