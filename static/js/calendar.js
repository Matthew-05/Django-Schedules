$('#id_Start_and_End_Dates').daterangepicker({
  startDate: moment(), // Replace this with your desired minimum date
  minDate: moment(),
});
const calendarBody = document.getElementById('calendarBody');
const monthCaption = document.getElementById('monthCaption');
const weekdaysContainer = document.querySelector('.calendar-weekdays');
const filterInput = document.getElementById('filterInput');
const businessID = document.getElementById("businessID").dataset.backendData;
const checkboxes = document.getElementsByName('roleFilters');
createTimeOffPopper()

const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
for (let i = 0; i < 7; i++) {
  const weekdayCell = document.createElement('div');
  weekdayCell.classList.add('calendar-cell');
  weekdayCell.textContent = weekdayNames[i];
  weekdaysContainer.appendChild(weekdayCell);
}

function showLoadingSpinner() {
  console.log("Loading...")
  const spinner = document.getElementById('loading-spinner');
  spinner.style.display = 'flex';
}

function hideLoadingSpinner() {
  console.log("Finished Loading.")
  const spinner = document.getElementById('loading-spinner');
  spinner.style.display = 'none';
}

var allEvents
var events
var holidayEvents

function fetchTimeOffs() {
  $.ajax({
    url: '/gettimeoffs',
    type: 'GET',
    data: { 'businessID': businessID},
    success: function(response) {
      // Set the variable value
      allEvents = response;
      if (allEvents) {
        events = allEvents
      }
      else {
        events = allEvents.filter(event => event.accepted=="accepted")
      }
      

      // Call any other function that depends on the variable value
      updateNotificationCount()
      updateCalendar();
      populateDeniedPopperContent();
      createPopper();
    },
    error: function(xhr, status, error) {
      // Handle error, if needed
    }
  });
}

  
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

fetchTimeOffs()


/*
const allEvents = [
  { startDate: '2023-06-01', endDate: '2023-06-01', title: 'Event 1', holidayFlag: false, acceptedBy: "Joe", accepted: true, role: "Server" },
  { startDate: '2023-06-10', endDate: '2023-06-10', title: 'Event 2', holidayFlag: false, acceptedBy: "Joe", accepted: true, role: "Server" },
  { startDate: '2023-07-04', endDate: '2023-07-20', title: 'Melon Stinks', holidayFlag: false, acceptedBy: "Joe", accepted: true, role: "Server" },
  { startDate: '2023-07-10', endDate: '2023-07-18', title: 'Tim Stinks', holidayFlag: false, acceptedBy: "Joe", accepted: true, role: "Server" },
  { startDate: '2023-07-10', endDate: '2023-07-20', title: 'Matthew Stinks', holidayFlag: false, acceptedBy: "Joe", accepted: false, role: "Server" },
  { startDate: '2023-07-10', endDate: '2023-07-20', title: 'All Stink', holidayFlag: false, acceptedBy: "Joe", accepted: false, role: "Server" },
];
*/

//const events = allEvents.filter(event => event.accepted==true)

function uncheckCheckbox(checkboxId) {
  const checkbox = document.getElementById(checkboxId);

  if (checkbox.checked) {
    checkbox.checked = false;
    generateCalendar(events)
  }
}


let showHolidays = false;
let filtering = false;
let fetchedHolidays = false;
let eventMatches;

function toggleHolidays() {
  showHolidays = !showHolidays;
  updateCalendar()
}

function applyFilter() {
  filtering = true;
  const filterText = filterInput.value.toLowerCase();
  const filteredEvents = events.filter(event => event.title.toLowerCase().includes(filterText) || filterText == event.timeOffID);
  generateCalendar(filteredEvents);
}

function applyRoleFilter(checkbox) {
  console.log(checkbox)

  filtering = true;
  const filterText = filterInput.value.toLowerCase();
  const filteredEvents = events.filter(event => event.title.toLowerCase().includes(filterText) && event.role == checkbox || filterText == event.timeOffID);
  console.log(events.filter(event => event.role == checkbox))
  generateCalendar(filteredEvents);
}

