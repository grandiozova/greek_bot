// ============================================================
// ДАННЫЕ ДЛЯ МОЛИТВЫ "ОТЧЕ НАШ"
// ============================================================

const PRAYER_DATA = {
    verses: [
        {
            greek: "Πάτερ ἡμῶν ὁ ἐν τοῖς οὐρανοῖς",
            russian: "Отче наш, сущий на небесах",
            transcription: "[páter hēmôn ho en toîs ouranoîs]",
            words: [
                { greek: "Πάτερ", translation: "Отче", analysis: "сущ., м.р., ед.ч., зват.п." },
                { greek: "ἡμῶν", translation: "наш", analysis: "мест., 1-е л., мн.ч., род.п." },
                { greek: "ὁ", translation: "сущий (артикль)", analysis: "артикль, м.р., ед.ч., им.п." },
                { greek: "ἐν", translation: "в", analysis: "предлог (с дат.п.)" },
                { greek: "τοῖς", translation: "тех (артикль)", analysis: "артикль, м.р., мн.ч., дат.п." },
                { greek: "οὐρανοῖς", translation: "небесах", analysis: "сущ., м.р., мн.ч., дат.п." }
            ]
        },
        {
            greek: "ἁγιασθήτω τὸ ὄνομά σου",
            russian: "да святится имя Твоё",
            transcription: "[hagiasthḗtō tò ónomá sou]",
            words: [
                { greek: "ἁγιασθήτω", translation: "да святится", analysis: "глагол, аорист, пассив, 3-е л., ед.ч., повел." },
                { greek: "τὸ", translation: "(артикль)", analysis: "артикль, ср.р., ед.ч., им./вин.п." },
                { greek: "ὄνομά", translation: "имя", analysis: "сущ., ср.р., ед.ч., им.п." },
                { greek: "σου", translation: "Твой", analysis: "мест., 2-е л., ед.ч., род.п." }
            ]
        },
        {
            greek: "ἐλθέτω ἡ βασιλεία σου",
            russian: "да придёт Царствие Твоё",
            transcription: "[elthétō hē basileía sou]",
            words: [
                { greek: "ἐλθέτω", translation: "да придёт", analysis: "глагол, аорист, актив, 3-е л., ед.ч., повел." },
                { greek: "ἡ", translation: "(артикль)", analysis: "артикль, ж.р., ед.ч., им.п." },
                { greek: "βασιλεία", translation: "Царствие", analysis: "сущ., ж.р., ед.ч., им.п." },
                { greek: "σου", translation: "Твоё", analysis: "мест., 2-е л., ед.ч., род.п." }
            ]
        },
        {
            greek: "γενηθήτω τὸ θέλημά σου",
            russian: "да будет воля Твоя",
            transcription: "[genēthḗtō tò thélēmá sou]",
            words: [
                { greek: "γενηθήτω", translation: "да будет", analysis: "глагол, аорист, пассив, 3-е л., ед.ч., повел." },
                { greek: "τὸ", translation: "(артикль)", analysis: "артикль, ср.р., ед.ч., им./вин.п." },
                { greek: "θέλημά", translation: "воля", analysis: "сущ., ср.р., ед.ч., им.п." },
                { greek: "σου", translation: "Твоя", analysis: "мест., 2-е л., ед.ч., род.п." }
            ]
        },
        {
            greek: "ὡς ἐν οὐρανῷ καὶ ἐπὶ τῆς γῆς",
            russian: "как на небе, так и на земле",
            transcription: "[hōs en ouranô kaì epì tês gês]",
            words: [
                { greek: "ὡς", translation: "как", analysis: "союз" },
                { greek: "ἐν", translation: "на", analysis: "предлог (с дат.п.)" },
                { greek: "οὐρανῷ", translation: "небе", analysis: "сущ., м.р., ед.ч., дат.п." },
                { greek: "καὶ", translation: "и", analysis: "союз" },
                { greek: "ἐπὶ", translation: "на", analysis: "предлог (с род./вин.п.)" },
                { greek: "τῆς", translation: "(артикль)", analysis: "артикль, ж.р., ед.ч., род.п." },
                { greek: "γῆς", translation: "земли", analysis: "сущ., ж.р., ед.ч., род.п." }
            ]
        },
        {
            greek: "τὸν ἄρτον ἡμῶν τὸν ἐπιούσιον δὸς ἡμῖν σήμερον",
            russian: "хлеб наш насущный дай нам сегодня",
            transcription: "[tòn árton hēmôn tòn epioúsion dòs hēmîn sḗmeron]",
            words: [
                { greek: "τὸν", translation: "(артикль)", analysis: "артикль, м.р., ед.ч., вин.п." },
                { greek: "ἄρτον", translation: "хлеб", analysis: "сущ., м.р., ед.ч., вин.п." },
                { greek: "ἡμῶν", translation: "наш", analysis: "мест., 1-е л., мн.ч., род.п." },
                { greek: "τὸν", translation: "(артикль)", analysis: "артикль, м.р., ед.ч., вин.п." },
                { greek: "ἐπιούσιον", translation: "насущный", analysis: "прил., м.р., ед.ч., вин.п." },
                { greek: "δὸς", translation: "дай", analysis: "глагол, аорист, актив, 2-е л., ед.ч., повел." },
                { greek: "ἡμῖν", translation: "нам", analysis: "мест., 1-е л., мн.ч., дат.п." },
                { greek: "σήμερον", translation: "сегодня", analysis: "наречие" }
            ]
        },
        {
            greek: "καὶ ἄφες ἡμῖν τὰ ὀφειλήματα ἡμῶν",
            russian: "и прости нам долги наши",
            transcription: "[kaì áphes hēmîn tà opheilḗmata hēmôn]",
            words: [
                { greek: "καὶ", translation: "и", analysis: "союз" },
                { greek: "ἄφες", translation: "прости", analysis: "глагол, аорист, актив, 2-е л., ед.ч., повел." },
                { greek: "ἡμῖν", translation: "нам", analysis: "мест., 1-е л., мн.ч., дат.п." },
                { greek: "τὰ", translation: "(артикль)", analysis: "артикль, ср.р., мн.ч., вин.п." },
                { greek: "ὀφειλήματα", translation: "долги", analysis: "сущ., ср.р., мн.ч., вин.п." },
                { greek: "ἡμῶν", translation: "наши", analysis: "мест., 1-е л., мн.ч., род.п." }
            ]
        },
        {
            greek: "ὡς καὶ ἡμεῖς ἀφήκαμεν τοῖς ὀφειλέταις ἡμῶν",
            russian: "как и мы прощаем должникам нашим",
            transcription: "[hōs kaì hēmeîs aphḗkamen toîs opheilétais hēmôn]",
            words: [
                { greek: "ὡς", translation: "как", analysis: "союз" },
                { greek: "καὶ", translation: "и", analysis: "союз" },
                { greek: "ἡμεῖς", translation: "мы", analysis: "мест., 1-е л., мн.ч., им.п." },
                { greek: "ἀφήκαμεν", translation: "прощаем", analysis: "глагол, аорист, актив, 1-е л., мн.ч." },
                { greek: "τοῖς", translation: "(артикль)", analysis: "артикль, м.р., мн.ч., дат.п." },
                { greek: "ὀφειλέταις", translation: "должникам", analysis: "сущ., м.р., мн.ч., дат.п." },
                { greek: "ἡμῶν", translation: "нашим", analysis: "мест., 1-е л., мн.ч., род.п." }
            ]
        },
        {
            greek: "καὶ μὴ εἰσενέγκῃς ἡμᾶς εἰς πειρασμόν",
            russian: "и не введи нас в искушение",
            transcription: "[kaì mḕ eisenénkēis hēmâs eis peirasmón]",
            words: [
                { greek: "καὶ", translation: "и", analysis: "союз" },
                { greek: "μὴ", translation: "не", analysis: "частица" },
                { greek: "εἰσενέγκῃς", translation: "введи", analysis: "глагол, аорист, актив, 2-е л., ед.ч., повел." },
                { greek: "ἡμᾶς", translation: "нас", analysis: "мест., 1-е л., мн.ч., вин.п." },
                { greek: "εἰς", translation: "в", analysis: "предлог (с вин.п.)" },
                { greek: "πειρασμόν", translation: "искушение", analysis: "сущ., м.р., ед.ч., вин.п." }
            ]
        },
        {
            greek: "ἀλλὰ ῥῦσαι ἡμᾶς ἀπὸ τοῦ πονηροῦ",
            russian: "но избавь нас от лукавого",
            transcription: "[allà rhŷsai hēmâs apò toû ponēroû]",
            words: [
                { greek: "ἀλλὰ", translation: "но", analysis: "союз" },
                { greek: "ῥῦσαι", translation: "избавь", analysis: "глагол, аорист, средн., 2-е л., ед.ч., повел." },
                { greek: "ἡμᾶς", translation: "нас", analysis: "мест., 1-е л., мн.ч., вин.п." },
                { greek: "ἀπὸ", translation: "от", analysis: "предлог (с род.п.)" },
                { greek: "τοῦ", translation: "(артикль)", analysis: "артикль, м.р., ед.ч., род.п." },
                { greek: "πονηροῦ", translation: "лукавого", analysis: "прил., м.р., ед.ч., род.п." }
            ]
        }
    ]
};
