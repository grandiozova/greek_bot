import asyncio
import json
import random
import logging
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command, StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder

import db

# --- НАСТРОЙКИ ---
BOT_TOKEN = "8854550605:AAFQHINaVw82IuRtLrxvADjea7oMtMKGzKs"  # ЗАМЕНИТЕ НА ВАШ ТОКЕН!
LESSONS = [3, 4, 5, 6]  # Доступные уроки

# --- ИНИЦИАЛИЗАЦИЯ ---
logging.basicConfig(level=logging.INFO)
bot = Bot(token=BOT_TOKEN)
storage = MemoryStorage()
dp = Dispatcher(storage=storage)

# Загружаем данные из JSON
with open("data.json", "r", encoding="utf-8") as f:
    DATA = json.load(f)

# --- СОСТОЯНИЯ (FSM) ---
class LessonState(StatesGroup):
    choosing_lesson = State()
    choosing_exercise = State()
    in_exercise = State()
    in_test = State()
    waiting_translation_input = State()

# --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

def get_lesson_data(lesson_num):
    return DATA["lessons"].get(str(lesson_num))

def get_vocabulary(lesson_num):
    lesson = get_lesson_data(lesson_num)
    if not lesson:
        return []
    return lesson.get("vocabulary", [])

def get_exercises(lesson_num, exercise_type):
    lesson = get_lesson_data(lesson_num)
    if not lesson:
        return []
    return lesson.get("exercises", {}).get(exercise_type, [])

def shuffle_and_limit(lst, limit=None):
    shuffled = lst.copy()
    random.shuffle(shuffled)
    if limit and len(shuffled) > limit:
        return shuffled[:limit]
    return shuffled

def build_menu_keyboard(lesson_num, include_test=True):
    builder = InlineKeyboardBuilder()
    builder.button(text="📚 Грамматика", callback_data=f"grammar_{lesson_num}")
    builder.button(text="📖 Словарь", callback_data=f"vocab_{lesson_num}")
    builder.button(text="🔤 Склонение/Спряжение", callback_data=f"ex_decl_{lesson_num}")
    builder.button(text="🔄 Перевод (греч.→рус.)", callback_data=f"ex_trans_gr_{lesson_num}")
    builder.button(text="🔄 Перевод (рус.→греч.)", callback_data=f"ex_trans_ru_{lesson_num}")
    builder.button(text="🎯 Падеж/число (опред.)", callback_data=f"ex_case_{lesson_num}")
    if include_test:
        builder.button(text="📝 Тест (7 вопросов)", callback_data=f"test_{lesson_num}")
    builder.button(text="🔙 В главное меню", callback_data="main_menu")
    builder.adjust(2, 2, 2, 1, 1)
    return builder.as_markup()

def get_main_menu_keyboard():
    builder = InlineKeyboardBuilder()
    for lesson in LESSONS:
        title = get_lesson_data(lesson).get("title", f"Урок {lesson}")
        builder.button(text=f"📖 Урок {lesson}: {title}", callback_data=f"lesson_{lesson}")
    builder.button(text="🔄 Повторить ошибки", callback_data="repeat_errors")
    builder.button(text="📊 Статистика", callback_data="stats")
    builder.adjust(1)
    return builder.as_markup()

def generate_declension_question(lesson_num):
    lesson = get_lesson_data(lesson_num)
    if not lesson:
        return None
    decl_ex = lesson.get("exercises", {}).get("declension_fill", [])
    if not decl_ex:
        return None
    q = random.choice(decl_ex)
    # q содержит: case, number, correct, distractors
    case_names = {"nom": "Nom.", "gen": "Gen.", "dat": "Dat.", "acc": "Acc.", "voc": "Voc."}
    number_names = {"singular": "ед.ч.", "plural": "мн.ч."}
    question_text = f"Вставьте правильную форму для **{case_names.get(q['case'], q['case'])} {number_names.get(q['number'], q['number'])}**"
    # Собираем варианты
    options = [q["correct"]] + q.get("distractors", [])
    random.shuffle(options)
    keyboard = InlineKeyboardBuilder()
    for opt in options:
        keyboard.button(text=opt, callback_data=f"decl_ans_{opt}")
    keyboard.button(text="🔙 Отмена", callback_data="cancel_exercise")
    keyboard.adjust(2)
    return {
        "question": question_text,
        "options": options,
        "correct": q["correct"],
        "keyboard": keyboard.as_markup()
    }

def generate_translation_gr_question(lesson_num):
    lesson = get_lesson_data(lesson_num)
    if not lesson:
        return None
    trans_ex = lesson.get("exercises", {}).get("translate_greek_to_russian", [])
    if not trans_ex:
        return None
    q = random.choice(trans_ex)
    # q содержит: greek, keywords
    question_text = f"Переведите на русский:\n\n{q['greek']}"
    return {
        "question": question_text,
        "greek": q['greek'],
        "keywords": q['keywords'],
        "type": "trans_gr"
    }

