import React, { useEffect, useReducer, useState } from "react";
import { render, Text, Box, useInput } from "ink";
import { ApiProvider } from "@reduxjs/toolkit/query/react";

import {
  api,
  useChannelQuery,
  useLoginMutation,
  useSendMessageMutation,
} from "./api";

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
        username: "RTK-User",
      });
      charTyped("");
    }
  });

  useEffect(() => {
    login("RTKQ client user");
  }, []);

  return (
    <Box flexDirection="row" alignItems="flex-end" {...props}>
      <Text>{JSON.stringify(result.data)}</Text>
      <Text>#: {userInput}</Text>
    </Box>
  );
};

render(
  <ApiProvider api={api}>
    <Chat width={80} height={5} />
  </ApiProvider>
);
