const businessID = document.getElementById("businessID").dataset.backendData;

const templateSelector = document.getElementById('templates');
const templateNameContainer = document.getElementById('templateName');
const saveNewTemplateButton = document.querySelector('.save-template-button');
const updateTemplateButton = document.getElementById('updateButton');
const exitEditButton = document.querySelector('.exit-edit-button');
const newTemplateButton = document.getElementById('newTemplateButton');
const selectTemplateButton = document.getElementById('selectTemplateButton');
const hideWhenEditingContainer = document.getElementById('hideWhenEditing')
const editTemplateButton = document.getElementById('editTemplateButton')
let isUpdatingExistingTemplate = false
let isUpdatingExistingShift = false

const chartModal = new bootstrap.Modal(document.getElementById('chartModal'));
const chartModalLabel = document.getElementById('chartModalLabel')
const chartModalBody = document.getElementById('chartModalBody')


let weekEditing


function fetchScheduleTemplates() {
    $.ajax({
    url: '/getscheduletemplates',
    type: 'GET',
    data: { 'businessID': businessID},
    success: function(response) {
        // Set the variable value
        allTemplates = response;
        console.log(allTemplates[0])

        // Call any other function that depends on the variable value

    },
    error: function(xhr, status, error) {
        // Handle error, if needed
    }
    });
}

function fetchTemplatedShifts() {
    $.ajax({
    url: '/getalltemplatedshifts',
    type: 'GET',
    data: { 'businessID': businessID},
    success: function(response) {
        // Set the variable value
        templatedShifts = response;
        console.log(templatedShifts[0])

        // Call any other function that depends on the variable value

    },
    error: function(xhr, status, error) {
        // Handle error, if needed
    }
    });
}

function fetchRoles() {
    $.ajax({
    url: '/getallroles',
    type: 'GET',
    data: { 'businessID': businessID},
    success: function(response) {
        // Set the variable value
        allRoles = response;
        console.log(allRoles)

        // Call any other function that depends on the variable value

    },
    error: function(xhr, status, error) {
        // Handle error, if needed
    }
    });
}


fetchScheduleTemplates()
fetchTemplatedShifts()
fetchRoles()

const colors = [
"Crimson",
"SlateBlue",
"OliveDrab",
"DarkGoldenRod",
"Sienna",
"DarkSlateGray",
"RosyBrown",
"CadetBlue",
"DimGray",
"DarkOliveGreen",
"SlateGray",
"Peru",
"MediumAquaMarine",
"DarkKhaki",
"SteelBlue",
"DarkCyan",
"MediumPurple",
"DarkSeaGreen",
"IndianRed",
"MediumSlateBlue"
];

const dayOfWeekToColumnMap = {
    Sunday: document.getElementById('sundayShifts'),
    Monday: document.getElementById('mondayShifts'),
    Tuesday: document.getElementById('tuesdayShifts'),
    Wednesday: document.getElementById('wednesdayShifts'),
    Thursday: document.getElementById('thursdayShifts'),
    Friday: document.getElementById('fridayShifts'),
    Saturday: document.getElementById('saturdayShifts')
};


// Populate the template selector with sample data (response data from the server)
const sampleTemplateData = [
    { templateName: 'Template 1', templateID: 1 },
    { templateName: 'Template 2', templateID: 2 }
    ];

// Sample response data for the shifts
const sampleShiftData = [
    { templateID: 1, dayOfWeek: 'Monday', startTime: '9:00 AM', endTime: '12:00 PM', numberOfEmployees: 3, role: "Server", shiftID: 1},
    { templateID: 1, dayOfWeek: 'Monday', startTime: '1:00 PM', endTime: '6:00 PM', numberOfEmployees: 6, role: "Dishwasher", shiftID: 2 },
    { templateID: 1, dayOfWeek: 'Tuesday', startTime: '9:00 AM', endTime: '6:00 PM', numberOfEmployees: 6, role: "Host", shiftID: 3},
    { templateID: 2, dayOfWeek: 'Monday', startTime: '9:00 AM', endTime: '6:00 PM', numberOfEmployees: 6, role: "Server", shiftID: 4}
];



