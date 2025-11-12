class QuadraticSolver {
    constructor() {
        this.apiUrl = 'https://fast-api-deployment-304955833763.northamerica-south1.run.app/solve';
        console.log('API URL set to:', this.apiUrl); 
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

        if (isNaN(a) || isNaN(b) || isNaN(c)) {
            this.showError('Please enter valid numbers for all coefficients.');
            return;
        }

        if (a === 0) {
            this.showError('Coefficient "a" cannot be zero for a quadratic equation.');
            return;
        }

        this.hideElement('error');
        this.hideElement('results');
        this.showLoading();

        try {
            console.log('Sending request to:', this.apiUrl);
            
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ a, b, c })
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Success! Data:', data);
            this.displayResults(data.roots, a, b, c);
            
        } catch (error) {
            console.error('Error:', error);
            this.showError(`Failed to calculate roots: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    displayResults(roots, a, b, c) {
        const rootsElement = document.getElementById('roots');
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
        
        if (this.chart) {
            this.chart.destroy();
        }

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
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: 'x' } },
                    y: { title: { display: true, text: 'f(x)' } }
                }
            }
        });
    }

    generateDataPoints(a, b, c, roots) {
        const data = [];
        const labels = [];
        let minX = -10;
        let maxX = 10;

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

document.addEventListener('DOMContentLoaded', () => {
    new QuadraticSolver();
});