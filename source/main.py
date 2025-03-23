import streamlit as st
import pandas as pd
from utils import *
from datetime import datetime

st.set_page_config(page_title="部品在庫管理システム", layout="wide")

# セッション状態の初期化
if 'chat_history' not in st.session_state:
    st.session_state.chat_history = []
if 'current_page' not in st.session_state:
    st.session_state.current_page = "在庫管理"

def main():
    st.title("部品在庫管理システム")

    # サイドバーでページ選択
    with st.sidebar:
        st.session_state.current_page = st.radio(
            "機能選択",
            ["在庫管理", "履歴管理", "チャット"],
            index=["在庫管理", "履歴管理", "チャット"].index(st.session_state.current_page)
        )

    if st.session_state.current_page == "在庫管理":
        show_inventory_page()
    elif st.session_state.current_page == "履歴管理":
        show_history_page()
    else:
        show_chat_page()

def highlight_low_stock(row):
    if row['在庫数'] < row['最低在庫数']:
        return ['background-color: #ffcccc'] * len(row)
    return [''] * len(row)

def show_inventory_page():
    st.header("在庫管理")

    # データ読み込み
    df = load_inventory()

    # インデックスを1から始まる連番に変更
    df_with_index = df.copy()
    df_with_index.index = range(1, len(df) + 1)
    df_with_index.index.name = 'No'

    # 在庫追加フォーム
    with st.expander("新規部品登録"):
        col1, col2, col3 = st.columns(3)
        with col1:
            new_name = st.text_input("部品名")
            new_part_number = st.text_input("品番")
        with col2:
            new_quantity = st.number_input("在庫数", min_value=0)
            new_min_quantity = st.number_input("最低在庫数", min_value=0)
        with col3:
            new_location = st.text_input("保管箱No")

        if st.button("登録"):
            if new_name and new_part_number and new_location:
                new_row = pd.DataFrame([{
                    '部品名': new_name,
                    '品番': new_part_number,
                    '在庫数': new_quantity,
                    '最低在庫数': new_min_quantity,
                    '保管箱No': new_location,
                    '最終更新日': datetime.now().strftime('%Y-%m-%d')
                }])
                df = pd.concat([df, new_row], ignore_index=True)
                save_inventory(df)
                st.success("部品を登録しました。")
                st.rerun()
            else:
                st.error("すべての項目を入力してください。")

    # 在庫一覧表示
    st.subheader("在庫一覧")
    st.dataframe(
        df_with_index.style.apply(highlight_low_stock, axis=1)
    )

    # 部品使用記録フォーム
    st.subheader("部品使用記録")

    # 品番と部品名の対応辞書を作成
    parts_dict = dict(zip(df['品番'], df['部品名']))

    col1, col2, col3 = st.columns(3)
    with col1:
        selected_part_number = st.selectbox(
            "品番",
            df['品番'].tolist()
        )
        if selected_part_number:
            selected_part = parts_dict[selected_part_number]

    with col2:
        quantity = st.number_input("使用数", min_value=1)
    with col3:
        user = st.text_input("担当者")

    reason = st.text_area("使用理由")

    if st.button("記録"):
        if selected_part_number and quantity and user and reason:
            # 在庫数チェック
            current_stock = df[df['品番'] == selected_part_number]['在庫数'].iloc[0]
            if current_stock >= quantity:
                update_inventory(selected_part, selected_part_number, quantity)
                add_history_record(selected_part, selected_part_number, quantity, reason, user)
                st.success("使用記録を保存しました。")
                # 画面を更新
                st.rerun()
            else:
                st.error("在庫が不足しています。")
        else:
            st.error("すべての項目を入力してください。")

def show_history_page():
    st.header("履歴管理")

    # データ読み込み
    history_df = load_history()

    # 履歴一覧表示
    st.subheader("使用履歴")
    st.dataframe(history_df, hide_index=True)

def show_chat_page():
    st.header("在庫チャット")

    # チャットインターフェース
    query = st.text_input("部品名または品番を入力して在庫を確認できます")

    if st.button("確認") and query:
        response = check_stock(query)
        st.session_state.chat_history.append(("ユーザー", query))
        st.session_state.chat_history.append(("システム", response))

    # チャット履歴表示
    st.subheader("チャット履歴")
    for role, message in st.session_state.chat_history:
        if role == "ユーザー":
            st.write(f"👤 **あなた**: {message}")
        else:
            st.write(f"🤖 **システム**: {message}")

if __name__ == "__main__":
    main()