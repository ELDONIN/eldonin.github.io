import type { LinkEntry } from '@/features/links/model'

export const links = [
  {
    title: 'Sun and Stuff',
    description: 'Сборник математических визуализаций и экспериментов — вдохновение для моего сайта.',
    url: 'https://sunandstuff.com/',
  },
  {
    title: 'The Frutiger Aero Archive',
    description: 'Любители Frutiger Aero налетайте!',
    url: 'https://frutigeraeroarchive.org/music',
  },
  {
    title: 'Neocities',
    description: 'Хостинг независимых сайтов с вайбом старого веба.',
    url: 'https://neocities.org/browse/',
  },
  {
    title: 'Dither it!',
    description: 'Дизеринг фото онлайн.',
    url: 'https://ditherit.com/',
  },
  {
    title: 'PastVu',
    description: 'Карта с историческими фотографиями вашего города с датами.',
    url: 'https://pastvu.com',
  },
  {
    title: 'Michael Bach — Optical Illusions',
    description: 'Сайт с кучей оптических иллюзий и пояснений к ним.',
    url: 'https://michaelbach.de/ot/index.html',
  },
  {
    title: 'Kontiki Maps — How Old?',
    description: 'Карта возрастов домов вашего города.',
    url: 'https://kontikimaps.ru/how-old/',
  },
  {
    title: 'Destroy Sprite Fusion',
    description: 'Игра, где вы разрушаете выбранный вами сайт.',
    url: 'https://destroy.spritefusion.com',
  },
  {
    title: 'Radio KWSX',
    description: 'Независимая интернет-радиостанция.',
    url: 'https://radio.kwsx.online/',
  },
  {
    title: 'Every Noise at Once',
    description: 'Интерактивная карта музыкальных жанров.',
    url: 'https://everynoise.com/',
  },
  {
    title: 'WikiHow — вычислить число Пи',
    description: 'Инструкция по вычислению числа Пи с помощью хот-догов.',
    url: 'https://ru.wikihow.com/%D1%80%D0%B0%D1%81%D1%81%D1%87%D0%B8%D1%82%D0%B0%D1%82%D1%8C-%D1%87%D0%B8%D1%81%D0%BB%D0%BE-%D0%9F%D0%B8-%D1%81-%D0%BF%D0%BE%D0%BC%D0%BE%D1%89%D1%8C%D1%8E-%D1%85%D0%BE%D1%82-%D0%B4%D0%BE%D0%B3%D0%BE%D0%B2',
  },
  {
    title: 'See Gore',
    description: 'Шок-контент для щекотания выжженной души.',
    url: 'https://goresee.com/',
  },
] as const satisfies readonly LinkEntry[]
