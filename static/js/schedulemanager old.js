var csrfToken = window.csrfToken;
var today = new Date(); 
const roleSelector = document.getElementById("roles");
const currentSunday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
let startDate
const variableContentSideBarContainer = document.getElementById("variable-sidebar-content-container");

// Function to handle the change event
function handleSelectChange(event) {
  const selectedValue = event.target.value;
  console.log("Selected value:", selectedValue);
  if (!startDate) {
    getScheduledShifts(calculateWeeks(currentSunday))
  }
  else {
    getScheduledShifts(calculateWeeks(startDate))
  }
}

// Add event listener to detect changes
roleSelector.addEventListener("change", handleSelectChange);


function changeDateSelectorDisplayedDates(){
  console.log(currentSunday)
  updateDates(currentSunday);

  var sunday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
  var saturday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 6);
  var defaultText = $.datepicker.formatDate("mm/dd/yy", sunday) + " - " + $.datepicker.formatDate("mm/dd/yy", saturday);


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
      getScheduledShifts(calculateWeeks(startDate));
    }
  }).val(defaultText);
}


function updateDates(startDate) {
  const sundayElement = document.getElementById('sunday');
  const mondayElement = document.getElementById('monday');
  const tuesdayElement = document.getElementById('tuesday');
  const wednesdayElement = document.getElementById('wednesday');
  const thursdayElement = document.getElementById('thursday');
  const fridayElement = document.getElementById('friday');
  const saturdayElement = document.getElementById('saturday');
  sundayElement.innerHTML = "Sun " + $.datepicker.formatDate("mm/dd", startDate);
  mondayElement.innerHTML = "Mon " + $.datepicker.formatDate("mm/dd", new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1));
  tuesdayElement.innerHTML = "Tues " + $.datepicker.formatDate("mm/dd", new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 2));
  wednesdayElement.innerHTML = "Wed " + $.datepicker.formatDate("mm/dd", new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 3));
  thursdayElement.innerHTML = "Thur " + $.datepicker.formatDate("mm/dd", new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 4));
  fridayElement.innerHTML = "Fri " + $.datepicker.formatDate("mm/dd", new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 5));
  saturdayElement.innerHTML = "Sat " + $.datepicker.formatDate("mm/dd", new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6));
}

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

// Function to calculate the ISO week number (same as before)
function getISOWeekNumber(date) {
  var dayOfWeek = (date.getDay() + 6) % 7;
  var firstThursday = new Date(date.getFullYear(), 0, 4 - dayOfWeek);
  return 1 + Math.round((date - firstThursday) / 604800000);
}


async function getScheduledShifts(weekMultipler) {
  variableContentSideBarContainer.innerHTML = ""
  return new Promise(function(resolve, reject) {
    var roleID = document.getElementById("roles").value
    console.log("Role ID: ",roleID)
    console.log("Week Multiplier: ", weekMultipler)
    console.log("Current Week Multiplier :", calculateWeeks(currentSunday))
    // AJAX request
    $.ajax({
      url: '/getscheduledshifts/',  // URL to your Django view handling the search request
      type: 'GET',
      data: { 'roleID': roleID,
              'weekMultiplier': weekMultipler,    
      },
      success: function(response) {
         // Resolve the promise with the data
        
        if (calculateWeeks(currentSunday) <= weekMultipler) {
          //Requested week is this week or in the future
          console.log("Requested week is this week or in the future")
          if (response.length > 0){
            renderShifts(response)
            editScheduleButton()
          }
          else {
            console.log("Nothing scheduled for requested week.  Option to make new schedule")
            newScheduleButton()
          }
        }
        else {
          //Requested week is in the past
          console.log("Requested week is in the past")
          if (response.length > 0){
            renderShifts(response)
          }
          else {
            console.log("Nothing scheduled for requested week.  No Option to make new schedule")
          }
        }
      },
      error: function(response) {
        reject("None"); // Reject the promise with the error
      }
    });
  });
}

async function updateShiftsPage(weekMultipler){
  console.log("Updating page")
}


function renderShifts(existingShifts) {
  console.log("Attempting to render shifts: ",existingShifts )
}

function newScheduleButton() {
  console.log("Creating new schedule button")
  const newScheduleContainer = document.createElement('div');
  newScheduleContainer.classList.add('new-schedule-container')
  newScheduleContainer.innerHTML  = `
  <div class="new-schedule-icon-container">
    <i class="fa-regular fa-calendar-plus fa-lg"></i>
  </div>
  <div class="icon-text" >New Schedule</div>  
  `;
  variableContentSideBarContainer.appendChild(newScheduleContainer)
}

function editScheduleButton() {
  console.log("Creating edit schedule button")
  const newScheduleContainer = document.createElement('div');
  newScheduleContainer.classList.add('edit-schedule-container')
  newScheduleContainer.innerHTML  = `
  <div class="edit-schedule-icon-container">
  <i class="fa-regular fa-pen-to-square fa-lg"></i>
  </div>
  <div class="icon-text" >Edit Schedule</div>  
  `;
  variableContentSideBarContainer.appendChild(newScheduleContainer)
}

changeDateSelectorDisplayedDates()
getScheduledShifts(calculateWeeks(currentSunday))