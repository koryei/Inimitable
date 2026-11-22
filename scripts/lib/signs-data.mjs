// Word and phrase lists the tell scanner looks for. Kept as data so they are easy to extend and test.

export const HYPE_WORDS = [
  'supercharge', 'supercharged', 'seamless', 'seamlessly', 'unlock', 'unleash', 'magic', 'magical',
  'revolutionize', 'revolutionary', 'game-changing', 'game changer', 'effortless', 'effortlessly',
  'next-generation', 'next-gen', 'cutting-edge', 'state-of-the-art', 'best-in-class', 'blazing fast',
  'lightning fast', 'turbocharge', 'reimagine', 'elevate your', 'take your .* to the next level',
];

export const CLAIM_PATTERNS = [
  'trusted by', 'loved by', 'used by', 'join \\d', '\\d[\\d,.]*\\+?\\s*(teams|users|customers|companies|developers|creators|businesses)',
  '\\b\\d+x\\s+(faster|better|more)', '\\b(5|4\\.9|4\\.8)\\s*(\\/\\s*5)?\\s*stars?\\b', '#1\\s',
];

export const PLACEHOLDER_PATTERNS = [
  'lorem ipsum', '\\bjohn doe\\b', '\\bjane doe\\b', '\\[x\\]', '\\$?123,456', '\\bplaceholder\\b', 'your (name|text|title) here',
];

export const GREETING_PATTERN = '^(welcome back|welcome,|hey,|hi,|hello,|good (morning|afternoon|evening))';
