import { Client } from "@notionhq/client";
import { DateTime } from "luxon";
import QuickChart from "quickchart-js";

import type {
  PageObjectResponse,
  PartialPageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

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
    const { thisMonthData, lastMonthData } = getTargetRangeData(result.results);

    const myChart = new QuickChart();
    myChart
      .setConfig({
        type: "bar",
        data: {
          labels: ["Last Month", "This Month"],
          datasets: [
            {
              label: "Daily Retrospects",
              data: [lastMonthData.data, thisMonthData.data],
            },
          ],
        },
      })
      .setWidth(500)
      .setHeight(300);

    console.log(myChart.getUrl());
  } catch (error) {
    console.log(error);
  }
};

const getTargetRangeData = (
  data: (PageObjectResponse | PartialPageObjectResponse)[]
) => {
  const thisMonthData = data.filter(
    (dailyRetrospect) =>
      DateTime.fromISO(dailyRetrospect.created_time).month ===
      DateTime.now().month
  );
  const lastMonthData = data.filter(
    (dailyRetrospect) =>
      DateTime.fromISO(dailyRetrospect.created_time).month ===
      DateTime.now().month - 1
  );
  console.log();
  return {
    thisMonthData: {
      month: DateTime.now().month,
      data: thisMonthData.length,
    },
    lastMonthData: {
      month: DateTime.now().month - 1,
      data: lastMonthData.length,
    },
  };
};

queryDailyRetrospects();
