var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // check due date
  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  };



  // loop over object properties
  $.each(tasks, function(list, arr) {
    //console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// event listener for editting
$(".list-group").on("click", "p", function () {
  // uses .text() to get inner text of current element represented by $(this)
  var text = $(this)
    .text()
    .trim();
  // creates the <textarea> and adds a class and gives it a value of var text
  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);
  // targets this object and replace <p> with <textarea>
  $(this).replaceWith(textInput);
  // highlights the input box created in var textInput
  textInput.trigger("focus");
  //console.log(this);
});

// event listener that we will use in leiu of save button
//blur event allows it to trigger as soon as interacts with anything other than <textarea>
$(".list-group").on("blur", "textarea", function() {
// get the textarea's current value/text
var text = $(this)
  .val()
  .trim();
// get the parent ul's id attribute 
// 5.1.6. i believe this selects the list-group class of the ul and pulls 
// the id associated with it removes the list- to select the toDo array
var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-", "");
// get the task's position in the list of other li elements
var index = $(this)
  .closest(".list-group-item")
  .index();
// tasks is an object; tasks[status] returns an array (e.g., toDo);
// tasks[status][index] returns the object at the given index in the array;
// tasks[status][index].text returns the text property of the object at the given index
// this is necessary so when we saveTasks it goes to localStorage
tasks[status][index].text = text;
saveTasks();

// recreate p element
var taskP = $("<p>")
  .addClass("m-1")
  .text(text);
// replace textarea with p element
$(this).replaceWith(taskP);
});

// event listener to edit due date
// due date was clicked
$(".list-group").on("click", "span", function() {
  // get current text
  var date = $(this)
    .text()
    .trim();
  //create new input element
  // In jQuery, attr() can serve two purposes. With one argument, 
  //  it gets an attribute (e.g., attr("id")). With two arguments, 
  //  it sets an attribute (e.g., attr("type", "text")). 
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);
  // swap out elements
  $(this).replaceWith(dateInput);
  // enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function() {
      // when calendar is closed, force "change" event on the 'dateinput'
      $(this).trigger("change")
    }
  });
  // automatically focus on new element
  dateInput.trigger("focus");
  // enable jquery ui datepicker
});

// value of due date was changed; swapped out blur for change here to 
// accomadate the date picker
$(".list-group").on("change", "input[type='text']", function () {
  // get current text
  var date = $(this)
    .val()
    .trim();
  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();
  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();
  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);
  // replace input with span element
  $(this).replaceWith(taskSpan);
  // passes task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
});


// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});


// makes this sortable
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    //console.log("activate", this);
  }, 
  deactivate: function(event) {
    //console.log("deactivate", this);
  },
  over: function(event) {
    //console.log("over", event.target);
  },
  out: function(event) {
    //console.log("out", event.target);
  },
  // allows for saving to localStorage of this obj when changed
  update: function(event) {
    // declares new array to store the data
    var tempArr = [];
    // loop over current set of children in sortable list
    $(this).children().each(function() {
      var text = $(this)
        .find("p")
        .text()
        .trim();
      var date = $(this)
        .find("span")
        .text()
        .trim();
      // add task data to the tempArr as an object
      tempArr.push({
        text: text,
        date: date
      });
      //console.log(tempArr);
    });
    // trim down list's ID to match object property
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");
    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  }
});

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
    //console.log("drop");
  },
  over: function(event, ui) {
    //console.log("over");
  },
  out: function(event, ui) {
    //console.log("out");
  }
});

$('#modalDueDate').datepicker({
  minDate: 1
});

var auditTask = function(taskEl) {
  // get date from task element
  var date = $(taskEl).find("span").text().trim();
  // ensure it worked
  //console.log(date); 

  // convert to moment object at 5:00pm
  var time = moment(date, "L").set("hour", 17);
  // this should print out an object for the value of the date variable, but at 5:00pm of that date
  //console.log(time);

  // removes any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  //apply new class if task is near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  }
  else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }

};

// load tasks for the first time
loadTasks();


