import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          {/* Fallback route */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
