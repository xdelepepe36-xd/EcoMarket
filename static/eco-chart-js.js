// Chart JS - Gráficos interactivos
class EcoChartJS {
    constructor() {
        this.init();
    }

    init() {
        this.createBarChart();
        this.createLineChart();
        this.createPieChart();
    }

    createBarChart() {
        const container = document.createElement('div');
        container.className = 'chart-container';
        container.innerHTML = `
            <h3>📊 Ventas mensuales</h3>
            <canvas id="barChart"></canvas>
        `;
        document.body.appendChild(container);

        this.drawBarChart();
    }

    drawBarChart() {
        const canvas = document.getElementById('barChart');
        const ctx = canvas.getContext('2d');
        
        // Datos del gráfico
        const data = [120, 190, 300, 250, 200, 350];
        const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        
        // Configuración del gráfico
        const maxValue = Math.max(...data);
        const barWidth = 40;
        const barSpacing = 30;
        const chartHeight = 300;
        const chartWidth = (barWidth + barSpacing) * data.length;
        
        canvas.width = chartWidth + 100;
        canvas.height = chartHeight + 100;
        
        // Dibujar barras
        data.forEach((value, index) => {
            const barHeight = (value / maxValue) * chartHeight;
            const x = 50 + index * (barWidth + barSpacing);
            const y = chartHeight + 30 - barHeight;
            
            // Gradiente para la barra
            const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
            gradient.addColorStop(0, '#2ecc71');
            gradient.addColorStop(1, '#27ae60');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Etiqueta del valor
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(value, x + barWidth / 2, y - 10);
            
            // Etiqueta del mes
            ctx.fillText(labels[index], x + barWidth / 2, chartHeight + 50);
        });
    }

    createLineChart() {
        const container = document.createElement('div');
        container.className = 'chart-container';
        container.innerHTML = `
            <h3>📈 Tendencia de crecimiento</h3>
            <canvas id="lineChart"></canvas>
        `;
        document.body.appendChild(container);

        this.drawLineChart();
    }

    drawLineChart() {
        const canvas = document.getElementById('lineChart');
        const ctx = canvas.getContext('2d');
        
        const data = [100, 150, 130, 200, 250, 300];
        const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        
        const maxValue = Math.max(...data);
        const chartHeight = 250;
        const chartWidth = 500;
        
        canvas.width = chartWidth + 100;
        canvas.height = chartHeight + 100;
        
        // Dibujar línea
        ctx.beginPath();
        ctx.strokeStyle = '#2ecc71';
        ctx.lineWidth = 3;
        
        data.forEach((value, index) => {
            const x = 50 + (index / (data.length - 1)) * chartWidth;
            const y = chartHeight + 30 - (value / maxValue) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            // Punto
            ctx.fillStyle = '#2ecc71';
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Etiqueta
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(labels[index], x, chartHeight + 50);
        });
        
        ctx.stroke();
    }

    createPieChart() {
        const container = document.createElement('div');
        container.className = 'chart-container';
        container.innerHTML = `
            <h3>🥧 Distribución de categorías</h3>
            <canvas id="pieChart"></canvas>
        `;
        document.body.appendChild(container);

        this.drawPieChart();
    }

    drawPieChart() {
        const canvas = document.getElementById('pieChart');
        const ctx = canvas.getContext('2d');
        
        const data = [30, 25, 20, 15, 10];
        const labels = ['Alimentación', 'Higiene', 'Hogar', 'Accesorios', 'Otros'];
        const colors = ['#2ecc71', '#3498db', '#e74c3c', '#f39c12', '#9b59b6'];
        
        const total = data.reduce((a, b) => a + b, 0);
        const centerX = 200;
        const centerY = 150;
        const radius = 100;
        
        canvas.width = 400;
        canvas.height = 300;
        
        let startAngle = 0;
        
        data.forEach((value, index) => {
            const sliceAngle = (value / total) * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            
            ctx.fillStyle = colors[index];
            ctx.fill();
            
            // Leyenda
            const legendX = 320;
            const legendY = 50 + index * 30;
            
            ctx.fillStyle = colors[index];
            ctx.fillRect(legendX, legendY, 15, 15);
            
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`${labels[index]} (${value}%)`, legendX + 25, legendY + 12);
            
            startAngle += sliceAngle;
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoChartJS();
});