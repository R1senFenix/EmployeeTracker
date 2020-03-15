var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "greatBay_DB"
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
        message: "How would you like to interact with ?",
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
    ])
        .then(function (answer) {
            // when finished prompting, insert a new item into the db with that info
            let goToTable = answer.whatchange;
            if (goToTable === "departments") {
                insertIntodepartment();
            }
            else if (goToTable === "roles") {

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
                                chosenItem = results[i].id;
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
                                console.log("The department was created successfully!");
                                // re-prompt the user for if they want to bid or post
                                start();
                            }
                        );
                    });
                    insertIntoRoles(answer);
                } else if (goToTable === "employees") {
                    insertIntoEmployees(answer);
                } else if (goToTable === "back") {
                    start();
                }

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



    connection.query(
        "INSERT INTO department SET ?",
        {
            name: answer.item,
            category: answer.category,
            starting_bid: answer.startingBid || 0,
            highest_bid: answer.startingBid || 0
        },
        function (err) {
            if (err) throw err;
            console.log("Your auction was created successfully!");
            // re-prompt the user for if they want to bid or post
            start();
        }
    );
}

function bidAuction() {
    // query the database for all items being auctioned
    connection.query("SELECT * FROM auctions", function (err, results) {
        if (err) throw err;
        // once you have the items, prompt the user for which they'd like to bid on
        inquirer
            .prompt([
                {
                    name: "choice",
                    type: "rawlist",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < results.length; i++) {
                            choiceArray.push(results[i].item_name);
                        }
                        return choiceArray;
                    },
                    message: "What auction would you like to place a bid in?"
                },
                {
                    name: "bid",
                    type: "input",
                    message: "How much would you like to bid?"
                }
            ])
            .then(function (answer) {
                // get the information of the chosen item
                var chosenItem;
                for (var i = 0; i < results.length; i++) {
                    if (results[i].item_name === answer.choice) {
                        chosenItem = results[i];
                    }
                }

                // determine if bid was high enough
                if (chosenItem.highest_bid < parseInt(answer.bid)) {
                    // bid was high enough, so update db, let the user know, and start over
                    connection.query(
                        "UPDATE auctions SET ? WHERE ?",
                        [
                            {
                                highest_bid: answer.bid
                            },
                            {
                                id: chosenItem.id
                            }
                        ],
                        function (error) {
                            if (error) throw err;
                            console.log("Bid placed successfully!");
                            start();
                        }
                    );
                }
                else {
                    // bid wasn't high enough, so apologize and start over
                    console.log("Your bid was too low. Try again...");
                    start();
                }
            });
    });
}