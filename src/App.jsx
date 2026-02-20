import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NewPresupuestoPage from './pages/NewPresupuestoPage';
import PresupuestoDetailPage from './pages/PresupuestoDetailPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Pantalla principal con la lista */}
        <Route path="/" element={<HomePage />} />
        
        {/* Formulario para crear nuevo presupuesto */}
        <Route path="/new" element={<NewPresupuestoPage />} />
        
        {/* Detalle de un presupuesto específico para generar PDF */}
        <Route path="/presupuesto/:id" element={<PresupuestoDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
