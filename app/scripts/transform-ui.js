$("select").select2({dropdownCssClass: 'dropdown-inverse'});

$('#new-task-submit').on('click', function(event) {
 if (validateForm()){
    let task={
      name:document.getElementById("new-task-name").value,
      priority:document.getElementById("new-task-priority").value
    }
    let taskKey = generateTaskName();
    updateTaskList(taskKey);
    localStorage.setItem(taskKey, JSON.stringify(task));
    location.reload();
 }
});

$( document ).ready(function() {
  let data = localStorage.getItem('taskNames');
  if (data !== null){
    let tasksKeys = data.split(',');
    tasksKeys.forEach(fetchTask);
  }
});
function fetchTask(element, index, array){
  const retrievedTask = localStorage.getItem(element);
  const parsedTask = JSON.parse(retrievedTask);
  $('#task-table > tbody:last-child').append('<tr class=task-'+parsedTask.priority.toLowerCase()+'>\n' +
    '          <td>'+parsedTask.name+'</td>\n' +
    '          <td>'+parsedTask.priority+'</td>\n' +
    '        </tr>');

}
function updateTaskList(taskName){
  let storedKeys = localStorage.getItem('taskNames');
  if (storedKeys == null){
    let storedKeysArray = [];
    storedKeysArray.push(taskName);
    storedKeys=storedKeysArray;
  }else{
    let storedKeysArray = storedKeys.split(',');
    storedKeysArray.push(taskName);
    storedKeys = storedKeysArray;
  }
  localStorage.setItem('taskNames', storedKeys);
}

function generateTaskName(){
  let currentTime = new Date();
  let key = currentTime.getFullYear().toString()+
    currentTime.getMonth().toString()+
    currentTime.getDate().toString()+
    currentTime.getHours().toString()+
    currentTime.getMinutes().toString()+
    currentTime.getSeconds().toString()+
    currentTime.getMilliseconds().toString();
  return key;
}
function validateForm() {
  var nameInput = document.forms["new-task-form"]["new-task"].value;
  if (nameInput == "") {
    alert("Name must be filled out!");
    return false;
  }else{
    return true;
  }
}