// Sample response data for the roles
const sampleRoleData = [
    { roleName: "Server", roleID: 1},
    { roleName: "Dishwasher", roleID: 2 },
    { roleName: "Host", roleID: 3 }
];



let roleColors = []



// Function to populate the role filters
function populateRoleFilters() {
    const roleFiltersContainer = document.getElementById('roleFilters');

    sampleRoleData.forEach((role, index) => {
    const checkboxContainer = document.createElement('div');
    checkboxContainer.classList.add('checkbox-container');
    checkboxContainer.style.backgroundColor = colors[index]

    let assignedColorObj = {
        "roleName": role.roleName,
        "color": colors[index]
    }
    roleColors.push(assignedColorObj)

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = role.roleName;
    checkboxContainer.appendChild(checkbox);

    const label = document.createElement('label');
    label.setAttribute('for', role.roleName);
    label.textContent = role.roleName;
    checkboxContainer.appendChild(label);

    roleFiltersContainer.appendChild(checkboxContainer);
    });
    console.log(roleColors)
}


// Function to populate the template selector
function populateTemplateSelector() {
    
    if (sampleTemplateData.length > 0 ){
    sampleTemplateData.forEach(template => {
    const option = document.createElement('option');
    option.value = template.templateID;
    option.textContent = template.templateName;
    option.classList.add("dropdown-item")
    selectTemplateButton.appendChild(option);
    });
    };
};
    

function clearRenderedShifts() {
    // Clear existing shift data
    Object.values(dayOfWeekToColumnMap).forEach(column => {
    column.innerHTML = ''
    });
}

// Function to populate the shifts based on the selected template
function populateShifts(selectedTemplateID) {
    clearRenderedShifts()
    // Populate shifts for the selected template
    sampleShiftData.forEach(shift => {
    let targetRoleIndex = sampleRoleData.findIndex(obj => obj.roleName == shift.role)
    if (shift.templateID == selectedTemplateID) {
        const column = dayOfWeekToColumnMap[shift.dayOfWeek];
        const shiftContainer = document.createElement('div');
        shiftContainer.classList.add('shift-container');
        shiftContainer.setAttribute("shift_ID",shift.shiftID);
        const shiftInfo = `
        <div style="display: none; justify-content: space-between;" data-group="toggle">
        <div>
            <i class="fa-solid fa-pencil" onclick="handleEditClick(this)"></i>
        </div>
        <div>
            <i class="fa-solid fa-trash" style="color: #ff0000;" onclick="handleDelete(this)""></i>
        </div>
        </div>
        <div>
        <div>
            ${shift.startTime} - ${shift.endTime}
        </div>
        <div class=role-container style="background-color: ${colors[targetRoleIndex]}">
            (${shift.role})
        </div>
        <div>
            <i class="fa-solid fa-user"></i> ${shift.numberOfEmployees}
        </div>   
        </div>
        `;
        shiftContainer.innerHTML = shiftInfo;
        column.appendChild(shiftContainer);
    }
    });
}


function newTemplate() {
    // Show an input field to enter the new template name
    templateNameContainer.innerHTML = `<input id="newTemplateName" type="text" class="new-template-input" value="New Template" />`;

    // Show the "Save Template" button
    saveNewTemplateButton.style.display = 'block';
    exitEditButton.style.display = 'block';

    // Clear any existing shifts
    clearRenderedShifts();
    newTemplateButton.style.display = 'none';
    selectTemplateButton.style.display = 'none';
    editTemplateButton.style.display = 'none';
    

    $(".add-shift-button").css("display", "block");
}