def generate_translation_ru_question(lesson_num):
    lesson = get_lesson_data(lesson_num)
    if not lesson:
        return None
    trans_ex = lesson.get("exercises", {}).get("translate_russian_to_greek", [])
    if not trans_ex:
        return None
    q = random.choice(trans_ex)
    # q содержит: russian, correct_sequence, all_words
    question_text = f"Переведите на греческий (выберите слова в правильном порядке):\n\n{q['russian']}"
    # Перемешиваем все слова
    words = q['all_words'].copy()
    random.shuffle(words)
    # Строим кнопки: каждая кнопка добавляет слово в ответ
    keyboard = InlineKeyboardBuilder()
    for w in words:
        keyboard.button(text=w, callback_data=f"ru_add_{w}")
    keyboard.button(text="✅ Готово", callback_data="ru_done")
    keyboard.button(text="🔙 Отмена", callback_data="cancel_exercise")
    keyboard.adjust(3)
    return {
        "question": question_text,
        "correct_sequence": q['correct_sequence'],
        "all_words": q['all_words'],
        "keyboard": keyboard.as_markup(),
        "type": "trans_ru"
    }

def generate_case_question(lesson_num):
    lesson = get_lesson_data(lesson_num)
    if not lesson:
        return None
    case_ex = lesson.get("exercises", {}).get("case_number", [])
    if not case_ex:
        return None
    q = random.choice(case_ex)
    # q содержит: form, correct, distractors
    question_text = f"Определите падеж и число для формы:\n\n{q['form']}"
    options = [q["correct"]] + q.get("distractors", [])
    random.shuffle(options)
    keyboard = InlineKeyboardBuilder()
    for opt in options:
        keyboard.button(text=opt, callback_data=f"case_ans_{opt}")
    keyboard.button(text="🔙 Отмена", callback_data="cancel_exercise")
    keyboard.adjust(1)
    return {
        "question": question_text,
        "options": options,
        "correct": q["correct"],
        "keyboard": keyboard.as_markup()
    }

def generate_agreement_question(lesson_num):
    lesson = get_lesson_data(lesson_num)
    if not lesson:
        return None
    agg_ex = lesson.get("exercises", {}).get("agreement", [])
    if not agg_ex:
        return None
    q = random.choice(agg_ex)
    # q содержит: noun, article, adjective, correct, distractors
    question_text = f"Вставьте прилагательное **{q['adjective']}** в правильной форме:\n\n{q['article']} ____ {q['noun']}"
    options = [q["correct"]] + q.get("distractors", [])
    random.shuffle(options)
    keyboard = InlineKeyboardBuilder()
    for opt in options:
        keyboard.button(text=opt, callback_data=f"agr_ans_{opt}")
    keyboard.button(text="🔙 Отмена", callback_data="cancel_exercise")
    keyboard.adjust(2)
    return {
        "question": question_text,
        "options": options,
        "correct": q["correct"],
        "keyboard": keyboard.as_markup()
    }

def generate_attribute_question(lesson_num):
    lesson = get_lesson_data(lesson_num)
    if not lesson:
        return None
    attr_ex = lesson.get("exercises", {}).get("attribute_vs_predicate", [])
    if not attr_ex:
        return None
    q = random.choice(attr_ex)
    # q содержит: phrase, correct, distractors
    question_text = f"Определите, атрибутив или предикатив:\n\n{q['phrase']}"
    options = [q["correct"]] + q.get("distractors", [])
    random.shuffle(options)
    keyboard = InlineKeyboardBuilder()
    for opt in options:
        keyboard.button(text=opt, callback_data=f"attr_ans_{opt}")
    keyboard.button(text="🔙 Отмена", callback_data="cancel_exercise")
    keyboard.adjust(1)
    return {
        "question": question_text,
        "options": options,
        "correct": q["correct"],
        "keyboard": keyboard.as_markup()
    }

def generate_substantivation_question(lesson_num):
    lesson = get_lesson_data(lesson_num)
    if not lesson:
        return None
    subst_ex = lesson.get("exercises", {}).get("substantivation", [])
    if not subst_ex:
        return None
    q = random.choice(subst_ex)
    # q содержит: phrase, correct, distractors
    question_text = f"Что означает:\n\n{q['phrase']} ?"
    options = [q["correct"]] + q.get("distractors", [])
    random.shuffle(options)
    keyboard = InlineKeyboardBuilder()
    for opt in options:
        keyboard.button(text=opt, callback_data=f"subst_ans_{opt}")
    keyboard.button(text="🔙 Отмена", callback_data="cancel_exercise")
    keyboard.adjust(1)
    return {
        "question": question_text,
        "options": options,
        "correct": q["correct"],
        "keyboard": keyboard.as_markup()
    }

