document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const bmiForm = document.getElementById('bmi-form');
    const weightInput = document.getElementById('weight');
    const heightInput = document.getElementById('height');
    const ageInput = document.getElementById('age');
    const genderSelect = document.getElementById('gender');
    const metricBtn = document.getElementById('metric');
    const imperialBtn = document.getElementById('imperial');
    const bmiValue = document.getElementById('bmi-value');
    const bmiCategory = document.getElementById('bmi-category');
    const bmiMarker = document.getElementById('bmi-marker');
    const recommendationText = document.getElementById('recommendation-text');
    const resultDisplay = document.getElementById('result-display');
    const initialMessage = document.getElementById('initial-message');
    const historyList = document.getElementById('history-list');
    const unitLabels = document.querySelectorAll('.unit-label');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // État de l'application
    let isMetric = true;
    let bmiHistory = JSON.parse(localStorage.getItem('bmiHistory')) || [];
    let historyChart = null;

    // Initialisation
    updateHistoryDisplay();

    // Gestion des onglets
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
            
            if (tab.dataset.tab === 'history') {
                renderHistoryChart();
            }
        });
    });

    // Changement d'unités
    metricBtn.addEventListener('click', function() {
        if (!isMetric) {
            isMetric = true;
            updateUnitDisplay();
            metricBtn.classList.add('active');
            imperialBtn.classList.remove('active');
            convertValues();
        }
    });

    imperialBtn.addEventListener('click', function() {
        if (isMetric) {
            isMetric = false;
            updateUnitDisplay();
            imperialBtn.classList.add('active');
            metricBtn.classList.remove('active');
            convertValues();
        }
    });

    // Soumission du formulaire
    bmiForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            calculateBMI();
        }
    });

    // Réinitialisation du formulaire
    bmiForm.addEventListener('reset', function() {
        setTimeout(() => {
            resultDisplay.style.display = 'none';
            initialMessage.style.display = 'block';
            clearValidationErrors();
        }, 10);
    });

    // Conversion des valeurs lors du changement d'unités
    function convertValues() {
        if (weightInput.value && heightInput.value) {
            if (isMetric) {
                // Conversion de lb à kg
                weightInput.value = (parseFloat(weightInput.value) * 0.453592).toFixed(1);
                // Conversion de inch à m
                heightInput.value = (parseFloat(heightInput.value) * 0.0254).toFixed(2);
            } else {
                // Conversion de kg à lb
                weightInput.value = (parseFloat(weightInput.value) / 0.453592).toFixed(1);
                // Conversion de m à inch
                heightInput.value = (parseFloat(heightInput.value) / 0.0254).toFixed(1);
            }
        }
    }

    // Mise à jour de l'affichage des unités
    function updateUnitDisplay() {
        unitLabels.forEach(label => {
            label.textContent = isMetric ? 'm' : 'in';
        });
        document.querySelector('#weight-group .unit-label').textContent = isMetric ? 'kg' : 'lb';
    }

    // Validation du formulaire
    function validateForm() {
        let isValid = true;
        clearValidationErrors();

        if (!weightInput.value || parseFloat(weightInput.value) <= 0) {
            showValidationError(weightInput, 'weight-error');
            isValid = false;
        }

        if (!heightInput.value || parseFloat(heightInput.value) <= 0) {
            showValidationError(heightInput, 'height-error');
            isValid = false;
        }

        return isValid;
    }

    // Affichage des erreurs de validation
    function showValidationError(input, errorId) {
        input.classList.add('input-error');
        document.getElementById(errorId).style.display = 'block';
    }

    // Effacement des erreurs de validation
    function clearValidationErrors() {
        weightInput.classList.remove('input-error');
        heightInput.classList.remove('input-error');
        document.getElementById('weight-error').style.display = 'none';
        document.getElementById('height-error').style.display = 'none';
    }

    // Calcul de l'IMC
    function calculateBMI() {
        let weight = parseFloat(weightInput.value);
        let height = parseFloat(heightInput.value);
        let bmi;

        if (isMetric) {
            bmi = weight / (height * height);
        } else {
            // Formule pour unités impériales (lb, in): (poids en lb * 703) / (taille en in)²
            bmi = (weight * 703) / (height * height);
        }

        displayResults(bmi);
        saveToHistory(bmi);
    }

    // Affichage des résultats
    function displayResults(bmi) {
        const roundedBMI = bmi.toFixed(1);
        bmiValue.textContent = roundedBMI;

        // Catégorisation de l'IMC
        let category, categoryClass, recommendation;
        if (bmi < 18.5) {
            category = "Insuffisance pondérale";
            categoryClass = "category-underweight";
            recommendation = "Il serait recommandé de consulter un professionnel de santé pour discuter de votre poids qui est inférieur à la normale. Un régime équilibré riche en nutriments pourrait être bénéfique.";
        } else if (bmi < 25) {
            category = "Poids normal";
            categoryClass = "category-normal";
            recommendation = "Félicitations! Votre poids est considéré comme normal. Continuez à maintenir un mode de vie sain avec une alimentation équilibrée et de l'activité physique régulière.";
        } else if (bmi < 30) {
            category = "Surpoids";
            categoryClass = "category-overweight";
            recommendation = "Votre IMC indique un surpoids. Essayez d'incorporer plus d'activité physique dans votre routine quotidienne et de revoir votre alimentation. Une consultation médicale peut vous aider.";
        } else {
            category = "Obésité";
            categoryClass = "category-obese";
            recommendation = "Votre IMC indique une obésité. Il est fortement recommandé de consulter un professionnel de santé pour obtenir des conseils adaptés à votre situation personnelle.";
        }

        bmiCategory.textContent = category;
        bmiCategory.className = 'result-category ' + categoryClass;
        recommendationText.textContent = recommendation;

        // Positionnement du marqueur sur la jauge
        const markerPosition = Math.min(Math.max(bmi, 15), 40);
        const positionPercentage = ((markerPosition - 15) / 25) * 100;
        bmiMarker.style.left = `${positionPercentage}%`;

        // Affichage des résultats
        resultDisplay.style.display = 'block';
        initialMessage.style.display = 'none';
    }

    // Sauvegarde dans l'historique
    function saveToHistory(bmi) {
        const date = new Date();
        const weight = parseFloat(weightInput.value);
        const height = parseFloat(heightInput.value);
        const age = ageInput.value ? parseInt(ageInput.value) : null;
        const gender = genderSelect.value;

        // Conversion en unités métriques pour la sauvegarde
        const metricWeight = isMetric ? weight : weight * 0.453592;
        const metricHeight = isMetric ? height : height * 0.0254;

        const historyEntry = {
            date: date.toISOString(),
            displayDate: date.toLocaleDateString(),
            bmi: bmi.toFixed(1),
            weight: metricWeight.toFixed(1),
            height: metricHeight.toFixed(2),
            age: age,
            gender: gender
        };

        bmiHistory.push(historyEntry);
        
        // Limitation à 10 entrées d'historique
        if (bmiHistory.length > 10) {
            bmiHistory.shift();
        }

        localStorage.setItem('bmiHistory', JSON.stringify(bmiHistory));
        updateHistoryDisplay();
    }

    // Mise à jour de l'affichage de l'historique
    function updateHistoryDisplay() {
        if (bmiHistory.length === 0) {
            historyList.innerHTML = '<li class="history-item">Aucun historique disponible</li>';
            return;
        }

        historyList.innerHTML = '';
        bmiHistory.slice().reverse().forEach((entry, index) => {
            const item = document.createElement('li');
            item.className = 'history-item';
            
            let categoryClass = '';
            const bmi = parseFloat(entry.bmi);
            if (bmi < 18.5) categoryClass = 'category-underweight';
            else if (bmi < 25) categoryClass = 'category-normal';
            else if (bmi < 30) categoryClass = 'category-overweight';
            else categoryClass = 'category-obese';

            item.innerHTML = `
                <div class="history-info">
                    <span>${entry.displayDate}</span>
                    IMC: <b class="${categoryClass}">${entry.bmi}</b>
                </div>
                <div>
                    ${entry.weight} kg, ${entry.height} m
                    ${entry.age ? ', ' + entry.age + ' ans' : ''}
                    ${entry.gender ? ', ' + (entry.gender === 'male' ? 'Homme' : 'Femme') : ''}
                </div>
            `;
            historyList.appendChild(item);
        });
    }

    // Rendu du graphique d'historique
    function renderHistoryChart() {
        const chartContainer = document.getElementById('history-chart');
        
        if (bmiHistory.length < 2) {
            chartContainer.innerHTML = '<p>Plus d\'entrées nécessaires pour afficher le graphique.</p>';
            return;
        }

        // Destruction du graphique précédent s'il existe
        if (historyChart) {
            historyChart.destroy();
        }

        // Préparation des données
        const sortedHistory = [...bmiHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
        const labels = sortedHistory.map(entry => entry.displayDate);
        const data = sortedHistory.map(entry => parseFloat(entry.bmi));

        // Configuration du graphique
        const ctx = document.createElement('canvas');
        chartContainer.innerHTML = '';
        chartContainer.appendChild(ctx);

        historyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'IMC',
                    data: data,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        min: 15,
                        max: 40,
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(1);
                            }
                        }
                    }
                },
                plugins: {
                    annotation: {
                        annotations: {
                            line1: {
                                type: 'line',
                                yMin: 18.5,
                                yMax: 18.5,
                                borderColor: '#3498db',
                                borderWidth: 1,
                                borderDash: [5, 5]
                            },
                            line2: {
                                type: 'line',
                                yMin: 25,
                                yMax: 25,
                                borderColor: '#2ecc71',
                                borderWidth: 1,
                                borderDash: [5, 5]
                            },
                            line3: {
                                type: 'line',
                                yMin: 30,
                                yMax: 30,
                                borderColor: '#e74c3c',
                                borderWidth: 1,
                                borderDash: [5, 5]
                            }
                        }
                    }
                }
            }
        });
    }
});