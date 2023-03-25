import { Client } from "@notionhq/client";
import { DateTime } from "luxon";
import QuickChart from "quickchart-js";

import type {
  PageObjectResponse,
  PartialPageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

type Month = {
  readonly start: number;
  readonly end: number;
};

const createRange = () => {
  const dt = DateTime.now();
  const targetRange: Month[] = [];

  for (let i = 0; i < 5; i++) {
    const month = dt.minus({ month: i });
    targetRange.push({
      start: month.startOf("month").toMillis(),
      end: month.endOf("month").toMillis(),
    });
  }

  return targetRange;
};

type dailyRetrospects = (PageObjectResponse | PartialPageObjectResponse)[];

const filterTargetData = (data: dailyRetrospects, { start, end }: Month) =>
  data.filter((item) => {
    const itemDate = DateTime.fromISO(item.created_time).toMillis();
    return itemDate >= start && itemDate <= end;
  });

const getTargetRangeData = (
  data: (PageObjectResponse | PartialPageObjectResponse)[],
  ranges: Month[]
) =>
  ranges.map((range, i) => ({
    date: DateTime.now().minus({ month: i }).toFormat("yyyy/MM"),
    entry: filterTargetData(data, range).length,
  }));

const queryDailyRetrospects = async () => {
  try {
    const data = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "Database",
        select: {
          equals: "Daily Retrospect",
        },
      },
    });
    const ranges = createRange();
    const result = getTargetRangeData(data.results, ranges).reverse();

    const myChart = new QuickChart();
    myChart
      .setConfig({
        type: "bar",
        data: {
          labels: result.map(({ date }) => date),
          datasets: [
            {
              label: "Daily Retrospects",
              data: result.map(({ entry }) => entry),
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

queryDailyRetrospects();
