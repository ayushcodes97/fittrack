import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Local food database for nutrition data
const localFoods = [
  {
    "id": "paneer",
    "name": "Paneer (raw cubes)",
    "category": "Dairy & Eggs",
    "calories": 265,
    "protein": 18.0,
    "carbs": 3.5,
    "fats": 20.5,
    "fiber": 0,
    "sugar": 3.1,
    "servingGrams": 100,
    "keywords": ["cottage cheese", "Indian cheese", "chhena"]
  },
  {
    "id": "roti",
    "name": "Roti (Whole Wheat)",
    "category": "Grains & Breads",
    "calories": 265,
    "protein": 9.9,
    "carbs": 48.6,
    "fats": 2.5,
    "fiber": 5.3,
    "sugar": 0.2,
    "servingGrams": 40,
    "keywords": ["chapati", "flatbread", "atta"]
  },
  {
    "id": "rice",
    "name": "Steamed Rice",
    "category": "Grains & Breads",
    "calories": 130,
    "protein": 2.7,
    "carbs": 28.2,
    "fats": 0.3,
    "fiber": 0.6,
    "sugar": 0.1,
    "servingGrams": 150,
    "keywords": ["basmati", "white rice"]
  },
  {
    "id": "dal-toor",
    "name": "Toor Dal",
    "category": "Dals & Legumes",
    "calories": 90,
    "protein": 5.5,
    "carbs": 13.5,
    "fats": 1.3,
    "fiber": 4.0,
    "sugar": 0.7,
    "servingGrams": 130,
    "keywords": ["arhar", "tur dal", "split pigeon peas"]
  },
  {
    "id": "dal-tadka",
    "name": "Dal Tadka",
    "category": "Dals & Legumes",
    "calories": 130,
    "protein": 5.2,
    "carbs": 14.0,
    "fats": 5.5,
    "fiber": 3.5,
    "sugar": 1.0,
    "servingGrams": 130,
    "keywords": ["dal tadka", "moong dal"]
  },
  {
    "id": "chicken",
    "name": "Grilled Chicken Breast",
    "category": "Non-Veg",
    "calories": 165,
    "protein": 31.0,
    "carbs": 0.0,
    "fats": 3.6,
    "fiber": 0,
    "sugar": 0,
    "servingGrams": 100,
    "keywords": ["chicken breast", "pollo", "murgh"]
  },
  {
    "id": "egg",
    "name": "Boiled Egg",
    "category": "Dairy & Eggs",
    "calories": 155,
    "protein": 13.0,
    "carbs": 1.1,
    "fats": 11.0,
    "fiber": 0,
    "sugar": 1.1,
    "servingGrams": 50,
    "keywords": ["egg", "anday"]
  },
  {
    "id": "banana",
    "name": "Banana",
    "category": "Fruits",
    "calories": 89,
    "protein": 1.1,
    "carbs": 22.8,
    "fats": 0.3,
    "fiber": 2.6,
    "sugar": 12.2,
    "servingGrams": 118,
    "keywords": ["kela", "plantain"]
  },
  {
    "id": "milk",
    "name": "Full Cream Milk",
    "category": "Dairy & Eggs",
    "calories": 62,
    "protein": 3.2,
    "carbs": 4.9,
    "fats": 3.5,
    "fiber": 0,
    "sugar": 4.9,
    "servingGrams": 250,
    "keywords": ["doodh", "dairy milk"]
  },
  {
    "id": "chicken-curry",
    "name": "Chicken Curry",
    "category": "Non-Veg",
    "calories": 163,
    "protein": 14.7,
    "carbs": 5.3,
    "fats": 9.3,
    "fiber": 0.5,
    "sugar": 2.0,
    "servingGrams": 150,
    "keywords": ["chicken masala", "hot curry"]
  }
];

app.use(cors());
app.use(express.json());

// Health check endpoint (no API key required)
app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'FitTrack API Server', status: 'running' });
});

// Macros endpoint - nutrition data for foods
app.post('/api/macros', async (req, res) => {
  const { name, quantity = 100 } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Food name is required' });
  }

  // First, try to find in local database
  try {
    const food = localFoods.find(f => 
      f.name.toLowerCase() === name.toLowerCase() ||
      f.name.toLowerCase().includes(name.toLowerCase()) ||
      (f.keywords && f.keywords.some(k => k.toLowerCase().includes(name.toLowerCase())))
    );
    
    if (food) {
      const scale = quantity / (food.servingGrams || 100);
      return res.json({
        name: food.name,
        quantity,
        calories: Math.round(food.calories * scale),
        protein: Math.round(food.protein * scale * 100) / 100,
        carbs: Math.round(food.carbs * scale * 100) / 100,
        fats: Math.round(food.fats * scale * 100) / 100,
        fiber: food.fiber ? Math.round(food.fiber * scale * 100) / 100 : 0,
        sugar: food.sugar ? Math.round(food.sugar * scale * 100) / 100 : 0,
        confidence: 85,
        source: 'local-database'
      });
    }
  } catch (e) {
    console.warn('Local database lookup failed:', e.message);
  }

  // Return 404 if not found in local database
  res.status(404).json({ error: 'Food not found in database', name });
});

// Scan endpoint - AI food scanning
app.post('/api/scan', async (req, res) => {
  const { items } = req.body;
  
  if (!items || (!Array.isArray(items) && !items.name)) {
    return res.status(400).json({ error: 'Food item(s) required' });
  }

  // Extract food names from items array or single item
  let foodList;
  if (Array.isArray(items)) {
    foodList = items.map(i => i.name || i).filter(Boolean);
  } else if (items.name) {
    foodList = [items.name];
  } else if (typeof items === 'string') {
    foodList = items.split(',').map(f => f.trim()).filter(Boolean);
  } else {
    foodList = [];
  }
  
  // Look up each food in local database
  const results = [];
  for (const foodName of foodList) {
    try {
      const food = localFoods.find(f => 
        f.name.toLowerCase() === foodName.toLowerCase() ||
        f.name.toLowerCase().includes(foodName.toLowerCase()) ||
        (f.keywords && f.keywords.some(k => k.toLowerCase().includes(foodName.toLowerCase())))
      );
      
      if (food) {
        results.push({
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fats: food.fats,
          fiber: food.fiber || 0,
          sugar: food.sugar || 0,
          confidence: 85,
          source: 'local-database'
        });
      } else {
        results.push({
          name: foodName,
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          fiber: 0,
          sugar: 0,
          confidence: 0,
          message: 'Food not found in database'
        });
      }
    } catch (e) {
      results.push({
        name: foodName,
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        fiber: 0,
        sugar: 0,
        confidence: 0,
        message: 'Error processing food'
      });
    }
  }
  
  res.json({ items: results, confidence: 85 });
});

// Food search endpoint
app.get('/api/foods', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Search query required' });
  }

  try {
    const results = localFoods.filter(f => 
      f.name.toLowerCase().includes(q.toLowerCase()) ||
      (f.keywords && f.keywords.some(k => k.toLowerCase().includes(q.toLowerCase())))
    ).slice(0, 20);
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});