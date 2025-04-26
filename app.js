// ------------------- DATA STORAGE -------------------
let previousSemesters = [];
let currentSubjects = [];
let editingSubjectIndex = null; // For subject editing
let editingComponentSubjectIndex = null;
let editingComponentIndex = null;

const gpaMapping = {
    "A": 4.0, "A-": 3.67, "B+": 3.33, "B": 3.0,
    "B-": 2.67, "C+": 2.33, "C": 2.0, "F": 0.0
};

// ------------------- PAGE SWITCHERS -------------------
function showPreviousSemesterManager() {
    document.getElementById('previous-semester-section').classList.remove('hidden');
    document.getElementById('current-semester-section').classList.add('hidden');
    renderPreviousSemesters();
}

function showCurrentSemesterManager() {
    document.getElementById('current-semester-section').classList.remove('hidden');
    document.getElementById('previous-semester-section').classList.add('hidden');
    renderCurrentSubjects();
}

// ------------------- PREVIOUS SEMESTER MANAGER -------------------
function addNewSemester() {
    const semesterName = prompt("Enter Semester Name (e.g., Fall 2022):");
    if (!semesterName) return;

    previousSemesters.push({
        semester: semesterName,
        subjects: []
    });

    saveData();
    renderPreviousSemesters();
}

function addSubjectToSemester(semesterIndex) {
    const subjectName = prompt("Enter Subject Name:");
    const credits = parseInt(prompt("Enter Credits:"));
    const letterGrade = prompt("Enter Letter Grade (A, A-, B+, etc.):");

    if (!subjectName || isNaN(credits) || !letterGrade) {
        alert("Please fill out all fields correctly!");
        return;
    }

    previousSemesters[semesterIndex].subjects.push({
        subjectName,
        credits,
        letterGrade
    });

    saveData();
    renderPreviousSemesters();
}

function renderPreviousSemesters() {
    const div = document.getElementById('previous-semester-table-div');
    div.innerHTML = '';

    previousSemesters.forEach((sem, index) => {
        const semesterDiv = document.createElement('div');
        semesterDiv.classList.add('semester-box');

        const title = document.createElement('h4');
        title.textContent = `${sem.semester}`;

        const addButton = document.createElement('button');
        addButton.textContent = "+ Add Subject";
        addButton.onclick = () => addSubjectToSemester(index);

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Subject</th>
                <th>Credits</th>
                <th>Letter Grade</th>
                <th>GPA Points</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        let semesterTotalQuality = 0;
        let semesterTotalCredits = 0;

        sem.subjects.forEach(subject => {
            const tr = document.createElement('tr');
            const gpa = letterGradeToGPA(subject.letterGrade);

            tr.innerHTML = `
                <td>${subject.subjectName}</td>
                <td>${subject.credits}</td>
                <td>${subject.letterGrade}</td>
                <td>${gpa.toFixed(2)}</td>
            `;
            tbody.appendChild(tr);

            semesterTotalQuality += gpa * subject.credits;
            semesterTotalCredits += subject.credits;
        });

        table.appendChild(tbody);

        const semesterGPA = semesterTotalCredits > 0 ? (semesterTotalQuality / semesterTotalCredits) : 0;
        const gpaInfo = document.createElement('p');
        gpaInfo.textContent = `Semester GPA: ${semesterGPA.toFixed(2)}`;

        semesterDiv.appendChild(title);
        semesterDiv.appendChild(addButton);
        semesterDiv.appendChild(table);
        semesterDiv.appendChild(gpaInfo);

        div.appendChild(semesterDiv);
    });

    calculateCumulativeGPA();
}

// ------------------- CURRENT SEMESTER MANAGER -------------------
function addNewSubject() {
    editingSubjectIndex = null;
    openModal();
}

function addComponentToSubject(subjectIndex) {
    const componentName = prompt("Component Name:");
    const category = prompt("Category (Assignment, Quiz, Midterm, Final, Attendance):");
    const weight = parseFloat(prompt("Weight %:"));
    const pointsEarned = parseFloat(prompt("Points Earned:"));
    const pointsPossible = parseFloat(prompt("Points Possible:"));

    if (!componentName || !category || isNaN(weight) || isNaN(pointsEarned) || isNaN(pointsPossible)) {
        alert("Please fill all fields properly.");
        return;
    }

    currentSubjects[subjectIndex].components.push({
        componentName,
        category,
        weight,
        pointsEarned,
        pointsPossible
    });

    saveData();
    renderCurrentSubjects();
}

