import pandas as pd
from datetime import datetime
import streamlit as st

def load_inventory():
    try:
        return pd.read_csv('data/inventory.csv')
    except FileNotFoundError:
        return pd.DataFrame(columns=['部品名', '品番', '在庫数', '最低在庫数', '保管箱No', '最終更新日'])

def load_history():
    try:
        return pd.read_csv('data/history.csv')
    except FileNotFoundError:
        return pd.DataFrame(columns=['日時', '部品名', '品番', '使用数', '使用理由', '担当者'])

def save_inventory(df):
    df.to_csv('data/inventory.csv', index=False)

def save_history(df):
    df.to_csv('data/history.csv', index=False)

def update_inventory(部品名, 品番, 使用数):
    inventory_df = load_inventory()
    inventory_df.loc[inventory_df['品番'] == 品番, '在庫数'] -= 使用数
    inventory_df.loc[inventory_df['品番'] == 品番, '最終更新日'] = datetime.now().strftime('%Y-%m-%d')
    save_inventory(inventory_df)

def add_history_record(部品名, 品番, 使用数, 使用理由, 担当者):
    history_df = load_history()
    new_record = pd.DataFrame([{
        '日時': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        '部品名': 部品名,
        '品番': 品番,
        '使用数': 使用数,
        '使用理由': 使用理由,
        '担当者': 担当者
    }])
    history_df = pd.concat([history_df, new_record], ignore_index=True)
    save_history(history_df)

def check_stock(query):
    inventory_df = load_inventory()
    results = inventory_df[inventory_df['部品名'].str.contains(query, na=False) | 
                         inventory_df['品番'].str.contains(query, na=False)]
    if not results.empty:
        return f"「{query}」の在庫情報:\n" + \
               "\n".join([f"部品名: {row['部品名']}, 品番: {row['品番']}, " + \
                         f"在庫数: {row['在庫数']}, 保管箱No: {row['保管箱No']}" 
                         for _, row in results.iterrows()])
    return f"「{query}」に関する部品は見つかりませんでした。"