function addShift(clickedButton) {
    $(".add-shift-button").css("visibility", "hidden");
    $('[data-group="toggle"]').css('display', 'none');
    
    const parentContainer = clickedButton.parentNode
    const customAttributeValue = parentContainer.getAttribute('data-day-of-week');
    weekEditing = customAttributeValue
    
    const column = dayOfWeekToColumnMap[customAttributeValue];
    const shiftContainer = document.createElement('div');
    shiftContainer.classList.add('shift-container');
    shiftContainer.setAttribute("newShift", true);
    const shiftInfo = `
    <div style="display: flex; justify-content: space-between;" id="editing">
    <div>
        <i class="fa-solid fa-floppy-disk" style="color: #13ae4f;" onclick="handleSaveNew(this)"></i>
    </div>
    <div>
        <i class="fa-solid fa-x" onclick="handleDeleteAddPrompt(this)"></i>
    </div>
    </div>
    <div>
    <div>
        <div class="time-container" id="timePair">
        <div class="input-group">
            <span class="input-group-text">Start:</span>
            <input id="newShiftStartingTime" type="text" class="time start form-control" />
        </div>
        <div class="input-group">
            <span class="input-group-text">End: </span>
            <input id="newShiftEndingTime"type="text" class="time end form-control" />
        </div>
        </div>
    </div>
    <div>
        <select class="form-select" id="newShiftRoleSelector">
        </select>
    </div>
    <div>
        <div class="input-group">
        <input type="number" class="form-control" id="newShiftEmployeeCount" name="numberInput" min="1" max="100" step="1" value="1">
        <span class="input-group-text">employee(s)</span>
        </div>
    </div>   
    </div>
    `;
    shiftContainer.innerHTML = shiftInfo;
    
    //Prepend puts it at the top
    column.prepend(shiftContainer);
    const roleSelector = document.getElementById("newShiftRoleSelector")

    sampleRoleData.forEach(role => {
    const option = document.createElement('option');
    option.value = role.roleID;
    option.textContent = role.roleName;
    option.classList.add("dropdown-item")
    roleSelector.appendChild(option);
    })

    $('#timePair .time').timepicker({
    'showDuration': true,
    'timeFormat': 'g:i A',
    'step': 15
    });
    $('#timePair').datepair();

}

function saveNewTemplate() {
    const newTemplateName = document.getElementById('newTemplateName').value;

    console.log("Templates newly added shifts:")
    console.log(newTemplateData)
    // Restore the original sidebar content
    changeTemplate()
    $(".add-shift-button").css("visibility", "");
    saveNewTemplateButton.style.display = 'none';
    exitEditButton.style.display = 'none';
    newTemplateButton.style.display = 'block';
    selectTemplateButton.style.display = 'block';

    $(".add-shift-button").css("display", "none");

    if (editTemplateButtonExists==true) {
    editTemplateButton.style.display = 'block';
    }

    
}

function exitEditTemplate() {
    isUpdatingExistingTemplate = false
    // Restore the original sidebar content
    changeTemplate()
    $(".add-shift-button").css("visibility", "");
    saveNewTemplateButton.style.display = 'none';
    exitEditButton.style.display = 'none';
    updateTemplateButton.style.display = 'none';
    editTemplateButton.style.display = 'none';
    newTemplateButton.style.display = 'block';
    selectTemplateButton.style.display = 'block';
    $(".add-shift-button").css("display", "none");

    if (editTemplateButtonExists==true) {
    editTemplateButton.style.display = 'block';
    }

    existingShiftsManager.clearWorkableData()
    newShiftsManager.clearNewTemplate()
}

function changeTemplate() {
    if (sampleShiftData.length > 0) {
    var selectedTemplateID = document.getElementById('selectTemplateButton').value;
    var templateName = sampleTemplateData.filter(template => template.templateID == selectedTemplateID)[0].templateName
    var templateTitle = document.getElementById('templateName').innerHTML = templateName;
    populateShifts(selectedTemplateID)
    }
}

