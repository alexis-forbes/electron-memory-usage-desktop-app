import { useEffect, useState } from "react";

// i want at max "x" datapoints to be displayed on the chart
export const useStatistics = (dataPointCount: number): Statistics[] => {
  const [value, setValue] = useState<Statistics[]>([]);
// useEffect runs whenever the component is mounted, unmounted, or updated because of dependency array
  useEffect(() => {
    const unsubscribe = window.electron.subscribeStatistics((stats) => {
      // we need the previous value to update our current value
      // we want all of the previous values + the new stats
      // we need to use the dataPointCount to limit the number of datapoints
      // otherwise if for e.g we want 10 dataPoints ad we already have 10 dataPoints 
      // we would add 11, 12 and 13 at the end and not clear up
      setValue((prev) => {
        const newData = [...prev, stats];
        if (newData.length > dataPointCount) {
          newData.shift();
        }
        return newData;
      });
    });
    // we clean up the subscription when the component is unmounted and data isn't needed anymore
    return unsubscribe;
  }, [dataPointCount]);

  return value;
}