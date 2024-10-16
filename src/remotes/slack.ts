import axios from "axios";

export async function sendSlackNotify(payload: string, mention?: boolean) {
  const data =
    typeof payload === "string"
      ? { content: `${payload}${mention ? ` <@1137655771048443934>` : ""}` }
      : payload;

  axios.post(
    "https://discord.com/api/webhooks/1296010580909363200/CwFvAsMaoi5dVWiss8x0CXW4HegfUcaFHoLc6-lBu1Zr5XcYr5FsBorLGOFNHL8tDrj2",
    {
      data,
    }
  );
}
