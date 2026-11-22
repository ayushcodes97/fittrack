export const FOOD_ALIASES: Record<string, string[]> = {
  // Common English names
  'paneer': ['cottage cheese', 'Indian cheese', 'chhena', 'panir'],
  'roti': ['chapati', 'flatbread', 'atta', 'phulka'],
  'rice': ['basmati', 'white rice', 'brown rice', 'steamed rice', 'chawal'],
  'dal': ['arhar', 'tur dal', 'split pigeon peas', 'lentils', 'dal tadka'],
  'chicken': ['chicken breast', 'pollo', 'murgh', 'grilled chicken'],
  'egg': ['anday', 'boiled egg', 'omelette', 'anda'],
  'banana': ['kela', 'plantain'],
  'milk': ['doodh', 'dairy milk'],
  
  // Hindi/Hinglish names
  'aloo': ['potato', 'potatoes', 'alu'],
  'pyaz': ['onion', 'onions'],
  'adrak': ['ginger'],
  'lehsun': ['garlic'],
  'tamatar': ['tomato', 'tomatoes'],
  'palak': ['spinach'],
  'methi': ['fenugreek'],
  'gobi': ['cauliflower'],
  'bandgobi': ['cabbage'],
  'bhindi': ['okra', 'lady finger'],
  'karela': ['bitter gourd'],
  'lauki': ['bottle gourd'],
  'kheera': ['cucumber'],
  'mooli': ['radish'],
  'beetroot': ['chukandar'],
  'gajar': ['carrot'],
  
  // Dairy
  'dahi': ['curd', 'yogurt'],
  'lassi': ['buttermilk', 'chaas'],
  'chaas': ['buttermilk', 'lassi'],
  'ghee': ['clarified butter'],
  'makhan': ['butter'],
  
  // Grains
  'atta': ['whole wheat flour', 'wheat flour'],
  'maida': ['all-purpose flour', 'refined flour'],
  'suji': ['semolina', 'rava'],
  'besan': ['gram flour', 'chickpea flour'],
  'bajra': ['pearl millet'],
  'jowar': ['sorghum'],
  'ragi': ['finger millet'],
  
  // Legumes
  'chana': ['chickpeas', 'garbanzo beans', 'kabuli chana'],
  'rajma': ['kidney beans', 'red beans'],
  'lobia': ['black-eyed peas', 'cowpeas'],
  'moong': ['mung beans', 'green gram'],
  'masoor': ['red lentils', 'orange lentils'],
  'urad': ['black lentils', 'black gram'],
  
  // Non-veg
  'mutton': ['goat meat', 'lamb'],
  'fish': ['machli', 'meen'],
  'prawns': ['shrimp', 'jhinga'],
  'egg-curry': ['anda curry'],
  
  // Breakfast
  'poha': ['flattened rice', 'beaten rice'],
  'idli': ['steamed rice cake'],
  'dosa': ['rice crepe', 'fermented crepe'],
  'upma': ['semolina porridge', 'rava upma'],
  'oats': ['rolled oats', 'oatmeal'],
  
  // Snacks
  'samosa': ['fried pastry'],
  'pakora': ['fritters', 'bhajiya'],
  'dhokla': ['steamed chickpea cake'],
  'biscuit': ['cookies', 'marie biscuits'],
  'maggi': ['instant noodles'],
  
  // Fruits
  'mango': ['aam'],
  'apple': ['seb'],
  'orange': ['santra', 'narangi'],
  'grapes': ['angoor'],
  'papaya': ['papita'],
  'guava': ['amrud'],
  'watermelon': ['tarbooj'],
  'dates': ['khajoor'],
  
  // Beverages
  'tea': ['chai', 'masala chai'],
  'coffee': ['kaffee'],
  
  // Nuts
  'almonds': ['badam'],
  'peanuts': ['moongphali'],
  'walnuts': ['akhrot'],
  'cashews': ['kaju'],
}

export function findFoodByAlias(alias: string): string | undefined {
  const lower = alias.toLowerCase().trim()
  for (const [key, aliases] of Object.entries(FOOD_ALIASES)) {
    if (key.toLowerCase() === lower || aliases.some(a => a.toLowerCase() === lower)) {
      return key
    }
  }
  return undefined
}