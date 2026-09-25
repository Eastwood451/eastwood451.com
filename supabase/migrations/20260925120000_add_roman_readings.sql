-- Store a Roman-letter pronunciation for Latin and Japanese vocabulary too.
-- Japanese kana spellings remain accepted alongside the new romaji reading.
update public.flashcard_vocabulary as vocabulary
set
  reading = updates.reading,
  accepted_answers = updates.accepted_answers
from (values
  ('la', 'chair', 'sel-la', array[]::text[]),
  ('la', 'table', 'men-sa', array['tabula']::text[]),
  ('la', 'pencil', 'sti-lus', array['graphium', 'pencillum']::text[]),
  ('la', 'boy', 'pu-er', array[]::text[]),
  ('la', 'girl', 'pu-el-la', array[]::text[]),
  ('la', 'man', 'wir', array[]::text[]),
  ('la', 'woman', 'mu-li-er', array[]::text[]),
  ('la', 'house', 'do-mus', array[]::text[]),
  ('la', 'stone', 'la-pis', array[]::text[]),
  ('la', 'iron', 'fer-rum', array[]::text[]),
  ('la', 'car', 'au-to-ki-ne-tum', array['currus automobilis', 'automobilis']::text[]),
  ('la', 'red', 'ru-ber', array[]::text[]),
  ('la', 'blue', 'kai-ru-le-us', array[]::text[]),
  ('la', 'green', 'wi-ri-dis', array[]::text[]),
  ('la', 'yellow', 'fla-wus', array[]::text[]),
  ('la', 'black', 'ni-ger', array[]::text[]),
  ('la', 'white', 'al-bus', array[]::text[]),
  ('la', 'big', 'mag-nus', array[]::text[]),
  ('la', 'small', 'par-wus', array[]::text[]),
  ('la', 'warm', 'ka-li-dus', array[]::text[]),
  ('la', 'cold', 'fri-gi-dus', array[]::text[]),
  ('ja', 'chair', 'isu', array['いす']::text[]),
  ('ja', 'table', 'teeburu', array['てーぶる']::text[]),
  ('ja', 'pencil', 'enpitsu', array['えんぴつ']::text[]),
  ('ja', 'boy', 'otokonoko', array['おとこのこ']::text[]),
  ('ja', 'girl', 'onnanoko', array['おんなのこ']::text[]),
  ('ja', 'man', 'dansei', array['だんせい']::text[]),
  ('ja', 'woman', 'josei', array['じょせい']::text[]),
  ('ja', 'house', 'ie', array['いえ', 'uchi']::text[]),
  ('ja', 'stone', 'ishi', array['いし']::text[]),
  ('ja', 'iron', 'tetsu', array['てつ']::text[]),
  ('ja', 'car', 'kuruma', array['くるま']::text[]),
  ('ja', 'red', 'akai', array['あかい']::text[]),
  ('ja', 'blue', 'aoi', array['あおい']::text[]),
  ('ja', 'green', 'midoriiro', array['みどりいろ', '緑']::text[]),
  ('ja', 'yellow', 'kiiro', array['きいろ', '黄色い', 'きいろい', 'kiiroi']::text[]),
  ('ja', 'black', 'kuroi', array['くろい']::text[]),
  ('ja', 'white', 'shiroi', array['しろい']::text[]),
  ('ja', 'big', 'ookii', array['おおきい']::text[]),
  ('ja', 'small', 'chiisai', array['ちいさい']::text[]),
  ('ja', 'warm', 'atatakai', array['あたたかい', '温かい']::text[]),
  ('ja', 'cold', 'tsumetai', array['つめたい', '寒い', 'さむい', 'samui']::text[])
) as updates(language_code, word_id, reading, accepted_answers)
where vocabulary.language_code = updates.language_code
  and vocabulary.word_id = updates.word_id;

