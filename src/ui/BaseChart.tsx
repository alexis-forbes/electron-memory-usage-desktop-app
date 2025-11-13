import { Area, AreaChart, CartesianGrid, ResponsiveContainer } from 'recharts';

type BaseChartProps = {
  data: { value?: number }[];
};

export const BaseChart = (props: BaseChartProps) => {
  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
    >
      <AreaChart data={props.data}>
        <CartesianGrid
          stroke="#333"
          strokeDasharray="5 5"
          fill="#1C1C1C"
        />
        <Area
          fillOpacity={0.3}
          type="monotone"
          dataKey="value"
          stroke="#5DD4EE"
          strokeWidth={3}
          fill="#0A4D5C"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
