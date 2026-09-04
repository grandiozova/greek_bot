// ============================================================
// ДАННЫЕ УРОКОВ 1–10 (ПОЛНЫЙ ВОКАБУЛЯР + ГРАММАТИКА + ПЕРЕВОДЫ)
// ============================================================

const LESSONS_DATA = {
    1: {
        title: "Алфавит и произношение",
        grammar: `<b>Греческий алфавит (24 буквы):</b><br>
        <table>
        <tr><th>Προπисная</th><th>Строчная</th><th>Название</th><th>Произношение</th></tr>
        <tr><td>Α</td><td>α</td><td>άλφα</td><td>[а]</td></tr>
        <tr><td>Β</td><td>β</td><td>βῆτα</td><td>[в]</td></tr>
        <tr><td>Γ</td><td>γ</td><td>γάμμα</td><td>[г] (перед γ, κ, ξ, χ – [н])</td></tr>
        <tr><td>Δ</td><td>δ</td><td>δέλτα</td><td>[д]</td></tr>
        <tr><td>Ε</td><td>ε</td><td>ἒ ψιλόν</td><td>[э]</td></tr>
        <tr><td>Ζ</td><td>ζ</td><td>ζῆτα</td><td>[дз]</td></tr>
        <tr><td>Η</td><td>η</td><td>ῆτα</td><td>[э] (долгий)</td></tr>
        <tr><td>Θ</td><td>θ</td><td>θῆτα</td><td>[т] (придыхательный)</td></tr>
        <tr><td>Ι</td><td>ι</td><td>ἰῶτα</td><td>[и]</td></tr>
        <tr><td>Κ</td><td>κ</td><td>κάππα</td><td>[к]</td></tr>
        <tr><td>Λ</td><td>λ</td><td>λάβδα</td><td>[л]</td></tr>
        <tr><td>Μ</td><td>μ</td><td>μῦ</td><td>[м]</td></tr>
        <tr><td>Ν</td><td>ν</td><td>νῦ</td><td>[н]</td></tr>
        <tr><td>Ξ</td><td>ξ</td><td>ξεῖ</td><td>[кс]</td></tr>
        <tr><td>Ο</td><td>ο</td><td>ὂ μικρόν</td><td>[о]</td></tr>
        <tr><td>Π</td><td>π</td><td>πεῖ</td><td>[п]</td></tr>
        <tr><td>Ρ</td><td>ρ</td><td>ρῶ</td><td>[р]</td></tr>
        <tr><td>Σ</td><td>σ (ς)</td><td>σίγμα</td><td>[с] (в конце слова ς)</td></tr>
        <tr><td>Τ</td><td>τ</td><td>ταῦ</td><td>[т]</td></tr>
        <tr><td>Υ</td><td>υ</td><td>ὖ ψιλόν</td><td>[ю] (как нем. ü)</td></tr>
        <tr><td>Φ</td><td>φ</td><td>φεῖ</td><td>[ф]</td></tr>
        <tr><td>Χ</td><td>χ</td><td>χεῖ</td><td>[х]</td></tr>
        <tr><td>Ψ</td><td>ψ</td><td>ψεῖ</td><td>[пс]</td></tr>
        <tr><td>Ω</td><td>ω</td><td>ὦ μέγα</td><td>[о] (долгий)</td></tr>
        </table><br>
        <b>Дифтонги:</b> αι [ай], ει [эй], οι [ой], υι [юй], αυ [ав], ευ [эв], ου [у], ηυ [эв].<br>
        <b>Придыхание:</b> ῾ (густое – [х]), ᾿ (тонкое – не произносится).<br>
        <b>Ударения:</b> ´ (острое), ` (тупое), ῀ (облеченное).`,
        vocabulary: [
            {greek:"ἄλφα", translation:"альфа (Α α)", type:"other"},
            {greek:"βῆτα", translation:"бета (Β β)", type:"other"},
            {greek:"γάμμα", translation:"гамма (Γ γ)", type:"other"},
            {greek:"δέλτα", translation:"дельта (Δ δ)", type:"other"},
            {greek:"ἒ ψιλόν", translation:"эпсилон (Ε ε)", type:"other"},
            {greek:"ζῆτα", translation:"дзета (Ζ ζ)", type:"other"},
            {greek:"ῆτα", translation:"эта (Η η)", type:"other"},
            {greek:"θῆτα", translation:"тета (Θ θ)", type:"other"},
            {greek:"ἰῶτα", translation:"йота (Ι ι)", type:"other"},
            {greek:"κάππα", translation:"каппа (Κ κ)", type:"other"},
            {greek:"λάβδα", translation:"лямбда (Λ λ)", type:"other"},
            {greek:"μῦ", translation:"мю (Μ μ)", type:"other"},
            {greek:"νῦ", translation:"ню (Ν ν)", type:"other"},
            {greek:"ξεῖ", translation:"кси (Ξ ξ)", type:"other"},
            {greek:"ὂ μικρόν", translation:"омикрон (Ο ο)", type:"other"},
            {greek:"πεῖ", translation:"пи (Π π)", type:"other"},
            {greek:"ρῶ", translation:"ро (Ρ ρ)", type:"other"},
            {greek:"σίγμα", translation:"сигма (Σ σ/ς)", type:"other"},
            {greek:"ταῦ", translation:"тау (Τ τ)", type:"other"},
            {greek:"ὖ ψιλόν", translation:"ипсилон (Υ υ)", type:"other"},
            {greek:"φεῖ", translation:"фи (Φ φ)", type:"other"},
            {greek:"χεῖ", translation:"хи (Χ χ)", type:"other"},
            {greek:"ψεῖ", translation:"пси (Ψ ψ)", type:"other"},
            {greek:"ὦ μέγα", translation:"омега (Ω ω)", type:"other"}
        ],
        exercises: {},
        translation: {}
    },
    2: {
        title: "Ударение и правила чтения",
        grammar: `<b>Правила ударения:</b><br>
        • Ударение может стоять только на одном из трёх последних слогов.<br>
        • Острое ударение (´) – повышение тона.<br>
        • Тупое ударение (`) – понижение тона (в потоке речи).<br>
        • Облеченное ударение (῀) – повышение + понижение (только на долгих гласных).<br><br>
        <b>Специальные правила:</b><br>
        • У глаголов ударение ставится как можно дальше от конца слова.<br>
        • У существительных и прилагательных ударение сохраняется на том же слоге, что и в именительном падеже единственного числа.<br><br>
        <b>Энклитики и проклитики:</b><br>
        • Энклитики – безударные слова, примыкающие к предыдущему слову (например, μου, σου).<br>
        • Проклитики – безударные слова, примыкающие к последующему (например, ὁ, ἡ, οἱ, αἱ, εἰς, ἐκ, ἐν, οὐ).`,
        vocabulary: [
            {greek:"ὁ", translation:"определённый артикль м.р.", type:"other"},
            {greek:"ἡ", translation:"определённый артикль ж.р.", type:"other"},
            {greek:"τό", translation:"определённый артикль ср.р.", type:"other"},
            {greek:"οἱ", translation:"определённый артикль м.р. мн.ч.", type:"other"},
            {greek:"αἱ", translation:"определённый артикль ж.р. мн.ч.", type:"other"},
            {greek:"τά", translation:"определённый артикль ср.р. мн.ч.", type:"other"},
            {greek:"εἰς", translation:"предлог 'в' (с Acc.)", type:"other"},
            {greek:"ἐκ", translation:"предлог 'из' (с Gen.)", type:"other"},
            {greek:"ἐν", translation:"предлог 'в' (с Dat.)", type:"other"},
            {greek:"οὐ", translation:"отрицание 'не' (перед согласными)", type:"other"},
            {greek:"οὐκ", translation:"отрицание 'не' (перед гласными)", type:"other"},
            {greek:"οὐχ", translation:"отрицание 'не' (перед густым придыханием)", type:"other"}
        ],
        exercises: {},
        translation: {}
    },
    3: {
        title: "Глаголы на -ω (настоящее время)",
grammar: `<b>1. Грамматические категории глагола</b><br>
Греческий глагол имеет следующие категории:<br>
• <b>Tempus (время)</b> — Praesens (настоящее), Aoristus (аорист), Futurum (будущее) и др.<br>
• <b>Genus (залог)</b> — Activum (активный), Medium (медиальный), Passivum (пассивный)<br>
• <b>Modus (наклонение)</b> — Indicativus (изъявительное), Coniunctivus (сослагательное), Optativus (желательное), Imperativus (повелительное)<br>
• <b>Persona (лицо)</b> — 1-е, 2-е, 3-е<br>
• <b>Numerus (число)</b> — Singularis (единственное), Pluralis (множественное)<br><br>
<b>2. Praesens Indicativi Activi (настоящее время изъявительного наклонения активного залога)</b><br>
Спряжение глагола <b>λύω</b> (развязываю):<br>
<table>
  <tr><th>Лицо</th><th>Ед.ч.</th><th>Мн.ч.</th><th>Перевод ед.</th><th>Перевод мн.</th></tr>
  <tr><td>1-е</td><td>λύω</td><td>λύομεν</td><td>я развязываю</td><td>мы развязываем</td></tr>
  <tr><td>2-е</td><td>λύεις</td><td>λύετε</td><td>ты развязываешь</td><td>вы развязываете</td></tr>
  <tr><td>3-е</td><td>λύει</td><td>λύουσι(ν)</td><td>он развязывает</td><td>они развязывают</td></tr>
</table><br>

<b>3. Личные окончания и соединительные гласные</b><br>
Основа глагола: <b>λυ-</b><br>
Окончания:<br>
<table>
  <tr><th>Лицо</th><th>Ед.ч.</th><th>Мн.ч.</th></tr>
  <tr><td>1-е</td><td>-ω</td><td>-ομεν</td></tr>
  <tr><td>2-е</td><td>-εις</td><td>-ετε</td></tr>
  <tr><td>3-е</td><td>-ει</td><td>-ουσι(ν)</td></tr>
</table><br>
<b>Соединительные гласные (Thematische Vokale):</b><br>
• перед <b>μ</b> и <b>ν</b> — <b>ο</b> (λύομεν, λύουσι)<br>
• перед остальными — <b>ε</b> (λύεις, λύετε, λύει)<br>
• в 1-м лице ед. ч. окончание <b>-ω</b> содержит соединительный гласный <b>ο</b> + <b>-μι</b> (исторически).<br><br>

<b>4. Особенности 3-го лица множественного числа</b><br>
Окончание <b>-ουσι(ν)</b> имеет подвижное <b>ν</b> (ν ἐφελκυστικόν):<br>
• <b>-ουσι</b> — перед согласной<br>
• <b>-ουσιν</b> — перед гласной или в конце предложения<br>
• Пример: λύουσι τοὺς δούλους (перед согласной)<br>
• Пример: λύουσιν οἱ ἄνθρωποι (перед гласной)<br><br>

<b>5. Образец спряжения глаголов (Praesens Indicativi Activi)</b><br>
<table>
  <tr><th>Глагол</th><th>Основа</th><th>1-е л. ед.</th><th>2-е л. ед.</th><th>3-е л. ед.</th><th>Перевод</th></tr>
  <tr><td>βλέπω</td><td>βλεπ-</td><td>βλέπω</td><td>βλέπεις</td><td>βλέπει</td><td>я вижу / ты видишь / он видит</td></tr>
  <tr><td>γράφω</td><td>γραφ-</td><td>γράφω</td><td>γράφεις</td><td>γράφει</td><td>я пишу / ты пишешь / он пишет</td></tr>
  <tr><td>λέγω</td><td>λεγ-</td><td>λέγω</td><td>λέγεις</td><td>λέγει</td><td>я говорю / ты говоришь / он говорит</td></tr>
  <tr><td>ἔχω</td><td>ἐχ-</td><td>ἔχω</td><td>ἔχεις</td><td>ἔχει</td><td>я имею / ты имеешь / он имеет</td></tr>
  <tr><td>διδάσκω</td><td>διδασκ-</td><td>διδάσκω</td><td>διδάσκεις</td><td>διδάσκει</td><td>я учу / ты учишь / он учит</td></tr>
  <tr><td>λαμβάνω</td><td>λαμβαν-</td><td>λαμβάνω</td><td>λαμβάνεις</td><td>λαμβάνει</td><td>я беру / ты берёшь / он берёт</td></tr>
  <tr><td>γινώσκω</td><td>γινωσκ-</td><td>γινώσκω</td><td>γινώσκεις</td><td>γινώσκει</td><td>я знаю / ты знаешь / он знает</td></tr>
</table><br>

<b>6. Ударение в глаголах на -ω</b><br>
В глаголах действует <b>рецессивное ударение</b> (Закон трёх слогов):<br>
• ударение падает на третий слог от конца, если это возможно<br>
• если третий слог от конца краток, ударение переходит на второй слог<br>
• Пример: λύω, λύεις, λύει — ударение на корне<br>
• Пример: λαμβάνω, λαμβάνεις — ударение на корне<br><br>
<i>Исключения:</i> некоторые глаголы имеют постоянное ударение на окончании (например, εἰμί — быть).`,
        vocabulary: [
            {greek:"βλέπω", translation:"вижу", type:"verb", declension_forms:{singular:{"1":"βλέπω","2":"βλέπεις","3":"βλέπει"},plural:{"1":"βλέπομεν","2":"βλέπετε","3":"βλέπουσι(ν)"}}},
            {greek:"λαμβάνω", translation:"беру, получаю", type:"verb", declension_forms:{singular:{"1":"λαμβάνω","2":"λαμβάνεις","3":"λαμβάνει"},plural:{"1":"λαμβάνομεν","2":"λαμβάνετε","3":"λαμβάνουσι(ν)"}}},
            {greek:"γινώσκω", translation:"знаю", type:"verb", declension_forms:{singular:{"1":"γινώσκω","2":"γινώσκεις","3":"γινώσκει"},plural:{"1":"γινώσκομεν","2":"γινώσκετε","3":"γινώσκουσι(ν)"}}},
            {greek:"λέγω", translation:"говорю", type:"verb", declension_forms:{singular:{"1":"λέγω","2":"λέγεις","3":"λέγει"},plural:{"1":"λέγομεν","2":"λέγετε","3":"λέγουσι(ν)"}}},
            {greek:"γράφω", translation:"пишу", type:"verb", declension_forms:{singular:{"1":"γράφω","2":"γράφεις","3":"γράφει"},plural:{"1":"γράφομεν","2":"γράφετε","3":"γράφουσι(ν)"}}},
            {greek:"λύω", translation:"развязываю, освобождаю", type:"verb", declension_forms:{singular:{"1":"λύω","2":"λύεις","3":"λύει"},plural:{"1":"λύομεν","2":"λύετε","3":"λύουσι(ν)"}}},
            {greek:"διδάσκω", translation:"учу", type:"verb", declension_forms:{singular:{"1":"διδάσκω","2":"διδάσκεις","3":"διδάσκει"},plural:{"1":"διδάσκομεν","2":"διδάσκετε","3":"διδάσκουσι(ν)"}}},
            {greek:"ἔχω", translation:"имею", type:"verb", declension_forms:{singular:{"1":"ἔχω","2":"ἔχεις","3":"ἔχει"},plural:{"1":"ἔχομεν","2":"ἔχετε","3":"ἔχουσι(ν)"}}}
        ],
        exercises: {
            declension_fill: [
                {case:"1sg", correct:"λύω", distractors:["λύεις","λύει","λύομεν"]},
                {case:"2sg", correct:"λύεις", distractors:["λύω","λύει","λύετε"]},
                {case:"3sg", correct:"λύει", distractors:["λύω","λύεις","λύουσι"]},
                {case:"1pl", correct:"λύομεν", distractors:["λύω","λύετε","λύουσι"]},
                {case:"2pl", correct:"λύετε", distractors:["λύομεν","λύει","λύουσι"]},
                {case:"3pl", correct:"λύουσι(ν)", distractors:["λύομεν","λύετε","λύει"]}
            ],
            translate_greek_to_russian: [
                {greek:"βλέπω", keywords:["вижу"]},
                {greek:"γινώσκεις", keywords:["знаешь"]},
                {greek:"γράφει", keywords:["пишет"]},
                {greek:"διδάσκομεν", keywords:["учим"]},
                {greek:"ἔχετε", keywords:["имеете"]},
                {greek:"λαμβάνουσι", keywords:["берут"]},
                {greek:"λέγομεν", keywords:["говорим"]},
                {greek:"λύει", keywords:["развязывает"]}
            ],
            translate_russian_to_greek: [
                {russian:"я вижу", correct_sequence:["βλέπω"], all_words:["βλέπω","γινώσκω","γράφω"]},
                {russian:"ты знаешь", correct_sequence:["γινώσκεις"], all_words:["γινώσκεις","γράφεις","βλέπεις"]},
                {russian:"он пишет", correct_sequence:["γράφει"], all_words:["γράφει","λέγει","λύει"]}
            ],
            case_number: [
                {form:"λύεις", correct:"2-е л. ед.ч.", distractors:["1-е л. ед.ч.","3-е л. ед.ч.","2-е л. мн.ч."]},
                {form:"λύομεν", correct:"1-е л. мн.ч.", distractors:["1-е л. ед.ч.","2-е л. мн.ч.","3-е л. мн.ч."]}
            ]
        },
        translation: {
            ru_to_el: [
                {source:"мы знаем", correct:["γινώσκομεν"]},
                {source:"мы видим", correct:["βλέπομεν"]},
                {source:"они развязывают", correct:["λύουσι(ν)"]},
                {source:"он развязывает", correct:["λύει"]},
                {source:"вы имеете", correct:["ἔχετε"]},
                {source:"ты знаешь", correct:["γινώσκεις"]},
                {source:"я беру", correct:["λαμβάνω"]},
                {source:"они говорят", correct:["λέγουσι(ν)"]},
                {source:"он имеет", correct:["ἔχει"]},
                {source:"мы пишем", correct:["γράφομεν"]},
                {source:"они видят", correct:["βλέπουσι(ν)"]}
            ],
            el_to_ru: [
                {source:"βλέπεις", correct:["видишь"]},
                {source:"γινώσκετε", correct:["знаете"]},
                {source:"λέγετε", correct:["говорите"]},
                {source:"γράφει", correct:["пишет"]},
                {source:"βλέπομεν", correct:["видим"]},
                {source:"λαμβάνουσι(ν)", correct:["берут"]},
                {source:"βλέπει", correct:["видит"]},
                {source:"ἔχει", correct:["имеет"]}
            ]
        }
    },
    4: {
        title: "2-е склонение (мужской и средний род)",
grammar: `<b>1. Общие сведения о склонении</b><br>
В греческом языке три склонения. Ко <b>2-му склонению</b> относятся существительные:<br>
• <b>мужского рода</b> с окончанием <b>-ος</b> в Nom. Sing.<br>
• <b>среднего рода</b> с окончанием <b>-ον</b> в Nom. Sing.<br>
• <b>женского рода</b> с окончанием <b>-ος</b> (встречаются реже, например, νῆσος — остров)<br><br>

<b>2. Определённый артикль для 2-го склонения</b><br>
<table>
  <tr><th>Падеж</th><th>Муж. ед.</th><th>Муж. мн.</th><th>Ср. ед.</th><th>Ср. мн.</th></tr>
  <tr><td>Nom.</td><td>ὁ</td><td>οἱ</td><td>τό</td><td>τά</td></tr>
  <tr><td>Gen.</td><td>τοῦ</td><td>τῶν</td><td>τοῦ</td><td>τῶν</td></tr>
  <tr><td>Dat.</td><td>τῷ</td><td>τοῖς</td><td>τῷ</td><td>τοῖς</td></tr>
  <tr><td>Acc.</td><td>τόν</td><td>τούς</td><td>τό</td><td>τά</td></tr>
</table><br>

<b>3. Склонение ἄνθρωπος (человек) — мужской род</b><br>
<table>
  <tr><th>Падеж</th><th>Ед.ч.</th><th>Мн.ч.</th><th>Перевод ед.</th><th>Перевод мн.</th></tr>
  <tr><td>Nom.</td><td>ἄνθρωπος</td><td>ἄνθρωποι</td><td>человек</td><td>люди</td></tr>
  <tr><td>Gen.</td><td>ἀνθρώπου</td><td>ἀνθρώπων</td><td>человека</td><td>людей</td></tr>
  <tr><td>Dat.</td><td>ἀνθρώπῳ</td><td>ἀνθρώποις</td><td>человеку</td><td>людям</td></tr>
  <tr><td>Acc.</td><td>ἄνθρωπον</td><td>ἀνθρώπους</td><td>человека</td><td>людей</td></tr>
  <tr><td>Voc.</td><td>ἄνθρωπε</td><td>ἄνθρωποι</td><td>о человек!</td><td>о люди!</td></tr>
</table>
<i>Важно:</i> в Gen. Sing. ударение переходит на окончание: <b>ἀνθρώπου</b> (не ἀνθρώπου? правильно, ударение на втором слоге от конца).<br><br>

<b>4. Склонение λόγος (слово) — мужской род</b><br>
<table>
  <tr><th>Падеж</th><th>Ед.ч.</th><th>Мн.ч.</th></tr>
  <tr><td>Nom.</td><td>λόγος</td><td>λόγοι</td></tr>
  <tr><td>Gen.</td><td>λόγου</td><td>λόγων</td></tr>
  <tr><td>Dat.</td><td>λόγῳ</td><td>λόγοις</td></tr>
  <tr><td>Acc.</td><td>λόγον</td><td>λόγους</td></tr>
  <tr><td>Voc.</td><td>λόγε</td><td>λόγοι</td></tr>
</table><br>

<b>5. Склонение δῶρον (дар) — средний род</b><br>
<table>
  <tr><th>Падеж</th><th>Ед.ч.</th><th>Мн.ч.</th><th>Перевод ед.</th><th>Перевод мн.</th></tr>
  <tr><td>Nom./Acc./Voc.</td><td>δῶρον</td><td>δῶρα</td><td>дар</td><td>дары</td></tr>
  <tr><td>Gen.</td><td>δώρου</td><td>δώρων</td><td>дара</td><td>даров</td></tr>
  <tr><td>Dat.</td><td>δώρῳ</td><td>δώροις</td><td>дару</td><td>дарам</td></tr>
</table>
<i>Особенность среднего рода:</i> Nom., Acc., Voc. совпадают в обоих числах.<br><br>

<b>6. Склонение ἱερόν (храм) — средний род</b><br>
<table>
  <tr><th>Падеж</th><th>Ед.ч.</th><th>Мн.ч.</th></tr>
  <tr><td>Nom./Acc./Voc.</td><td>ἱερόν</td><td>ἱερά</td></tr>
  <tr><td>Gen.</td><td>ἱεροῦ</td><td>ἱερῶν</td></tr>
  <tr><td>Dat.</td><td>ἱερῷ</td><td>ἱεροῖς</td></tr>
</table><br>

<b>7. Падежные окончания 2-го склонения (сводная таблица)</b><br>
<table>
  <tr><th>Падеж</th><th>Муж. ед.</th><th>Муж. мн.</th><th>Ср. ед.</th><th>Ср. мн.</th></tr>
  <tr><td>Nom.</td><td>-ος</td><td>-οι</td><td>-ον</td><td>-α</td></tr>
  <tr><td>Gen.</td><td>-ου</td><td>-ων</td><td>-ου</td><td>-ων</td></tr>
  <tr><td>Dat.</td><td>-ῳ</td><td>-οις</td><td>-ῳ</td><td>-οις</td></tr>
  <tr><td>Acc.</td><td>-ον</td><td>-ους</td><td>-ον</td><td>-α</td></tr>
  <tr><td>Voc.</td><td>-ε</td><td>-οι</td><td>-ον</td><td>-α</td></tr>
</table>
<i>Запомните:</i> окончания среднего рода всегда совпадают в Nom., Acc., Voc.!

<b>8. Функции падежей</b><br>
• <b>Nominativus (Им.)</b> — подлежащее (кто? что?)<br>
• <b>Genitivus (Род.)</b> — принадлежность, определение (кого? чего?)<br>
• <b>Dativus (Дат.)</b> — косвенное дополнение, средство, место (кому? чему?)<br>
• <b>Accusativus (Вин.)</b> — прямое дополнение, направление (кого? что?)<br>
• <b>Vocativus (Зват.)</b> — обращение (о ком? о чём?)<br><br>

<b>9. Ударение в существительных 2-го склонения</b><br>
• В словах типа <b>ἄνθρωπος</b> (с подвижным ударением) в Gen. Sing. ударение переходит на окончание: <b>ἀνθρώπου</b><br>
• В словах типа <b>λόγος</b> ударение остаётся на том же слоге: <b>λόγου</b><br>
• В Voc. Sing. у мужского рода ударение обычно на том же слоге, что и в Nom.: <b>ἄνθρωπε</b> (но некоторые слова имеют особое ударение, например, υἱός → υἱέ).`,
        vocabulary: [
            {greek:"ἄνθρωπος", article:"ὁ", translation:"человек", type:"noun", declension_forms:{singular:{nom:"ἄνθρωπος",gen:"ἀνθρώπου",dat:"ἀνθρώπῳ",acc:"ἄνθρωπον",voc:"ἄνθρωπε"},plural:{nom:"ἄνθρωποι",gen:"ἀνθρώπων",dat:"ἀνθρώποις",acc:"ἀνθρώπους",voc:"ἄνθρωποι"}}},
            {greek:"λόγος", article:"ὁ", translation:"слово", type:"noun", declension_forms:{singular:{nom:"λόγος",gen:"λόγου",dat:"λόγῳ",acc:"λόγον",voc:"λόγε"},plural:{nom:"λόγοι",gen:"λόγων",dat:"λόγοις",acc:"λόγους",voc:"λόγοι"}}},
            {greek:"δῶρον", article:"τό", translation:"дар", type:"noun", declension_forms:{singular:{nom:"δῶρον",gen:"δώρου",dat:"δώρῳ",acc:"δῶρον",voc:"δῶρον"},plural:{nom:"δῶρα",gen:"δώρων",dat:"δώροις",acc:"δῶρα",voc:"δῶρα"}}},
            {greek:"νόμος", article:"ὁ", translation:"закон", type:"noun", declension_forms:{singular:{nom:"νόμος",gen:"νόμου",dat:"νόμῳ",acc:"νόμον",voc:"νόμε"},plural:{nom:"νόμοι",gen:"νόμων",dat:"νόμοις",acc:"νόμους",voc:"νόμοι"}}},
            {greek:"οἶκος", article:"ὁ", translation:"дом", type:"noun", declension_forms:{singular:{nom:"οἶκος",gen:"οἴκου",dat:"οἴκῳ",acc:"οἶκον",voc:"οἶκε"},plural:{nom:"οἶκοι",gen:"οἴκων",dat:"οἴκοις",acc:"οἴκους",voc:"οἶκοι"}}},
            {greek:"δοῦλος", article:"ὁ", translation:"раб, слуга", type:"noun", declension_forms:{singular:{nom:"δοῦλος",gen:"δούλου",dat:"δούλῳ",acc:"δοῦλον",voc:"δοῦλε"},plural:{nom:"δοῦλοι",gen:"δούλων",dat:"δούλοις",acc:"δούλους",voc:"δοῦλοι"}}},
            {greek:"ἀδελφός", article:"ὁ", translation:"брат", type:"noun", declension_forms:{singular:{nom:"ἀδελφός",gen:"ἀδελφοῦ",dat:"ἀδελφῷ",acc:"ἀδελφόν",voc:"ἀδελφέ"},plural:{nom:"ἀδελφοί",gen:"ἀδελφῶν",dat:"ἀδελφοῖς",acc:"ἀδελφούς",voc:"ἀδελφοί"}}},
            {greek:"ἱερόν", article:"τό", translation:"храм", type:"noun", declension_forms:{singular:{nom:"ἱερόν",gen:"ἱεροῦ",dat:"ἱερῷ",acc:"ἱερόν",voc:"ἱερόν"},plural:{nom:"ἱερά",gen:"ἱερῶν",dat:"ἱεροῖς",acc:"ἱερά",voc:"ἱερά"}}},
            {greek:"θάνατος", article:"ὁ", translation:"смерть", type:"noun", declension_forms:{singular:{nom:"θάνατος",gen:"θανάτου",dat:"θανάτῳ",acc:"θάνατον",voc:"θάνατε"},plural:{nom:"θάνατοι",gen:"θανάτων",dat:"θανάτοις",acc:"θανάτους",voc:"θάνατοι"}}},
            {greek:"υἱός", article:"ὁ", translation:"сын", type:"noun", declension_forms:{singular:{nom:"υἱός",gen:"υἱοῦ",dat:"υἱῷ",acc:"υἱόν",voc:"υἱέ"},plural:{nom:"υἱοί",gen:"υἱῶν",dat:"υἱοῖς",acc:"υἱούς",voc:"υἱοί"}}},
            {greek:"ἀπόστολος", article:"ὁ", translation:"апостол", type:"noun", declension_forms:{singular:{nom:"ἀπόστολος",gen:"ἀποστόλου",dat:"ἀποστόλῳ",acc:"ἀπόστολον",voc:"ἀπόστολε"},plural:{nom:"ἀπόστολοι",gen:"ἀποστόλων",dat:"ἀποστόλοις",acc:"ἀποστόλους",voc:"ἀπόστολοι"}}},
            {greek:"Χριστός", article:"ὁ", translation:"Христос", type:"noun", declension_forms:{singular:{nom:"Χριστός",gen:"Χριστοῦ",dat:"Χριστῷ",acc:"Χριστόν",voc:"Χριστέ"},plural:{nom:"Χριστοί",gen:"Χριστῶν",dat:"Χριστοῖς",acc:"Χριστούς",voc:"Χριστοί"}}}
        ],
        exercises: {
            declension_fill: [
                {case:"gen_sg", word:"ἄνθρωπος", translation:"человек", correct:"ἀνθρώπου", distractors:["ἀνθρώπων","ἀνθρώπῳ","ἄνθρωπον"]},
                {case:"dat_sg", word:"ἄνθρωπος", translation:"человек", correct:"ἀνθρώπῳ", distractors:["ἀνθρώπου","ἀνθρώποις","ἄνθρωπον"]},
                {case:"acc_sg", word:"ἄνθρωπος", translation:"человек", correct:"ἄνθρωπον", distractors:["ἀνθρώπου","ἀνθρώπων","ἀνθρώποις"]},
                {case:"nom_pl", word:"ἄνθρωπος", translation:"человек", correct:"ἄνθρωποι", distractors:["ἀνθρώπους","ἀνθρώπων","ἀνθρώποις"]},
                {case:"gen_pl", word:"ἄνθρωπος", translation:"человек", correct:"ἀνθρώπων", distractors:["ἀνθρώπου","ἀνθρώποις","ἄνθρωποι"]},
                {case:"dat_pl", word:"ἄνθρωπος", translation:"человек", correct:"ἀνθρώποις", distractors:["ἀνθρώπων","ἀνθρώπῳ","ἀνθρώπους"]},
                {case:"acc_pl", word:"ἄνθρωπος", translation:"человек", correct:"ἀνθρώπους", distractors:["ἀνθρώποις","ἀνθρώπων","ἄνθρωποι"]},
                        // Склонения для других существительных
        {case:"dat_sg", word:"λόγος", translation:"слово", correct:"λόγῳ", distractors:["λόγον","λόγου","λόγοις"]},
        {case:"gen_sg", word:"νόμος", translation:"закон", correct:"νόμου", distractors:["νόμῳ","νόμον","νόμοι"]},
        {case:"acc_pl", word:"οἶκος", translation:"дом", correct:"οἴκους", distractors:["οἴκοις","οἴκων","οἶκοι"]},
        {case:"nom_pl", word:"δοῦλος", translation:"раб", correct:"δοῦλοι", distractors:["δούλων","δούλοις","δούλους"]},
        {case:"dat_pl", word:"ἀδελφός", translation:"брат", correct:"ἀδελφοῖς", distractors:["ἀδελφῶν","ἀδελφούς","ἀδελφοί"]},
        {case:"gen_pl", word:"ἱερόν", translation:"храм", correct:"ἱερῶν", distractors:["ἱεροῖς","ἱερά","ἱερόν"]},
        {case:"acc_sg", word:"θάνατος", translation:"смерть", correct:"θάνατον", distractors:["θανάτῳ","θανάτου","θάνατε"]},
        {case:"voc_sg", word:"υἱός", translation:"сын", correct:"υἱέ", distractors:["υἱός","υἱοῦ","υἱόν"]},
        {case:"dat_sg", word:"ἀπόστολος", translation:"апостол", correct:"ἀποστόλῳ", distractors:["ἀπόστολον","ἀποστόλου","ἀποστόλοις"]},
        {case:"gen_sg", word:"Χριστός", translation:"Христос", correct:"Χριστοῦ", distractors:["Χριστόν","Χριστῷ","Χριστέ"]}
                
            ],
            translate_greek_to_russian: [
                {greek:"ὁ λόγος", keywords:["слово"]},
                {greek:"τοῦ ἀνθρώπου", keywords:["человека"]},
                {greek:"τῷ υἱῷ", keywords:["сыну"]},
                {greek:"τὸν οἶκον", keywords:["дом"]},
                {greek:"οἱ ἀπόστολοι", keywords:["апостолы"]},
                {greek:"τῶν δούλων", keywords:["рабов"]},
                {greek:"τοῖς τέκνοις", keywords:["детям"]},
                {greek:"ὁ νόμος", keywords:["закон"]},
        {greek:"τοῦ δούλου", keywords:["раба"]},
        {greek:"τὸν ἀδελφόν", keywords:["брата"]},
        {greek:"τὸ ἱερόν", keywords:["храм"]},
        {greek:"τῷ θανάτῳ", keywords:["смерти"]},
        {greek:"οἱ υἱοί", keywords:["сыны"]},
        {greek:"τῶν ἀποστόλων", keywords:["апостолов"]},
        {greek:"τῷ Χριστῷ", keywords:["Христу"]}
            ],
            translate_russian_to_greek: [
                {russian:"слово", correct_sequence:["λόγος"], all_words:["λόγος","οἶκος","υἱός"]},
                {russian:"человека (Gen.)", correct_sequence:["ἀνθρώπου"], all_words:["ἀνθρώπου","ἄνθρωπον","ἀνθρώπῳ"]},
                {russian:"сыну", correct_sequence:["υἱῷ"], all_words:["υἱῷ","υἱόν","υἱοῦ"]},
                {russian:"закон", correct_sequence:["νόμος"], all_words:["νόμος","λόγος","οἶκος","υἱός"]},
        {russian:"раба (Gen.)", correct_sequence:["δούλου"], all_words:["δούλου","δοῦλον","δούλῳ","δοῦλοι"]},
        {russian:"брата (Acc.)", correct_sequence:["ἀδελφόν"], all_words:["ἀδελφόν","ἀδελφός","ἀδελφοῦ","ἀδελφῷ"]},
        {russian:"храм (Nom.)", correct_sequence:["ἱερόν"], all_words:["ἱερόν","ἱεροῦ","ἱερῷ","ἱερά"]},
        {russian:"смерти (Dat.)", correct_sequence:["θανάτῳ"], all_words:["θανάτῳ","θάνατος","θανάτου","θάνατον"]},
        {russian:"сыны (Nom.)", correct_sequence:["υἱοί"], all_words:["υἱοί","υἱῶν","υἱοῖς","υἱούς"]},
        {russian:"апостолов (Gen.)", correct_sequence:["ἀποστόλων"], all_words:["ἀποστόλων","ἀπόστολοι","ἀποστόλοις","ἀποστόλους"]},
        {russian:"Христу (Dat.)", correct_sequence:["Χριστῷ"], all_words:["Χριστῷ","Χριστός","Χριστοῦ","Χριστόν"]}
            ],
            case_number: [
                {form:"ἀνθρώπων", correct:"Genitivus (Род. п.) мн.ч.", distractors:["Genitivus (Род. п.) ед.ч.","Dativus (Дат. п.) мн.ч.","Accusativus (Вин. п.) мн.ч."]},
                {form:"δῶρα", correct:"Nominativus / Accusativus (Им./Вин. п.) мн.ч.", distractors:["Nominativus (Им. п.) ед.ч.","Genitivus (Род. п.) мн.ч.","Dativus (Дат. п.) мн.ч."]},
                {form:"λόγοις", correct:"Dativus (Дат. п.) мн.ч.", distractors:["Nominativus (Им. п.) мн.ч.","Genitivus (Род. п.) мн.ч.","Accusativus (Вин. п.) мн.ч."]},
                {form:"ἱερά", correct:"Nominativus / Accusativus (Им./Вин. п.) мн.ч.", distractors:["Genitivus (Род. п.) мн.ч.","Dativus (Дат. п.) мн.ч.","Nominativus (Им. п.) ед.ч."]}
            ]
        },
translation: {
    ru_to_el: [
        { source: "Христос говорит слово закона людям.", correct: ["ὁ","Χριστὸς","λέγει","τὸν","λόγον","τοῦ","νόμου","τοῖς","ἀνθρώποις"] },
        { source: "Братья освобождают рабов.", correct: ["οἱ","ἀδελφοὶ","λύουσι","τοὺς","δούλους"] },
        { source: "Братья говорят слово рабу.", correct: ["οἱ","ἀδελφοὶ","λέγουσι","τὸν","λόγον","τῷ","δούλῳ"] },
        { source: "Мы видим дары рабов.", correct: ["βλέπομεν","τὰ","δῶρα","τῶν","δούλων"] },
        { source: "Мы пишем братьям слова закона.", correct: ["γράφομεν","τοῖς","ἀδελφοῖς","τοὺς","λόγους","τοῦ","νόμου"] },
        { source: "Сын видит храмы и дома.", correct: ["ὁ","υἱὸς","βλέπει","τὰ","ἱερὰ","καὶ","τοὺς","οἴκους"] },
        { source: "Я освобождаю слуг и говорю слова сынам и братьям.", correct: ["λύω","τοὺς","δούλους","καὶ","λέγω","λόγους","τοῖς","υἱοῖς","καὶ","τοῖς","ἀδελφοῖς"] },
        { source: "Человек видит смерть.", correct: ["ὁ","ἄνθρωπος","βλέπει","τὸν","θάνατον"] },
        { source: "Сыны берут дары.", correct: ["οἱ","υἱοὶ","λαμβάνουσι","τὰ","δῶρα"] },
        { source: "Вы знаете смерть.", correct: ["γινώσκετε","τὸν","θάνατον"] },
        { source: "Люди видят дома смерти.", correct: ["οἱ","ἄνθρωποι","βλέπουσι","τοὺς","οἴκους","τοῦ","θανάτου"] },
        { source: "Ты берёшь дар апостола.", correct: ["λαμβάνεις","τὸ","δῶρον","τοῦ","ἀποστόλου"] },
        { source: "Они знают законы и учат слуг.", correct: ["γινώσκουσι","τοὺς","νόμους","καὶ","διδάσκουσι","τοὺς","δούλους"] },
        { source: "О человек, ты знаешь закон.", correct: ["ὦ","ἄνθρωπε","γινώσκεις","τὸν","νόμον"] }
    ],
    el_to_ru: [
        { source: "ὁ Χριστὸς λέγει τὸν λόγον τοῦ νόμου τοῖς ἀνθρώποις.", correct: "Христос говорит слово закона людям." },
        { source: "οἱ ἀδελφοὶ λύουσι τοὺς δούλους.", correct: "Братья освобождают рабов." },
        { source: "οἱ ἀδελφοὶ λέγουσι τὸν λόγον τῷ δούλῳ.", correct: "Братья говорят слово рабу." },
        { source: "βλέπομεν τὰ δῶρα τῶν δούλων.", correct: "Мы видим дары рабов." },
        { source: "γράφομεν τοῖς ἀδελφοῖς τοὺς λόγους τοῦ νόμου.", correct: "Мы пишем братьям слова закона." },
        { source: "ὁ υἱὸς βλέπει τὰ ἱερὰ καὶ τοὺς οἴκους.", correct: "Сын видит храмы и дома." },
        { source: "λύω τοὺς δούλους καὶ λέγω λόγους τοῖς υἱοῖς καὶ τοῖς ἀδελφοῖς.", correct: "Я освобождаю слуг и говорю слова сынам и братьям." },
        { source: "ὁ ἄνθρωπος βλέπει τὸν θάνατον.", correct: "Человек видит смерть." },
        { source: "οἱ υἱοὶ λαμβάνουσι τὰ δῶρα.", correct: "Сыны берут дары." },
        { source: "γινώσκετε τὸν θάνατον.", correct: "Вы знаете смерть." },
        { source: "οἱ ἄνθρωποι βλέπουσι τοὺς οἴκους τοῦ θανάτου.", correct: "Люди видят дома смерти." },
        { source: "λαμβάνεις τὸ δῶρον τοῦ ἀποστόλου.", correct: "Ты берёшь дар апостола." },
        { source: "γινώσκουσι τοὺς νόμους καὶ διδάσκουσι τοὺς δούλους.", correct: "Они знают законы и учат слуг." },
        { source: "ὦ ἄνθρωπε, γινώσκεις τὸν νόμον.", correct: "О человек, ты знаешь закон." }
    ]
    }
},
    5: {
        title: "1-е склонение (женский род)",
grammar: `<b>1. Общие сведения о 1-м склонении</b><br>
К 1-му склонению относятся имена существительные преимущественно женского рода с основой на <b>α</b> (или <b>η</b>) и окончаниями в Nom. Sing.:
<ul>
  <li><b>-α</b> (после ε, ι, ρ — чистая альфа) — например, ἀλήθεια, βασιλεία</li>
  <li><b>-η</b> (после других согласных — нечистая альфа) — например, δόξα, γραφή</li>
  <li><b>-η</b> (с долгим окончанием) — например, ζωή, ψυχή</li>
</ul>
<i>Примечание:</i> в Gen. и Dat. Sing. у нечистой альфы (после согласных, кроме ε, ι, ρ) происходит переход <b>α → η</b>.<br><br>

<b>2. Склонение ὥρα (час) — пример с чистой альфой (после ρ)</b><br>
<table>
  <tr><th>Падеж</th><th>Ед.ч.</th><th>Мн.ч.</th><th>Перевод ед.</th><th>Перевод мн.</th></tr>
  <tr><td>Nom.</td><td>ὥρα</td><td>ὥραι</td><td>час</td><td>часы</td></tr>
  <tr><td>Gen.</td><td>ὥρας</td><td>ὡρῶν</td><td>часа</td><td>часов</td></tr>
  <tr><td>Dat.</td><td>ὥρᾳ</td><td>ὥραις</td><td>часу</td><td>часам</td></tr>
  <tr><td>Acc.</td><td>ὥραν</td><td>ὥρας</td><td>час</td><td>часы</td></tr>
  <tr><td>Voc.</td><td>ὥρα</td><td>ὥραι</td><td>о час!</td><td>о часы!</td></tr>
</table>
<i>Здесь α сохраняется, т.к. стоит после ρ (чистая альфа).</i><br><br>

<b>3. Склонение ἀλήθεια (истина) — чистая альфа (после ε, ι, ρ)</b><br>
<table>
  <tr><th>Падеж</th><th>Ед.ч.</th><th>Мн.ч.</th></tr>
  <tr><td>Nom.</td><td>ἀλήθεια</td><td>ἀλήθειαι</td></tr>
  <tr><td>Gen.</td><td>ἀληθείας</td><td>ἀληθειῶν</td></tr>
  <tr><td>Dat.</td><td>ἀληθείᾳ</td><td>ἀληθείαις</td></tr>
  <tr><td>Acc.</td><td>ἀλήθειαν</td><td>ἀληθείας</td></tr>
  <tr><td>Voc.</td><td>ἀλήθεια</td><td>ἀλήθειαι</td></tr>
</table>
<i>Обратите внимание:</i> окончания с йотой подписной: -ᾳ, -ῃ.<br><br>

<b>4. Склонение δόξα (слава) — нечистая альфа (после согласной)</b><br>
<table>
  <tr><th>Падеж</th><th>Ед.ч.</th><th>Мн.ч.</th></tr>
  <tr><td>Nom.</td><td>δόξα</td><td>δόξαι</td></tr>
  <tr><td>Gen.</td><td>δόξης</td><td>δοξῶν</td></tr>
  <tr><td>Dat.</td><td>δόξῃ</td><td>δόξαις</td></tr>
  <tr><td>Acc.</td><td>δόξαν</td><td>δόξας</td></tr>
  <tr><td>Voc.</td><td>δόξα</td><td>δόξαι</td></tr>
</table>
<i>В Gen. и Dat. Sing. α переходит в η (δόξης, δόξῃ).</i><br><br>

<b>5. Склонение γραφή (писание) — слова на -η</b><br>
<table>
  <tr><th>Падеж</th><th>Ед.ч.</th><th>Мн.ч.</th></tr>
  <tr><td>Nom.</td><td>γραφή</td><td>γραφαί</td></tr>
  <tr><td>Gen.</td><td>γραφῆς</td><td>γραφῶν</td></tr>
  <tr><td>Dat.</td><td>γραφῇ</td><td>γραφαῖς</td></tr>
  <tr><td>Acc.</td><td>γραφήν</td><td>γραφάς</td></tr>
  <tr><td>Voc.</td><td>γραφή</td><td>γραφαί</td></tr>
</table><br>

<b>6. Склонение ζωή (жизнь) — слова на -η с долгим окончанием</b><br>
<table>
  <tr><th>Падеж</th><th>Ед.ч.</th><th>Мн.ч.</th></tr>
  <tr><td>Nom.</td><td>ζωή</td><td>ζωαί</td></tr>
  <tr><td>Gen.</td><td>ζωῆς</td><td>ζωῶν</td></tr>
  <tr><td>Dat.</td><td>ζωῇ</td><td>ζωαῖς</td></tr>
  <tr><td>Acc.</td><td>ζωήν</td><td>ζωάς</td></tr>
  <tr><td>Voc.</td><td>ζωή</td><td>ζωαί</td></tr>
</table><br>

<b>7. Правило «чистой» и «нечистой» альфы (подробно)</b><br>
• Если в Nom. Sing. стоит окончание <b>-α</b>, то:
  - после <b>ε, ι, ρ</b> (чистая альфа) она сохраняется во всех падежах: <b>α</b>
  - после других согласных (нечистая альфа) она переходит в <b>η</b> в Gen. и Dat. Sing.<br>
• Если в Nom. Sing. стоит окончание <b>-η</b>, то оно сохраняется во всех падежах.<br>
• В Dat. Sing. всегда пишется <b>ι</b> подписная: <b>ᾳ</b> (для слов на -α) или <b>ῃ</b> (для слов на -η).<br><br>

<b>8. Таблица окончаний 1-го склонения (женский род)</b><br>
<table>
  <tr><th>Падеж</th><th>Ед.ч.</th><th>Мн.ч.</th></tr>
  <tr><td>Nom.</td><td>-α, -η</td><td>-αι</td></tr>
  <tr><td>Gen.</td><td>-ας, -ης</td><td>-ῶν</td></tr>
  <tr><td>Dat.</td><td>-ᾳ, -ῃ</td><td>-αις</td></tr>
  <tr><td>Acc.</td><td>-αν, -ην</td><td>-ας</td></tr>
  <tr><td>Voc.</td><td>-α, -η</td><td>-αι</td></tr>
</table>
<i>Важно:</i> в Gen. Pl. ударение всегда на последнем слоге и облеченное: <b>ὡρῶν</b>, <b>δοξῶν</b>, <b>γραφῶν</b>, <b>ζωῶν</b>.<br><br>

<b>9. Дополнительные примеры</b><br>
• <b>βασιλεία</b> (царство) — чистая альфа (после ε, ι, ρ)<br>
• <b>καρδία</b> (сердце) — чистая альфа (после ι)<br>
• <b>ψυχή</b> (душа) — на -η<br>
• <b>ἐκκλησία</b> (церковь) — чистая альфа<br>
• <b>εἰρήνη</b> (мир) — на -η<br>
• <b>ἐντολή</b> (заповедь) — на -η`,
        vocabulary: [
            {greek:"ἀλήθεια", article:"ἡ", translation:"истина", type:"noun", declension_forms:{singular:{nom:"ἀλήθεια",gen:"ἀληθείας",dat:"ἀληθείᾳ",acc:"ἀλήθειαν",voc:"ἀλήθεια"},plural:{nom:"ἀλήθειαι",gen:"ἀληθειῶν",dat:"ἀληθείαις",acc:"ἀληθείας",voc:"ἀλήθειαι"}}},
            {greek:"ζωή", article:"ἡ", translation:"жизнь", type:"noun", declension_forms:{singular:{nom:"ζωή",gen:"ζωῆς",dat:"ζωῇ",acc:"ζωήν",voc:"ζωή"},plural:{nom:"ζωαί",gen:"ζωῶν",dat:"ζωαῖς",acc:"ζωάς",voc:"ζωαί"}}},
            {greek:"βασιλεία", article:"ἡ", translation:"царство", type:"noun", declension_forms:{singular:{nom:"βασιλεία",gen:"βασιλείας",dat:"βασιλείᾳ",acc:"βασιλείαν",voc:"βασιλεία"},plural:{nom:"βασιλεῖαι",gen:"βασιλειῶν",dat:"βασιλείαις",acc:"βασιλείας",voc:"βασιλεῖαι"}}},
            {greek:"ἡμέρα", article:"ἡ", translation:"день", type:"noun", declension_forms:{singular:{nom:"ἡμέρα",gen:"ἡμέρας",dat:"ἡμέρᾳ",acc:"ἡμέραν",voc:"ἡμέρα"},plural:{nom:"ἡμέραι",gen:"ἡμερῶν",dat:"ἡμέραις",acc:"ἡμέρας",voc:"ἡμέραι"}}},
            {greek:"γραφή", article:"ἡ", translation:"писание", type:"noun", declension_forms:{singular:{nom:"γραφή",gen:"γραφῆς",dat:"γραφῇ",acc:"γραφήν",voc:"γραφή"},plural:{nom:"γραφαί",gen:"γραφῶν",dat:"γραφαῖς",acc:"γραφάς",voc:"γραφαί"}}},
            {greek:"καρδία", article:"ἡ", translation:"сердце", type:"noun", declension_forms:{singular:{nom:"καρδία",gen:"καρδίας",dat:"καρδίᾳ",acc:"καρδίαν",voc:"καρδία"},plural:{nom:"καρδίαι",gen:"καρδιῶν",dat:"καρδίαις",acc:"καρδίας",voc:"καρδίαι"}}},
            {greek:"δόξα", article:"ἡ", translation:"слава", type:"noun", declension_forms:{singular:{nom:"δόξα",gen:"δόξης",dat:"δόξῃ",acc:"δόξαν",voc:"δόξα"},plural:{nom:"δόξαι",gen:"δοξῶν",dat:"δόξαις",acc:"δόξας",voc:"δόξαι"}}},
            {greek:"παραβολή", article:"ἡ", translation:"притча", type:"noun", declension_forms:{singular:{nom:"παραβολή",gen:"παραβολῆς",dat:"παραβολῇ",acc:"παραβολήν",voc:"παραβολή"},plural:{nom:"παραβολαί",gen:"παραβολῶν",dat:"παραβολαῖς",acc:"παραβολάς",voc:"παραβολαί"}}},
            {greek:"εἰρήνη", article:"ἡ", translation:"мир", type:"noun", declension_forms:{singular:{nom:"εἰρήνη",gen:"εἰρήνης",dat:"εἰρήνῃ",acc:"εἰρήνην",voc:"εἰρήνη"},plural:{nom:"εἰρῆναι",gen:"εἰρηνῶν",dat:"εἰρήναις",acc:"εἰρήνας",voc:"εἰρῆναι"}}},
            {greek:"φωνή", article:"ἡ", translation:"голос, звук", type:"noun", declension_forms:{singular:{nom:"φωνή",gen:"φωνῆς",dat:"φωνῇ",acc:"φωνήν",voc:"φωνή"},plural:{nom:"φωναί",gen:"φωνῶν",dat:"φωναῖς",acc:"φωνάς",voc:"φωναί"}}},
            {greek:"ἐκκλησία", article:"ἡ", translation:"церковь", type:"noun", declension_forms:{singular:{nom:"ἐκκλησία",gen:"ἐκκλησίας",dat:"ἐκκλησίᾳ",acc:"ἐκκλησίαν",voc:"ἐκκλησία"},plural:{nom:"ἐκκλησίαι",gen:"ἐκκλησιῶν",dat:"ἐκκλησίαις",acc:"ἐκκλησίας",voc:"ἐκκλησίαι"}}},
            {greek:"ψυχή", article:"ἡ", translation:"душа", type:"noun", declension_forms:{singular:{nom:"ψυχή",gen:"ψυχῆς",dat:"ψυχῇ",acc:"ψυχήν",voc:"ψυχή"},plural:{nom:"ψυχαί",gen:"ψυχῶν",dat:"ψυχαῖς",acc:"ψυχάς",voc:"ψυχαί"}}},
            {greek:"ἐντολή", article:"ἡ", translation:"заповедь", type:"noun", declension_forms:{singular:{nom:"ἐντολή",gen:"ἐντολῆς",dat:"ἐντολῇ",acc:"ἐντολήν",voc:"ἐντολή"},plural:{nom:"ἐντολαί",gen:"ἐντολῶν",dat:"ἐντολαῖς",acc:"ἐντολάς",voc:"ἐντολαί"}}},
            {greek:"ὥρα", article:"ἡ", translation:"час", type:"noun", declension_forms:{singular:{nom:"ὥρα",gen:"ὥρας",dat:"ὥρᾳ",acc:"ὥραν",voc:"ὥρα"},plural:{nom:"ὥραι",gen:"ὡρῶν",dat:"ὥραις",acc:"ὥρας",voc:"ὥραι"}}}
        ],
        exercises: {
    declension_fill: [
        {case:"gen_sg", word:"ὥρα", translation:"час", correct:"ὥρας", distractors:["ὡρῶν","ὥρᾳ","ὥραν"]},
        {case:"dat_sg", word:"ὥρα", translation:"час", correct:"ὥρᾳ", distractors:["ὥρας","ὥραν","ὥραις"]},
        {case:"acc_sg", word:"ὥρα", translation:"час", correct:"ὥραν", distractors:["ὥρας","ὥρᾳ","ὡρῶν"]},
        {case:"nom_pl", word:"ὥρα", translation:"час", correct:"ὥραι", distractors:["ὥρας","ὥραις","ὡρῶν"]},
        {case:"gen_pl", word:"ὥρα", translation:"час", correct:"ὡρῶν", distractors:["ὥρας","ὥρᾳ","ὥραις"]},
        {case:"dat_pl", word:"ὥρα", translation:"час", correct:"ὥραις", distractors:["ὡρῶν","ὥραι","ὥραν"]},
        {case:"acc_pl", word:"ὥρα", translation:"час", correct:"ὥρας", distractors:["ὥραις","ὡρῶν","ὥραι"]},
        {case:"gen_sg", word:"ἀλήθεια", translation:"истина", correct:"ἀληθείας", distractors:["ἀληθείᾳ","ἀλήθειαν","ἀλήθειαι"]},
        {case:"dat_sg", word:"ζωή", translation:"жизнь", correct:"ζωῇ", distractors:["ζωῆς","ζωήν","ζωαί"]},
        {case:"acc_sg", word:"βασιλεία", translation:"царство", correct:"βασιλείαν", distractors:["βασιλείας","βασιλείᾳ","βασιλεῖαι"]},
        {case:"nom_pl", word:"ἡμέρα", translation:"день", correct:"ἡμέραι", distractors:["ἡμέρας","ἡμέραις","ἡμερῶν"]},
        {case:"gen_pl", word:"γραφή", translation:"писание", correct:"γραφῶν", distractors:["γραφῆς","γραφαῖς","γραφάς"]},
        {case:"dat_pl", word:"καρδία", translation:"сердце", correct:"καρδίαις", distractors:["καρδίας","καρδιῶν","καρδίαι"]},
        {case:"acc_pl", word:"δόξα", translation:"слава", correct:"δόξας", distractors:["δόξαις","δοξῶν","δόξαι"]},
        {case:"gen_sg", word:"παραβολή", translation:"притча", correct:"παραβολῆς", distractors:["παραβολῇ","παραβολήν","παραβολαί"]},
        {case:"dat_sg", word:"εἰρήνη", translation:"мир", correct:"εἰρήνῃ", distractors:["εἰρήνης","εἰρήνην","εἰρῆναι"]},
        {case:"acc_sg", word:"φωνή", translation:"голос", correct:"φωνήν", distractors:["φωνῆς","φωνῇ","φωναί"]},
        {case:"gen_sg", word:"ἐκκλησία", translation:"церковь", correct:"ἐκκλησίας", distractors:["ἐκκλησίᾳ","ἐκκλησίαν","ἐκκλησίαι"]},
        {case:"dat_sg", word:"ψυχή", translation:"душа", correct:"ψυχῇ", distractors:["ψυχῆς","ψυχήν","ψυχαί"]},
        {case:"acc_pl", word:"ἐντολή", translation:"заповедь", correct:"ἐντολάς", distractors:["ἐντολαῖς","ἐντολῶν","ἐντολαί"]}
    ],
    translate_greek_to_russian: [
        {greek:"ἡ ἀλήθεια", keywords:["истина"]},
        {greek:"τῆς δόξης", keywords:["славы"]},
        {greek:"τῇ ψυχῇ", keywords:["душе"]},
        {greek:"τὴν ζωήν", keywords:["жизнь"]},
        {greek:"αἱ βασιλεῖαι", keywords:["царства"]},
        {greek:"τῶν ἡμερῶν", keywords:["дней"]},
        {greek:"ταῖς παραβολαῖς", keywords:["притчам"]},
        {greek:"ἡ φωνή", keywords:["голос"]},
        {greek:"ἡ ἐκκλησία", keywords:["церковь"]},
        {greek:"ἡ ψυχή", keywords:["душа"]},
        {greek:"ἡ ἐντολή", keywords:["заповедь"]},
        {greek:"ἡ ὥρα", keywords:["час"]}
    ],
    translate_russian_to_greek: [
        {russian:"истина", correct_sequence:["ἀλήθεια"], all_words:["ἀλήθεια","δόξα","ὥρα","ζωή"]},
        {russian:"славы (Gen.)", correct_sequence:["δόξης"], all_words:["δόξης","δόξαν","δόξαις","δόξαι"]},
        {russian:"жизнь (Acc.)", correct_sequence:["ζωήν"], all_words:["ζωήν","ζωή","ζωῆς","ζωαί"]},
        {russian:"царство", correct_sequence:["βασιλεία"], all_words:["βασιλεία","ἀλήθεια","ζωή","ἡμέρα"]},
        {russian:"день", correct_sequence:["ἡμέρα"], all_words:["ἡμέρα","βασιλεία","γραφή","καρδία"]},
        {russian:"писание", correct_sequence:["γραφή"], all_words:["γραφή","δόξα","παραβολή","εἰρήνη"]},
        {russian:"сердце", correct_sequence:["καρδία"], all_words:["καρδία","φωνή","ἐκκλησία","ψυχή"]},
        {russian:"слава", correct_sequence:["δόξα"], all_words:["δόξα","ἀλήθεια","ζωή","ὥρα"]},
        {russian:"притча", correct_sequence:["παραβολή"], all_words:["παραβολή","γραφή","ἐντολή","εἰρήνη"]},
        {russian:"мир", correct_sequence:["εἰρήνη"], all_words:["εἰρήνη","φωνή","ἐκκλησία","ψυχή"]},
        {russian:"голос", correct_sequence:["φωνή"], all_words:["φωνή","ἐκκλησία","ψυχή","ἐντολή"]},
        {russian:"церковь", correct_sequence:["ἐκκλησία"], all_words:["ἐκκλησία","ψυχή","ἐντολή","ὥρα"]},
        {russian:"душа", correct_sequence:["ψυχή"], all_words:["ψυχή","ἐντολή","ὥρα","φωνή"]},
        {russian:"заповедь", correct_sequence:["ἐντολή"], all_words:["ἐντολή","ὥρα","φωνή","ἐκκλησία"]},
        {russian:"час", correct_sequence:["ὥρα"], all_words:["ὥρα","ἐντολή","φωνή","ἐκκλησία"]}
    ],
    case_number: [
        {form:"ὡρῶν", correct:"Genitivus (Род. п.) мн.ч.", distractors:["Genitivus (Род. п.) ед.ч.","Dativus (Дат. п.) мн.ч.","Accusativus (Вин. п.) мн.ч."]},
        {form:"δόξαις", correct:"Dativus (Дат. п.) мн.ч.", distractors:["Dativus (Дат. п.) ед.ч.","Nominativus (Им. п.) мн.ч.","Accusativus (Вин. п.) мн.ч."]},
        {form:"ἀλήθειαι", correct:"Nominativus (Им. п.) мн.ч.", distractors:["Genitivus (Род. п.) мн.ч.","Dativus (Дат. п.) мн.ч.","Accusativus (Вин. п.) мн.ч."]},
        {form:"ζωῶν", correct:"Genitivus (Род. п.) мн.ч.", distractors:["Nominativus (Им. п.) мн.ч.","Dativus (Дат. п.) мн.ч.","Accusativus (Вин. п.) мн.ч."]},
        {form:"βασιλείαις", correct:"Dativus (Дат. п.) мн.ч.", distractors:["Nominativus (Им. п.) мн.ч.","Genitivus (Род. п.) мн.ч.","Accusativus (Вин. п.) мн.ч."]},
        {form:"ἡμέραν", correct:"Accusativus (Вин. п.) ед.ч.", distractors:["Nominativus (Им. п.) ед.ч.","Genitivus (Род. п.) ед.ч.","Dativus (Дат. п.) ед.ч."]}
    ]
},
translation: {
    ru_to_el: [
        { source: "Царство имеет славу.", correct: ["ἡ","βασιλεία","ἔχει","δόξαν"] },
        { source: "Церкви говорят сердцам людей притчи.", correct: ["αἱ","ἐκκλησίαι","λέγουσι","ταῖς","καρδίαις","τῶν","ἀνθρώπων","παραβολάς"] },
        { source: "Голос Сына Человеческого учит апостола, и голос апостола учит человека.", correct: ["ἡ","φωνὴ","τοῦ","υἱοῦ","τοῦ","ἀνθρώπου","διδάσκει","τὸν","ἀπόστολον","καὶ","ἡ","φωνὴ","τοῦ","ἀποστόλου","διδάσκει","τὸν","ἄνθρωπον"] },
        { source: "Мы имеем писания апостолов.", correct: ["ἔχομεν","τὰς","γραφὰς","τῶν","ἀποστόλων"] },
        { source: "Человек видит жизнь и смерть.", correct: ["ὁ","ἄνθρωπος","βλέπει","ζωὴν","καὶ","θάνατον"] },
        { source: "Апостолы освобождают души.", correct: ["οἱ","ἀπόστολοι","λύουσι","τὰς","ψυχάς"] },
        { source: "Мы видим дома и храмы.", correct: ["βλέπομεν","τοὺς","οἴκους","καὶ","τὰ","ἱερά"] },
        { source: "Иисус знает сердца людей.", correct: ["ὁ","Ἰησοῦς","γινώσκει","τὰς","καρδίας","τῶν","ἀνθρώπων"] },
        { source: "Мы знаем голоса церквей, слова истины и души людей.", correct: ["γινώσκομεν","τὰς","φωνὰς","τῶν","ἐκκλησιῶν","τοὺς","λόγους","τῆς","ἀληθείας","καὶ","τὰς","ψυχὰς","τῶν","ἀνθρώπων"] },
        { source: "Церкви имеют мир и славу.", correct: ["αἱ","ἐκκλησίαι","ἔχουσι","εἰρήνην","καὶ","δόξαν"] }
    ],
    el_to_ru: [
        { source: "ψυχή βλέπει ζωήν.", correct: "Душа видит жизнь." },
        { source: "βασιλεία γινώσκει άλήθειαν.", correct: "Царство знает истину." },
        { source: "άνθρωπος γράφει έντολάς καί νόμους.", correct: "Человек пишет заповеди и законы." },
        { source: "άπόστολοι γινώσκουσι δούλους καί έκκλησίας.", correct: "Апостолы знают рабов и церкви." },
        { source: "άπόστολοι καί έκκλησίαι βλέπουσι ζωήν καί θάνατον.", correct: "Апостолы и церкви видят жизнь и смерть." },
        { source: "υίός δούλου λέγει παραβολήν έκκλησία.", correct: "Сын раба говорит притчу церкви." },
        { source: "παραβολήν λέγομεν καί έντολήν καί νόμον.", correct: "Мы говорим притчу и заповедь и закон." },
        { source: "βασιλείας γινώσκετε καί έκκλησίας.", correct: "Вы знаете царства и церкви." },
        { source: "έκκλησίαν διδάσκει άπόστολος καί άνθρωπον.", correct: "Апостол учит церковь и человека." },
        { source: "νόμον καί παραβολήν γράφει άδελφός έκκλησία.", correct: "Брат пишет закон и притчу церкви." },
        { source: "καρδίαι άνθρώπων έχουσι ζωήν καί είρήνην.", correct: "Сердца людей имеют жизнь и мир." },
        { source: "φωνή άποστόλων διδάσκει ψυχάς δούλων.", correct: "Голос апостолов учит души рабов." },
        { source: "ίερόν έχει δόξαν.", correct: "Храм имеет славу." },
        { source: "φωναί έκκλησιών διδάσκουσι βασιλείας καί άνθρώπους.", correct: "Голоса церквей учат царства и людей." },
        { source: "βλέπεις δώρα καί ίερά.", correct: "Ты видишь дары и храмы." },
        { source: "γράφει έκκλησία λόγον ζωής.", correct: "Церковь пишет слово жизни." },
        { source: "λέγει καρδίας άνθρώπων παραβολήν καί νόμον.", correct: "Он говорит сердцам людей притчу и закон." },
        { source: "γράφει έκκλησία υίός άποστόλου.", correct: "Сын апостола пишет церкви." }
    ]
    }
},
    6: {
        title: "Прилагательные 1-2 склонения, артикль",
grammar: `<b>1. Прилагательные 1-2 склонения</b><br>
Прилагательные 1-2 склонения изменяются по трём родам:<br>
• <b>мужской род</b> — окончание <b>-ος</b> (как 2-е склонение)<br>
• <b>женский род</b> — окончание <b>-η</b> или <b>-α</b><br>
• <b>средний род</b> — окончание <b>-ον</b> (как 2-е склонение)<br><br>
<b>Особенности женского рода:</b><br>
• После букв <b>ε, ι, ρ</b> в женском роде используется окончание <b>-α</b> (а не -η)<br>
• Пример: δίκαιος → δικαία (справедливая)<br>
• В остальных случаях — окончание <b>-η</b><br>
• Пример: ἀγαθός → ἀγαθή (хорошая)<br><br>

<b>2. Склонение ἀγαθός, -ή, -όν (хороший)</b><br>
<table>
  <tr><th>Падеж</th><th>Муж.</th><th>Жен.</th><th>Ср.</th></tr>
  <tr><td>Nom.</td><td>ἀγαθός</td><td>ἀγαθή</td><td>ἀγαθόν</td></tr>
  <tr><td>Gen.</td><td>ἀγαθοῦ</td><td>ἀγαθῆς</td><td>ἀγαθοῦ</td></tr>
  <tr><td>Dat.</td><td>ἀγαθῷ</td><td>ἀγαθῇ</td><td>ἀγαθῷ</td></tr>
  <tr><td>Acc.</td><td>ἀγαθόν</td><td>ἀγαθήν</td><td>ἀγαθόν</td></tr>
  <tr><td>Voc.</td><td>ἀγαθέ</td><td>ἀγαθή</td><td>ἀγαθόν</td></tr>
</table><br>
<b>Множественное число:</b><br>
<table>
  <tr><th>Падеж</th><th>Муж.</th><th>Жен.</th><th>Ср.</th></tr>
  <tr><td>Nom.</td><td>ἀγαθοί</td><td>ἀγαθαί</td><td>ἀγαθά</td></tr>
  <tr><td>Gen.</td><td>ἀγαθῶν</td><td>ἀγαθῶν</td><td>ἀγαθῶν</td></tr>
  <tr><td>Dat.</td><td>ἀγαθοῖς</td><td>ἀγαθαῖς</td><td>ἀγαθοῖς</td></tr>
  <tr><td>Acc.</td><td>ἀγαθούς</td><td>ἀγαθάς</td><td>ἀγαθά</td></tr>
</table><br>
<i>Обратите внимание:</i> ударение в родительном падеже множественного числа женского рода стоит на окончании (как у существительных 1-го склонения).<br><br>

<b>3. Определённый артикль (ὁ, ἡ, τό)</b><br>
<table>
  <tr><th>Падеж</th><th>Муж.</th><th>Жен.</th><th>Ср.</th></tr>
  <tr><td>Nom.</td><td>ὁ</td><td>ἡ</td><td>τό</td></tr>
  <tr><td>Gen.</td><td>τοῦ</td><td>τῆς</td><td>τοῦ</td></tr>
  <tr><td>Dat.</td><td>τῷ</td><td>τῇ</td><td>τῷ</td></tr>
  <tr><td>Acc.</td><td>τόν</td><td>τήν</td><td>τό</td></tr>
</table><br>
<b>Множественное число:</b><br>
<table>
  <tr><th>Падеж</th><th>Муж.</th><th>Жен.</th><th>Ср.</th></tr>
  <tr><td>Nom.</td><td>οἱ</td><td>αἱ</td><td>τά</td></tr>
  <tr><td>Gen.</td><td>τῶν</td><td>τῶν</td><td>τῶν</td></tr>
  <tr><td>Dat.</td><td>τοῖς</td><td>ταῖς</td><td>τοῖς</td></tr>
  <tr><td>Acc.</td><td>τούς</td><td>τάς</td><td>τά</td></tr>
</table><br>

<b>4. Употребление прилагательных: атрибутивное и предикативное</b><br>
• <b>Атрибутивное</b> (прилагательное стоит перед существительным и согласуется с ним в роде, числе и падеже).<br>
  Пример: <i>ὁ ἀγαθὸς ἄνθρωπος</i> — «хороший человек» (прилагательное с артиклем).<br>
• <b>Предикативное</b> (прилагательное стоит после существительного и является частью сказуемого).<br>
  Пример: <i>ὁ ἄνθρωπος ἀγαθός</i> — «человек хорош» (прилагательное без артикля).<br><br>

<b>5. Субстантивация прилагательных</b><br>
Прилагательные могут употребляться как существительные (с артиклем).<br>
• <i>οἱ ἀγαθοί</i> — «хорошие (люди)»<br>
• <i>τὸ καλόν</i> — «красивое (дело / вещь)»<br>
• <i>τὰ κακά</i> — «плохие (дела / вещи)»<br>
• <i>οἱ δίκαιοι</i> — «справедливые (люди)»<br><br>

<b>6. Дополнительные примеры прилагательных 1-2 склонения</b><br>
• <b>καλός, -ή, -όν</b> — красивый, хороший<br>
• <b>κακός, -ή, -όν</b> — плохой, злой<br>
• <b>δίκαιος, -α, -ον</b> — справедливый<br>
• <b>μικρός, -ά, -όν</b> — маленький<br>
• <b>πιστός, -ή, -όν</b> — верный<br>
• <b>πρῶτος, -η, -ον</b> — первый<br>
• <b>ἔσχατος, -η, -ον</b> — последний<br>
• <b>νεκρός, -ά, -όν</b> — мёртвый<br>
• <b>ἄλλος, -η, -ο</b> — другой<br><br>

<i>Все эти прилагательные склоняются по образцу ἀγαθός (с учётом особенностей женского рода).`,
        vocabulary: [
            {greek:"ἀγαθός, ή, όν", translation:"хороший (-ая, -ее)", type:"adjective", declension_forms:{masculine:{singular:{nom:"ἀγαθός",gen:"ἀγαθοῦ",dat:"ἀγαθῷ",acc:"ἀγαθόν",voc:"ἀγαθέ"},plural:{nom:"ἀγαθοί",gen:"ἀγαθῶν",dat:"ἀγαθοῖς",acc:"ἀγαθούς",voc:"ἀγαθοί"}},feminine:{singular:{nom:"ἀγαθή",gen:"ἀγαθῆς",dat:"ἀγαθῇ",acc:"ἀγαθήν",voc:"ἀγαθή"},plural:{nom:"ἀγαθαί",gen:"ἀγαθῶν",dat:"ἀγαθαῖς",acc:"ἀγαθάς",voc:"ἀγαθαί"}},neuter:{singular:{nom:"ἀγαθόν",gen:"ἀγαθοῦ",dat:"ἀγαθῷ",acc:"ἀγαθόν",voc:"ἀγαθόν"},plural:{nom:"ἀγαθά",gen:"ἀγαθῶν",dat:"ἀγαθοῖς",acc:"ἀγαθά",voc:"ἀγαθά"}}}},
            {greek:"ἄλλος, η, ο", translation:"другой (-ая, -ое)", type:"adjective", declension_forms:{masculine:{singular:{nom:"ἄλλος",gen:"ἄλλου",dat:"ἄλλῳ",acc:"ἄλλον",voc:"ἄλλε"},plural:{nom:"ἄλλοι",gen:"ἄλλων",dat:"ἄλλοις",acc:"ἄλλους",voc:"ἄλλοι"}},feminine:{singular:{nom:"ἄλλη",gen:"ἄλλης",dat:"ἄλλῃ",acc:"ἄλλην",voc:"ἄλλη"},plural:{nom:"ἄλλαι",gen:"ἄλλων",dat:"ἄλλαις",acc:"ἄλλας",voc:"ἄλλαι"}},neuter:{singular:{nom:"ἄλλο",gen:"ἄλλου",dat:"ἄλλῳ",acc:"ἄλλο",voc:"ἄλλο"},plural:{nom:"ἄλλα",gen:"ἄλλων",dat:"ἄλλοις",acc:"ἄλλα",voc:"ἄλλα"}}}},
            {greek:"δίκαιος, α, ον", translation:"справедливый, праведный (-ая, -ое)", type:"adjective", declension_forms:{masculine:{singular:{nom:"δίκαιος",gen:"δικαίου",dat:"δικαίῳ",acc:"δίκαιον",voc:"δίκαιε"},plural:{nom:"δίκαιοι",gen:"δικαίων",dat:"δικαίοις",acc:"δικαίους",voc:"δίκαιοι"}},feminine:{singular:{nom:"δικαία",gen:"δικαίας",dat:"δικαίᾳ",acc:"δικαίαν",voc:"δικαία"},plural:{nom:"δικαῖαι",gen:"δικαίων",dat:"δικαίαις",acc:"δικαίας",voc:"δικαῖαι"}},neuter:{singular:{nom:"δίκαιον",gen:"δικαίου",dat:"δικαίῳ",acc:"δίκαιον",voc:"δίκαιον"},plural:{nom:"δίκαια",gen:"δικαίων",dat:"δικαίοις",acc:"δίκαια",voc:"δίκαια"}}}},
            {greek:"ἔσχατος, η, ον", translation:"последний (-ая, -ее)", type:"adjective", declension_forms:{masculine:{singular:{nom:"ἔσχατος",gen:"ἐσχάτου",dat:"ἐσχάτῳ",acc:"ἔσχατον",voc:"ἔσχατε"},plural:{nom:"ἔσχατοι",gen:"ἐσχάτων",dat:"ἐσχάτοις",acc:"ἐσχάτους",voc:"ἔσχατοι"}},feminine:{singular:{nom:"ἐσχάτη",gen:"ἐσχάτης",dat:"ἐσχάτῃ",acc:"ἐσχάτην",voc:"ἐσχάτη"},plural:{nom:"ἔσχαται",gen:"ἐσχάτων",dat:"ἐσχάταις",acc:"ἐσχάτας",voc:"ἔσχαται"}},neuter:{singular:{nom:"ἔσχατον",gen:"ἐσχάτου",dat:"ἐσχάτῳ",acc:"ἔσχατον",voc:"ἔσχατον"},plural:{nom:"ἔσχατα",gen:"ἐσχάτων",dat:"ἐσχάτοις",acc:"ἔσχατα",voc:"ἔσχατα"}}}},
            {greek:"κακός, ή, όν", translation:"плохой, злой (-ая, -ое)", type:"adjective", declension_forms:{masculine:{singular:{nom:"κακός",gen:"κακοῦ",dat:"κακῷ",acc:"κακόν",voc:"κακέ"},plural:{nom:"κακοί",gen:"κακῶν",dat:"κακοῖς",acc:"κακούς",voc:"κακοί"}},feminine:{singular:{nom:"κακή",gen:"κακῆς",dat:"κακῇ",acc:"κακήν",voc:"κακή"},plural:{nom:"κακαί",gen:"κακῶν",dat:"κακαῖς",acc:"κακάς",voc:"κακαί"}},neuter:{singular:{nom:"κακόν",gen:"κακοῦ",dat:"κακῷ",acc:"κακόν",voc:"κακόν"},plural:{nom:"κακά",gen:"κακῶν",dat:"κακοῖς",acc:"κακά",voc:"κακά"}}}},
            {greek:"καλός, ή, όν", translation:"хороший, красивый (-ая, -ее/-ое)", type:"adjective", declension_forms:{masculine:{singular:{nom:"καλός",gen:"καλοῦ",dat:"καλῷ",acc:"καλόν",voc:"καλέ"},plural:{nom:"καλοί",gen:"καλῶν",dat:"καλοῖς",acc:"καλούς",voc:"καλοί"}},feminine:{singular:{nom:"καλή",gen:"καλῆς",dat:"καλῇ",acc:"καλήν",voc:"καλή"},plural:{nom:"καλαί",gen:"καλῶν",dat:"καλαῖς",acc:"καλάς",voc:"καλαί"}},neuter:{singular:{nom:"καλόν",gen:"καλοῦ",dat:"καλῷ",acc:"καλόν",voc:"καλόν"},plural:{nom:"καλά",gen:"καλῶν",dat:"καλοῖς",acc:"καλά",voc:"καλά"}}}},
            {greek:"μικρός, ά, όν", translation:"маленький (-ая, -ое)", type:"adjective", declension_forms:{masculine:{singular:{nom:"μικρός",gen:"μικροῦ",dat:"μικρῷ",acc:"μικρόν",voc:"μικρέ"},plural:{nom:"μικροί",gen:"μικρῶν",dat:"μικροῖς",acc:"μικρούς",voc:"μικροί"}},feminine:{singular:{nom:"μικρά",gen:"μικρᾶς",dat:"μικρᾷ",acc:"μικράν",voc:"μικρά"},plural:{nom:"μικραί",gen:"μικρῶν",dat:"μικραῖς",acc:"μικράς",voc:"μικραί"}},neuter:{singular:{nom:"μικρόν",gen:"μικροῦ",dat:"μικρῷ",acc:"μικρόν",voc:"μικρόν"},plural:{nom:"μικρά",gen:"μικρῶν",dat:"μικροῖς",acc:"μικρά",voc:"μικρά"}}}},
            {greek:"νεκρός, ά, όν", translation:"мёртвый (-ая, -ое)", type:"adjective", declension_forms:{masculine:{singular:{nom:"νεκρός",gen:"νεκροῦ",dat:"νεκρῷ",acc:"νεκρόν",voc:"νεκρέ"},plural:{nom:"νεκροί",gen:"νεκρῶν",dat:"νεκροῖς",acc:"νεκρούς",voc:"νεκροί"}},feminine:{singular:{nom:"νεκρά",gen:"νεκρᾶς",dat:"νεκρᾷ",acc:"νεκράν",voc:"νεκρά"},plural:{nom:"νεκραί",gen:"νεκρῶν",dat:"νεκραῖς",acc:"νεκράς",voc:"νεκραί"}},neuter:{singular:{nom:"νεκρόν",gen:"νεκροῦ",dat:"νεκρῷ",acc:"νεκρόν",voc:"νεκρόν"},plural:{nom:"νεκρά",gen:"νεκρῶν",dat:"νεκροῖς",acc:"νεκρά",voc:"νεκρά"}}}},
            {greek:"πιστός, ή, όν", translation:"верный (-ая, -ое)", type:"adjective", declension_forms:{masculine:{singular:{nom:"πιστός",gen:"πιστοῦ",dat:"πιστῷ",acc:"πιστόν",voc:"πιστέ"},plural:{nom:"πιστοί",gen:"πιστῶν",dat:"πιστοῖς",acc:"πιστούς",voc:"πιστοί"}},feminine:{singular:{nom:"πιστή",gen:"πιστῆς",dat:"πιστῇ",acc:"πιστήν",voc:"πιστή"},plural:{nom:"πισταί",gen:"πιστῶν",dat:"πισταῖς",acc:"πιστάς",voc:"πισταί"}},neuter:{singular:{nom:"πιστόν",gen:"πιστοῦ",dat:"πιστῷ",acc:"πιστόν",voc:"πιστόν"},plural:{nom:"πιστά",gen:"πιστῶν",dat:"πιστοῖς",acc:"πιστά",voc:"πιστά"}}}},
            {greek:"πρῶτος, η, ον", translation:"первый (-ая, -ое)", type:"adjective", declension_forms:{masculine:{singular:{nom:"πρῶτος",gen:"πρώτου",dat:"πρώτῳ",acc:"πρῶτον",voc:"πρῶτε"},plural:{nom:"πρῶτοι",gen:"πρώτων",dat:"πρώτοις",acc:"πρώτους",voc:"πρῶτοι"}},feminine:{singular:{nom:"πρώτη",gen:"πρώτης",dat:"πρώτῃ",acc:"πρώτην",voc:"πρώτη"},plural:{nom:"πρῶται",gen:"πρώτων",dat:"πρώταις",acc:"πρώτας",voc:"πρῶται"}},neuter:{singular:{nom:"πρῶτον",gen:"πρώτου",dat:"πρώτῳ",acc:"πρῶτον",voc:"πρῶτον"},plural:{nom:"πρῶτα",gen:"πρώτων",dat:"πρώτοις",acc:"πρῶτα",voc:"πρῶτα"}}}}
        ],
        exercises: {
            agreement: [
                {noun:"λόγος", article:"ὁ", adjective:"ἀγαθός", correct:"ἀγαθός", distractors:["ἀγαθόν","ἀγαθοῦ","ἀγαθῷ"]},
                {noun:"ψυχή", article:"ἡ", adjective:"πιστός", correct:"πιστή", distractors:["πιστός","πιστόν","πιστῆς"]},
                {noun:"δῶρον", article:"τό", adjective:"καλός", correct:"καλόν", distractors:["καλός","καλή","καλοῦ"]}
            ],
            attribute_vs_predicate: [
                {phrase:"ὁ ἀγαθὸς ἄνθρωπος", correct:"атрибутив", distractors:["предикатив"]},
                {phrase:"ὁ ἄνθρωπος ἀγαθός", correct:"предикатив", distractors:["атрибутив"]}
            ],
            substantivation: [
                {phrase:"οἱ ἀγαθοί", correct:"хорошие (люди)", distractors:["хорошие (вещи)","хорошие (женщины)","добро"]},
                {phrase:"τὸ καλόν", correct:"красивое (дело/вещь)", distractors:["красивый (человек)","красивая (женщина)","красота"]}
            ],
            article_fill: [
                {noun:"ἀγαθῷ ἀνθρώπῳ", correct_article:"τῷ", distractors:["τόν","τοῦ","τήν"]},
                {noun:"καλῆς ψυχῆς", correct_article:"τῆς", distractors:["τήν","τῇ","τοῦ"]},
                {noun:"δίκαιον λόγον", correct_article:"τόν", distractors:["τοῦ","τῷ","τήν"]}
            ]
        },
translation: {
    ru_to_el: [
        { source: "Первой Церкви Господь пишет первую притчу.", correct: ["τῇ","πρώτῃ","ἐκκλησίᾳ","ὁ","κύριος","γράφει","τὴν","πρώτην","παραβολήν"] },
        { source: "Хорошая (девушка) видит пути пустыни.", correct: ["ἡ","καλὴ","παρθένος","βλέπει","τὰς","ὁδοὺς","τῆς","ἐρήμου"] },
        { source: "Хорошие (дела) — первые, а плохие (дела) — последние.", correct: ["τὰ","καλὰ","πρῶτά","ἐστιν","τὰ","δὲ","κακὰ","ἔσχατα"] },
        { source: "Смерть плоха, а жизнь хороша.", correct: ["ὁ","θάνατος","κακός","ἐστιν","ἡ","δὲ","ζωὴ","καλή"] },
        { source: "Господь Царства воскрешает верных (мужчин) и верных (женщин).", correct: ["ὁ","κύριος","τῆς","βασιλείας","ἐγείρει","τοὺς","πιστοὺς","καὶ","τὰς","πιστάς"] },
        { source: "Хорошие (люди) знают плохих (людей), и плохие (люди) знают хороших (людей).", correct: ["οἱ","ἀγαθοὶ","γινώσκουσι","τοὺς","κακοὺς","καὶ","οἱ","κακοὶ","γινώσκουσι","τοὺς","ἀγαθούς"] },
        { source: "Хорошие слова мы говорим Церкви, а плохое (слово) пишут люди.", correct: ["τοὺς","ἀγαθούς","λόγους","λέγομεν","τῇ","ἐκκλησίᾳ","τὸ","δὲ","κακὸν","γράφουσι","οἱ","ἄνθρωποι"] },
        { source: "Красивые девушки видят плохой путь.", correct: ["αἱ","καλαὶ","παρθένοι","βλέπουσι","τὴν","κακὴν","ὁδόν"] }
    ],
    el_to_ru: [
    {source:"ἀγαθὴ ἡ ἐκκλησία καὶ ἡ βασιλεία κακή.", correct:"Церковь хороша, а царство плохо."},
    {source:"ἡ κακὴ καρδία τοῦ ἀνθρώπου γινώσκει θάνατον.", correct:"Злое сердце человека знает смерть."},
    {source:"οἱ ἀπόστολοι βλέπουσι τοὺς μικροὺς οἴκους καὶ τὰς κακὰς ὁδούς.", correct:"Апостолы видят маленькие дома и плохие дороги."},
    {source:"οἱ δοῦλοι οἱ κακοὶ λύουσι τὸν οἶκον τοῦ ἀποστόλου.", correct:"Плохие рабы разрушают дом апостола."},
    {source:"οἱ κακοὶ λύουσι τὸ ἱερόν.", correct:"Плохие разрушают храм."},
    {source:"ὁ κύριος τῆς ζωῆς ἐγείρει τοὺς νεκρούς.", correct:"Господь жизни воскрешает мёртвых."},
    {source:"οἱ λόγοι τῆς ἀληθείας διδάσκουσι καὶ τοὺς ἄλλους.", correct:"Слова истины учат и других."},
    {source:"αἱ δίκαιαι παρθένοι λαμβάνουσι τὰ δῶρα τοῦ κυρίου τὰ καλά.", correct:"Праведные девы получают хорошие дары Господа."},
    {source:"ὁ κακὸς βλέπει τὴν ἔρημον καὶ τοὺς ἐσχάτους οἴκους.", correct:"Злой видит пустыню и последние дома."},
    {source:"πρῶτοι οἱ δοῦλοι· ἔσχατοι οἱ κύριοι.", correct:"Первые — рабы; последние — господа."},
    {source:"τῇ ἐκκλησίᾳ τῇ μικρᾷ γράφει ὁ κύριος λόγον ἀγαθόν.", correct:"Малой церкви Господь пишет доброе слово."},
    {source:"τοὺς πιστοὺς βλέπει ὁ πιστός.", correct:"Верный видит верных."},
    {source:"ἔσχατοι οἱ δοῦλοι οἱ κακοί· πρῶτοι οἱ υἱοὶ οἱ ἀγαθοί.", correct:"Последние — злые рабы; первые — добрые сыновья."},
    {source:"ὁ υἱὸς τοῦ ἐσχάτου ἀδελφοῦ βλέπει τὰς καλὰς ἐκκλησίας τοῦ κυρίου.", correct:"Сын последнего брата видит хорошие церкви Господа."},
    {source:"ἄλλην παραβολὴν λέγομεν τῇ κακῇ παρθένῳ.", correct:"Мы говорим другую притчу злой деве."},
    {source:"πρώτη ἡ ἐκκλησία· ἐσχάτη ἡ βασιλεία.", correct:"Первая — церковь; последнее — царство."},
    {source:"ταῖς πισταῖς λέγει ὁ κύριος παραβολὴν καλὴν καὶ τοῖς πιστοῖς.", correct:"Верным (женщинам) Господь говорит хорошую притчу, и верным (мужчинам)."},
    {source:"ὁ ἀγαθὸς γράφει ἀγαθά· ὁ κακὸς κακά.", correct:"Хороший пишет хорошее; злой — злое."},
    {source:"ἀγαθὸς ὁ δοῦλος καὶ λέγει καλά.", correct:"Хорош раб, и говорит хорошее."},
    {source:"ἡ ἀλήθεια πιστὴ καὶ οἱ ἄνθρωποι κακοί.", correct:"Истина верна, а люди злы."}
    ]
    }
},
    7: {
        title: "Существительные муж. рода 1-го скл., предлоги",
grammar: `<b>1. Существительные мужского рода 1-го склонения</b><br>
Некоторые существительные мужского рода имеют основу на -α и склоняются по 1-му склонению, но артикль у них — по 2-му склонению (ἄνθρωπος). В именительном падеже единственного числа они могут оканчиваться на <b>-ης</b> (например, προφήτης) или на <b>-ας</b> (например, νεανίας).<br><br>

<b>2. Склонение προφήτης (пророк) — тип -ης</b><br>
<table>
  <tr><th>Падеж</th><th>Ед.ч.</th><th>Мн.ч.</th><th>Перевод ед.</th><th>Перевод мн.</th></tr>
  <tr><td>Nom.</td><td>προφήτης</td><td>προφῆται</td><td>пророк</td><td>пророки</td></tr>
  <tr><td>Gen.</td><td>προφήτου</td><td>προφητῶν</td><td>пророка</td><td>пророков</td></tr>
  <tr><td>Dat.</td><td>προφήτῃ</td><td>προφήταις</td><td>пророку</td><td>пророкам</td></tr>
  <tr><td>Acc.</td><td>προφήτην</td><td>προφήτας</td><td>пророка</td><td>пророков</td></tr>
  <tr><td>Voc.</td><td>προφῆτα</td><td>προφῆται</td><td>о пророк!</td><td>о пророки!</td></tr>
</table><br>

<b>3. Склонение νεανίας (юноша) — тип -ας</b><br>
<table>
  <tr><th>Падеж</th><th>Ед.ч.</th><th>Мн.ч.</th><th>Перевод ед.</th><th>Перевод мн.</th></tr>
  <tr><td>Nom.</td><td>νεανίας</td><td>νεανίαι</td><td>юноша</td><td>юноши</td></tr>
  <tr><td>Gen.</td><td>νεανίου</td><td>νεανιῶν</td><td>юноши</td><td>юношей</td></tr>
  <tr><td>Dat.</td><td>νεανίᾳ</td><td>νεανίαις</td><td>юноше</td><td>юношам</td></tr>
  <tr><td>Acc.</td><td>νεανίαν</td><td>νεανίας</td><td>юношу</td><td>юношей</td></tr>
  <tr><td>Voc.</td><td>νεανία</td><td>νεανίαι</td><td>о юноша!</td><td>о юноши!</td></tr>
</table><br>
<i>Особенности:</i> в родительном падеже единственного числа окончание <b>-ου</b> (как у 2-го склонения), а в звательном — <b>-α</b>.<br><br>

<b>4. Предлоги и их употребление (основные для этого урока)</b><br>
<table>
  <tr><th>Предлог</th><th>Падеж</th><th>Значение</th><th>Пример</th></tr>
  <tr><td>ἀπό</td><td>+ Gen.</td><td>от</td><td>ἀπὸ τοῦ οἴκου — от дома</td></tr>
  <tr><td>διά</td><td>+ Gen.</td><td>через, сквозь</td><td>διὰ τῆς ἐρήμου — через пустыню</td></tr>
  <tr><td>διά</td><td>+ Acc.</td><td>из-за, вследствие</td><td>διὰ τὴν ἀλήθειαν — из-за истины</td></tr>
  <tr><td>εἰς</td><td>+ Acc.</td><td>в (куда)</td><td>εἰς τὸν οἶκον — в дом</td></tr>
  <tr><td>ἐκ</td><td>+ Gen.</td><td>из</td><td>ἐκ τοῦ οἴκου — из дома</td></tr>
  <tr><td>ἐν</td><td>+ Dat.</td><td>в (где)</td><td>ἐν τῷ οἴκῳ — в доме</td></tr>
  <tr><td>μετά</td><td>+ Gen.</td><td>с (кем)</td><td>μετὰ τῶν μαθητῶν — с учениками</td></tr>
  <tr><td>μετά</td><td>+ Acc.</td><td>после</td><td>μετὰ τὸν κύριον — после Господа</td></tr>
  <tr><td>πρός</td><td>+ Acc.</td><td>к</td><td>πρὸς τὸν θεόν — к Богу</td></tr>
</table><br>
<i>Важно:</i> перед гласными предлог <b>ἐκ</b> принимает форму <b>ἐξ</b> (например, ἐξ οἴκου — из дома).<br><br>

<b>5. Особенности ударения</b><br>
• У слов типа προφήτης и νεανίας в Gen. Pl. ударение переходит на окончание (περισπώμενον): προφητῶν, νεανιῶν.<br>
• В Dat. Pl. ударение падает на третий слог от конца: προφήταις, νεανίαις.`,
        vocabulary: [
            {greek:"ἄγγελος", article:"ὁ", translation:"ангел, вестник", type:"noun", declension_forms:{singular:{nom:"ἄγγελος",gen:"ἀγγέλου",dat:"ἀγγέλῳ",acc:"ἄγγελον",voc:"ἄγγελε"},plural:{nom:"ἄγγελοι",gen:"ἀγγέλων",dat:"ἀγγέλοις",acc:"ἀγγέλους",voc:"ἄγγελοι"}}},
            {greek:"βαπτιστής", article:"ὁ", translation:"креститель", type:"noun", declension_forms:{singular:{nom:"βαπτιστής",gen:"βαπτιστοῦ",dat:"βαπτιστῇ",acc:"βαπτιστήν",voc:"βαπτιστά"},plural:{nom:"βαπτισταί",gen:"βαπτιστῶν",dat:"βαπτισταῖς",acc:"βαπτιστάς",voc:"βαπτισταί"}}},
            {greek:"θεός", article:"ὁ", translation:"Бог", type:"noun", declension_forms:{singular:{nom:"θεός",gen:"θεοῦ",dat:"θεῷ",acc:"θεόν",voc:"θεέ"},plural:{nom:"θεοί",gen:"θεῶν",dat:"θεοῖς",acc:"θεούς",voc:"θεοί"}}},
            {greek:"κόσμος", article:"ὁ", translation:"мир, вселенная", type:"noun", declension_forms:{singular:{nom:"κόσμος",gen:"κόσμου",dat:"κόσμῳ",acc:"κόσμον",voc:"κόσμε"},plural:{nom:"κόσμοι",gen:"κόσμων",dat:"κόσμοις",acc:"κόσμους",voc:"κόσμοι"}}},
            {greek:"λίθος", article:"ὁ", translation:"камень", type:"noun", declension_forms:{singular:{nom:"λίθος",gen:"λίθου",dat:"λίθῳ",acc:"λίθον",voc:"λίθε"},plural:{nom:"λίθοι",gen:"λίθων",dat:"λίθοις",acc:"λίθους",voc:"λίθοι"}}},
            {greek:"μαθητής", article:"ὁ", translation:"ученик", type:"noun", declension_forms:{singular:{nom:"μαθητής",gen:"μαθητοῦ",dat:"μαθητῇ",acc:"μαθητήν",voc:"μαθητά"},plural:{nom:"μαθηταί",gen:"μαθητῶν",dat:"μαθηταῖς",acc:"μαθητάς",voc:"μαθηταί"}}},
            {greek:"νεανίας", article:"ὁ", translation:"юноша", type:"noun", declension_forms:{singular:{nom:"νεανίας",gen:"νεανίου",dat:"νεανίᾳ",acc:"νεανίαν",voc:"νεανία"},plural:{nom:"νεανίαι",gen:"νεανιῶν",dat:"νεανίαις",acc:"νεανίας",voc:"νεανίαι"}}},
            {greek:"οὐρανός", article:"ὁ", translation:"небо", type:"noun", declension_forms:{singular:{nom:"οὐρανός",gen:"οὐρανοῦ",dat:"οὐρανῷ",acc:"οὐρανόν",voc:"οὐρανέ"},plural:{nom:"οὐρανοί",gen:"οὐρανῶν",dat:"οὐρανοῖς",acc:"οὐρανούς",voc:"οὐρανοί"}}},
            {greek:"προφήτης", article:"ὁ", translation:"пророк", type:"noun", declension_forms:{singular:{nom:"προφήτης",gen:"προφήτου",dat:"προφήτῃ",acc:"προφήτην",voc:"προφῆτα"},plural:{nom:"προφῆται",gen:"προφητῶν",dat:"προφήταις",acc:"προφήτας",voc:"προφῆται"}}},
            {greek:"τέκνον", article:"τό", translation:"ребенок, дитя", type:"noun", declension_forms:{singular:{nom:"τέκνον",gen:"τέκνου",dat:"τέκνῳ",acc:"τέκνον",voc:"τέκνον"},plural:{nom:"τέκνα",gen:"τέκνων",dat:"τέκνοις",acc:"τέκνα",voc:"τέκνα"}}}
        ],
        exercises: {
    declension_fill: [
        {case:"gen_sg", word:"προφήτης", translation:"пророк", correct:"προφήτου", distractors:["προφητῶν","προφήτῃ","προφήτην"]},
        {case:"dat_sg", word:"προφήτης", translation:"пророк", correct:"προφήτῃ", distractors:["προφήτου","προφήταις","προφήτην"]},
        {case:"acc_sg", word:"προφήτης", translation:"пророк", correct:"προφήτην", distractors:["προφήτου","προφήτῃ","προφῆτα"]},
        {case:"nom_pl", word:"προφήτης", translation:"пророк", correct:"προφῆται", distractors:["προφήτας","προφητῶν","προφήταις"]},
        {case:"gen_pl", word:"προφήτης", translation:"пророк", correct:"προφητῶν", distractors:["προφήτου","προφήταις","προφῆται"]},
        {case:"dat_pl", word:"προφήτης", translation:"пророк", correct:"προφήταις", distractors:["προφητῶν","προφήτῃ","προφήτας"]},
        {case:"acc_pl", word:"προφήτης", translation:"пророк", correct:"προφήτας", distractors:["προφήταις","προφητῶν","προφῆται"]},
        {case:"gen_sg", word:"ἄγγελος", translation:"ангел", correct:"ἀγγέλου", distractors:["ἀγγέλῳ","ἄγγελον","ἄγγελοι"]},
        {case:"dat_sg", word:"βαπτιστής", translation:"креститель", correct:"βαπτιστῇ", distractors:["βαπτιστοῦ","βαπτιστήν","βαπτιστά"]},
        {case:"acc_sg", word:"θεός", translation:"Бог", correct:"θεόν", distractors:["θεοῦ","θεῷ","θεέ"]},
        {case:"nom_pl", word:"κόσμος", translation:"мир", correct:"κόσμοι", distractors:["κόσμους","κόσμων","κόσμοις"]},
        {case:"gen_pl", word:"λίθος", translation:"камень", correct:"λίθων", distractors:["λίθοις","λίθους","λίθοι"]},
        {case:"dat_pl", word:"μαθητής", translation:"ученик", correct:"μαθηταῖς", distractors:["μαθητῶν","μαθητάς","μαθηταί"]},
        {case:"acc_sg", word:"νεανίας", translation:"юноша", correct:"νεανίαν", distractors:["νεανίου","νεανίᾳ","νεανία"]},
        {case:"gen_sg", word:"οὐρανός", translation:"небо", correct:"οὐρανοῦ", distractors:["οὐρανῷ","οὐρανόν","οὐρανέ"]},
        {case:"dat_sg", word:"τέκνον", translation:"дитя", correct:"τέκνῳ", distractors:["τέκνου","τέκνον","τέκνα"]}
    ],
    translate_greek_to_russian: [
        {greek:"ὁ προφήτης", keywords:["пророк"]},
        {greek:"τοῦ ἀγγέλου", keywords:["ангела"]},
        {greek:"τῷ θεῷ", keywords:["Богу"]},
        {greek:"τὸν κόσμον", keywords:["мир"]},
        {greek:"οἱ μαθηταί", keywords:["ученики"]},
        {greek:"τῶν οὐρανῶν", keywords:["небес"]},
        {greek:"ὁ ἄγγελος", keywords:["ангел"]},
        {greek:"ὁ βαπτιστής", keywords:["креститель"]},
        {greek:"ὁ θεός", keywords:["Бог"]},
        {greek:"ὁ κόσμος", keywords:["мир"]},
        {greek:"ὁ λίθος", keywords:["камень"]},
        {greek:"ὁ μαθητής", keywords:["ученик"]},
        {greek:"ὁ νεανίας", keywords:["юноша"]},
        {greek:"ὁ οὐρανός", keywords:["небо"]},
        {greek:"τὸ τέκνον", keywords:["дитя"]}
    ],
    translate_russian_to_greek: [
        {russian:"пророк", correct_sequence:["προφήτης"], all_words:["προφήτης","μαθητής","ἄγγελος"]},
        {russian:"юноши (Gen.)", correct_sequence:["νεανίου"], all_words:["νεανίου","νεανίαν","νεανίαις"]},
        {russian:"к Богу", correct_sequence:["πρὸς","τὸν","θεόν"], all_words:["πρὸς","τὸν","θεόν","ἀπό","τοῦ"]},
        {russian:"ангел", correct_sequence:["ἄγγελος"], all_words:["ἄγγελος","βαπτιστής","θεός","κόσμος"]},
        {russian:"креститель", correct_sequence:["βαπτιστής"], all_words:["βαπτιστής","προφήτης","μαθητής","νεανίας"]},
        {russian:"Бог", correct_sequence:["θεός"], all_words:["θεός","κόσμος","οὐρανός","λίθος"]},
        {russian:"мир", correct_sequence:["κόσμος"], all_words:["κόσμος","οὐρανός","λίθος","ἄγγελος"]},
        {russian:"камень", correct_sequence:["λίθος"], all_words:["λίθος","θεός","κόσμος","οὐρανός"]},
        {russian:"ученик", correct_sequence:["μαθητής"], all_words:["μαθητής","προφήτης","βαπτιστής","νεανίας"]},
        {russian:"юноша", correct_sequence:["νεανίας"], all_words:["νεανίας","μαθητής","προφήτης","βαπτιστής"]},
        {russian:"небо", correct_sequence:["οὐρανός"], all_words:["οὐρανός","κόσμος","λίθος","θεός"]},
        {russian:"дитя", correct_sequence:["τέκνον"], all_words:["τέκνον","ἄγγελος","μαθητής","νεανίας"]}
    ],
    case_number: [
        {form:"προφήτῃ", correct:"Dativus (Дат. п.) ед.ч.", distractors:["Nominativus (Им. п.) ед.ч.","Genitivus (Род. п.) ед.ч.","Accusativus (Вин. п.) ед.ч."]},
        {form:"ἀγγέλων", correct:"Genitivus (Род. п.) мн.ч.", distractors:["Dativus (Дат. п.) мн.ч.","Accusativus (Вин. п.) мн.ч.","Nominativus (Им. п.) мн.ч."]},
        {form:"προφῆται", correct:"Nominativus (Им. п.) мн.ч.", distractors:["Genitivus (Род. п.) мн.ч.","Dativus (Дат. п.) мн.ч.","Accusativus (Вин. п.) мн.ч."]},
        {form:"μαθηταῖς", correct:"Dativus (Дат. п.) мн.ч.", distractors:["Nominativus (Им. п.) мн.ч.","Genitivus (Род. п.) мн.ч.","Accusativus (Вин. п.) мн.ч."]}
    ]
},
translation: {
    ru_to_el: [
        { source: "В мире мы имеем смерть, а в Церкви жизнь.", correct: ["ἐν","τῷ","κόσμῳ","ἔχομεν","θάνατον","ἐν","δὲ","τῇ","ἐκκλησίᾳ","ζωήν"] },
        { source: "Хорошая (женщина) посылает девушку и детей к великим пророкам.", correct: ["ἡ","ἀγαθὴ","γυνὴ","πέμπει","τὴν","παρθένον","καὶ","τὰ","τέκνα","πρὸς","τοὺς","μεγάλους","προφήτας"] },
        { source: "Малое дитя бросает камень в красивый дом.", correct: ["τὸ","μικρὸν","παιδίον","βάλλει","τὸν","λίθον","εἰς","τὸν","καλὸν","οἶκον"] },
        { source: "Креститель говорит хорошее слово юношам и ведёт учеников к Господу.", correct: ["ὁ","βαπτιστής","λέγει","τὸν","ἀγαθὸν","λόγον","τοῖς","νεανίαις","καὶ","ἄγει","τοὺς","μαθητὰς","πρὸς","τὸν","κύριον"] },
        { source: "Ученики пребывают в Церкви и говорят притчу другим.", correct: ["οἱ","μαθηταὶ","μένουσιν","ἐν","τῇ","ἐκκλησίᾳ","καὶ","λέγουσι","παραβολὴν","τοῖς","ἄλλοις"] },
        { source: "Через голос пророка Господь учит учеников.", correct: ["διὰ","τῆς","φωνῆς","τοῦ","προφήτου","ὁ","κύριος","διδάσκει","τοὺς","μαθητάς"] },
        { source: "Вследствие (из-за) заповедей Бога ученики пишут братьям хорошие слова.", correct: ["διὰ","τὰς","ἐντολὰς","τοῦ","θεοῦ","οἱ","μαθηταὶ","γράφουσι","τοῖς","ἀδελφοῖς","τοὺς","ἀγαθούς","λόγους"] },
        { source: "Ради (из-за) детей пророк посылает плохих юношей в пустыню.", correct: ["διὰ","τὰ","τέκνα","ὁ","προφήτης","πέμπει","τοὺς","κακοὺς","νεανίας","εἰς","τὴν","ἔρημον"] },
        { source: "После Господа апостол ведёт учеников.", correct: ["μετὰ","τὸν","κύριον","ὁ","ἀπόστολος","ἄγει","τοὺς","μαθητάς"] },
        { source: "Пророки учат юношей с детьми.", correct: ["οἱ","προφῆται","διδάσκουσι","τοὺς","νεανίας","σὺν","τοῖς","τέκνοις"] },
        { source: "Хорошие (женщины) несут детей к Господу, а плохие ведут в мир.", correct: ["αἱ","ἀγαθαὶ","φέρουσι","τὰ","τέκνα","πρὸς","τὸν","κύριον","αἱ","δὲ","κακαὶ","ἄγουσι","εἰς","τὸν","κόσμον"] },
        { source: "Господь с пророком пребывают в другом месте.", correct: ["ὁ","κύριος","μετὰ","τοῦ","προφήτου","μένουσιν","ἐν","ἄλλῳ","τόπῳ"] },
        { source: "Праведники ведут учеников через пустыню к Господу.", correct: ["οἱ","δίκαιοι","ἄγουσι","τοὺς","μαθητὰς","διὰ","τῆς","ἐρήμου","πρὸς","τὸν","κύριον"] },
        { source: "Мы видим жизнь Сына Божиего в этом мире.", correct: ["βλέπομεν","τὴν","ζωὴν","τοῦ","υἱοῦ","τοῦ","θεοῦ","ἐν","τούτῳ","τῷ","κόσμῳ"] },
        { source: "Ты плох, Церковь хороша.", correct: ["σὺ","κακὸς","εἶ","ἡ","δὲ","ἐκκλησία","καλή"] },
        { source: "Через слово Божие Господь воскрешает мёртвых.", correct: ["διὰ","τοῦ","λόγου","τοῦ","θεοῦ","ὁ","κύριος","ἐγείρει","τοὺς","νεκρούς"] }
    ],
    el_to_ru: [
    {source:"οἱ μαθηταὶ τῶν προφητῶν μένουσιν ἐν τῷ κόσμῳ.", correct:"Ученики пророков пребывают в мире."},
    {source:"οἱ κακοὶ βάλλουσι λίθους εἰς τὸν οἶκον τῶν μαθητῶν.", correct:"Злые бросают камни в дом учеников."},
    {source:"ὁ θεὸς πέμπει τοὺς ἀγγέλους εἰς τὸν κόσμον.", correct:"Бог посылает ангелов в мир."},
    {source:"ὁ προφήτης πέμπει τοὺς μαθητὰς τοῦ κυρίου ἐκ τῶν οἴκων εἰς τὴν ἐκκλησίαν.", correct:"Пророк посылает учеников Господа из домов в церковь."},
    {source:"ὁ θεὸς ἐγείρει τοὺς νεκροὺς ἐκ θανάτου.", correct:"Бог воскрешает мёртвых из смерти."},
    {source:"λαμβάνετε τὰ καλὰ δῶρα ἀπὸ τῶν παρθένων.", correct:"Вы берёте хорошие дары от дев."},
    {source:"ἄγομεν τὰ τέκνα ἐκ τῶν οἴκων.", correct:"Мы ведём детей из домов."},
    {source:"μετὰ τοὺς ἀγγέλους πέμπει ὁ θεὸς τὸν υἱόν.", correct:"После ангелов Бог посылает Сына."},
    {source:"μετὰ τῶν ἀγγέλων ἄγει ὁ κύριος τοὺς δικαίους εἰς τὸν οὐρανόν.", correct:"С ангелами Господь ведёт праведных на небо."},
    {source:"διὰ τῶν ὁδῶν τῆς ἐρήμου φέρουσιν οἱ δοῦλοι τὰ δῶρα εἰς ἄλλον τόπον.", correct:"Через дороги пустыни рабы несут дары в другое место."},
    {source:"διὰ τῶν γραφῶν τῶν προφητῶν γινώσκομεν τὸν κύριον.", correct:"Через писания пророков мы знаем Господа."},
    {source:"διὰ τὴν δόξαν τοῦ θεοῦ ἐγείρει ὁ κύριος τοὺς νεκρούς.", correct:"Ради славы Божией Господь воскрешает мёртвых."},
    {source:"φέρουσι τοὺς νεκροὺς εἰς τὴν ἔρημον.", correct:"Они несут мёртвых в пустыню."},
    {source:"οἱ μαθηταὶ διδάσκουσι τὰ ἀγαθὰ τέκνα ἐν τῇ ἐκκλησίᾳ.", correct:"Ученики учат добрых детей в церкви."},
    {source:"ὁ κύριος λέγει παραβολὴν τοῖς μαθηταῖς ἐν τῷ ἱερῷ.", correct:"Господь говорит притчу ученикам в храме."},
    {source:"διὰ τὴν ἀλήθειαν βλέπουσιν οἱ προφῆται τὸν θάνατον.", correct:"Ради истины пророки видят смерть."},
    {source:"ἀπὸ τῆς ἐρήμου ἄγουσιν οἱ βαπτισταὶ τοὺς ἀγαθοὺς νεανίας καὶ τοὺς υἱοὺς τῶν προφητῶν πρὸς τοὺς μικροὺς οἴκους τῶν μαθητῶν.", correct:"Из пустыни крестители ведут добрых юношей и сыновей пророков к малым домам учеников."},
    {source:"διὰ τὴν βασιλείαν τοῦ θεοῦ φέρομεν τὰ κακά.", correct:"Ради Царства Божия мы несём беды."},
    {source:"διὰ τὰς ψυχὰς τῶν ἀδελφῶν βλέπει κακά.", correct:"Из-за душ братьев он видит плохое."},
    {source:"καλὸς ὁ οὐρανός, κακὸς ὁ κόσμος.", correct:"Небо хорошо, мир плох."},
    {source:"οἱ νεανίαι βλέπουσι τὸν βαπτιστὴν ἐν τῇ ἐρήμῳ.", correct:"Юноши видят крестителя в пустыне."}
    ]
    }
},
    8: {
title: "Энклитики и проклитики, местоимения",
grammar: `<b>1. Энклитики и проклитики</b><br>
<b>Энклитики</b> — односложные или двусложные слова, которые теряют ударение и примыкают к предыдущему слову. В греческом языке к энклитикам относятся: μου, μοι, με; σου, σοι, σε; ἐστί(ν), εἰσί(ν); τις, τι; που, ποτε и др.<br><br>
<b>Проклитики</b> — безударные слова, которые образуют единство с последующим словом. К проклитикам относятся: ὁ, ἡ, οἱ, αἱ; εἰς, ἐκ, ἐν; οὐ (οὐκ, οὐχ); ὡς; εἰ.<br><br>
<b>Правила ударения для энклитик:</b><br>
1. Слово перед энклитикой НЕ меняет острое ударение на тупое: ἀδελφός μου (не ἀδελφὸς μου).<br>
2. Если слово имеет острое ударение на третьем от конца слоге или облеченное на предпоследнем, оно получает дополнительное острое ударение на последнем слоге: ἄνθρωπός τις, δῶρόν σου.<br>
3. Если перед энклитикой стоит проклитика или энклитика, она получает острое ударение: ἄνθρωπός μου ἐστίν.<br>
4. Двусложная энклитика сохраняет ударение после слова с острым ударением на втором слоге: λόγος ἐστίν.<br>
5. Энклитика сохраняет ударение, если на ней стоит логическое ударение или с неё начинается предложение.<br><br>

<b>2. Глагол εἰμί (быть) — спряжение в настоящем времени</b><br>
<table>
  <tr><th>Лицо</th><th>Ед.ч.</th><th>Мн.ч.</th><th>Перевод</th></tr>
  <tr><td>1-е</td><td>εἰμί</td><td>ἐσμέν</td><td>я есмь / мы есмы</td></tr>
  <tr><td>2-е</td><td>εἶ</td><td>ἐστέ</td><td>ты еси / вы есте</td></tr>
  <tr><td>3-е</td><td>ἐστί(ν)</td><td>εἰσί(ν)</td><td>он есть / они суть</td></tr>
</table><br>

<b>3. Личные местоимения</b><br>
<b>Единственное число:</b><br>
<table>
  <tr><th>Падеж</th><th>1-е л.</th><th>2-е л.</th><th>3-е л. м.</th><th>3-е л. ж.</th><th>3-е л. ср.</th><th>Перевод</th></tr>
  <tr><td>Nom.</td><td>ἐγώ</td><td>σύ</td><td>αὐτός</td><td>αὐτή</td><td>αὐτό</td><td>я / ты / сам(а)</td></tr>
  <tr><td>Gen.</td><td>μου</td><td>σου</td><td>αὐτοῦ</td><td>αὐτῆς</td><td>αὐτοῦ</td><td>меня / тебя / его</td></tr>
  <tr><td>Dat.</td><td>μοι</td><td>σοι</td><td>αὐτῷ</td><td>αὐτῇ</td><td>αὐτῷ</td><td>мне / тебе / ему</td></tr>
  <tr><td>Acc.</td><td>με</td><td>σε</td><td>αὐτόν</td><td>αὐτήν</td><td>αὐτό</td><td>меня / тебя / его</td></tr>
</table><br>
<b>Множественное число:</b><br>
<table>
  <tr><th>Падеж</th><th>1-е л.</th><th>2-е л.</th><th>3-е л. м.</th><th>3-е л. ж.</th><th>3-е л. ср.</th><th>Перевод</th></tr>
  <tr><td>Nom.</td><td>ἡμεῖς</td><td>ὑμεῖς</td><td>αὐτοί</td><td>αὐταί</td><td>αὐτά</td><td>мы / вы / они</td></tr>
  <tr><td>Gen.</td><td>ἡμῶν</td><td>ὑμῶν</td><td>αὐτῶν</td><td>αὐτῶν</td><td>αὐτῶν</td><td>нас / вас / их</td></tr>
  <tr><td>Dat.</td><td>ἡμῖν</td><td>ὑμῖν</td><td>αὐτοῖς</td><td>αὐταῖς</td><td>αὐτοῖς</td><td>нам / вам / им</td></tr>
  <tr><td>Acc.</td><td>ἡμᾶς</td><td>ὑμᾶς</td><td>αὐτούς</td><td>αὐτάς</td><td>αὐτά</td><td>нас / вас / их</td></tr>
</table><br>

<b>4. Определённый артикль (ὁ, ἡ, τό)</b><br>
<table>
  <tr><th>Падеж</th><th>Муж. р.</th><th>Жен. р.</th><th>Ср. р.</th><th>Перевод</th></tr>
  <tr><td>Nom.</td><td>ὁ</td><td>ἡ</td><td>τό</td><td>муж./жен./ср.</td></tr>
  <tr><td>Gen.</td><td>τοῦ</td><td>τῆς</td><td>τοῦ</td><td>кого? чего?</td></tr>
  <tr><td>Dat.</td><td>τῷ</td><td>τῇ</td><td>τῷ</td><td>кому? чему?</td></tr>
  <tr><td>Acc.</td><td>τόν</td><td>τήν</td><td>τό</td><td>кого? что?</td></tr>
</table><br>
<b>Множественное число:</b><br>
<table>
  <tr><th>Падеж</th><th>Муж. р.</th><th>Жен. р.</th><th>Ср. р.</th><th>Перевод</th></tr>
  <tr><td>Nom.</td><td>οἱ</td><td>αἱ</td><td>τά</td><td>муж./жен./ср.</td></tr>
  <tr><td>Gen.</td><td>τῶν</td><td>τῶν</td><td>τῶν</td><td>кого? чего?</td></tr>
  <tr><td>Dat.</td><td>τοῖς</td><td>ταῖς</td><td>τοῖς</td><td>кому? чему?</td></tr>
  <tr><td>Acc.</td><td>τούς</td><td>τάς</td><td>τά</td><td>кого? что?</td></tr>
</table><br>

<b>5. Три правила употребления местоимений с артиклем</b><br>
<br>
<b>Правило 1: Артикль перед местоимением (атрибутивная позиция)</b><br>
Когда артикль стоит ПЕРЕД местоимением, оно выступает в роли прилагательного (атрибута).<br>
Например: <i>ὁ ἐμός</i> — «мой» (в значении «мой [человек/предмет]»).<br>
Это означает, что местоимение согласуется с артиклем в роде, числе и падеже.<br><br>

<b>Правило 2: Артикль после местоимения (предикативная позиция)</b><br>
Когда артикль стоит ПОСЛЕ местоимения, оно выступает в роли сказуемого (предикатива).<br>
Например: <i>ἐμός ὁ</i> — «это мой» (в значении «мой — тот, который»).<br>
Это встречается реже, обычно с притяжательными местоимениями.<br><br>

<b>Правило 3: Артикль в начале и в конце (субстантивация местоимения)</b><br>
Когда местоимение стоит между двумя артиклями: <i>ὁ ἐμός ὁ</i> — «тот, который мой» или «мой же».<br>
Например: <i>ὁ ἐμός ὁ</i> — «тот, который мой» (с усилением).<br>
Такая конструкция используется для выделения или противопоставления.<br><br>

<b>Примечание:</b> В косвенных падежах местоимение <b>αὐτός</b> употребляется как личное местоимение (он, она, оно), а в именительном падеже — как «сам». С артиклем оно означает «тот же самый» (ὁ αὐτός — тот же самый).`,
  vocabulary: [
  {
    greek: "εἰμί",
    translation: "(я) есмь",
    type: "verb",
    declension_forms: {singular: {"1":"εἰμί","2":"εἶ","3":"ἐστί(ν)"}, plural: {"1":"ἐσμέν","2":"ἐστέ","3":"εἰσί(ν)"}},
    caseTranslations: {
      singular: {
        "1": "я есмь",
        "2": "ты еси",
        "3": "он / она / оно есть"
      },
      plural: {
        "1": "мы есмы",
        "2": "вы есте",
        "3": "они суть"
      }
    }
  },
  {
    greek: "ἐγώ",
    translation: "я",
    type: "pronoun",
    declension_forms: { singular: { nom: "ἐγώ", gen: "μου", dat: "μοι", acc: "με" } },
    caseTranslations: {
      singular: {
        nom: "я",
        gen: "меня",
        dat: "мне",
        acc: "меня"
      }
    }
  },
  {
    greek: "σύ",
    translation: "ты",
    type: "pronoun",
    declension_forms: { singular: { nom: "σύ", gen: "σου", dat: "σοι", acc: "σε" } },
    caseTranslations: {
      singular: {
        nom: "ты",
        gen: "тебя",
        dat: "тебе",
        acc: "тебя"
      }
    }
  },
  {
    greek: "αὐτός, ή, ό",
    translation: "сам (в косв. падежах — он, она, оно)",
    type: "pronoun",
    declension_forms: {
      masculine: {
        singular: { nom: "αὐτός", gen: "αὐτοῦ", dat: "αὐτῷ", acc: "αὐτόν" },
        plural: { nom: "αὐτοί", gen: "αὐτῶν", dat: "αὐτοῖς", acc: "αὐτούς" }
      },
      feminine: {
        singular: { nom: "αὐτή", gen: "αὐτῆς", dat: "αὐτῇ", acc: "αὐτήν" },
        plural: { nom: "αὐταί", gen: "αὐτῶν", dat: "αὐταῖς", acc: "αὐτάς" }
      },
      neuter: {
        singular: { nom: "αὐτό", gen: "αὐτοῦ", dat: "αὐτῷ", acc: "αὐτό" },
        plural: { nom: "αὐτά", gen: "αὐτῶν", dat: "αὐτοῖς", acc: "αὐτά" }
      }
    },
    caseTranslations: {
      singular: {
        nom: "сам / сама / само",
        gen: "его / её",
        dat: "ему / ей",
        acc: "его / её"
      },
      plural: {
        nom: "сами",
        gen: "их",
        dat: "им",
        acc: "их"
      }
    }
  },
  {
    greek: "ἡμεῖς",
    translation: "мы",
    type: "pronoun",
    declension_forms: { plural: { nom: "ἡμεῖς", gen: "ἡμῶν", dat: "ἡμῖν", acc: "ἡμᾶς" } },
    caseTranslations: {
      plural: {
        nom: "мы",
        gen: "нас",
        dat: "нам",
        acc: "нас"
      }
    }
  },
  {
    greek: "ὑμεῖς",
    translation: "вы",
    type: "pronoun",
    declension_forms: { plural: { nom: "ὑμεῖς", gen: "ὑμῶν", dat: "ὑμῖν", acc: "ὑμᾶς" } },
    caseTranslations: {
      plural: {
        nom: "вы",
        gen: "вас",
        dat: "вам",
        acc: "вас"
      }
    }
  },
  {
    greek: "δέ",
    translation: "же, а, но",
    type: "other"
  },
  {
    greek: "δεσπότης",
    article: "ὁ",
    translation: "господин",
    type: "noun",
    declension_forms: {
      singular: { nom: "δεσπότης", gen: "δεσπότου", dat: "δεσπότῃ", acc: "δεσπότην", voc: "δεσπότα" },
      plural: { nom: "δεσπόται", gen: "δεσποτῶν", dat: "δεσπόταις", acc: "δεσπότας", voc: "δεσπόται" }
    }
  },
  {
    greek: "κριτής",
    article: "ὁ",
    translation: "судья",
    type: "noun",
    declension_forms: {
      singular: { nom: "κριτής", gen: "κριτοῦ", dat: "κριτῇ", acc: "κριτήν", voc: "κριτά" },
      plural: { nom: "κριταί", gen: "κριτῶν", dat: "κριταῖς", acc: "κριτάς", voc: "κριταί" }
    }
  },
  {
    greek: "τελώνης",
    article: "ὁ",
    translation: "мытарь, сборщик податей",
    type: "noun",
    declension_forms: {
      singular: { nom: "τελώνης", gen: "τελώνου", dat: "τελώνῃ", acc: "τελώνην", voc: "τελώνᾱ" },
      plural: { nom: "τελῶναι", gen: "τελωνῶν", dat: "τελώναις", acc: "τελώνας", voc: "τελῶναι" }
    }
  }
],
exercises: {
    // ===== СКЛОНЕНИЕ =====
    declension_fill: [
        // εἰμί (глагол — все лица)
        {case:"1sg", word:"εἰμί", translation:"быть", correct:"εἰμί", distractors:["εἶ","ἐστί","ἐσμέν"]},
        {case:"2sg", word:"εἰμί", translation:"быть", correct:"εἶ", distractors:["εἰμί","ἐστί","ἐστέ"]},
        {case:"3sg", word:"εἰμί", translation:"быть", correct:"ἐστί(ν)", distractors:["εἰμί","εἶ","εἰσί"]},
        {case:"1pl", word:"εἰμί", translation:"быть", correct:"ἐσμέν", distractors:["ἐστέ","εἰσί","εἰμί"]},
        {case:"2pl", word:"εἰμί", translation:"быть", correct:"ἐστέ", distractors:["ἐσμέν","εἰσί","εἶ"]},
        {case:"3pl", word:"εἰμί", translation:"быть", correct:"εἰσί(ν)", distractors:["ἐσμέν","ἐστέ","ἐστί"]},
        // δεσπότης (существительное)
        {case:"gen_sg", word:"δεσπότης", translation:"господин", correct:"δεσπότου", distractors:["δεσποτῶν","δεσπότῃ","δεσπότην"]},
        {case:"dat_sg", word:"δεσπότης", translation:"господин", correct:"δεσπότῃ", distractors:["δεσπότου","δεσπόταις","δεσπότην"]},
        {case:"nom_pl", word:"δεσπότης", translation:"господин", correct:"δεσπόται", distractors:["δεσπότας","δεσποτῶν","δεσπόταις"]},
        // κριτής (существительное)
        {case:"gen_sg", word:"κριτής", translation:"судья", correct:"κριτοῦ", distractors:["κριτῶν","κριτῇ","κριτήν"]},
        {case:"dat_sg", word:"κριτής", translation:"судья", correct:"κριτῇ", distractors:["κριτοῦ","κριταῖς","κριτήν"]},
        {case:"nom_pl", word:"κριτής", translation:"судья", correct:"κριταί", distractors:["κριτάς","κριτῶν","κριταῖς"]},
        // τελώνης (существительное)
        {case:"gen_sg", word:"τελώνης", translation:"мытарь", correct:"τελώνου", distractors:["τελωνῶν","τελώνῃ","τελώνην"]},
        {case:"dat_sg", word:"τελώνης", translation:"мытарь", correct:"τελώνῃ", distractors:["τελώνου","τελώναις","τελώνην"]},
        {case:"nom_pl", word:"τελώνης", translation:"мытарь", correct:"τελῶναι", distractors:["τελώνας","τελωνῶν","τελώναις"]}
    ],

    // ===== ПЕРЕВОД С ГРЕЧЕСКОГО НА РУССКИЙ =====
    translate_greek_to_russian: [
        // Личные формы εἰμί
        {greek:"ἐγώ εἰμι", keywords:["я","есмь"]},
        {greek:"σὺ εἶ", keywords:["ты","еси"]},
        {greek:"αὐτός ἐστι", keywords:["он","есть"]},
        {greek:"ἡμεῖς ἐσμέν", keywords:["мы","есмы"]},
        {greek:"ὑμεῖς ἐστέ", keywords:["вы","есте"]},
        // Личные местоимения в косвенных падежах
        {greek:"μου", keywords:["меня"]},
        {greek:"σοι", keywords:["тебе"]},
        {greek:"αὐτόν", keywords:["его"]},
        {greek:"αὐτῇ", keywords:["ей"]},
        {greek:"ἡμᾶς", keywords:["нас"]},
        {greek:"ὑμῖν", keywords:["вам"]},
        // Существительные
        {greek:"ὁ δεσπότης", keywords:["господин"]},
        {greek:"τοῦ κριτοῦ", keywords:["судьи"]},
        {greek:"τῷ τελώνῃ", keywords:["мытарю"]},
        {greek:"τοὺς δεσπότας", keywords:["господ"]}
    ],

    // ===== ПЕРЕВОД С РУССКОГО НА ГРЕЧЕСКИЙ =====
    translate_russian_to_greek: [
        // εἰμί
        {russian:"я есмь", correct_sequence:["ἐγώ","εἰμι"], all_words:["ἐγώ","εἰμι","σύ","εἶ"]},
        {russian:"ты еси", correct_sequence:["σύ","εἶ"], all_words:["σύ","εἶ","ἐγώ","εἰμι"]},
        // Местоимения + предлоги
        {russian:"меня", correct_sequence:["μου"], all_words:["μου","σου","με"]},
        {russian:"тебе", correct_sequence:["σοι"], all_words:["σοι","μοι","σε"]},
        {russian:"его (Acc.)", correct_sequence:["αὐτόν"], all_words:["αὐτόν","αὐτό","αὐτοῦ"]},
        {russian:"их (Gen.)", correct_sequence:["αὐτῶν"], all_words:["αὐτῶν","αὐτοῖς","αὐτούς"]},
        // Существительные с артиклем
        {russian:"господин", correct_sequence:["ὁ","δεσπότης"], all_words:["ὁ","δεσπότης","κριτής","τελώνης"]},
        {russian:"судья", correct_sequence:["ὁ","κριτής"], all_words:["ὁ","κριτής","δεσπότης","τελώνης"]},
        {russian:"мытарь", correct_sequence:["ὁ","τελώνης"], all_words:["ὁ","τελώνης","δεσπότης","κριτής"]},
        {russian:"господина (Gen.)", correct_sequence:["τοῦ","δεσπότου"], all_words:["τοῦ","δεσπότου","κριτοῦ","τελώνου"]},
        {russian:"судье (Dat.)", correct_sequence:["τῷ","κριτῇ"], all_words:["τῷ","κριτῇ","τῷ","δεσπότῃ","τῷ","τελώνῃ"]}
    ],

    // ===== ОПРЕДЕЛЕНИЕ ПАДЕЖА И ЧИСЛА =====
    case_number: [
        // εἰμί
        {form:"λύεις", correct:"2-е л. ед.ч.", distractors:["1-е л. ед.ч.","3-е л. ед.ч.","2-е л. мн.ч."]},
        {form:"λύομεν", correct:"1-е л. мн.ч.", distractors:["1-е л. ед.ч.","2-е л. мн.ч.","3-е л. мн.ч."]},
        // δεσπότης
        {form:"δεσπότην", correct:"Accusativus (Вин. п.) ед.ч.", distractors:["Nominativus (Им. п.) ед.ч.","Genitivus (Род. п.) ед.ч.","Dativus (Дат. п.) ед.ч."]},
        {form:"δεσπόται", correct:"Nominativus (Им. п.) мн.ч.", distractors:["Accusativus (Вин. п.) мн.ч.","Genitivus (Род. п.) мн.ч.","Dativus (Дат. п.) мн.ч."]},
        // κριτής
        {form:"κριτοῦ", correct:"Genitivus (Род. п.) ед.ч.", distractors:["Accusativus (Вин. п.) ед.ч.","Dativus (Дат. п.) ед.ч.","Nominativus (Им. п.) ед.ч."]},
        {form:"κριταί", correct:"Nominativus (Им. п.) мн.ч.", distractors:["Accusativus (Вин. п.) мн.ч.","Genitivus (Род. п.) мн.ч.","Dativus (Дат. п.) мн.ч."]},
        // τελώνης
        {form:"τελώνην", correct:"Accusativus (Вин. п.) ед.ч.", distractors:["Nominativus (Им. п.) ед.ч.","Genitivus (Род. п.) ед.ч.","Dativus (Дат. п.) ед.ч."]},
        {form:"τελῶναι", correct:"Nominativus (Им. п.) мн.ч.", distractors:["Accusativus (Вин. п.) мн.ч.","Genitivus (Род. п.) мн.ч.","Dativus (Дат. п.) мн.ч."]}
    ]
},
translation: {
    ru_to_el: [
        { source: "Твои ученики — в доме Господа.", correct: ["οἱ","μαθηταί","σου","εἰσιν","ἐν","τῷ","οἴκῳ","τοῦ","κυρίου"] },
        { source: "Мои братья — в пустыне.", correct: ["οἱ","ἀδελφοί","μου","εἰσιν","ἐν","τῇ","ἐρήμῳ"] },
        { source: "Пророк знает мытарей и ведёт их к судье.", correct: ["ὁ","προφήτης","γινώσκει","τοὺς","τελώνας","καὶ","ἄγει","αὐτοὺς","πρὸς","τὸν","κριτήν"] },
        { source: "Через его слово вы имеете славу.", correct: ["διὰ","τοῦ","λόγου","αὐτοῦ","ἔχετε","δόξαν"] },
        { source: "Из-за ваших детей вы знаете плохие дни.", correct: ["διὰ","τὰ","τέκνα","ὑμῶν","γινώσκετε","τὰς","κακὰς","ἡμέρας"] },
        { source: "В наши дни мир зол.", correct: ["ἐν","ταῖς","ἡμέραις","ἡμῶν","ὁ","κόσμος","πονηρός","ἐστιν"] },
        { source: "Бог знает наши души и освобождает их от смерти.", correct: ["ὁ","θεὸς","γινώσκει","τὰς","ψυχὰς","ἡμῶν","καὶ","λύει","αὐτὰς","ἀπὸ","τοῦ","θανάτου"] },
        { source: "Ты — мой сын и мой ученик.", correct: ["σὺ","εἶ","ὁ","υἱός","μου","καὶ","ὁ","μαθητής","μου"] },
        { source: "Мы — в Царстве Божием с твоими верными учениками.", correct: ["ἡμεῖς","ἐσμεν","ἐν","τῇ","βασιλεία","τοῦ","θεοῦ","μετὰ","τῶν","πιστῶν","μαθητῶν","σου"] },
        { source: "Мы говорим тебе притчу, ты же говоришь нам другое слово.", correct: ["ἡμεῖς","λέγομέν","σοι","παραβολήν","σὺ","δὲ","λέγεις","ἡμῖν","ἄλλον","λόγον"] },
        { source: "Путь плох, мы же ведём детей к Господу.", correct: ["ἡ","ὁδὸς","κακή","ἐστιν","ἡμεῖς","δὲ","ἄγομεν","τὰ","τέκνα","πρὸς","τὸν","κύριον"] },
        { source: "Мой Господь несёт для вас дары, вы же пишете Ему плохое слово.", correct: ["ὁ","κύριός","μου","φέρει","ὑμῖν","δῶρα","ὑμεῖς","δὲ","γράφετε","αὐτῷ","κακὸν","λόγον"] },
        { source: "Мои дома плохи, и ваши ученики уводят детей из него.", correct: ["οἱ","οἶκοι","μου","κακοί","εἰσιν","καὶ","οἱ","μαθηταί","σου","ἄγουσι","τὰ","τέκνα","ἐξ","αὐτοῦ"] },
        { source: "Твои ученики ведут своих братьев ко мне.", correct: ["οἱ","μαθηταί","σου","ἄγουσι","τοὺς","ἀδελφοὺς","αὐτῶν","πρός","με"] },
        { source: "Я вижу и знаю моих сыновей и веду их к Господу.", correct: ["ἐγὼ","βλέπω","καὶ","γινώσκω","τοὺς","υἱούς","μου","καὶ","ἄγω","αὐτοὺς","πρὸς","τὸν","κύριον"] },
        { source: "Бог знает Свою Церковь и ведёт её из смерти в Своё Царство.", correct: ["ὁ","θεὸς","γινώσκει","τὴν","ἐκκλησίαν","αὐτοῦ","καὶ","ἄγει","αὐτὴν","ἐκ","τοῦ","θανάτου","εἰς","τὴν","βασιλείαν","αὐτοῦ"] },
        { source: "Твои заповеди хороши и праведны и ведут нас в жизнь.", correct: ["αἱ","ἐντολαί","σου","ἀγαθαί","εἰσιν","καὶ","δίκαιαι","καὶ","ἄγουσιν","ἡμᾶς","εἰς","ζωήν"] },
        { source: "Наш Господь посылает Своих апостолов к тебе.", correct: ["ὁ","κύριός","ἡμῶν","πέμπει","τοὺς","ἀποστόλους","αὐτοῦ","πρός","σε"] },
        { source: "Мы посылаем наших слуг в ваши дома, вы же берёте от нас наши дары.", correct: ["ἡμεῖς","πέμπομεν","τοὺς","δούλους","ἡμῶν","εἰς","τοὺς","οἴκους","ὑμῶν","ὑμεῖς","δὲ","λαμβάνετε","παρ'","ἡμῶν","τὰ","δῶρα","ἡμῶν"] },
        { source: "Вы — хорошие, а ваши ученики — плохие.", correct: ["ὑμεῖς","ἀγαθοί","ἐστε","οἱ","δὲ","μαθηταί","ὑμῶν","κακοί"] }
    ],
    el_to_ru: [
    {source:"οἱ μαθηταί σου γινώσκουσι τὴν βασιλείαν καὶ ἄγουσι τοὺς ἀδελφοὺς αὐτῶν εἰς αὐτήν.", correct:"Твои ученики знают царство и ведут своих братьев в него."},
    {source:"διδάσκω τοὺς κριτάς μου καὶ λέγω αὐτοῖς παραβολήν.", correct:"Я учу моих судей и говорю им притчу."},
    {source:"ἄγει με ὁ κύριος πρὸς τοὺς μαθητὰς αὐτοῦ.", correct:"Господь ведёт меня к своим ученикам."},
    {source:"δι' ἐμὲ βλέπεις σὺ τὸν θάνατον, σοὶ δὲ ἐγὼ λέγω λόγους κακούς.", correct:"Из-за меня ты видишь смерть, а тебе я говорю злые слова."},
    {source:"διὰ σοῦ ἄγει ὁ θεὸς τοὺς πιστοὺς εἰς τὴν βασιλείαν αὐτοῦ καὶ δι' αὐτῶν τοὺς ἄλλους.", correct:"Через тебя Бог ведёт верных в своё царство, а через них — других."},
    {source:"δι' ἡμᾶς μένει ὁ κύριος ἐν τῷ κόσμῳ.", correct:"Ради нас Господь пребывает в мире."},
    {source:"ἐγώ εἰμι δοῦλος, σὺ δὲ δεσπότης.", correct:"Я раб, а ты господин."},
    {source:"ἀγαθός ἐστιν ὁ κύριος καὶ ἀγαθοί ἐστε ὑμεῖς.", correct:"Господь добр, и вы добры."},
    {source:"μαθηταί ἐστε τοῦ κυρίου καὶ ἀδελφοὶ τῶν ἀποστόλων αὐτοῦ.", correct:"Вы ученики Господа и братья Его апостолов."},
    {source:"ὁ δεσπότης πιστός ἐστιν, οἱ δὲ δοῦλοι αὐτοῦ κακοί.", correct:"Господин верен, а его рабы злы."},
    {source:"ἡ ἐκκλησία πιστή ἐστιν, ἡμεῖς δὲ βλέπομεν αὐτήν.", correct:"Церковь верна, а мы видим её."},
    {source:"βλέπομέν σε καὶ λέγομέν σοι παραβολήν.", correct:"Мы видим тебя и говорим тебе притчу."},
    {source:"δοῦλοί ἐσμεν, δούλους δὲ διδάσκομεν.", correct:"Мы рабы, а рабов мы учим."},
    {source:"οἱ δοῦλοι ἡμῶν βλέπουσιν ἡμᾶς, ἡμεῖς δὲ διδάσκομεν αὐτούς.", correct:"Наши рабы видят нас, а мы учим их."},
    {source:"ἀφ' ὑμῶν λαμβάνει ὁ ἀδελφός μου δῶρα καλά, καὶ πέμπει αὐτὰ πρός με διὰ τῶν δούλων αὐτοῦ.", correct:"От вас мой брат получает хорошие дары и посылает их ко мне через своих рабов."},
    {source:"γινώσκομεν τὴν ὁδόν, καὶ δι' αὐτῆς ἄγομέν σε εἰς τὸν οἶκον ἡμῶν.", correct:"Мы знаем дорогу и через неё ведём тебя в наш дом."},
    {source:"μετὰ τῶν ἀδελφῶν ἡμῶν βλέπομεν τοὺς μαθητὰς τοῦ κυρίου ἡμῶν.", correct:"С нашими братьями мы видим учеников нашего Господа."},
    {source:"μετὰ τὰς ἡμέρας τὰς κακὰς βλέπομεν τὴν βασιλείαν τοῦ κυρίου ἡμῶν.", correct:"После злых дней мы видим царство нашего Господа."},
    {source:"μεθ' ὑμῶν λέγομεν τελώναις παραβολήν.", correct:"С вами мы говорим мытарям притчу."}
    ]
    }
},
    9: {
        title: "Указательные местоимения, αὐτός",
grammar: `<b>1. Указательные местоимения οὗτος, αὕτη, τοῦτο (этот, эта, это)</b><br>
Указывает на <b>близкий</b> предмет (в пространстве или в речи).<br>
<table>
  <tr><th>Падеж</th><th>Муж.</th><th>Жен.</th><th>Ср.</th></tr>
  <tr><td>Nom.</td><td>οὗτος</td><td>αὕτη</td><td>τοῦτο</td></tr>
  <tr><td>Gen.</td><td>τούτου</td><td>ταύτης</td><td>τούτου</td></tr>
  <tr><td>Dat.</td><td>τούτῳ</td><td>ταύτῃ</td><td>τούτῳ</td></tr>
  <tr><td>Acc.</td><td>τοῦτον</td><td>ταύτην</td><td>τοῦτο</td></tr>
</table><br>
<b>Множественное число:</b><br>
<table>
  <tr><th>Падеж</th><th>Муж.</th><th>Жен.</th><th>Ср.</th></tr>
  <tr><td>Nom.</td><td>οὗτοι</td><td>αὗται</td><td>ταῦτα</td></tr>
  <tr><td>Gen.</td><td>τούτων</td><td>τούτων</td><td>τούτων</td></tr>
  <tr><td>Dat.</td><td>τούτοις</td><td>ταύταις</td><td>τούτοις</td></tr>
  <tr><td>Acc.</td><td>τούτους</td><td>ταύτας</td><td>ταῦτα</td></tr>
</table>
<i>Пример:</i> οὗτος ὁ ἄνθρωπος — «этот человек»<br><br>

<b>2. Указательные местоимения ἐκεῖνος, ἐκείνη, ἐκεῖνο (тот, та, то)</b><br>
Указывает на <b>далёкий</b> предмет (в пространстве или в речи).<br>
Склоняются как <b>αὐτός</b> (по 1-2 склонению).<br>
<table>
  <tr><th>Падеж</th><th>Муж.</th><th>Жен.</th><th>Ср.</th></tr>
  <tr><td>Nom.</td><td>ἐκεῖνος</td><td>ἐκείνη</td><td>ἐκεῖνο</td></tr>
  <tr><td>Gen.</td><td>ἐκείνου</td><td>ἐκείνης</td><td>ἐκείνου</td></tr>
  <tr><td>Dat.</td><td>ἐκείνῳ</td><td>ἐκείνῃ</td><td>ἐκείνῳ</td></tr>
  <tr><td>Acc.</td><td>ἐκεῖνον</td><td>ἐκείνην</td><td>ἐκεῖνο</td></tr>
</table><br>
<b>Множественное число ἐκεῖνος:</b><br>
<table>
  <tr><th>Падеж</th><th>Муж.</th><th>Жен.</th><th>Ср.</th></tr>
  <tr><td>Nom.</td><td>ἐκεῖνοι</td><td>ἐκεῖναι</td><td>ἐκεῖνα</td></tr>
  <tr><td>Gen.</td><td>ἐκείνων</td><td>ἐκείνων</td><td>ἐκείνων</td></tr>
  <tr><td>Dat.</td><td>ἐκείνοις</td><td>ἐκείναις</td><td>ἐκείνοις</td></tr>
  <tr><td>Acc.</td><td>ἐκείνους</td><td>ἐκείνας</td><td>ἐκεῖνα</td></tr>
</table>
<i>Пример:</i> ἐκεῖνος ὁ ἄνθρωπος — «тот человек»<br><br>

<b>3. Употребление αὐτός</b><br>
В зависимости от положения и падежа меняет значение:<br>
<table>
  <tr><th>Форма</th><th>Значение</th><th>Пример</th></tr>
  <tr><td>αὐτός (Nom.)</td><td><b>сам</b></td><td>αὐτὸς ὁ ἀπόστολος — «сам апостол»</td></tr>
  <tr><td>ὁ αὐτός (с артиклем)</td><td><b>тот же самый</b></td><td>ὁ αὐτὸς ἀπόστολος — «тот же самый апостол»</td></tr>
  <tr><td>αὐτός (в косв. падежах)</td><td><b>он, она, оно</b> (личное мест.)</td><td>λέγω αὐτῷ — «я говорю ему»</td></tr>
</table><br>
<i>Важно:</i> в именительном падеже — «сам»; с артиклем — «тот же»; в косвенных — «он/она/оно».<br><br>

<b>4. Особенности употребления указательных местоимений</b><br>
• Могут стоять как <b>перед</b>, так и <b>после</b> существительного:<br>
  <i>οὗτος ὁ ἀπόστολος</i> = <i>ὁ ἀπόστολος οὗτος</i> — «этот апостол»<br>
• При субстантивации используются формы среднего рода:<br>
  <i>ταῦτα</i> — «это» (вещи/дела)<br>
  <i>ἐκεῖνα</i> — «то» (вещи/дела)<br>
• Указательные местоимения часто используются для связи предложений в тексте.`,
        vocabulary: [
            {greek:"οὗτος, αὕτη, τοῦτο", translation:"этот, эта, это", type:"pronoun", declension_forms:{masculine:{singular:{nom:"οὗτος",gen:"τούτου",dat:"τούτῳ",acc:"τοῦτον"},plural:{nom:"οὗτοι",gen:"τούτων",dat:"τούτοις",acc:"τούτους"}},feminine:{singular:{nom:"αὕτη",gen:"ταύτης",dat:"ταύτῃ",acc:"ταύτην"},plural:{nom:"αὗται",gen:"ταύτων",dat:"ταύταις",acc:"ταύτας"}},neuter:{singular:{nom:"τοῦτο",gen:"τούτου",dat:"τούτῳ",acc:"τοῦτο"},plural:{nom:"ταῦτα",gen:"τούτων",dat:"τούτοις",acc:"ταῦτα"}}}},
            {greek:"ἐκεῖνος, ἐκείνη, ἐκεῖνο", translation:"тот, та, то", type:"pronoun", declension_forms:{masculine:{singular:{nom:"ἐκεῖνος",gen:"ἐκείνου",dat:"ἐκείνῳ",acc:"ἐκεῖνον"},plural:{nom:"ἐκεῖνοι",gen:"ἐκείνων",dat:"ἐκείνοις",acc:"ἐκείνους"}},feminine:{singular:{nom:"ἐκείνη",gen:"ἐκείνης",dat:"ἐκείνῃ",acc:"ἐκείνην"},plural:{nom:"ἐκεῖναι",gen:"ἐκείνων",dat:"ἐκείναις",acc:"ἐκείνας"}},neuter:{singular:{nom:"ἐκεῖνο",gen:"ἐκείνου",dat:"ἐκείνῳ",acc:"ἐκεῖνο"},plural:{nom:"ἐκεῖνα",gen:"ἐκείνων",dat:"ἐκείνοις",acc:"ἐκεῖνα"}}}}
        ],
        exercises: {
    declension_fill: [
        {case:"gen_sg_m", word:"οὗτος", translation:"этот", correct:"τούτου", distractors:["ταύτης","τούτῳ","τοῦτον"]},
        {case:"dat_sg_f", word:"αὕτη", translation:"эта", correct:"ταύτῃ", distractors:["ταύτης","τούτῳ","ταύτην"]},
        {case:"acc_sg_n", word:"τοῦτο", translation:"это", correct:"τοῦτο", distractors:["τούτου","τούτῳ","τοῦτον"]},
        {case:"gen_sg_m", word:"ἐκεῖνος", translation:"тот", correct:"ἐκείνου", distractors:["ἐκείνῳ","ἐκεῖνον","ἐκείνη"]},
        {case:"dat_sg_f", word:"ἐκείνη", translation:"та", correct:"ἐκείνῃ", distractors:["ἐκείνης","ἐκείνην","ἐκεῖνο"]},
        {case:"acc_sg_n", word:"ἐκεῖνο", translation:"то", correct:"ἐκεῖνο", distractors:["ἐκείνου","ἐκείνῳ","ἐκεῖνον"]},
        {case:"nom_pl_m", word:"οὗτος", translation:"этот", correct:"οὗτοι", distractors:["τούτους","τούτων","τούτοις"]},
        {case:"nom_pl_m", word:"ἐκεῖνος", translation:"тот", correct:"ἐκεῖνοι", distractors:["ἐκείνους","ἐκείνων","ἐκείνοις"]}
    ],
    translate_greek_to_russian: [
        {greek:"οὗτος ὁ λόγος", keywords:["этот","слово"]},
        {greek:"αὕτη ἡ ἀλήθεια", keywords:["эта","истина"]},
        {greek:"ἐκεῖνο τὸ δῶρον", keywords:["тот","дар"]},
        {greek:"ἐκεῖνος", keywords:["тот"]},
        {greek:"ἐκείνη", keywords:["та"]},
        {greek:"ἐκεῖνο", keywords:["то"]},
        {greek:"οὗτοι", keywords:["эти"]},
        {greek:"ἐκεῖνοι", keywords:["те"]}
    ],
    translate_russian_to_greek: [
        {russian:"этот человек", correct_sequence:["οὗτος","ἄνθρωπος"], all_words:["οὗτος","ἄνθρωπος","αὕτη","γυνή"]},
        {russian:"эта", correct_sequence:["αὕτη"], all_words:["αὕτη","οὗτος","τοῦτο","ἐκείνη"]},
        {russian:"это", correct_sequence:["τοῦτο"], all_words:["τοῦτο","οὗτος","αὕτη","ἐκεῖνο"]},
        {russian:"тот", correct_sequence:["ἐκεῖνος"], all_words:["ἐκεῖνος","οὗτος","αὕτη","τοῦτο"]},
        {russian:"те", correct_sequence:["ἐκεῖνοι"], all_words:["ἐκεῖνοι","οὗτοι","αὗται","ταῦτα"]}
    ],
    case_number: [
        {form:"ταύταις", correct:"Dativus (Дат. п.) мн.ч. жен.р.", distractors:["Nominativus (Им. п.) мн.ч.","Genitivus (Род. п.) мн.ч.","Accusativus (Вин. п.) мн.ч."]},
        {form:"ἐκείνων", correct:"Genitivus (Род. п.) мн.ч.", distractors:["Nominativus (Им. п.) мн.ч.","Dativus (Дат. п.) мн.ч.","Accusativus (Вин. п.) мн.ч."]}
    ]
},
translation: {
    ru_to_el: [
        { source: "Эти пророки знают самого Господа.", correct: ["οὗτοι","οἱ","προφῆται","γινώσκουσι","αὐτὸν","τὸν","κύριον"] },
        { source: "Те же самые ученики знают Его и видят Его лицо.", correct: ["οἱ","αὐτοὶ","μαθηταὶ","γινώσκουσι","αὐτόν","καὶ","βλέπουσι","τὸ","πρόσωπον","αὐτοῦ"] },
        { source: "Те Церкви судят этих учителей и ведут их от греха в радость.", correct: ["ἐκεῖναι","αἱ","ἐκκλησίαι","κρίνουσι","τούτους","τοὺς","διδασκάλους","καὶ","ἄγουσιν","αὐτοὺς","ἀπὸ","τῆς","ἁμαρτίας","εἰς","τὴν","χαράν"] },
        { source: "Мы сами имеем этот грех в нашем сердце.", correct: ["ἡμεῖς","αὐτοὶ","ἔχομεν","ταύτην","τὴν","ἁμαρτίαν","ἐν","τῇ","καρδίᾳ","ἡμῶν"] },
        { source: "Благодаря (из-за) любви нашего Господа эти юноши и девы имеют радость в своих сердцах.", correct: ["διὰ","τὴν","ἀγάπην","τοῦ","κυρίου","ἡμῶν","οὗτοι","οἱ","νεανίαι","καὶ","αὗται","αἱ","παρθένοι","ἔχουσι","χαράν","ἐν","ταῖς","καρδίαις","αὐτῶν"] },
        { source: "Это — верные ученики пророка.", correct: ["οὗτοί","εἰσιν","οἱ","πιστοὶ","μαθηταὶ","τοῦ","προφήτου"] },
        { source: "Апостол сам крестит своих братьев и ведёт их к тебе.", correct: ["ὁ","ἀπόστολος","αὐτὸς","βαπτίζει","τοὺς","ἀδελφοὺς","αὐτοῦ","καὶ","ἄγει","αὐτοὺς","πρός","σε"] },
        { source: "Через это Евангелие мы имеем жизнь в небесах.", correct: ["διὰ","τοῦτο","τὸ","εὐαγγέλιον","ἔχομεν","ζωὴν","ἐν","τοῖς","οὐρανοῖς"] },
        { source: "Из-за этих учителей мы видим смерть в Церкви.", correct: ["διὰ","τούτους","τοὺς","διδασκάλους","βλέπομεν","θάνατον","ἐν","τῇ","ἐκκλησίᾳ"] },
        { source: "Он сам знает нас и от Него мы получаем это обещание и ту же самую радость.", correct: ["αὐτὸς","γινώσκει","ἡμᾶς","καὶ","παρ'","αὐτοῦ","λαμβάνομεν","ταύτην","τὴν","ἐπαγγελίαν","καὶ","τὴν","αὐτὴν","χαράν"] },
        { source: "Из-за этого же Евангелия мы сами посылаем этих мытарей к вам.", correct: ["διὰ","τοῦτο","τὸ","εὐαγγέλιον","ἡμεῖς","αὐτοὶ","πέμπομεν","τούτους","τοὺς","τελώνας","πρὸς","ὑμᾶς"] },
        { source: "Он посылает самого Господа в этот мир.", correct: ["αὐτὸς","πέμπει","αὐτὸν","τὸν","κύριον","εἰς","τοῦτον","τὸν","κόσμον"] },
        { source: "Я сам вижу этого справедливого судью, и братья его видят.", correct: ["ἐγὼ","αὐτὸς","βλέπω","τοῦτον","τὸν","δίκαιον","κριτήν","καὶ","οἱ","ἀδελφοί","αὐτοῦ","βλέπουσιν"] },
        { source: "Сейчас мы крестим тех учеников нашего Господа и посылаем их же в пустыню.", correct: ["νῦν","ἡμεῖς","βαπτίζομεν","ἐκείνους","τοὺς","μαθητὰς","τοῦ","κυρίου","ἡμῶν","καὶ","πέμπομεν","αὐτοὺς","εἰς","τὴν","ἔρημον"] },
        { source: "Мои ученики знают мой голос и приносят этих детей ко мне.", correct: ["οἱ","μαθηταί","μου","γινώσκουσι","τὴν","φωνήν","μου","καὶ","φέρουσι","ταῦτα","τὰ","παιδία","πρός","με"] },
        { source: "Мы — ученики Господа, а вы — ученики злого (господина).", correct: ["ἡμεῖς","ἐσμεν","μαθηταὶ","τοῦ","κυρίου","ὑμεῖς","δὲ","μαθηταί","ἐστε","τοῦ","πονηροῦ"] },
        { source: "Эта любовь ведёт наших детей в жизнь.", correct: ["αὕτη","ἡ","ἀγάπη","ἄγει","τὰ","τέκνα","ἡμῶν","εἰς","ζωήν"] },
        { source: "Любовь этих Церквей ведёт и других людей в радость.", correct: ["ἡ","ἀγάπη","τούτων","τῶν","ἐκκλησιῶν","ἄγει","καὶ","τοὺς","ἄλλους","ἀνθρώπους","εἰς","χαράν"] },
        { source: "Учителя этого мира имеют грех в своих сердцах и так учат людей.", correct: ["οἱ","διδάσκαλοι","τούτου","τοῦ","κόσμου","ἔχουσι","ἁμαρτίαν","ἐν","ταῖς","καρδίαις","αὐτῶν","καὶ","οὕτως","διδάσκουσι","τοὺς","ἀνθρώπους"] },
        { source: "Я знаю грех этих мытарей и посылаю их к самому Господу.", correct: ["ἐγώ","γινώσκω","τὴν","ἁμαρτίαν","τούτων","τῶν","τελωνῶν","καὶ","πέμπω","αὐτοὺς","πρὸς","αὐτὸν","τὸν","κύριον"] }
    ],
    el_to_ru: [
    {source:"οὗτοι οἱ διδάσκαλοι κρίνουσιν αὐτὸν τὸν κριτήν.", correct:"Эти учителя судят самого судью."},
    {source:"ὁ δὲ αὐτὸς νεανίας ἔχει τὴν αὐτὴν χαρὰν ἐν τῇ καρδίᾳ αὐτοῦ.", correct:"А тот же самый юноша имеет ту же радость в своём сердце."},
    {source:"νῦν λαμβάνω αὐτὸς τὸ αὐτὸ εὐαγγέλιον ἀπὸ τοῦ κυρίου μου.", correct:"Теперь я сам получаю то же Евангелие от моего Господа."},
    {source:"οὗτος βλέπει ἐκεῖνον καὶ κρίνει αὐτόν.", correct:"Этот видит того и судит его."},
    {source:"μετὰ ταῦτα ἔχετε αὐτοὶ τὴν ἀγάπην τοῦ κυρίου ἐν ταῖς καρδίαις ὑμῶν.", correct:"После этого вы сами имеете любовь Господа в своих сердцах."},
    {source:"οὗτοι ἔχουσι χαράν, ἐκεῖνοι δὲ ἔχουσιν ἁμαρτίαν.", correct:"Эти имеют радость, а те имеют грех."},
    {source:"αὕτη δέ ἐστιν ἡ φωνὴ τοῦ δεσπότου αὐτοῦ.", correct:"А это голос его господина."},
    {source:"οὕτως γινώσκομεν τοῦτον καὶ βλέπομεν τὸ πρόσωπον αὐτοῦ.", correct:"Так мы знаем этого и видим его лицо."},
    {source:"λαμβάνομεν ταῦτα τὰ δῶρα ἀπὸ τοῦ αὐτοῦ καὶ βλέπομεν αὐτόν.", correct:"Мы получаем эти дары от того же самого и видим его."},
    {source:"αὐτὸς βαπτίζεις ἐκεῖνον καὶ εἶ ἀδελφὸς αὐτοῦ.", correct:"Ты сам крестишь того и являешься его братом."},
    {source:"εἰς τὴν αὐτὴν ἐκκλησίαν ἄγομεν τούτους τοὺς διδασκάλους ἡμῶν τοὺς ἀγαθούς.", correct:"В ту же церковь мы ведём этих наших добрых учителей."},
    {source:"αὐτὸς ἐγὼ ἔχω ταύτην τὴν ἐπαγγελίαν τοῦ κυρίου μου.", correct:"Я сам имею это обещание моего Господа."},
    {source:"αὕτη ἡ παρθένος βλέπει τὸ πρόσωπον τοῦ κυρίου αὐτῆς.", correct:"Эта дева видит лицо своего Господа."},
    {source:"αὕτη γινώσκει αὐτὴν τὴν ἀλήθειαν.", correct:"Эта знает эту же истину."},
    {source:"ἀγαθή ἐστιν ἡ ἐπαγγελία σου, ἀγαθὴ εἶ αὕτη.", correct:"Хорошо твоё обещание, хороша эта."},
    {source:"ἐκεῖνοί εἰσιν μαθηταὶ τοῦ αὐτοῦ διδασκάλου.", correct:"Те — ученики того же учителя."},
    {source:"οὗτός ἐστιν διδάσκαλος ἐκείνου, ἐκεῖνος δὲ τούτου.", correct:"Этот — учитель того, а тот — этого."},
    {source:"οὗτος ὁ βαπτιστὴς διδάσκει τοὺς ἀγαθοὺς καὶ αὐτός ἐστιν ἀγαθός.", correct:"Этот креститель учит добрых, и сам он добр."},
    {source:"μετὰ τὰς ἡμέρας ἐκείνας διδάσκαλοί ἐσμεν τούτων τῶν δούλων.", correct:"После тех дней мы — учителя этих рабов."},
    {source:"μετὰ τῶν πιστῶν προφητῶν ἔχομεν ἐπαγγελίας ἀγαθάς, οἱ δὲ πονηροὶ τελῶναι βλέπουσιν ἡμέρας κακάς.", correct:"С верными пророками мы имеем добрые обещания, а злые мытари видят плохие дни."}
    ]
    }
},
    10: {
        title: "Медио-пассивный залог",
        grammar: `<b>Спряжение λύομαι (я развязываюсь / меня развязывают):</b><br>
        <table><tr><th>Лицо</th><th>Ед.ч.</th><th>Мн.ч.</th></tr>
        <tr><td>1-е</td><td>λύομαι</td><td>λυόμεθα</td></tr>
        <tr><td>2-е</td><td>λύῃ</td><td>λύεσθε</td></tr>
        <tr><td>3-е</td><td>λύεται</td><td>λύονται</td></tr></table><br>
        <b>Отложительные глаголы:</b> имеют медио-пассивные формы с активным значением (ἔρχομαι — прихожу).`,
        vocabulary: [
            {greek:"ἀπέρχομαι (dep.)", translation:"отхожу, ухожу", type:"verb", declension_forms:{singular:{"1":"ἀπέρχομαι","2":"ἀπέρχῃ","3":"ἀπέρχεται"},plural:{"1":"ἀπερχόμεθα","2":"ἀπέρχεσθε","3":"ἀπέρχονται"}}},
            {greek:"ἀποκρίνομαι (dep.)", translation:"отвечаю", type:"verb", declension_forms:{singular:{"1":"ἀποκρίνομαι","2":"ἀποκρίνῃ","3":"ἀποκρίνεται"},plural:{"1":"ἀποκρινόμεθα","2":"ἀποκρίνεσθε","3":"ἀποκρίνονται"}}},
            {greek:"γίνομαι (dep.) + Nom.", translation:"становлюсь, делаюсь", type:"verb", declension_forms:{singular:{"1":"γίνομαι","2":"γίνῃ","3":"γίνεται"},plural:{"1":"γινόμεθα","2":"γίνεσθε","3":"γίνονται"}}},
            {greek:"εἰσέρχομαι (dep.)", translation:"вхожу", type:"verb", declension_forms:{singular:{"1":"εἰσέρχομαι","2":"εἰσέρχῃ","3":"εἰσέρχεται"},plural:{"1":"εἰσερχόμεθα","2":"εἰσέρχεσθε","3":"εἰσέρχονται"}}},
            {greek:"ἐξέρχομαι (dep.)", translation:"выхожу", type:"verb", declension_forms:{singular:{"1":"ἐξέρχομαι","2":"ἐξέρχῃ","3":"ἐξέρχεται"},plural:{"1":"ἐξερχόμεθα","2":"ἐξέρχεσθε","3":"ἐξέρχονται"}}},
            {greek:"ἔρχομαι (dep.)", translation:"прихожу", type:"verb", declension_forms:{singular:{"1":"ἔρχομαι","2":"ἔρχῃ","3":"ἔρχεται"},plural:{"1":"ἐρχόμεθα","2":"ἔρχεσθε","3":"ἔρχονται"}}},
            {greek:"πορεύομαι (dep.)", translation:"иду", type:"verb", declension_forms:{singular:{"1":"πορεύομαι","2":"πορεύῃ","3":"πορεύεται"},plural:{"1":"πορευόμεθα","2":"πορεύεσθε","3":"πορεύονται"}}}
        ],
        exercises: {
    declension_fill: [
        {case:"1sg", word:"λύομαι", translation:"развязываюсь", correct:"λύομαι", distractors:["λύῃ","λύεται","λυόμεθα"]},
        {case:"2sg", word:"λύομαι", translation:"развязываюсь", correct:"λύῃ", distractors:["λύομαι","λύεται","λύεσθε"]},
        {case:"3sg", word:"λύομαι", translation:"развязываюсь", correct:"λύεται", distractors:["λύομαι","λύῃ","λύονται"]},
        {case:"1pl", word:"λύομαι", translation:"развязываюсь", correct:"λυόμεθα", distractors:["λύεσθε","λύονται","λύομαι"]},
        {case:"2pl", word:"λύομαι", translation:"развязываюсь", correct:"λύεσθε", distractors:["λυόμεθα","λύονται","λύῃ"]},
        {case:"3pl", word:"λύομαι", translation:"развязываюсь", correct:"λύονται", distractors:["λυόμεθα","λύεσθε","λύεται"]},
        {case:"1sg", word:"γίνομαι", translation:"становлюсь", correct:"γίνομαι", distractors:["γίνῃ","γίνεται","γινόμεθα"]},
        {case:"2sg", word:"ἔρχομαι", translation:"прихожу", correct:"ἔρχῃ", distractors:["ἔρχομαι","ἔρχεται","ἐρχόμεθα"]},
        {case:"3sg", word:"πορεύομαι", translation:"иду", correct:"πορεύεται", distractors:["πορεύομαι","πορεύῃ","πορευόμεθα"]},
        {case:"1pl", word:"ἀποκρίνομαι", translation:"отвечаю", correct:"ἀποκρινόμεθα", distractors:["ἀποκρίνομαι","ἀποκρίνῃ","ἀποκρίνεται"]},
        {case:"2pl", word:"εἰσέρχομαι", translation:"вхожу", correct:"εἰσέρχεσθε", distractors:["εἰσέρχομαι","εἰσέρχῃ","εἰσέρχεται"]},
        {case:"3pl", word:"ἐξέρχομαι", translation:"выхожу", correct:"ἐξέρχονται", distractors:["ἐξέρχομαι","ἐξέρχῃ","ἐξέρχεται"]}
    ],
    translate_greek_to_russian: [
        {greek:"γίνομαι", keywords:["становлюсь"]},
        {greek:"ἔρχεται", keywords:["приходит"]},
        {greek:"πορεύονται", keywords:["идут"]},
        {greek:"ἀποκρίνομαι", keywords:["отвечаю"]},
        {greek:"σώζεται", keywords:["спасается"]},
        {greek:"ἀπέρχομαι", keywords:["отхожу"]},
        {greek:"εἰσέρχομαι", keywords:["вхожу"]},
        {greek:"ἐξέρχομαι", keywords:["выхожу"]},
        {greek:"ἔρχομαι", keywords:["прихожу"]},
        {greek:"πορεύομαι", keywords:["иду"]}
    ],
    translate_russian_to_greek: [
        {russian:"я становлюсь", correct_sequence:["γίνομαι"], all_words:["γίνομαι","ἔρχομαι","λύομαι"]},
        {russian:"он спасается", correct_sequence:["σώζεται"], all_words:["σώζεται","σώζω","σώζονται"]},
        {russian:"я отвечаю", correct_sequence:["ἀποκρίνομαι"], all_words:["ἀποκρίνομαι","ἔρχομαι","πορεύομαι","γίνομαι"]},
        {russian:"я вхожу", correct_sequence:["εἰσέρχομαι"], all_words:["εἰσέρχομαι","ἐξέρχομαι","ἔρχομαι","ἀπέρχομαι"]},
        {russian:"я выхожу", correct_sequence:["ἐξέρχομαι"], all_words:["ἐξέρχομαι","εἰσέρχομαι","ἔρχομαι","πορεύομαι"]},
        {russian:"я прихожу", correct_sequence:["ἔρχομαι"], all_words:["ἔρχομαι","ἀπέρχομαι","πορεύομαι","γίνομαι"]},
        {russian:"я иду", correct_sequence:["πορεύομαι"], all_words:["πορεύομαι","ἔρχομαι","ἀποκρίνομαι","γίνομαι"]},
        {russian:"я отхожу", correct_sequence:["ἀπέρχομαι"], all_words:["ἀπέρχομαι","ἔρχομαι","πορεύομαι","εἰσέρχομαι"]}
    ],
    case_number: [
        {form:"λύεται", correct:"3-е л. ед.ч.", distractors:["2-е л. ед.ч.","1-е л. мн.ч.","3-е л. мн.ч."]},
        {form:"πορεύονται", correct:"3-е л. мн.ч.", distractors:["3-е л. ед.ч.","2-е л. мн.ч.","1-е л. мн.ч."]},
        {form:"γίνεται", correct:"3-е л. ед.ч.", distractors:["1-е л. ед.ч.","2-е л. ед.ч.","3-е л. мн.ч."]},
        {form:"πορευόμεθα", correct:"1-е л. мн.ч.", distractors:["2-е л. мн.ч.","3-е л. мн.ч.","1-е л. ед.ч."]},
        {form:"ἔρχονται", correct:"3-е л. мн.ч.", distractors:["1-е л. мн.ч.","2-е л. мн.ч.","3-е л. ед.ч."]}
    ]
},
translation: {
    ru_to_el: [
        { source: "Эти церкви спасаемы Господом от смерти.", correct: ["αὗται","αἱ","ἐκκλησίαι","σώζονται","ὑπὸ","τοῦ","κυρίου","ἀπὸ","τοῦ","θανάτου"] },
        { source: "Я спасаюсь Им, и Он учит меня своим словом.", correct: ["ἐγώ","σώζομαι","ὑπ'","αὐτοῦ","καὶ","αὐτὸς","διδάσκει","με","τῷ","λόγῳ","αὐτοῦ"] },
        { source: "Мы становимся учениками апостола, а вы не слышите его голоса.", correct: ["ἡμεῖς","γινόμεθα","μαθηταὶ","τοῦ","ἀποστόλου","ὑμεῖς","δὲ","οὐκ","ἀκούετε","τῆς","φωνῆς","αὐτοῦ"] },
        { source: "Я — грешник, но наставляем апостолами Господа и имею Его обетования.", correct: ["ἐγώ","εἰμι","ἁμαρτωλός","ἀλλὰ","διδασκόμενος","ὑπὸ","τῶν","ἀποστόλων","τοῦ","κυρίου","καὶ","ἔχω","τὰς","ἐπαγγελίας","αὐτοῦ"] },
        { source: "Я — плохой слуга, но ты становишься моим учителем.", correct: ["ἐγώ","εἰμι","κακὸς","δοῦλος","σὺ","δὲ","γίνῃ","μου","διδάσκαλος"] },
        { source: "Злые люди говорят тем Церквам, что наши братья не видят лица Господа.", correct: ["οἱ","πονηροὶ","ἄνθρωποι","λέγουσι","ἐκείναις","ταῖς","ἐκκλησίαις","ὅτι","οἱ","ἀδελφοί","ἡμῶν","οὐ","βλέπουσι","τὸ","πρόσωπον","τοῦ","κυρίου"] },
        { source: "Мы знаем Господа, потому что получаем от Него хорошие дары и учимся у Него посредством притч.", correct: ["ἡμεῖς","γινώσκομεν","τὸν","κύριον","ὅτι","λαμβάνομεν","παρ'","αὐτοῦ","καλὰ","δῶρα","καὶ","διδασκόμεθα","ὑπ'","αὐτοῦ","διὰ","τῶν","παραβολῶν"] },
        { source: "Ты пишешь своим братьям, что ты преследуем злыми судьями.", correct: ["σὺ","γράφεις","τοῖς","ἀδελφοῖς","σου","ὅτι","σὺ","διώκῃ","ὑπὸ","πονηρῶν","κριτῶν"] },
        { source: "Он учит других и сам учится у этого апостола.", correct: ["αὐτὸς","διδάσκει","τοὺς","ἄλλους","καὶ","αὐτὸς","διδάσκεται","ὑπὸ","τούτου","τοῦ","ἀποστόλου"] },
        { source: "Этот ученик не отвечает тому пророку, потому что не знает его писаний.", correct: ["οὗτος","ὁ","μαθητὴς","οὐκ","ἀποκρίνεται","ἐκείνῳ","τῷ","προφήτῃ","ὅτι","οὐ","γινώσκει","τὰς","γραφὰς","αὐτοῦ"] },
        { source: "Ты говоришь той Церкви, что ты — плохой слуга.", correct: ["σὺ","λέγεις","ἐκείνῃ","τῇ","ἐκκλησίᾳ","ὅτι","σὺ","εἶ","κακὸς","δοῦλος"] },
        { source: "Вы пребываете в этом храме, но не являетесь учениками Господа.", correct: ["ὑμεῖς","μένετε","ἐν","τούτῳ","τῷ","ἱερῷ","ἀλλὰ","οὐκ","ἐστέ","μαθηταὶ","τοῦ","κυρίου"] },
        { source: "Мы не видим лиц этих мытарей и грешников.", correct: ["ἡμεῖς","οὐ","βλέπομεν","τὰ","πρόσωπα","τούτων","τῶν","τελωνῶν","καὶ","ἁμαρτωλῶν"] },
        { source: "В доме учеников нашего Господа мир и радость.", correct: ["ἐν","τῷ","οἴκῳ","τῶν","μαθητῶν","τοῦ","κυρίου","ἡμῶν","εἰρήνη","καὶ","χαρά","ἐστιν"] },
        { source: "Господь управляет этим миром при помощи своего слова.", correct: ["ὁ","κύριος","ἄρχει","τούτου","τοῦ","κόσμου","τῷ","λόγῳ","αὐτοῦ"] },
        { source: "Эти грешники не входят в Господень дом, а выходят в пустыню вместе с разбойниками.", correct: ["οὗτοι","οἱ","ἁμαρτωλοὶ","οὐκ","εἰσέρχονται","εἰς","τὸν","οἶκον","τοῦ","κυρίου","ἀλλὰ","ἐξέρχονται","εἰς","τὴν","ἔρημον","μετὰ","τῶν","ληστῶν"] },
        { source: "Эти писания пишутся Господом его верным Церквам через пророков.", correct: ["αὗται","αἱ","γραφαὶ","γράφονται","ὑπὸ","τοῦ","κυρίου","ταῖς","πισταῖς","ἐκκλησίαις","αὐτοῦ","διὰ","τῶν","προφητῶν"] }
    ],
    el_to_ru: [
        {source:"λύονται οὗτοι οἱ δοῦλοι ὑπὸ τοῦ κυρίου.", correct:"Эти рабы освобождаются Господом."},
    {source:"τῷ λόγῳ τοῦ κυρίου ἀγόμεθα εἰς τὴν ἐκκλησίαν τοῦ θεοῦ.", correct:"Словом Господа мы ведомы в церковь Божию."},
    {source:"οὐκ ἀκούετε τῆς φωνῆς τοῦ προφήτου, ἀλλ' ἐξέρχεσθε ἐκ τοῦ οἴκου αὐτοῦ.", correct:"Вы не слышите голоса пророка, но выходите из его дома."},
    {source:"τῷ λόγῳ αὐτοῦ τοῦ κυρίου γίνεσθε μαθηταὶ αὐτοῦ.", correct:"Словом самого Господа вы становитесь его учениками."},
    {source:"ἐκεῖνοι οἱ ἀγαθοὶ διδάσκαλοι οὐκ εἰσέρχονται εἰς τοὺς οἴκους τῶν ἁμαρτωλῶν.", correct:"Те добрые учителя не входят в дома грешников."},
    {source:"οὐ βαπτίζονται οἱ ἁμαρτωλοὶ ὑπὸ τῶν ἀποστόλων, ἀλλ' ἐξέρχονται ἐκ τούτων τῶν οἴκων πρὸς ἄλλους διδασκάλους.", correct:"Грешники не крестятся апостолами, но выходят из этих домов к другим учителям."},
    {source:"λέγετε ἐκείνοις τοῖς ἁμαρτωλοῖς ὅτι σῴζεσθε ὑπὸ τοῦ θεοῦ ἀπὸ τῶν ἁμαρτιῶν ὑμῶν.", correct:"Скажите тем грешникам, что вы спасаетесь Богом от ваших грехов."},
    {source:"ἄρχει αὐτὸς ὁ θεὸς τῆς βασιλείας αὐτοῦ.", correct:"Сам Бог управляет своим царством."},
    {source:"εἰρήνην καὶ χαρὰν ἔχει ἡ ἐκκλησία, ὅτι σῴζεται ὑπὸ τοῦ κυρίου αὐτῆς.", correct:"Церковь имеет мир и радость, потому что она спасается своим Господом."},
    {source:"οὐκ ἀποκρινόμεθα τῷ τελώνῃ ὅτι γινώσκομεν αὐτόν.", correct:"Мы не отвечаем мытарю, потому что знаем его."},
    {source:"οὐχ ὑπὸ τῶν μαθητῶν σῴζῃ ἀπὸ τῶν ἁμαρτιῶν σου, ἀλλ' ὑπ' αὐτοῦ τοῦ θεοῦ.", correct:"Ты спасаешься от своих грехов не учениками, а самим Богом."},
    {source:"οὐ πορεύῃ ἐν τῇ ὁδῷ τῇ κακῇ, ἀλλὰ σῴζῃ ἀπὸ τῶν ἁμαρτιῶν σου καὶ οἱ ἀδελφοί σου ἀκούουσι τῆς φωνῆς τοῦ κυρίου.", correct:"Ты не идёшь по плохому пути, но спасаешься от своих грехов, и твои братья слышат голос Господа."},
    {source:"μετὰ τῶν ἀδελφῶν αὐτοῦ ἄγεται εἰς τὴν βασιλείαν τοῦ θεοῦ τῇ φωνῇ τῶν ἀποστόλων.", correct:"Со своими братьями он ведом голосом апостолов в царство Божие."},
    {source:"οὐ γίνῃ μαθητὴς τοῦ κυρίου, ὅτι οὐκ εἰσέρχῃ εἰς τὴν ἐκκλησίαν αὐτοῦ.", correct:"Ты не становишься учеником Господа, потому что не входишь в его церковь."},
    {source:"οἱ κριταὶ οὗτοι κρίνουσι τοὺς λῃστὰς ἐκείνους ἐν νόμῳ.", correct:"Эти судьи судят тех разбойников по закону."},
    {source:"αὗται αἱ καλαὶ παρθένοι διώκονται ὑπὸ τῶν λῃστῶν τούτων ἐν τῇ ὁδῷ, ἀλλ' ὁ κύριος σῴζει αὐτάς.", correct:"Эти хорошие девы преследуемы этими разбойниками на пути, но Господь спасает их."},
    {source:"ὁ βαπτιστὴς αὐτὸς ἐξέρχεται ἐκ τοῦ οἴκου καὶ ἀπέρχεται ἀπὸ τῶν πονηρῶν.", correct:"Сам креститель выходит из дома и уходит от злых."}
    ]
        }
    }
};
