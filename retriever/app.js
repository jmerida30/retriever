"use strict";

const AWS = require("aws-sdk");

const Create = require("./usecases/create");
const Get = require("./usecases/get");
const List = require("./usecases/list");
const TableRepo = require("./persistence/table_repo");

const dynamoDb = new AWS.DynamoDB();
const lambda = new AWS.Lambda();

const tableRepo = new TableRepo(dynamoDb, "MyTodoTable");

let create = new Create(tableRepo);
let get = new Get(tableRepo);
let list = new List(tableRepo);


