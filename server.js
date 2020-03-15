var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "employee_handler"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
});

// function which prompts the user for what action they should take
function start() {
    inquirer.prompt({
        name: "interact",
        type: "list",
        message: "How would you like to interact with the Employee Database?",
        choices: ["ADD", "VIEW", "UPDATE", "DELETE", "EXIT"]
    }).then(function (answer) {

        // based on their answer, either call the bid or the post functions
        let interaction = answer.interact;

        switch (interaction) {
            case "ADD":
                addEmployee(interaction);
                break;
            case "VIEW":
                viewEmployee(interaction);
                break;
            case "UPDATE":
                updateTable(interaction);
                break;
            case "DELETE":
                deleteTable(interaction);
                break;
            case "EXIT":
                connection.end();
                break;
            default:
                console.log("Sorry, you have selected a broken link.");
                console.log("Please try again.");
                start();
        }
    });
}

// function to handle posting new items up for auction
function addEmployee() {
    // prompt for info about the item being put up for auction
    inquirer.prompt([
        {
            name: "whatchange",
            type: "list",
            message: "What would you like to ADD to?",
            choices: ["departments", "roles", "employees", "back"]
        }
    ]).then(function (answer) {
        // when finished prompting, insert a new item into the db with that info
        let goToTable = answer.whatchange;
        if (goToTable === "departments") {
            insertIntodepartment(answer);
        }
        else if (goToTable === "roles") {
            insertIntoRoles(answer);
        }
        else if (goToTable === "employees") {
            insertIntoEmployees(answer);
        }
        else if (goToTable === "back") {
            start();
        }
    });
}

function insertIntoEmployees() {
    connection.query("SELECT * FROM department", function (err, managerResults) {
        if (err) throw err;
        connection.query("SELECT * FROM role", function (err, roleResults) {
            if (err) throw err;
            inquirer.prompt([
                {
                    name: "firstName",
                    type: "input",
                    message: "Please enter the first name of the new employee."
                },
                {
                    name: "lastName",
                    type: "input",
                    message: "Please enter the last name of the new employee."
                },
                {
                    name: "managerID",
                    type: "list",
                    message: "Please select the employee's department.",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < managerResults.length; i++) {
                            choiceArray.push(managerResults[i].name);
                        }
                        return choiceArray;
                    },
                },
                {
                    name: "roleID",
                    type: "list",
                    message: "Please select the employee's role.",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < roleResults.length; i++) {
                            choiceArray.push(roleResults[i].title);
                        }
                        return choiceArray;
                    },
                }
            ]).then(function (data) {
                var chosenRoleID;
                var chosenManagerID;
                for (var i = 0; i < roleResults.length; i++) {
                    if (roleResults[i].title === data.roleID) {
                        chosenRoleID = roleResults[i].id;
                    }
                }
                for (var i = 0; i < managerResults.length; i++) {
                    if (managerResults[i].name === data.managerID) {
                        chosenManagerID = managerResults[i].id;
                    }
                }
                if (chosenRoleID === "Manager") {
                    chosenManagerID = null;
                }
                console.log(data);
                connection.query(

                    "INSERT INTO employee SET ?",
                    {
                        first_name: data.firstName,
                        last_name: data.lastName,
                        role_id: chosenRoleID,
                        manager_id: chosenManagerID
                    },
                    function (err) {
                        if (err) throw err;
                        console.log("The employee was entered in the system successfully!");
                        // re-prompt the user for if they want to bid or post
                        start();
                    }
                );
            });
        });
    });
}

function insertIntodepartment() {
    inquirer.prompt([
        {
            name: "name",
            type: "input",
            message: "Please enter the name of the new department."
        }
    ]).then(function (data) {
        let departmentName = data.name;
        connection.query(
            "INSERT INTO department SET ?",
            {
                name: departmentName
            },
            function (err) {
                if (err) throw err;
                console.log("The department was created successfully!");
                // re-prompt the user for if they want to bid or post
                start();
            }
        );
    });


}

function insertIntoRoles() {
    connection.query("SELECT * FROM department", function (err, results) {
        if (err) throw err;
        inquirer.prompt([
            {
                name: "name",
                type: "input",
                message: "Please enter the name of the new role."
            },
            {
                name: "salary",
                type: "input",
                message: "Please enter starting salary."
            },
            {
                name: "department",
                type: "list",
                message: "Please select the department the role is in.",
                choices: function () {
                    var choiceArray = [];
                    for (var i = 0; i < results.length; i++) {
                        choiceArray.push(results[i].name);
                    }
                    return choiceArray;
                },
            }
        ]).then(function (data) {
            var chosenItemID;
            for (var i = 0; i < results.length; i++) {
                if (results[i].name === data.department) {
                    chosenItemID = results[i].id;
                }
            }

            connection.query(
                "INSERT INTO role SET ?",
                {
                    title: data.name,
                    salary: data.salary,
                    department_id: chosenItemID
                },
                function (err) {
                    if (err) throw err;
                    console.log("The role was created successfully!");
                    // re-prompt the user for if they want to bid or post
                    start();
                }
            );
        });
    });
}

function viewEmployee() {
    // prompt for info about the item being put up for auction
    inquirer.prompt([
        {
            name: "whatchange",
            type: "list",
            message: "What would you like to VIEW?",
            choices: ["department", "role", "employee", "back"]
        }
    ]).then(function (answer) {
        // when finished prompting, insert a new item into the db with that info
        let goToTable = answer.whatchange;
        console.log(goToTable);
        showDataTable(goToTable);
    });
}

function showDataTable(goToTable) {
    console.log(goToTable);
    connection.query("SELECT * FROM " + goToTable, function (err, res) {
        if (err) throw err;
        console.log(res);
        start();
    });
}