def generate_article_fill_question(lesson_num):
    lesson = get_lesson_data(lesson_num)
    if not lesson:
        return None
    art_ex = lesson.get("exercises", {}).get("article_fill", [])
    if not art_ex:
        return None
    q = random.choice(art_ex)
    # q содержит: noun, correct_article, distractors
    question_text = f"Вставьте правильную форму артикля:\n\n____ {q['noun']}"
    options = [q["correct_article"]] + q.get("distractors", [])
    random.shuffle(options)
    keyboard = InlineKeyboardBuilder()
    for opt in options:
        keyboard.button(text=opt, callback_data=f"art_ans_{opt}")
    keyboard.button(text="🔙 Отмена", callback_data="cancel_exercise")
    keyboard.adjust(2)
    return {
        "question": question_text,
        "options": options,
        "correct": q["correct_article"],
        "keyboard": keyboard.as_markup()
    }

# --- ХЭНДЛЕРЫ КОМАНД ---

@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    user_id = message.from_user.id
    username = message.from_user.username or "Unknown"
    # Создаём пользователя, если нет
    if not db.get_user(user_id):
        db.create_user(user_id, username)
    await message.answer(
        "🏛️ *Добро пожаловать в тренажёр древнегреческого языка!*\n\n"
        "Здесь вы можете изучать греческий по учебнику Мейчена.\n"
        "Доступны уроки 3–6. Выберите урок из меню ниже:",
        reply_markup=get_main_menu_keyboard(),
        parse_mode="Markdown"
    )
    await db.set_current_lesson(user_id, 3)

@dp.callback_query(lambda c: c.data == "main_menu")
async def main_menu(callback: types.CallbackQuery):
    await callback.message.edit_text(
        "🏛️ *Главное меню*\n\nВыберите урок или действие:",
        reply_markup=get_main_menu_keyboard(),
        parse_mode="Markdown"
    )
    await callback.answer()

@dp.callback_query(lambda c: c.data.startswith("lesson_"))
async def choose_lesson(callback: types.CallbackQuery):
    lesson_num = int(callback.data.split("_")[1])
    user_id = callback.from_user.id
    await db.set_current_lesson(user_id, lesson_num)
    lesson_data = get_lesson_data(lesson_num)
    title = lesson_data.get("title", f"Урок {lesson_num}")
    await callback.message.edit_text(
        f"📖 *Урок {lesson_num}: {title}*\n\nВыберите режим работы:",
        reply_markup=build_menu_keyboard(lesson_num),
        parse_mode="Markdown"
    )
    await callback.answer()

@dp.callback_query(lambda c: c.data.startswith("grammar_"))
async def show_grammar(callback: types.CallbackQuery):
    lesson_num = int(callback.data.split("_")[1])
    lesson_data = get_lesson_data(lesson_num)
    grammar = lesson_data.get("grammar", "Грамматика не загружена.")
    await callback.message.edit_text(
        f"📚 *Грамматика урока {lesson_num}*\n\n{grammar}",
        reply_markup=build_menu_keyboard(lesson_num, include_test=True),
        parse_mode="Markdown"
    )
    await callback.answer()

@dp.callback_query(lambda c: c.data.startswith("vocab_"))
async def show_vocabulary(callback: types.CallbackQuery):
    lesson_num = int(callback.data.split("_")[1])
    vocab = get_vocabulary(lesson_num)
    if not vocab:
        text = "Словарь пуст."
    else:
        lines = []
        for item in vocab:
            article = item.get("article", "")
            greek = item["greek"]
            trans = item["translation"]
            if article:
                lines.append(f"{article} {greek} — {trans}")
            else:
                lines.append(f"{greek} — {trans}")
        text = "📖 *Словарь*\n\n" + "\n".join(lines)
    await callback.message.edit_text(
        text,
        reply_markup=build_menu_keyboard(lesson_num, include_test=True),
        parse_mode="Markdown"
    )
    await callback.answer()

# --- ОБРАБОТЧИКИ УПРАЖНЕНИЙ ---

@dp.callback_query(lambda c: c.data.startswith("ex_decl_"))
async def exercise_declension(callback: types.CallbackQuery, state: FSMContext):
    lesson_num = int(callback.data.split("_")[2])
    user_id = callback.from_user.id
    # Генерируем вопрос
    q_data = generate_declension_question(lesson_num)
    if not q_data:
        await callback.answer("Нет вопросов по этой теме.")
        return
    # Сохраняем состояние
    await state.update_data(lesson=lesson_num, exercise_type="declension", correct=q_data["correct"])
    await state.set_state(LessonState.in_exercise)
    await callback.message.edit_text(
        q_data["question"],
        reply_markup=q_data["keyboard"],
        parse_mode="Markdown"
    )
    await callback.answer()

