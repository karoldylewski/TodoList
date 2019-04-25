const charsetEncoding = 'data:text/json;charset=utf-8,';
const nameEmptyAlert = 'Name must be filled out!';
const downloadFileName = 'task.json';
const tableIndexToAppend = -1;
const btnSaveToFile = document.getElementById("btn-save-to-file").addEventListener("click", prepareFileToDownload);
const btnNewTask = document.getElementById("new-task-submit").addEventListener("click", submitNewTask);
const sortByName = document.getElementById("task-name-sort").addEventListener("click", function(){
  sortTable(0);
}, false);
const sortByPriority = document.getElementById("task-priority-sort").addEventListener("click", function(){
  sortTable(1);
}, false);
const loadFromFile = document.getElementById("btn-load-from-file").addEventListener("click", function(){
  openFile(saveFromFile);
}, false);
const loaded = document.addEventListener("DOMContentLoaded", onPageLoaded)
$("select").select2({dropdownCssClass: 'dropdown-inverse'});
function submitNewTask(){
  if (validateForm()){
    let task={
      name:document.getElementById("new-task-name").value,
      priority:document.getElementById("new-task-priority").value
    }
    submitTask(task);
    location.reload();
  }
}
function onPageLoaded(){
  let tasksKeysFromLocalStorage = loadDataFromLocalStorage();
  populateTable(tasksKeysFromLocalStorage);
}
function prepareFileToDownload(){
  let tasksObject = [];
  let tasksKeysFromLocalStorage = loadDataFromLocalStorage();
  if (tasksKeysFromLocalStorage !== null) {
    let tasksKeys = tasksKeysFromLocalStorage.split(',');
    tasksKeys.forEach(function (element) {
      const retrievedTask = localStorage.getItem(element);
      const parsedTask = JSON.parse(retrievedTask);
      tasksObject.push(parsedTask);
    });
  }
  let dataToDownload = charsetEncoding + encodeURIComponent(JSON.stringify(tasksObject));
  let dlAnchorElem = document.getElementById('btn-save-to-file');
  dlAnchorElem.setAttribute("href",     dataToDownload     );
  dlAnchorElem.setAttribute("download", downloadFileName);
}
function submitTask(element){
  const taskKey = generateTaskName();
  updateTaskList(taskKey);
  localStorage.setItem(taskKey, JSON.stringify(element));
}
function loadDataFromLocalStorage(){
  let data = localStorage.getItem('taskNames');
  return data;
}
function populateTable(data){
  if (data !== null){
    let tasksKeys = data.split(',');
    tasksKeys.forEach(fetchTask);
  }
}
function fetchTask(element, index, array){
  const retrievedTask = localStorage.getItem(element);
  const parsedTask = JSON.parse(retrievedTask);
  appendToTable(parsedTask);
}
function appendToTable(parsedTask){
  const taskTable = document.getElementById('task-table');
  const row = taskTable.insertRow(tableIndexToAppend);
  const taskNameCell = row.insertCell(tableIndexToAppend);
  const taskPriorityCell = row.insertCell(tableIndexToAppend);
  row.classList.add('task-'+parsedTask.priority.toLowerCase());
  taskNameCell.innerHTML = parsedTask.name;
  taskPriorityCell.innerHTML = parsedTask.priority;
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
    currentTime.getMilliseconds().toString()+
  Math.random();
  return key;
}
function validateForm() {
  let nameInput = document.forms["new-task-form"]["new-task"].value;
  if (nameInput == "") {
    alert(nameEmptyAlert);
    return false;
  }else{
    return true;
  }
}
function saveFromFile(contents) {
  const parsedTasks = JSON.parse(contents);
  parsedTasks.forEach(submitTask);
  location.reload();
}
function clickElem(elem) {
  const eventMouse = document.createEvent("MouseEvents");
  eventMouse.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  elem.dispatchEvent(eventMouse);
}
function openFile(func) {
  readFile = function(e) {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    let reader = new FileReader();
    reader.onload = function(e) {
      let contents = e.target.result;
      fileInput.func(contents);
      document.body.removeChild(fileInput)
    };
    reader.readAsText(file)
  };
  fileInput = document.createElement("input");
  fileInput.type='file';
  fileInput.style.display='none';
  fileInput.onchange=readFile;
  fileInput.func=func;
  document.body.appendChild(fileInput);
  clickElem(fileInput);
}
function sortTable(column) {
  let table, rows, switching, i, x, y, shouldSwitch;
  table = document.getElementById("task-table");
  switching = true;
  while (switching) {
    switching = false;
    rows = table.rows;
    for (i = 1; i < (rows.length - 1); i++) {
      shouldSwitch = false;
      x = rows[i].getElementsByTagName("TD")[column];
      y = rows[i + 1].getElementsByTagName("TD")[column];
      if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
        shouldSwitch = true;
        break;
      }
    }
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}
