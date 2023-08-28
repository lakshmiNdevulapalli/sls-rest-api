"use strict";

import { APIGatewayEvent, Context, APIGatewayProxyCallback } from "aws-lambda";
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; // Note this import

// Create an instance of DynamoDBClient
const client = new DynamoDBClient({ region: "us-east-1" });

// Create DynamoDB Document Client
const dbDocClient = DynamoDBDocumentClient.from(client);

const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME;

const send = (statusCode: number, data: string) => {
  return {
    statusCode,
    body: JSON.stringify(data),
  };
};

export const createNote = async (
  event: APIGatewayEvent,
  context: Context,
  callback: APIGatewayProxyCallback
) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let data = JSON.parse(event.body as string);

  try {
    const params = {
      TableName: NOTES_TABLE_NAME as string,
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
  } catch (err: unknown) {
    //callback(null, send(500, err.message));
    if (err instanceof Error) {
      return send(500, err.message);
    }
  }
};

export const updateNote = async (
  event: APIGatewayEvent,
  context: Context,
  callback: APIGatewayProxyCallback
) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let notesId = event.pathParameters?.id;
  let data = JSON.parse(event.body as string);

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
  } catch (err: unknown) {
    //callback(null, send(500, err.message));
    if (err instanceof Error) {
      return send(500, err.message);
    }
  }
};

export const deleteNote = async (
  event: APIGatewayEvent,
  context: Context,
  callback: APIGatewayProxyCallback
) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let notesId = event.pathParameters?.id;

  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { notesId },
      ConditionExpression: "attribute_exists(notesId)",
    };

    const command = new DeleteCommand(params);

    const data = await dbDocClient.send(command);
    return send(200, JSON.stringify(data));
  } catch (err: unknown) {
    //callback(null, send(500, err.message));
    if (err instanceof Error) {
      return send(500, err.message);
    }
  }
};

export const getAllNotes = async (
  event: APIGatewayEvent,
  context: Context,
  callback: APIGatewayProxyCallback
) => {
  context.callbackWaitsForEmptyEventLoop = false;
  console.log(JSON.stringify(event));
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
    };

    const notes = await dbDocClient.send(new ScanCommand(params));
    return send(200, JSON.stringify(notes));
  } catch (err: unknown) {
    //callback(null, send(500, err.message));
    if (err instanceof Error) {
      return send(500, err.message);
    }
  }
};
