/* My R 설문 분석 로직 — 브라우저와 Node 양쪽에서 동작 */
(function (root) {
  "use strict";

  // ---------- 언어 블록 & 문항 정의 ----------
  var LANGS = ["한국어", "English", "日本語", "简体中文", "Español", "Français"];
  // 각 언어 블록의 첫 열(나이 문항) 제목
  var AGE_HEADERS = ["나이대", "Year of birth", "生まれた年", "出生年份", "Año de nacimiento", "Année de naissance"];
  // 각 언어 블록 안 문항 순서 (23열)
  var ORDER = ["age", "q3", "q31", "q4", "q5", "q6", "q7", "q8", "q9", "q10", "q11", "q12", "q13", "q14", "q15", "q16", "q17", "q18", "q19", "q20", "q21", "q22", "q23"];

  // 보기: [한국어, English, 日本語, 简体中文, Español, Français] 순서. 각 언어 배열은 같은 순서로 대응.
  var OPT = {
    age: [
      ["14세 미만", "14~16세", "17~19세", "20~23세", "24~26세", "27~29세", "30세 이상"],
      ["2014 or later", "2011–2013", "2008–2010", "2004–2007", "2001–2003", "1998–2000", "1997 or earlier"],
      ["2014年以降", "2011～2013年", "2008～2010年", "2004～2007年", "2001～2003年", "1998～2000年", "1997年以前"],
      ["2014年及以后", "2011～2013年", "2008～2010年", "2004～2007年", "2001～2003年", "1998～2000年", "1997年及以前"],
      ["2014 o después", "2011–2013", "2008–2010", "2004–2007", "2001–2003", "1998–2000", "1997 o antes"],
      ["2014 ou après", "2011–2013", "2008–2010", "2004–2007", "2001–2003", "1998–2000", "1997 ou avant"]
    ],
    q3: [
      ["거의 매주 한다", "거의 매달 한다", "몇 달에 한 편 정도 한다", "1년에 한두 편 한다", "해본 적만 있다", "해본 적 없다"],
      ["Almost every week", "Almost every month", "About one every few months", "One or two a year", "I've played one before", "Never"],
      ["ほぼ毎週遊ぶ", "ほぼ毎月遊ぶ", "数か月に1本くらい遊ぶ", "年に1～2本遊ぶ", "遊んだことがある程度", "遊んだことがない"],
      ["几乎每周都玩", "几乎每个月都玩", "几个月玩一部左右", "一年玩一两部", "只玩过", "没玩过"],
      ["Casi todas las semanas", "Casi todos los meses", "Más o menos uno cada pocos meses", "Uno o dos al año", "Las he probado alguna vez", "Nunca"],
      ["Presque chaque semaine", "Presque tous les mois", "Environ un tous les quelques mois", "Un ou deux par an", "J'y ai déjà joué", "Jamais"]
    ],
    q31: [
      ["거의 전부", "절반 이상", "절반 정도", "절반 미만", "거의 없음", "비주얼노벨 게임을 해본 적 없음"],
      ["Almost all", "More than half", "About half", "Less than half", "Almost none", "I've never played a visual novel"],
      ["ほぼすべて", "半分以上", "半分くらい", "半分未満", "ほとんどない", "ビジュアルノベルを遊んだことがない"],
      ["几乎全部", "一半以上", "大约一半", "不到一半", "几乎没有", "没玩过视觉小说"],
      ["Casi todas", "Más de la mitad", "Alrededor de la mitad", "Menos de la mitad", "Casi ninguna", "Nunca he jugado una novela visual"],
      ["Presque tous", "Plus de la moitié", "Environ la moitié", "Moins de la moitié", "Presque aucun", "Je n'ai jamais joué à un visual novel"]
    ],
    q5: [
      ["구원물", "성장물(정신적 성숙)", "유사가족", "중독과 회복(알코올중독, 약물중독 등)", "혐앤관(한쪽은 혐오, 한쪽은 사랑하는 관계)", "혐관(양쪽 다 혐오하는 관계)", "소꿉친구", "멘헤라(정신이 건강하지 못한 캐릭터)", "복수극", "회빙환(회귀물·빙의물·환생물)", "학원물", "혁명물(혁명·저항·사회운동)", "로판(로맨스 판타지)", "탐정물·수사물", "시대극·역사", "병맛", "블랙코미디(사회풍자)", "피폐물", "일상물", "힐링물", "아무것도 끌리지 않음"],
      ["Redemption (being saved by someone)", "Coming-of-age (emotional growth)", "Found family", "Addiction and recovery (alcoholism, drug addiction, etc.)", "One-sided hate-love (one hates, the other loves)", "Mutual hatred (both hate each other)", "Childhood friends", "\"Menhera\" (mentally unwell characters)", "Revenge", "Regression, possession and reincarnation", "School life", "Revolution (revolution, resistance, social movements)", "Romance fantasy", "Detective and crime investigation", "Period drama and history", "Absurd, nonsensical humor", "Black comedy (social satire)", "Angst and despair", "Slice of life", "Healing", "Nothing appeals to me"],
      ["救済もの", "成長もの（精神的な成長）", "疑似家族", "依存症と回復（アルコール依存症、薬物依存症など）", "片方は憎み片方は愛する関係", "憎み合う関係（お互いに嫌い合う）", "幼なじみ", "メンヘラ（心が健康でないキャラクター）", "復讐劇", "ループ・憑依・転生もの", "学園もの", "革命もの（革命・抵抗・社会運動）", "ロマンスファンタジー", "探偵もの・捜査もの", "時代劇・歴史", "シュールなギャグ", "ブラックコメディ（社会風刺）", "鬱展開・ダーク系", "日常もの", "癒やし系", "特に惹かれるものはない"],
      ["救赎", "成长（心理上的成熟）", "拟似家庭", "成瘾与康复（酒精成瘾、药物成瘾等）", "一方厌恶、一方深爱的关系", "相看两厌（双方互相憎恨）", "青梅竹马", "心理状态不稳定的角色", "复仇", "重生·穿越·转世", "校园", "革命（革命·反抗·社会运动）", "浪漫奇幻", "侦探·刑侦", "历史·时代剧", "无厘头搞笑", "黑色幽默（社会讽刺）", "致郁·虐心", "日常", "治愈", "没有感兴趣的"],
      ["Redención (ser salvado por alguien)", "Crecimiento personal (madurez emocional)", "Familia elegida", "Adicción y recuperación (alcoholismo, drogadicción, etc.)", "Odio-amor unilateral (uno odia, el otro ama)", "Odio mutuo (ambos se odian)", "Amigos de la infancia", "\"Menhera\" (personajes con salud mental frágil)", "Venganza", "Regresión, transmigración y reencarnación", "Vida escolar", "Revolución (revolución, resistencia, movimientos sociales)", "Fantasía romántica", "Detectives e investigación criminal", "Drama de época e historia", "Humor absurdo", "Comedia negra (sátira social)", "Angustia y desesperanza", "Recuentos de la vida (slice of life)", "Historias reconfortantes", "Ninguno me atrae"],
      ["Rédemption (être sauvé par quelqu'un)", "Récit d'apprentissage (maturité émotionnelle)", "Famille choisie", "Addiction et rétablissement (alcoolisme, toxicomanie, etc.)", "Haine-amour à sens unique (l'un déteste, l'autre aime)", "Haine réciproque (les deux se détestent)", "Amis d'enfance", "« Menhera » (personnages à la santé mentale fragile)", "Vengeance", "Régression, transmigration et réincarnation", "Vie scolaire", "Révolution (révolution, résistance, mouvements sociaux)", "Fantasy romantique", "Détectives et enquêtes criminelles", "Drame historique", "Humour absurde", "Comédie noire (satire sociale)", "Angst et désespoir", "Tranche de vie", "Histoires réconfortantes", "Rien ne m'attire"]
    ],
    q7: [
      ["주인공의 목표와 상관없는 이야기가 길게 이어져서(ex.너희 00은 언제 할 거야?)", "떡밥이나 단서가 나오지 않아서(ex.왜 갑자기 이 전개가 나오지?)", "게임이 너무 불친절해서(ex.뭔소린지 하나도 모르겠네)", "같은 갈등/상황이 반복돼서(ex.이거 아까도 나오지 않았나?)", "서술이 너무 길어서(ex.너무 길어)", "선택지 때문에 배드엔딩·호감도 하락이 답답해서(ex.내가 의도한건 이런 말이 아닌데!)", "공략 없이 엔딩을 보기 어려워서", "미니게임이 어려워서", "스토리가 취향이 아니어서", "시간이 없어서", "그만둔 적 없음"],
      ["Long stretches unrelated to the protagonist's goal (e.g. \"So when are you actually going to do it?\")", "No foreshadowing or clues (e.g. \"Why did this suddenly happen?\")", "The game was too unfriendly (e.g. \"I have no idea what's going on\")", "The same conflict or situation kept repeating (e.g. \"Didn't this already happen?\")", "Too much narration (e.g. \"Way too long\")", "Frustrating bad endings or affection drops from choices (e.g. \"That's not what I meant!\")", "Endings were hard to reach without a walkthrough", "Mini-games were too hard", "The story wasn't my taste", "No time", "I've never quit"],
      ["主人公の目標と関係ない話が長く続いたから（例：で、いつやるの？）", "伏線や手がかりが出てこなかったから（例：なんで急にこの展開？）", "ゲームが不親切すぎたから（例：何を言っているのか全然わからない）", "同じ葛藤・状況が繰り返されたから（例：これさっきもあったよね？）", "地の文が長すぎたから（例：長すぎる）", "選択肢のせいでバッドエンドや好感度ダウンがもどかしかったから（例：そういう意味で言ったんじゃない！）", "攻略情報なしでエンディングを見るのが難しかったから", "ミニゲームが難しかったから", "ストーリーが好みではなかったから", "時間がなかったから", "やめたことはない"],
      ["与主角目标无关的内容拖得太长（例：你们到底什么时候才去做？）", "没有伏笔或线索（例：怎么突然就这样发展了？）", "游戏太不友好（例：完全看不懂在说什么）", "同样的矛盾或情况反复出现（例：这个刚才不是出现过吗？）", "叙述太长（例：太长了）", "因为选项导致坏结局或好感度下降而憋屈（例：我不是这个意思！）", "不看攻略很难打出结局", "小游戏太难", "剧情不合口味", "没有时间", "从未弃坑"],
      ["Partes largas sin relación con el objetivo del protagonista (p. ej. «¿Y cuándo vais a hacerlo de una vez?»)", "No aparecían pistas ni presagios (p. ej. «¿Por qué pasa esto de repente?»)", "El juego era muy poco amigable (p. ej. «No entiendo nada»)", "Se repetía el mismo conflicto o situación (p. ej. «¿Esto no pasó ya?»)", "Demasiada narración (p. ej. «Demasiado largo»)", "Finales malos o bajadas de afinidad frustrantes por las elecciones (p. ej. «¡No quería decir eso!»)", "Era difícil ver los finales sin una guía", "Los minijuegos eran muy difíciles", "La historia no era de mi gusto", "No tenía tiempo", "Nunca he abandonado uno"],
      ["De longs passages sans lien avec l'objectif du protagoniste (ex. « Bon, vous le faites quand ? »)", "Aucun indice ni préfiguration (ex. « Pourquoi ça arrive d'un coup ? »)", "Le jeu était trop peu accueillant (ex. « Je ne comprends rien »)", "Le même conflit ou la même situation se répétait (ex. « Ça ne s'est pas déjà produit ? »)", "Trop de narration (ex. « C'est trop long »)", "Mauvaises fins ou baisses d'affinité frustrantes à cause des choix (ex. « Ce n'est pas ce que je voulais dire ! »)", "Difficile d'obtenir les fins sans guide", "Les mini-jeux étaient trop difficiles", "L'histoire n'était pas à mon goût", "Pas le temps", "Je n'ai jamais abandonné"]
    ],
    q8: [
      ["1개", "2~3개", "4~6개", "7~10개", "많을수록 좋다"],
      ["1", "2–3", "4–6", "7–10", "The more the better"],
      ["1個", "2～3個", "4～6個", "7～10個", "多いほどいい"],
      ["1个", "2～3个", "4～6个", "7～10个", "越多越好"],
      ["1", "2–3", "4–6", "7–10", "Cuantos más, mejor"],
      ["1", "2–3", "4–6", "7–10", "Plus il y en a, mieux c'est"]
    ],
    q9: [
      ["원작 소설(빅토르 위고)을 읽어봤다", "뮤지컬(또는 콘서트)을 봤다", "영화를 봤다", "드라마(또는 애니메이션)를 봤다", "만화(또는 웹툰)를 봤다", "내용을 자세히 안다", "내용을 대략 안다", "제목만 들어봤다", "노래(민중의 노래; Do You Hear the People Sing? 등)만 들어봤다", "어린이 동화 <장발장>은 안다", "모른다"],
      ["I've read the original novel (Victor Hugo)", "I've seen the musical (or a concert)", "I've seen a film", "I've seen a TV series (or anime)", "I've read a comic (or webtoon)", "I know the story in detail", "I know the story roughly", "I've only heard the title", "I've only heard the songs (e.g. \"Do You Hear the People Sing?\")", "I know the children's version (\"Jean Valjean\")", "I don't know it"],
      ["原作小説（ヴィクトル・ユゴー）を読んだ", "ミュージカル（またはコンサート）を観た", "映画を観た", "ドラマ（またはアニメ）を観た", "漫画（またはウェブトゥーン）を読んだ", "内容を詳しく知っている", "内容をだいたい知っている", "タイトルだけ聞いたことがある", "歌（「民衆の歌」Do You Hear the People Sing? など）だけ聞いたことがある", "児童向けの『ああ無情』（ジャン・バルジャン）なら知っている", "知らない"],
      ["读过原著小说（维克多·雨果）", "看过音乐剧（或音乐会）", "看过电影", "看过电视剧（或动画）", "看过漫画（或网络漫画）", "详细了解内容", "大概了解内容", "只听说过书名", "只听过歌曲（如《Do You Hear the People Sing?》）", "知道儿童版《冉阿让》", "不知道"],
      ["He leído la novela original (Víctor Hugo)", "He visto el musical (o un concierto)", "He visto una película", "He visto una serie (o un anime)", "He leído un cómic (o webtoon)", "Conozco la historia en detalle", "Conozco la historia por encima", "Solo he oído el título", "Solo he oído las canciones (p. ej. «Do You Hear the People Sing?»)", "Conozco la versión infantil («Jean Valjean»)", "No la conozco"],
      ["J'ai lu le roman original (Victor Hugo)", "J'ai vu la comédie musicale (ou un concert)", "J'ai vu un film", "J'ai vu une série (ou un anime)", "J'ai lu une BD (ou un webtoon)", "Je connais l'histoire en détail", "Je connais l'histoire dans les grandes lignes", "J'ai seulement entendu le titre", "J'ai seulement entendu les chansons (ex. « À la volonté du peuple » / « Do You Hear the People Sing? »)", "Je connais la version pour enfants (« Jean Valjean »)", "Je ne connais pas"]
    ],
    q12: [
      ["알코올중독 소재", "혁명·사회운동 소재", "두 캐릭터의 관계성", "회복·성장 서사", "가벼운 개그에서 진지해지는 전개", "독특한 선택지가 많음", "포인트앤클릭 미니게임", "멀티엔딩", "캐릭터의 속마음을 볼 수 있는 시스템", "캐릭터디자인·그림체", "레 미제라블", "없음"],
      ["The alcoholism theme", "The revolution and social movement theme", "The relationship between the two characters", "The recovery and growth story", "Light comedy that turns serious", "Lots of unique choices", "Point-and-click mini-games", "Multiple endings", "A system that shows the character's inner thoughts", "Character design and art style", "Les Misérables", "None"],
      ["アルコール依存症というテーマ", "革命・社会運動というテーマ", "二人のキャラクターの関係性", "回復・成長の物語", "軽いギャグから真剣になっていく展開", "ユニークな選択肢が多い", "ポイント＆クリックのミニゲーム", "マルチエンディング", "キャラクターの心の声が見られるシステム", "キャラクターデザイン・絵柄", "レ・ミゼラブル", "特になし"],
      ["酒精成瘾题材", "革命·社会运动题材", "两个角色之间的关系", "康复·成长的故事", "从轻松搞笑逐渐变得认真的展开", "有很多独特的选项", "点击式小游戏", "多结局", "可以看到角色内心想法的系统", "角色设计·画风", "《悲惨世界》", "没有"],
      ["El tema del alcoholismo", "El tema de la revolución y los movimientos sociales", "La relación entre los dos personajes", "La historia de recuperación y crecimiento", "El humor ligero que se vuelve serio", "Muchas elecciones originales", "Minijuegos de point-and-click", "Los múltiples finales", "Un sistema para ver los pensamientos internos del personaje", "Diseño de personajes y estilo de dibujo", "Los Miserables", "Nada"],
      ["Le thème de l'alcoolisme", "Le thème de la révolution et des mouvements sociaux", "La relation entre les deux personnages", "L'histoire de rétablissement et d'apprentissage", "L'humour léger qui devient sérieux", "De nombreux choix originaux", "Des mini-jeux point-and-click", "Les fins multiples", "Un système pour voir les pensées intimes du personnage", "Le character design et le style graphique", "Les Misérables", "Rien"]
    ],
    q13: [
      ["알코올중독 소재가 부담된다", "혁명·사회운동 소재가 부담된다", "스토리가 (이해하기) 너무 어려울 것 같다", "공략 캐릭터가 한 명뿐이다", "공략 캐릭터에 전혀 흥미가 가지 않는다", "보이스가 없다", "그림체가 취향이 아니다", "로맨스 장르가 취향이 아니다", "없음"],
      ["The alcoholism theme feels too heavy", "The revolution and social movement theme feels too heavy", "The story seems too hard to understand", "There's only one romanceable character", "I'm not interested in the romanceable character at all", "No voice acting", "The art style isn't my taste", "Romance isn't my genre", "None"],
      ["アルコール依存症というテーマが重い", "革命・社会運動というテーマが重い", "ストーリーが（理解するのが）難しすぎそう", "攻略キャラクターが1人だけ", "攻略キャラクターにまったく興味が持てない", "ボイスがない", "絵柄が好みではない", "恋愛ジャンルが好みではない", "特になし"],
      ["酒精成瘾题材太沉重", "革命·社会运动题材太沉重", "剧情似乎太难（理解）", "可攻略角色只有一个", "对可攻略角色完全不感兴趣", "没有配音", "画风不合口味", "不喜欢恋爱类型", "没有"],
      ["El tema del alcoholismo me resulta pesado", "El tema de la revolución y los movimientos sociales me resulta pesado", "La historia parece demasiado difícil (de entender)", "Solo hay un personaje romanceable", "El personaje romanceable no me interesa nada", "No tiene voces", "El estilo de dibujo no es de mi gusto", "El romance no es mi género", "Nada"],
      ["Le thème de l'alcoolisme me paraît trop lourd", "Le thème de la révolution et des mouvements sociaux me paraît trop lourd", "L'histoire semble trop difficile (à comprendre)", "Il n'y a qu'un seul personnage romançable", "Le personnage romançable ne m'intéresse pas du tout", "Pas de doublage", "Le style graphique n'est pas à mon goût", "La romance n'est pas mon genre", "Rien"]
    ],
    q14: [
      ["많이 높아졌다", "조금 높아졌다", "변화 없다", "조금 낮아졌다", "많이 낮아졌다"],
      ["Increased a lot", "Increased a little", "No change", "Decreased a little", "Decreased a lot"],
      ["とても高まった", "少し高まった", "変わらない", "少し下がった", "とても下がった"],
      ["大大提高", "略有提高", "没有变化", "略有降低", "大大降低"],
      ["Aumentó mucho", "Aumentó un poco", "No cambió", "Disminuyó un poco", "Disminuyó mucho"],
      ["A beaucoup augmenté", "A un peu augmenté", "N'a pas changé", "A un peu diminué", "A beaucoup diminué"]
    ],
    q15: [
      ["음주 장면 자체", "금단 증상(손떨림, 불면 등)", "술 때문에 무너지는 인간관계(갈등·단절)", "술에 의존", "재발", "치료·회복 과정", "주변인의 고통", "알코올 관련 질병(예: 지방간, 알코올성 치매 등)", "과음으로 인한 응급 상황", "중독으로 인한 죽음", "폭력성", "A.A.(Alcoholics Anonymous; 자조 모임) 등 프로그램"],
      ["Drinking scenes themselves", "Withdrawal symptoms (tremors, insomnia, etc.)", "Relationships falling apart because of drinking (conflict, estrangement)", "Dependence on alcohol", "Relapse", "Treatment and recovery", "The suffering of people around them", "Alcohol-related illness (e.g. fatty liver, alcohol-related dementia)", "Emergencies caused by heavy drinking", "Death from addiction", "Violence", "Programs such as A.A. (Alcoholics Anonymous, a self-help group)"],
      ["飲酒シーンそのもの", "離脱症状（手の震え、不眠など）", "酒のせいで壊れていく人間関係（衝突・断絶）", "酒への依存", "再飲酒（スリップ）", "治療・回復の過程", "周囲の人の苦しみ", "アルコール関連の病気（例：脂肪肝、アルコール性認知症など）", "飲みすぎによる緊急事態", "依存症による死", "暴力", "A.A.（アルコホーリクス・アノニマス、自助グループ）などのプログラム"],
      ["饮酒场面本身", "戒断症状（手抖、失眠等）", "因酒而崩溃的人际关系（冲突·断绝）", "对酒精的依赖", "复饮（复发）", "治疗·康复过程", "身边人的痛苦", "酒精相关疾病（如脂肪肝、酒精性痴呆等）", "过量饮酒导致的紧急情况", "因成瘾而死亡", "暴力", "A.A.（匿名戒酒会，互助小组）等项目"],
      ["Las escenas de consumo de alcohol", "Síntomas de abstinencia (temblores, insomnio, etc.)", "Relaciones que se rompen por el alcohol (conflictos, distanciamiento)", "Dependencia del alcohol", "Recaídas", "El proceso de tratamiento y recuperación", "El sufrimiento de las personas cercanas", "Enfermedades relacionadas con el alcohol (p. ej. hígado graso, demencia alcohólica)", "Emergencias por beber en exceso", "Muerte a causa de la adicción", "Violencia", "Programas como A.A. (Alcohólicos Anónimos, grupo de autoayuda)"],
      ["Les scènes de consommation d'alcool", "Les symptômes de sevrage (tremblements, insomnie, etc.)", "Des relations qui se brisent à cause de l'alcool (conflits, rupture)", "La dépendance à l'alcool", "Les rechutes", "Le traitement et le rétablissement", "La souffrance des proches", "Les maladies liées à l'alcool (ex. stéatose hépatique, démence alcoolique)", "Les urgences dues à une consommation excessive", "La mort causée par l'addiction", "La violence", "Des programmes comme les A.A. (Alcooliques anonymes, groupe d'entraide)"]
    ],
    q16: [
      ["오히려 더 끌린다", "이야기에 필요하다면 괜찮다", "암시 정도라면 괜찮다", "피하고 싶다"],
      ["It makes the game even more appealing", "Fine if the story needs it", "Fine if it's only implied", "I'd rather avoid it"],
      ["むしろもっと惹かれる", "物語に必要なら構わない", "ほのめかす程度なら構わない", "避けたい"],
      ["反而更吸引我", "如果剧情需要就可以", "只是暗示的话可以", "想要避开"],
      ["Me atrae todavía más", "Está bien si la historia lo necesita", "Está bien si solo se insinúa", "Prefiero evitarlo"],
      ["Cela me plaît encore plus", "D'accord si l'histoire le nécessite", "D'accord si c'est seulement suggéré", "Je préfère éviter"]
    ],
    q18: [
      ["매우 직접적으로(선전 포함)", "직접적으로(충돌·부상 묘사 포함)", "비폭력적으로만", "항상 평화적으로만(준법)", "암시 위주로", "매우 가볍게", "어차피 게임이므로 뭐든 상관없음"],
      ["Very directly (including propaganda)", "Directly (including clashes and injuries)", "Non-violent only", "Always peaceful and lawful only", "Mostly implied", "Very lightly", "Doesn't matter, it's a game"],
      ["とても直接的に（プロパガンダを含む）", "直接的に（衝突・負傷の描写を含む）", "非暴力的なものだけ", "常に平和的なものだけ（法を守る）", "ほのめかす程度", "とても軽く", "どうせゲームなので何でもいい"],
      ["非常直接（包括宣传鼓动）", "直接（包括冲突·受伤的描写）", "只要非暴力的", "始终只要和平的（守法）", "以暗示为主", "非常轻描淡写", "反正是游戏，怎样都行"],
      ["Muy directamente (incluida la propaganda)", "Directamente (incluidos enfrentamientos y heridos)", "Solo de forma no violenta", "Siempre de forma pacífica y dentro de la ley", "Principalmente insinuado", "De forma muy ligera", "Me da igual, es un juego"],
      ["Très directement (y compris la propagande)", "Directement (y compris affrontements et blessures)", "Seulement de façon non violente", "Toujours de façon pacifique et légale", "Surtout suggéré", "Très légèrement", "Peu importe, c'est un jeu"]
    ],
    q20: [
      ["3,000원 미만", "3,000~5,000원", "6,000~8,000원", "9,000~11,000원", "12,000~15,000원", "16,000~19,000원", "20,000원 이상"],
      ["Under ₩3,000 (under ≈$2)", "₩3,000–5,000 (≈$2–4)", "₩6,000–8,000 (≈$4–6)", "₩9,000–11,000 (≈$6–8)", "₩12,000–15,000 (≈$8–11)", "₩16,000–19,000 (≈$11–14)", "₩20,000 or more (≈$14+)"],
      ["3,000ウォン未満（≈2ドル未満）", "3,000–5,000ウォン（≈2–4ドル）", "6,000–8,000ウォン（≈4–6ドル）", "9,000–11,000ウォン（≈6–8ドル）", "12,000–15,000ウォン（≈8–11ドル）", "16,000–19,000ウォン（≈11–14ドル）", "20,000ウォン以上（≈14ドル以上）"],
      ["低于3,000韩元（≈2美元以下）", "3,000–5,000韩元（≈2–4美元）", "6,000–8,000韩元（≈4–6美元）", "9,000–11,000韩元（≈6–8美元）", "12,000–15,000韩元（≈8–11美元）", "16,000–19,000韩元（≈11–14美元）", "20,000韩元以上（≈14美元以上）"],
      ["Menos de ₩3.000 (≈ menos de 2 USD)", "₩3.000–5.000 (≈2–4 USD)", "₩6.000–8.000 (≈4–6 USD)", "₩9.000–11.000 (≈6–8 USD)", "₩12.000–15.000 (≈8–11 USD)", "₩16.000–19.000 (≈11–14 USD)", "₩20.000 o más (≈14 USD o más)"],
      ["Moins de 3 000 ₩ (≈ moins de 2 USD)", "3 000–5 000 ₩ (≈ 2–4 USD)", "6 000–8 000 ₩ (≈ 4–6 USD)", "9 000–11 000 ₩ (≈ 6–8 USD)", "12 000–15 000 ₩ (≈ 8–11 USD)", "16 000–19 000 ₩ (≈ 11–14 USD)", "20 000 ₩ ou plus (≈ 14 USD ou plus)"]
    ],
    q21: [
      ["게임 키", "디지털 리워드(배경화면, 디지털 코멘트북)", "실물 굿즈", "엔딩 크레딧에 이름 기재", "게임 속에 등장하는 참여형 리워드", "후원할 생각 없음"],
      ["Game key", "Digital rewards (wallpapers, digital comment book)", "Physical merchandise", "Your name in the end credits", "A participation reward that appears in the game", "Not interested in backing"],
      ["ゲームキー", "デジタルリターン（壁紙、デジタル版コメントブック）", "実物グッズ", "エンディングクレジットへの名前掲載", "ゲーム内に登場できる参加型リターン", "支援するつもりはない"],
      ["游戏激活码", "数字回报（壁纸、电子版创作评论集）", "实体周边", "在片尾字幕中署名", "可以出现在游戏中的参与型回报", "不打算支持"],
      ["Clave del juego", "Recompensas digitales (fondos de pantalla, libro de comentarios digital)", "Merchandising físico", "Tu nombre en los créditos finales", "Una recompensa participativa que aparece en el juego", "No me interesa apoyar"],
      ["Clé du jeu", "Contreparties numériques (fonds d'écran, livret de commentaires numérique)", "Goodies physiques", "Votre nom dans le générique de fin", "Une contrepartie participative qui apparaît dans le jeu", "Je ne compte pas contribuer"]
    ],
    q22: [
      ["체험판(데모)", "트레일러·스크린샷", "SNS 후기·팬아트", "스트리머 방송", "스팀 리뷰", "친구 추천", "가격·할인"],
      ["Demo", "Trailer and screenshots", "Reviews and fan art on social media", "Streamer broadcasts", "Steam reviews", "Recommendations from friends", "Price and discounts"],
      ["体験版（デモ）", "トレーラー・スクリーンショット", "SNSの感想・ファンアート", "配信者の実況", "Steamレビュー", "友人のおすすめ", "価格・セール"],
      ["试玩版（Demo）", "预告片·截图", "社交媒体上的评价·同人图", "主播直播", "Steam 评测", "朋友推荐", "价格·折扣"],
      ["Demo", "Tráiler y capturas", "Opiniones y fan art en redes sociales", "Directos de streamers", "Reseñas de Steam", "Recomendaciones de amigos", "Precio y descuentos"],
      ["Démo", "Bande-annonce et captures d'écran", "Avis et fan arts sur les réseaux sociaux", "Lives de streamers", "Évaluations Steam", "Recommandations d'amis", "Prix et promotions"]
    ]
  };
  // Q17 = Q15 보기 + 없음
  var NONE17 = ["없음", "None", "特になし", "没有", "Ninguna", "Aucune"];
  OPT.q17 = OPT.q15.map(function (arr, i) { return arr.concat([NONE17[i]]); });

  // 보기 짧은 이름 (차트·문장용)
  var SHORT = {
    q5: ["구원물", "성장물", "유사가족", "중독과 회복", "혐앤관", "혐관", "소꿉친구", "멘헤라", "복수극", "회빙환", "학원물", "혁명물", "로판", "탐정·수사물", "시대극·역사", "병맛", "블랙코미디", "피폐물", "일상물", "힐링물", "끌리는 것 없음"],
    q7: ["목표와 무관한 이야기가 길어서", "떡밥·단서가 안 나와서", "게임이 불친절해서", "같은 갈등·상황 반복", "서술이 너무 길어서", "선택지로 인한 배드엔딩·호감도 하락", "공략 없이 엔딩 보기 어려워서", "미니게임이 어려워서", "스토리가 취향이 아니어서", "시간이 없어서", "그만둔 적 없음"],
    q9: ["원작 소설 읽음", "뮤지컬·콘서트", "영화", "드라마·애니", "만화·웹툰", "내용 자세히 앎", "내용 대략 앎", "제목만 앎", "노래만 앎", "동화 <장발장>", "모름"],
    q15: ["음주 장면", "금단 증상", "무너지는 인간관계", "술에 의존", "재발", "치료·회복 과정", "주변인의 고통", "알코올 관련 질병", "과음 응급 상황", "중독으로 인한 죽음", "폭력성", "A.A. 등 프로그램"],
    q18: ["매우 직접적(선전 포함)", "직접적(충돌·부상)", "비폭력적으로만", "평화적으로만(준법)", "암시 위주", "매우 가볍게", "상관없음"],
    q21: ["게임 키", "디지털 리워드", "실물 굿즈", "크레딧 이름 기재", "게임 속 참여형 리워드", "후원 생각 없음"]
  };
  SHORT.q17 = SHORT.q15.concat(["없음"]);

  var QMETA = {
    age: { title: "나이대 (세는 나이 기준)", type: "single" },
    q3: { title: "비주얼노벨을 얼마나 자주 하나요?", type: "single" },
    q31: { title: "플레이한 비주얼노벨 중 정통(키네틱) 비주얼노벨의 비율", type: "single" },
    q4: { title: "게임(미니게임) 조작 실력 (1~5)", type: "scale", lo: "낮음", hi: "높음" },
    q5: { title: "끌리는 스토리 소재·키워드 (최대 5개)", type: "multi" },
    q6: { title: "선호하는 전개 방식 (1 일상·관계 ~ 5 사건·목표 달성)", type: "scale", lo: "일상·관계 중심", hi: "사건·목표 중심" },
    q7: { title: "스토리 게임을 중간에 그만둔 이유", type: "multi" },
    q8: { title: "선호하는 엔딩 개수", type: "single" },
    q9: { title: "《레 미제라블》을 알고 있나요?", type: "multi" },
    q10: { title: "My R에 대한 관심 (1~5)", type: "scale", lo: "낮음", hi: "높음" },
    q11: { title: "'알코올중독자 × 혁명가' 조합에 대한 느낌 (1 거부감 ~ 5 흥미)", type: "scale", lo: "거부감", hi: "흥미" },
    q12: { title: "My R에서 끌리는 점", type: "multi" },
    q13: { title: "My R에서 망설여지는 점", type: "multi" },
    q14: { title: "레미제라블 모티브를 알고 난 뒤 관심 변화", type: "single" },
    q15: { title: "알코올중독 캐릭터가 '현실적'이려면 필요한 묘사", type: "multi" },
    q16: { title: "중독의 결과로 회복 불가·사망하는 배드엔딩에 대해", type: "single" },
    q17: { title: "보기 힘들거나 거부감이 드는 묘사", type: "multi" },
    q18: { title: "사회운동(혁명·시위) 장면 묘사 수위", type: "single" },
    q19: { title: "구매 의향 (1~5)", type: "scale", lo: "낮음", hi: "높음" },
    q20: { title: "적정 가격 (약 6시간, 정가 기준)", type: "single" },
    q21: { title: "크라우드펀딩에서 관심 있는 리워드", type: "multi" },
    q22: { title: "인디게임 구매 결정에 가장 영향을 주는 것 (2개)", type: "multi" },
    q23: { title: "자유 의견", type: "text" }
  };

  var TARGET_AGES = ["14~16세", "17~19세", "20~23세", "24~26세", "27~29세"];
  var FAN_KEY = OPT.q9[0][0]; // 원작 소설을 읽어봤다
  var PRICE_MID = [2000, 4000, 7000, 10000, 13500, 17500, 22000];
  var PLANNED_PRICE = 12000;

  // ---------- CSV 파서 ----------
  function parseCSV(text) {
    var rows = [], row = [], field = "", q = false, i = 0, c;
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    for (; i < text.length; i++) {
      c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
        else field += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field); rows.push(row); row = []; field = "";
      } else field += c;
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (v) { return v.trim() !== ""; }); });
  }

  // ---------- 응답 정규화 (모든 언어 → 한국어 보기) ----------
  function mapSingle(key, li, val) {
    val = (val || "").trim();
    if (!val) return null;
    var opts = OPT[key][li], idx = opts.indexOf(val);
    if (idx < 0) { // 공백·기호 차이 대비 느슨한 비교
      var norm = function (s) { return s.replace(/[\s~～–\-]/g, ""); };
      for (var k = 0; k < opts.length; k++) if (norm(opts[k]) === norm(val)) { idx = k; break; }
    }
    return idx < 0 ? { other: val } : idx;
  }
  function mapMulti(key, li, val) {
    val = (val || "").trim();
    if (!val) return { idx: [], other: "" };
    var opts = OPT[key][li].map(function (o, i) { return { o: o, i: i }; })
      .sort(function (a, b) { return b.o.length - a.o.length; });
    var rest = val, found = [];
    opts.forEach(function (x) {
      var p = rest.indexOf(x.o);
      if (p >= 0) { found.push(x.i); rest = rest.slice(0, p) + "\u0000" + rest.slice(p + x.o.length); }
    });
    var other = rest.split("\u0000").join(",").split(",").map(function (s) { return s.trim(); }).filter(Boolean).join(", ");
    return { idx: found.sort(function (a, b) { return a - b; }), other: other };
  }

  function normalize(rows) {
    var head = rows[0], data = rows.slice(1);
    var starts = AGE_HEADERS.map(function (h) { return head.indexOf(h); });
    var langCol = head.findIndex(function (h) { return h.indexOf("Language") >= 0 || h.indexOf("언어") >= 0; });
    var out = [];
    data.forEach(function (r) {
      var li = LANGS.indexOf((r[langCol] || "").trim());
      if (li < 0 || starts[li] < 0) return;
      var rec = { lang: LANGS[li] }, s = starts[li];
      ORDER.forEach(function (key, k) {
        var v = r[s + k] || "", t = QMETA[key].type;
        if (t === "scale") { var n = parseInt(v, 10); rec[key] = isNaN(n) ? null : n; }
        else if (t === "single") rec[key] = mapSingle(key, li, v);
        else if (t === "multi") rec[key] = mapMulti(key, li, v);
        else rec[key] = v.trim();
      });
      out.push(rec);
    });
    return out;
  }

  // ---------- 집계 ----------
  function countSingle(recs, key) {
    var n = OPT[key][0].length, c = new Array(n).fill(0), other = [], tot = 0;
    recs.forEach(function (r) {
      var v = r[key];
      if (v === null || v === undefined) return;
      tot++;
      if (typeof v === "number") c[v]++; else other.push(v.other);
    });
    return { counts: c, total: tot, other: other };
  }
  function countMulti(recs, key) {
    var n = OPT[key][0].length, c = new Array(n).fill(0), other = [], tot = 0;
    recs.forEach(function (r) {
      var v = r[key];
      if (!v || (!v.idx.length && !v.other)) return;
      tot++;
      v.idx.forEach(function (i) { c[i]++; });
      if (v.other) other.push(v.other);
    });
    return { counts: c, total: tot, other: other };
  }
  function countScale(recs, key) {
    var c = [0, 0, 0, 0, 0], sum = 0, tot = 0;
    recs.forEach(function (r) {
      var v = r[key];
      if (typeof v === "number" && v >= 1 && v <= 5) { c[v - 1]++; sum += v; tot++; }
    });
    return { counts: c, total: tot, mean: tot ? sum / tot : null };
  }
  function agg(recs, key) {
    var t = QMETA[key].type;
    return t === "scale" ? countScale(recs, key) : t === "multi" ? countMulti(recs, key) : countSingle(recs, key);
  }

  // ---------- 문장 도우미 ----------
  // 조사 자동 선택: J("'성장물'(50%)", "을", "를") → 괄호·따옴표 앞 단어 기준
  function J(str, withB, noB) {
    var w = String(str).trim();
    for (var guard = 0; guard < 5; guard++) {
      var before = w;
      w = w.replace(/\s*\([^()]*\)$/, "").replace(/['"’」』》>\s]+$/, "");
      if (w === before) break;
    }
    var ch = w.charAt(w.length - 1), code = ch.charCodeAt(0), has = false, rieul = false;
    if (code >= 0xac00 && code <= 0xd7a3) { var jong = (code - 0xac00) % 28; has = jong !== 0; rieul = jong === 8; }
    else if (/[013678]/.test(ch)) { has = true; rieul = /[178]/.test(ch); }
    else if (/[a-zA-Z]/.test(ch)) has = /[lmnr]/i.test(ch);
    if (withB === "으로") return str + (has && !rieul ? "으로" : "로");
    return str + (has ? withB : noB);
  }
  function pct(a, b) { return b ? Math.round((a / b) * 100) : 0; }
  function f1(x) { return x === null ? "-" : x.toFixed(2); }
  function label(key, i) { return (SHORT[key] && SHORT[key][i]) || OPT[key][0][i]; }
  function ranked(key, a, exclude) {
    return a.counts.map(function (c, i) { return { i: i, c: c, p: pct(c, a.total), name: label(key, i) }; })
      .filter(function (x) { return x.c > 0 && (!exclude || exclude.indexOf(x.i) < 0); })
      .sort(function (x, y) { return y.c - x.c || x.i - y.i; });
  }
  function topList(key, a, k, exclude) {
    var r = ranked(key, a, exclude).slice(0, k);
    if (!r.length) return "뚜렷한 응답이 없었습니다";
    return r.map(function (x) { return "'" + x.name + "'(" + x.p + "%)"; }).join(", ");
  }
  function rankOf(key, a, idx) {
    var r = ranked(key, a);
    for (var j = 0; j < r.length; j++) if (r[j].i === idx) return { rank: j + 1, p: r[j].p };
    return { rank: null, p: 0 };
  }
  function nTag(n) { return n < 5 ? " (응답 " + n + "명으로 매우 적어 참고만 하세요)" : n < 10 ? " (응답 " + n + "명으로 적은 편이라 해석에 주의하세요)" : ""; }
  function biggestGap(key, A, B, exclude) {
    var best = null;
    A.counts.forEach(function (c, i) {
      if (exclude && exclude.indexOf(i) >= 0) return;
      var d = pct(c, A.total) - pct(B.counts[i], B.total);
      if (!best || Math.abs(d) > Math.abs(best.d)) best = { i: i, d: d, a: pct(c, A.total), b: pct(B.counts[i], B.total) };
    });
    return best;
  }
  function scaleWord(m) {
    if (m === null) return "응답이 없습니다";
    return m >= 4.2 ? "매우 높은 편" : m >= 3.6 ? "높은 편" : m >= 3.0 ? "보통보다 약간 높은 편" : m >= 2.5 ? "보통보다 약간 낮은 편" : "낮은 편";
  }
  function posNeg(a) { return { pos: pct(a.counts[3] + a.counts[4], a.total), neg: pct(a.counts[0] + a.counts[1], a.total), mid: pct(a.counts[2], a.total) }; }

  // 현재 보고 있는 그룹 이름 (드롭다운 선택에 따라 바뀜)
  var GL = "타깃 전체", IS_DEFAULT = true;
  function HYP(t) { return IS_DEFAULT ? t : ""; }

  // ---------- 문항별 해석 문장 ----------
  function compareText(key, F, N) {
    var t = QMETA[key].type, s = [];
    if (t === "scale") {
      s.push("레미제라블 팬은 평균 " + f1(F.mean) + "점(" + scaleWord(F.mean) + "), 팬이 아닌 응답자는 평균 " + f1(N.mean) + "점(" + scaleWord(N.mean) + ")입니다.");
      if (F.mean !== null && N.mean !== null) {
        var d = F.mean - N.mean;
        s.push(Math.abs(d) >= 0.7 ? "두 그룹의 차이가 " + Math.abs(d).toFixed(2) + "점으로 뚜렷하게 " + (d > 0 ? "팬 쪽이 높습니다." : "팬이 아닌 쪽이 높습니다.")
          : Math.abs(d) >= 0.3 ? "차이는 " + Math.abs(d).toFixed(2) + "점으로 " + (d > 0 ? "팬 쪽이 조금 높습니다." : "팬이 아닌 쪽이 조금 높습니다.")
          : "두 그룹의 차이는 거의 없습니다.");
      }
    } else {
      var ex = key === "q12" || key === "q13" || key === "q17" ? [OPT[key][0].length - 1] : null;
      s.push("레미제라블 팬은 " + topList(key, F, 3, ex) + " 순으로, 팬이 아닌 응답자는 " + topList(key, N, 3, ex) + " 순으로 많이 골랐습니다.");
      var g = F.total && N.total ? biggestGap(key, F, N, ex) : null;
      if (g && Math.abs(g.d) >= 15) s.push("가장 큰 차이는 " + J("'" + label(key, g.i) + "'", "으로", "로") + ", 팬 " + g.a + "% 대 비팬 " + g.b + "% (" + Math.abs(g.d) + "%p 차이)입니다.");
      else if (g) s.push("두 그룹의 응답 분포는 큰 차이 없이 비슷합니다.");
    }
    return s;
  }

  function meaningText(key, F, N, ALL) {
    var s = [], both = !!(F && N && F.total > 0 && N.total > 0);
    switch (key) {
      case "q5": {
        if (!both) { var rA = rankOf("q5", ALL, 11), aA = rankOf("q5", ALL, 3); s.push("My R의 핵심 소재인 '혁명물'은 " + (rA.rank ? rA.rank + "위(" + rA.p + "%)" : "선택 없음") + ", '중독과 회복'은 " + (aA.rank ? aA.rank + "위(" + aA.p + "%)" : "선택 없음") + "입니다."); break; }
        var revF = rankOf("q5", F, 11), revN = rankOf("q5", N, 11), addF = rankOf("q5", F, 3), addN = rankOf("q5", N, 3);
        s.push("My R의 핵심 소재인 '혁명물'은 팬 그룹에서 " + (revF.rank ? revF.rank + "위(" + revF.p + "%)" : "선택 없음") + ", 비팬 그룹에서 " + (revN.rank ? revN.rank + "위(" + revN.p + "%)" : "선택 없음") + "이고, '중독과 회복'은 팬 " + (addF.rank ? addF.rank + "위(" + addF.p + "%)" : "선택 없음") + ", 비팬 " + (addN.rank ? addN.rank + "위(" + addN.p + "%)" : "선택 없음") + "입니다.");
        if (revN.p >= 25 || addN.p >= 25) s.push("팬덤 밖에서도 4명 중 1명 이상이 이 소재를 직접 골랐으므로, 소재 자체가 일반 유저에게도 통할 가능성이 있습니다.");
        else if (revF.p >= 25 && revN.p <= 20) s.push("혁명 소재는 레미제라블 팬 사이에서는 강하지만, 일반 유저에게는 스스로 찾는 소재가 아닙니다. 일반 유저에게는 소재보다 관계성·성장 같은 보편적인 매력을 앞에 내세우는 편이 안전합니다.");
        else s.push("두 소재 모두 사전 선호도가 높지는 않습니다. 소재를 전면에 내세우기보다는, 소개를 본 뒤의 반응(아래 'My R 의견' 파트)과 함께 판단하는 것이 좋습니다.");
        break;
      }
      case "q6": {
        var m = ALL.mean;
        s.push(m === null ? "" : m >= 3.5 ? GL + " 평균이 " + f1(m) + "점으로, 사건이 진행되고 목표에 다가가는 전개를 더 선호합니다. 에피소드마다 '그랑테르가 변할 수 있는가'라는 목표에 가까워지는 장면을 분명히 보여주는 것이 중요합니다."
          : m <= 2.5 ? GL + " 평균이 " + f1(m) + "점으로, 캐릭터와의 일상과 관계가 깊어지는 전개를 더 선호합니다. 개그·일상 파트를 줄이기보다 관계 변화가 드러나는 장면으로 채우는 것이 좋습니다."
          : GL + " 평균이 " + f1(m) + "점으로, 일상·관계와 사건 진행을 균형 있게 원합니다. 일상 장면도 목표(금주·혁명)와 연결되도록 배치하면 두 취향을 모두 만족시킬 수 있습니다.");
        break;
      }
      case "q7": {
        var r = ranked("q7", ALL, [10]).slice(0, 3).map(function (x) { return x.i; });
        var tips = {
          0: "목표와 무관한 장면이 길어지지 않도록 에피소드마다 금주·혁명 목표의 진전을 보여주세요.",
          1: "초반부터 떡밥과 단서를 꾸준히 배치해 다음 전개에 대한 궁금증을 유지하세요.",
          2: "질병·혁명·가상의 법 같은 낯선 용어가 많은 만큼 툴팁·사전·칸만화 탭을 처음부터 눈에 띄게 안내하세요.",
          3: "같은 갈등이 반복된다고 느끼지 않도록 재발 장면마다 새로운 변화나 정보가 있게 하세요.",
          4: "대사 위주의 짧은 호흡을 유지하고 지문을 줄이세요.",
          5: "부담 없이 고를 수 있는 '진짜 자유로운 선택지'를 홍보 포인트로 강조할 만합니다.",
          6: "공략 없이도 엔딩에 도달할 수 있도록 엔딩 힌트·분기 표시를 고려하세요.",
          7: "미니게임 난이도를 개인 실력에 맞게 조절할 수 있다는 점과 색약 등 접근성을 고려한 UI를 안내에서 강조하세요.",
          8: "트레일러·데모에서 스토리 톤을 정확히 보여줘 취향이 맞는 사람이 유입되게 하세요.",
          9: "끊어서 해도 흐름이 이어지도록 툴팁·사전으로 등장인물과 설정을 다시 확인할 수 있다는 점을 강조하세요."
        };
        s.push(GL + "에서 그만두는 가장 큰 이유는 " + topList("q7", ALL, 3, [10]) + "입니다.");
        r.forEach(function (i) { if (tips[i]) s.push(tips[i]); });
        break;
      }
      case "q8": {
        var top = ranked("q8", ALL)[0];
        if (top) s.push("가장 많이 선택된 엔딩 수는 '" + top.name + "'(" + top.p + "%)입니다. 현재 My R의 엔딩은 6개(배드 3, 노말 2, 진엔딩 1)로 " + (top.i === 2 ? "선호 구간과 정확히 일치합니다." : top.i > 2 ? "선호보다 적은 편이라, 스트레치 골·외전으로 엔딩을 늘리는 것이 호응을 얻을 수 있습니다." : "선호보다 많은 편이라, 엔딩 수보다 진엔딩까지의 길 안내가 더 중요합니다."));
        break;
      }
      case "q10": {
        var pn = posNeg(ALL);
        s.push(GL + "로 보면 4~5점을 준 비율이 " + pn.pos + "%, 1~2점이 " + pn.neg + "%입니다. " + (pn.pos >= 60 ? "소개만으로도 관심을 끄는 힘이 충분합니다." : pn.pos >= 40 ? "관심층이 확실히 존재하지만, 소개 방식을 다듬으면 더 넓힐 여지가 있습니다." : "소개만으로는 관심을 끌기 어려워, 비주얼 자료(트레일러·데모)가 꼭 필요합니다."));
        break;
      }
      case "q11": {
        if (!both) { var aa = posNeg(ALL); s.push(GL + "에서 '흥미롭다'(4~5점)는 " + aa.pos + "%, '거부감'(1~2점)은 " + aa.neg + "%입니다."); break; }
        var a = posNeg(ALL), b = posNeg(N);
        s.push(GL + "에서 '흥미롭다'(4~5점)는 " + a.pos + "%, '거부감'(1~2점)은 " + a.neg + "%입니다. 레미제라블 팬이 아닌 응답자만 보면 흥미 " + b.pos + "%, 거부감 " + b.neg + "%입니다.");
        s.push(b.pos > b.neg ? "팬덤 밖에서도 흥미가 거부감보다 커서, '알코올중독자 × 혁명가'라는 조합은 진입 장벽이 아니라 차별점으로 작동하고 있습니다." + HYP(" (가설 H2 지지)") : "팬덤 밖에서는 거부감이 흥미보다 크거나 비슷합니다. 소재를 전면에 내세우기보다 성장·관계 서사로 먼저 끌어들이는 전략이 필요합니다.");
        break;
      }
      case "q12": {
        s.push(GL + "에서 가장 끌리는 점은 " + topList("q12", ALL, 3, [11]) + "입니다. 상위 항목을 홍보 문구·트레일러의 첫 장면에 배치하는 것을 추천합니다.");
        break;
      }
      case "q13": {
        var none = pct(ALL.counts[8], ALL.total), has13 = ranked("q13", ALL, [8]).length;
        s.push("망설여지는 점이 '없음'이라고 답한 비율은 " + none + "%입니다. " + (has13 ? "망설임 요인 상위는 " + topList("q13", ALL, 3, [8]) + "입니다." : "다른 망설임 요인을 고른 사람은 없었습니다."));
        break;
      }
      case "q14": {
        if (!both) { s.push("레미제라블 모티브를 알고 관심이 높아진 비율은 " + pct(ALL.counts[0] + ALL.counts[1], ALL.total) + "%, 낮아진 비율은 " + pct(ALL.counts[3] + ALL.counts[4], ALL.total) + "%입니다."); break; }
        var upF = pct(F.counts[0] + F.counts[1], F.total), upN = pct(N.counts[0] + N.counts[1], N.total), dnN = pct(N.counts[3] + N.counts[4], N.total);
        s.push("레미제라블 모티브를 알고 관심이 높아진 비율은 팬 " + upF + "%, 비팬 " + upN + "%이고, 비팬 중 관심이 낮아진 비율은 " + dnN + "%입니다.");
        s.push(upN >= 30 && dnN < 15 ? "원작을 깊이 모르는 사람에게도 레미제라블은 플러스 요인이므로, 홍보에서 원작 모티브를 밝혀도 좋습니다." : dnN >= 20 ? "비팬 일부에게는 원작 언급이 오히려 부담으로 작용합니다. 일반 홍보에서는 원작을 부제 수준으로만 언급하는 것이 안전합니다." : "비팬에게 원작 언급은 큰 영향을 주지 않습니다. 팬덤 대상 홍보에서만 강조해도 충분합니다.");
        break;
      }
      case "q15": {
        s.push("유저가 생각하는 '현실적인 알코올중독' 묘사의 핵심은 " + topList("q15", ALL, 3) + "입니다. 음주 장면 자체보다 결과와 과정이 상위라면, 15세 등급 안에서도 현실감을 충분히 살릴 수 있다는 근거가 됩니다.");
        break;
      }
      case "q16": {
        var acc = pct(ALL.counts[0] + ALL.counts[1], ALL.total), hint = pct(ALL.counts[2], ALL.total), avoid = pct(ALL.counts[3], ALL.total);
        s.push("배드엔딩에서 회복 불가·사망 결말을 '오히려 끌린다' 또는 '필요하다면 괜찮다'고 답한 비율은 " + acc + "%, '암시 정도라면 괜찮다'는 " + hint + "%, '피하고 싶다'는 " + avoid + "%입니다.");
        s.push(acc >= 60 ? "다수가 수용하므로 현재 배드엔딩 구성을 유지해도 됩니다." + HYP(" (가설 H7 지지)") : acc + hint >= 70 ? "수용 의사는 있지만 직접 묘사보다 암시 연출을 선호하는 층이 큽니다. 사망 장면은 암시 위주로 연출하는 것이 안전합니다." : "거부감이 적지 않으므로 콘텐츠 경고와 함께 연출 수위를 낮추는 것을 검토하세요.");
        break;
      }
      case "q17": {
        var noneP = pct(ALL.counts[12], ALL.total);
        s.push("거부감이 드는 묘사가 '없다'는 응답은 " + noneP + "%입니다. 거부감 상위 항목은 " + J(topList("q17", ALL, 3, [12]), "이며", "며") + ", 이 장면들에는 콘텐츠 경고(이미 게임에 있는 기능)를 확실히 붙이는 것이 좋습니다.");
        break;
      }
      case "q18": {
        var direct = pct(ALL.counts[0] + ALL.counts[1], ALL.total), soft = pct(ALL.counts[2] + ALL.counts[3] + ALL.counts[4] + ALL.counts[5], ALL.total), any = pct(ALL.counts[6], ALL.total);
        s.push("시위 장면을 직접적으로 묘사하길 원하는 비율은 " + direct + "%, 절제된 묘사(비폭력·평화·암시·가볍게)를 원하는 비율은 " + soft + "%, 상관없다는 " + any + "%입니다.");
        s.push(direct >= soft ? "충돌과 부상까지 그리는 현재 방향이 유저 기대와 맞습니다. 다만 심의를 고려해 유혈 묘사는 절제하세요." : "절제된 묘사를 원하는 쪽이 많으므로, 과격한 장면은 화면 밖 처리나 암시로 바꾸는 것을 고려하세요.");
        break;
      }
      case "q19": {
        var pn2 = posNeg(ALL), pnN = posNeg(N || ALL);
        s.push("구매 의향 4~5점 비율은 " + GL + " " + pn2.pos + "%" + (both ? ", 비팬 " + pnN.pos + "%" : "") + "입니다. " + (pn2.pos >= 40 ? "목표 기준(40%)을 넘어 구매로 이어질 가능성이 확인됩니다." + HYP(" (가설 H3 지지)") : "목표 기준(40%)에는 못 미쳐, 데모·트레일러로 구매 전환을 높이는 작업이 필요합니다."));
        break;
      }
      case "q20": {
        var cum = 0, med = null;
        for (var i = 0; i < 7; i++) { cum += ALL.counts[i]; if (med === null && cum >= ALL.total / 2) med = i; }
        var est = 0; ALL.counts.forEach(function (c, i) { est += c * PRICE_MID[i]; });
        est = ALL.total ? Math.round(est / ALL.total / 100) * 100 : 0;
        var ok12 = pct(ALL.counts[4] + ALL.counts[5] + ALL.counts[6], ALL.total);
        var mode = ranked("q20", ALL)[0];
        s.push("가장 많이 고른 가격대는 '" + (mode ? mode.name : "-") + "', 중앙값 구간은 '" + (med !== null ? OPT.q20[0][med] : "-") + "', 구간 중간값으로 추정한 평균 적정가는 약 " + est.toLocaleString() + "원입니다. 정가 12,000원 이상을 적정하다고 본 비율은 " + ok12 + "%입니다.");
        s.push(est >= PLANNED_PRICE ? "예정가 12,000원은 유저가 생각하는 적정가 범위 안에 있습니다." : est >= 9000 ? "예정가 12,000원은 유저 기대보다 다소 높습니다. 정가는 유지하되 출시 할인(20~30%)으로 체감가를 9,000원대로 맞추는 방법을 고려하세요." : "예정가 12,000원은 유저 기대보다 꽤 높습니다. 정가 자체를 낮추거나, 콘텐츠 볼륨을 강조하는 홍보가 필요합니다.");
        break;
      }
      case "q21": {
        var no = pct(ALL.counts[5], ALL.total);
        s.push("관심 있는 리워드 상위는 " + topList("q21", ALL, 3, [5]) + "이고, '후원할 생각 없음'은 " + no + "%입니다. 상위 리워드를 펀딩의 주력 구성으로 삼으세요.");
        break;
      }
      case "q22": {
        s.push("구매 결정에 가장 영향을 주는 것은 " + topList("q22", ALL, 3) + "입니다. 초기 핵심 고객 100명 확보(Go-to-market)는 이 채널부터 집중하는 것이 효율적입니다.");
        break;
      }
    }
    return s.filter(Boolean);
  }

  // ---------- 가설 검증 ----------
  function hypotheses(target, older, fans, non) {
    var H = [], a, b, v;
    // H1: 타깃 안에서 4~5점 비율로 판정 (평균은 참고), 나이대별 세부 표 제공
    var t10 = countScale(target, "q10"), o10 = countScale(older, "q10");
    function medianOf(rs) {
      var v = rs.map(function (r) { return r.q10; }).filter(function (x) { return typeof x === "number"; }).sort(function (x, y) { return x - y; });
      var n = v.length; return n ? (n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2) : null;
    }
    function ageRow(name, rs) {
      var c = countScale(rs, "q10");
      return { name: name, n: c.total, counts: c.counts, mean: c.mean, median: medianOf(rs), top2: c.total ? posNeg(c).pos : null };
    }
    var detail = TARGET_AGES.map(function (a) {
      return ageRow(a, target.filter(function (r) { return OPT.age[0][r.age] === a; }));
    }).filter(function (d) { return d.n > 0; });
    var tRow = ageRow("10~20대 전체", target), oRow = ageRow("30세 이상", older);
    var top2 = tRow.top2;
    var h1 = [];
    h1.push("10~20대 " + t10.total + "명 중 My R 관심도 4~5점 비율은 " + (top2 === null ? "-" : top2 + "%") + "(기준 60%)이고, 평균 " + f1(t10.mean) + "점, 중앙값 " + (tRow.median === null ? "-" : tRow.median) + "점입니다.");
    var big = detail.filter(function (d) { return d.n >= 5; }).sort(function (x, y) { return y.top2 - x.top2 || y.n - x.n; });
    if (big.length >= 2) h1.push("응답 5명 이상인 나이대 중에서는 " + big[0].name + "의 4~5점 비율이 " + big[0].top2 + "%로 가장 높고, " + J(big[big.length - 1].name, "이", "가") + " " + big[big.length - 1].top2 + "%로 가장 낮습니다.");
    else h1.push("나이대별로 나누면 응답 5명 이상인 구간이 " + big.length + "개뿐이라 세부 비교는 아직 어렵습니다.");
    if (oRow.n >= 10) h1.push("참고로 30세 이상(" + oRow.n + "명)의 4~5점 비율은 " + oRow.top2 + "%입니다." + (oRow.top2 > top2 + 15 ? " 30세 이상의 관심도도 높으므로 2차 타깃으로 검토할 만합니다." : ""));
    else if (oRow.n) h1.push("30세 이상은 " + oRow.n + "명뿐이라 비교에 쓰지 않았습니다(10명 이상일 때 참고용으로 표시).");
    h1.push("응답자 대부분이 10~20대인 것은 설문을 X(트위터), 게임개발자 오픈채팅, 모두의창업 2기 오픈채팅, 학생게임개발자(10~20대) 디스코드, 지인들에게 배포했기 때문이므로, 응답자 비율 자체는 수요의 근거로 쓰지 않았습니다.");
    H.push({ id: "H1", name: "핵심 고객은 10~20대 스토리 게임 유저다",
      verdict: top2 === null ? "판단 보류" : top2 >= 60 ? "지지" : top2 >= 40 ? "부분 지지" : "기각",
      text: h1.join(" "), table: detail.concat([tRow], oRow.n ? [oRow] : []) });
    a = countScale(target, "q11"); b = countScale(non, "q11");
    var pa = posNeg(a), pb = posNeg(b);
    H.push({ id: "H2", name: "'알코올중독×혁명' 소재에 거부감보다 흥미를 더 느낀다", verdict: pa.pos > pa.neg && pb.pos > pb.neg ? "지지" : pa.pos > pa.neg ? "부분 지지" : "기각",
      text: "타깃 전체 흥미 " + pa.pos + "% 대 거부감 " + pa.neg + "%, 레미제라블 팬을 뺀 응답자 흥미 " + pb.pos + "% 대 거부감 " + pb.neg + "%." });
    a = countScale(target, "q19"); var p20 = countSingle(target, "q20");
    var ok19 = posNeg(a).pos, mode20 = ranked("q20", p20)[0];
    H.push({ id: "H3", name: "계획한 가격(12,000원)에 지불할 의향이 있다", verdict: ok19 >= 40 && mode20 && mode20.i >= 4 ? "지지" : ok19 >= 40 ? "부분 지지" : "기각",
      text: "구매 의향 4~5점 " + ok19 + "%(기준 40%), 가장 많이 고른 가격대는 '" + (mode20 ? mode20.name : "-") + "'(기준: 12,000~15,000원 이상)." });
    var f10 = countScale(fans, "q10"), n10 = countScale(non, "q10"), q14 = countSingle(target, "q14");
    var up = pct(q14.counts[0] + q14.counts[1], q14.total);
    H.push({ id: "H4", name: "레미제라블 팬은 더 관심을 가진다", verdict: f10.mean > n10.mean && up >= 30 ? "지지" : f10.mean > n10.mean ? "부분 지지" : "기각",
      text: "관심도 평균 팬 " + f1(f10.mean) + "점 대 비팬 " + f1(n10.mean) + "점, 원작 모티브를 알고 관심이 높아진 비율 " + up + "%(기준 30%)." });
    a = countScale(target, "q6"); var q7 = countMulti(target, "q7");
    var pa6 = posNeg(a), r7 = ranked("q7", q7, [10]).slice(0, 3).map(function (x) { return x.i; });
    var goal = r7.indexOf(0) >= 0 || r7.indexOf(1) >= 0;
    H.push({ id: "H5", name: "목표를 향해 나아가는 전개를 선호한다", verdict: pa6.pos > pa6.neg && goal ? "지지" : pa6.pos > pa6.neg || goal ? "부분 지지" : "기각",
      text: "전개 방식 4~5점 " + pa6.pos + "% 대 1~2점 " + pa6.neg + "%, 그만둔 이유 상위 3개에 '목표와 무관한 이야기' 또는 '떡밥 없음'이 " + (goal ? "포함됨" : "포함되지 않음") + "." });
    var q8 = countSingle(target, "q8"), m8 = ranked("q8", q8)[0];
    H.push({ id: "H6", name: "선호하는 엔딩 수와 현재 6개 엔딩 비교", verdict: m8 ? (m8.i === 2 ? "일치" : "차이 있음") : "판단 보류",
      text: "가장 많이 고른 엔딩 수는 '" + (m8 ? m8.name : "-") + "'(" + (m8 ? m8.p : 0) + "%)." });
    var q16 = countSingle(target, "q16"), acc = pct(q16.counts[0] + q16.counts[1], q16.total);
    H.push({ id: "H7", name: "중독의 결과까지 다룬 배드엔딩을 받아들인다", verdict: acc >= 60 ? "지지" : acc + pct(q16.counts[2], q16.total) >= 60 ? "부분 지지(암시 조건)" : "기각",
      text: "'오히려 끌린다'+'필요하다면 괜찮다' " + acc + "%(기준 60%), '암시 정도라면 괜찮다'까지 포함하면 " + (acc + pct(q16.counts[2], q16.total)) + "%." });
    return H;
  }

  // ---------- My R 적용 제안 ----------
  function suggestions(target, fans, non) {
    var S = [];
    var f10 = countScale(fans, "q10"), n10 = countScale(non, "q10");
    var nq12 = countMulti(non, "q12"), fq12 = countMulti(fans, "q12");
    var gap = (f10.mean || 0) - (n10.mean || 0);
    S.push({ t: "타깃별 홍보 전략", p: (gap >= 0.7
      ? "레미제라블 팬의 관심도(" + f1(f10.mean) + "점)가 비팬(" + f1(n10.mean) + "점)보다 뚜렷하게 높습니다. 초기 팬층과 텀블벅 후원은 레미제라블 팬덤(X 해시태그, 팬 커뮤니티)에서 먼저 모으고, 그 반응(팬아트·후기)을 일반 유저 홍보의 재료로 쓰는 2단계 전략이 효율적입니다."
      : "레미제라블 팬과 비팬의 관심도 차이가 크지 않습니다(팬 " + f1(f10.mean) + "점, 비팬 " + f1(n10.mean) + "점). 원작 팬덤에만 기대지 않고 처음부터 일반 비주얼노벨 유저를 함께 겨냥해도 됩니다.")
      + " 일반 유저에게는 비팬이 가장 끌린다고 답한 " + J(topList("q12", nq12, 2, [11]), "을", "를") + ", 팬에게는 " + J(topList("q12", fq12, 2, [11]), "을", "를") + " 앞세우세요." });

    var q11 = posNeg(countScale(non, "q11"));
    S.push({ t: "소재 활용", p: q11.pos > q11.neg
      ? "팬덤 밖에서도 '알코올중독자 × 혁명가' 조합에 흥미(" + q11.pos + "%)가 거부감(" + q11.neg + "%)보다 큽니다. 이 조합을 타이틀·썸네일 문구에 그대로 쓰는 것이 차별화에 유리합니다. 사업계획서에서는 '마이너하지만 수요가 확인된 소재'로 제시할 수 있습니다."
      : "팬덤 밖에서는 이 조합에 대한 거부감(" + q11.neg + "%)이 흥미(" + q11.pos + "%)와 비슷하거나 큽니다. 일반 유저 대상 홍보에서는 '성장·회복 이야기'를 먼저 내세우고, 소재는 소개 본문에서 풀어가는 순서가 안전합니다." });

    var q6 = countScale(target, "q6"), q7 = countMulti(target, "q7");
    S.push({ t: "스토리 전개·플레이 편의", p: "전개 선호 평균은 " + f1(q6.mean) + "점이고, 그만두는 이유 상위는 " + topList("q7", q7, 3, [10]) + "입니다. " + meaningText("q7", null, null, q7).slice(1).join(" ") });

    var q16 = countSingle(target, "q16"), q17 = countMulti(target, "q17"), q18 = countSingle(target, "q18");
    var acc = pct(q16.counts[0] + q16.counts[1], q16.total), hint = pct(q16.counts[2], q16.total);
    S.push({ t: "묘사 수위와 심의 대응", p: "회복 불가·사망 배드엔딩 수용률은 " + acc + "%이고, '암시라면 괜찮다'까지 포함하면 " + (acc + hint) + "%입니다. " + (acc >= 60 ? "배드엔딩 구성은 유지하고, " : "사망 장면은 암시 위주로 연출하고, ")
      + "거부감 상위 묘사(" + topList("q17", q17, 2, [12]) + ")에는 콘텐츠 경고를 붙이세요. 이 수치는 게임 심의 상담 때 '유저는 결과 중심의 현실적 묘사를 원한다'는 근거 자료로 활용할 수 있습니다. " + (function () { var d = pct(q18.counts[0] + q18.counts[1], q18.total), soft = pct(q18.counts[2] + q18.counts[3] + q18.counts[4] + q18.counts[5], q18.total); return "시위 장면은 직접적인 묘사를 원하는 비율이 " + d + "%, 절제된 묘사를 원하는 비율이 " + soft + "%로, " + (d >= soft ? "충돌·부상까지 그리는 현재 방향을 유지해도 됩니다." : "과격한 장면은 화면 밖 처리나 암시로 바꾸는 것을 검토하세요."); })() });

    var q20 = countSingle(target, "q20"), est = 0;
    q20.counts.forEach(function (c, i) { est += c * PRICE_MID[i]; });
    est = q20.total ? Math.round(est / q20.total / 100) * 100 : 0;
    var q19n = posNeg(countScale(target, "q19"));
    S.push({ t: "가격 전략", p: "유저가 생각하는 적정가는 평균 약 " + est.toLocaleString() + "원, 구매 의향(4~5점)은 " + q19n.pos + "%입니다. " + (est >= PLANNED_PRICE ? "예정 정가 12,000원은 수용 가능한 범위입니다. 할인 이벤트 여지를 남기려면 정가를 유지하는 것이 좋습니다." : "예정 정가 12,000원은 유저 기대보다 높으므로, 정가는 유지하되 출시 기념 할인으로 체감가를 " + (Math.round(est / 1000) * 1000).toLocaleString() + "원 안팎에 맞추는 방법을 추천합니다. 정가를 처음부터 낮추면 이후 할인 이벤트의 여지가 줄어듭니다.") });

    var q21 = countMulti(target, "q21"), q22 = countMulti(target, "q22");
    S.push({ t: "펀딩 리워드와 홍보 채널", p: "펀딩 리워드는 " + topList("q21", q21, 3, [5]) + " 위주로 구성하고, 홍보는 구매 결정에 영향이 큰 " + topList("q22", q22, 2) + "에 먼저 투자하세요. " + (ranked("q22", q22)[0] && ranked("q22", q22)[0].i === 0 ? "체험판 영향력이 가장 크므로, 펀딩 페이지와 스팀 페이지에 데모 링크를 최우선으로 배치하세요." : "") });

    var q13 = countMulti(target, "q13"), top13 = ranked("q13", q13, [8])[0];
    var fix = { 0: "알코올중독 묘사가 부담스럽지 않도록 개그·회복 장면의 비중을 소개에서 함께 보여주세요.", 1: "혁명 소재가 어렵지 않다는 것을 보여주기 위해 사전·칸만화 탭을 홍보에서 소개하세요.", 2: "스토리가 어렵게 느껴지지 않도록 툴팁·칸만화 같은 이해 보조 기능을 트레일러에서 보여주세요.", 3: "공략 캐릭터가 한 명인 대신 깊이 있는 관계 변화를 강점으로 설명하세요.", 4: "그랑테르의 매력을 보여주는 짧은 장면(속마음 시스템 등)을 SNS에 공개해 보세요.", 5: "보이스 대신 폰트 연출·효과음으로 감정을 살린다는 점을 홍보하고, 스트레치 골로 보이스를 제시하세요.", 6: "그림체 호불호는 일러스트레이터와 상의해 대표 이미지를 다듬는 계기로 삼으세요.", 7: "로맨스보다 성장 드라마 요소를 앞세운 홍보 버전을 따로 준비해 보세요." };
    if (top13) S.push({ t: "약점 대응", p: "가장 많이 꼽힌 망설임 요인은 '" + top13.name + "'(" + top13.p + "%)입니다. " + (fix[top13.i] || "") });
    return S;
  }

  // ---------- 국가(응답 언어)·권역별 ----------
  var LANG_PLACE = { "한국어": "한국", "English": "영어권", "日本語": "일본", "简体中文": "중화권", "Español": "스페인어권", "Français": "프랑스어권" };
  var REGION_DEF = [
    { name: "아시아권", note: "한국어·日本語·简体中文", langs: ["한국어", "日本語", "简体中文"] },
    { name: "서구권", note: "English·Español·Français", langs: ["English", "Español", "Français"] },
    { name: "해외 전체", note: "한국어 외 모든 언어", langs: ["English", "日本語", "简体中文", "Español", "Français"] }
  ];
  function groupStats(rs, isFan) {
    var q10 = countScale(rs, "q10"), q11 = countScale(rs, "q11"), q19 = countScale(rs, "q19");
    var q20 = countSingle(rs, "q20"), q14 = countSingle(rs, "q14"), q12 = countMulti(rs, "q12"), q13 = countMulti(rs, "q13");
    var est = 0; q20.counts.forEach(function (c, i) { est += c * PRICE_MID[i]; });
    var t12 = ranked("q12", q12, [11])[0], t13 = ranked("q13", q13, [8])[0];
    return {
      n: rs.length, fans: rs.filter(isFan).length,
      q10: q10.mean, q11pos: q11.total ? posNeg(q11).pos : null, q19pos: q19.total ? posNeg(q19).pos : null,
      q14up: q14.total ? pct(q14.counts[0] + q14.counts[1], q14.total) : null,
      price: q20.total ? Math.round(est / q20.total / 100) * 100 : null,
      appeal: t12 ? t12.name : (q12.total ? "없음" : null), hesitate: t13 ? t13.name : (q13.total ? "없음" : null)
    };
  }
  function regionStats(rs, isFan) {
    var rows = [];
    LANGS.forEach(function (l) {
      var sub = rs.filter(function (r) { return r.lang === l; });
      if (sub.length) rows.push(Object.assign({ kind: "lang", name: LANG_PLACE[l], note: l }, groupStats(sub, isFan)));
    });
    var regions = [];
    REGION_DEF.forEach(function (g) {
      var present = g.langs.filter(function (l) { return rs.some(function (r) { return r.lang === l; }); });
      if (present.length < 2) return; // 0명이거나 한 언어뿐이면 위 표와 같으므로 생략
      var sub = rs.filter(function (r) { return g.langs.indexOf(r.lang) >= 0; });
      regions.push(Object.assign({ kind: "region", name: g.name, note: present.join("·") }, groupStats(sub, isFan)));
    });
    // 해설 문장
    var text = [], total = rs.length;
    if (!total) return { rows: rows, regions: regions, text: ["응답이 없습니다."] };
    var ko = rows.filter(function (r) { return r.note === "한국어"; })[0];
    var ov = rs.filter(function (r) { return r.lang !== "한국어"; });
    text.push("응답 언어는 " + rows.map(function (r) { return r.name + " " + r.n + "명(" + pct(r.n, total) + "%)"; }).join(", ") + "입니다.");
    if (ov.length) {
      var o = groupStats(ov, isFan);
      text.push("해외 응답 " + ov.length + "명의 My R 관심도 평균은 " + f1(o.q10) + "점, 구매 의향(4~5점)은 " + (o.q19pos === null ? "-" : o.q19pos + "%") +
        (ko ? "이며, 한국 응답(관심도 " + f1(ko.q10) + "점, 구매 의향 " + (ko.q19pos === null ? "-" : ko.q19pos + "%") + ")과 비교할 수 있습니다." : "입니다."));
      if (ov.length < 10) text.push("해외 응답이 " + ov.length + "명뿐이라 국가별 차이를 결론 내리기는 이릅니다. 킥스타터·스팀 해외 출시를 판단하려면 해외 커뮤니티에 설문을 더 배포해 최소 10~20명 이상을 모으는 것이 좋습니다.");
      else {
        var d = (o.q10 || 0) - (ko && ko.q10 || 0);
        text.push(Math.abs(d) < 0.3 ? "해외와 한국의 관심도가 비슷하므로, 해외 출시(킥스타터·스팀 다국어)도 국내와 같은 강도로 준비할 만합니다." : d > 0 ? "해외 관심도가 한국보다 높습니다. 다국어 지원과 킥스타터 펀딩의 우선순위를 높일 근거가 됩니다." : "해외 관심도가 한국보다 낮습니다. 국내 출시를 먼저 안정시키고, 해외는 데모·트레일러로 반응을 본 뒤 확장하는 순서가 안전합니다.");
      }
    } else text.push("아직 해외 응답이 없습니다.");
    return { rows: rows, regions: regions, text: text };
  }

  // ---------- 전체 분석 ----------
  function analyze(csvText) {
    var rows = parseCSV(csvText);
    var recs = normalize(rows);
    var ageName = function (r) { return typeof r.age === "number" ? OPT.age[0][r.age] : null; };
    var isTarget = function (r) { return TARGET_AGES.indexOf(ageName(r)) >= 0; };
    var target = recs.filter(isTarget);
    var older = recs.filter(function (r) { return ageName(r) === "30세 이상"; });
    var isFan = function (r) { return r.q9 && r.q9.idx.indexOf(0) >= 0; };
    var fans = target.filter(isFan), non = target.filter(function (r) { return !isFan(r); });

    // ---- 드롭다운 보기 목록 (응답 0명인 항목은 제외) ----
    var VIEWS = [{ id: "target", group: "연령대", label: "10~20대 전체", gl: "10~20대 전체", filter: isTarget },
                 { id: "allages", group: "연령대", label: "전체 연령", gl: "전체 연령", filter: function () { return true; } }];
    OPT.age[0].forEach(function (a, i) {
      VIEWS.push({ id: "age" + i, group: "연령대", label: a, gl: a + " 응답자", filter: function (r) { return r.age === i; } });
    });
    LANGS.forEach(function (l, i) {
      VIEWS.push({ id: "lang" + i, group: "국가 (응답 언어, 전체 연령)", label: LANG_PLACE[l] + " (" + l + ")", gl: LANG_PLACE[l] + " 응답자", filter: function (r) { return r.lang === l; } });
    });
    REGION_DEF.forEach(function (g, i) {
      var present = g.langs.filter(function (l) { return recs.some(function (r) { return r.lang === l; }); });
      if (present.length < 2) return;
      VIEWS.push({ id: "region" + i, group: "권역 (전체 연령)", label: g.name + " (" + present.join("·") + ")", gl: g.name + " 응답자", filter: function (r) { return g.langs.indexOf(r.lang) >= 0; } });
    });
    VIEWS.forEach(function (v) { v.n = recs.filter(v.filter).length; });
    VIEWS = VIEWS.filter(function (v) { return v.n > 0 || v.id === "target"; });

    function block(sub, keys, split) {
      var F = sub.filter(isFan), N = sub.filter(function (r) { return !isFan(r); });
      return keys.map(function (key) {
        var ALL = agg(sub, key), Fa = agg(F, key), Na = agg(N, key);
        var text = [], sp = split && Fa.total > 0 && Na.total > 0;
        if (sp) text = compareText(key, Fa, Na);
        else if (split && !ALL.total) text.push("응답이 없습니다.");
        else if (split) text.push(QMETA[key].type === "scale" ? GL + " 평균은 " + f1(ALL.mean) + "점(" + scaleWord(ALL.mean) + ")입니다." : GL + "에서 " + topList(key, ALL, 3) + " 순으로 많았습니다.");
        else if (QMETA[key].type === "scale") text = [GL + " 평균은 " + f1(ALL.mean) + "점(" + scaleWord(ALL.mean) + ")입니다."];
        else text = [GL + "에서 " + topList(key, ALL, 3) + " 순으로 많았습니다."];
        text = text.concat(meaningText(key, Fa, Na, ALL));
        return { key: key, title: QMETA[key].title, type: QMETA[key].type, meta: QMETA[key], split: sp,
          labels: OPT[key] ? OPT[key][0].map(function (_, i) { return label(key, i); }) : ["1", "2", "3", "4", "5"],
          all: ALL, fan: Fa, non: Na, text: text };
      });
    }
    function view(id) {
      var v = VIEWS.filter(function (x) { return x.id === id; })[0] || VIEWS[0];
      var sub = recs.filter(v.filter), F = sub.filter(isFan);
      GL = v.gl; IS_DEFAULT = v.id === "target";
      var langCount = {}; sub.forEach(function (r) { langCount[r.lang] = (langCount[r.lang] || 0) + 1; });
      var out = {
        id: v.id, label: v.label, gl: v.gl,
        counts: { n: sub.length, fans: F.length, non: sub.length - F.length, langs: langCount },
        single: !F.length ? "nofan" : F.length === sub.length ? "allfan" : null,
        profile: block(sub, ["age", "q3", "q31", "q4", "q9"], false),
        taste: block(sub, ["q5", "q6", "q7", "q8"], true),
        opinion: block(sub, ["q10", "q11", "q12", "q13", "q14", "q15", "q16", "q17", "q18", "q19", "q20", "q21", "q22"], true)
      };
      GL = "타깃 전체"; IS_DEFAULT = true;
      return out;
    }

    var regions = { all: regionStats(recs, isFan), target: regionStats(target, isFan) };
    var comments = recs.filter(function (r) { return r.q23; }).map(function (r) { return { lang: r.lang, text: r.q23, fan: isFan(r), target: isTarget(r) }; });
    var langCount = {}; recs.forEach(function (r) { langCount[r.lang] = (langCount[r.lang] || 0) + 1; });
    var def = view("target");
    return {
      counts: { total: recs.length, target: target.length, fans: fans.length, non: non.length, older: older.length, excluded: recs.length - target.length, langs: langCount },
      notes: { fans: nTag(fans.length), non: nTag(non.length) },
      views: VIEWS.map(function (v) { return { id: v.id, group: v.group, label: v.label, n: v.n }; }),
      view: view,
      profile: def.profile, taste: def.taste, opinion: def.opinion,
      hypotheses: hypotheses(target, older, fans, non),
      suggestions: suggestions(target, fans, non),
      regions: regions,
      comments: comments
    };
  }

  var API = { analyze: analyze, parseCSV: parseCSV, LANGS: LANGS };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else root.MyRAnalysis = API;
})(this);
