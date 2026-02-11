---
title: fix: Restore reference-like particle contour noise while preserving color fidelity
type: fix
date: 2026-02-11
brainstorm: docs/brainstorms/2026-02-11-particle-color-falloff-brainstorm.md
---

# fix: Restore reference-like particle contour noise while preserving color fidelity

## Overview
Вернуть визуальный характер частиц ближе к исходному референсу (контур, текстурность/шум, ощущение формы), при этом сохранить текущую улучшенную работу цвета из панели управления.

## Problem Statement / Motivation
Сейчас цветовая часть ведет себя заметно лучше (центр/край и контроль из UI), но контур частицы визуально ушел от референса: граница воспринимается более «чистой/синтетической», а характер оригинального шума ослаблен. В результате теряется фирменный “organic bokeh” вид.

Нужен обратный баланс:
- сохранить текущую управляемость цвета;
- вернуть референсный contour/noise look.

## Found Brainstorm Context (Step 0)
Found brainstorm from **2026-02-11**: **particle-color-falloff**. Using as context for planning.

Что берем из brainstorm:
- Цвет должен оставаться предсказуемым из UI.
- `Softness` и `Edge Smoothness` — раздельные роли.
- Белый центр должен оставаться визуально белым (с допустимым легким tint).

Что добавляем в этом плане:
- Явная цель по визуальному паритету контура и шума с исходным референсом.

## Repository & Learnings Research (Step 1)
### Repo findings
- Текущий пайплайн: `reveal -> sine -> shatter -> bokeh -> output`: `index.html:1185`.
- Контур формируется в `reveal` (через `smoothstep`/`pow`): `index.html:422`.
- Шумовой характер в blur-проходе: blue-noise + jitter в `bokeh`: `index.html:572`.
- Финальный цвет/композит, влияющий на perceived look: `index.html:640`.
- Контролы shape/color находятся в одном массиве `CONTROL_DEFS`: `index.html:1268`.
- В сохраненном референсе `block-gl` использует blue-noise и background texture: `Reference/Microsoft AI.html:203`.
- В собранном референсном бандле виден аналогичный multi-pass и отдельный `uOutputColor` в output-этапе: `Reference/Microsoft AI_files/index.js:1`.

### Institutional learnings
- `docs/solutions/` в репозитории отсутствует.
- `docs/solutions/patterns/critical-patterns.md` отсутствует.

## External Research Decision (Step 1.5)
Решение: **выполнить внешний ресерч**.

Причина: задача про визуальный паритет шейдерного контура/шума, где легко попасть в “подбор коэффициентов”, поэтому полезно зафиксировать опорные best practices из первичных источников.

