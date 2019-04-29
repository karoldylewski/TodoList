const charsetEncoding = 'data:text/json;charset=utf-8,';
const nameEmptyAlert = 'Name must be filled out!';
const downloadFileName = 'task.json';
const deleteMessage = 'Are you sure to delete this task?';
const newAccountMessage = 'Are you sure to create new account?';
const dataFetchApi = 'https://jsonplaceholder.typicode.com/';
const fakeObjectDefaultPriority = 'Low';
const objectNotSelected = 'Object is not selected!';
const dropdownDefaultValue = '<option disabled selected value="">Select</option>'
const tableIndexToAppend = -1;
const numberOfRecordsToFetchFromApi = 10;
const alertPasswordNeedLowerCaseChar = 'Your password needs a lower case letter';
const alertPasswordNeedUpperCaseChar = 'Your password needs a upper case letter';
const priorityMark = "<span class='fui-info-circle'> </span>";
const trashBinMark = "<span class='fui-trash btn btn-primary btn-sort btn-delete-task'> </span>";
$("select").select2({dropdownCssClass: 'dropdown-inverse'});
$('#new-fetch-type').on('change', function (e) {
  apiHandle.fetchFakeObjects($(this).val());
});

const storageManagement = {
  loadDataFromLocalStorage: function () {
    let data = localStorage.getItem('taskNames');
    return data;
  },
  deleteTask: function (id) {
    localStorage.removeItem(id)
    let storedKeys = localStorage.getItem('taskNames');
    let storedKeysArray = storedKeys.split(',');
    if (storedKeysArray.length == 1) {
      localStorage.removeItem('taskNames');
    } else {
      storedKeysArray.splice(storedKeysArray.indexOf(id), 1);
      localStorage.setItem('taskNames', storedKeysArray);
    }
    tableManagement.reloadTableBody();
  },
  updateTaskList: function (taskName) {
    let storedKeys = localStorage.getItem('taskNames');
    if (storedKeys == null) {
      let storedKeysArray = [];
      storedKeysArray.push(taskName);
      storedKeys = storedKeysArray;
    } else {
      let storedKeysArray = storedKeys.split(',');
      storedKeysArray.push(taskName);
      storedKeys = storedKeysArray;
    }
    localStorage.setItem('taskNames', storedKeys);
  },
  fetchTask: function (element, index, array) {
    const retrievedTask = localStorage.getItem(element);
    const parsedTask = JSON.parse(retrievedTask);
    tableManagement.appendToTable(parsedTask, element);
  },
  parseJsonTasksToObject: function (contents) {
    const parsedTasks = JSON.parse(contents);
    parsedTasks.forEach(storageManagement.submitTask);
    tableManagement.reloadTableBody();
  },
  submitTask: function (element) {
    const taskKey = taskManagement.generateTaskName();
    storageManagement.updateTaskList(taskKey);
    localStorage.setItem(taskKey, JSON.stringify(element));
  },
};

const identityManagement = {
  requestLogin: function () {
    $('#alert-warning-login').hide();
    let user = {
      userLogin: document.getElementById('login-name').value,
      userPassword: document.getElementById('login-pass').value
    }
    identityManagement.authenticateUser(user);
  },
  authenticateUser: function (user) {
    const userWithPrivileges = localStorage.getItem('credentials');
    if (userWithPrivileges !== null) {
      const parsedUserWithPrivileges = JSON.parse(userWithPrivileges);
      if (parsedUserWithPrivileges.userLogin == user.userLogin && parsedUserWithPrivileges.userPassword == user.userPassword) {
        $('#app-content').show();
        $('#login-app-window').hide();
        tableManagement.reloadTableBody();
      } else {
        identityManagement.userNotAuthorized();
      }
    } else {
      identityManagement.userNotAuthorized();
    }
  },
  createAccount: function () {
    const confirmResult = confirm(newAccountMessage);
    if (confirmResult) {
      let user = {
        userLogin: document.getElementById('login-name').value,
        userPassword: document.getElementById('login-pass').value
      }
      if (user.userPassword.search(/[a-z]/) < 0) {
        alert(alertPasswordNeedLowerCaseChar);
      } else if (user.userPassword.search(/[A-Z]/) < 0) {
        alert(alertPasswordNeedUpperCaseChar);
      } else {
        const parsedUser = JSON.stringify(user);
        localStorage.setItem('credentials', parsedUser);
        const inMemoryTasks = localStorage.getItem('taskNames');
        if (inMemoryTasks !== null) {
          let parsedInMemoryTasks = inMemoryTasks.split(',');
          parsedInMemoryTasks.forEach(function (task) {
            localStorage.removeItem(task);
          });
          localStorage.removeItem('taskNames');
        }
        $('#alert-warning-login').hide();
        $('#alert-success-new-account').fadeIn('slow');
      }
    }
  },
  userNotAuthorized: function () {
    $('#alert-warning-login').fadeIn('slow');
  }
};

