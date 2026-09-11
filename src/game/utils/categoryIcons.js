/**
 * Category to Icon mapping for Nepali Educational Bingo
 */
export function getCategoryIcon(category) {
  if (!category) return '⭐';
  switch (category.trim()) {
    case 'शब्दार्थ':
      return '📖';
    case 'वाक्य पूरा':
      return '✍️';
    case 'व्याकरण':
      return '📝';
    case 'शब्द वर्गीकरण':
      return '🗂️';
    case 'विपरीतार्थक':
      return '🔄';
    case 'विराम चिन्ह':
      return '❓';
    case 'समानार्थी':
      return '🤝';
    case 'नाताबोधक':
      return '👨‍👩‍👧‍👦';
    case 'हिज्जे':
      return '✨';
    case 'शब्दज्ञान':
      return '🧠';
    case 'संस्कृति':
      return '🏔️';
    case 'शब्द निर्माण':
      return '🧱';
    case 'संख्या':
      return '🔢';
    case 'शब्द मिलान':
      return '🔗';
    case 'व्यवहार':
      return '💡';
    default:
      return '⭐';
  }
}
