import { BaseChart } from "./BaseChart";
import { useMemo } from "react";

export type ChartProps = {
  data: number[];
  maxDataPoints: number;
}

export const Chart = (props: ChartProps) => {
  // everytime we manipulate data, we use useMemo to prevent re-rendering
  // when dependencies change the function is called again and data is recalculated
  // convert the cpu usage to percentage because point is a value between 0 and 1 and returns an object with a value property
  const preparedData = useMemo(() => {
    const points = props.data.map(point => ({ value: point * 100 }));
    // if we want 10 points but we only have 5 we add an array of another 5 points
    // fills the array until it reaches the maxDataPoints
    // if we have N points and M maxDatapoints, it creates objects of M-N undefined values
    // uses spread to merge the two arrays: first the real points then the undefined points
    // undefined makes Recharts not draw a line for that point but rather create gaps
    // Array.from({ length: k }, () => ({ value: undefined })) creates an array of k undefined values for every position
    return [...points, ...Array.from({ length: props.maxDataPoints - points.length }, () => ({ value: undefined }))];
  }, [props.data, props.maxDataPoints]);

  return (
    <div>
      <BaseChart data={preparedData} />
    </div>
  );
}