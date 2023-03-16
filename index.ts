import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const databaseId = process.env.NOTION_DATABASE_ID;

const queryDailyRetrospects = async () => {
  try {
    const result = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "Database",
        select: {
          equals: "Daily Retrospect",
        },
      },
    });
    console.log(result);
  } catch (error) {
    console.log(error);
  }
};

queryDailyRetrospects();
