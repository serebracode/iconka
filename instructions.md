# instructions.md — рабочая инструкция Iconka

Этот файл описывает **текущее состояние проекта** и порядок безопасной работы с ним.

Он заменяет старую инструкцию ранней версии Iconka, где проект ещё был каталогом из 10 икон с embedded fallback-данными.

Сейчас это уже не так.

---

## 1. Главный принцип

Текущий `main` считается рабочим baseline.

На ближайшем этапе проект в основном **наполняется новыми иконами**.

Поэтому правило простое:

> Если задачу можно решить данными и assets — не менять runtime.

Не рефакторить `index.html`, не перестраивать архитектуру, не трогать жесты, Candle Mode, загрузчик и навигацию без отдельного запроса.

Для AI/coding-agent обязательны правила из:

`AGENTS.md`

Перед изменением сложной сцены обязательно читать:

`docs/icon-screen-layers.md`

---

## 2. Текущее состояние проекта

Текущая пользовательская версия: **1.0**.

На момент обновления документации:

- в `data/icons.json` — 18 икон;
- приложение работает как Telegram Mini App и обычная web-страница;
- runtime находится в `index.html`;
- каталог сортируется по алфавиту;
- есть поиск;
- есть swipe между иконами;
- есть double-tap zoom ×2 и pan;
- есть Info;
- есть Share;
- есть отдельный экран «О проекте»;
- есть сложный режим свечи;
- есть progressive image loading;
- планшет ориентирован на landscape;
- телефон — на portrait.

Ближайшая задача — добавить ещё примерно десяток икон, не меняя работу приложения.

---

## 3. Приоритет источников правды

Если документы и код расходятся, использовать такой порядок:

1. `main/index.html`
2. `main/data/icons.json`
3. реальные assets в `icons/`
4. `docs/icon-screen-layers.md`
5. `AGENTS.md`
6. `README.md`
7. этот файл

README и эта инструкция теперь актуализированы, но runtime всё равно остаётся окончательной технической истиной.

---

## 4. Структура проекта

```text
iconka/
├── AGENTS.md
├── README.md
├── instructions.md
├── index.html
│
├── data/
│   ├── icons.json
│   └── IMAGE_SOURCES.md
│
├── docs/
│   ├── icon-screen-layers.md
│   └── candle-baseline.md
│
├── icons/
│   ├── *.jpg
│   ├── preview/
│   │   └── *_preview.jpg
│   ├── loading/
│   │   └── *_loading.jpg
│   ├── candle/
│   └── png/
│
├── id/
│   ├── iconka_icon.svg
│   ├── iconka_logotype.svg
│   ├── iconka_candle.svg
│   └── iconka_noicon.svg
│
├── video/
│   ├── candle-body.png
│   ├── OgonALpha.webm
│   └── ...
│
└── images/
```

---

## 5. Что находится в index.html

`index.html` содержит весь основной UI и runtime:

- CSS;
- экран запуска;
- каталог;
- экран About;
- экран иконы;
- Info;
- Candle Mode;
- Telegram integration;
- progressive loading;
- zoom;
- swipe;
- responsive/orientation logic;
- Share;
- навигацию.

На текущем этапе это **замороженная зона** для обычного наполнения каталога.

Добавление новой иконы не должно требовать изменения `index.html`.

---

## 6. Экраны приложения

### 6.1. Launch screen

Стартовый экран:

- показывается при запуске/перезагрузке;
- содержит icon + logotype;
- показывает «Коснитесь, чтобы начать» сразу;
- переходит в каталог по касанию;
- имеет резервный auto-enter примерно через 5 секунд.

После входа этот экран не используется как обычный пункт навигации.

### 6.2. Catalog

Каталог:

- читает `data/icons.json`;
- сортирует иконы через `localeCompare()`;
- фильтрует поиск по `title`;
- показывает preview 48×48;
- использует lazy loading;
- выводит «О проекте · Версия 1.0».

Порядок записей в JSON не равен порядку отображения.

### 6.3. About

Экран «О проекте»:

- отдельный screen;
- содержит icon, logotype и версию;
- содержит короткое описание проекта;
- содержит авторство и © 2026;
- из About возврат ведёт в каталог.

### 6.4. Detail

Экран иконы содержит:

- изображение;
- название;
- дату;
- Share;
- кнопку «Режим свечи»;
- Info;
- свайп между иконами;
- zoom.

### 6.5. Info

Info открывается внутри detail screen.

Показывает:

- title;
- date;
- description;
- author;
- size;
- material/technique;
- location;
- source/credit;
- About link;
- version.

