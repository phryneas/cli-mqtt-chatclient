import React, { useEffect, useReducer, useState } from "react";
import { render, Text, Box, useInput } from "ink";
import { ApiProvider } from "@reduxjs/toolkit/query/react";

import {
  api,
  useChannelQuery,
  useLoginMutation,
  useSendMessageMutation,
  Message,
} from "./api";

const colorForAuthor = (author: string) => {
  switch (author.substring(0, 1).toLowerCase()) {
    case "a":
      return "green";
    case "b":
      return "yellow";
    case "r":
      return "blue";
    case "c":
      return "green";
    case "m":
      return "purple";
    default:
      return "red";
  }
};

const ChatMessage = (props: { message: Message }) => {
  return (
    <Box>
      <Text
        color={colorForAuthor(props.message.author)}
      >{`${props.message.author}:`}</Text>
      <Text>{` ${props.message.message}`}</Text>
    </Box>
  );
};

const Chat = (props: { width: number; height: number }) => {
  const [userInput, charTyped] = useReducer(
    (curr: string, char: string) => (char ? curr + char : ""),
    ""
  );

  const result = useChannelQuery("#");

  const [login] = useLoginMutation();
  const [sendMessage] = useSendMessageMutation();

  useInput((input, key) => {
    if (key.escape) {
      process.exit(0);
    }
    if (input) {
      charTyped(input);
    }

    if (key.return) {
      sendMessage({
        message: userInput,
        topic: "general",
        username: "Rolle",
      });
      charTyped("");
    }
  });

  useEffect(() => {
    login("RTKQ client user");
  }, []);

  return (
    <Box flexDirection="row" alignItems="flex-end" {...props}>
      <Box flexDirection="column-reverse">
        <Text>#: {userInput}</Text>
        <Box flexDirection="column">
          {result.data?.messages.map((message) => {
            return <ChatMessage message={message} />;
          })}
        </Box>
      </Box>
    </Box>
  );
};

render(
  <ApiProvider api={api}>
    <Chat width={80} height={20} />
  </ApiProvider>
);
