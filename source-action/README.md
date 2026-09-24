# source-action

Входная папка для GitHub Action **Prepare Icon Assets**.

Для каждой иконы положить сюда три master-файла с одинаковым slug:

```text
<slug>.jpg
<slug>.png
<slug>_square.jpg
```

Пример:

```text
troitsa.jpg
troitsa.png
troitsa_square.jpg
```

## Требования к исходникам

- `<slug>.jpg` — полное изображение иконы; длинная сторона не меньше 1400 px.
- `<slug>.png` — та же композиция и пропорции, настоящий alpha channel; длинная сторона не меньше 1400 px.
- `<slug>_square.jpg` — подготовленный вручную квадрат; минимум 160×160 px.
- JPG и PNG могут иметь разное абсолютное разрешение, но aspect ratio должен совпадать с допуском 0.5%.\n- PNG сохраняется lossless: вес не уменьшается ценой качества alpha/master. Более 1500 KB даёт предупреждение, но не останавливает batch.

## Что генерируется

```text
icons/<slug>.jpg                    long side 1400 px, <= 400 KB
icons/preview/<slug>_preview.jpg    160 × 160 px, <= 15 KB
icons/loading/<slug>_loading.jpg    long side 48 px, <= 2 KB
icons/candle/<slug>.webp            main geometry, alpha, <= 300 KB
icons/png/<slug>.png                long side 900 px, lossless alpha; > 1500 KB warns
```

Action не кадрирует изображения и не принимает художественных решений. Он только валидирует, масштабирует и оптимизирует.

## Запуск

GitHub → **Actions** → **Prepare Icon Assets** → **Run workflow**.

В поле `slug`:
- имя конкретной иконы без расширения; или
- `all`, чтобы обработать все полные комплекты в этой папке.

Action создаёт отдельную ветку `assets/action-<run-id>` и Pull Request в `main`. Сам `main` автоматически не изменяется.
