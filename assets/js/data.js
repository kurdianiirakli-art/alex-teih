/* Alex Teih — collection data (images from the original alexteih.com) */
const IMG = 'assets/img/';
const range = (prefix, nums) => nums.map(n => `${IMG}${prefix}-${n}.jpg`);

window.AT_COLLECTIONS = [
  {
    slug: 'ball-gown',
    name: 'Ball Gown',
    tag: 'GRAND',
    season: 'FW',
    line: 'Volume, structure and jacquard — the grand gesture of the evening.',
    cover: IMG + 'bg-21.jpg',
    looks: range('bg', [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 17, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35]),
  },
  {
    slug: 'haute-couture',
    name: 'Haute Couture',
    tag: 'ATELIER',
    season: 'SS',
    line: 'Feathers, hand-painted silks and sculpted tulle, finished by hand in New York.',
    cover: IMG + 'hc-1.jpg',
    looks: range('hc', [1, 2, 3, 4, 5, 6, 8, 9]),
  },
  {
    slug: 'slim-silhouette',
    name: 'Slim Silhouette',
    tag: 'COLUMN',
    season: 'FW',
    line: 'Controlled bodices and column skirts that follow the line of the body.',
    cover: IMG + 'slim-20.jpg',
    looks: range('slim', [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 16, 17, 18, 19, 20, 21]),
  },
  {
    slug: 'seductive-shimmer',
    name: 'Seductive Shimmer',
    tag: 'NOIR',
    season: 'FW',
    line: 'Black lace, sheer sleeves and a quiet sparkle for the cocktail hour.',
    cover: IMG + 'ss-11.jpg',
    looks: range('ss', [1, 2, 4, 6, 7, 8, 9, 11, 12]),
  },
  {
    slug: 'white-nights',
    name: 'White Nights',
    tag: 'BRIDAL',
    season: 'SS',
    line: 'Ivory lace and sculpted organza for the brightest night of the year.',
    cover: IMG + 'wn-6.jpg',
    looks: range('wn', [1, 2, 3, 4, 5, 6, 7]),
  },
  {
    slug: 'endlessly-ethereal',
    name: 'Endlessly Ethereal',
    tag: 'AIR',
    season: 'SS',
    line: 'Chiffon that moves before you do — drapes that trail like smoke.',
    cover: IMG + 'ee-4.jpg',
    looks: range('ee', [4, 5, 6]),
  },
];

window.AT_BIO = {
  short: 'Based in New York, fashion designer Alex Teih is known for his couture evening wear and cocktail dresses.',
  long: [
    'Based in New York, fashion designer Alex Teih is known for his couture evening wear and cocktail dresses. His high fashion designs are modern and flirtatious with a polished sophistication that agree with the relaxed formality of today’s lifestyles.',
    'Alex Teih creates a variety of unique silhouettes that compliment every body type. His European heritage, combined with a background in cinema and costume design, are evident in each collection’s intricacy.',
    'A master of draping, Alex Teih achieves grand effect with simple gestures. Impeccably tailored and controlled bodices go unnoticed within each layered skirt and hem.',
    'Rather than fabricate a design, Teih first finds fabric and then works to discover its essence. The result is a collection that features a perfect balance of trend and innovation that leads to his signature aura of edgy romance.',
  ],
};

window.AT_CONTACT = {
  email: 'darrell@alexteih.com',
  phone: '646.623.4643',
  tel: '+16466234643',
  city: 'New York',
  instagram: 'https://www.instagram.com/alexteih_studio/',
  facebook: 'https://www.facebook.com/profile.php?id=100089235987327',
};
