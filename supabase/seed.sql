-- Reference data + demo content. Safe to run repeatedly (idempotent upserts).
-- Run after the migrations: `supabase db execute -f supabase/seed.sql`
-- (or paste into the Supabase SQL editor).

-- ---------------------------------------------------------------------------
-- Countries
-- ---------------------------------------------------------------------------
insert into public.countries (code, name, currency, is_active) values
  ('KG', 'Кыргызстан', 'KGS', true),
  ('KZ', 'Казахстан', 'KZT', false),
  ('UZ', 'Узбекистан', 'UZS', false),
  ('RU', 'Россия', 'RUB', false),
  ('TJ', 'Таджикистан', 'TJS', false)
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- App settings — USD/KGS rate + contact fallbacks, editable in /admin later.
-- ---------------------------------------------------------------------------
insert into public.app_settings (key, value) values
  ('usd_kgs_rate', '89.5'),
  ('lead_manager_phone', '"+996 700 000 000"'),
  ('lead_manager_whatsapp', '"+996700000000"'),
  ('lead_manager_telegram', '"@carbridge_kg"')
on conflict (key) do update set value = excluded.value, updated_at = now();

-- ---------------------------------------------------------------------------
-- Brands / models (a starter subset — grows over time from the admin panel)
-- ---------------------------------------------------------------------------
insert into public.brands (name, slug) values
  ('Toyota', 'toyota'),
  ('Honda', 'honda'),
  ('BYD', 'byd'),
  ('Chery', 'chery'),
  ('Geely', 'geely'),
  ('Changan', 'changan'),
  ('Haval', 'haval'),
  ('Hyundai', 'hyundai'),
  ('Kia', 'kia'),
  ('Volkswagen', 'volkswagen')
on conflict (slug) do nothing;

insert into public.models (brand_id, name, slug)
select b.id, m.name, m.slug from (values
  ('toyota', 'Camry', 'camry'),
  ('toyota', 'RAV4', 'rav4'),
  ('toyota', 'Land Cruiser Prado', 'land-cruiser-prado'),
  ('honda', 'CR-V', 'cr-v'),
  ('honda', 'Civic', 'civic'),
  ('byd', 'Song Plus', 'song-plus'),
  ('byd', 'Han', 'han'),
  ('byd', 'Tang', 'tang'),
  ('chery', 'Tiggo 7 Pro', 'tiggo-7-pro'),
  ('chery', 'Tiggo 8 Pro', 'tiggo-8-pro'),
  ('geely', 'Coolray', 'coolray'),
  ('geely', 'Monjaro', 'monjaro'),
  ('changan', 'CS75 Plus', 'cs75-plus'),
  ('haval', 'Jolion', 'jolion'),
  ('haval', 'F7', 'f7'),
  ('hyundai', 'Tucson', 'tucson'),
  ('kia', 'Sportage', 'sportage'),
  ('volkswagen', 'Tiguan', 'tiguan')
) as m(brand_slug, name, slug)
join public.brands b on b.slug = m.brand_slug
on conflict (brand_id, slug) do nothing;

-- ---------------------------------------------------------------------------
-- Calculator rates — placeholder brackets (real logistics/customs figures to
-- be supplied by the customer before launch, see ТЗ §12). Numbers below are
-- illustrative only and editable from /admin/rates.
-- ---------------------------------------------------------------------------
insert into public.calculator_rates
  (body_type, engine_volume_from, engine_volume_to, year_from, year_to, logistics_fee, broker_fee, customs_duty, customs_formula, currency)
values
  ('sedan',    0,   1.6, 2018, 2026, 1200, 400,  900, 'до 1.6л, возраст ≤ 3 лет: пошлина ≈ 2.5$/см³ с понижающим коэффициентом', 'USD'),
  ('sedan',    1.6, 2.0, 2018, 2026, 1300, 450, 1400, '1.6–2.0л, возраст ≤ 3 лет', 'USD'),
  ('sedan',    2.0, 3.0, 2018, 2026, 1400, 500, 2100, '2.0–3.0л, возраст ≤ 3 лет', 'USD'),
  ('suv',      0,   2.0, 2018, 2026, 1500, 500, 1700, 'кроссовер до 2.0л, возраст ≤ 3 лет', 'USD'),
  ('suv',      2.0, 3.0, 2018, 2026, 1600, 550, 2400, 'кроссовер/внедорожник 2.0–3.0л', 'USD'),
  ('suv',      3.0, 6.0, 2018, 2026, 1800, 600, 3200, 'внедорожник 3.0л+', 'USD'),
  ('crossover',0,   2.0, 2013, 2018, 1500, 500, 2600, 'кроссовер до 2.0л, возраст 3–8 лет', 'USD'),
  ('sedan',    0,   2.0, 2013, 2018, 1300, 450, 2300, 'седан до 2.0л, возраст 3–8 лет', 'USD'),
  ('electric', 0,   99,  2018, 2026,  900, 400,  600, 'электромобиль — сниженная пошлина', 'USD'),
  ('hybrid',   0,   2.0, 2018, 2026, 1300, 450, 1100, 'гибрид до 2.0л', 'USD')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Static content pages (markdown, editable from /admin/pages)
