// ============================================================
// УРОКИ ДРЕВНЕЕВРЕЙСКОГО
// ============================================================
// Формат урока — тот же, что в data/lessons.js:
//   { title, grammar, vocabulary: [...], exercises: {...}, translation: {...} }
// Ключ объекта — номер главы пособия, как и у греческого курса.
//
// Главы 1–11 перенесены из reference/nbbs-hebrew (фаза 5 плана в AGENTS.md).
// Материал и предостережения к нему — там же:
//   INDEX.md                — карта глав
//   restoration-report.md   — как расшифрован шрифт, чего проверка не ловит
//   data/vocabulary-by-lesson.json — словарь с частотой каждого слова
//
// Три правила при правке:
//   1. Огласовку не «нормализовать» (NFC переставляет знаки — см. отчёт).
//   2. Еврейский текст помечается в разметке, а не разворачивается вручную:
//      вставка в русской фразе — <span class="script">, ячейка таблицы —
//      <td lang="he">, таблица целиком — <table dir="rtl">. Шрифт и
//      направление приложение подставит само (раздел «Writing direction»
//      в AGENTS.md).
//   3. Еврейское слово не набирается заново, а копируется из справочника.
//      Тест tests/hebrew-content.test.js сверяет каждое слово этого файла
//      с расшифрованным текстом пособия и не пропустит букву, набранную
//      «на глаз»: именно такую ошибку проверка расшифровки поймать не может.
//
// Виды упражнений и форму записи каждого — см. EXERCISE_TYPES в
// js/exercises.js; парадигмы (declension_forms) — шапку js/declension.js.

// ============================================================
// АЛФАВИТ ЕВРЕЙСКОГО КУРСА
// ============================================================
// Пул букв для упражнений глав 1–2. Как и GREEK_ALPHABET в data/lessons.js, он
// даёт видам letter_* вопросы и неверные варианты: 22 буквы переписаны один раз,
// а не по разу на «название», «транслитерацию» и «порядок».
//
// Всё взято из таблицы алфавита и списка конечных форм главы 1 (ниже в файле).
// Три вещи, о которых нужно знать при правке:
//   1. Буква хранится без дагеша (ב, а не בּ): смычное и щелевое произношение —
//      это вопрос о бегадкефат (вид heb_begadkefat), а не о начертании буквы.
//      По той же причине ש хранится без точки: она может быть и син, и шин, и
//      обе читаются разными строками в translit и sound — «š / ś» и «с / ш».
//   2. Гласные (vowels) — сводная таблица огласовки из главы 2. Знак хранится
//      вместе с носителем (ב и огласовка), а не голым: огласовка — это
//      комбинирующий символ, без согласного он не отображается. Камец хатуф в
//      пул не вошёл: он выглядит точно как камец, и один знак с двумя разными
//      ответами в колоде недопустим. Различает их слог, и этим занимается
//      heb_qamets в главе 3.
//   3. Ни одна строка здесь не набрана руками: все они скопированы из
//      справочника reference/nbbs-hebrew и сверены tests/hebrew-content.test.js.
const HEBREW_ALPHABET = {
    letters: [
        {letter:"א", name:"а́леф", translit:"ʾ", sound:"не произносится"},
        {letter:"ב", name:"бет", translit:"b / ḇ", sound:"б / в"},
        {letter:"ג", name:"ги́мел", translit:"g / ḡ", sound:"г"},
        {letter:"ד", name:"да́лет", translit:"d / ḏ", sound:"д"},
        {letter:"ה", name:"хе", translit:"h", sound:"х"},
        {letter:"ו", name:"вав", translit:"w", sound:"в"},
        {letter:"ז", name:"за́йин", translit:"z", sound:"з"},
        {letter:"ח", name:"хет", translit:"ḥ", sound:"х"},
        {letter:"ט", name:"тет", translit:"ṭ", sound:"т"},
        {letter:"י", name:"йод", translit:"y", sound:"й"},
        {letter:"כ", name:"каф", translit:"k / ḵ", sound:"к / х"},
        {letter:"ל", name:"ла́мед", translit:"l", sound:"л"},
        {letter:"מ", name:"мем", translit:"m", sound:"м"},
        {letter:"נ", name:"нун", translit:"n", sound:"н"},
        {letter:"ס", name:"са́мех", translit:"s", sound:"с"},
        {letter:"ע", name:"а́йин", translit:"ʿ", sound:"не произносится"},
        {letter:"פ", name:"пе", translit:"p / p̄", sound:"п / ф"},
        {letter:"צ", name:"ца́де", translit:"ṣ", sound:"ц"},
        {letter:"ק", name:"коф", translit:"q", sound:"к"},
        {letter:"ר", name:"реш", translit:"r", sound:"р"},
        {letter:"ש", name:"син / шин", translit:"ś / š", sound:"с / ш"},
        {letter:"ת", name:"тав", translit:"t / ṯ", sound:"т"}
    ],
    // Конечные формы — пять букв, которые в конце слова пишутся иначе.
    finals: [
        {letter:"כ", final:"ך"},
        {letter:"מ", final:"ם"},
        {letter:"נ", final:"ן"},
        {letter:"פ", final:"ף"},
        {letter:"צ", final:"ץ"}
    ],
    vowels: [
        {sign:"בַּ", name:"патах", sound:"[а]"},
        {sign:"בֶּ", name:"сегол", sound:"[э]"},
        {sign:"בִּ", name:"хирек", sound:"[и]"},
        {sign:"בֻּ", name:"киббуц", sound:"[у]"},
        {sign:"בָּ", name:"камец", sound:"[а]"},
        {sign:"בֵּ", name:"цере", sound:"[э]"},
        {sign:"בֹּ", name:"холем", sound:"[о]"},
        {sign:"בָּה", name:"камец хе", sound:"[а]"},
        {sign:"בֵּי", name:"цере йод", sound:"[э]"},
        {sign:"בִּי", name:"хирек йод", sound:"[и]"},
        {sign:"בּוֹ", name:"холем вав", sound:"[о]"},
        {sign:"בּוּ", name:"шурек", sound:"[у]"},
        {sign:"בֲּ", name:"хатеф-патах", sound:"[а]"},
        {sign:"בֱּ", name:"хатеф-сегол", sound:"[э]"},
        {sign:"בֳּ", name:"хатеф-камец", sound:"[о]"}
    ]
};