@dp.callback_query(lambda c: c.data.startswith("ex_trans_gr_"))
async def exercise_trans_gr(callback: types.CallbackQuery, state: FSMContext):
    lesson_num = int(callback.data.split("_")[3])
    q_data = generate_translation_gr_question(lesson_num)
    if not q_data:
        await callback.answer("Нет вопросов по этой теме.")
        return
    await state.update_data(lesson=lesson_num, exercise_type="trans_gr", correct=q_data["keywords"])
    await state.set_state(LessonState.waiting_translation_input)
    await callback.message.edit_text(
        q_data["question"],
        parse_mode="Markdown"
    )
    # Покажем клавиатуру для отмены
    cancel_kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔙 Отмена", callback_data="cancel_exercise")]
    ])
    await callback.message.edit_reply_markup(reply_markup=cancel_kb)
    await callback.answer()

@dp.message(LessonState.waiting_translation_input)
async def handle_translation_input(message: types.Message, state: FSMContext):
    user_id = message.from_user.id
    data = await state.get_data()
    lesson = data.get("lesson")
    correct_keywords = data.get("correct", [])
    user_answer = message.text.strip()
    # Проверяем, содержит ли ответ все ключевые слова
    user_lower = user_answer.lower()
    missing = []
    for kw in correct_keywords:
        if kw.lower() not in user_lower:
            missing.append(kw)
    if not missing:
        # Правильно
        db.update_stats(user_id, correct=1)
        await message.answer("✅ *Верно!* Отличный перевод!", parse_mode="Markdown")
    else:
        # Неправильно
        db.update_stats(user_id, correct=0, wrong=1)
        db.add_error(user_id, lesson, "перевод", ", ".join(correct_keywords), user_answer)
        await message.answer(
            f"❌ *Не совсем.*\n\nКлючевые слова, которые должны быть в ответе: *{', '.join(correct_keywords)}*\n\nВаш ответ: *{user_answer}*",
            parse_mode="Markdown"
        )
    # Возвращаем меню урока
    lesson_data = get_lesson_data(lesson)
    title = lesson_data.get("title", f"Урок {lesson}")
    await message.answer(
        f"📖 *Урок {lesson}: {title}*\n\nВыберите режим работы:",
        reply_markup=build_menu_keyboard(lesson),
        parse_mode="Markdown"
    )
    await state.clear()

@dp.callback_query(lambda c: c.data.startswith("ex_trans_ru_"))
async def exercise_trans_ru(callback: types.CallbackQuery, state: FSMContext):
    lesson_num = int(callback.data.split("_")[3])
    q_data = generate_translation_ru_question(lesson_num)
    if not q_data:
        await callback.answer("Нет вопросов по этой теме.")
        return
    # Сохраняем состояние
    await state.update_data(lesson=lesson_num, exercise_type="trans_ru", correct_seq=q_data["correct_sequence"], chosen_words=[])
    await state.set_state(LessonState.in_exercise)
    await callback.message.edit_text(
        q_data["question"],
        reply_markup=q_data["keyboard"],
        parse_mode="Markdown"
    )
    await callback.answer()

@dp.callback_query(lambda c: c.data.startswith("ru_add_"))
async def ru_add_word(callback: types.CallbackQuery, state: FSMContext):
    word = callback.data.split("_")[2]
    data = await state.get_data()
    chosen = data.get("chosen_words", [])
    chosen.append(word)
    await state.update_data(chosen_words=chosen)
    # Обновим сообщение, показывая выбранные слова
    current_text = callback.message.text
    # Добавим строку с выбранными словами
    chosen_str = " ".join(chosen)
    new_text = current_text.split("\n\nВыбрано:")[0] + f"\n\nВыбрано: *{chosen_str}*"
    await callback.message.edit_text(
        new_text,
        reply_markup=callback.message.reply_markup,
        parse_mode="Markdown"
    )
    await callback.answer()

@dp.callback_query(lambda c: c.data == "ru_done")
async def ru_done(callback: types.CallbackQuery, state: FSMContext):
    data = await state.get_data()
    correct_seq = data.get("correct_seq", [])
    chosen = data.get("chosen_words", [])
    user_id = callback.from_user.id
    lesson = data.get("lesson")
    if chosen == correct_seq:
        db.update_stats(user_id, correct=1)
        await callback.message.edit_text("✅ *Верно!* Порядок слов правильный.", parse_mode="Markdown")
    else:
        db.update_stats(user_id, correct=0, wrong=1)
        db.add_error(user_id, lesson, "порядок слов", " ".join(correct_seq), " ".join(chosen))
        await callback.message.edit_text(
            f"❌ *Неверно.*\n\nПравильная последовательность: *{' '.join(correct_seq)}*\n"
            f"Ваша: *{' '.join(chosen)}*",
            parse_mode="Markdown"
        )
    # Возвращаем меню
    lesson_data = get_lesson_data(lesson)
    title = lesson_data.get("title", f"Урок {lesson}")
    await callback.message.answer(
        f"📖 *Урок {lesson}: {title}*\n\nВыберите режим работы:",
        reply_markup=build_menu_keyboard(lesson),
        parse_mode="Markdown"
    )
    await state.clear()
    await callback.answer()

