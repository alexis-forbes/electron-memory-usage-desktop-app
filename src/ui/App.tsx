import { useStatistics } from './useStatistics';
import { useMemo, useEffect, useState } from 'react';
import { Chart } from './Chart';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState<View>('CPU');
  const stats = useStatistics(10);
  const cpuUsages = useMemo(() => stats.map(stat => stat.cpuUsage), [stats]);
  const ramUsages = useMemo(() => stats.map(stat => stat.ramUsage), [stats]);
  const storageUsages = useMemo(() => stats.map(stat => stat.storageUsage), [stats]);

  const activeUsages = useMemo(() => {
    switch (activeView) {
      case 'CPU':
        return cpuUsages;
      case 'RAM':
        return ramUsages;
      case 'STORAGE':
        return storageUsages;
    }
  }, [activeView, cpuUsages, ramUsages, storageUsages]);

  useEffect(() => {
    window.electron.subscribeChangeView((view) => setActiveView(view));
  }, []);

  return (
    <div className="App">
      <Chart data={activeUsages} maxDataPoints={10} /> 
    </div>
  );
}

export default App;