async function generateCalendar(filteredEvents = events) {
  console.log(events)
  showLoadingSpinner();
  const presetMaxEvents = 3;
  calendarBody.innerHTML = '';

  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0);
  const startDay = monthStart.getDay(); // Starting day of the month (0-6)
  const daysInMonth = monthEnd.getDate(); // Total days in the month
  const daysToDisplay = Math.ceil((startDay + daysInMonth) / 7) * 7; // Total slots to display

  let currentDateIndex = 1;
  console.log(filtering)

  if (showHolidays && !filtering) {
    const response = await fetch(`https://date.nager.at/api/v3/publicholidays/${currentYear}/US`);
    const holidays = await response.json();

    const holidayEvents = holidays.map(holiday => {
      return {
        startDate: holiday.date,
        endDate: holiday.date,
        title: holiday.name,
        holidayFlag: true
      };
    });
    filteredEvents = [...holidayEvents, ...events];
  }

  if (showHolidays && filtering) {
    const response = await fetch(`https://date.nager.at/api/v3/publicholidays/${currentYear}/US`);
    const holidays = await response.json();

    const holidayEvents = holidays.map(holiday => {
      return {
        startDate: holiday.date,
        endDate: holiday.date,
        title: holiday.name,
        holidayFlag: true
      };
    });
    filteredEvents = [...holidayEvents, ...filteredEvents];
  }

  for (let i = 0; i < daysToDisplay; i++) {
    const cell = document.createElement('div');
    cell.classList.add('calendar-cell');

    const dateContainer = document.createElement('div');
    dateContainer.classList.add('calendar-date');

    const eventsContainer = document.createElement('div');
    eventsContainer.classList.add('calendar-event-container');

    if (i >= startDay && currentDateIndex <= daysInMonth) {
      // Current Month
      const dateNumber = document.createElement('span');
      dateNumber.textContent = `${(currentMonth + 1).toString()}/${currentDateIndex.toString()}`;
      dateContainer.appendChild(dateNumber);

      // Add blue circle around the current date
      const currentDate = new Date(currentYear, currentMonth, currentDateIndex);
      if (currentDate.toDateString() === new Date().toDateString()) {
        dateContainer.classList.add('current-date');
      }

      if (Object.keys(filteredEvents).length !==  0) {
        const eventMatches = filteredEvents.filter(event => {
          const eventStartDate = new Date(event.startDate);
          const eventEndDate = new Date(event.endDate);
          const holidayFlag = event.holidayFlag;
          eventEndDate.setDate(eventEndDate.getDate() + 1);
          return (
            currentDate >= eventStartDate && currentDate < eventEndDate
          );
        });
        
        const maxEventsToShow = eventMatches.length > presetMaxEvents ? presetMaxEvents - 1 : presetMaxEvents;
        const visibleEvents = eventMatches.slice(0, maxEventsToShow);

        visibleEvents.forEach(event => {
          const eventDiv = document.createElement('div');
          eventDiv.classList.add('calendar-event');
          
          eventDiv.textContent = event.title;
          eventsContainer.appendChild(eventDiv);

          if (event.holidayFlag == true) {
            eventDiv.classList.add('holiday-event');
          };

          if (event.holidayFlag == false) {
            eventDiv.setAttribute("eventID", parseInt(event.timeOffID))
            eventDiv.setAttribute("role", event.role)
            const popperElement = createEventPopperElement(event);
            eventDiv.classList.add('calendar-event');
            eventDiv.addEventListener('click', showPopper.bind(null, popperElement));
          };
        });

        if (eventMatches.length > maxEventsToShow + 1) {
          const remainingEventsCount = eventMatches.length - maxEventsToShow;

          if (remainingEventsCount < 0) {
            visibleEvents.push(...eventMatches.slice(maxEventsToShow - 1));
          } else {
            visibleEvents.push(...eventMatches.slice(0, maxEventsToShow - 1));
          }

          const moreButton = document.createElement('div');
          moreButton.classList.add('calendar-event');
          moreButton.classList.add('calendar-event-more');
          moreButton.textContent = `(${remainingEventsCount} more)`;
          eventsContainer.appendChild(moreButton);

          const eventList = document.createElement('ul');
          eventList.classList.add('event-list');

          eventMatches.slice(maxEventsToShow).forEach(event => {
            const eventListItem = document.createElement('li');
            eventListItem.textContent = event.title;
            eventList.appendChild(eventListItem);
            
            const popperElement = createEventPopperElement(event);
            eventListItem.addEventListener('click', showPopper.bind(null, popperElement));
            
          });

          const popperElement = createPopperElement(moreButton, eventList);
          moreButton.addEventListener('click', () => showPopper(popperElement));
        }
      }


      currentDateIndex++;
    } else if (i < startDay) {
      // Previous Month
      cell.classList.add('calendar-cell-previous-month');
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const previousMonthDate = daysInMonth - (startDay - i - 1);

      const dateNumber = document.createElement('span');
      dateNumber.textContent = `${(previousMonth + 1).toString()}/${previousMonthDate.toString()}`;
      dateContainer.appendChild(dateNumber);

      const currentDate = new Date(previousYear, previousMonth, previousMonthDate);
      if (Object.keys(filteredEvents).length !==  0) {
        const eventMatches = filteredEvents.filter(event => {
          const eventStartDate = new Date(event.startDate);
          const eventEndDate = new Date(event.endDate);
          eventEndDate.setDate(eventEndDate.getDate() + 1);
          return (
            currentDate >= eventStartDate && currentDate < eventEndDate
          );
        });
      
        const maxEventsToShow = eventMatches.length > presetMaxEvents ? presetMaxEvents - 1 : presetMaxEvents;
        const visibleEvents = eventMatches.slice(0, maxEventsToShow);

        visibleEvents.forEach(event => {
          const eventDiv = document.createElement('div');
          eventDiv.classList.add('calendar-event');
          
          eventDiv.textContent = event.title;
          eventsContainer.appendChild(eventDiv);

          if (event.holidayFlag == true) {
            eventDiv.classList.add('holiday-event');
          };

          if (event.holidayFlag == false) {
            eventDiv.setAttribute("eventID", parseInt(event.timeOffID))
            eventDiv.setAttribute("role", event.role)
            const popperElement = createEventPopperElement(event);
            eventDiv.classList.add('calendar-event');
            eventDiv.addEventListener('click', showPopper.bind(null, popperElement));
          };
        });

        if (eventMatches.length > maxEventsToShow + 1) {
          const remainingEventsCount = eventMatches.length - maxEventsToShow;

          if (remainingEventsCount < 0) {
            visibleEvents.push(...eventMatches.slice(maxEventsToShow - 1));
          } else {
            visibleEvents.push(...eventMatches.slice(0, maxEventsToShow - 1));
          }

          const moreButton = document.createElement('div');
          moreButton.classList.add('calendar-event');
          moreButton.classList.add('calendar-event-more');
          moreButton.textContent = `(${remainingEventsCount} more)`;
          eventsContainer.appendChild(moreButton);

          const eventList = document.createElement('ul');
          eventList.classList.add('event-list');

          eventMatches.slice(maxEventsToShow).forEach(event => {
            const eventListItem = document.createElement('li');
            eventListItem.textContent = event.title;
            eventList.appendChild(eventListItem);
            
            const popperElement = createEventPopperElement(event);
            eventListItem.addEventListener('click', showPopper.bind(null, popperElement));
            
          });

          const popperElement = createPopperElement(moreButton, eventList);
          moreButton.addEventListener('click', () => showPopper(popperElement));
        }
      }

    } else {
      // Future Month
      cell.classList.add('calendar-cell-future-month');
      const futureMonthStart = new Date(currentYear, currentMonth + 1, 1);
      const futureMonthDate = i - (daysInMonth + startDay) + 1;
      const futureMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const futureYear = currentMonth === 11 ? currentYear + 1 : currentYear;

      const dateNumber = document.createElement('span');
      dateNumber.textContent = `${(futureMonth + 1).toString()}/${futureMonthDate.toString()}`;
      dateContainer.appendChild(dateNumber);

      const currentDate = new Date(futureYear, futureMonth, futureMonthDate);

      if (Object.keys(filteredEvents).length !==  0) {
        const eventMatches = filteredEvents.filter(event => {
          const eventStartDate = new Date(event.startDate);
          const eventEndDate = new Date(event.endDate);
          eventEndDate.setDate(eventEndDate.getDate() + 1);
          return (
            currentDate >= eventStartDate && currentDate < eventEndDate
          );
        });
        const maxEventsToShow = eventMatches.length > presetMaxEvents ? presetMaxEvents - 1 : presetMaxEvents;
        const visibleEvents = eventMatches.slice(0, maxEventsToShow);

        visibleEvents.forEach(event => {
          const eventDiv = document.createElement('div');
          eventDiv.classList.add('calendar-event');
          
          eventDiv.textContent = event.title;
          eventsContainer.appendChild(eventDiv);

          if (event.holidayFlag == true) {
            eventDiv.classList.add('holiday-event');
          };

          if (event.holidayFlag == false) {
            eventDiv.setAttribute("eventID", parseInt(event.timeOffID))
            eventDiv.setAttribute("role", event.role)
            const popperElement = createEventPopperElement(event);
            eventDiv.classList.add('calendar-event');
            eventDiv.addEventListener('click', showPopper.bind(null, popperElement));
          };
        });

        if (eventMatches.length > maxEventsToShow + 1) {
          const remainingEventsCount = eventMatches.length - maxEventsToShow;

          if (remainingEventsCount < 0) {
            visibleEvents.push(...eventMatches.slice(maxEventsToShow - 1));
          } else {
            visibleEvents.push(...eventMatches.slice(0, maxEventsToShow - 1));
          }

          const moreButton = document.createElement('div');
          moreButton.classList.add('calendar-event');
          moreButton.classList.add('calendar-event-more');
          moreButton.textContent = `(${remainingEventsCount} more)`;
          eventsContainer.appendChild(moreButton);

          const eventList = document.createElement('ul');
          eventList.classList.add('event-list');

          eventMatches.slice(maxEventsToShow).forEach(event => {
            const eventListItem = document.createElement('li');
            eventListItem.textContent = event.title;
            eventList.appendChild(eventListItem);
            
            const popperElement = createEventPopperElement(event);
            eventListItem.addEventListener('click', showPopper.bind(null, popperElement));
            
          });

          const popperElement = createPopperElement(moreButton, eventList);
          moreButton.addEventListener('click', () => showPopper(popperElement));
        }
      }
    }

    cell.appendChild(dateContainer);
    cell.appendChild(eventsContainer);
    calendarBody.appendChild(cell);
  }
  hideLoadingSpinner();
}

function showPreviousMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  updateNotificationCount()
  updateCalendar();
  createPopper();
  
}

function showNextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  updateCalendar();
  createPopper();
}

function updateCalendar() {
  monthCaption.textContent = `${getMonthName(currentMonth)} ${currentYear}`;
  if (filterInput.value == ""){
    generateCalendar();
  }
  else {
    applyFilter();
  }
}

function getMonthName(monthIndex) {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return monthNames[monthIndex];
}



function createEventPopperElement(event) {
  const popperElement = document.createElement('div');
  popperElement.classList.add('floating-container');
  popperElement.style.zIndex = '150';
  const onlyShowButton = document.createElement('button');
  onlyShowButton.textContent = "Only show this";
  onlyShowButton.addEventListener('click', () => {
    filterInput.value = event.timeOffID;
    applyFilter();
    hidePopper(popperElement)
  });
  onlyShowButton.classList.add("more-details")
  const eventDetails = document.createElement('div');
  eventDetails.innerHTML  = `
    <div class="event-item-name">${event.title}</div>
    <div class="event-item-date">${formatDate(event.startDate)} - ${formatDate(event.endDate)}</div>
    <div class="event-item-date">Request Date: ${formatDate(event.requestDate)}</div>
    <div class="event-item-name">Accepted By: ${event.acceptedBy}</div>
    ${isFutureDate(new Date(event.startDate)) ? `<button class="more-details red" onclick="rejectEvent(event, ${event.timeOffID})">
    <i class="fa-regular fa-times-circle"></i>
    Retroactive Deny
  </button>` 
  : ''}
    
  `;
  eventDetails.appendChild(onlyShowButton)
  popperElement.appendChild(eventDetails);
  eventDetails.classList.add('event-item')

  document.body.appendChild(popperElement);

  return popperElement;
}