При скролле работают верхняя и нижняя fade-шторки.

---

## 7. Источник данных

Основные данные:

`data/icons.json`

Runtime загружает JSON так:

```js
const response = await fetch('./data/icons.json');
const data = await response.json();
ICONS_DATA = Array.isArray(data.icons) ? data.icons : [];
```

### Важно

Старого embedded fallback-массива с «всеми 10 иконами» больше нет.

Если JSON не загрузился:

```js
ICONS_DATA = [];
```

Поэтому **не добавлять fallback обратно**, ориентируясь на старую документацию или старые коммиты.

---

## 8. Схема записи иконы

Типичная современная запись:

```json
{
  "id": 21,
  "title": "Название иконы",
  "title_short": "Короткое название",
  "image": "./icons/example.jpg",
  "loading_image": "./icons/loading/example_loading.jpg?v=<cache-key>",
  "image_source": "https://example.com/source",
  "image_source_label": "Изображение: Source",
  "image_credit": "Автор / коллекция / лицензия",
  "author_full": "Автор",
  "date": "Дата",
  "material": "Материал и техника",
  "size": "Размер",
  "location": "Местонахождение",
  "description_full": "Описание",
  "rights": "Права / источник"
}
```

Не все поля обязательны.

---

## 9. Поля JSON

### id

Уникальный numeric ID.

Правила:

- не использовать существующий ID;
- не менять старые ID;
- не устранять пропуски;
- не перенумеровывать каталог;
- выбирать следующий свободный ID осознанно.

Существующие пропуски — нормальны.

### title

Полное название.

Используется в:

- поиске;
- сортировке;
- Info;
- Share.

### title_short

Короткая подпись для компактных UI-состояний.

Если отсутствует, используется `title`.

### image

Главный JPG:

```text
./icons/<slug>.jpg
```

Используется как основной detail image.

### loading_image

Микрокопия полного изображения:

```text
./icons/loading/<slug>_loading.jpg?v=<cache-key>
```

Используется progressive loader и swipe-preload.

### preview_image

Необязательный явный путь к preview.

Если его нет, catalog автоматически строит путь из `image`:

```text
icons/<slug>.jpg
→
icons/preview/<slug>_preview.jpg
```

### candle_image

Необязательная отдельная версия изображения для Candle Mode.

Если отсутствует:

```js
icon.candle_image || icon.image
```

То есть Candle Mode использует обычный `image`.

### cutout_master

Необязательный alpha-master для масок и projection.

Если отсутствует, runtime использует candle image.

Нельзя брать alpha-master от другой иконы.

### image_source

URL источника изображения.

Если указан, Info выводит ссылку.

### image_source_label

Текст ссылки на источник.

Нужен, если стандартное «Изображение: Wikimedia Commons» неверно.

### image_credit

Авторство / коллекция / лицензия.

### author_full

Автор или мастерская.

Если достоверно неизвестно — не угадывать.

### date

Дата или период.

### material

Материал / техника.

### size

Размер.

### location

Текущее местонахождение произведения.

### description_full

Короткое содержательное описание.

Не превращать его в богословский трактат или рекламный текст.

### rights

Информация о правах, лицензии или источнике.

---

## 10. Именование файлов

Использовать:

- lowercase;
- ASCII;
- snake_case;
- стабильный slug.

Пример:

```text
nikolay_mozhayskiy.jpg
nikolay_mozhayskiy_preview.jpg
nikolay_mozhayskiy_loading.jpg
```

После публикации не переименовывать без причины.

---

## 11. Основное изображение

Путь:

```text
icons/<slug>.jpg
```

Требования:

- показывать произведение целиком в выбранной композиции;
- не менять CSS ради одной картинки;
- не тянуть изображение;
- не искажать пропорции;
- не обрезать только ради унификации;
- не заменять существующие файлы при добавлении нового контента.

---

## 12. Catalog preview

Путь:

```text
icons/preview/<slug>_preview.jpg
```

Задача preview — работать в квадратной ячейке каталога.

UI уже использует:

- контейнер 48×48;
- `object-fit: cover`;
- небольшое увеличение `scale(1.1)`.

Если preview выглядит плохо:

> исправлять preview, а не CSS каталога.

Не менять list layout ради одной новой иконы.

---

## 13. Loading image

Путь:

```text
icons/loading/<slug>_loading.jpg
```

Это **не catalog preview**.

Loading image должен:

- содержать всю композицию иконы;
- иметь ту же пропорцию, что основной `image`;
- быть микрокопией примерно 48 px по длинной стороне;
- позволять построить пиксельные стадии 12 → 24 → 48 px.

