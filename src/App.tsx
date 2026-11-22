import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Diary from './pages/Diary'
import Diets from './pages/Diets'
import FoodSearch from './pages/FoodSearch'
import Scan from './pages/Scan'
import Progress from './pages/Progress'
import Water from './pages/Water'
import Activity from './pages/Activity'
import Weight from './pages/Weight'
import Profile from './pages/Profile'
import Workout from './pages/Workout'
import Barcode from './pages/Barcode'
import BodyMeasurements from './pages/BodyMeasurements'
import Recipes from './pages/Recipes'
import MealPlanner from './pages/MealPlanner'
import { useApp } from './store/AppContext'

function hexToRgba(hex: string, alpha: number): string {
  const match = /^#?([0-9a-f]{6})$/i.exec((hex ?? '').trim())
  if (!match) return `rgba(23, 121, 92, ${alpha})` // safe forest-green fallback
  const h = match[1]
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function AccentSync() {
  const { profile } = useApp()
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--color-accent', profile.accent)
    root.style.setProperty('--color-accent-dim', hexToRgba(profile.accent, 0.1))
  }, [profile.accent])
  return null
}

export default function App() {
  return (
    <>
      <AccentSync />
      <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/diary" element={<Diary />} />
        <Route path="/search" element={<FoodSearch />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/barcode" element={<Barcode />} />
        <Route path="/workout" element={<Workout />} />
        <Route path="/programs" element={<Workout />} />
        <Route path="/measurements" element={<BodyMeasurements />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/meal-planner" element={<MealPlanner />} />
        <Route path="/diets" element={<Diets />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/water" element={<Water />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/weight" element={<Weight />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      </Routes>
    </>
  )
}