const HEBREW_LESSONS_DATA = {
    1: {
        title: "Алфавит",
        grammar: `<b>1. Алфавит</b><br>Древнееврейский алфавит состоит из 22 букв. Направление письма — <b>справа налево</b>. Нужно знать начертание, название, произношение и транслитерацию каждой буквы.<br><table>
<tr><th>Буква</th><th>Название</th><th>Транслит.</th><th>Произн.</th></tr>
<tr><td lang="he">א</td><td>а́леф</td><td>ʾ</td><td>—</td></tr>
<tr><td lang="he">בּ / ב</td><td>бет</td><td>b / ḇ</td><td>б / в</td></tr>
<tr><td lang="he">גּ / ג</td><td>ги́мел</td><td>g / ḡ</td><td>г</td></tr>
<tr><td lang="he">דּ / ד</td><td>да́лет</td><td>d / ḏ</td><td>д</td></tr>
<tr><td lang="he">ה</td><td>хе</td><td>h</td><td>х</td></tr>
<tr><td lang="he">ו</td><td>вав</td><td>w</td><td>в</td></tr>
<tr><td lang="he">ז</td><td>за́йин</td><td>z</td><td>з</td></tr>
<tr><td lang="he">ח</td><td>хет</td><td>ḥ</td><td>х</td></tr>
<tr><td lang="he">ט</td><td>тет</td><td>ṭ</td><td>т</td></tr>
<tr><td lang="he">י</td><td>йод</td><td>y</td><td>й</td></tr>
<tr><td lang="he">כּ / כ (ך)</td><td>каф</td><td>k / ḵ</td><td>к / х</td></tr>
<tr><td lang="he">ל</td><td>ла́мед</td><td>l</td><td>л</td></tr>
<tr><td lang="he">מ (ם)</td><td>мем</td><td>m</td><td>м</td></tr>
<tr><td lang="he">נ (ן)</td><td>нун</td><td>n</td><td>н</td></tr>
<tr><td lang="he">ס</td><td>са́мех</td><td>s</td><td>с</td></tr>
<tr><td lang="he">ע</td><td>а́йин</td><td>ʿ</td><td>—</td></tr>
<tr><td lang="he">פּ / פ (ף)</td><td>пе</td><td>p / p̄</td><td>п / ф</td></tr>
<tr><td lang="he">צ (ץ)</td><td>ца́де</td><td>ṣ</td><td>ц</td></tr>
<tr><td lang="he">ק</td><td>коф</td><td>q</td><td>к</td></tr>
<tr><td lang="he">ר</td><td>реш</td><td>r</td><td>р</td></tr>
<tr><td lang="he">שׂ / שׁ</td><td>син / шин</td><td>ś / š</td><td>с / ш</td></tr>
<tr><td lang="he">תּ / ת</td><td>тав</td><td>t / ṯ</td><td>т</td></tr>
</table><br><br><b>2. Конечные буквы</b><br>Пять букв на конце слова пишутся иначе. Начертание меняется, произношение и транслитерация — нет.<br>• <span class="script">כ</span> → <span class="script">ך</span>, как в <span class="script">דרך</span> «дорога»<br>• <span class="script">מ</span> → <span class="script">ם</span>, как в <span class="script">עם</span> «народ»<br>• <span class="script">נ</span> → <span class="script">ן</span>, как в <span class="script">זקן</span> «старейшина»<br>• <span class="script">פ</span> → <span class="script">ף</span>, как в <span class="script">כסף</span> «серебро»<br>• <span class="script">צ</span> → <span class="script">ץ</span><br><br><b>3. Буквы «бегадкефат»</b><br>Шесть согласных имеют по два произношения — смычное и щелевое. Различает их точка внутри буквы, «слабый» дагеш: с дагешем звук смычный, без него щелевой. «Слабый» дагеш ставится только в этих шести буквах.<br><table>
<tr><th>Смычные</th><td lang="he">בּ</td><td lang="he">גּ</td><td lang="he">דּ</td><td lang="he">כּ</td><td lang="he">פּ</td><td lang="he">תּ</td></tr>
<tr><th>Щелевые</th><td lang="he">ב</td><td lang="he">ג</td><td lang="he">ד</td><td lang="he">כ</td><td lang="he">פ</td><td lang="he">ת</td></tr>
</table><br><br><b>4. Гортанные</b><br>Гортанных согласных четыре: <span class="script">א</span>, <span class="script">ע</span>, <span class="script">ה</span> и <span class="script">ח</span>. Согласный <span class="script">ר</span> тоже часто ведёт себя как гортанный. Гортанные не удваиваются — это понадобится в главе 5.`,
        // Глава 1 — алфавит. Как и в греческом уроке 1, вопросы собраны из
        // HEBREW_ALPHABET, а не переписаны: 22 буквы, их названия,
        // транслитерация и конечные формы лежат там.
        exercises: {
            letter_name: HEBREW_ALPHABET.letters,
            letter_from_name: HEBREW_ALPHABET.letters,
            letter_sound: HEBREW_ALPHABET.letters,
            letter_order: HEBREW_ALPHABET.letters.slice(0, -1),
            heb_letter_translit: HEBREW_ALPHABET.letters,
            heb_letter_final: HEBREW_ALPHABET.finals,
            // Гортанных в пособии четыре: א, ע, ה и ח. Буква ר «тоже часто ведёт
            // себя как гортанный» — в вопрос она не идёт, иначе верных ответов
            // было бы два. Негортанные — первые четыре буквы алфавита из тех,
            // что гортанными не названы.
            heb_letter_guttural: [
                {letter:"א", correct:"Гортанная"},
                {letter:"ע", correct:"Гортанная"},
                {letter:"ה", correct:"Гортанная"},
                {letter:"ח", correct:"Гортанная"},
                {letter:"ב", correct:"Не гортанная"},
                {letter:"ג", correct:"Не гортанная"},
                {letter:"ד", correct:"Не гортанная"},
                {letter:"ו", correct:"Не гортанная"}
            ],
            // Шесть букв бегадкефат: с дагешем смычное, без дагеша щелевое.
            // Подписи те же, что у heb_begadkefat в главе 3, где тот же вопрос
            // задаётся о букве в слове, — иначе один ответ назывался бы двумя
            // способами (это проверяет tests/alphabet.test.js).
            heb_begadkefat: [
                {letter:"בּ", correct:"b, смычное", distractors:["ḇ, щелевое"]},
                {letter:"ב", correct:"ḇ, щелевое", distractors:["b, смычное"]},
                {letter:"גּ", correct:"g, смычное", distractors:["ḡ, щелевое"]},
                {letter:"ג", correct:"ḡ, щелевое", distractors:["g, смычное"]},
                {letter:"דּ", correct:"d, смычное", distractors:["ḏ, щелевое"]},
                {letter:"ד", correct:"ḏ, щелевое", distractors:["d, смычное"]},
                {letter:"כּ", correct:"k, смычное", distractors:["ḵ, щелевое"]},
                {letter:"כ", correct:"ḵ, щелевое", distractors:["k, смычное"]},
                {letter:"פּ", correct:"p, смычное", distractors:["p̄, щелевое"]},
                {letter:"פ", correct:"p̄, щелевое", distractors:["p, смычное"]},
                {letter:"תּ", correct:"t, смычное", distractors:["ṯ, щелевое"]},
                {letter:"ת", correct:"ṯ, щелевое", distractors:["t, смычное"]}
            ]
        }
    },
    2: {
        title: "Гласные древнееврейского языка",
        grammar: `<b>1. Огласовка</b><br>Изначально еврейское письмо состояло из одних согласных. Во второй половине первого тысячелетия нашей эры масореты придумали знаки гласных — <b>огласовку</b>, — которые ставятся под согласным, внутри него или над ним, не меняя самих согласных букв. <i>Гласный произносится после согласного, к которому он относится:</i> <span class="script">בַּ</span> читается «ба», а не «аб».<br><br><b>2. Сводная таблица гласных</b><br>Знаки показаны с согласным <span class="script">בּ</span>, чтобы видеть их положение относительно буквы.<br><table>
<tr><th></th><th>a</th><th>e</th><th>i</th><th>o</th><th>u</th></tr>
<tr><th>Краткие</th><td lang="he">בַּ патах</td><td lang="he">בֶּ сегол</td><td lang="he">בִּ хирек</td><td lang="he">בָּ камец хатуф</td><td lang="he">בֻּ киббуц</td></tr>
<tr><th>Долгие</th><td lang="he">בָּ камец</td><td lang="he">בֵּ цере</td><td></td><td lang="he">בֹּ холем</td><td></td></tr>
<tr><th>Долгие с matres lectionis</th><td lang="he">בָּה камец хе</td><td lang="he">בֵּי цере йод</td><td lang="he">בִּי хирек йод</td><td lang="he">בּוֹ холем вав</td><td lang="he">בּוּ шурек</td></tr>
<tr><th>Сверхкраткие</th><td lang="he">בֲּ хатеф-патах</td><td lang="he">בֱּ хатеф-сегол</td><td></td><td lang="he">בֳּ хатеф-камец</td><td></td></tr>
</table><br><br><b>3. Matres lectionis</b><br>Ещё до изобретения огласовки писцы отмечали долгие гласные согласными буквами:<br>• <span class="script">ה</span> — долгий <i>a</i> на конце слова<br>• <span class="script">י</span> — долгие <i>i</i> и <i>e</i><br>• <span class="script">ו</span> — долгие <i>u</i> и <i>o</i><br><br><b>4. Знак шва</b><br>Знак <span class="script">בְּ</span> называется шва. Он бывает двух видов. «Немое» шва означает отсутствие гласного между согласными: оно не произносится, не транслитерируется и служит разделителем слогов. «Произносимое» шва передаёт очень краткий беглый звук — половину краткого <i>э</i>; в транслитерации это <i>ǝ</i>. Правила различения — в главе 3.<br><br><b>5. «Сильный» дагеш</b><br>Точка внутри согласного бывает не только «слабым» дагешем. <b>«Сильный» дагеш выглядит точно так же, но обозначает удвоение той согласной, внутри которой стоит.</b> Например, в слове <span class="script">הַשָּׁמַיִם</span> «небеса» «сильный» дагеш стоит внутри <span class="script">שׁ</span>. Он может стоять в любом согласном, кроме гортанных и <span class="script">ר</span>.`,
        // Глава 2 — огласовка. Вопросов два об одном и том же знаке: как он
        // называется и какой гласный звук обозначает. Знак лежит с носителем,
        // как в пособии и как в главе 3 (см. HEBREW_ALPHABET.vowels).
        exercises: {
            heb_vowel_name: [
                {sign:"בַּ", correct:"патах", distractors:["камец","камец хе","хатеф-патах"]},
                {sign:"בֶּ", correct:"сегол", distractors:["цере","цере йод","хатеф-сегол"]},
                {sign:"בִּ", correct:"хирек", distractors:["хирек йод","патах","сегол"]},
                {sign:"בֻּ", correct:"киббуц", distractors:["шурек","патах","сегол"]},
                {sign:"בָּ", correct:"камец", distractors:["патах","камец хе","хатеф-патах"]},
                {sign:"בֵּ", correct:"цере", distractors:["сегол","цере йод","хатеф-сегол"]},
                {sign:"בֹּ", correct:"холем", distractors:["холем вав","хатеф-камец","патах"]},
                {sign:"בָּה", correct:"камец хе", distractors:["патах","камец","хатеф-патах"]},
                {sign:"בֵּי", correct:"цере йод", distractors:["сегол","цере","хатеф-сегол"]},
                {sign:"בִּי", correct:"хирек йод", distractors:["хирек","патах","сегол"]},
                {sign:"בּוֹ", correct:"холем вав", distractors:["холем","хатеф-камец","патах"]},
                {sign:"בּוּ", correct:"шурек", distractors:["киббуц","патах","сегол"]},
                {sign:"בֲּ", correct:"хатеф-патах", distractors:["патах","камец","камец хе"]},
                {sign:"בֱּ", correct:"хатеф-сегол", distractors:["сегол","цере","цере йод"]},
                {sign:"בֳּ", correct:"хатеф-камец", distractors:["холем","холем вав","патах"]}
            ],
            heb_vowel_sound: HEBREW_ALPHABET.vowels
        }
    },
    3: {
        title: "Структура слога и правила чтения",
        grammar: `<b>1. Два правила слогораздела</b><br>• <b>Каждый слог начинается с согласного и имеет только один гласный.</b> Слог не может начинаться с гласного. Слово <span class="script">דָּבָר</span> «слово» делится так: <span class="script">דָּ|בָר</span>.<br>• <b>Слогов только два типа: открытые и закрытые.</b> Открытый оканчивается на гласный, закрытый — на согласный. В <span class="script">דָּ|בָר</span> первый слог открытый, второй закрытый.<br><br><b>2. Ударение</b><br>Ударение, как правило, падает на последний слог и тогда не обозначается. Если оно падает не на последний слог, над ударным ставится значок: <span class="script">סֵ֫פֶר</span> «книга» (<span class="script">סֵ֫|פֶר</span>).<br><br><b>3. Дагеш и слогораздел</b><br>«Слабый» дагеш на слогораздел не влияет, «сильный» — влияет: удвоенный согласный служит и концом первого слога, и началом второго. В слове <span class="script">אַתָּה</span> «ты» это даёт <i>ʾat-tāh</i>. Как узнать, какой дагеш стоит в букве «бегадкефат»:<br>• «сильный» — <b>после гласного</b> (<span class="script">אַתָּה</span>: перед <span class="script">תּ</span> стоит патах)<br>• «слабый» — <b>после согласного</b> (<span class="script">מַלְכָּה</span>: перед <span class="script">כּ</span> стоит <span class="script">ל</span> с «немым» шва)<br>• «слабый» — <b>в начале слова</b> (<span class="script">דָּבָר</span>)<br><br><b>4. Знак шва и слогораздел</b><br>Всё сводится к одному: <i>шва не читается, если перед ним стоит краткий гласный; во всех остальных случаях читается.</i> Подробнее — шва <b>не</b> читается:<br>• после краткого гласного: <span class="script">פַּרְעֹה</span><br>• первое из двух стоящих рядом: <span class="script">מִשְׁפְּטֵי</span> (<span class="script">מִשְׁ|פְּ|טֵי</span>)<br>• на конце слова: <span class="script">כָּתַבְתְּ</span><br>• под гортанным: <span class="script">שָׁמַעְתָּ</span><br>Шва <b>читается</b>:<br>• под первой буквой слова: <span class="script">בְּרָכָה</span><br>• второе из двух стоящих рядом: <span class="script">מִשְׁפְּטֵי</span><br>• под буквой с «сильным» дагешем: <span class="script">הַמְּלָכִים</span><br>• после долгого гласного: <span class="script">כֹּתְבִים</span><br><br><b>5. Камец и камец хатуф</b><br>Знаки выглядят одинаково, но камец — это долгий <i>ā</i>, а камец хатуф — краткий <i>o</i>. Камец встречается намного чаще, и в сомнении выбирают его. Правила:<br>• <b>камец хатуф</b> — только в закрытом безударном слоге: <span class="script">חָכְמָה</span> «мудрость», чаще всего слово <span class="script">כָּל</span> «весь»<br>• <b>камец</b> — в открытом предударном или закрытом ударном слоге: оба гласных в <span class="script">דָּבָר</span><br>• значок <b>метег</b> (короткая чёрточка под буквой) встречается с камец, а не с камец хатуф: <span class="script">בָּֽתִּים</span> «дома»`,
        vocabulary: [
            {greek:"יְהוָה", translation:"Яхве, Господь", type:"noun", freq:6828},
            {greek:"בֵּן", translation:"сын, юноша, потомок", type:"noun", freq:4941},
            {greek:"אֱלֹהִים", translation:"Бог, боги", type:"noun", freq:2602},
            {greek:"מֶ֫לֶךְ", translation:"царь, царский", type:"noun", freq:2530},
            {greek:"יִשְׂרָאֵל", translation:"Израиль", type:"noun", freq:2507},
            {greek:"אֶ֫רֶץ", translation:"земля, страна", type:"noun", freq:2505},
            {greek:"יוֹם", translation:"день, сегодня, время", type:"noun", freq:2301},
            {greek:"בַּ֫יִת", translation:"дом", type:"noun", freq:2047},
            {greek:"דָּבָר", translation:"слово, дело, вещь", type:"noun", freq:1454},
            {greek:"אָב", translation:"отец, праотец", type:"noun", freq:1211},
            {greek:"שָׁנָה", translation:"год, ежегодный", type:"noun", freq:878},
            {greek:"שֵׁם", translation:"имя (известность, слава), Сим", type:"noun", freq:864},
            {greek:"עֶ֫בֶד", translation:"слуга, раб", type:"noun", freq:803},
            {greek:"מֹשֶׁה", translation:"Моисей", type:"noun", freq:766},
            {greek:"מִצְרַ֫יִם", translation:"Египет", type:"noun", freq:682},
            {greek:"יְרוּשָׁלִַם", translation:"Иерусалим", type:"noun", freq:643},
            {greek:"אָדָם", translation:"человек, Адам, человечество", type:"noun", freq:562},
            {greek:"אֵל", translation:"Бог, бог (любое божество), Эль", type:"noun", freq:317},
            {greek:"פַּרְעֹה", translation:"фараон", type:"noun", freq:274},
            {greek:"סוּס", translation:"лошадь, конь, наездник", type:"noun", freq:138},
        ],
        exercises: {
            heb_vowel_name: [
                {sign:"בַּ", correct:"патах", distractors:["сегол","хирек","киббуц"]},
                {sign:"בֶּ", correct:"сегол", distractors:["патах","цере","хирек"]},
                {sign:"בִּ", correct:"хирек", distractors:["киббуц","цере","холем"]},
                {sign:"בֻּ", correct:"киббуц", distractors:["хирек","шурек","холем"]},
                {sign:"בֵּ", correct:"цере", distractors:["сегол","камец","холем"]},
                {sign:"בֹּ", correct:"холем", distractors:["камец","киббуц","цере"]},
                {sign:"בָּ", correct:"камец", distractors:["патах","холем","цере"]},
                {sign:"בְּ", correct:"шва", distractors:["хатеф-патах","хирек","сегол"]},
                {sign:"בּוּ", correct:"шурек", distractors:["холем вав","киббуц","хирек йод"]},
                {sign:"בּוֹ", correct:"холем вав", distractors:["шурек","камец хе","цере йод"]}
            ],
            heb_vowel_fill: [
                {word:"דָּב_ר", translation:"слово", correct:"בָּ", distractors:["בַּ","בֶּ","בֹּ"]},
                {word:"מ_לֶךְ", translation:"царь", correct:"בֶּ", distractors:["בַּ","בָּ","בִּ"]},
                {word:"ס_פֶר", translation:"книга", correct:"בֵּ", distractors:["בֶּ","בַּ","בִּ"]}
            ],
            heb_shva: [
                {word:"פַּרְעֹה", letter:"ר", correct:"«Немое» шва"},
                {word:"שָׁמַעְתָּ", letter:"ע", correct:"«Немое» шва"},
                {word:"כָּתַבְתְּ", letter:"ת", correct:"«Немое» шва"},
                {word:"מִשְׁפְּטֵי", letter:"שׁ", correct:"«Немое» шва"},
                {word:"מִשְׁפְּטֵי", letter:"פּ", correct:"«Произносимое» шва"},
                {word:"בְּרָכָה", letter:"בּ", correct:"«Произносимое» шва"},
                {word:"הַמְּלָכִים", letter:"מּ", correct:"«Произносимое» шва"},
                {word:"כֹּתְבִים", letter:"ת", correct:"«Произносимое» шва"}
            ],
            heb_dagesh: [
                {word:"אַתָּה", letter:"תּ", correct:"«Сильный» дагеш"},
                {word:"הַמְּלָכִים", letter:"מּ", correct:"«Сильный» дагеш"},
                {word:"הַשָּׁמַיִם", letter:"שּׁ", correct:"«Сильный» дагеш"},
                {word:"מַלְכָּה", letter:"כּ", correct:"«Слабый» дагеш"},
                {word:"דָּבָר", letter:"דּ", correct:"«Слабый» дагеш"},
                {word:"תּוֹרָה", letter:"תּ", correct:"«Слабый» дагеш"}
            ],
            heb_qamets: [
                {word:"חָכְמָה", letter:"ח", correct:"Камец хатуф — краткий o"},
                {word:"כָּל", correct:"Камец хатуф — краткий o"},
                {word:"דָּבָר", letter:"דּ", correct:"Камец — долгий ā"},
                {word:"בָּֽתִּים", letter:"בּ", correct:"Камец — долгий ā"},
                {word:"שָׁנָה", letter:"נ", correct:"Камец — долгий ā"}
            ],
            heb_syllables: [
                {word:"דָּבָר", correct:"דָּ|בָר", distractors:["דָּבָ|ר","דָּ|בָ|ר"]},
                {word:"סֵ֫פֶר", correct:"סֵ֫|פֶר", distractors:["סֵ֫פֶ|ר","סֵ֫|פֶ|ר"]},
                {word:"דְּבָרִים", correct:"דְּ|בָ|רִים", distractors:["דְּ|בָרִ|ים","דְּ|בָרִי|ם","דְּבָ|רִ|ים"]},
                {word:"סְפָרִים", correct:"סְ|פָ|רִים", distractors:["סְ|פָרִ|ים","סְ|פָרִי|ם","סְפָ|רִ|ים"]},
                {word:"חֻקָּה", correct:"חֻ|קָּה", distractors:["חֻקָּ|ה","חֻ|קָּ|ה"]},
                {word:"יַבָּשָׁה", correct:"יַ|בָּ|שָׁה", distractors:["יַ|בָּשָׁ|ה","יַבָּ|שָׁ|ה","יַ|בָּ|שָׁ|ה"]},
                {word:"אוּרִיָּה", correct:"אוּ|רִ|יָּה", distractors:["א|וּ|רִיָּה","א|וּרִ|יָּה","א|וּרִיָּ|ה"]},
                {word:"תְּפִלָּה", correct:"תְּ|פִ|לָּה", distractors:["תְּ|פִלָּ|ה","תְּפִ|לָּ|ה","תְּ|פִ|לָּ|ה"]},
                {word:"מִשְׁפְּטֵי", correct:"מִשְׁ|פְּ|טֵי", distractors:["מִ|שְׁ|פְּטֵי","מִ|שְׁפְּ|טֵי","מִ|שְׁפְּטֵ|י"]},
            ],
            heb_begadkefat: [
                {word:"בַּ֫יִת", letter:"בּ", correct:"b, смычное", distractors:["ḇ, щелевое"]},
                {word:"דָּבָר", letter:"ב", correct:"ḇ, щелевое", distractors:["b, смычное"]},
                {word:"מַלְכָּה", letter:"כּ", correct:"k, смычное", distractors:["ḵ, щелевое"]},
                {word:"מֶ֫לֶךְ", letter:"ךְ", correct:"ḵ, щелевое", distractors:["k, смычное"]},
                {word:"סֵ֫פֶר", letter:"פ", correct:"p̄, щелевое", distractors:["p, смычное"]},
                {word:"תּוֹרָה", letter:"תּ", correct:"t, смычное", distractors:["ṯ, щелевое"]}
            ],
            translate_greek_to_russian: [
                {greek:"יְהוָה", keywords:["Яхве"]},
                {greek:"בֵּן", keywords:["сын"]},
                {greek:"אֱלֹהִים", keywords:["Бог"]},
                {greek:"מֶ֫לֶךְ", keywords:["царь"]},
                {greek:"יִשְׂרָאֵל", keywords:["Израиль"]},
                {greek:"אֶ֫רֶץ", keywords:["земля"]},
                {greek:"יוֹם", keywords:["день"]},
                {greek:"בַּ֫יִת", keywords:["дом"]},
                {greek:"דָּבָר", keywords:["слово"]},
                {greek:"אָב", keywords:["отец"]},
            ],
            translate_russian_to_greek: [
                {russian:"Яхве", correct_sequence:["יְהוָה"], all_words:["יְרוּשָׁלִַם","יְהוָה","פַּרְעֹה","סוּס"]},
                {russian:"сын", correct_sequence:["בֵּן"], all_words:["אֵל","אָדָם","בֵּן","יוֹם"]},
                {russian:"Бог", correct_sequence:["אֱלֹהִים"], all_words:["מֶ֫לֶךְ","שָׁנָה","אֶ֫רֶץ","אֱלֹהִים"]},
                {russian:"царь", correct_sequence:["מֶ֫לֶךְ"], all_words:["יְרוּשָׁלִַם","יוֹם","יְהוָה","מֶ֫לֶךְ"]},
                {russian:"Израиль", correct_sequence:["יִשְׂרָאֵל"], all_words:["יִשְׂרָאֵל","דָּבָר","בַּ֫יִת","יְהוָה"]},
                {russian:"земля", correct_sequence:["אֶ֫רֶץ"], all_words:["אֶ֫רֶץ","אֵל","בַּ֫יִת","סוּס"]},
                {russian:"день", correct_sequence:["יוֹם"], all_words:["יוֹם","אָדָם","יְהוָה","אֱלֹהִים"]},
                {russian:"дом", correct_sequence:["בַּ֫יִת"], all_words:["אֱלֹהִים","בַּ֫יִת","מִצְרַ֫יִם","פַּרְעֹה"]},
                {russian:"слово", correct_sequence:["דָּבָר"], all_words:["אֵל","יְהוָה","שָׁנָה","דָּבָר"]},
                {russian:"отец", correct_sequence:["אָב"], all_words:["מֹשֶׁה","מֶ֫לֶךְ","אָב","שָׁנָה"]},
            ]
        }
    },
    4: {
        title: "Имя существительное",
        grammar: `<b>1. Род и число</b><br>У существительного есть род и число. Род всегда один из двух — мужской или женский; среднего рода нет. Чисел три: единственное, множественное и <b>двойственное</b>.<br><br><b>2. Окончания</b><br>• Мужской род ед. числа окончания не имеет: <span class="script">סוּס</span> «конь»<br>• Мужской род мн. числа — <span class="script">יִם</span>: <span class="script">סוּסִים</span><br>• Женский род ед. числа чаще всего <span class="script">הָ</span>: <span class="script">תּוֹרָה</span> «закон»; известны и другие окончания<br>• Женский род мн. числа — <span class="script">וֹת</span>: <span class="script">תּוֹרוֹת</span><br>• Двойственное число — <span class="script">יִַם</span>: <span class="script">מַ֫יִם</span> «вода», <span class="script">שָׁמַיִם</span> «небеса»<br><br><b>3. Словарная форма</b><br>В словаре существительное стоит в единственном числе. Форму множественного числа приходится запоминать: основа при этом нередко меняется.<br><br><b>4. Исключения</b><br>Правила не покрывают всего. Встречаются существительные женского рода без женского окончания (<span class="script">אֶ֫רֶץ</span> «земля», <span class="script">נֶ֫פֶשׁ</span> «душа»), слова, заимствующие окончание другого рода, особые формы двойственного числа и неправильное изменение основы.`,
        vocabulary: [
            {greek:"אִישׁ", translation:"человек, мужчина, муж", type:"noun", freq:2198},
            {greek:"עִיר", translation:"город", type:"noun", freq:1095},
            {greek:"עַ֫יִן", translation:"глаз, зрение", type:"noun", freq:900},
            {greek:"לֵב", translation:"сердце", type:"noun", freq:854},
            {greek:"אִשָּׁה", translation:"женщина, жена", type:"noun", freq:779},
            {greek:"אֲדֹנָי", translation:"Господь", type:"noun", freq:774},
            {greek:"נֶ֫פֶשׁ", translation:"жизнь, душа", type:"noun", freq:757},
            {greek:"כֹּהֵן", translation:"священник, жрец", type:"noun", freq:750},
            {greek:"דֶּ֫רֶךְ", translation:"дорога, путь, путешествие", type:"noun", freq:712},
            {greek:"אָח", translation:"брат", type:"noun", freq:629},
            {greek:"בַּת", translation:"дочь", type:"noun", freq:603},
            {greek:"רֹאשׁ", translation:"голова, глава (предводитель)", type:"noun", freq:600},
            {greek:"מַ֫יִם", translation:"вода", type:"noun", freq:586},
            {greek:"גּוֹי", translation:"народ", type:"noun", freq:560},
            {greek:"הַר", translation:"гора, холм, нагорная страна", type:"noun", freq:558},
            {greek:"קוֹל", translation:"голос, звук, шум, гром", type:"noun", freq:505},
            {greek:"צָבָא", translation:"войско, воинство, война", type:"noun", freq:486},
            {greek:"נָבִיא", translation:"пророк", type:"noun", freq:317},
            {greek:"תּוֹרָה", translation:"закон, учение, Тора", type:"noun", freq:223},
            {greek:"סֵ֫פֶר", translation:"книга, свиток", type:"noun", freq:191},
        ],
        exercises: {
            heb_gender_number: [
                {word:"סוּס", correct:"Муж. р., ед. ч."},
                {word:"מֶ֫לֶךְ", correct:"Муж. р., ед. ч."},
                {word:"בַּ֫יִת", correct:"Муж. р., ед. ч."},
                {word:"תּוֹרָה", correct:"Жен. р., ед. ч."},
                {word:"אִשָּׁה", correct:"Жен. р., ед. ч."},
                {word:"אֶ֫רֶץ", correct:"Жен. р., ед. ч."},
                {word:"נֶ֫פֶשׁ", correct:"Жен. р., ед. ч."},
                {word:"דְּבָרִים", correct:"Муж. р., мн. ч."},
                {word:"סְפָרִים", correct:"Муж. р., мн. ч."},
                {word:"אֲנָשִׁים", correct:"Муж. р., мн. ч."},
                {word:"נָשִׁים", correct:"Жен. р., мн. ч."},
                {word:"תּוֹרוֹת", correct:"Жен. р., мн. ч."},
                {word:"מַ֫יִם", correct:"Двойственное число"},
                {word:"שָׁמַיִם", correct:"Двойственное число"},
                {word:"מִצְרַ֫יִם", correct:"Двойственное число"}
            ],
            translate_greek_to_russian: [
                {greek:"אִישׁ", keywords:["человек"]},
                {greek:"עִיר", keywords:["город"]},
                {greek:"עַ֫יִן", keywords:["глаз"]},
                {greek:"לֵב", keywords:["сердце"]},
                {greek:"אִשָּׁה", keywords:["женщина"]},
                {greek:"אֲדֹנָי", keywords:["Господь"]},
                {greek:"נֶ֫פֶשׁ", keywords:["жизнь"]},
                {greek:"כֹּהֵן", keywords:["священник"]},
                {greek:"דֶּ֫רֶךְ", keywords:["дорога"]},
                {greek:"אָח", keywords:["брат"]},
            ],
            translate_russian_to_greek: [
                {russian:"человек", correct_sequence:["אִישׁ"], all_words:["תּוֹרָה","כֹּהֵן","עִיר","אִישׁ"]},
                {russian:"город", correct_sequence:["עִיר"], all_words:["עִיר","לֵב","הַר","גּוֹי"]},
                {russian:"глаз", correct_sequence:["עַ֫יִן"], all_words:["בַּת","רֹאשׁ","עַ֫יִן","לֵב"]},
                {russian:"сердце", correct_sequence:["לֵב"], all_words:["אִשָּׁה","אֲדֹנָי","דֶּ֫רֶךְ","לֵב"]},
                {russian:"женщина", correct_sequence:["אִשָּׁה"], all_words:["צָבָא","אִשָּׁה","נֶ֫פֶשׁ","קוֹל"]},
                {russian:"Господь", correct_sequence:["אֲדֹנָי"], all_words:["גּוֹי","הַר","אִשָּׁה","אֲדֹנָי"]},
                {russian:"жизнь", correct_sequence:["נֶ֫פֶשׁ"], all_words:["כֹּהֵן","אָח","נֶ֫פֶשׁ","אִישׁ"]},
                {russian:"священник", correct_sequence:["כֹּהֵן"], all_words:["אֲדֹנָי","גּוֹי","לֵב","כֹּהֵן"]},
                {russian:"дорога", correct_sequence:["דֶּ֫רֶךְ"], all_words:["דֶּ֫רֶךְ","אִישׁ","קוֹל","אָח"]},
                {russian:"брат", correct_sequence:["אָח"], all_words:["תּוֹרָה","אָח","סֵ֫פֶר","עַ֫יִן"]},
            ]
        }
    },
    5: {
        title: "Определённый артикль и союз вав",
        grammar: `<b>1. Форма артикля</b><br>Определённый артикль есть, неопределённого нет. Артикль имеет форму <span class="script">הַ</span> и пишется слитно со словом, а <b>первый согласный слова при этом удваивается</b> — на письме это «сильный» дагеш: <span class="script">מֶ֫לֶךְ</span> «царь» → <span class="script">הַמֶּ֫לֶךְ</span> «(этот) царь».<br><br><b>2. Артикль и «бегадкефат»</b><br>Если слово начинается на букву «бегадкефат», «слабый» дагеш замещается «сильным»: <span class="script">בַּ֫יִת</span> → <span class="script">הַבַּ֫יִת</span>, <span class="script">דֶּ֫רֶךְ</span> → <span class="script">הַדֶּ֫רֶךְ</span>.<br><br><b>3. Артикль и гортанные</b><br>Гортанные (<span class="script">א</span>, <span class="script">ע</span>, <span class="script">ה</span>, <span class="script">ח</span>) и <span class="script">ר</span> не удваиваются. Вместо удвоения происходит одно из трёх:<br>• <b>Заместительное удлинение</b> — перед <span class="script">א</span>, <span class="script">ע</span>, <span class="script">ר</span> патах артикля удлиняется до камец: <span class="script">אִישׁ</span> → <span class="script">הָאִישׁ</span>, <span class="script">עִיר</span> → <span class="script">הָעִיר</span><br>• <b>Скрытое удвоение</b> — перед <span class="script">ה</span> и <span class="script">ח</span> гласный не удлиняется: <span class="script">הֵיכָל</span> → <span class="script">הַהֵיכָל</span>, <span class="script">חוֹמָה</span> → <span class="script">הַחוֹמָה</span><br>• <b>Неправильный сегол</b> — перед безударными <span class="script">עָ</span>, <span class="script">הָ</span>, <span class="script">חָ</span> гласный артикля становится сеголом: <span class="script">חָכָם</span> → <span class="script">הֶחָכָם</span><br><br><b>4. Что остаётся неизменным</b><br>Как бы ни менялась огласовка, согласный <span class="script">ה</span> артикля присутствует всегда. У небольшой группы слов присоединение артикля меняет и гласный основы: <span class="script">אֶ֫רֶץ</span> → <span class="script">הָאָ֫רֶץ</span>, <span class="script">עַם</span> → <span class="script">הָעָם</span>.<br><br><b>5. Союз вав</b><br>Союз «и» — <span class="script">וְ</span> — тоже пишется слитно и имеет четыре основные формы написания: <span class="script">וְעֶ֫בֶד</span> «и слуга», <span class="script">וְהָאִשָּׁה</span> «и (эта) женщина».`,
        vocabulary: [
            {greek:"וְ", translation:"и, а, также, даже", type:"conjunction", freq:51524},
            {greek:"כֹּה", translation:"так", type:"adverb", freq:577},
            {greek:"עוֹלָם", translation:"вечность, вечный, бесконечный", type:"noun", freq:439},
            {greek:"מִשְׁפָּט", translation:"правосудие, суд, приговор, справедливость", type:"noun", freq:425},
            {greek:"שַׂר", translation:"вельможа, чиновник", type:"noun", freq:425},
            {greek:"שָׁמַיִם", translation:"небо, небеса, космос", type:"noun", freq:421},
            {greek:"חֶרֶב", translation:"меч", type:"noun", freq:413},
            {greek:"כֶּ֫סֶף", translation:"серебро, деньги", type:"noun", freq:403},
            {greek:"מִזְבֵּחַ", translation:"жертвенник", type:"noun", freq:403},
            {greek:"מָקוֹם", translation:"место", type:"noun", freq:401},
            {greek:"יָם", translation:"море, запад, берег моря", type:"noun", freq:396},
            {greek:"זָהָב", translation:"золото, золотой", type:"noun", freq:392},
            {greek:"רוּחַ", translation:"ветер, дух, дыхание", type:"noun", freq:378},
            {greek:"אֵשׁ", translation:"огонь, пламя", type:"noun", freq:376},
            {greek:"נְאֻם", translation:"высказывание, изречение", type:"noun", freq:376},
            {greek:"שַׁ֫עַר", translation:"ворота", type:"noun", freq:375},
            {greek:"חַי", translation:"живой", type:"adjective", freq:255},
            {greek:"יֶ֫לֶד", translation:"мальчик, ребёнок", type:"noun", freq:89},
            {greek:"עָנָן", translation:"облако, облака", type:"noun", freq:87},
            {greek:"הֵיכָל", translation:"дворец, храм", type:"noun", freq:80},
        ],
        exercises: {
            article_fill: [
                {noun:"מֶ֫לֶךְ", correct_article:"הַ", distractors:["הָ","הֶ"]},
                {noun:"נָבִיא", correct_article:"הַ", distractors:["הָ","הֶ"]},
                {noun:"סוּס", correct_article:"הַ", distractors:["הָ","הֶ"]},
                {noun:"בַּ֫יִת", correct_article:"הַ", distractors:["הָ","הֶ"]},
                {noun:"הֵיכָל", correct_article:"הַ", distractors:["הָ","הֶ"]},
                {noun:"אִישׁ", correct_article:"הָ", distractors:["הַ","הֶ"]},
                {noun:"אִשָּׁה", correct_article:"הָ", distractors:["הַ","הֶ"]},
                {noun:"עִיר", correct_article:"הָ", distractors:["הַ","הֶ"]},
                {noun:"רֹאשׁ", correct_article:"הָ", distractors:["הַ","הֶ"]},
                {noun:"חָכָם", correct_article:"הֶ", distractors:["הַ","הָ"]}
            ],
            heb_gutturals: [
                {phrase:"הָאִישׁ", correct:"Заместительное удлинение"},
                {phrase:"הָעִיר", correct:"Заместительное удлинение"},
                {phrase:"הָרֹאשׁ", correct:"Заместительное удлинение"},
                {phrase:"הָאִשָּׁה", correct:"Заместительное удлинение"},
                {phrase:"הַהֵיכָל", correct:"Скрытое удвоение гортанного"},
                {phrase:"הַחוֹמָה", correct:"Скрытое удвоение гортанного"},
                {phrase:"הֶחָכָם", correct:"Неправильный сегол"},
                {phrase:"הַמֶּ֫לֶךְ", correct:"Обычное удвоение"},
                {phrase:"הַנָּבִיא", correct:"Обычное удвоение"},
                {phrase:"הַסּוּס", correct:"Обычное удвоение"}
            ],
            translate_greek_to_russian: [
                {greek:"כֹּה", keywords:["так"]},
                {greek:"עוֹלָם", keywords:["вечность"]},
                {greek:"מִשְׁפָּט", keywords:["правосудие"]},
                {greek:"שַׂר", keywords:["вельможа"]},
                {greek:"שָׁמַיִם", keywords:["небо"]},
                {greek:"חֶרֶב", keywords:["меч"]},
                {greek:"כֶּ֫סֶף", keywords:["серебро"]},
                {greek:"מִזְבֵּחַ", keywords:["жертвенник"]},
                {greek:"מָקוֹם", keywords:["место"]},
                {greek:"יָם", keywords:["море"]},
            ],
            translate_russian_to_greek: [
                {russian:"так", correct_sequence:["כֹּה"], all_words:["רוּחַ","וְ","כֹּה","עָנָן"]},
                {russian:"вечность", correct_sequence:["עוֹלָם"], all_words:["אֵשׁ","עוֹלָם","שָׁמַיִם","הֵיכָל"]},
                {russian:"правосудие", correct_sequence:["מִשְׁפָּט"], all_words:["עָנָן","מִזְבֵּחַ","מִשְׁפָּט","יָם"]},
                {russian:"вельможа", correct_sequence:["שַׂר"], all_words:["אֵשׁ","חַי","שַׂר","עוֹלָם"]},
                {russian:"небо", correct_sequence:["שָׁמַיִם"], all_words:["יֶ֫לֶד","מִשְׁפָּט","שָׁמַיִם","כֹּה"]},
                {russian:"меч", correct_sequence:["חֶרֶב"], all_words:["מָקוֹם","חֶרֶב","חַי","נְאֻם"]},
                {russian:"серебро", correct_sequence:["כֶּ֫סֶף"], all_words:["עוֹלָם","כֶּ֫סֶף","שַׂר","מִזְבֵּחַ"]},
                {russian:"жертвенник", correct_sequence:["מִזְבֵּחַ"], all_words:["חֶרֶב","מָקוֹם","עָנָן","מִזְבֵּחַ"]},
                {russian:"место", correct_sequence:["מָקוֹם"], all_words:["נְאֻם","שַׁ֫עַר","כֶּ֫סֶף","מָקוֹם"]},
                {russian:"море", correct_sequence:["יָם"], all_words:["רוּחַ","יֶ֫לֶד","יָם","מָקוֹם"]},
            ]
        }
    },
    6: {
        title: "Предлоги",
        grammar: `<b>1. Три группы предлогов</b><br>Предлоги бывают независимые (пишутся отдельным словом), присоединяющиеся через маккеф (короткую чёрточку <span class="script">־</span>) и слитные, которые пишутся вместе со словом.<br><br><b>2. Слитные предлоги</b><br>Их всего три, но вместе они встречаются в Еврейской Библии почти 39 000 раз:<br>• <span class="script">בְּ</span> — «в», передаёт также значение творительного падежа<br>• <span class="script">לְ</span> — «к», передаёт значение дательного падежа<br>• <span class="script">כְּ</span> — «как»<br>Перед большинством согласных они пишутся с «произносимым» шва: <span class="script">בְּשָׂדֶה</span> «в поле», <span class="script">לְנַ֫עַר</span> «к молодому человеку», <span class="script">כְּמֶ֫לֶךְ</span> «как царь». Если слово начинается гортанным со сверхкратким гласным, предлог берёт краткий гласный того же качества: <span class="script">כַּאֲנָשִׁים</span> «как люди», <span class="script">בֶּאֱמֶת</span> «в истине».<br><br><b>3. Предлог мин</b><br>Предлог <span class="script">מִן</span> «от, из» присоединяется через маккеф или пишется слитно; при слитном написании <span class="script">נ</span> ассимилирует в первый согласный слова. Им же выражают сравнительную и превосходную степень и указание на часть целого.<br><br><b>4. Показатель прямого дополнения</b><br>Определённое прямое дополнение обычно отмечается частицей <span class="script">אֶת־</span> / <span class="script">אֵת</span>. <b>Она не переводится</b> — это грамматический указатель, а не предлог: <span class="script">בָּרָא אֱלֹהִים אֵת הַשָּׁמַ֫יִם</span> «Бог сотворил (эти) небеса».`,
        vocabulary: [
            {greek:"לְ", translation:"к, для", type:"preposition", freq:20320},
            {greek:"בְּ", translation:"в, передаёт значение творительного падежа", type:"preposition", freq:15559},
            {greek:"אֵת", translation:"показатель прямого дополнения, не переводится", type:"particle", freq:10978},
            {greek:"מִן", translation:"от, из", type:"preposition", freq:7592},
            {greek:"עַל", translation:"на, над, около", type:"preposition", freq:5777},
            {greek:"אֶל", translation:"к", type:"preposition", freq:5518},
            {greek:"כֹּל", translation:"весь, целый", type:"noun", freq:5415},
            {greek:"כְּ", translation:"как, подобно, в соответствии с", type:"preposition", freq:3053},
            {greek:"עַד", translation:"о пространстве: до, вплоть до", type:"preposition", freq:1263},
            {greek:"לִפְנֵי", translation:"перед, в присутствии", type:"preposition", freq:1102},
            {greek:"עִם", translation:"с, вместе с", type:"preposition", freq:1048},
            {greek:"אַחַר", translation:"за, после", type:"preposition", freq:718},
            {greek:"תַּ֫חַת", translation:"под, внизу, вместо", type:"preposition", freq:510},
            {greek:"פֶּה", translation:"рот, край, отверстие", type:"noun", freq:498},
            {greek:"בְּתוֹךְ", translation:"среди, внутри", type:"preposition", freq:420},
            {greek:"בֵּין", translation:"между, среди", type:"preposition", freq:409},
            {greek:"שָׂדֶה", translation:"поле, земля", type:"noun", freq:329},
            {greek:"לְמַ֫עַן", translation:"чтобы", type:"conjunction", freq:272},
            {greek:"מִצְוָה", translation:"приказ, заповедь", type:"noun", freq:184},
            {greek:"חָכְמָה", translation:"мудрость", type:"noun", freq:153},
            {greek:"מַ֫עַל", translation:"наверху, над", type:"preposition", freq:140},
            {greek:"עַל־דְּבַר", translation:"ради, из-за", type:"preposition", freq:46},
        ],
        exercises: {
            translate_greek_to_russian: [
                {greek:"כֹּל", keywords:["весь"]},
                {greek:"פֶּה", keywords:["рот"]},
                {greek:"שָׂדֶה", keywords:["поле"]},
                {greek:"מִצְוָה", keywords:["приказ"]},
                {greek:"חָכְמָה", keywords:["мудрость"]},
            ],
            translate_russian_to_greek: [
                {russian:"весь", correct_sequence:["כֹּל"], all_words:["אַחַר","כֹּל","בֵּין","עַל"]},
                {russian:"рот", correct_sequence:["פֶּה"], all_words:["לְ","אַחַר","פֶּה","שָׂדֶה"]},
                {russian:"поле", correct_sequence:["שָׂדֶה"], all_words:["בֵּין","מַ֫עַל","אֵת","שָׂדֶה"]},
                {russian:"приказ", correct_sequence:["מִצְוָה"], all_words:["אֵת","עַל","עִם","מִצְוָה"]},
                {russian:"мудрость", correct_sequence:["חָכְמָה"], all_words:["עִם","בְּ","חָכְמָה","עַל"]},
            ]
        },
        translation: {
            el_to_ru: [
                {source:"בָּרָא אֱלֹהִים אֵת הַשָּׁמַ֫יִם", correct:"Бог сотворил эти небеса"},
                {source:"נָתַן הַנָּבִיא אֶת־הַסֵּ֫פֶר לַמֶּ֫לֶךְ", correct:"Пророк отдал эту книгу царю"},
                {source:"בָּנָה הַמֶּ֫לֶךְ אֶת־הַהֵיכָל הַגָּדוֹל", correct:"Царь построил этот великий храм"},
                {source:"שָׁלַח הַנָּבִיא אֶת־הַמַּלְאָךְ אֶל־הָעִיר", correct:"Пророк отправил этого посланника в город"},
                {source:"אָהַב דָּוִד אֶת־יְהוֹנָתָן", correct:"Давид любил Ионафана"}
            ],
            ru_to_el: [
                {source:"Бог сотворил эти небеса", correct:"בָּרָא אֱלֹהִים אֵת הַשָּׁמַ֫יִם"},
                {source:"Царь построил великий храм", correct:"בָּנָה הַמֶּ֫לֶךְ הֵיכָל גָּדוֹל"},
                {source:"Давид любил Ионафана", correct:"אָהַב דָּוִד אֶת־יְהוֹנָתָן"},
                {source:"Пророк отправил этого посланника в город", correct:"שָׁלַח הַנָּבִיא אֶת־הַמַּלְאָךְ אֶל־הָעִיר"}
            ]
        }
    },
    7: {
        title: "Имя прилагательное",
        grammar: `<b>1. Склонение</b><br>У прилагательного четыре формы. Окончания те же, что у существительного.<br><table dir="rtl">
<tr><th></th><th>Муж. род</th><th>Жен. род</th></tr>
<tr><th>Ед. число</th><td lang="he">טוֹב</td><td lang="he">טוֹבָה</td></tr>
<tr><th>Множ. число</th><td lang="he">טוֹבִים</td><td lang="he">טוֹבוֹת</td></tr>
</table><br><br><b>2. Три употребления</b><br>• <b>Определение</b> (атрибутив) стоит <i>после</i> существительного и согласуется с ним в роде, числе <i>и определённости</i>: <span class="script">הָאִישׁ הַטּוֹב</span> «(этот) добрый человек» — артикль стоит и при существительном, и при прилагательном.<br>• <b>Сказуемое</b> (предикатив) согласуется в роде и числе, но <i>не</i> в определённости: артикля перед ним нет: <span class="script">טוֹב הָאִישׁ</span> или <span class="script">הָאִישׁ טוֹב</span> «(Этот) человек добр».<br>• <b>Субстантив</b> — прилагательное в роли существительного.<br><br><b>3. Направительное окончание</b><br>Окончание <span class="script">הָ</span> означает направление «к, в» и всегда остаётся безударным: <span class="script">אֶל־הָאָ֫רֶץ</span> и <span class="script">אַ֫רְצָה</span> — оба «в землю».`,
        vocabulary: [
            {greek:"אֶחָד", translation:"один, другой, каждый", type:"adjective", freq:976},
            {greek:"כֵּן", translation:"так, таким образом", type:"adverb", freq:741},
            {greek:"טוֹב", translation:"хороший, добрый", type:"adjective", freq:535, declension_forms:{tables:[{rows:{label:"",values:[["sg","Ед. число"],["pl","Множ. число"]]},cols:{values:[["m","Муж. род"],["f","Жен. род"]]},cells:{sg:{m:"טוֹב",f:"טוֹבָה"},pl:{m:"טוֹבִים",f:"טוֹבוֹת"}}}]}},
            {greek:"גָּדוֹל", translation:"великий, большой", type:"adjective", freq:527},
            {greek:"קֶ֫דֶשׁ", translation:"святыня, нечто священное", type:"noun", freq:470},
            {greek:"רַב", translation:"многочисленный, изобилующий", type:"adjective", freq:439},
            {greek:"עַתָּה", translation:"сейчас, теперь", type:"adverb", freq:435},
            {greek:"רַע", translation:"плохой, нечестивый", type:"adjective", freq:331},
            {greek:"מְאֹד", translation:"очень, крайне", type:"adverb", freq:300},
            {greek:"רָשָׁע", translation:"нечестивый, злой, преступный", type:"adjective", freq:264},
            {greek:"צַדִּיק", translation:"справедливый, праведный", type:"adjective", freq:206},
            {greek:"זָקֵן", translation:"старый", type:"adjective", freq:180},
            {greek:"חָכָם", translation:"мудрый, мудрец", type:"adjective", freq:138},
            {greek:"יָשָׁר", translation:"прямой, правый, справедливый", type:"adjective", freq:119},
            {greek:"קָדוֹשׁ", translation:"святой", type:"adjective", freq:117},
            {greek:"מְעַט", translation:"мало, немного", type:"adverb", freq:101},
            {greek:"קָטֹן", translation:"маленький, младший, незначительный", type:"adjective", freq:86},
            {greek:"רָחוֹק", translation:"далёкий, отдалённый", type:"adjective", freq:84},
            {greek:"שִׁיר", translation:"песня", type:"noun", freq:78},
            {greek:"קָרוֹב", translation:"близкий, надвигающийся", type:"adjective", freq:75},
            {greek:"דַּל", translation:"бедный", type:"adjective", freq:48},
            {greek:"יָפֶה", translation:"красивый", type:"adjective", freq:43},
            {greek:"קָשֶׁה", translation:"трудный, тяжёлый, суровый", type:"adjective", freq:36},
        ],
        exercises: {
            attribute_vs_predicate: [
                {phrase:"הָאִישׁ הַטּוֹב", correct:"Определение (атрибутив)", distractors:["Сказуемое (предикатив)"]},
                {phrase:"הָאִשָּׁה הַטּוֹבָה", correct:"Определение (атрибутив)", distractors:["Сказуемое (предикатив)"]},
                {phrase:"הָאֲנָשִׁים הַטּוֹבִים", correct:"Определение (атрибутив)", distractors:["Сказуемое (предикатив)"]},
                {phrase:"הַנָּשִׁים הַטּוֹבוֹת", correct:"Определение (атрибутив)", distractors:["Сказуемое (предикатив)"]},
                {phrase:"טוֹב הָאִישׁ", correct:"Сказуемое (предикатив)", distractors:["Определение (атрибутив)"]},
                {phrase:"טוֹבָה הָאִשָּׁה", correct:"Сказуемое (предикатив)", distractors:["Определение (атрибутив)"]},
                {phrase:"טוֹבִים הָאֲנָשִׁים", correct:"Сказуемое (предикатив)", distractors:["Определение (атрибутив)"]},
                {phrase:"טוֹבוֹת הַנָּשִׁים", correct:"Сказуемое (предикатив)", distractors:["Определение (атрибутив)"]}
            ],
            translate_greek_to_russian: [
                {greek:"אֶחָד", keywords:["один"]},
                {greek:"כֵּן", keywords:["так"]},
                {greek:"טוֹב", keywords:["хороший"]},
                {greek:"גָּדוֹל", keywords:["великий"]},
                {greek:"קֶ֫דֶשׁ", keywords:["святыня"]},
                {greek:"רַב", keywords:["многочисленный"]},
                {greek:"עַתָּה", keywords:["сейчас"]},
                {greek:"רַע", keywords:["плохой"]},
                {greek:"מְאֹד", keywords:["очень"]},
                {greek:"רָשָׁע", keywords:["нечестивый"]},
            ],
            translate_russian_to_greek: [
                {russian:"один", correct_sequence:["אֶחָד"], all_words:["גָּדוֹל","אֶחָד","קָדוֹשׁ","כֵּן"]},
                {russian:"так", correct_sequence:["כֵּן"], all_words:["דַּל","כֵּן","קָשֶׁה","יָשָׁר"]},
                {russian:"хороший", correct_sequence:["טוֹב"], all_words:["יָפֶה","גָּדוֹל","דַּל","טוֹב"]},
                {russian:"великий", correct_sequence:["גָּדוֹל"], all_words:["גָּדוֹל","יָשָׁר","זָקֵן","קָרוֹב"]},
                {russian:"святыня", correct_sequence:["קֶ֫דֶשׁ"], all_words:["טוֹב","רָחוֹק","שִׁיר","קֶ֫דֶשׁ"]},
                {russian:"многочисленный", correct_sequence:["רַב"], all_words:["מְאֹד","אֶחָד","קָטֹן","רַב"]},
                {russian:"сейчас", correct_sequence:["עַתָּה"], all_words:["רָשָׁע","חָכָם","עַתָּה","אֶחָד"]},
                {russian:"плохой", correct_sequence:["רַע"], all_words:["רַב","רַע","רָחוֹק","זָקֵן"]},
                {russian:"очень", correct_sequence:["מְאֹד"], all_words:["קָשֶׁה","זָקֵן","מְאֹד","יָשָׁר"]},
                {russian:"нечестивый", correct_sequence:["רָשָׁע"], all_words:["עַתָּה","רַע","רָשָׁע","יָשָׁר"]},
            ]
        },
        translation: {
            el_to_ru: [
                {source:"אִישׁ טוֹב", correct:"добрый человек"},
                {source:"הָאִשָּׁה הַטּוֹבָה", correct:"эта добрая женщина"},
                {source:"אֲנָשִׁים טוֹבִים", correct:"добрые люди"},
                {source:"טוֹבוֹת הַנָּשִׁים", correct:"эти женщины добры"}
            ],
            ru_to_el: [
                {source:"добрый человек", correct:"אִישׁ טוֹב"},
                {source:"добрая женщина", correct:"אִשָּׁה טוֹבָה"},
                {source:"эти добрые люди", correct:"הָאֲנָשִׁים הַטּוֹבִים"}
            ]
        }
    },
    8: {
        title: "Местоимение",
        grammar: `<b>1. Самостоятельные личные местоимения</b><br>Формы 1-го лица относятся к общему роду; 2-е и 3-е лицо различают род.<br><table dir="rtl">
<tr><th>Лицо</th><th>Ед. число</th><th>Множ. число</th></tr>
<tr><th>1 общ.</th><td lang="he">אָנֹכִי / אֲנִי</td><td lang="he">אֲנַ֫חְנוּ</td></tr>
<tr><th>2 муж.</th><td lang="he">אַתָּה</td><td lang="he">אַתֶּם</td></tr>
<tr><th>2 жен.</th><td lang="he">אַתְּ</td><td lang="he">אַתֵּ֫נָה</td></tr>
<tr><th>3 муж.</th><td lang="he">הוּא</td><td lang="he">הֵ֫מָּה / הֵם</td></tr>
<tr><th>3 жен.</th><td lang="he">הִיא</td><td lang="he">הֵ֫נָּה / הֵן</td></tr>
</table><br>Примеры: <span class="script">אֲנִי יְהוָה</span> «Я — Господь», <span class="script">אֲנַ֫חְנוּ אַחִים</span> «Мы — братья».<br><br><b>2. Указательные местоимения</b><br><table dir="rtl">
<tr><th></th><th>Ед. число</th><th>Множ. число</th></tr>
<tr><th>Этот / эта</th><td lang="he">זֶה / זֹאת</td><td lang="he">אֵ֫לֶּה</td></tr>
<tr><th>Тот / та</th><td lang="he">הוּא / הִיא</td><td lang="he">הֵ֫מָּה / הֵ֫נָּה</td></tr>
</table><br>Как определение указательное местоимение стоит <i>после</i> слова и согласуется в определённости: <span class="script">הָאִישׁ הַזֶּה</span> «этот мужчина». Как отсылка — <i>перед</i> словом и в определённости не согласуется: <span class="script">זֶה הָאִישׁ</span> «Это — (тот самый) мужчина».<br><br><b>3. Относительное местоимение</b><br><span class="script">אֲשֶׁר</span> «который, кто» — его форма никогда не меняется: <span class="script">הָעֵץ אֲשֶׁר בְּתוֹךְ־הַגָּן</span> «дерево, которое среди сада».<br><br><b>4. Вопросительные местоимения и частица</b><br><span class="script">מִי</span> «кто?» и <span class="script">מָה</span> «что?»: <span class="script">מִי־אַתָּה</span> «Кто ты?». Вопросительная частица <span class="script">הֲ</span> (также <span class="script">הַ</span> и <span class="script">הֶ</span>) ставится в начале предложения и превращает его в вопрос: <span class="script">הֲשָׁלַח הַמֶּ֫לֶךְ אֶת־הַנָּבִיא</span> «Послал ли царь пророка?». Не спутайте её с артиклем.`,
        vocabulary: [
            {greek:"אֲשֶׁר", translation:"который, кто", type:"pronoun", freq:5503},
            {greek:"כִּי", translation:"потому что, что, когда, если", type:"conjunction", freq:4487},
            {greek:"גַּם", translation:"тоже, также, даже, и", type:"conjunction", freq:762},
            {greek:"מָה", translation:"что? почему? как?", type:"pronoun", freq:571},
            {greek:"הֲ", translation:"ли (вопросительная частица)", type:"particle", freq:513},
            {greek:"כַּאֲשֶׁר", translation:"как, когда", type:"conjunction", freq:511},
            {greek:"אֶ֫לֶף", translation:"тысяча", type:"noun", freq:497},
            {greek:"מִי", translation:"кто? кто бы ни (без различия рода)", type:"pronoun", freq:424},
            {greek:"דָּם", translation:"кровь, кровопролитие", type:"noun", freq:361},
            {greek:"אֹ֫הֶל", translation:"палатка", type:"noun", freq:348},
            {greek:"שֶׁ֫מֶן", translation:"масло", type:"noun", freq:193},
            {greek:"בְּהֵמָה", translation:"(домашнее) животное", type:"noun", freq:190},
            {greek:"לָ֫מָּה", translation:"почему?", type:"adverb", freq:178},
            {greek:"אַחֵר", translation:"другой", type:"adjective", freq:166},
            {greek:"טָהוֹר", translation:"чистый", type:"adjective", freq:96},
            {greek:"עָנִי", translation:"бедный, страдающий (от болезни)", type:"adjective", freq:80},
            {greek:"כְּסִיל", translation:"глупый, бестолковый", type:"adjective", freq:75},
            {greek:"מַדּוּעַ", translation:"почему? по какой причине?", type:"adverb", freq:72},
            {greek:"שֹׁפֵט", translation:"судья", type:"noun", freq:68},
            {greek:"אֵיךְ", translation:"как? каким образом?", type:"adverb", freq:61},
        ],
        exercises: {
            translate_greek_to_russian: [
                {greek:"אֶ֫לֶף", keywords:["тысяча"]},
                {greek:"דָּם", keywords:["кровь"]},
                {greek:"אֹ֫הֶל", keywords:["палатка"]},
                {greek:"שֶׁ֫מֶן", keywords:["масло"]},
                {greek:"בְּהֵמָה", keywords:["(домашнее) животное"]},
                {greek:"לָ֫מָּה", keywords:["почему?"]},
                {greek:"אַחֵר", keywords:["другой"]},
                {greek:"טָהוֹר", keywords:["чистый"]},
                {greek:"עָנִי", keywords:["бедный"]},
                {greek:"כְּסִיל", keywords:["глупый"]},
            ],
            translate_russian_to_greek: [
                {russian:"тысяча", correct_sequence:["אֶ֫לֶף"], all_words:["הֲ","לָ֫מָּה","כְּסִיל","אֶ֫לֶף"]},
                {russian:"кровь", correct_sequence:["דָּם"], all_words:["דָּם","כַּאֲשֶׁר","אֹ֫הֶל","מָה"]},
                {russian:"палатка", correct_sequence:["אֹ֫הֶל"], all_words:["אֹ֫הֶל","אֶ֫לֶף","טָהוֹר","אַחֵר"]},
                {russian:"масло", correct_sequence:["שֶׁ֫מֶן"], all_words:["בְּהֵמָה","גַּם","עָנִי","שֶׁ֫מֶן"]},
                {russian:"(домашнее) животное", correct_sequence:["בְּהֵמָה"], all_words:["דָּם","אֹ֫הֶל","לָ֫מָּה","בְּהֵמָה"]},
                {russian:"почему?", correct_sequence:["לָ֫מָּה"], all_words:["עָנִי","אֶ֫לֶף","אַחֵר","לָ֫מָּה"]},
                {russian:"другой", correct_sequence:["אַחֵר"], all_words:["כִּי","הֲ","אַחֵר","מָה"]},
                {russian:"чистый", correct_sequence:["טָהוֹר"], all_words:["אֶ֫לֶף","טָהוֹר","גַּם","שֹׁפֵט"]},
                {russian:"бедный", correct_sequence:["עָנִי"], all_words:["כְּסִיל","כִּי","עָנִי","אֲשֶׁר"]},
                {russian:"глупый", correct_sequence:["כְּסִיל"], all_words:["שֹׁפֵט","כְּסִיל","מַדּוּעַ","בְּהֵמָה"]},
            ]
        },
        translation: {
            el_to_ru: [
                {source:"אֲנִי יְהוָה", correct:"Я Господь"},
                {source:"הוּא נָבִיא צַדִּיק", correct:"Он праведный пророк"},
                {source:"אַתָּה מֶ֫לֶךְ טוֹב", correct:"Ты хороший царь"},
                {source:"אֲנַ֫חְנוּ אַחִים", correct:"Мы братья"},
                {source:"הִיא אִשָּׁה חֲכָמָה", correct:"Она мудрая женщина"},
                {source:"מִי־הָאִישׁ הַזֶּה", correct:"Кто этот человек"}
            ],
            ru_to_el: [
                {source:"Он праведный пророк", correct:"הוּא נָבִיא צַדִּיק"},
                {source:"Ты хороший царь", correct:"אַתָּה מֶ֫לֶךְ טוֹב"},
                {source:"Мы братья", correct:"אֲנַ֫חְנוּ אַחִים"},
                {source:"этот мужчина", correct:"הָאִישׁ הַזֶּה"}
            ]
        }
    },
    9: {
        title: "Местоименные суффиксы",
        grammar: `<b>1. Два набора</b><br>Притяжательность выражается не отдельным словом, а суффиксом. Наборов два: <b>тип 1</b> присоединяется к существительным единственного числа, <b>тип 2</b> — множественного.<br><table dir="rtl">
<tr><th>Лицо</th><th>Тип 1 (ед. ч.)</th><th>Тип 2 (мн. ч.)</th><th>Перевод</th></tr>
<tr><th>1 общ. ед.</th><td lang="he">יִ</td><td lang="he">יַ</td><td>мой / мои</td></tr>
<tr><th>2 муж. ед.</th><td lang="he">ךָ</td><td lang="he">יֶ֫ךָ</td><td>твой / твои</td></tr>
<tr><th>2 жен. ед.</th><td lang="he">ךְ</td><td lang="he">יִַ֫ךְ</td><td>твоя / твои</td></tr>
<tr><th>3 муж. ед.</th><td lang="he">וֹ</td><td lang="he">יָו</td><td>его</td></tr>
<tr><th>3 жен. ед.</th><td lang="he">הָּ</td><td lang="he">יֶ֫הָ</td><td>её</td></tr>
<tr><th>1 общ. мн.</th><td lang="he">נוּ</td><td lang="he">יֵ֫נוּ</td><td>наш / наши</td></tr>
<tr><th>2 муж. мн.</th><td lang="he">כֶם</td><td lang="he">יֵכֶם</td><td>ваш / ваши</td></tr>
<tr><th>2 жен. мн.</th><td lang="he">כֶן</td><td lang="he">יֵכֶן</td><td>ваш / ваши</td></tr>
<tr><th>3 муж. мн.</th><td lang="he">הֶם</td><td lang="he">יֵהֶם</td><td>их</td></tr>
<tr><th>3 жен. мн.</th><td lang="he">הֶן</td><td lang="he">יֵהֶן</td><td>их</td></tr>
</table><br><br><b>2. Как их различать</b><br><b>У всех суффиксов 2-го типа есть <span class="script">י</span></b> — это и есть признак, по которому тип узнаётся. Он же говорит, что определяемое существительное стоит во множественном числе: <span class="script">סוּסוֹ</span> «его конь», но <span class="script">סוּסָ֫יו</span> «его кони».<br><br><b>3. Замечания</b><br>• Все суффиксы имеют лицо, род и число; род различается у 2-го и 3-го лица.<br>• Точка в <span class="script">הּ</span> — не дагеш, а <b>маппик</b>; он часто встречается в суффиксе 3 лица жен. рода ед. числа.<br>• У суффиксов 1-го типа есть альтернативные формы: <span class="script">נִי</span>, <span class="script">הוּ</span>, <span class="script">הָ</span>.<br><br><b>4. Существительные с суффиксами</b><br><table dir="rtl">
<tr><th>Лицо</th><th>Сущ. ед. ч.</th><th>Сущ. мн. ч.</th></tr>
<tr><th>1 общ. ед.</th><td lang="he">סוּסִי</td><td lang="he">סוּסַי</td></tr>
<tr><th>2 муж. ед.</th><td lang="he">סוּסְךָ</td><td lang="he">סוּסֶ֫יךָ</td></tr>
<tr><th>3 муж. ед.</th><td lang="he">סוּסוֹ</td><td lang="he">סוּסָ֫יו</td></tr>
<tr><th>3 жен. ед.</th><td lang="he">סוּסָהּ</td><td lang="he">סוּסֶ֫יהָ</td></tr>
<tr><th>1 общ. мн.</th><td lang="he">סוּסֵ֫נוּ</td><td lang="he">סוּסֵ֫ינוּ</td></tr>
</table>`,
        exercises: {
            heb_suffix_type: [
                {word:"סוּסוֹ", correct:"Тип 1 — существительное ед. ч."},
                {word:"סוּסִי", correct:"Тип 1 — существительное ед. ч."},
                {word:"סוּסְךָ", correct:"Тип 1 — существительное ед. ч."},
                {word:"סוּסָהּ", correct:"Тип 1 — существительное ед. ч."},
                {word:"סוּסֵ֫נוּ", correct:"Тип 1 — существительное ед. ч."},
                {word:"סוּסָ֫יו", correct:"Тип 2 — существительное мн. ч."},
                {word:"סוּסַי", correct:"Тип 2 — существительное мн. ч."},
                {word:"סוּסֶ֫יךָ", correct:"Тип 2 — существительное мн. ч."},
                {word:"סוּסֶ֫יהָ", correct:"Тип 2 — существительное мн. ч."},
                {word:"סוּסֵ֫ינוּ", correct:"Тип 2 — существительное мн. ч."}
            ]
        }
    },
    10: {
        title: "Сопряжённое сочетание",
        grammar: `<b>1. Что это</b><br>Значение родительного падежа («книга <i>царя</i>») выражается сопряжённым сочетанием двух существительных. Первое стоит в <b>сопряжённой форме</b>, второе — в <b>абсолютной</b>, то есть словарной. Абсолютное слово всегда завершает цепь, и цепь нельзя разорвать: между членами сочетания другие слова не ставятся.<br><br><b>2. Определённость</b><br>В сочетании либо оба члена определённые, либо оба неопределённые, но <b>перед сопряжённой формой артикль не ставится никогда</b>. Определённость всего сочетания задаёт абсолютная форма:<br>• <span class="script">קוֹל אִישׁ</span> «голос человека» — неопределённое<br>• <span class="script">קוֹל הָאִישׁ</span> «(этот) голос (этого) человека» — определённое<br>Определёнными считаются четыре типа слов: с артиклем, с местоименным суффиксом (<span class="script">בֵּית מַלְכִּי</span> «дом моего царя»), имена собственные (<span class="script">עֶ֫בֶד שְׁמוּאֵל</span> «слуга Самуила») и единственные в своём роде объекты.<br><br><b>3. Цепь из нескольких слов</b><br>Сопряжённых форм может быть несколько, абсолютная — только одна: <span class="script">עֶ֫בֶד אֲחִי הַמֶּ֫לֶךְ</span> «слуга брата царя», <span class="script">דִּבְרֵי מֶ֫לֶךְ הָאָ֫רֶץ</span> «слова царя земли».<br><br><b>4. Маккеф и прилагательное</b><br>Иногда члены соединяются через маккеф: <span class="script">בֶּן־דָּוִד</span> «сын Давида», <span class="script">כָּל־הָעָם</span> «весь народ». Прилагательное-определение ставится <i>после всего сочетания</i>, и по его роду видно, к чему оно относится: <span class="script">דְּבַר הַמַּלְכָּה הַטּוֹב</span> «доброе слово царицы», но <span class="script">דְּבַר הַמַּלְכָּה הַטּוֹבָה</span> «слово доброй царицы».<br><br><b>5. Написание</b><br>Сопряжённая форма большинства существительных отличается от словарной, и её приходится узнавать: <span class="script">בַּ֫יִת</span> → <span class="script">בֵּית</span>, <span class="script">דְּבָרִים</span> → <span class="script">דִּבְרֵי</span>.`,
        vocabulary: [
            {greek:"פָּנִים", translation:"лицо, присутствие, перед", type:"noun", freq:2126},
            {greek:"יָד", translation:"рука, кисть руки, сила", type:"noun", freq:1627},
            {greek:"עוֹד", translation:"ещё (ещё раз), опять", type:"adverb", freq:491},
            {greek:"עֵת", translation:"время, пора", type:"noun", freq:297},
            {greek:"בְּרִית", translation:"завет, договор, союз", type:"noun", freq:287},
            {greek:"עֹלָה", translation:"жертва всесожжения", type:"noun", freq:286},
            {greek:"אֹיֵב", translation:"враг", type:"noun", freq:285},
            {greek:"חֹ֫דֶשׁ", translation:"новомесячие, месяц", type:"noun", freq:283},
            {greek:"אֶ֫בֶן", translation:"камень, груз", type:"noun", freq:276},
            {greek:"צֹאן", translation:"мелкий рогатый скот, овцы и козы", type:"noun", freq:274},
            {greek:"בָּשָׂר", translation:"плоть, тело, мясо", type:"noun", freq:270},
            {greek:"מִדְבָּר", translation:"пустошь, пустыня", type:"noun", freq:270},
            {greek:"מַטֶּה", translation:"посох, племя", type:"noun", freq:252},
            {greek:"רֶ֫גֶל", translation:"нога", type:"noun", freq:251},
            {greek:"חֶ֫סֶד", translation:"дружественность, благосклонность, верность", type:"noun", freq:249},
            {greek:"חַ֫יִל", translation:"войско, богатство, храбрец", type:"noun", freq:246},
            {greek:"גְּבוּל", translation:"граница, территория", type:"noun", freq:241},
            {greek:"אֲדָמָה", translation:"земля (почва), земельный надел", type:"noun", freq:222},
            {greek:"מָ֫וֶת", translation:"смерть", type:"noun", freq:153},
        ],
        exercises: {
            heb_construct: [
                {phrase:"קוֹל הָאִישׁ", correct:"Определённое"},
                {phrase:"מֶ֫לֶךְ הָאָ֫רֶץ", correct:"Определённое"},
                {phrase:"עֶ֫בֶד הַמֶּ֫לֶךְ", correct:"Определённое"},
                {phrase:"בֵּית מַלְכִּי", correct:"Определённое"},
                {phrase:"עֶ֫בֶד שְׁמוּאֵל", correct:"Определённое"},
                {phrase:"סֵ֫פֶר אָבִ֫יהוּ", correct:"Определённое"},
                {phrase:"קוֹל אִישׁ", correct:"Неопределённое"},
                {phrase:"מֶ֫לֶךְ אֶ֫רֶץ", correct:"Неопределённое"},
                {phrase:"עֶ֫בֶד מֶ֫לֶךְ", correct:"Неопределённое"}
            ],
            translate_greek_to_russian: [
                {greek:"פָּנִים", keywords:["лицо"]},
                {greek:"יָד", keywords:["рука"]},
                {greek:"עוֹד", keywords:["ещё (ещё раз)"]},
                {greek:"עֵת", keywords:["время"]},
                {greek:"בְּרִית", keywords:["завет"]},
                {greek:"עֹלָה", keywords:["жертва всесожжения"]},
                {greek:"אֹיֵב", keywords:["враг"]},
                {greek:"חֹ֫דֶשׁ", keywords:["новомесячие"]},
                {greek:"אֶ֫בֶן", keywords:["камень"]},
                {greek:"צֹאן", keywords:["мелкий рогатый скот"]},
            ],
            translate_russian_to_greek: [
                {russian:"лицо", correct_sequence:["פָּנִים"], all_words:["פָּנִים","חֶ֫סֶד","רֶ֫גֶל","עֵת"]},
                {russian:"рука", correct_sequence:["יָד"], all_words:["יָד","רֶ֫גֶל","חֹ֫דֶשׁ","פָּנִים"]},
                {russian:"ещё (ещё раз)", correct_sequence:["עוֹד"], all_words:["בְּרִית","אֲדָמָה","עוֹד","חֹ֫דֶשׁ"]},
                {russian:"время", correct_sequence:["עֵת"], all_words:["עוֹד","עֵת","מִדְבָּר","בָּשָׂר"]},
                {russian:"завет", correct_sequence:["בְּרִית"], all_words:["עוֹד","אֲדָמָה","מַטֶּה","בְּרִית"]},
                {russian:"жертва всесожжения", correct_sequence:["עֹלָה"], all_words:["מָ֫וֶת","חֶ֫סֶד","עֹלָה","צֹאן"]},
                {russian:"враг", correct_sequence:["אֹיֵב"], all_words:["אֹיֵב","יָד","חֶ֫סֶד","עוֹד"]},
                {russian:"новомесячие", correct_sequence:["חֹ֫דֶשׁ"], all_words:["גְּבוּל","חֹ֫דֶשׁ","בְּרִית","מָ֫וֶת"]},
                {russian:"камень", correct_sequence:["אֶ֫בֶן"], all_words:["אֶ֫בֶן","בָּשָׂר","חַ֫יִל","חֹ֫דֶשׁ"]},
                {russian:"мелкий рогатый скот", correct_sequence:["צֹאן"], all_words:["אֹיֵב","בָּשָׂר","צֹאן","רֶ֫גֶל"]},
            ]
        },
        translation: {
            el_to_ru: [
                {source:"קוֹל הָאִישׁ", correct:"голос этого человека"},
                {source:"עֶ֫בֶד הַמֶּ֫לֶךְ", correct:"слуга этого царя"},
                {source:"בֶּן־דָּוִד", correct:"сын Давида"},
                {source:"דִּבְרֵי מֶ֫לֶךְ הָאָ֫רֶץ", correct:"слова царя земли"}
            ],
            ru_to_el: [
                {source:"голос человека", correct:"קוֹל אִישׁ"},
                {source:"царь земли", correct:"מֶ֫לֶךְ אֶ֫רֶץ"},
                {source:"слуга царя", correct:"עֶ֫בֶד מֶ֫לֶךְ"}
            ]
        }
    },
    11: {
        title: "Имя числительное",
        grammar: `<b>1. Количественные: от 1 до 10</b><br>У каждого числительного две формы — для мужского и для женского рода, и каждая бывает абсолютной и сопряжённой. Выучите абсолютные формы мужского рода.<br><table dir="rtl">
<tr><th></th><th>Муж. абс.</th><th>Муж. сопр.</th><th>Жен. абс.</th><th>Жен. сопр.</th></tr>
<tr><th>Один</th><td lang="he">אֶחָד</td><td lang="he">אַחַד</td><td lang="he">אַחַת</td><td lang="he">אַחַת</td></tr>
<tr><th>Два</th><td lang="he">שְׁנַ֫יִם</td><td lang="he">שְׁנֵי</td><td lang="he">שְׁתַּ֫יִם</td><td lang="he">שְׁתֵּי</td></tr>
<tr><th>Три</th><td lang="he">שָׁלֹשׁ</td><td lang="he">שְׁלֹשׁ</td><td lang="he">שְׁלֹשָׁה</td><td lang="he">שְׁלֹ֫שֶׁת</td></tr>
<tr><th>Четыре</th><td lang="he">אַרְבַּע</td><td lang="he">אַרְבַּע</td><td lang="he">אַרְבָּעָה</td><td lang="he">אַרְבַּ֫עַת</td></tr>
<tr><th>Пять</th><td lang="he">חָמֵשׁ</td><td lang="he">חֲמֵשׁ</td><td lang="he">חֲמִשָּׁה</td><td lang="he">חֲמֵ֫שֶׁת</td></tr>
<tr><th>Шесть</th><td lang="he">שֵׁשׁ</td><td lang="he">שֵׁשׁ</td><td lang="he">שִׁשָּׁה</td><td lang="he">שֵׁ֫שֶׁת</td></tr>
<tr><th>Семь</th><td lang="he">שֶׁ֫בַע</td><td lang="he">שְׁבַע</td><td lang="he">שִׁבְעָה</td><td lang="he">שִׁבְעַת</td></tr>
<tr><th>Восемь</th><td lang="he">שְׁמֹנֶה</td><td lang="he">שְׁמֹנֶה</td><td lang="he">שְׁמֹנָה</td><td lang="he">שְׁמֹנַת</td></tr>
<tr><th>Девять</th><td lang="he">תֵּ֫שַׁע</td><td lang="he">תְּשַׁע</td><td lang="he">תִּשְׁעָה</td><td lang="he">תִּשְׁעַת</td></tr>
<tr><th>Десять</th><td lang="he">עֶ֫שֶׂר</td><td lang="he">עֶ֫שֶׂר</td><td lang="he">עֲשָׂרָה</td><td lang="he">עֲשֶׂ֫רֶת</td></tr>
</table><br>Числительное «один» имеет конструкцию прилагательного: стоит <i>после</i> существительного и согласуется с ним: <span class="script">בֵּן אֶחָד</span> «один сын», <span class="script">בַּת אַחַת</span> «одна дочь». Числительные 3–10 <b>не согласуются в роде</b> с существительным.<br><br><b>2. Составные числительные</b><br>Числительные второго десятка образуются прибавлением слова «десять»: <span class="script">שְׁנֵי עָשָׂר אִישׁ</span> «двенадцать человек», <span class="script">אַרְבָּעָה עָשָׂר יוֹם</span> «четырнадцать дней». В составных между десятками и единицами ставится союз <span class="script">וְ</span>: <span class="script">עֶשְׂרִים וְאַחַת</span> «двадцать один», <span class="script">שִׁבְעִים וְשִׁבְעָה</span> «семьдесят семь».<br><br><b>3. Порядковые числительные</b><br>Имеют форму прилагательных: мужской род оканчивается на <span class="script">יִ</span>, женский на <span class="script">יִת</span>.<br><table dir="rtl">
<tr><th></th><th>Мужской род</th><th>Женский род</th></tr>
<tr><th>Первый</th><td lang="he">רִאשׁוֹן</td><td lang="he">רִאשׁוֹנָה</td></tr>
<tr><th>Второй</th><td lang="he">שֵׁנִי</td><td lang="he">שֵׁנִית</td></tr>
<tr><th>Третий</th><td lang="he">שְׁלִישִׁי</td><td lang="he">שְׁלִישִׁית</td></tr>
<tr><th>Четвёртый</th><td lang="he">רְבִיעִי</td><td lang="he">רְבִיעִית</td></tr>
<tr><th>Пятый</th><td lang="he">חֲמִישִׁי</td><td lang="he">חֲמִישִׁית</td></tr>
<tr><th>Шестой</th><td lang="he">שִׁשִּׁי</td><td lang="he">שִׁשִּׁית</td></tr>
<tr><th>Седьмой</th><td lang="he">שְׁבִיעִי</td><td lang="he">שְׁבִיעִית</td></tr>
</table><br>Примеры: <span class="script">בַּיּוֹם הָרִאשׁוֹן</span> «в первый день», <span class="script">בַּיּוֹם הַשְּׁבִיעִי</span> «в седьмой день».`,
        vocabulary: [
            {greek:"שָׁם", translation:"там, где", type:"adverb", freq:835},
            {greek:"אַמָּה", translation:"локоть (мера длины)", type:"noun", freq:249},
            {greek:"שָׁלוֹם", translation:"мир, здоровье", type:"noun", freq:242},
            {greek:"נַ֫עַר", translation:"юноша, молодой человек", type:"noun", freq:240},
            {greek:"מַעֲשֶׂה", translation:"дело, действие, работа", type:"noun", freq:235},
            {greek:"לַ֫יְלָה", translation:"ночь, вечер, полночь", type:"noun", freq:234},
            {greek:"עָוֹן", translation:"вина, преступление, грех", type:"noun", freq:231},
            {greek:"זֶ֫רַע", translation:"потомок, семя, отпрыск", type:"noun", freq:229},
            {greek:"קֶ֫רֶב", translation:"внутренняя часть, середина", type:"noun", freq:227},
            {greek:"מוֹעֵד", translation:"встреча, назначенное время/место, пора", type:"noun", freq:224},
            {greek:"נַחֲלָה", translation:"наследство, удел, владение", type:"noun", freq:222},
            {greek:"אֵם", translation:"мать", type:"noun", freq:220},
            {greek:"בֶּ֫גֶד", translation:"одежда", type:"noun", freq:216},
            {greek:"מַחֲנֶה", translation:"стан, лагерь, войско", type:"noun", freq:215},
            {greek:"מַלְאָךְ", translation:"ангел, посланец", type:"noun", freq:213},
            {greek:"לָכֵן", translation:"поэтому", type:"conjunction", freq:200},
            {greek:"חָצֵר", translation:"двор, (по)селение", type:"noun", freq:192},
            {greek:"רַק", translation:"только, однако", type:"particle", freq:109},
            {greek:"תָּמִיד", translation:"непрерывно, постоянно, регулярно", type:"adverb", freq:104},
        ],
        exercises: {
            translate_greek_to_russian: [
                {greek:"שָׁם", keywords:["там"]},
                {greek:"אַמָּה", keywords:["локоть (мера длины)"]},
                {greek:"שָׁלוֹם", keywords:["мир"]},
                {greek:"נַ֫עַר", keywords:["юноша"]},
                {greek:"מַעֲשֶׂה", keywords:["дело"]},
                {greek:"לַ֫יְלָה", keywords:["ночь"]},
                {greek:"עָוֹן", keywords:["вина"]},
                {greek:"זֶ֫רַע", keywords:["потомок"]},
                {greek:"קֶ֫רֶב", keywords:["внутренняя часть"]},
                {greek:"מוֹעֵד", keywords:["встреча"]},
            ],
            translate_russian_to_greek: [
                {russian:"там", correct_sequence:["שָׁם"], all_words:["חָצֵר","מַלְאָךְ","זֶ֫רַע","שָׁם"]},
                {russian:"локоть (мера длины)", correct_sequence:["אַמָּה"], all_words:["מַחֲנֶה","אַמָּה","שָׁם","שָׁלוֹם"]},
                {russian:"мир", correct_sequence:["שָׁלוֹם"], all_words:["עָוֹן","חָצֵר","נַ֫עַר","שָׁלוֹם"]},
                {russian:"юноша", correct_sequence:["נַ֫עַר"], all_words:["נַ֫עַר","מַחֲנֶה","מוֹעֵד","מַלְאָךְ"]},
                {russian:"дело", correct_sequence:["מַעֲשֶׂה"], all_words:["מַעֲשֶׂה","לַ֫יְלָה","אֵם","מַלְאָךְ"]},
                {russian:"ночь", correct_sequence:["לַ֫יְלָה"], all_words:["זֶ֫רַע","מַלְאָךְ","נַ֫עַר","לַ֫יְלָה"]},
                {russian:"вина", correct_sequence:["עָוֹן"], all_words:["זֶ֫רַע","אַמָּה","עָוֹן","שָׁם"]},
                {russian:"потомок", correct_sequence:["זֶ֫רַע"], all_words:["זֶ֫רַע","בֶּ֫גֶד","אֵם","נַחֲלָה"]},
                {russian:"внутренняя часть", correct_sequence:["קֶ֫רֶב"], all_words:["נַ֫עַר","קֶ֫רֶב","תָּמִיד","חָצֵר"]},
                {russian:"встреча", correct_sequence:["מוֹעֵד"], all_words:["מוֹעֵד","רַק","מַלְאָךְ","שָׁם"]},
            ]
        }
    }
};
