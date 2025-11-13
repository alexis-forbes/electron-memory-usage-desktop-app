import { useStatistics } from './useStatistics';
import { useMemo } from 'react';
import { Chart } from './Chart';
import './App.css';

function App() {
  const stats = useStatistics(10);
  const cpuUsages = useMemo(() => stats.map(stat => stat.cpuUsage), [stats]);

  return (
    <div className="App">
      <Chart data={cpuUsages} maxDataPoints={10} /> 
    </div>
  );
}

export default App;
