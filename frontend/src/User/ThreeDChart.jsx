import Plot from 'react-plotly.js';

const ThreeDChart = ({ data, xKey, yKey, zKey, chartType = 'scatter3d' }) => {
    if (!data || !xKey || !yKey || !zKey) return <p>Please select X, Y, and Z axes.</p>;

    const trace = {
        x: data.map(d => d[xKey]),
        y: data.map(d => parseFloat(d[yKey])),
        z: data.map(d => parseFloat(d[zKey])),
        mode: 'lines+markers',
        type: chartType, // 'scatter3d' or 'mesh3d' or others
        marker: {
            size: 5,
            color: data.map(d => parseFloat(d[zKey])),
            colorscale: 'Viridis',
            showscale: true
        },
        line: {
            width: 2
        }
    };

    const layout = {
        title: `3D ${chartType.toUpperCase()} of ${xKey}, ${yKey}, ${zKey}`,
        autosize: true,
        scene: {
            xaxis: { title: xKey },
            yaxis: { title: yKey },
            zaxis: { title: zKey },
        },
        margin: {
            l: 0, r: 0, b: 0, t: 40,
        },
    };

    return (
        <div style={{ width: '90%', height: '500px', margin: '5%' }}>
            <Plot
                data={[trace]}
                layout={layout}
                useResizeHandler
                style={{ width: '100%', height: '100%' }}
                config={{ responsive: true }}
            />
        </div>
    );
};

export default ThreeDChart;