Если loading image отличается композицией от основного JPEG, при загрузке появляется визуальный скачок.

---

## 14. Progressive loading

Точка входа:

`populateIconDetails()`

Далее:

`showIconProgressively()`

Логика:

1. определяется `loading_image`;
2. она декодируется;
3. canvas строит последовательность 12 → 24 → 48 px;
4. изображения показываются с pixelated rendering;
5. одновременно грузится полный `image`;
6. после decode полный JPEG заменяет LQIP;
7. token-проверки не дают старому async request перезаписать новую икону.

### Нельзя

- удалять cancellation tokens;
- менять `src` из другой async-цепочки без проверки;
- использовать квадратный preview вместо loading image;
- позволять полному JPEG поздно перезаписать Candle Mode.

При входе в Candle Mode progressive loading отменяется намеренно.

---

## 15. Swipe

Иконы свайпа используют тот же алфавитный порядок, что каталог:

```js
[...ICONS_DATA].sort((a, b) => a.title.localeCompare(b.title))
```

Перед переходом:

- прогреваются соседние loading previews;
- новая миниатюра ожидается до ограниченного timeout;
- текущая карточка клонируется;
- новая карточка размещается за краем;
- затем обе карточки анимируются;
- transition длится около 320 ms.

### Критический нюанс

Временный clone сохраняет дочерние `id` намеренно.

Не «исправлять» это как плохой HTML во время рефакторинга: текущие ID selectors задают точный размер клона.

---

## 16. Zoom

Текущая механика:

- double tap — zoom ×2;
- второй double tap / toggle — reset;
- при zoom включается pan;
- перемещение ограничено;
- во время zoom скрываются обычные UI-элементы;
- zoom блокирует swipe;
- Candle Mode и Info сбрасывают/блокируют zoom.

Не менять gesture thresholds или touch routing при добавлении контента.

---

## 17. Info

Info не отдельная страница — это состояние `#detailContent`.

При открытии:

- zoom сбрасывается;
- scrollTop → 0;
- меняется высота icon section;
- свечная кнопка скрывается;
- Info button становится close button;
- рассчитываются fade-шторки.

`updateInfoScrollFades()` проверяет реальную прокрутку, а не таймеры.

---

## 18. Share

`shareIcon()`:

1. использует `navigator.share()`;
2. если его нет — использует Telegram share fallback.

Share содержит:

- title;
- текст с названием иконы;
- текущий URL.

---

## 19. Candle Mode

Candle Mode — наиболее хрупкая часть приложения.

Перед любой правкой читать:

`docs/icon-screen-layers.md`

### Вход

`showCandle()`

При входе:

- блокируется переход во время swipe;
- закрывается Info;
- сбрасывается zoom;
- включается wake lock;
- отменяется progressive loading;
- detail image переключается на `candle_image || image`;
- вычисляется масштаб;
- пересчитывается геометрия эффектов;
- запускается atmosphere animation;
- запускается видео пламени;
- запускается flame-synchronized shade;
- скрываются обычные кнопки.

### Выход

`closeCandle()`

При выходе:

- выключаются анимации;
- освобождается wake lock;
- Candle classes снимаются;
- кнопки возвращаются;
- после transition основной `image` возвращается.

---

## 20. Слои Candle Mode

Полная карта находится в:

`docs/icon-screen-layers.md`

В упрощённом виде используются:

- background;
- ambient;
- icon projection;
- icon shadow;
- base icon;
- ochre filter;
- edge shade;
- top shade;
- icon light;
- alpha-bound darkening;
- surface light;
- flame ambient;
- vignette;
- flame halo;
- back halo;
- flicker shade;
- haze;
- flame glow;
- candle body;
- flame video;
- foreground veil;
- foreground edge shade.

Это система, а не набор независимых декоративных div.

Не менять один слой «на глаз», не проверив последствия для остальных.

---

## 21. Alpha и projection

Для икон со специальными transparent assets:

- `candle_image` может быть отдельным WebP;
- `cutout_master` может быть PNG с настоящей alpha;
- эта alpha используется для масок и проекции.

Нельзя:

- подставлять PNG другой иконы;
- использовать прямоугольник вместо реальной alpha;
- обрезать projection-container точно по alpha bounds;
- уменьшать запас под blur.

Blur должен иметь пространство, иначе тень режется рамкой.

---

## 22. Ориентация и responsive

Runtime рассчитывает stage через:

- Telegram `viewportStableHeight`;
- `visualViewport`;
- текущий viewport.

Основные layout-значения обновляются через CSS variables.

### Телефон

