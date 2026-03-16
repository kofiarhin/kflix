import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

const App = () => (
  <div className="min-h-screen bg-slate-800 text-white">
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </div>
);

export default App;
