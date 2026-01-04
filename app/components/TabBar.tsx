import { Link } from "react-router";

type TabType = 'home' | 'grades' | 'class-exams' | 'tricks' | 'history' | 'settings';

interface TabBarProps {
  activeTab: TabType;
}

export function TabBar({ activeTab }: TabBarProps) {
  return (
    <nav className="tab-bar">
      <Link to="/" className={`tab-item ${activeTab === 'home' ? 'active' : ''}`}>
        <span className="tab-icon">🏠</span>
        <span className="tab-label">ホーム</span>
      </Link>
      <Link to="/grades" className={`tab-item ${activeTab === 'grades' ? 'active' : ''}`}>
        <span className="tab-icon">🏆</span>
        <span className="tab-label">級・段</span>
      </Link>
      <Link to="/class-exams" className={`tab-item ${activeTab === 'class-exams' ? 'active' : ''}`}>
        <span className="tab-icon">🎯</span>
        <span className="tab-label">クラス<br/>検定</span>
      </Link>
      <Link to="/tricks" className={`tab-item ${activeTab === 'tricks' ? 'active' : ''}`}>
        <span className="tab-icon">🪀</span>
        <span className="tab-label">技</span>
      </Link>
      <Link to="/history" className={`tab-item ${activeTab === 'history' ? 'active' : ''}`}>
        <span className="tab-icon">📋</span>
        <span className="tab-label">履歴</span>
      </Link>
      <Link to="/settings" className={`tab-item ${activeTab === 'settings' ? 'active' : ''}`}>
        <span className="tab-icon">⚙️</span>
        <span className="tab-label">設定</span>
      </Link>
    </nav>
  );
}