Предпочтительный режим — portrait.

### Планшет

Предпочтительный режим — landscape.

Runtime пытается использовать:

- Telegram `lockOrientation()`;
- Screen Orientation API.

Не менять эту политику при добавлении контента.

---

## 23. Общая колонка

Основная контентная ширина:

```css
--content-column-width: 560px;
```

Каталог, Info и About используют согласованную колонку и горизонтальные отступы.

Не исправлять отдельный текст увеличением общей ширины.

---

## 24. Telegram integration

При наличии Telegram WebApp runtime:

- `ready()`;
- `expand()`;
- пытается `requestFullscreen()`;
- `disableVerticalSwipes()`;
- задаёт header/background;
- работает с BackButton;
- слушает viewport changes;
- слушает fullscreen changes;
- слушает safe-area changes;
- применяет theme params.

В обычном браузере приложение должно деградировать без ошибок.

---

## 25. Current assets Candle Mode

Основные runtime-assets:

```text
video/candle-body.png
video/OgonALpha.webm
```

В папке `video/` есть и другие исторические/рабочие assets.

Не удалять их во время content-only задачи только потому, что они кажутся неиспользуемыми.

---

## 26. Как добавить новую икону — безопасный workflow

### Шаг 1. Выбрать произведение

Проверить:

- это действительно икона, подходящая концепции проекта;
- качество изображения;
- источник;
- права;
- авторство;
- музей/коллекцию;
- дату;
- технику;
- размер.

Если часть данных неизвестна — это нормально.

Не заполнять пробелы фантазией.

### Шаг 2. Подготовить main image

```text
icons/<slug>.jpg
```

### Шаг 3. Подготовить preview

```text
icons/preview/<slug>_preview.jpg
```

### Шаг 4. Подготовить loading image

```text
icons/loading/<slug>_loading.jpg
```

С той же композицией и пропорцией, что main.

### Шаг 5. Добавить JSON record

Добавить только новую запись.

Не форматировать весь файл заново без необходимости.

### Шаг 6. Проверить ID

ID уникален.

Старые ID не менялись.

### Шаг 7. Проверить credits

Если есть source URL:

- `image_source`;
- `image_source_label` при необходимости;
- `image_credit`;
- `rights`.

### Шаг 8. Проверить приложение

См. validation checklist ниже.

---

## 27. Специальная candle-версия новой иконы

По умолчанию **не нужна**.

Если обычный JPG работает нормально, достаточно его.

Специальные:

```text
icons/candle/<slug>.webp
icons/png/<slug>.png
```

добавляются только если есть реальная необходимость и они подготовлены правильно.

Не создавать пустые или фиктивные пути «на будущее».

---

## 28. Validation checklist новой иконы

Перед merge/push проверить:

- [ ] `data/icons.json` валиден;
- [ ] ID уникален;
- [ ] main image существует;
- [ ] preview существует;
- [ ] loading image существует;
- [ ] все относительные пути корректны;
- [ ] preview соответствует нужной иконе;
- [ ] loading image соответствует main image;
- [ ] пропорции loading/main совпадают;
- [ ] название ищется через Search;
- [ ] catalog thumbnail не падает в placeholder;
- [ ] detail открывает нужную икону;
- [ ] progressive loader не показывает чужую икону;
- [ ] swipe в обе стороны работает;
- [ ] zoom работает;
- [ ] Info открывается;
- [ ] metadata выводятся корректно;
- [ ] source/credit корректны;
- [ ] Candle Mode открывается;
- [ ] Candle Mode закрывается;
- [ ] после Candle Mode возвращается правильный main image;
- [ ] соседние старые иконы работают;
- [ ] `index.html` не изменился в content-only задаче;
- [ ] unrelated files не изменились.

---

## 29. Проверка batch из нескольких икон

Для партии из 5–15 икон желательно дополнительно проверить программно:

- JSON parsing;
- duplicate IDs;
- duplicate slugs;
- missing main assets;
- missing previews;
- missing loading images;
- неправильные extensions;
- пустые обязательные строки;
- source URL format;
- соответствие derived preview path.

После автоматической проверки всё равно нужен визуальный smoke test нескольких новых записей.

---

## 30. Git workflow

### Документация

Чистое изменение документации можно делать напрямую в `main`, если пользователь это явно попросил.

### Контент

Для партии новых икон по умолчанию:

1. создать отдельную branch;
2. добавить только нужные assets и JSON records;
3. проверить diff;
4. убедиться, что frozen runtime files не затронуты;
5. протестировать;
6. merge в `main` только по явной команде.

### Runtime change

Любая правка:

