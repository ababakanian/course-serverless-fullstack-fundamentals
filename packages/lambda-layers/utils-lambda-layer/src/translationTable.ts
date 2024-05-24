import * as dynamodb from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ITranslatePrimaryKey, ITranslateResult } from "@sff/shared-types";

export class TranslationTable {
  tableName: string;
  partitionKey: string;
  sortKey: string;
  dynamodbClient: dynamodb.DynamoDBClient;

  constructor({
    tableName,
    partitionKey,
    sortKey,
  }: {
    tableName: string;
    partitionKey: string;
    sortKey: string;
  }) {
    this.tableName = tableName;
    this.partitionKey = partitionKey;
    this.sortKey = sortKey;
    this.dynamodbClient = new dynamodb.DynamoDBClient({});
  }

  async insert(data: ITranslateResult) {
    const tableInsetCmd: dynamodb.PutItemCommandInput = {
      TableName: this.tableName,
      Item: marshall(data),
    };

    await this.dynamodbClient.send(new dynamodb.PutItemCommand(tableInsetCmd));
  }

  async query({ username }: ITranslatePrimaryKey) {
    const queryCmd: dynamodb.QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: "#PARTITION_KEY = :username",
      ExpressionAttributeNames: {
        "#PARTITION_KEY": "username",
      },
      ExpressionAttributeValues: {
        ":username": { S: username },
      },
      ScanIndexForward: true,
    };

    const { Items } = await this.dynamodbClient.send(
      new dynamodb.QueryCommand(queryCmd)
    );

    if (!Items) {
      return [];
    }

    const rtnData = Items.map((item) => unmarshall(item) as ITranslateResult);
    return rtnData;
  }

  async delete(item: ITranslatePrimaryKey) {
    const deleteCmd: dynamodb.DeleteItemCommandInput = {
      TableName: this.tableName,
      Key: {
        [this.partitionKey]: { S: item.username },
        [this.sortKey]: { S: item.requestId },
      },
    };

    await this.dynamodbClient.send(new dynamodb.DeleteItemCommand(deleteCmd));
    return item;
  }

  async getAll() {
    const scanCmd: dynamodb.ScanCommandInput = {
      TableName: this.tableName,
    };

    const { Items } = await this.dynamodbClient.send(
      new dynamodb.ScanCommand(scanCmd)
    );

    if (!Items) {
      return [];
    }

    const rtnData = Items.map((item) => unmarshall(item) as ITranslateResult);
    return rtnData;
  }
}
