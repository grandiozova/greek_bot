import sqlite3
import json

DB_NAME = "progress.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY,
            username TEXT,
            current_lesson INTEGER DEFAULT 3,
            total_correct INTEGER DEFAULT 0,
            total_wrong INTEGER DEFAULT 0,
            completed_lessons TEXT DEFAULT '[]',
            errors TEXT DEFAULT '{}'
        )
    """)
    conn.commit()
    conn.close()

def get_user(user_id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "user_id": row[0],
            "username": row[1],
            "current_lesson": row[2],
            "total_correct": row[3],
            "total_wrong": row[4],
            "completed_lessons": json.loads(row[5]) if row[5] else [],
            "errors": json.loads(row[6]) if row[6] else {}
        }
    return None

def create_user(user_id, username):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO users (user_id, username, current_lesson, total_correct, total_wrong, completed_lessons, errors)
        VALUES (?, ?, 3, 0, 0, '[]', '{}')
    """, (user_id, username))
    conn.commit()
    conn.close()

def update_stats(user_id, correct, wrong=0):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE users
        SET total_correct = total_correct + ?,
            total_wrong = total_wrong + ?
        WHERE user_id = ?
    """, (correct, wrong, user_id))
    conn.commit()
    conn.close()

def add_error(user_id, lesson, word, correct_answer, user_answer):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT errors FROM users WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    errors = json.loads(row[0]) if row and row[0] else {}
    if lesson not in errors:
        errors[lesson] = []
    errors[lesson].append({
        "word": word,
        "correct": correct_answer,
        "your": user_answer
    })
    cursor.execute("UPDATE users SET errors = ? WHERE user_id = ?", (json.dumps(errors), user_id))
    conn.commit()
    conn.close()

def get_errors(user_id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT errors FROM users WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return json.loads(row[0]) if row and row[0] else {}

def clear_errors(user_id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET errors = '{}' WHERE user_id = ?", (user_id,))
    conn.commit()
    conn.close()

def set_current_lesson(user_id, lesson):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET current_lesson = ? WHERE user_id = ?", (lesson, user_id))
    conn.commit()
    conn.close()

def mark_lesson_completed(user_id, lesson):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT completed_lessons FROM users WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    completed = json.loads(row[0]) if row and row[0] else []
    if lesson not in completed:
        completed.append(lesson)
    cursor.execute("UPDATE users SET completed_lessons = ? WHERE user_id = ?", (json.dumps(completed), user_id))
    conn.commit()
    conn.close()