function createPopperElement(referenceElement, contentElement) {
  const popperElement = document.createElement('div');
  popperElement.classList.add('floating-container');
  popperElement.appendChild(contentElement);

  document.body.appendChild(popperElement);

  return popperElement;
}

function showPopper(popperElement) {
  const referenceElement = event.target;
  const popperInstance = Popper.createPopper(referenceElement, popperElement, {
    placement: 'right',
    modifiers: [
      {
        name: 'eventListeners',
        options: {
          scroll: false,
          resize: true,
        },
      },
    ],
  });

  popperElement.style.display = 'block';

  const handleClick = (event) => {
    if (!popperElement.contains(event.target) && !referenceElement.contains(event.target)) {
      hidePopper(popperElement);
      document.removeEventListener('click', handleClick);
    }
  };

  document.addEventListener('click', handleClick);
}

function hidePopper(popperElement) {
  popperElement.style.display = 'none';
}


function countUnacceptedEvents(events) {
  let count = 0;
  if (Object.keys(events).length !==  0) {
    for (const event of events) {
      if (event.accepted == "pending") {
        count++;
      }
    }
    return count;
  }
  else {
    return 0;
  }
  
}


// Update the notification count dynamically
function updateNotificationCount() {
  const notificationCount = document.getElementById('notificationCount');
  const unacceptedCount = countUnacceptedEvents(allEvents);
  if (unacceptedCount > 0) {
    notificationCount.innerText = unacceptedCount.toString();
    notificationCount.style.visibility = 'visible';
  } else {
    console.log("No notifications")
    notificationCount.style.visibility = 'hidden';
  }
}