-- ---------------------------------------------------------------------------
insert into public.static_pages (slug, locale, title, content_md) values
(
  'how-to-buy', 'ru', 'Как купить автомобиль в Китае',
  E'## Как купить автомобиль в Китае через CarBridge\n\n1. **Выбор автомобиля.** Используйте калькулятор или каталог «Авто в Китае», либо оставьте заявку на подбор по бюджету.\n2. **Расчёт стоимости.** Калькулятор покажет ориентировочную цену под ключ: цена в Китае + доставка + оформление + таможня.\n3. **Подтверждение менеджером.** Мы уточняем точную стоимость, доступность и сроки.\n4. **Внесение предоплаты.** После согласования условий вносится предоплата для бронирования автомобиля.\n5. **Проверка и оформление.** Автомобиль проверяется, оформляются документы для экспорта.\n6. **Доставка.** Автомобиль отправляется в Кыргызстан (морем/по железной дороге + автовывоз).\n7. **Таможенное оформление и выдача.** После прохождения таможни автомобиль передаётся покупателю в Бишкеке.'
),
(
  'delivery', 'ru', 'Доставка автомобилей из Китая',
  E'## Сроки и маршруты доставки\n\nДоставка автомобилей из Китая в Кыргызстан занимает, как правило, **20–45 дней** в зависимости от региона и загруженности погранпереходов.\n\n**Основные маршруты:**\n- Автовывоз через погранпереход Иркештам/Торугарт;\n- Ж/д контейнером до Кашгара с последующей автодоставкой;\n- Морем до порта (для отдельных регионов Китая) + автодоставка.\n\nТочные сроки и стоимость зависят от региона отправки и уточняются менеджером при расчёте.'
),
(
  'customs', 'ru', 'Таможенное оформление',
  E'## Таможенные платежи и документы\n\nТаможенные платежи зависят от объёма двигателя, возраста автомобиля и типа кузова. Точная ставка рассчитывается калькулятором на основе актуальных тарифов.\n\n**Необходимые документы:**\n- Договор купли-продажи;\n- Экспортные документы Китая;\n- ПТС/документы для постановки на учёт в КР.\n\nОформление берёт на себя брокер площадки — вам не нужно самостоятельно оформлять документы на границе.'
),
(
  'verification', 'ru', 'Проверенный автомобиль',
  E'## Что значит бейдж «Проверено площадкой»\n\nПеред публикацией модератор площадки проверяет ключевые параметры автомобиля: VIN, пробег, состояние кузова и двигателя, комплектацию — и прикладывает фото/видео диагностики.\n\nОбъявления с этим статусом отмечены зелёной галочкой ✅ и разворачиваемым блоком с деталями проверки прямо на странице объявления.'
),
(
  'about', 'ru', 'О площадке',
  E'## О CarBridge\n\nCarBridge — маркетплейс автомобилей, объединяющий два рынка: автомобили в наличии в Бишкеке и автомобили из Китая под заказ с доставкой. Мы не просто доска объявлений — мы считаем для вас полную стоимость доставки и подбираем автомобиль под бюджет.\n\nЛюбой дилер может завести профиль компании и размещать объявления на площадке.'
),
(
  'how-to-buy', 'en', 'How to buy a car in China',
  E'## How to buy a car in China through CarBridge\n\n1. **Pick a car.** Use the calculator or the "Cars in China" catalog, or leave a budget-matching request.\n2. **Get an estimate.** The calculator shows an approximate turnkey price: price in China + delivery + clearance + customs.\n3. **Manager confirmation.** We confirm the exact price, availability and timeline.\n4. **Deposit.** Once terms are agreed, a deposit reserves the car.\n5. **Inspection and paperwork.** The car is inspected and export documents are prepared.\n6. **Delivery.** The car is shipped to Kyrgyzstan (sea/rail + road transport).\n7. **Customs clearance and handover.** After customs clearance, the car is handed to the buyer in Bishkek.'
),
(
  'delivery', 'en', 'Delivery from China',
  E'## Timelines and routes\n\nDelivery from China to Kyrgyzstan typically takes **20–45 days**, depending on the region and border crossing load.\n\n**Main routes:**\n- Road transport via the Irkeshtam/Torugart border crossing;\n- Rail container to Kashgar, then road delivery;\n- Sea to a port (for some regions of China) + road delivery.\n\nExact timelines and cost depend on the shipping region and are confirmed by a manager during the estimate.'
),
(
  'customs', 'en', 'Customs clearance',
  E'## Customs duties and documents\n\nCustoms duties depend on engine volume, the car''s age and body type. The exact rate is calculated by the calculator based on current rates.\n\n**Required documents:**\n- Sale and purchase agreement;\n- China export documents;\n- Registration documents for Kyrgyzstan.\n\nOur broker handles the clearance for you — you don''t need to deal with border paperwork yourself.'
),
(
  'verification', 'en', 'Verified cars',
  E'## What the "Verified by the platform" badge means\n\nBefore publishing, our moderator checks the car''s key parameters: VIN, mileage, body and engine condition, trim — and attaches inspection photos/video.\n\nListings with this status carry a green ✅ checkmark and an expandable block with inspection details right on the listing page.'
),
(
  'about', 'en', 'About',
  E'## About CarBridge\n\nCarBridge is a car marketplace bringing together two markets: cars in stock in Bishkek and cars from China available to order with delivery. We''re not just a listings board — we calculate the full delivery cost for you and match cars to your budget.\n\nAny dealer can set up a company profile and list cars on the platform.'
)
on conflict (slug, locale) do update set title = excluded.title, content_md = excluded.content_md, updated_at = now();
