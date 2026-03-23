import { Board } from './components/Board'
import { Lobby } from './components/Lobby'
import { useGameStore } from './store/gameStore'
import './index.css'

function App() {
  const roomId = useGameStore(state => state.roomId);
  const error = useGameStore(state => state.error);

  return (
    <div className="app-root">
      {error && <div className="error-toast">{error}</div>}

      {!roomId ? (
        <Lobby />
      ) : (
        <Board />
      )}

      <style>{`
        .error-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #ff4d4d;
          color: white;
          padding: 1rem 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 1000;
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default App