// Toggle notification Popper visibility
function togglePopper() {
  const popperContainer = document.getElementById('popperContainer');
  const isVisible = popperContainer.style.visibility === 'visible';

  if (isVisible) {
    popperContainer.style.visibility = 'hidden';
    popperContainer.style.opacity = '0';
  } else {
    popperContainer.style.visibility = 'visible';
    popperContainer.style.opacity = '1';
  }
}

// Toggle Denied Popper visibility
function toggleDeniedPopper() {
  const popperContainer = document.getElementById('deniedPopperContainer');
  const isVisible = popperContainer.style.visibility === 'visible';

  if (isVisible) {
    popperContainer.style.visibility = 'hidden';
    popperContainer.style.opacity = '0';
  } else {
    popperContainer.style.visibility = 'visible';
    popperContainer.style.opacity = '1';
  }
}

 // Format date as mm/dd/yyyy with no leading zeros
function formatDate(date) {
  const [year, month, day] = date.split('-');
  return `${parseInt(month)}/${parseInt(day)}/${year}`;
}

function updateNotificationPopper() {
  if (Object.keys(events).length !==  0) {
    const unacceptedEvents = allEvents.filter(event => event.accepted == "pending");
    if (unacceptedEvents.length > 0) {
      const popperContentHTML = unacceptedEvents
        .map(
          event => `
            <div class="event-item">
              <div class="event-item-name">${event.title}</div>
              <div class="event-item-date">${formatDate(event.startDate)} - ${formatDate(event.endDate)}</div>
              <div class="event-item-actions">
                <button class="accept-button" onclick="acceptEvent(event, ${event.timeOffID})">
                  <i class="fa-regular fa-check-circle"></i>
                  Accept
                </button>
                <button class="reject-button" onclick="rejectEvent(event, ${event.timeOffID})">
                  <i class="fa-regular fa-times-circle"></i>
                  Deny
                </button>
              </div>
            </div>
          `
        )
        .join('');
      popperContent.innerHTML = popperContentHTML;
    } else {
      popperContent.innerHTML = '<p>No unaccepted events</p>';
    }  
  };
}

function createListItem(instance) {
  function formatDate(date) {
    const mm = date.getMonth() + 1; // Months are 0-based
    const dd = date.getDate();
    const yyyy = date.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }
  return `
  ${isFutureDate(instance.startDate) ? `<div class="event-item">` : '<div class="expired-event-item">'}
        <div class="event-item-name">${instance.title}</div>
        <div class="event-item-date">${formatDate(instance.startDate)} - ${formatDate(instance.endDate)}</div>
        <div class="event-item-name">Denied by: ${instance.acceptedBy}</div>
        
        <div class="denied-event-item-actions">
          ${isFutureDate(instance.startDate) ? `
          <button class="accept-button" onclick="acceptEvent(event, ${event.timeOffID})">
            <i class="fa-regular fa-check-circle"></i>
            Accept
          </button>` 
          : ''}
          </button>
        </div>
      </div>
  `;
}



function convertToDateObjects(instances) {
  return instances.map(instance => ({
    ...instance,
    startDate: new Date(instance.startDate),
    endDate: new Date(instance.endDate),
    requestDate: new Date(instance.requestDate),populateDeniedPopperContent
  }));
}

function isFutureDate(date) {
  const today = new Date();
  return date > today;
}

//.sort((a, b) => b.requestDate.getDate() - a.requestDate.getDate());;

function compareDatesDescending(a, b) {
  const timestampA = a.getDate();
  const timestampB = b.getTime();

  // Compare timestamps in reverse order and return the comparison result
  return timestampB - timestampA;
}