const tableManagement = {
  sortTable: function (column, direction) {
    let table, rows, switching, i, x, y, shouldSwitch, shouldBreak;
    table = document.getElementById("task-table");
    switching = true;
    while (switching) {
      switching = false;
      rows = table.rows;
      for (i = 1; i < (rows.length - 1); i++) {
        shouldSwitch = false;
        shouldBreak = false;
        x = rows[i].getElementsByTagName("TD")[column];
        y = rows[i + 1].getElementsByTagName("TD")[column];
        switch (direction) {
          case "asc":
            if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
              shouldSwitch = true;
              shouldBreak = true;
            }
            break;
          case "desc":
            if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
              shouldSwitch = true;
              shouldBreak = true;
            }
            break;
        }
        if (shouldBreak)
          break;
      }
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
  },
  populateTable: function (data) {
    if (data !== null) {
      let tasksKeys = data.split(',');
      tasksKeys.forEach(storageManagement.fetchTask);
    }
  },
  creteNewCell: function (row, index) {
    const cell = row.insertCell(index);
    return cell;
  },
  prepareNewRow: function (table, index, className) {
    const row = table.insertRow(index);
    row.classList.add('task-' + className.toLowerCase());
    return row;
  },
  appendCellValue: function (cell, value) {
    cell.innerHTML = value;
    return cell;
  },
  setCellAttribute: function (cell, attribute, attributeValue) {
    cell.setAttribute(attribute, attributeValue);
    return cell;
  },
  appendToTable: function (parsedTask, taskKey) {
    const taskTable = document.getElementById('task-table-body');
    const row = tableManagement.prepareNewRow(taskTable, tableIndexToAppend, parsedTask.priority);
    const taskNameCell = tableManagement.creteNewCell(row, tableIndexToAppend);
    const taskPriorityCell = tableManagement.creteNewCell(row, tableIndexToAppend);
    const taskBinCell = tableManagement.creteNewCell(row, tableIndexToAppend);
    tableManagement.appendCellValue(taskNameCell, parsedTask.name);
    tableManagement.appendCellValue(taskPriorityCell, priorityMark + parsedTask.priority);
    tableManagement.appendCellValue(taskBinCell, trashBinMark);
    tableManagement.appendCellValue(taskBinCell, trashBinMark);
    tableManagement.setCellAttribute(taskBinCell.firstChild, 'id', taskKey);
  },
  reloadTableBody: function () {
    $("#task-table-body").empty();
    let tasksKeysFromLocalStorage = storageManagement.loadDataFromLocalStorage();
    tableManagement.populateTable(tasksKeysFromLocalStorage);
  }
};

const taskManagement = {
  submitNewTask: function () {
    if (taskManagement.validateForm(document.getElementById("new-task-name").value)) {
      let task = {
        name: document.getElementById("new-task-name").value,
        priority: document.getElementById("new-task-priority").value
      }
      document.getElementById('new-task-name').value = '';
      $("#new-task-priority").select2("val", "Low");
      storageManagement.submitTask(task);
      tableManagement.reloadTableBody();
    }
  },
  getRandomIndex: function (max) {
    max = Math.floor(max);
    return Math.floor(Math.random() * (max + 1));
  },
  validateForm: function (input) {
    if (input == 'undefined') {
      alert(objectNotSelected);
    } else {
      if (!input.replace(/\s/g, '').length) {
        alert(nameEmptyAlert);
        return false;
      } else {
        return true;
      }
    }
  },
  generateTaskName: function () {
    let currentTime = new Date();
    let key = currentTime.getFullYear().toString() +
      currentTime.getMonth().toString() +
      currentTime.getDate().toString() +
      currentTime.getHours().toString() +
      currentTime.getMinutes().toString() +
      currentTime.getSeconds().toString() +
      currentTime.getMilliseconds().toString() +
      Math.random();
    return key;
  }
};

