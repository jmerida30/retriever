"use strict";

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

class TableRepo {
	/**
	 * TableRepo constructor
	 * @param {AWS.DynamoDB} service
	 * @param {string} table
	 */
	constructor(service, table) {
		this.documentClient = new AWS.DynamoDB.DocumentClient({
			convertEmptyValues: true,
			service: service
		});
		this.service = service;
		this.table = table;
		this.keyName = "id";
	}

	async create(item) {
		const currentDateTime = new Date().toISOString();
		const dbItem = Object.assign({}, item, {
			created_at: currentDateTime,
			updated_at: currentDateTime
		});
		if (!dbItem[this.keyName]) {
			dbItem[this.keyName] = uuidv4();
		}
		const putParams = {
			TableName: this.table,
			ConditionExpression: `attribute_not_exists(${this.keyName})`,
			Item: dbItem
		};
		await this.documentClient.put(putParams).promise();
		return dbItem;
	}

	async get(id) {
		const { Item } = await this.documentClient.get({
			TableName: this.table,
			Key: {
				[this.keyName]: id
			},
		}).promise();
		return Item;
	}

	async getBatch(ids) {
		let keys = [];
		ids.forEach(id => {
			keys.push({
				[this.keyName]: id
			});
		});
		let items = [];
		let start = 0;
		while (start < keys.length) {
			let batchParams = {
				RequestItems: {
					[this.table]: {
						Keys: keys.slice(start, start + 100)
					}
				}
			};
			start = start + 100;
			let moreItems = true;
			while (moreItems) {
				moreItems = false;
				let batchOutput = await this.documentClient.batchGet(batchParams).promise();
				if ((batchOutput.Responses) && (batchOutput.Responses[this.table])) {
					batchOutput.Responses[this.table].forEach(item => {
						items.push(item)
					});
				}
				if ((batchOutput.UnprocessedKeys) && (Object.keys(batchOutput.UnprocessedKeys).length > 0)) {
					moreItems = true;
					batchParams.RequestItems = batchOutput.UnprocessedKeys;
				}
			}
		}
		return items;
	}
}

module.exports = TableRepo;