function addEditTemplateButton() {
    if (sampleTemplateData.length > 0 ){
    editTemplateButtonExists = true
    editTemplateButton.style.display = "block"
    };
};


function editTemplate() {
    var selectedTemplateID = document.getElementById('selectTemplateButton').value;
    var templateName = sampleTemplateData.filter(template => template.templateID == selectedTemplateID)[0].templateName
    var templateTitle = document.getElementById('templateName').innerHTML = templateName;

    existingShiftsManager.createNewWorkableData(selectedTemplateID)
    workableSampleShiftData = existingShiftsManager.getWorkableShiftData()
    
    var selectedTemplateID = document.getElementById('selectTemplateButton').value;
    templateNameContainer.innerHTML = `<input id="newTemplateName" type="text" class="new-template-input" value="${templateTitle}" />`;
    console.log("Clicked" + selectedTemplateID)

    // Show the "Save Template" button
    updateTemplateButton.style.display = 'block';
    exitEditButton.style.display = 'block';

    newTemplateButton.style.display = 'none';
    selectTemplateButton.style.display = 'none';
    editTemplateButton.style.display = 'none';

    $(".add-shift-button").css("display", "block");
    $('[data-group="toggle"]').css('display', 'flex');
}

function handleEditClick(clickedIcon) {
    $('[data-group="toggle"]').css('display', 'none');
    $(".add-shift-button").css("visibility", "hidden");

    const parentContainer = clickedIcon.parentNode.parentNode.parentNode;
    let targetShifts = existingShiftsManager.getWorkableShiftData()

    const shiftToEdit = parentContainer.getAttribute('shift_id');
    if (shiftToEdit.includes("WIP")) {
    targetShifts = newTemplateData
    }
    
    const shiftIndex = targetShifts.findIndex(obj => (obj.shiftID).toString() == shiftToEdit);
    const targetShiftData = targetShifts[shiftIndex]
    console.log(targetShiftData)

    let newShiftContent = createEditCurrentHTML(targetShiftData)
    parentContainer.innerHTML = newShiftContent
    const roleSelector = document.getElementById("newShiftRoleSelector")

    sampleRoleData.forEach(role => {
    const option = document.createElement('option');
    option.value = role.roleID;
    option.textContent = role.roleName;
    option.classList.add("dropdown-item")
    roleSelector.appendChild(option);
    })
    $(".add-shift-button").css("visibility", "hidden");
    $('#timePair .time').timepicker({
    'showDuration': true,
    'timeFormat': 'g:i A',
    'step': 15
    });
    $('#timePair').datepair();
    

}

function createEditCurrentHTML(targetShift) {
    const shiftInfo = `
    <div style="display: flex; justify-content: space-between;" id="editing">
        <div>
        <i class="fa-solid fa-floppy-disk" style="color: #13ae4f;" onclick="handleUpdatedShift(this)"></i>
        <i class="fa-solid fa-x" onclick="handleCloseEditPrompt(this)"></i>
        </div>
        <div>
        <i class="fa-solid fa-trash" style="color:red;" onclick="handleDelete(this)"></i>
        </div>
    </div>
    <div>
        <div>
        <div class="time-container" id="timePair">
            <div class="input-group">
            <span class="input-group-text">Start:</span>
            <input id="newShiftStartingTime" type="text" class="time start form-control" value="${targetShift.startTime}"/>
            </div>
            <div class="input-group">
            <span class="input-group-text">End: </span>
            <input id="newShiftEndingTime"type="text" class="time end form-control" value="${targetShift.endTime}"/>
            </div>
        </div>
        </div>
        <div>
        <select class="form-select" id="newShiftRoleSelector" value="${targetShift.role}">
        </select>
        </div>
        <div>
        <div class="input-group">
            <input type="number" class="form-control" id="newShiftEmployeeCount" name="numberInput" min="1" max="100" step="1" value="${targetShift.numberOfEmployees}">
            <span class="input-group-text">employee(s)</span>
        </div>
        </div>   
    </div>
    `;
    return(shiftInfo)
}


