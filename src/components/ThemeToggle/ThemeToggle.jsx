import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
    const { darkMode, setDarkMode } = useTheme();

    return (
        <button
            onClick={() => setDarkMode(!darkMode)}
            className={`theme-toggle ${darkMode ? 'dark' : 'light'}`}
        >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
    );
};

export default ThemeToggle;