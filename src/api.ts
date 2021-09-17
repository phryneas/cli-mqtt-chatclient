import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { connect, OnMessageCallback } from "mqtt";

import { config } from "dotenv";

export type Message = {
  author: string;
  message: string;
}
config();

const url = `wss://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}`;
console.log(url);
const client = connect(url, {
  clientId: "RTK-Query",
});

const connected = new Promise<void>((resolve) =>
  client.on("connect", (stream) => {
    resolve();
  })
);

export const api = createApi({
  async baseQuery({
    message,
    username,
    topic,
  }: {
    message: string;
    username: string;
    topic: string;
  }) {
    await connected;
    client.publish(topic, JSON.stringify({ message, author: username }));
    return { data: {} };
  },
  endpoints: (build) => ({
    login: build.mutation({
      query(username: string) {
        return { topic: "general", username, message: `${username} logged in` };
      },
    }),
    sendMessage: build.mutation<
      unknown,
      { message: string; topic: string; username: string }
    >({
      query({ message, topic, username }) {
        return { topic, username, message };
      },
    }),
    channel: build.query<{ messages: Message[] }, string>({
      queryFn() {
        return { data: { messages: [] } };
      },
      async onCacheEntryAdded(
        topic,
        { cacheEntryRemoved, updateCachedData, cacheDataLoaded }
      ) {
        await cacheDataLoaded;
        await connected;
        client.subscribe(topic);
        const cb: OnMessageCallback = (topic, payload, packet) => {
          try {
            const message = JSON.parse(payload.toString("utf8"));
            updateCachedData((currentCacheData) => {
              currentCacheData.messages.push(message);
            });
          } catch { }
        };
        client.on("message", cb);
        await cacheEntryRemoved;
        client.off("message", cb);
        client.unsubscribe(topic);
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useChannelQuery,
  useSendMessageMutation,
} = api;
