import { useState } from "react";
import { Sidebar } from "../Sidebar/Sidebar";

export function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="app-main">
        {children}
      </main>
    </div>
  );
}
