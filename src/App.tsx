import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { PlanDetail } from './pages/PlanDetail';
import { PlanForm } from './components/PlanForm';
import { FAB } from './components/FAB';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/plan/:id" element={<PlanDetail />} />
          </Routes>
          <FAB onClick={() => setIsModalOpen(true)} />
          {isModalOpen && <PlanForm onClose={() => setIsModalOpen(false)} />}
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
