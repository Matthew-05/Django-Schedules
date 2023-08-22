let employees = []; // Holds the employee data
let shifts = []; // Holds the shift data
let weekMultipler

const businessIDElement = document.getElementById('businessID');
const backendDataValue = businessIDElement.dataset.backendData;

// Function to fetch employee data from the server
async function fetchEmployeeData() {
  // Simulate fetching the employee data using a setTimeout
  // In your actual implementation, replace this with your API call
  $.ajax({
    url: '/getemployees/',  // Replace with the actual URL of your Django view
    type: 'GET',
    data: {
        'businessID': backendDataValue,
    },
    dataType: 'json',
    success: function(response) {
      employees = response

    },
    error: function(xhr, errmsg, err) {
        console.log(errmsg);  // Handle any errors
    }
  });
}

// Function to fetch shift data from the server
async function fetchShiftData(weekMultipler) { 
  // Simulate fetching the employee data using a setTimeout
  // In your actual implementation, replace this with your API call
  $.ajax({
    url: '/getscheduledshifts/',  // Replace with the actual URL of your Django view
    type: 'GET',
    data: {
        'weekMultiplier': calculateWeeks(weekMultipler),
        'businessID': backendDataValue,
    },
    dataType: 'json',
    success: function(response) {
      shifts = response
      renderWeek(shifts, weekMultipler)
    },
    error: function(xhr, errmsg, err) {
        console.log(errmsg);  // Handle any errors
    }
  });
}

// Function to render the schedule for the given week
function renderWeek(shifts, weekStart) {
  console.log(calculateWeeks(weekStart))
  console.log(shifts)
  // Fetch the shift data for the current week

  // Clear the existing schedule
  const scheduleBody = document.getElementById("scheduleBody");
  scheduleBody.innerHTML = "";

  // Loop through each employee and create a row for them
  employees.forEach(employee => {
    const row = document.createElement("tr");
    const cells = [
      document.createElement("td"),
      document.createElement("td"),
      document.createElement("td"),
      document.createElement("td"),
      document.createElement("td"),
      document.createElement("td"),
      document.createElement("td"),
      document.createElement("td"),
      document.createElement("td"),
    ];

    // Fill in the employee details
    cells[0].innerText = employee.employeeName;
    cells[1].innerText = employee.role;

    // Fill in the shifts for the current week
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      if (shifts.length > 0){
        const employeeShifts = shifts.filter(shift => shift.employeeID === employee.employeeID && shift.dayOfWeek === day.toLocaleDateString("en-US", { weekday: "long" }));
          if (employeeShifts.length > 0) {
            // If there are shifts for this employee on this day, display them in a list
            const shiftsList = employeeShifts.map(shift => `${shift.shiftStart} - ${shift.shiftEnd} (${shift.shiftRole})`);
            cells[i + 2].innerText = shiftsList.join("\n");
          } else {
            cells[i + 2].innerText = "";
          }
        }
      }

    cells.forEach(cell => row.appendChild(cell));
    scheduleBody.appendChild(row);
  });

}



// Initial rendering of the current week schedule
const currentDate = new Date();
const currentWeekStart = new Date(currentDate);
currentWeekStart.setDate(currentWeekStart.getDate() - currentDate.getDay());

// Getting the week multiplier (the week identifier)
function calculateWeeks(date) {
  // Create new dates for the first day of the year and the provided date
  var januaryFirst2023 = new Date(2023, 0, 1);
  var providedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Calculate the time difference between the dates in milliseconds
  var timeDifference = providedDate.getTime() - januaryFirst2023.getTime();

  // Calculate the week difference by dividing the time difference by the number of milliseconds in a week
  var weekDifference = Math.floor(timeDifference / (7 * 24 * 60 * 60 * 1000));

  return weekDifference;
}

function changeDateSelectorDisplayedDates(currentWeekStart) {
  updateDates(currentWeekStart);

  var saturday = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), currentWeekStart.getDate() - currentWeekStart.getDay() + 6);
  console.log(saturday)
  var defaultText = $.datepicker.formatDate("mm/dd/yy", currentWeekStart) + " - " + $.datepicker.formatDate("mm/dd/yy", saturday);


  $('.date-picker').datepicker( {
    changeMonth: true,
    changeYear: true,
    showButtonPanel: true,
    //This is what runs when the new date range is selected
    onSelect: function(dateText, inst) {
      var date = $(this).datepicker('getDate');
      startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
      endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 6);
      var dateFormat = inst.settings.dateFormat || $.datepicker._defaults.dateFormat;
      $('#startDate').text($.datepicker.formatDate( dateFormat, startDate, inst.settings ));
      $('#endDate').text($.datepicker.formatDate( dateFormat, endDate, inst.settings ));
      $(this).val($.datepicker.formatDate( dateFormat, startDate, inst.settings ) + " - " + $.datepicker.formatDate( dateFormat, endDate, inst.settings ));
      updateDates(startDate);
      fetchShiftData(startDate);
    }
  }).val(defaultText);
}

function updateDates(startDate) {
  const sundayElement = document.getElementById('col0');
  const mondayElement = document.getElementById('col1');
  const tuesdayElement = document.getElementById('col2');
  const wednesdayElement = document.getElementById('col3');
  const thursdayElement = document.getElementById('col4');
  const fridayElement = document.getElementById('col5');
  const saturdayElement = document.getElementById('col6');
  sundayElement.innerHTML = "Sun " + $.datepicker.formatDate("mm/dd", startDate);
  mondayElement.innerHTML = "Mon " + $.datepicker.formatDate("mm/dd", new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1));
  tuesdayElement.innerHTML = "Tues " + $.datepicker.formatDate("mm/dd", new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 2));
  wednesdayElement.innerHTML = "Wed " + $.datepicker.formatDate("mm/dd", new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 3));
  thursdayElement.innerHTML = "Thur " + $.datepicker.formatDate("mm/dd", new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 4));
  fridayElement.innerHTML = "Fri " + $.datepicker.formatDate("mm/dd", new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 5));
  saturdayElement.innerHTML = "Sat " + $.datepicker.formatDate("mm/dd", new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6));
}

// Fetch the employee data only once on page load
fetchEmployeeData().then(() => {
  changeDateSelectorDisplayedDates(currentWeekStart);
  fetchShiftData(currentWeekStart);
});