## External Research Findings (Step 1.5b)
- GLSL `smoothstep`: корректная гладкая интерполяция, но важно не допускать `edge0 >= edge1` (undefined): [docs.gl smoothstep](https://docs.gl/el3/smoothstep)
- GLSL `fwidth`: экранные производные для адаптивной ширины перехода (fragment-only), полезно для стабилизации контурной кромки: [docs.gl fwidth](https://docs.gl/el3/fwidth)
- MDN WebGL best practices: точность (`highp/mediump`) в fragment shader и портируемость precision critical путей: [MDN WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)
- Для blue-noise в реальном времени: текстуру обычно тайлят и читают point sampling (без размытия), temporal/spatiotemporal варианты дают более стабильный результат: [NVIDIA STBN Part 1](https://developer.nvidia.com/blog/rendering-in-real-time-with-spatiotemporal-blue-noise-textures-part-1/), [NVIDIA STBN Part 2](https://developer.nvidia.com/blog/rendering-in-real-time-with-spatiotemporal-blue-noise-textures-part-2/), [NVIDIA STBN publication](https://research.nvidia.com/publication/2022-07_spatiotemporal-blue-noise-masks)

Deprecation check (APIs/services): **N/A** (в задаче нет внешних API/OAuth/SDK интеграций).

## SpecFlow Analysis (Step 3)
### User Flow Overview
1. Пользователь выбирает цвета центра/края и ожидает, что цвет остается таким же предсказуемым, как сейчас.
2. Пользователь двигает курсор: частица проявляется с референсным «живым» контуром и шумовой неоднородностью, а не с ровной цифровой кромкой.
3. Пользователь меняет shape-контролы (`Softness`, `Edge Smoothness`, `Radius`) и получает ожидаемый диапазон формы без деградации color fidelity.
4. Пользователь включает/выключает фон-текстуру и не теряет характер референсного контура.
5. Reduced-motion/`renderOnce` сохраняет тот же визуальный стиль (без “другой” частицы в статике).

### Flow Permutations Matrix
| Flow | Context | Expected result |
|---|---|---|
| Color-first | Center/Edge color changed | Цветовые значения читаются корректно, contour/noise сохраняются |
| Shape-first | Softness/Edge Smoothness extremes | Контур изменяется контролируемо, без потери органического шума |
| Motion | Active pointer + animation | В динамике референсный характер контура сохраняется |
| Static | Reduced motion / single frame | Тот же стиль границы и текстуры, что в динамике |
| Background | Texture on/off | Контур частицы не “разваливается” при смене фона |

### Missing Elements & Gaps
- **Category**: Acceptance baseline
  - **Gap**: Нет формального эталона «похоже на референс».
  - **Impact**: Риск бесконечной субъективной калибровки.
  - **Ambiguity**: Какие кадры/сцены считаем эталонными.
- **Category**: Parameter ownership
  - **Gap**: Не зафиксировано, какие параметры отвечают только за contour/noise, а какие — за color.
  - **Impact**: Высокий риск регрессии цвета при тюнинге контура.
  - **Ambiguity**: Граница ответственности reveal/bokeh/output.
- **Category**: Verification
  - **Gap**: Нет матрицы сравнения для low/mid/high значений с референсом.
  - **Impact**: Сложно доказать, что внешний вид действительно вернулся.
  - **Ambiguity**: Какие комбинации контролов обязательны к проверке.

### Critical Questions Requiring Clarification
1. **Critical**: Какая референсная фиксация принимается за “истину” — конкретный кадр из `CleanShot` или живая страница `Reference/Microsoft AI.html`?  
   Assumption if unanswered: использовать статический кадр + live reference вместе.
2. **Important**: Хотим ли мы добавлять новый пользовательский контрол шума контура, или оставляем шум «под капотом» (фиксированный стиль)?  
   Assumption if unanswered: без нового UI-контрола (YAGNI).
3. **Important**: Допустима ли небольшая потеря текущей “белизны” ядра ради более точного contour/noise parity?  
   Assumption if unanswered: белизну не ухудшаем; contour/noise восстанавливаем в рамках текущего color quality.

## Proposed Solution
1. **Разделить ответственность по этапам**:
   - `reveal`: форма/контур/маска (alpha-first behavior);
   - `bokeh`: шумовая и микроструктурная «органика»;
   - `output`: только цветовой композит и фоновое смешивание.
2. **Вернуть референсный характер шума контура**:
   - восстановить более выраженную нерегулярность границы на основе blue-noise-driven modulation;
   - стабилизировать шум так, чтобы он не превращался в случайный flicker.
3. **Сохранить текущую color-fidelity логику**:
   - не ломать текущую работу center/edge colors;
   - при необходимости адаптировать output-композит через минимальные корректировки, а не переписывать всю модель цвета.
4. **Фиксировать визуальную приемку через reference parity matrix** (см. ниже).

## Technical Considerations
- Контур сейчас слишком “аналитический” (clean `smoothstep` + power profile), из-за чего шумовая «живость» может теряться: `index.html:455`.
- Blue-noise уже есть в пайплайне (`tBlueNoise`), значит можно вернуть характер без добавления новых текстур: `index.html:581`.
- Цвет сейчас зависит от output-композита и должен остаться стабильным: `index.html:663`.
- Референсная система (из бандла) показывает близкий многошаговый рендер с отдельным output color слоем, что полезно для decoupling shape vs color: `Reference/Microsoft AI_files/index.js:1`.

## Acceptance Criteria
- [ ] Визуально восстановлен reference-like contour/noise (подтверждено side-by-side с референсом в согласованной сцене).
- [ ] Текущая управляемость цвета сохранена: center/edge из UI остаются предсказуемыми.
- [ ] Белый центр (`#FFFFFF`) не теряет читаемую белизну в статике и анимации.
- [ ] `Softness` и `Edge Smoothness` сохраняют разные роли после возврата шума.
- [ ] Поведение при `BG_TEXTURE_ENABLED` on/off остается консистентным.
- [ ] Reduced motion (`renderOnce`) визуально совпадает по стилю с анимированным пайплайном.
- [ ] Без добавления новых render pass (если не появится явная необходимость по итогам сравнения).

## Success Metrics
- 3/3 обязательных reference-сцен (idle, pointer-active, fade-out) проходят визуальную приемку.
- Минимум 3 пресета цвета (white center, warm center, saturated center) не показывают регрессии цветового контроля.
- Нет новых runtime ошибок WebGL/console при интерактивной настройке контролов.

## Dependencies & Risks
- **Risk:** Возврат шума ухудшит цветовой контроль.
  - **Mitigation:** Жестко держать alpha/shape и color/output раздельно, валидировать color matrix на каждом шаге.
- **Risk:** Слишком агрессивный шум даст temporal flicker.
  - **Mitigation:** Использовать blue-noise modulation в стабильном диапазоне, сверять динамику на pointer movement.
- **Risk:** Нет четкого эталона приемки.
  - **Mitigation:** Зафиксировать reference scene pack до начала тюнинга.

## Implementation Outline
### Phase 1: Baseline lock
- [ ] Зафиксировать reference scenes (кадры/ракурсы/набор контролов) для side-by-side проверки.
- [ ] Зафиксировать текущий color baseline (3 цветовых пресета) как non-regression набор.

### Phase 2: Contour/noise parity
- [x] Перенастроить формирование контура в `reveal` в сторону референсного характера (меньше «стерильной» кромки).
- [x] Усилить/скорректировать noise contribution на границе с использованием существующего blue-noise источника.
- [ ] Проверить temporal behavior (без шумового “дребезга”).

### Phase 3: Color preservation and final tuning
- [ ] Провести non-regression по цветовым пресетам и белому центру.
- [ ] При необходимости минимально скорректировать output-композит только для сохранения текущего color UX.
- [ ] Закрыть acceptance matrix и финализировать значения по умолчанию.

Verification note:
- Runtime smoke-check пройден без JS/WebGL ошибок в headless, но визуальная проверка contour/noise невалидна в этой среде из-за отсутствия `webgl2` контекста в headless Chromium. Нужна ручная проверка в обычном desktop-браузере.

## References & Research
### Internal References
- Particle reveal contour logic: `index.html:422`
- Blue-noise and bokeh sampling: `index.html:572`
- Output compositing and color perception: `index.html:640`
- Render pass order: `index.html:1185`
- User controls map: `index.html:1268`
- Reference block-gl attributes (noise/background): `Reference/Microsoft AI.html:203`
- Reference bundled pipeline hints (`vignette/sine/shatter/bokeh/output`, `uOutputColor`): `Reference/Microsoft AI_files/index.js:1`

### External References
- GLSL `smoothstep`: [docs.gl/el3/smoothstep](https://docs.gl/el3/smoothstep)
- GLSL `fwidth`: [docs.gl/el3/fwidth](https://docs.gl/el3/fwidth)
- WebGL shader precision/perf guidance: [MDN WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)
- Blue-noise usage in real-time rendering: [NVIDIA STBN Part 1](https://developer.nvidia.com/blog/rendering-in-real-time-with-spatiotemporal-blue-noise-textures-part-1/), [NVIDIA STBN Part 2](https://developer.nvidia.com/blog/rendering-in-real-time-with-spatiotemporal-blue-noise-textures-part-2/), [NVIDIA STBN publication](https://research.nvidia.com/publication/2022-07_spatiotemporal-blue-noise-masks)
