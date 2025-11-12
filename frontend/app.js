class QuadraticSolver {
    constructor() {
        this.apiUrl = 'https://fast-api-deployment-304955833763.northamerica-south1.run.app'; // backend Google Cloud URL
        this.chart = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('quadraticForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.solveEquation();
        });
    }

    async solveEquation() {
        const a = parseFloat(document.getElementById('a').value);
        const b = parseFloat(document.getElementById('b').value);
        const c = parseFloat(document.getElementById('c').value);

        // Hide previous results/errors
        this.hideElement('error');
        this.hideElement('results');

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ a, b, c })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            this.displayResults(data.roots, a, b, c);
        } catch (error) {
            this.showError('Failed to calculate roots. Please check your inputs and try again.');
        }
    }

    displayResults(roots, a, b, c) {
        const rootsElement = document.getElementById('roots');
        rootsElement.innerHTML = `Roots: ${roots.join(', ')}`;
        
        this.showElement('results');
        this.plotGraph(a, b, c, roots);
    }

    plotGraph(a, b, c, roots) {
        const ctx = document.getElementById('quadraticChart').getContext('2d');
        
        // Destroy previous chart if it exists
        if (this.chart) {
            this.chart.destroy();
        }

        // Generate data points
        const { data, labels } = this.generateDataPoints(a, b, c, roots);
        
        // Find real roots for annotations
        const realRoots = roots.filter(root => typeof root === 'number' || !isNaN(parseFloat(root)));

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `f(x) = ${a}x² + ${b}x + ${c}`,
                    data: data,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'x'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'f(x)'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                }
            }
        });
    }

    generateDataPoints(a, b, c, roots) {
        const data = [];
        const labels = [];
        
        // Determine range based on roots
        let minX = -10;
        let maxX = 10;
        
        const realRoots = roots.map(root => {
            if (typeof root === 'number') return root;
            const num = parseFloat(root);
            return isNaN(num) ? null : num;
        }).filter(root => root !== null);
        
        if (realRoots.length > 0) {
            const rootMin = Math.min(...realRoots);
            const rootMax = Math.max(...realRoots);
            minX = Math.min(minX, rootMin - 2);
            maxX = Math.max(maxX, rootMax + 2);
        }

        const step = (maxX - minX) / 50;
        
        for (let x = minX; x <= maxX; x += step) {
            const y = a * x * x + b * x + c;
            data.push(y);
            labels.push(x.toFixed(1));
        }

        return { data, labels };
    }

    showElement(id) {
        document.getElementById(id).classList.remove('hidden');
    }

    hideElement(id) {
        document.getElementById(id).classList.add('hidden');
    }

    showError(message) {
        const errorElement = document.getElementById('error');
        errorElement.textContent = message;
        this.showElement('error');
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new QuadraticSolver();
});