function handleUpdatedShift(clickedIcon) {
    let targetTemplateList
    let targetIndex

    const objectToUpdate = clickedIcon.parentNode.parentNode.parentNode;
    const idToUpdate = objectToUpdate.getAttribute('shift_id');

    const updatedShiftStartingTime = document.getElementById("newShiftStartingTime").value
    const updatedShiftEndingTime = document.getElementById("newShiftEndingTime").value
    const updatedShiftRoleSelector = document.getElementById("newShiftRoleSelector").value
    const updatedShiftEmployeeCount = document.getElementById("newShiftEmployeeCount").value
    const roleName = sampleRoleData.filter(role => role.roleID == updatedShiftRoleSelector)[0].roleName

    if (idToUpdate.includes("WIP")) {
    targetTemplateList = newTemplateData
    }
    else {
    targetTemplateList = existingShiftsManager.getWorkableShiftData()
    console.log()
    }
    
    let indexToUpdate = targetTemplateList.findIndex(obj => obj.shiftID == idToUpdate);

    targetTemplateList[indexToUpdate].startTime = updatedShiftStartingTime
    targetTemplateList[indexToUpdate].endTime = updatedShiftEndingTime
    targetTemplateList[indexToUpdate].numberOfEmployees = parseInt(updatedShiftEmployeeCount)
    targetTemplateList[indexToUpdate].role = roleName
    targetTemplateList[indexToUpdate].roleID = updatedShiftRoleSelector

    console.log(targetTemplateList[indexToUpdate])

    let updatedShiftContent = createShiftHTMLData(targetTemplateList[indexToUpdate])
    objectToUpdate.innerHTML = updatedShiftContent
    $('[data-group="toggle"]').css('display', 'flex');
    $(".add-shift-button").css("visibility", "");
}

function createShiftHTMLData(targetShift) {
    let targetRoleIndex = sampleRoleData.findIndex(obj => obj.roleName == shift.role)
    
    const shiftInfo = `
    <div style="display: none; justify-content: space-between;" data-group="toggle">
        <div>
        <i class="fa-solid fa-pencil" onclick="handleEditClick(this)"></i>
        </div>
        <div>
        <i class="fa-solid fa-trash" style="color: #ff0000;" onclick="handleDelete(this)""></i>
        </div>
    </div>
    <div>
        <div>
        ${targetShift.startTime} - ${targetShift.endTime}
        </div>
        <div class=role-container style="background-color: ${colors[targetRoleIndex]}">
        (${targetShift.role})
        </div>
        <div>
        <i class="fa-solid fa-user"></i> ${targetShift.numberOfEmployees}
        </div>   
    </div>
    `;
    return(shiftInfo)
}

function handleDelete(clickedIcon) {
    const parentContainer = clickedIcon.parentNode.parentNode.parentNode;
    const targetShiftID = parentContainer.getAttribute('shift_id');

    workableSampleShiftData = existingShiftsManager.getWorkableShiftData()

    //unsubmitted list of shifts
    if (targetShiftID.includes("WIP")) {
        let objectToDelete = clickedIcon.parentNode.parentNode.parentNode
        let idToDelete = objectToDelete.getAttribute("shift_ID")

        newShiftsManager.deleteShift(idToDelete)

        objectToDelete.remove();
    }

    else {
        let objectToDelete = clickedIcon.parentNode.parentNode.parentNode
        let idToDelete = objectToDelete.getAttribute("shift_ID")
        console.log("Trying to delete shift with ID")

        objectToDelete.remove();

        existingShiftsManager.deleteShift(idToDelete)
        console.log("Deleted an existing shift")
    }
    
}

