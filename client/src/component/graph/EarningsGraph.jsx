import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";

const EarningsGraph = ({ data }) => {
    return (
        <div className="mt-4">
            <div className="section-title">
                <h4>
                    Earnings Statistics
                </h4>
            </div>
            <div style={{ width: "100%", height: 400 }}>
                <ResponsiveContainer>
                    <AreaChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        {/* Gradient for the area under the line */}
                        <defs>
                            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        {/* Grid and Axes */}
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: "#666", fontSize: 12 }}
                            axisLine={{ stroke: "#666" }}
                        />
                        <YAxis
                            tick={{ fill: "#666", fontSize: 12 }}
                            axisLine={{ stroke: "#666" }}
                        />

                        {/* Tooltip with custom styling */}
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#1e1e1e",
                                border: "none",
                                borderRadius: "8px",
                                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                            }}
                            itemStyle={{ color: "#fff" }}
                            labelStyle={{ color: "#fff", fontWeight: "bold" }}
                        />

                        {/* Legend with custom styling */}
                        <Legend
                            wrapperStyle={{
                                paddingTop: "20px",
                                fontSize: "14px",
                                color: "#666",
                            }}
                        />

                        {/* Area under the line */}
                        <Area
                            type="monotone"
                            dataKey="earnings"
                            stroke="#8884d8"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorEarnings)"
                        />

                        {/* Smooth line for earnings */}
                        <Line
                            type="monotone"
                            dataKey="earnings"
                            stroke="#8884d8"
                            strokeWidth={3}
                            dot={{ fill: "#8884d8", r: 5 }}
                            activeDot={{ r: 8 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default EarningsGraph;