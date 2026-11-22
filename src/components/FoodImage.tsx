import { FOOD_IMAGE_FALLBACK } from '../data/foodImages'
import { UtensilsCrossed } from 'lucide-react'

/**
 * Food visual tile. Food photos were removed from the product, so every food
 * renders the shared local placeholder — a soft gradient tile with a utensils
 * glyph. No broken icons, no external URLs, ever.
 */
export function FoodImage({
  alt,
  className = '',
  iconSize = 16,
}: {
  foodId?: string
  alt: string
  className?: string
  iconSize?: number
}) {
  return (
    <div
      className={`relative overflow-hidden bg-tile ${className}`}
      role="img"
      aria-label={alt}
      title={alt}
      style={{ backgroundImage: FOOD_IMAGE_FALLBACK ? undefined : undefined }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(150deg, var(--color-food-a) 0%, var(--color-food-b) 55%, var(--color-food-c) 100%)',
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <UtensilsCrossed size={iconSize} className="text-accent/70" strokeWidth={2} />
      </div>
    </div>
  )
}
