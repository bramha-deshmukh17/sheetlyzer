// src/User/SheetAnalysis.jsx
import { useState, useMemo, useRef } from 'react';
import { useTheme } from "../Utility/Theme";
import { FaLightbulb } from "react-icons/fa";
import { useLocation } from 'react-router-dom';
import { toPng } from 'html-to-image';
import {
    ResponsiveContainer,
    LineChart, Line,
    BarChart, Bar,
    PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import ThreeDChart from './ThreeDChart';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CF5'];

const SheetAnalysis = () => {
    const { theme, toggleDarkMode } = useTheme();
    const URI = import.meta.env.VITE_BACKEND_URL;
    const location = useLocation();
    const parsedData = location.state?.parsedData || [];
    const columns = location.state?.columns || [];

    const [xKey, setXKey] = useState('');
    const [yKey, setYKey] = useState('');
    const [zKey, setZKey] = useState('');
    const [graphType, setGraphType] = useState('line');
    const [is3D, setIs3D] = useState(false);

    // ref for the entire chart area
    const chartWrapperRef = useRef(null);

    const chartData = useMemo(() =>
        parsedData.map(row => ({
            ...row,
            [yKey]: yKey ? parseFloat(row[yKey]) || 0 : 0,
            [zKey]: zKey ? parseFloat(row[zKey]) || 0 : 0,
        }))
        , [parsedData, yKey, zKey]);

    const handleDownload = () => {
        const node = chartWrapperRef.current;
        if (!node) return;

        // grab the actual size of the chart wrapper
        const { width, height } = node.getBoundingClientRect();

        // tell html-to-image to use those exact dimensions
        toPng(node, {
            width: Math.ceil(width),
            height: Math.ceil(height),
            style: {
                // ensure the cloned node renders at full size
                width: `${Math.ceil(width)}px`,
                height: `${Math.ceil(height)}px`,
            },
            // optional: bump pixelRatio for higher resolution
            pixelRatio: 2,
        })
            .then(dataUrl => {
                const link = document.createElement('a');
                link.download = `${graphType}${is3D ? '_3D' : ''}_chart.png`;
                link.href = dataUrl;
                link.click();
            })
            .catch(err => console.error('Export failed:', err));
    };
          
    const logout = () => window.location.href = `${URI}/user/logout`;

    if (!parsedData.length) {
        return <p className="text-center text-gray-500 mt-6">No data to visualize.</p>;
    }

    return (
        <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
            <div className="w-full mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold">User Dashboard</h1>
                <div className="flex items-center space-x-4">
                    <button onClick={toggleDarkMode} className="p-2 rounded-full hover:scale-110">
                        <FaLightbulb className="text-2xl" />
                    </button>
                    <button onClick={logout} className="px-4 py-2 rounded shadow">
                        Logout
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 justify-center items-center mx-auto my-8">
                <div>
                    <label>X-axis:</label>
                    <select
                        value={xKey}
                        onChange={e => setXKey(e.target.value)}
                        className="ml-2 p-1 rounded border"
                    >
                        <option value="">Select</option>
                        {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label>Y-axis:</label>
                    <select
                        value={yKey}
                        onChange={e => setYKey(e.target.value)}
                        className="ml-2 p-1 rounded border"
                    >
                        <option value="">Select</option>
                        {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label>Chart Type:</label>
                    <select
                        value={graphType}
                        onChange={e => setGraphType(e.target.value)}
                        className="ml-2 p-1 rounded border"
                    >
                        <option value="line">Line</option>
                        <option value="bar">Bar</option>
                        <option value="pie">Pie</option>
                    </select>
                </div>
                {graphType === 'line' && (
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={is3D}
                            onChange={() => setIs3D(prev => !prev)}
                            className="ml-2"
                        />
                        <label className="ml-1">3D Mode</label>
                    </div>
                )}
                {is3D && graphType === 'line' && (
                    <div>
                        <label>Z-axis:</label>
                        <select
                            value={zKey}
                            onChange={e => setZKey(e.target.value)}
                            className="ml-2 p-1 rounded border"
                        >
                            <option value="">Select</option>
                            {columns.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {/* Download button + Chart */}
            <div className="relative mx-auto" ref={chartWrapperRef}>
                {!is3D && (<button
                    onClick={handleDownload}
                    className="absolute -top-20 right-0 m-2 px-3 py-1 bg-blue-600 text-white rounded shadow z-10"
                >
                    Download PNG
                </button>)}

                {xKey && yKey ? (
                    <ResponsiveContainer width="100%" height={400}>
                        {graphType === 'bar' && (
                            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barCategoryGap="20%">
                                <CartesianGrid opacity={0.2} />
                                <XAxis dataKey={xKey} angle={-45} textAnchor="end" height={60} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey={yKey} barSize={30} />
                            </BarChart>
                        )}
                        {graphType === 'line' && !is3D && (
                            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid opacity={0.2} />
                                <XAxis dataKey={xKey} angle={-45} textAnchor="end" height={60} />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey={yKey} strokeWidth={3} dot={{ r: 3 }} />
                            </LineChart>
                        )}
                        {graphType === 'pie' && (
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    dataKey={yKey}
                                    nameKey={xKey}
                                    cx="50%" cy="50%" outerRadius={100}
                                    label={({ name, value }) => `y-${value}: x-${name}`}
                                >
                                    {chartData.map((e, i) =>
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    )}
                                </Pie>
                                <Legend verticalAlign="bottom" height={36} />
                                <Tooltip />
                            </PieChart>
                        )}
                        {graphType === 'line' && is3D && (
                            <ThreeDChart data={chartData} xKey={xKey} yKey={yKey} zKey={zKey} />
                        )}
                    </ResponsiveContainer>
                ) : (
                    <p className="text-center text-gray-600 py-20">
                        Please select both X and Y axes to render a chart.
                    </p>
                )}
            </div>
        </div>
    );
};

export default SheetAnalysis;
