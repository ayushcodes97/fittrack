import { useState } from 'react'
import { Plus, Search, Edit3, Trash2, Clock, Utensils } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { tapSoft } from '../utils/haptics'
import { Button, Card, Input, EmptyState } from '../components/ui'

type Recipe = {
  id: string
  name: string
  description: string
  ingredients: string[]
  instructions: string[]
  calories: number
  protein: number
  carbs: number
  fat: number
  servings: number
  createdAt: string
}

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    description: '',
    ingredients: '',
    instructions: '',
    servings: 1,
  })

  const addRecipe = () => {
    tapSoft()
    const recipe: Recipe = {
      id: crypto.randomUUID(),
      name: newRecipe.name,
      description: newRecipe.description,
      ingredients: newRecipe.ingredients.split('\n').filter(Boolean),
      instructions: newRecipe.instructions.split('\n').filter(Boolean),
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      servings: newRecipe.servings,
      createdAt: new Date().toISOString(),
    }
    setRecipes([recipe, ...recipes])
    setShowForm(false)
    setNewRecipe({ name: '', description: '', ingredients: '', instructions: '', servings: 1 })
  }

  const deleteRecipe = (id: string) => {
    tapSoft()
    setRecipes(recipes.filter((r) => r.id !== id))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Recipe Builder</h1>
          <p className="text-sm text-muted">Create and save your own recipes</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white font-medium press hover:bg-green-700 transition-colors shadow-lg shadow-green-900/30"
        >
          <Plus size={18} /> New Recipe
        </button>
      </div>

      {showForm && (
        <Card className="p-5">
          <h2 className="font-bold text-text mb-4">Create New Recipe</h2>
          <div className="space-y-3">
            <Input
              label="Recipe Name"
              value={newRecipe.name}
              onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
            />
            <Input
              label="Description"
              value={newRecipe.description}
              onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted">Ingredients (one per line)</label>
              <textarea
                value={newRecipe.ingredients}
                onChange={(e) => setNewRecipe({ ...newRecipe, ingredients: e.target.value })}
                rows={3}
                className="px-3 py-2 rounded-xl border border-border bg-tile text-sm focus:ring-2 focus:ring-accent/50 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted">Instructions (one per line)</label>
              <textarea
                value={newRecipe.instructions}
                onChange={(e) => setNewRecipe({ ...newRecipe, instructions: e.target.value })}
                rows={4}
                className="px-3 py-2 rounded-xl border border-border bg-tile text-sm focus:ring-2 focus:ring-accent/50 outline-none"
              />
            </div>
            <Input
              label="Servings"
              type="number"
              value={newRecipe.servings}
              onChange={(e) => setNewRecipe({ ...newRecipe, servings: Number(e.target.value) || 1 })}
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={addRecipe}
              className="flex-1 py-3 rounded-xl bg-accent text-white font-medium press hover:bg-green-700 transition-colors"
            >
              Save Recipe
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-3 rounded-xl border border-border bg-tile text-text font-medium press hover:bg-tile/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {recipes.length === 0 ? (
          <EmptyState
            icon={<Utensils size={48} className="mx-auto mb-4 text-muted" />}
            title="No recipes yet"
            desc="Create your first recipe by tapping 'New Recipe'"
            action={
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2 rounded-xl bg-accent text-white font-medium press hover:bg-green-700 transition-colors"
              >
                Create Recipe
              </button>
            }
          />
        ) : (
          recipes.map((recipe) => (
            <Card key={recipe.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-text">{recipe.name}</h3>
                  <p className="text-sm text-muted">{recipe.description || 'No description'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editRecipe(recipe.id)}
                    className="p-2 rounded-lg border border-border bg-tile text-muted press hover:bg-tile/80 transition-colors"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => deleteRecipe(recipe.id)}
                    className="p-2 rounded-lg border border-border bg-tile text-muted press hover:text-danger hover:border-danger/30 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Calories per serving</span>
                  <span className="font-medium text-text">{recipe.calories} kcal</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Protein / Carbs / Fat</span>
                  <span className="font-medium text-text">
                    {recipe.protein}g / {recipe.carbs}g / {recipe.fat}g
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted">
                  <span>Servings: {recipe.servings}</span>
                  <span>{new Date(recipe.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {recipe.ingredients.map((ing, i) => (
                  <span key={i} className="rounded-lg border border-border bg-tile px-2 py-1 text-xs text-muted">
                    {ing}
                  </span>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

function editRecipe(id: string) {
  // Placeholder for edit functionality
}