import { useState, useMemo, useRef, useEffect } from 'react';
import { useTheme } from "../Utility/Theme";
import { FaLightbulb, FaHome, FaHistory, FaSignOutAlt } from "react-icons/fa";
import { useLocation, useNavigate } from 'react-router-dom';
import { toPng } from 'html-to-image';
import {
    ResponsiveContainer,
    LineChart, Line,
    BarChart, Bar,
    PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import ThreeDChart from './ThreeDChart';
import UserNavbar from '../Utility/UserNav';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CF5'];

const SheetAnalysis = () => {
    const { theme, toggleDarkMode } = useTheme();
    const URI = import.meta.env.VITE_BACKEND_URL;
    const location = useLocation();
    const navigate = useNavigate();
    const parsedData = location.state?.parsedData || [];
    const columns = location.state?.columns || [];

    const [xKey, setXKey] = useState('');
    const [yKey, setYKey] = useState('');
    const [zKey, setZKey] = useState('');
    const [graphType, setGraphType] = useState('line');
    const [is3D, setIs3D] = useState(false);
    const [aiInsights, setAiInsights] = useState(location.state?.aiInsights || "");
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
        const { width, height } = node.getBoundingClientRect();

        toPng(node, {
            width: Math.ceil(width),
            height: Math.ceil(height),
            style: {
                width: `${Math.ceil(width)}px`,
                height: `${Math.ceil(height)}px`,
            },
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

    const saveToHistory = () => {
        if (parsedData.length && columns.length) {
            const timestamp = new Date().toISOString();
            const summary = {
                id: timestamp,
                name: `File_${timestamp}`,
                columns,
                rows: parsedData.length,
                time: new Date().toLocaleString(),
            };
            const existing = JSON.parse(localStorage.getItem('uploadHistory')) || [];
            localStorage.setItem('uploadHistory', JSON.stringify([summary, ...existing]));
        }
    };

    useEffect(() => {
        saveToHistory();
    }, []);

    if (!parsedData.length) {
        return <p className="text-center text-gray-500 mt-6">No data to visualize.</p>;
    }

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
            {/* Navbar */}
             <UserNavbar />

            <h1 className="text-3xl ml-5 font-bold">Sheet Analysis</h1>

            {/* Two-column layout */}
            <div className="flex flex-1 w-full px-4 py-6 gap-6">
                {/* Left: AI Insights */}
                <div className="w-1/4 max-w-xs min-w-[220px]">
                    <div className="h-full bg-white dark:bg-gray-800 rounded shadow p-4 flex flex-col">
                        <h2 className="text-xl text-gray-100 font-semibold mb-2">AI Insights</h2>
                        {aiInsights ? (
                            <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-100 overflow-y-auto flex-1">{aiInsights}</pre>
                        ) : (
                            <p className="text-gray-500">No AI insights available.</p>
                        )}
                    </div>
                </div>

                {/* Right: Controls and Chart */}
                <div className="w-3/4 flex flex-col">
                    {/* Controls */}
                    <div className="flex flex-wrap gap-4 justify-center items-center mb-8">
                        <div>
                            <label>X-axis:</label>
                            <select value={xKey} onChange={e => setXKey(e.target.value)} className="ml-2 p-1 rounded border">
                                <option value="">Select</option>
                                {columns.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label>Y-axis:</label>
                            <select value={yKey} onChange={e => setYKey(e.target.value)} className="ml-2 p-1 rounded border">
                                <option value="">Select</option>
                                {columns.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label>Chart Type:</label>
                            <select value={graphType} onChange={e => setGraphType(e.target.value)} className="ml-2 p-1 rounded border">
                                <option value="line">Line</option>
                                <option value="bar">Bar</option>
                                <option value="pie">Pie</option>
                            </select>
                        </div>
                        {graphType === 'line' && (
                            <div className="flex items-center">
                                <input type="checkbox" checked={is3D} onChange={() => setIs3D(prev => !prev)} className="ml-2" />
                                <label className="ml-1">3D Mode</label>
                            </div>
                        )}
                        {is3D && graphType === 'line' && (
                            <div>
                                <label>Z-axis:</label>
                                <select value={zKey} onChange={e => setZKey(e.target.value)} className="ml-2 p-1 rounded border">
                                    <option value="">Select</option>
                                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Chart Area */}
                    <div className="relative mr-5 flex-1" ref={chartWrapperRef}>
                        {!is3D && (<button
                            onClick={handleDownload}
                            className="absolute -top-20 right-0 m-2 px-3 py-1 bg-blue-600 text-white rounded shadow z-10"
                        >
                            Download PNG
                        </button>)}

                        {xKey && yKey ? (
                            <ResponsiveContainer width="100%" height={400}>
                                {graphType === 'bar' && (
                                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                                        <Pie data={chartData} dataKey={yKey} nameKey={xKey} cx="50%" cy="50%" outerRadius={100}
                                            label={({ name, value }) => `y-${value}: x-${name}`}>
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
            </div>
        </div>
    );
};

export default SheetAnalysis;
