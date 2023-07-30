"use strict";

const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDB({ region: "us-east-1" });
const dbDocClient = DynamoDBDocumentClient.from(client);
const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME;

const send = (statusCode, data) => {
  return {
    statusCode,
    body: JSON.stringify(data),
  };
};

module.exports.createNote = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let data = JSON.parse(event.body);

  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Item: {
        notesId: data.id,
        title: data.title,
        body: data.body,
      },
      ConditionExpression: "attribute_not_exists(notesId)",
    };

    await dbDocClient.send(new PutCommand(params));
    //callback(null, send(201, data));
    return send(201, data);
  } catch (err) {
    //callback(null, send(500, err.message));
    return send(500, err.message);
  }
};

module.exports.updateNote = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let notesId = event.pathParameters.id;
  let data = JSON.parse(event.body);

  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { notesId },
      UpdateExpression: "set #title = :title, #body = :body",
      ExpressionAttributeNames: {
        "#title": "title",
        "#body": "body",
      },
      ExpressionAttributeValues: {
        ":title": data.title,
        ":body": data.body,
      },
      ConditionExpression: "attribute_exists(notesId)",
    };

    await dbDocClient.send(new UpdateCommand(params));

    return send(200, data);
  } catch (err) {
    return send(500, err.message);
  }
};

module.exports.deleteNote = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let notesId = event.pathParameters.id;

  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { notesId },
      ConditionExpression: "attribute_exists(notesId)",
    };

    await dbDocClient.send(DeleteCommand(params));
    return send(200, data);
  } catch (err) {
    return send(500, err.message);
  }
};

module.exports.getAllNotes = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  console.log(JSON.stringify(event));
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
    };

    const notes = await dbDocClient.send(new ScanCommand(params));
    return send(200, notes);
  } catch (err) {
    return send(500, err.message);
  }
};