@dp.callback_query(lambda c: c.data.startswith("ex_case_"))
async def exercise_case(callback: types.CallbackQuery, state: FSMContext):
    lesson_num = int(callback.data.split("_")[2])
    q_data = generate_case_question(lesson_num)
    if not q_data:
        await callback.answer("Нет вопросов по этой теме.")
        return
    await state.update_data(lesson=lesson_num, exercise_type="case", correct=q_data["correct"])
    await state.set_state(LessonState.in_exercise)
    await callback.message.edit_text(
        q_data["question"],
        reply_markup=q_data["keyboard"],
        parse_mode="Markdown"
    )
    await callback.answer()

# Дополнительные упражнения для урока 6 (согласование, атрибут, субстантивация, артикль)
@dp.callback_query(lambda c: c.data.startswith("ex_agr_"))
async def exercise_agreement(callback: types.CallbackQuery, state: FSMContext):
    lesson_num = int(callback.data.split("_")[2])
    q_data = generate_agreement_question(lesson_num)
    if not q_data:
        await callback.answer("Нет вопросов по этой теме.")
        return
    await state.update_data(lesson=lesson_num, exercise_type="agreement", correct=q_data["correct"])
    await state.set_state(LessonState.in_exercise)
    await callback.message.edit_text(
        q_data["question"],
        reply_markup=q_data["keyboard"],
        parse_mode="Markdown"
    )
    await callback.answer()

@dp.callback_query(lambda c: c.data.startswith("ex_attr_"))
async def exercise_attribute(callback: types.CallbackQuery, state: FSMContext):
    lesson_num = int(callback.data.split("_")[2])
    q_data = generate_attribute_question(lesson_num)
    if not q_data:
        await callback.answer("Нет вопросов по этой теме.")
        return
    await state.update_data(lesson=lesson_num, exercise_type="attribute", correct=q_data["correct"])
    await state.set_state(LessonState.in_exercise)
    await callback.message.edit_text(
        q_data["question"],
        reply_markup=q_data["keyboard"],
        parse_mode="Markdown"
    )
    await callback.answer()

@dp.callback_query(lambda c: c.data.startswith("ex_subst_"))
async def exercise_substantivation(callback: types.CallbackQuery, state: FSMContext):
    lesson_num = int(callback.data.split("_")[2])
    q_data = generate_substantivation_question(lesson_num)
    if not q_data:
        await callback.answer("Нет вопросов по этой теме.")
        return
    await state.update_data(lesson=lesson_num, exercise_type="substantivation", correct=q_data["correct"])
    await state.set_state(LessonState.in_exercise)
    await callback.message.edit_text(
        q_data["question"],
        reply_markup=q_data["keyboard"],
        parse_mode="Markdown"
    )
    await callback.answer()

@dp.callback_query(lambda c: c.data.startswith("ex_art_"))
async def exercise_article(callback: types.CallbackQuery, state: FSMContext):
    lesson_num = int(callback.data.split("_")[2])
    q_data = generate_article_fill_question(lesson_num)
    if not q_data:
        await callback.answer("Нет вопросов по этой теме.")
        return
    await state.update_data(lesson=lesson_num, exercise_type="article", correct=q_data["correct"])
    await state.set_state(LessonState.in_exercise)
    await callback.message.edit_text(
        q_data["question"],
        reply_markup=q_data["keyboard"],
        parse_mode="Markdown"
    )
    await callback.answer()

# --- ОБЩИЙ ОБРАБОТЧИК ВЫБОРА ОТВЕТА ---

@dp.callback_query(lambda c: c.data.startswith(("decl_ans_", "case_ans_", "agr_ans_", "attr_ans_", "subst_ans_", "art_ans_")))
async def handle_option_answer(callback: types.CallbackQuery, state: FSMContext):
    data = await state.get_data()
    correct = data.get("correct")
    user_answer = callback.data.split("_", 2)[2]  # извлекаем ответ
    user_id = callback.from_user.id
    lesson = data.get("lesson")
    if user_answer == correct:
        db.update_stats(user_id, correct=1)
        await callback.message.edit_text("✅ *Верно!*", parse_mode="Markdown")
    else:
        db.update_stats(user_id, correct=0, wrong=1)
        db.add_error(user_id, lesson, "вопрос", correct, user_answer)
        await callback.message.edit_text(
            f"❌ *Неверно.*\n\nПравильный ответ: *{correct}*",
            parse_mode="Markdown"
        )
    # Возвращаем меню
    lesson_data = get_lesson_data(lesson)
    title = lesson_data.get("title", f"Урок {lesson}")
    await callback.message.answer(
        f"📖 *Урок {lesson}: {title}*\n\nВыберите режим работы:",
        reply_markup=build_menu_keyboard(lesson),
        parse_mode="Markdown"
    )
    await state.clear()
    await callback.answer()

