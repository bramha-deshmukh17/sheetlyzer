import React, { useState } from 'react';
import { useTheme } from "../Utility/Theme";
import { FaLightbulb, FaUpload } from "react-icons/fa";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';
import ThreeDChart from './ThreeDChart';

const Dashboard = () => {
    const { theme, toggleDarkMode } = useTheme();
    const URI = import.meta.env.VITE_BACKEND_URL;

    const [file, setFile] = useState(null);
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [xKey, setXKey] = useState("");
    const [yKey, setYKey] = useState("");
    const [zKey, setZKey] = useState("");
    const [graphType, setGraphType] = useState('line');
    const [is3D, setIs3D] = useState(false);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) setFile(selected);
    };

    const handleUpload = () => {
        if (!file) return;
        const ext = file.name.split('.').pop().toLowerCase();
        const reader = new FileReader();
        reader.onload = (evt) => {
            const content = evt.target.result;
            let jsonData;
            if (ext === 'csv') {
                const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
                jsonData = parsed.data;
                setColumns(parsed.meta.fields);
            } else {
                const workbook = XLSX.read(content, { type: 'binary' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
                setColumns(Object.keys(jsonData[0] || {}));
            }
            setData(jsonData);
        };
        if (ext === 'csv') reader.readAsText(file);
        else reader.readAsBinaryString(file);
    };

    const chartData = data.map(row => ({
        ...row,
        [xKey]: row[xKey],
        [yKey]: yKey ? parseFloat(row[yKey]) || 0 : 0,
        [zKey]: zKey ? parseFloat(row[zKey]) || 0 : 0,
    }));

    const logout = () => {
        window.location.href = `${URI}/user/logout`;
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CF5'];

    return (
        <div className={`min-h-screen p-6 flex flex-col items-center ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
            <div className="w-full mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-left">User Dashboard</h1>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full transition-transform duration-300 transform hover:scale-110 hover:bg-gray-200 dark:hover:bg-gray-700"
                        title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    >
                        <FaLightbulb className="text-2xl" />
                    </button>
                    <button
                        onClick={logout}
                        className="px-4 py-2 rounded-lg shadow transition-colors duration-300 hover:bg-red-100 dark:hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="w-full max-w-2xl p-4 rounded-lg shadow mb-6 flex items-center justify-center">
                <label htmlFor="file-input" className="flex items-center cursor-pointer space-x-2 p-2 border rounded">
                    <FaUpload className="text-xl" />
                    <span>{file ? file.name : 'Choose CSV or XLSX'}</span>
                </label>
                <input
                    id="file-input"
                    type="file"
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <button
                    onClick={handleUpload}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                >
                    Upload & Parse
                </button>
            </div>

            {data.length > 0 && (
                <div className="w-full max-w-2xl p-4 rounded-lg shadow">
                    <div className="flex flex-wrap gap-4 mb-4 items-center">
                        <div>
                            <label>X-axis:</label>
                            <select
                                value={xKey}
                                onChange={e => setXKey(e.target.value)}
                                className="ml-2 p-1 rounded border"
                            >
                                <option value="">Select</option>
                                {columns.map(col => (
                                    <option key={col} value={col}>{col}</option>
                                ))}
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
                                {columns.map(col => (
                                    <option key={col} value={col}>{col}</option>
                                ))}
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
                        {graphType === 'line'  && (
                            
                                
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
                        {is3D && (
                            <div>
                                <label>Z-axis:</label>
                                <select
                                    value={zKey}
                                    onChange={e => setZKey(e.target.value)}
                                    className="ml-2 p-1 rounded border"
                                >
                                    <option value="">Select</option>
                                    {columns.map(col => (
                                        <option key={col} value={col}>{col}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {xKey && yKey && (!is3D || graphType !== 'line') && (
                        <ResponsiveContainer width="100%" height={300}>
                            {graphType === 'bar' && (
                                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barCategoryGap="20%">
                                    <CartesianGrid opacity={0.2} />
                                    <XAxis dataKey={xKey} angle={-45} textAnchor="end" height={60} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey={yKey} barSize={30} />
                                </BarChart>
                            )}

                            {graphType === 'line' && (
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
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label={({ name, value }) => `y-${value} : x-${name}`}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Legend verticalAlign="bottom" height={36} />
                                    <Tooltip />
                                </PieChart>
                            )}
                        </ResponsiveContainer>
                    )}

                    {xKey && yKey && zKey && graphType === 'line' && is3D && (
                        <ThreeDChart data={chartData} xKey={xKey} yKey={yKey} zKey={zKey} />
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