function updateTemplate() {
    var selectedTemplateID = document.getElementById('selectTemplateButton').value;
    const newTemplateName = document.getElementById('newTemplateName').value;

    updateTemplateButton.style.display = 'none';
    exitEditButton.style.display = 'none';
    newTemplateButton.style.display = 'block';
    selectTemplateButton.style.display = 'block';

    if (editTemplateButtonExists==true) {
    editTemplateButton.style.display = 'block';
    }

    $(".add-shift-button").css("display", "none");
    console.log("Updated template with new name: "+newTemplateName)
    console.log("NOTE, THIS NEEDS TO BE EXPANDED ONCE BACKEND IS INTRODUCED")

}

function handleDeleteAddPrompt(clickedIcon) {
    newShiftContainer = clickedIcon.parentNode.parentNode.parentNode
    newShiftContainer.remove();
    $(".add-shift-button").css("visibility", "");
    $('[data-group="toggle"]').css('display', 'flex');
}

function handleSaveNew(clickedIcon) {
    const newShiftStartingTime = document.getElementById("newShiftStartingTime").value
    const newShiftEndingTime = document.getElementById("newShiftEndingTime").value
    const newShiftRoleSelector = document.getElementById("newShiftRoleSelector").value
    const newShiftEmployeeCount = document.getElementById("newShiftEmployeeCount").value
    const roleName = sampleRoleData.filter(role => role.roleID == newShiftRoleSelector)[0].roleName

    if (newShiftStartingTime == "" || newShiftEndingTime == "" || newShiftEmployeeCount == "") {
    console.log("Not Filled Out")
    }
    else {
    let targetRoleIndex = sampleRoleData.findIndex(obj => obj.roleName == roleName)
    
    newShiftsManager.addNewTemplateData(weekEditing, newShiftStartingTime, newShiftEndingTime, newShiftEmployeeCount, roleName, newShiftRoleSelector)
    newShiftID = newShiftsManager.getNewShiftID()

    const column = dayOfWeekToColumnMap[weekEditing];
    const shiftContainer = document.createElement('div');
    shiftContainer.classList.add('shift-container');
    shiftContainer.setAttribute("shift_ID",newShiftID);
    const shiftInfo = `
    <div style="display: flex; justify-content: space-between;" data-group="toggle">
        <div>
        <i class="fa-solid fa-pencil" onclick="handleEditClick(this)"></i>
        </div>
        <div>
        <i class="fa-solid fa-trash" style="color: #ff0000;" onclick="handleDelete(this)""></i>
        </div>
    </div>
    <div>
        <div>
        ${newShiftStartingTime} - ${newShiftEndingTime}
        </div>
        <div class=role-container style="background-color: ${colors[targetRoleIndex]}">
        (${roleName})
        </div>
        <div>
        <i class="fa-solid fa-user"></i> ${newShiftEmployeeCount}
        </div>   
    </div>
    `;
    shiftContainer.innerHTML = shiftInfo;
    column.appendChild(shiftContainer);
    newShiftContainer = clickedIcon.parentNode.parentNode.parentNode
    newShiftContainer.remove();
    $('[data-group="toggle"]').css('display', 'flex');
    $(".add-shift-button").css("visibility", "");
    }
};