# --- ТЕСТ ---

@dp.callback_query(lambda c: c.data.startswith("test_"))
async def start_test(callback: types.CallbackQuery, state: FSMContext):
    lesson_num = int(callback.data.split("_")[1])
    # Собираем все вопросы из всех типов для данного урока
    lesson_data = get_lesson_data(lesson_num)
    all_questions = []
    for ex_type in ["declension_fill", "translate_greek_to_russian", "translate_russian_to_greek", "case_number",
                    "agreement", "attribute_vs_predicate", "substantivation", "article_fill"]:
        q_list = lesson_data.get("exercises", {}).get(ex_type, [])
        if q_list:
            # Добавляем тип к каждому вопросу
            for q in q_list:
                q["_type"] = ex_type
            all_questions.extend(q_list)
    if not all_questions:
        await callback.answer("Нет вопросов для теста.")
        return
    # Выбираем 7 случайных
    test_questions = shuffle_and_limit(all_questions, 7)
    # Сохраняем в состоянии
    await state.update_data(test_questions=test_questions, test_index=0, test_lesson=lesson_num, test_correct=0)
    await state.set_state(LessonState.in_test)
    # Показываем первый вопрос
    await show_next_test_question(callback.message, state)
    await callback.answer()

async def show_next_test_question(message, state):
    data = await state.get_data()
    questions = data.get("test_questions", [])
    index = data.get("test_index", 0)
    if index >= len(questions):
        # Тест окончен
        correct = data.get("test_correct", 0)
        total = len(questions)
        await message.edit_text(
            f"📊 *Тест завершён!*\n\nПравильных ответов: {correct} из {total}\n\n"
            f"Процент: {round((correct/total)*100)}%",
            parse_mode="Markdown"
        )
        # Возвращаем меню
        lesson = data.get("test_lesson")
        lesson_data = get_lesson_data(lesson)
        title = lesson_data.get("title", f"Урок {lesson}")
        await message.answer(
            f"📖 *Урок {lesson}: {title}*\n\nВыберите режим работы:",
            reply_markup=build_menu_keyboard(lesson),
            parse_mode="Markdown"
        )
        await state.clear()
        return
    # Показываем вопрос
    q = questions[index]
    q_type = q["_type"]
    # Генерируем представление вопроса
    if q_type == "declension_fill":
        # Аналогично generate_declension_question, но используем q
        case_names = {"nom": "Nom.", "gen": "Gen.", "dat": "Dat.", "acc": "Acc.", "voc": "Voc."}
        number_names = {"singular": "ед.ч.", "plural": "мн.ч."}
        question_text = f"Вопрос {index+1}: Вставьте правильную форму для **{case_names.get(q['case'], q['case'])} {number_names.get(q['number'], q['number'])}**"
        options = [q["correct"]] + q.get("distractors", [])
        random.shuffle(options)
        keyboard = InlineKeyboardBuilder()
        for opt in options:
            keyboard.button(text=opt, callback_data=f"test_ans_{opt}")
        keyboard.adjust(2)
        await message.edit_text(
            question_text,
            reply_markup=keyboard.as_markup(),
            parse_mode="Markdown"
        )
        await state.update_data(current_test_q_type=q_type, current_test_q_correct=q["correct"])
    elif q_type == "translate_greek_to_russian":
        question_text = f"Вопрос {index+1}: Переведите на русский:\n\n{q['greek']}"
        await message.edit_text(
            question_text,
            parse_mode="Markdown"
        )
        # Показываем клавиатуру для ввода текста (отмена)
        cancel_kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🔙 Отмена", callback_data="cancel_test")]
        ])
        await message.edit_reply_markup(reply_markup=cancel_kb)
        await state.update_data(current_test_q_type=q_type, current_test_q_keywords=q["keywords"])
    elif q_type == "translate_russian_to_greek":
        question_text = f"Вопрос {index+1}: Переведите на греческий (выберите слова):\n\n{q['russian']}"
        words = q['all_words'].copy()
        random.shuffle(words)
        keyboard = InlineKeyboardBuilder()
        for w in words:
            keyboard.button(text=w, callback_data=f"test_ru_add_{w}")
        keyboard.button(text="✅ Готово", callback_data="test_ru_done")
        keyboard.button(text="🔙 Отмена", callback_data="cancel_test")
        keyboard.adjust(3)
        await message.edit_text(
            question_text,
            reply_markup=keyboard.as_markup(),
            parse_mode="Markdown"
        )
        await state.update_data(current_test_q_type=q_type, current_test_q_correct_seq=q["correct_sequence"], test_chosen_words=[])
    elif q_type == "case_number":
        question_text = f"Вопрос {index+1}: Определите падеж и число для формы:\n\n{q['form']}"
        options = [q["correct"]] + q.get("distractors", [])
        random.shuffle(options)
        keyboard = InlineKeyboardBuilder()
        for opt in options:
            keyboard.button(text=opt, callback_data=f"test_ans_{opt}")
        keyboard.adjust(1)
        await message.edit_text(
            question_text,
            reply_markup=keyboard.as_markup(),
            parse_mode="Markdown"
        )
        await state.update_data(current_test_q_type=q_type, current_test_q_correct=q["correct"])
    elif q_type == "agreement":
        question_text = f"Вопрос {index+1}: Вставьте прилагательное **{q['adjective']}** в правильной форме:\n\n{q['article']} ____ {q['noun']}"
        options = [q["correct"]] + q.get("distractors", [])
        random.shuffle(options)
        keyboard = InlineKeyboardBuilder()
        for opt in options:
            keyboard.button(text=opt, callback_data=f"test_ans_{opt}")
        keyboard.adjust(2)
        await message.edit_text(
            question_text,
            reply_markup=keyboard.as_markup(),
            parse_mode="Markdown"
        )
        await state.update_data(current_test_q_type=q_type, current_test_q_correct=q["correct"])
    elif q_type == "attribute_vs_predicate":
        question_text = f"Вопрос {index+1}: Определите, атрибутив или предикатив:\n\n{q['phrase']}"
        options = [q["correct"]] + q.get("distractors", [])
        random.shuffle(options)
        keyboard = InlineKeyboardBuilder()
        for opt in options:
            keyboard.button(text=opt, callback_data=f"test_ans_{opt}")
        keyboard.adjust(1)
        await message.edit_text(
            question_text,
            reply_markup=keyboard.as_markup(),
            parse_mode="Markdown"
        )
        await state.update_data(current_test_q_type=q_type, current_test_q_correct=q["correct"])
    elif q_type == "substantivation":
        question_text = f"Вопрос {index+1}: Что означает:\n\n{q['phrase']} ?"
        options = [q["correct"]] + q.get("distractors", [])
        random.shuffle(options)
        keyboard = InlineKeyboardBuilder()
        for opt in options:
            keyboard.button(text=opt, callback_data=f"test_ans_{opt}")
        keyboard.adjust(1)
        await message.edit_text(
            question_text,
            reply_markup=keyboard.as_markup(),
            parse_mode="Markdown"
        )
        await state.update_data(current_test_q_type=q_type, current_test_q_correct=q["correct"])
    elif q_type == "article_fill":
        question_text = f"Вопрос {index+1}: Вставьте правильную форму артикля:\n\n____ {q['noun']}"
        options = [q["correct_article"]] + q.get("distractors", [])
        random.shuffle(options)
        keyboard = InlineKeyboardBuilder()
        for opt in options:
            keyboard.button(text=opt, callback_data=f"test_ans_{opt}")
        keyboard.adjust(2)
        await message.edit_text(
            question_text,
            reply_markup=keyboard.as_markup(),
            parse_mode="Markdown"
        )
        await state.update_data(current_test_q_type=q_type, current_test_q_correct=q["correct_article"])

