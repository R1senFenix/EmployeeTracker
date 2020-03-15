create database employee_handler;

use employee_handler;

create table employee(
id int not null auto_increment,
first_name varchar(30) not null,
last_name varchar(30),
role_id int ,
manager_id int,
primary key (id)

);

create table role(
id int not null auto_increment,
title varchar(30) not null,
salary decimal(10, 2),
department_id int,
primary key(id)
);

create table department(
id int not null auto_increment,
name varchar(30) not null,
primary key(id)
);

ALTER TABLE employee ADD CONSTRAINT 
    FOREIGN KEY (role_id) REFERENCES users(id);
    
ALTER TABLE employee ADD CONSTRAINT 
    FOREIGN KEY (manager_id) REFERENCES users(id);
    
    ALTER TABLE role ADD CONSTRAINT 
    FOREIGN KEY (department_id) REFERENCES department(id);  