function viewStaffingChart(buttonClicked) {
    const relevantDayOfWeek = (buttonClicked.parentNode).getAttribute("data-day-of-week")
    const relevantTemplate = document.getElementById('selectTemplateButton').value;
    let shiftsToChart
    let withTimeIntervals = []

    chartModalLabel.textContent = relevantDayOfWeek
    workableSampleShiftData = existingShiftsManager.getWorkableShiftData()

    //Not editing exiting Template --> Either Viewing New Template or Uneditied Exisitng Template
    if (workableSampleShiftData.length == 0) {
    //Editing New Template
    if (document.getElementById('selectTemplateButton').style.display == "none") {
        console.log("Editing New Template")
        shiftsToChart = newShiftsManager.getNewShifts().filter(shift => shift.dayOfWeek == relevantDayOfWeek)
        chartModal.show();
    }
    //Not editing template
    else {
        console.log("Not editing template")
        let filteredShifts = sampleShiftData.filter(shift => shift.templateID == relevantTemplate)
        let filterdForDayShifts = filteredShifts.filter(shift => shift.dayOfWeek == relevantDayOfWeek)
        shiftsToChart = filterdForDayShifts
        chartModal.show();
    }
    }
    //Editing an existing chart NOTE THIS WILL PROBABLY BUG IF SOMEONE DELETES EVERY SINGLE OLD EXISTING SHIFT BUT WHO THE FUCK WOULD DO THAT
    else {
    console.log("Editing exisiting template!!!")
    console.log(existingShiftsManager.getWorkableShiftData())
    let filteredShifts = existingShiftsManager.getWorkableShiftData().filter(shift => shift.templateID == relevantTemplate)
    let filterdForDayShifts = filteredShifts.filter(shift => shift.dayOfWeek == relevantDayOfWeek)
    console.log(filterdForDayShifts)

    if (newShiftsManager.getNewShifts().length != 0) {
        let filteredNewShifts = newShiftsManager.getNewShifts().filter(shift => shift.dayOfWeek == relevantDayOfWeek)
        shiftsToChart = filterdForDayShifts.concat(filteredNewShifts)
    }
    else {
        shiftsToChart = filterdForDayShifts
    }
    
    chartModal.show();
    }

    const uniqueRolesInShiftsToChart = [...new Set(shiftsToChart.map(shift => shift.role))];

    uniqueRolesInShiftsToChart.forEach(uniqueRole => {
    let filteredShiftsToChart = shiftsToChart.filter(shift => shift.role == uniqueRole)
    let arrayEmployeesPerHourArray = []

    filteredShiftsToChart.forEach(shift => {
        let indexes = getTimeIndexes(shift.startTime, shift.endTime)
        let employeesPerHourArray = fillMissingAndAddEmployeeCount(indexes, shift.numberOfEmployees)

        arrayEmployeesPerHourArray.push(employeesPerHourArray)
        
    })
    let newObj = {
        "label": uniqueRole,
        "data": (addArrays(arrayEmployeesPerHourArray)),
        "borderColor": roleColors.filter(role => role.roleName == uniqueRole)[0].color
        }

    withTimeIntervals.push(newObj)
    })

    console.log(withTimeIntervals)
    

    const times = [];
    for (let hour = 0; hour <= 23; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            const period = hour < 12 ? 'AM' : 'PM';
            const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            const formattedHour = hour12.toString().padStart(2, '0');
            const formattedMinute = minute.toString().padStart(2, '0');
            times.push(`${formattedHour}:${formattedMinute} ${period}`);
        }
    }
    const ctx = document.getElementById('employeesOverTimeChart');
    console.log(times)

    let lineChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: times,
        datasets: withTimeIntervals
    },
    options: {
        scales: {
        y: {
            ticks: {
            stepSize: 1,
            },
            beginAtZero: true,
        },
        x: {
            ticks: {
            maxTicksLimit: 30, // Specify the maximum number of displayed ticks
            },
        },
        }
    }
    });
    
    chartModal._element.addEventListener('hidden.bs.modal', function (event) {
    lineChart.destroy();
    });
}

function fillMissingAndAddEmployeeCount(arr, employeeCount) {
    const result = [];

    for (let i = 0; i <= 95; i++) {
    if (arr.includes(i)) {
        result.push(1*employeeCount);
    } else {
        result.push(0);
    }
    }

    return result;
}

