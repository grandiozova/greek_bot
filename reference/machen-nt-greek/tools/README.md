# Как этот справочник собран

Одноразовые скрипты, которыми сделан `reference/machen-nt-greek/`.
**К приложению отношения не имеют** — не подключены к `index.html`, не кэшируются
`sw.js`, при работе с сайтом их трогать не надо. Лежат здесь, чтобы результат
можно было проверить и пересобрать, а не принимать на веру.

## Что нужно

- исходный PDF (25 МБ, слой ABBYY FineReader 12) — путь прописан в начале
  `restore.py` и `build_pages.py`, поправьте под себя;
- `pip install pymupdf`;
- Tesseract 5 с моделью `grc` (политонический древнегреческий).
  Без прав администратора ставится так:

  ```
  micromamba create -p ./env -c conda-forge tesseract
  curl -L -o env/share/tessdata/grc.traineddata \
    https://github.com/tesseract-ocr/tessdata_best/raw/main/grc.traineddata
  ```

- корпус MorphGNT в `lex/` (для словарного добора):

  ```
  for b in 61-Mt 62-Mk ... 87-Re; do
    curl -O https://raw.githubusercontent.com/morphgnt/sblgnt/master/$b-morphgnt.txt
  done
  ```

## Порядок запуска

```
python restore.py      <scratch> restored_full.json   # ~25 мин, 8 потоков
python lexfill.py      restored_full.json
python build_pages.py  rows.json restored_full.json
python build_ref.py    <repo> rows.json meta.json lessonfiles.json
python build_data.py   <repo> rows.json meta.json
python build_index.py  <repo> rows.json meta.json
python build_report.py <repo> restored_full.json
```

`<repo>` — корень репозитория, `<scratch>` — папка, где лежит `mm/env` с Tesseract.

## Что делает каждый

| Файл | Роль |
|---|---|
| `restore.py` | Второй проход OCR моделью `grc` по изображениям 600 dpi; сверяет с ABBYY и принимает форму только при совпадении букв. Самый долгий шаг. |
| `lexfill.py` | Добирает остаток по SBLGNT там, где форма с такими буквами ровно одна. |
| `build_pages.py` | Построчная сборка страниц по координатам + подстановка восстановленных форм. |
| `build_ref.py` | Markdown уроков и приложений. |
| `build_data.py` | `data/vocabulary-by-lesson.json`, `data/glossary.json`. |
| `build_index.py` | `INDEX.md`. |
| `build_report.py` | `restoration-report.md`, `data/greek-restoration.json`. |
| `meta.json` | Выверенные вручную названия и темы 33 уроков (из оглавления книги). |

Принцип, который стоит сохранить при доработке: **ничего не додумывать**.
Если два источника разошлись — слово остаётся как было и попадает в отчёт.
Лучше явный пробел, чем правдоподобная выдумка.