const fileOperations = {
  prepareFileToDownload: function () {
    let tasksObject = [];
    let tasksKeysFromLocalStorage = storageManagement.loadDataFromLocalStorage();
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
    dlAnchorElem.setAttribute("href", dataToDownload);
    dlAnchorElem.setAttribute("download", downloadFileName);
  },
  openFileMouseEventHandler: function (elem) {
    const eventMouse = document.createEvent("MouseEvents");
    eventMouse.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    elem.dispatchEvent(eventMouse);
  },
  openFile: function (func) {
    readFile = function (e) {
      const file = e.target.files[0];
      if (!file) {
        return;
      }
      let reader = new FileReader();
      reader.onload = function (e) {
        let contents = e.target.result;
        fileInput.func(contents);
        document.body.removeChild(fileInput)
      };
      reader.readAsText(file)
    };
    fileInput = document.createElement("input");
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    fileInput.onchange = readFile;
    fileInput.func = func;
    document.body.appendChild(fileInput);
    fileOperations.openFileMouseEventHandler(fileInput);
  }
};

const apiHandle = {
  fetchFakeObjects: function (type) {
    apiHandle.clearFakeObjectDropdown();
    let randomObjectsFromApi = [];
    fetch(dataFetchApi + type)
      .then(response => response.json())
      .then(json => {
        for (let apiIterator = 0; apiIterator < numberOfRecordsToFetchFromApi; apiIterator++) {
          let randomIndex = taskManagement.getRandomIndex(json.length);
          $.each(json.slice(randomIndex, randomIndex + 1), function (i, data) {
            randomObjectsFromApi.push(data);
            apiHandle.populateFakeObjectDropdown(data, type);
          });
        }
      })
  },
  populateFakeObjectDropdown: function (data, type) {
    const objectDropdown = document.getElementById('fake-objects');
    const newOption = document.createElement("option");
    switch (type) {
      case 'todos':
      case 'posts':
        newOption.text = data.title;
        newOption.value = data.title;
        break;
      case 'comments':
        newOption.text = data.name;
        newOption.value = data.name;
        break;
      default:
        newOption.text = null;
    }
    objectDropdown.add(newOption);
  },
  clearFakeObjectDropdown: function () {
    const objectDropdown = document.getElementById('fake-objects');
    $('#fake-objects')
      .empty()
      .select2()
      .append(dropdownDefaultValue)
    ;
  },
  saveFakeTask: function (object) {
    const objectDropdown = document.getElementById('fake-objects');
    if (taskManagement.validateForm(objectDropdown.value)) {
      const taskNameToSave = objectDropdown.options[objectDropdown.selectedIndex].value;
      let task = {
        name: taskNameToSave,
        priority: fakeObjectDefaultPriority
      }
      storageManagement.submitTask(task);
      tableManagement.reloadTableBody();
    }
    $("#new-fetch-type").select2("val", "");
    $("#fake-objects").empty().select2("val", "");
  },
};

function onPageLoaded() {
  $(document).delegate('.btn-delete-task', 'click', function () {
    const confirmResult = confirm(deleteMessage);
    if (confirmResult) {
      storageManagement.deleteTask(this.id);
    }
  });
};

document.getElementById("btn-save-to-file").addEventListener("click", fileOperations.prepareFileToDownload);
document.getElementById("new-task-submit").addEventListener("click", taskManagement.submitNewTask);
document.getElementById("btn-login").addEventListener("click", identityManagement.requestLogin);
document.getElementById("btn-new-account").addEventListener("click", identityManagement.createAccount);
document.getElementById("task-name-sort").addEventListener("click", function () {
  tableManagement.sortTable(0, 'asc');
}, false);
document.getElementById("task-priority-sort").addEventListener("click", function () {
  tableManagement.sortTable(1, 'asc');
}, false);
document.getElementById("task-name-sort-desc").addEventListener("click", function () {
  tableManagement.sortTable(0, 'desc');
}, false);
document.getElementById("task-priority-sort-desc").addEventListener("click", function () {
  tableManagement.sortTable(1, 'desc');
}, false);
document.getElementById("btn-load-from-file").addEventListener("click", function () {
  fileOperations.openFile(storageManagement.parseJsonTasksToObject);
}, false);
document.getElementById("btn-fake-add-task").addEventListener("click", apiHandle.saveFakeTask);
const loaded = document.addEventListener("DOMContentLoaded", onPageLoaded);
