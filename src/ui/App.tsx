import { useEffect } from 'react';
import { BaseChart } from './BaseChart';
import './App.css';

function App() {
  // useEffect runs whenever the component is mounted, unmounted, or updated because of dependency array
  useEffect(() => {
    const unsubscribe = window.electron.subscribeStatistics((stats) => console.log(stats));
    // we clean up the subscription when the component is unmounted and data isn't needed anymore
    return unsubscribe;
  }, []);

  return (
    <div className="App">
      <div style={{ height: 120, width: '100%' }}>
        <BaseChart data={[{ value: 25 }, { value: 50 }, { value: 75 }, { value: 100 }]} />
      </div>
    </div>
  );
}

export default App;