function renderCurrentSubjects() {
    const div = document.getElementById('current-subject-table-div');
    div.innerHTML = '';

    currentSubjects.forEach((subject, subjectIndex) => {
        const subjectDiv = document.createElement('div');
        subjectDiv.classList.add('subject-box');

        const title = document.createElement('h4');
        title.textContent = `${subject.subjectName}`;

        const addButton = document.createElement('button');
        addButton.textContent = "+ Add Assignment/Quiz/Exam";
        addButton.onclick = () => addComponentToSubject(subjectIndex);

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Component</th>
                <th>Category</th>
                <th>Weight %</th>
                <th>Points Earned</th>
                <th>Points Possible</th>
                <th>Weighted %</th>
                <th>Edit</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        let runningTotal = 0;

        subject.components.forEach((component, componentIndex) => {
            const scorePercent = (component.pointsEarned / component.pointsPossible) * 100;
            const weightedScore = (scorePercent * component.weight) / 100;

            runningTotal += weightedScore;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${component.componentName}</td>
                <td>${component.category}</td>
                <td>${component.weight.toFixed(1)}</td>
                <td>${component.pointsEarned}</td>
                <td>${component.pointsPossible}</td>
                <td>${weightedScore.toFixed(2)}</td>
                <td><button onclick="editComponent(${subjectIndex}, ${componentIndex})">✏️ Edit</button>
                <button onclick="deleteComponent(${subjectIndex}, ${componentIndex})">🗑️ Delete</button></td>
            `;
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);

        const letter = calculateLetterGrade(subject.gradingScale, runningTotal);

        const subjectGrade = document.createElement('p');
        subjectGrade.innerHTML = `Running Grade: <b>${runningTotal.toFixed(2)}%</b> (${letter})`;

        const predictButton = document.createElement('button');
        predictButton.textContent = "🎯 Predict Final Exam Score";
        predictButton.onclick = () => predictFinalExamScore(subjectIndex, runningTotal);

        const editScaleButton = document.createElement('button');
        editScaleButton.textContent = "✏️ Edit Grading Scale";
        editScaleButton.onclick = () => editGradingScale(subjectIndex);

        subjectDiv.appendChild(title);
        subjectDiv.appendChild(addButton);
        const deleteSubjectButton = document.createElement('button');
deleteSubjectButton.textContent = "🗑️ Delete Subject";
deleteSubjectButton.onclick = () => deleteSubject(subjectIndex);
subjectDiv.appendChild(deleteSubjectButton);

        subjectDiv.appendChild(table);
        subjectDiv.appendChild(subjectGrade);
        subjectDiv.appendChild(predictButton);
        subjectDiv.appendChild(editScaleButton);

        div.appendChild(subjectDiv);
    });
}

// ------------------- MODAL MANAGEMENT -------------------
function openModal() {
    document.getElementById('subject-modal').classList.remove('hidden');
    const subjectNameInput = document.getElementById('modal-subject-name');
    const tbody = document.getElementById('grading-scale-table').querySelector('tbody');
    tbody.innerHTML = '';

    const defaultScale = {
        "A": 90, "A-": 87, "B+": 83, "B": 80,
        "B-": 77, "C+": 73, "C": 70, "F": 0
    };

    let scaleToUse = defaultScale;

    if (editingSubjectIndex !== null && currentSubjects[editingSubjectIndex]) {
        subjectNameInput.value = currentSubjects[editingSubjectIndex].subjectName;
        scaleToUse = currentSubjects[editingSubjectIndex].gradingScale;
    } else {
        subjectNameInput.value = '';
    }

    for (let grade in scaleToUse) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${grade}</td>
            <td><input type="number" value="${scaleToUse[grade]}" id="grade-${grade}"></td>
        `;
        tbody.appendChild(tr);
    }
}

function closeModal() {
    document.getElementById('subject-modal').classList.add('hidden');
    editingSubjectIndex = null;
}

function saveSubject() {
    const subjectName = document.getElementById('modal-subject-name').value.trim();
    if (!subjectName) {
        alert("Please enter a subject name!");
        return;
    }

    const gradingScale = {};
    const inputs = document.querySelectorAll('#grading-scale-table input');
    inputs.forEach(input => {
        const grade = input.id.split('-')[1];
        gradingScale[grade] = parseFloat(input.value) || 0;
    });

    if (editingSubjectIndex !== null && currentSubjects[editingSubjectIndex]) {
        currentSubjects[editingSubjectIndex].subjectName = subjectName;
        currentSubjects[editingSubjectIndex].gradingScale = gradingScale;
    } else {
        currentSubjects.push({
            subjectName,
            components: [],
            gradingScale
        });
    }

    saveData();
    closeModal();
    renderCurrentSubjects();
}

function editGradingScale(subjectIndex) {
    editingSubjectIndex = subjectIndex;
    openModal();
}

// ------------------- COMPONENT MODAL -------------------
function editComponent(subjectIndex, componentIndex) {
    editingComponentSubjectIndex = subjectIndex;
    editingComponentIndex = componentIndex;

    const comp = currentSubjects[subjectIndex].components[componentIndex];

    document.getElementById('edit-component-name').value = comp.componentName;
    document.getElementById('edit-component-category').value = comp.category;
    document.getElementById('edit-component-weight').value = comp.weight;
    document.getElementById('edit-component-earned').value = comp.pointsEarned;
    document.getElementById('edit-component-possible').value = comp.pointsPossible;

    document.getElementById('component-modal').classList.remove('hidden');
}

function closeComponentModal() {
    document.getElementById('component-modal').classList.add('hidden');
    editingComponentSubjectIndex = null;
    editingComponentIndex = null;
}

function saveComponentEdit() {
    const newName = document.getElementById('edit-component-name').value.trim();
    const newCategory = document.getElementById('edit-component-category').value.trim();
    const newWeight = parseFloat(document.getElementById('edit-component-weight').value);
    const newEarned = parseFloat(document.getElementById('edit-component-earned').value);
    const newPossible = parseFloat(document.getElementById('edit-component-possible').value);

    if (!newName || !newCategory || isNaN(newWeight) || isNaN(newEarned) || isNaN(newPossible)) {
        alert("Please fill all fields correctly!");
        return;
    }

    const comp = currentSubjects[editingComponentSubjectIndex].components[editingComponentIndex];
    comp.componentName = newName;
    comp.category = newCategory;
    comp.weight = newWeight;
    comp.pointsEarned = newEarned;
    comp.pointsPossible = newPossible;

    saveData();
    closeComponentModal();
    renderCurrentSubjects();
}
function deleteComponent(subjectIndex, componentIndex) {
    if (!confirm("Are you sure you want to delete this component?")) {
        return;
    }

    currentSubjects[subjectIndex].components.splice(componentIndex, 1);

    saveData();
    renderCurrentSubjects();
}
function deleteSubject(subjectIndex) {
    if (!confirm("Are you sure you want to delete this subject?")) {
        return;
    }

    currentSubjects.splice(subjectIndex, 1);

    saveData();
    renderCurrentSubjects();
}

// ------------------- UTILITIES -------------------
function letterGradeToGPA(letter) {
    return gpaMapping[letter.toUpperCase()] || 0;
}

function calculateLetterGrade(scale, percent) {
    const sorted = Object.entries(scale).sort((a, b) => b[1] - a[1]);
    for (let [grade, cutoff] of sorted) {
        if (percent >= cutoff) return grade;
    }
    return "F";
}

function calculateCumulativeGPA() {
    let totalQualityPoints = 0;
    let totalCredits = 0;

    previousSemesters.forEach(sem => {
        sem.subjects.forEach(sub => {
            const gpa = letterGradeToGPA(sub.letterGrade);
            totalQualityPoints += gpa * sub.credits;
            totalCredits += sub.credits;
        });
    });

    const cumulativeGPA = totalCredits > 0 ? (totalQualityPoints / totalCredits) : 0;
    document.getElementById('cumulative-gpa').textContent = cumulativeGPA.toFixed(2);
}

function saveData() {
    localStorage.setItem('previousSemesters', JSON.stringify(previousSemesters));
    localStorage.setItem('currentSubjects', JSON.stringify(currentSubjects));
}

function loadData() {
    const previous = JSON.parse(localStorage.getItem('previousSemesters'));
    const current = JSON.parse(localStorage.getItem('currentSubjects'));
    if (previous) previousSemesters = previous;
    if (current) currentSubjects = current;
}

// ------------------- FINAL EXAM PREDICTION -------------------
function predictFinalExamScore(subjectIndex, currentRunningGrade) {
    const targetGrade = parseFloat(prompt("Target Final Grade % (e.g., 90):"));
    if (isNaN(targetGrade)) {
        alert("Invalid input.");
        return;
    }

    let totalWeight = 0;
    currentSubjects[subjectIndex].components.forEach(comp => totalWeight += comp.weight);
    const finalWeight = 100 - totalWeight;

    if (finalWeight <= 0) {
        alert("No weight left for Final Exam! Check component weights.");
        return;
    }

    const neededScore = ((targetGrade * 100) - (currentRunningGrade * totalWeight)) / finalWeight;

    if (neededScore > 100) {
        alert(`😟 You need ${neededScore.toFixed(2)}% on Final, which is above 100%!`);
    } else if (neededScore < 0) {
        alert(`🎉 You already secured your target!`);
    } else {
        alert(`🎯 You need ${neededScore.toFixed(2)}% on Final to achieve ${targetGrade}% overall.`);
    }
}

// ------------------- ON PAGE LOAD -------------------
window.onload = function () {
    loadData();
    renderPreviousSemesters();
    renderCurrentSubjects();
};
