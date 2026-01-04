import type { Route } from "./+types/settings";
import { TabBar } from "../components/TabBar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "設定 - けん玉練習アプリ" },
    { name: "description", content: "アプリの設定" },
  ];
}

export default function Settings() {
  const handleClearData = () => {
    if (confirm('全てのデータを消去しますか？この操作は取り消せません。')) {
      localStorage.removeItem('kendama-practice-data');
      window.location.reload();
    }
  };

  return (
    <div className="home-container">
      <header className="app-header">
        <h1 className="app-title">設定 ⚙️</h1>
      </header>
      
      <div className="content">
        <div className="settings-section">
          <h2 className="settings-section-title">データ</h2>
          <button 
            className="settings-button danger"
            onClick={handleClearData}
            type="button"
          >
            データを消去
          </button>
          <p className="settings-note">
            全ての練習記録と級の情報が削除されます。この操作は取り消せません。
          </p>
        </div>

        <div className="settings-section">
          <h2 className="settings-section-title">アプリ情報</h2>
          <div className="settings-info">
            <p className="settings-info-item">
              <span className="settings-info-label">バージョン</span>
              <span className="settings-info-value">1.0.0</span>
            </p>
          </div>
        </div>
      </div>
      
      <TabBar activeTab="settings" />
    </div>
  );
}
