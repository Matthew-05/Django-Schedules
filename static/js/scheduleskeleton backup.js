const pSBC=(p,c0,c1,l)=>{
  let r,g,b,P,f,t,h,i=parseInt,m=Math.round,a=typeof(c1)=="string";
  if(typeof(p)!="number"||p<-1||p>1||typeof(c0)!="string"||(c0[0]!='r'&&c0[0]!='#')||(c1&&!a))return null;
  if(!this.pSBCr)this.pSBCr=(d)=>{
      let n=d.length,x={};
      if(n>9){
          [r,g,b,a]=d=d.split(","),n=d.length;
          if(n<3||n>4)return null;
          x.r=i(r[3]=="a"?r.slice(5):r.slice(4)),x.g=i(g),x.b=i(b),x.a=a?parseFloat(a):-1
      }else{
          if(n==8||n==6||n<4)return null;
          if(n<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(n>4?d[4]+d[4]:"");
          d=i(d.slice(1),16);
          if(n==9||n==5)x.r=d>>24&255,x.g=d>>16&255,x.b=d>>8&255,x.a=m((d&255)/0.255)/1000;
          else x.r=d>>16,x.g=d>>8&255,x.b=d&255,x.a=-1
      }return x};
  h=c0.length>9,h=a?c1.length>9?true:c1=="c"?!h:false:h,f=this.pSBCr(c0),P=p<0,t=c1&&c1!="c"?this.pSBCr(c1):P?{r:0,g:0,b:0,a:-1}:{r:255,g:255,b:255,a:-1},p=P?p*-1:p,P=1-p;
  if(!f||!t)return null;
  if(l)r=m(P*f.r+p*t.r),g=m(P*f.g+p*t.g),b=m(P*f.b+p*t.b);
  else r=m((P*f.r**2+p*t.r**2)**0.5),g=m((P*f.g**2+p*t.g**2)**0.5),b=m((P*f.b**2+p*t.b**2)**0.5);
  a=f.a,t=t.a,f=a>=0||t>=0,a=f?a<0?t:t<0?a:a*P+t*p:0;
  if(h)return"rgb"+(f?"a(":"(")+r+","+g+","+b+(f?","+m(a*1000)/1000:"")+")";
  else return"#"+(4294967296+r*16777216+g*65536+b*256+(f?m(a*255):0)).toString(16).slice(1,f?undefined:-2)
}

document.addEventListener('DOMContentLoaded', function() {
  Function();
});

async function getShifts() {
  return new Promise(function(resolve, reject) {
    var shiftMasterID = document.getElementById("shiftMasterID").dataset.backendData;
    // AJAX request
    $.ajax({
      url: '/getshifts',  // URL to your Django view handling the search request
      type: 'GET',
      data: { 'shiftMasterID': shiftMasterID },
      success: function(response) {
        resolve(response); // Resolve the promise with the data
      },
      error: function(response) {
        reject("None"); // Reject the promise with the error
      }
    });
  });
}



async function Function(){
  var csrfToken = window.csrfToken;
  const jsonData = await getShifts();

  console.log("THIS IS THE DATA",jsonData)
  var parsedData = jsonData
  //var parsedData = JSON.parse(jsonData);
  console.log(parsedData)
  var employeeCountPerShift = new Array();
  var uniqueTimeSlots = new Array()

  for (var shift in parsedData) {
    if (parsedData.hasOwnProperty(shift)) {

      var numberOfEmployees = parsedData[shift][0];
      var affectedTimeSlots = parsedData[shift][1];
      var startingTimeSlot = affectedTimeSlots[0]

      

      //Collecting unique time slots
      affectedTimeSlots.forEach(function(value){
        if(!uniqueTimeSlots.includes(value)){
          uniqueTimeSlots.push(value);
        }
      })
      
      affectedTimeSlots.forEach(function (slot, idx, array) {

        var modifying = $("[timeslot="+slot+"]");
        
        var currentShifts = (modifying.attr("shifts"))
    
        //This checks the current shifts on the slot
        //if there is no shift in the slot yet
        if (currentShifts === "") {
          modifying.attr('shifts', shift);
        }
        //Adding space if there is already a shift in the slot
        else {
          modifying.attr('shifts', currentShifts+" "+shift);
        }
        
        


        //Seperating logic for the last slot
        if (idx === array.length - 1){ 
          
          var shiftEnd = (modifying.attr("shift-end"))
          //Checking if there is endblock shift in slot yet
          if (shiftEnd === "") {
            modifying.attr('shift-end', shift);
          }
    
          else {
            modifying.attr('shift-end', shiftEnd+" "+shift);
          }
        }
        else {
          //Adding the employees to each slot
          var totalEmployees = parseInt(modifying.attr('employee-count')) + parseInt(numberOfEmployees);
          modifying.attr('employee-count', totalEmployees);
          modifying.addClass("clickable");
          //Collecting number of employees for each shift
          employeeCountPerShift.push(totalEmployees);
        }
        
      });
    }
  }

  //Finding the highest employee count
  var maxEmployeeCount = 0

  for (var i = 0; i < employeeCountPerShift.length; i++) {
    if (employeeCountPerShift[i] > maxEmployeeCount) {
      maxEmployeeCount = employeeCountPerShift[i]
    }
  }
  console.log("Highest employee count: "+maxEmployeeCount)
  //console.log(maxEmployeeCount)


  console.log(uniqueTimeSlots)
  uniqueTimeSlots.forEach(function (slot) {
    console.log("Changing slot")
    let color = "#e7e7e7";
    var modifying = $("[timeslot="+slot+"]");
    var employeeCount = parseInt(modifying.attr('employee-count'));
    var darknessLevel = 0
    let darknessChange = -(employeeCount/maxEmployeeCount)
    
    var newColor = pSBC ( parseFloat(darknessChange), color, false, true);
    
    $("[timeslot='"+slot+"']").css("background-color",newColor)
  });

  $("[shifts*='shift']").each(function(index){
    [index] = $(this).attr("employee-count");
  });



  ///This is all of the click modal logic

  function calculateDuration(time1, time2) {
    // Convert time1 to 24-hour format
    let [hour1, minute1, period1] = time1.split(/:| /);
    hour1 = parseInt(hour1);
    if (period1 === "PM" && hour1 !== 12) {
      hour1 += 12;
    } else if (period1 === "AM" && hour1 === 12) {
      hour1 = 0;
    }
    
    // Convert time2 to 24-hour format
    let [hour2, minute2, period2] = time2.split(/:| /);
    hour2 = parseInt(hour2);
    if (period2 === "PM" && hour2 !== 12) {
      hour2 += 12;
    } else if (period2 === "AM" && hour2 === 12) {
      hour2 = 0;
    }
    
    // Calculate time difference in minutes
    let totalMinutes = (hour2 * 60 + parseInt(minute2)) - (hour1 * 60 + parseInt(minute1));
    // Handle case where time2 is earlier than time1 (crossing midnight)
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60;
    }
    // Calculate duration in hours and minutes
    //let hours = Math.floor(totalMinutes / 60);
    //let minutes = totalMinutes % 60;

    let slotSteps = (totalMinutes/60)*4
    console.log("Slot steps: ", slotSteps)
    
    return slotSteps;
  }


  function range(start, end, step = 1) {
    const result = [];
    
    if (step === 0) {
      throw new Error("Step cannot be zero.");
    }
    
    if (step > 0) {
      for (let i = start, index = 0; i < end; i += step, index++) {
        result[index] = i;
      }
    } else {
      for (let i = start, index = 0; i > end; i += step, index++) {
        result[index] = i;
      }
    }
    
    return result;
  }



  var isHighlighted = false
  function highlightSlots(highlightArray) { //This function takes the strings of the timeslots
    isHighlighted = true
    unhighlightSlots()
    console.log("Highlighting slots")
    $.each(highlightArray, function(index, value) {
      $("[timeslot='"+value+"']").addClass("shift-highlight")
    })
  }

  function unhighlightSlots() {
    isHighlighted = false
    $(".shift-highlight").removeClass("shift-highlight")
    console.log("Unhighlighting slots")
  }


  function addNewShift(selectedSlot) {
    highlightSlots([selectedSlot])
    var selectedSlotObject = $("[timeslot='"+selectedSlot+"']")
    var startTime = selectedSlotObject.attr("time")
    
    //Getting rid of leading 0 in time
    if (startTime.startsWith("0")) {
      startTime = startTime.slice(1);
    }
    var length = $("#durationInput").length
    modalContent.innerHTML = ""
    if ($("#durationInput").length !== 0) {
      console.log("Button already exists");
      $("#durationInput").remove();
    }
    
    var text = document.createTextNode("Create new Shift");
    modalContent.appendChild(text);
    var timeContainer = document.getElementById("timeContainer");

    //Form Container
    var formContainer = document.createElement("form");
    formContainer.id = "formContainer"
    modalContent.appendChild(formContainer);
    var formContainer = document.getElementById("formContainer");


    //Create the time selector container
    var flexContainer = document.createElement("div");
    flexContainer.id = "timeContainer"
    formContainer.appendChild(flexContainer);
    var timeContainer = document.getElementById("timeContainer");
    
    //Create the employee count container
    var flexContainer = document.createElement("div");
    flexContainer.id = "employeeContainer"
    formContainer.appendChild(flexContainer);
    var employeeContainer = document.getElementById("employeeContainer");

    //Creating the time label
    var text = document.createElement("div");
    text.innerHTML = (startTime + " to")
    text.style.display = "inline-block";
    timeContainer.appendChild(text);

    //Creating the time selector
    var input = document.createElement("input");
    input.id = "durationInput"
    input.type = "text";
    input.style ="width: 100px; margin: 5px;"
    input.className = "time ui-timepicker-input"; // set the CSS class
    input.defaultValue = startTime;
    timeContainer.appendChild(input); // put it into the DOM
    
    //Creating the employee count label
    var text = document.createElement("div");
    text.innerHTML = "Employees:"
    text.style.display = "inline-block";
    employeeContainer.appendChild(text);

    //Creating the employee selector
    var input = document.createElement("input");
    input.id = "employeeCountInput"
    input.type = "number";
    input.min = 1;
    input.defaultValue = 1;
    input.style ="width: 100px; margin: 5px;"
    employeeContainer.appendChild(input);

    //Hidden slots (the one for the algo)
    var input = document.createElement("input");
    input.id = "shiftSlots"
    input.name = "shiftSlots"
    input.type = "hidden";
    formContainer.appendChild(input);

    //Hidden shift class slots (the one with an extra at the end)
    var input = document.createElement("input");
    input.id = "classSlots"
    input.name = "classSlots"
    input.type = "hidden";
    formContainer.appendChild(input);

    //Submit button
    var button = document.createElement("button");
    button.id = "newShiftSubmit"
    button.onclick = function() {
      submitNewShift()
    };
    button.style ="width: 5-px; height: 20px;"
    modalContent.appendChild(button);

    $('#durationInput').timepicker({
      'minTime': startTime,
      'showDuration': true,
      'step': 15,
      'forceRoundTime': true,
      'timeFormat': 'g:i A'
    });

    $('#durationInput').change(function() {
      // Code to execute when the input value changes.  It changes the highlight array, re-highlights, changes the hidden inputs as well as change the "class array"
      var selectedTime = $(this).val();
      var numberOfSteps = calculateDuration(startTime, selectedTime)

      if ((parseInt(selectedSlot)+parseInt(numberOfSteps))> 671) {
        var highlightArray = new Array()
        var overflowCount = (parseInt(selectedSlot)+parseInt(numberOfSteps))-671
        Array.prototype.push.apply(highlightArray, range(parseInt(selectedSlot), 672, 1))
        Array.prototype.push.apply(highlightArray, range(0,overflowCount-1,1))
        var placeholderSlot = overflowCount-1
      }
      else {
        var highlightArray = (range(parseInt(selectedSlot), parseInt(selectedSlot)+parseInt(numberOfSteps), 1))
        if(parseInt(selectedSlot)+parseInt(numberOfSteps) + 1 == 672){
          var placeholderSlot = 0
        }
        else {
          var placeholderSlot = (parseInt(selectedSlot)+parseInt(numberOfSteps))
        }
      }
      var shiftClassSlots = new Array()

      Array.prototype.push.apply(shiftClassSlots, highlightArray);
      Array.prototype.push.apply(shiftClassSlots, [placeholderSlot]);

      document.getElementById("classSlots").value = shiftClassSlots;
      document.getElementById("shiftSlots").value = highlightArray;
      highlightSlots(highlightArray)
    });

    //Setting the values if nothing has changed
    highlightArray = [selectedSlot]
    if (parseInt(selectedSlot) == 671)
      shiftClassSlots = [671, 1]
    else
      shiftClassSlots = [parseInt(selectedSlot), parseInt(selectedSlot)+1]

    document.getElementById("classSlots").value = shiftClassSlots;
    document.getElementById("shiftSlots").value = highlightArray;
    optionModal.style.display = 'block';
  }


  function submitNewShift() {
    var shiftMasterID = document.getElementById("shiftMasterID").dataset.backendData;
    var classSlots = document.getElementById("classSlots").value;
    var shiftSlots = document.getElementById("shiftSlots").value;
    var employeeCount = document.getElementById("employeeCountInput").value;

    //Resetting modal
    optionModal.style.display = "none";
    modalContent.innerHTML = ""

    console.log("Da cookie", csrfToken)
    $.ajax({
      url: '/submitshift/',  // Replace with the actual URL of your Django view
      type: 'POST',
      data: {
          'shift_master_id': shiftMasterID,
          'class_slots': classSlots,
          'shift_slots': shiftSlots,
          'employee_count': employeeCount,
          'csrfmiddlewaretoken': csrfToken,  // Add CSRF token if required by Django
      },
      dataType: 'json',
      success: function(response) {
          location.reload()
      },
      error: function(xhr, errmsg, err) {
          console.log(errmsg);  // Handle any errors
      }
    });
  }

  function editShiftPreview(selectedShift) {
    modalContent.innerHTML = ""
    var shiftsToHighlight = new Array()

    //var slot = shift.attr('shifts')
    //var employeeCount = shift.attr("employee-count")
    var employeCount = findEmployeeCount(parsedData, selectedShift)
    var selectedShifts = $("[shifts*='"+selectedShift+"']")

    var shiftsToHighlight = new Array()
    $.each(selectedShifts, function(index, value) {
      var element = $(this);
      if (!element.attr("shift-end").includes(selectedShift)) {
        Array.prototype.push.apply(shiftsToHighlight, [element.attr("timeslot")]);
      }
    })

    var startSlot = findStartSlot(parsedData, selectedShift)
    var startingTime = $("[timeslot='"+startSlot+"']").attr("time")

    //Getting rid of leading 0 in time
    if (startingTime.startsWith("0")) {
      startingTime = startingTime.slice(1);
    }

    var endSlot = findEndSlot(parsedData, selectedShift)
    var endingTime = $("[timeslot='"+endSlot+"']").attr("time")
    if (endingTime.startsWith("0")) {
      endingTime = endingTime.slice(1);
    }

    //Create the employeeCountContainer container
    var container = document.createElement("div");
    container.id = "employeeCountContainer"
    modalContent.appendChild(container);
    var employeeCountContainer = document.getElementById("employeeCountContainer");

    //Creating the employee count label
    var text = document.createElement("div");
    text.innerHTML = "Employees: "+ employeCount
    text.style.display = "inline-block";
    employeeCountContainer.appendChild(text);
    
    //Create the timeDurationContainer container
    var container = document.createElement("div");
    container.id = "timeDurationContainer"
    modalContent.appendChild(container);
    var timeDurationContainer = document.getElementById("timeDurationContainer");

    //Creating the employee count label
    var text = document.createElement("div");
    text.innerHTML = startingTime + " - " + endingTime;
    text.style.display = "inline-block";
    timeDurationContainer.appendChild(text);

    var button = document.createElement("button");
    button.innerText = "Edit Shift";
    button.onclick = function() {
      editShift(selectedShift, shiftsToHighlight)
    };
    modalContent.appendChild(button)


    highlightSlots(shiftsToHighlight)
    optionModal.style.display = 'block';
  }

  function editShift(selectedShift, highlightArray) {
    modalContent.innerHTML = ""
    var employeCount = findEmployeeCount(parsedData, selectedShift)

    var startSlot = findStartSlot(parsedData, selectedShift)
    var startingTime = $("[timeslot='"+startSlot+"']").attr("time")

    //Getting rid of leading 0 in time
    if (startingTime.startsWith("0")) {
      startingTime = startingTime.slice(1);
    }

    var endSlot = findEndSlot(parsedData, selectedShift)
    var endingTime = $("[timeslot='"+endSlot+"']").attr("time")
    if (endingTime.startsWith("0")) {
      endingTime = endingTime.slice(1);
    }

    var text = document.createTextNode("Edit shift");
    modalContent.appendChild(text);
    var timeContainer = document.getElementById("timeContainer");

    //Form Container
    var formContainer = document.createElement("form");
    formContainer.id = "formContainer"
    modalContent.appendChild(formContainer);
    var formContainer = document.getElementById("formContainer");


    //Create the time selector container
    var flexContainer = document.createElement("div");
    flexContainer.id = "timeContainer"
    formContainer.appendChild(flexContainer);
    var timeContainer = document.getElementById("timeContainer");
    
    //Create the employee count container
    var flexContainer = document.createElement("div");
    flexContainer.id = "employeeContainer"
    formContainer.appendChild(flexContainer);
    var employeeContainer = document.getElementById("employeeContainer");

    //Creating the time label
    var text = document.createElement("div");
    text.innerHTML = (startingTime + " to")
    text.style.display = "inline-block";
    timeContainer.appendChild(text);

    //Creating the time selector
    var input = document.createElement("input");
    input.id = "durationInput"
    input.type = "text";
    input.style ="width: 100px; margin: 5px;"
    input.className = "time ui-timepicker-input"; // set the CSS class
    input.defaultValue = endingTime;
    timeContainer.appendChild(input); // put it into the DOM
    
    //Creating the employee count label
    var text = document.createElement("div");
    text.innerHTML = "Employees:"
    text.style.display = "inline-block";
    employeeContainer.appendChild(text);

    //Creating the employee selector
    var input = document.createElement("input");
    input.id = "employeeCountInput"
    input.type = "number";
    input.min = 1;
    input.defaultValue = employeCount;
    input.style ="width: 100px; margin: 5px;"
    employeeContainer.appendChild(input);

    //Hidden slots (the one for the algo)
    var input = document.createElement("input");
    input.id = "shiftSlots"
    input.name = "shiftSlots"
    input.type = "hidden";
    formContainer.appendChild(input);

    //Hidden shift class slots (the one with an extra at the end)
    var input = document.createElement("input");
    input.id = "classSlots"
    input.name = "classSlots"
    input.type = "hidden";
    formContainer.appendChild(input);

    //Save button
    var button = document.createElement("button");
    button.id = "editShiftSubmit"
    button.text = "Edit Shift"
    button.style ="height: 50px; width: 20px"
    button.onclick = function() {
      submitEditShift(selectedShift)
    };
    modalContent.appendChild(button);

    $('#durationInput').timepicker({
      'minTime': startingTime,
      'showDuration': true,
      'step': 15,
      'forceRoundTime': true,
      'timeFormat': 'g:i A'
    });

    $('#durationInput').change(function() {
      // Code to execute when the input value changes
      var selectedTime = $(this).val();
      var numberOfSteps = calculateDuration(startingTime, selectedTime)

      if ((parseInt(startSlot)+parseInt(numberOfSteps))> 671) {
        var highlightArray = new Array()
        var overflowCount = (parseInt(startSlot)+parseInt(numberOfSteps))-671
        Array.prototype.push.apply(highlightArray, range(parseInt(startSlot), 672, 1))
        Array.prototype.push.apply(highlightArray, range(0,overflowCount-1,1))
        var placeholderSlot = overflowCount-1
      }
      else {
        var highlightArray = (range(parseInt(startSlot), parseInt(startSlot)+parseInt(numberOfSteps), 1))
        if(parseInt(startSlot)+parseInt(numberOfSteps) + 1 == 672){
          var placeholderSlot = 0
        }
        else {
          var placeholderSlot = (parseInt(startSlot)+parseInt(numberOfSteps))
        }
      }
      var shiftClassSlots = new Array()

      Array.prototype.push.apply(shiftClassSlots, highlightArray);
      Array.prototype.push.apply(shiftClassSlots, [placeholderSlot]);
      document.getElementById("classSlots").value = shiftClassSlots;
      document.getElementById("shiftSlots").value = highlightArray;
      console.log(highlightArray)
      console.log(shiftClassSlots)
      highlightSlots(highlightArray)
    })
    //Setting the values if nothing has changed
    var shiftClassSlots = new Array()
    console.log("HERE",highlightArray[(highlightArray.length)-1])
    if(highlightArray[(highlightArray.length)-1] + 1 == 672){
      var placeholderSlot = 0
    }
    else {
      var placeholderSlot = parseInt(highlightArray[(highlightArray.length)-1]) + 1
    }
    Array.prototype.push.apply(shiftClassSlots, highlightArray);
    Array.prototype.push.apply(shiftClassSlots, [placeholderSlot]);
    document.getElementById("classSlots").value = shiftClassSlots;
    document.getElementById("shiftSlots").value = highlightArray;
  }

  function submitEditShift(selectedShift) {
    var classSlots = document.getElementById("classSlots").value;
    var shiftSlots = document.getElementById("shiftSlots").value;
    var employeeCount = document.getElementById("employeeCountInput").value;

    //Resetting modal
    optionModal.style.display = "none";
    modalContent.innerHTML = ""

    console.log("Da cookie", csrfToken)
    $.ajax({
      url: '/editshift/',  // Replace with the actual URL of your Django view
      type: 'POST',
      data: {
          'selected_shift': selectedShift,
          'class_slots': classSlots,
          'shift_slots': shiftSlots,
          'employee_count': employeeCount,
          'csrfmiddlewaretoken': csrfToken,  // Add CSRF token if required by Django
      },
      dataType: 'json',
      success: function(response) {
          location.reload()
      },
      error: function(xhr, errmsg, err) {
          console.log(errmsg);  // Handle any errors
      }
    });
  }


  //This is used to find number of employees for a shift since the number of employees on the slot itself can be unreliable
  function findEmployeeCount(arr, shift) {
    for (var searchShift in arr){
      if (searchShift === shift){
        return(parsedData[shift][0]);}
    }
    return "ERROR"; // Return ERROR if the target string is not found in the array
  }


  //This is used to find start slot since else can be unreliable
  function findStartSlot(arr, shift) {
    for (var searchShift in arr){
      console.log(searchShift, shift)
      if (searchShift === shift){
        var startingSlot = (parsedData[shift][1][0])
        return(startingSlot)
      }
    }
    return "ERROR"; // Return ERROR if the target string is not found in the array
  }


  //This is used to find end slot since else can be unreliable
  function findEndSlot(arr, shift) {
    for (var searchShift in arr){
      console.log(searchShift, shift)
      if (searchShift === shift){
        var endingSlot = (parsedData[shift][1][parsedData[shift][1].length-1])
        return(endingSlot)
      }
    }
    return "ERROR"; // Return ERROR if the target string is not found in the array
  }


  const optionModal = document.getElementById('optionModal');
  const modalContent = document.getElementById('modalContent');

  var shiftToHighlight = ""
  var actionOccurred = false
  var overlappingShifts = new Array()

  var modalShowing = ""
  $('.slot').click(
    function() {
      if (isHighlighted === true) {
        unhighlightSlots()
      }
      modalContent.innerHTML = "";
      //Setting up modal settings
      var rect = $(this).get(0).getBoundingClientRect();
      var topLeftX = rect.left;
      var divTopLeftY = rect.top;
      var topRightX = topLeftX + $(this).get(0).clientWidth

      optionModal.style.left = topRightX;
      optionModal.style.top = divTopLeftY;

      if (parseInt($(this).attr("timeslot"))>575) {
        optionModal.style.left = topLeftX - 250;
        console.log("last column")
      }

      

      //These are the shifts associated with the slot before being cleaned
      var actualShifts = new Array()
      if ($(this).attr('shifts').includes("shift")) {
        if ($(this).attr('shifts').includes(" ")) {
          var actualShifts = $(this).attr('shifts').split(' ');
        }
        else {
          actualShifts.push($(this).attr('shifts'))
        }
      }

      //These are finding the "end-block" shifts associated with the slot
      var endShifts = new Array()
      if ($(this).attr('shift-end').includes("shift")) {
        if ($(this).attr('shift-end').includes(" ")) {
          var endShifts = $(this).attr('shift-end').split(' ');
        }
        else {
          endShifts.push($(this).attr('shift-end'))
        }
      }

      var cleanedShifts = actualShifts
      //This is cleaning the list of shifts on the cell so that it ignores end-block shifts
      for (var i = 0; i < actualShifts.length; i++) {
        if (endShifts.includes(actualShifts[i])) {
          console.log("Removing ",actualShifts[i])
          cleanedShifts = cleanedShifts.filter(e => e !== actualShifts[i]);
        }
      }

      console.log("After cleaning: ",cleanedShifts)

      
      //No shifts on current cell
      if(cleanedShifts.length === 0) {
        var selectedSlot = $(this).attr("timeslot");
        console.log("No shift detected")
        addNewShift(selectedSlot)
      }

      //This only runs if there is at least one shift
      else {
        //Multiple shifts
        if(cleanedShifts.length > 1) {
          console.log("Multiple shifts on cell detcted");
          overlappingShifts = $(this).attr('shifts').split(' ');
          //console.log(overlappingShifts)
          modalContent.innerHTML = "Choose a shift";
          overlappingShifts.forEach(function(shift){
            var button = document.createElement("button");
            button.innerText = shift;
            button.onclick = function() {
              editShiftPreview(shift)
            };
            
            modalContent.appendChild(button);
          })
          
          optionModal.style.display = 'block';
        }
        //One shift
        else {
          console.log("Only one shift on cell detected")
          editShiftPreview(cleanedShifts[0])
        }
      }
      //Resetting detector tracking
      overlappingShifts = []
    }
  )
};


$(document).ready(function() {
  // Add hover event handler to highlight the div on mouseover
  $('.slot').hover(
    function() {
      $(this).addClass('hover-highlight');
    },
    function() {
      $(this).removeClass('hover-highlight');
    }
  );
});