# --- ОБРАБОТЧИКИ ТЕСТОВЫХ ОТВЕТОВ ---

@dp.callback_query(lambda c: c.data.startswith("test_ans_"))
async def test_option_answer(callback: types.CallbackQuery, state: FSMContext):
    data = await state.get_data()
    correct = data.get("current_test_q_correct")
    user_answer = callback.data.split("_", 2)[2]
    user_id = callback.from_user.id
    # Проверяем
    if user_answer == correct:
        db.update_stats(user_id, correct=1)
        new_correct = data.get("test_correct", 0) + 1
        await state.update_data(test_correct=new_correct)
        await callback.message.edit_text("✅ *Верно!*", parse_mode="Markdown")
    else:
        db.update_stats(user_id, correct=0, wrong=1)
        await callback.message.edit_text(
            f"❌ *Неверно.*\n\nПравильный ответ: *{correct}*",
            parse_mode="Markdown"
        )
    # Переходим к следующему вопросу
    index = data.get("test_index", 0) + 1
    await state.update_data(test_index=index)
    await show_next_test_question(callback.message, state)
    await callback.answer()

@dp.callback_query(lambda c: c.data == "test_ru_done")
async def test_ru_done(callback: types.CallbackQuery, state: FSMContext):
    data = await state.get_data()
    correct_seq = data.get("current_test_q_correct_seq", [])
    chosen = data.get("test_chosen_words", [])
    user_id = callback.from_user.id
    if chosen == correct_seq:
        db.update_stats(user_id, correct=1)
        new_correct = data.get("test_correct", 0) + 1
        await state.update_data(test_correct=new_correct)
        await callback.message.edit_text("✅ *Верно!* Порядок слов правильный.", parse_mode="Markdown")
    else:
        db.update_stats(user_id, correct=0, wrong=1)
        await callback.message.edit_text(
            f"❌ *Неверно.*\n\nПравильная последовательность: *{' '.join(correct_seq)}*\n"
            f"Ваша: *{' '.join(chosen)}*",
            parse_mode="Markdown"
        )
    index = data.get("test_index", 0) + 1
    await state.update_data(test_index=index)
    await show_next_test_question(callback.message, state)
    await callback.answer()

