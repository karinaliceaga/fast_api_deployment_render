class QuadraticSolver {
    constructor() {
        // UPDATE THIS URL to your actual backend URL
        // For local testing: "http://localhost:8000"
        // For deployed backend: "https://your-backend-url.com"
        this.apiUrl = 'https://fast-api-deployment-304955833763.northamerica-south1.run.app'; // Change this to your actual backend URL
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

        // Validate inputs
        if (isNaN(a) || isNaN(b) || isNaN(c)) {
            this.showError('Please enter valid numbers for all coefficients.');
            return;
        }

        if (a === 0) {
            this.showError('Coefficient "a" cannot be zero for a quadratic equation.');
            return;
        }

        // Hide previous results/errors
        this.hideElement('error');
        this.hideElement('results');

        // Show loading state
        this.showLoading();

        try {
            console.log('Sending request to:', `${this.apiUrl}/solve`);
            
            const response = await fetch(`${this.apiUrl}/solve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ a, b, c })
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                throw new Error(`Server error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('Received data:', data);
            
            this.displayResults(data.roots, a, b, c);
        } catch (error) {
            console.error('Error details:', error);
            this.showError(`Failed to calculate roots: ${error.message}. Please check that the backend server is running and accessible.`);
        } finally {
            this.hideLoading();
        }
    }

    displayResults(roots, a, b, c) {
        const rootsElement = document.getElementById('roots');
        
        // Format roots for display
        let rootsHTML = '<strong>Roots:</strong><br>';
        roots.forEach((root, index) => {
            rootsHTML += `Root ${index + 1}: ${root}<br>`;
        });
        
        rootsElement.innerHTML = rootsHTML;
        
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
                    tension: 0.4,
                    pointBackgroundColor: '#ff6b6b',
                    pointBorderColor: '#ff6b6b',
                    pointRadius: 4,
                    pointHoverRadius: 6
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
                    },
                    legend: {
                        display: true,
                        position: 'top'
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
        
        // Extract real roots for range calculation
        const realRoots = roots.map(root => {
            if (typeof root === 'number') return root;
            // Handle complex roots - just use real part
            const match = root.toString().match(/^(-?\d+\.?\d*)/);
            return match ? parseFloat(match[1]) : 0;
        }).filter(root => !isNaN(root));

        if (realRoots.length > 0) {
            const rootMin = Math.min(...realRoots);
            const rootMax = Math.max(...realRoots);
            minX = Math.min(minX, rootMin - 3);
            maxX = Math.max(maxX, rootMax + 3);
        }

        const step = (maxX - minX) / 100;
        
        for (let x = minX; x <= maxX; x += step) {
            const y = a * x * x + b * x + c;
            data.push(y);
            labels.push(x.toFixed(2));
        }

        return { data, labels };
    }

    showLoading() {
        const button = document.querySelector('button');
        button.textContent = 'Calculating...';
        button.disabled = true;
    }

    hideLoading() {
        const button = document.querySelector('button');
        button.textContent = 'Calculate Roots';
        button.disabled = false;
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