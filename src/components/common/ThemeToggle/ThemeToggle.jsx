import { FiSun, FiMoon } from 'react-icons/fi'
import { useThemeStore } from '../../../stores'
import { ToggleButton } from './ThemeToggle.styles'

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useThemeStore()

  return (
    <ToggleButton onClick={toggleTheme} aria-label="테마 전환">
      {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
    </ToggleButton>
  )
}

export default ThemeToggle