function getTimeIndexes(startTimeStr, endTimeStr) {
    const startTime = new Date(`2000-01-01 ${startTimeStr}`);
    const endTime = new Date(`2000-01-01 ${endTimeStr}`);
    const baseTime = new Date(`2000-01-01 12:00 AM`);
    const interval = 15; // 15 minutes

    const timeIndexes = [];

    while (startTime <= endTime) {
    const timeDifference = (startTime - baseTime) / (60 * 1000); // Difference in minutes
    timeIndexes.push(timeDifference/15);
    startTime.setTime(startTime.getTime() + interval * 60 * 1000); // Increment by 15 minutes
    }

    return timeIndexes;
}

function addArrays(arrays) {
    if (!arrays || arrays.length === 0) {
    return fillMissingAndAddEmployeeCount([0],0);
    }

    const result = [];

    // Find the maximum length among all arrays
    const maxLength = Math.max(...arrays.map(arr => arr.length));

    for (let i = 0; i < maxLength; i++) {
    let sum = 0;

    for (const array of arrays) {
        sum += array[i] || 0; // Add the value at index 'i' if it exists, otherwise add 0
    }

    result.push(sum);
    }

    return result;
}

//existingShiftsManager NOTE THAT YOU HAVE TO ADD NEW SHIFTS USING NEW SHIFTS MANAGER EVEN THOUGH ITS TO AN EXISTING TEMPLATE
//This manages the copy of the existing shifts
function createExistingShiftsManager() {
    this.workableSampleShiftData = []

    this.createNewWorkableData = function(selectedTemplateID) {
        let sampleShiftDataCopy = sampleShiftData.map(item => ({ ...item }));
        this.workableSampleShiftData = sampleShiftDataCopy.filter(shift => shift.templateID == selectedTemplateID)
    }

    this.deleteShift = function(idToDelete) {
        console.log("Id to delete")
        console.log(idToDelete)
        let indexToRemove = this.workableSampleShiftData.findIndex(obj => obj.shiftID === parseInt(idToDelete));
        console.log("Removing index", indexToRemove)
        this.workableSampleShiftData.splice(indexToRemove, 1);
        console.log("Workable After Delete")
        console.log(this.workableSampleShiftData)
    }
    
    this.clearWorkableData = function() {
        this.workableSampleShiftData = []
    }

    this.getWorkableShiftData = function() {
        return this.workableSampleShiftData
    }  
   
}

//newShiftsManager
//This manages the newly created shifts
function createNewShiftsManager() {
    this.newTemplateData = []
    
    this.addNewTemplateData = function(dayOfWeek, newShiftStartingTime, newShiftEndingTime, newShiftEmployeeCount, roleName) {
        let newShiftID = "WIP" + (this.newTemplateData.length+1)
        let shiftToAdd = {
            shiftID: newShiftID,
            templateID: newShiftID,
            dayOfWeek: dayOfWeek,
            startTime: newShiftStartingTime,
            endTime: newShiftEndingTime,
            numberOfEmployees: newShiftEmployeeCount,
            role: roleName,
            
        }
        this.newTemplateData.push(shiftToAdd)
        console.log(this.newTemplateData)
    }

    this.getNewShiftID = function() {
        let newShiftID = "WIP" + (this.newTemplateData.length+1)
        return newShiftID
    }

    this.deleteShift = function(idToDelete) {
        let indexToRemove = this.newTemplateData.findIndex(obj => obj.shiftID === idToDelete);
        this.newTemplateData.splice(indexToRemove, 1);
    }

    this.clearNewTemplate = function() {
        this.newTemplateData = []
    }

    this.getNewShifts = function() {
        console.log(this.newTemplateData)
        return this.newTemplateData
    }

}

const existingShiftsManager = new createExistingShiftsManager();
const newShiftsManager = new createNewShiftsManager();

addEditTemplateButton();
populateTemplateSelector();
populateRoleFilters();
changeTemplate();

// Add event listener to template selector to update shifts when template is changed
document.getElementById('selectTemplateButton').addEventListener('change', changeTemplate);