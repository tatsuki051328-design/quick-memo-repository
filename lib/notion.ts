import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID!;
const DIARY_DB_ID = process.env.NOTION_DIARY_DB_ID!;

export type MemoCategory = "work" | "private" | "diary";

export interface CreateMemoInput {
  title: string;
  body?: string;
  category: MemoCategory;
  url?: string;
}

export async function createMemo(input: CreateMemoInput): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  await notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties: {
      Title: { title: [{ text: { content: input.title } }] },
      Body: { rich_text: input.body ? [{ text: { content: input.body } }] : [] },
      Category: { select: { name: input.category === "work" ? "Work" : "private" } },
      Channel: { select: { name: "INBOX" } },
      URL: { url: input.url || null },
      Date: { date: { start: today } },
    },
  });
}

export async function addMomentLog(text: string): Promise<void> {
  const todayISO = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
  const timeStr = new Date().toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
    hour12: false,
  });
  const newEntry = `[${timeStr}] ${text}`;

  const response = await notion.databases.query({
    database_id: DIARY_DB_ID,
    filter: { property: "Day", date: { equals: todayISO } },
  });

  if (response.results.length > 0) {
    const page = response.results[0] as any;
    const existingProp = page.properties["Moment Log"];
    const existingText: string =
      existingProp?.rich_text?.length > 0
        ? existingProp.rich_text.map((r: any) => r.plain_text).join("")
        : "";
    const updatedText = existingText ? `${existingText}\n${newEntry}` : newEntry;
    await notion.pages.update({
      page_id: page.id,
      properties: {
        "Moment Log": { rich_text: [{ text: { content: updatedText } }] },
      },
    });
  } else {
    await notion.pages.create({
      parent: { database_id: DIARY_DB_ID },
      properties: {
        Day: { date: { start: todayISO } },
        "Moment Log": { rich_text: [{ text: { content: newEntry } }] },
      },
    });
  }
}