- swipe;
- loading;
- candle;
- zoom;
- navigation;
- layout;
- responsive;
- orientation;

должна идти отдельно от content batch.

Не смешивать исправление механики и добавление 10 икон в один бесформенный коммит.

---

## 31. Файлы, которые считаются frozen для content-only задач

Не менять:

```text
index.html
id/*
video/*
docs/icon-screen-layers.md
existing icon assets
existing records in data/icons.json
```

Исключение — только явная отдельная задача пользователя.

---

## 32. Что не делать

При добавлении новой иконы не надо:

- переписывать `index.html`;
- разбивать его на modules;
- подключать React/Vue/Svelte;
- менять framework;
- вводить build system;
- переименовывать папки;
- унифицировать старые JSON records;
- перенумеровывать IDs;
- менять сортировку;
- менять spacing;
- менять typography;
- менять launch animation;
- менять swipe;
- менять zoom;
- менять Candle Mode;
- переделывать responsive;
- переписывать старые описания;
- массово recompress existing images;
- «чистить» странный код.

Странный код, который стабильно работает, сейчас лучше красивого кода, который внезапно решил стать новым проектом.

---

## 33. Если что-то выглядит неправильно

Сначала определить класс проблемы.

### Ошибка asset

Например:

- плохой preview;
- неправильный crop;
- loading image другой пропорции;
- неправильный source.

Исправлять asset/data.

### Ошибка конкретной записи JSON

Исправлять только запись.

### Ошибка runtime

Только тогда рассматривать `index.html`.

### Устаревшая документация

Исправлять документацию, а не код под документацию.

---

## 34. Проверка источников

Не считать случайную копию изображения в интернете достаточным источником.

Предпочтительный порядок:

1. музей / официальная коллекция;
2. Wikimedia Commons с понятной лицензией;
3. авторитетный каталог иконописи;
4. другой проверяемый первичный/архивный источник.

В metadata фиксировать именно тот источник, откуда взят используемый файл или подтверждены его данные.

---

## 35. IMAGE_SOURCES.md

`data/IMAGE_SOURCES.md` используется как дополнительная человеческая карта источников.

Но UI читает сведения из `data/icons.json`.

Поэтому наличие записи только в IMAGE_SOURCES.md не заменяет корректные:

- `image_source`;
- `image_credit`;
- `rights`;

если они нужны в интерфейсе.

---

## 36. Public Domain и лицензии

Не писать `Public Domain`, CC0, CC BY-SA и т.п. по предположению.

Лицензию нужно подтверждать источником.

Если источник разрешает использование на конкретных условиях — указывать их корректно.

---

## 37. Описание иконы

Стиль `description_full`:

- компактный;
- информативный;
- без лишнего пафоса;
- без выдуманных чудес;
- без категоричных исторических утверждений при спорной атрибуции;
- объясняет, что пользователь видит и почему образ важен.

---

## 38. Current user flow

Базовый smoke test:

1. открыть приложение;
2. увидеть launch screen;
3. нажать «Коснитесь, чтобы начать»;
4. попасть в каталог;
5. найти икону через Search;
6. открыть её;
7. свайпнуть в соседнюю;
8. сделать double tap;
9. pan;
10. сбросить zoom;
11. открыть Info;
12. прокрутить Info;
13. проверить credits;
14. закрыть Info;
15. открыть Candle Mode;
16. закрыть Candle Mode касанием;
17. Share;
18. нажать логотип;
19. вернуться в каталог;
20. открыть About;
21. вернуться в каталог.

---

## 39. Перед runtime-изменением

Если всё-таки нужно менять механику:

1. прочитать `AGENTS.md`;
2. прочитать `docs/icon-screen-layers.md`;
3. определить минимальный участок;
4. создать отдельную branch;
5. изменить только необходимое;
6. проверить весь smoke test;
7. сравнить diff;
8. не merge в main без явного запроса.

---

## 40. Короткая памятка

### Добавляешь икону?

Трогай:

```text
data/icons.json
icons/<slug>.jpg
icons/preview/<slug>_preview.jpg
icons/loading/<slug>_loading.jpg
```

При необходимости:

```text
icons/candle/<slug>.webp
icons/png/<slug>.png
```

### Не трогай без отдельной задачи

```text
index.html
gesture logic
progressive loader
Candle Mode
navigation
orientation
responsive
existing assets
```

---

## 41. Цель текущего этапа

Не строить Iconka заново.

Не «улучшать архитектуру».

Не чинить то, что не просили чинить.

**Добавить контент, сохранить поведение, не устроить пожар в уже работающей сцене.**