function populateDeniedPopperContent() {
  if (Object.keys(events).length !==  0) {
    const preDeniedEvents = allEvents.filter(event => event.accepted == "denied")
  
    const deniedEvents = convertToDateObjects(preDeniedEvents);
    deniedEvents.sort((a, b) => b.startDate - a.startDate)
    const futureEventsDenied = [];
    const pastEventsDenied = [];
  
    deniedEvents.forEach((instance) => {
      if (instance.accepted === 'denied') {
        if (isFutureDate(instance.startDate)) {
          futureEventsDenied.push(instance);
        } else {
          pastEventsDenied.push(instance);
        }
      }
    });
  
    
  
    // Generate the HTML content for sorted denied instances
    const deniedPopperContent = document.getElementById('deniedPopperContent');
    deniedPopperContent.innerHTML = `${deniedEvents.map(createListItem).join('')}`;
  };
};




// Create the Popper for the notifications
function createPopper() {
  const iconElement = document.querySelector('.fa-envelope');
  const popperElement = document.getElementById('popperContainer');
  const popperContent = document.getElementById('popperContent');
  updateNotificationPopper()
  
  const popper = new Popper.createPopper(iconElement, popperElement, {
    placement: 'right',
    modifiers: [
      {
        name: 'offset',
        options: {
        },
      },
    ],
  });
}

// Create the Popper for the denied time offs
function createTimeOffPopper() {
  const iconElement = document.querySelector('.fa-calendar-xmark');
  const popperElement = document.getElementById('deniedPopperContainer');
  const popperContent = document.getElementById('deniedPopperContent');
  
  const popper = new Popper.createPopper(iconElement, popperElement, {
    placement: 'right',
    modifiers: [
      {
        name: 'denied',
        options: {
        },
      },
    ],
  });
}

// Handle event acceptance
function acceptEvent(event, time_off_ID) {
  event.stopPropagation();
  $.ajax({
    url: '/accepttimeoff/',  // Replace with the actual URL of your Django view
    type: 'POST',
    data: {
        'time_off_ID': time_off_ID,
        'csrfmiddlewaretoken': csrfToken,  // Add CSRF token if required by Django
    },
    dataType: 'json',
    success: function(response) {
      populateDeniedPopperContent()
      updateNotificationPopper()
      updateNotificationCount()
      fetchTimeOffs()
    },
    error: function(xhr, errmsg, err) {
        console.log(errmsg);  // Handle any errors
    }
  });
}

// Handle event rejection
function rejectEvent(event, time_off_ID) {
  event.stopPropagation();
  $.ajax({
    url: '/rejecttimeoff/',  // Replace with the actual URL of your Django view
    type: 'POST',
    data: {
        'time_off_ID': time_off_ID,
        'csrfmiddlewaretoken': csrfToken,  // Add CSRF token if required by Django
    },
    dataType: 'json',
    success: function(response) {
      updateNotificationPopper()
      updateNotificationCount()
      fetchTimeOffs()
    },
    error: function(xhr, errmsg, err) {
        console.log(errmsg);  // Handle any errors
    }
  });
}


// Submit New Time Off
$(document).ready(function() {
  $('#addNewTimeOff').submit(function(event) {
    event.preventDefault(); // Prevent the form from submitting in the traditional way
    console.log($(this).serialize())
    // Send the form data using AJAX
    $.ajax({
      type: 'POST',
      url: '/addnewtimeoff/',
      data: $(this).serialize(),
      success: function(response) {
        // If the response status is 204 (No Content), close the modal
          var modal = bootstrap.Modal.getInstance(document.getElementById('addTimeOffModal'));
          updateNotificationPopper()
          updateNotificationCount()
          fetchTimeOffs() 
          modal.hide();
      },
      error: function(error) {
        // Handle any errors if needed
        console.log('Error:', error);
      }
    });
  });
});


function handleCheckbox(checkbox) {
  let anyCheckboxChecked = false;

  for (let i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i] !== checkbox) {
      checkboxes[i].checked = false;
    } else if (checkbox.checked) {
      anyCheckboxChecked = true;
    }
  }
  if (!anyCheckboxChecked) {
    console.log('No checkbox checked.');
    updateCalendar()
  } else {
    console.log('Selected value:', checkbox.value);
    applyRoleFilter(checkbox.value)
  }
}