@dp.callback_query(lambda c: c.data.startswith("test_ru_add_"))
async def test_ru_add_word(callback: types.CallbackQuery, state: FSMContext):
    word = callback.data.split("_")[3]
    data = await state.get_data()
    chosen = data.get("test_chosen_words", [])
    chosen.append(word)
    await state.update_data(test_chosen_words=chosen)
    # Обновим сообщение
    current_text = callback.message.text
    chosen_str = " ".join(chosen)
    new_text = current_text.split("\n\nВыбрано:")[0] + f"\n\nВыбрано: *{chosen_str}*"
    await callback.message.edit_text(
        new_text,
        reply_markup=callback.message.reply_markup,
        parse_mode="Markdown"
    )
    await callback.answer()

# --- ОТМЕНА УПРАЖНЕНИЙ И ТЕСТА ---

@dp.callback_query(lambda c: c.data == "cancel_exercise")
async def cancel_exercise(callback: types.CallbackQuery, state: FSMContext):
    data = await state.get_data()
    lesson = data.get("lesson", 3)
    await state.clear()
    lesson_data = get_lesson_data(lesson)
    title = lesson_data.get("title", f"Урок {lesson}")
    await callback.message.edit_text(
        f"📖 *Урок {lesson}: {title}*\n\nВыберите режим работы:",
        reply_markup=build_menu_keyboard(lesson),
        parse_mode="Markdown"
    )
    await callback.answer()

@dp.callback_query(lambda c: c.data == "cancel_test")
async def cancel_test(callback: types.CallbackQuery, state: FSMContext):
    data = await state.get_data()
    lesson = data.get("test_lesson", 3)
    await state.clear()
    lesson_data = get_lesson_data(lesson)
    title = lesson_data.get("title", f"Урок {lesson}")
    await callback.message.edit_text(
        f"📖 *Урок {lesson}: {title}*\n\nВыберите режим работы:",
        reply_markup=build_menu_keyboard(lesson),
        parse_mode="Markdown"
    )
    await callback.answer()

# --- СТАТИСТИКА И ПОВТОРЕНИЕ ОШИБОК ---

@dp.callback_query(lambda c: c.data == "stats")
async def show_stats(callback: types.CallbackQuery):
    user_id = callback.from_user.id
    user = db.get_user(user_id)
    if not user:
        await callback.answer("Пользователь не найден.")
        return
    text = (
        "📊 *Ваша статистика*\n\n"
        f"✅ Правильных ответов: {user['total_correct']}\n"
        f"❌ Неправильных: {user['total_wrong']}\n"
        f"📚 Пройдено уроков: {len(user['completed_lessons'])}\n"
        f"🎯 Текущий урок: {user['current_lesson']}\n"
    )
    await callback.message.edit_text(
        text,
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🔙 В главное меню", callback_data="main_menu")]
        ]),
        parse_mode="Markdown"
    )
    await callback.answer()

@dp.callback_query(lambda c: c.data == "repeat_errors")
async def repeat_errors(callback: types.CallbackQuery):
    user_id = callback.from_user.id
    errors = db.get_errors(user_id)
    if not errors or all(len(v) == 0 for v in errors.values()):
        await callback.message.edit_text(
            "🎉 *Ошибок нет!* Вы идеальны!",
            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="🔙 В главное меню", callback_data="main_menu")]
            ]),
            parse_mode="Markdown"
        )
        await callback.answer()
        return
    # Покажем ошибки в виде текста
    lines = []
    for lesson, err_list in errors.items():
        lines.append(f"*Урок {lesson}:*")
        for err in err_list:
            lines.append(f"  • {err['word']} → правильно: {err['correct']}, вы: {err['your']}")
    text = "📝 *Ваши ошибки (для повторения):*\n\n" + "\n".join(lines)
    await callback.message.edit_text(
        text,
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🗑️ Очистить ошибки", callback_data="clear_errors")],
            [InlineKeyboardButton(text="🔙 В главное меню", callback_data="main_menu")]
        ]),
        parse_mode="Markdown"
    )
    await callback.answer()

@dp.callback_query(lambda c: c.data == "clear_errors")
async def clear_errors(callback: types.CallbackQuery):
    user_id = callback.from_user.id
    db.clear_errors(user_id)
    await callback.message.edit_text(
        "🗑️ *Ошибки очищены!*",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🔙 В главное меню", callback_data="main_menu")]
        ]),
        parse_mode="Markdown"
    )
    await callback.answer()

# --- ЗАПУСК ---

async def main():
    db.init_db()
    logging.info("Бот запущен!")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())