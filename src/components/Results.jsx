import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function Results() {
  const dummyData = [
    { name: "Jan", sentiment: 80 },
    { name: "Feb", sentiment: 65 },
    { name: "Mar", sentiment: 90 }
  ];

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">📈 Analysis Results</h2>
      <LineChart width={600} height={300} data={dummyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="sentiment" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </div>
  );
}
