import axios from "axios";

export async function sendSlackNotify(message: string, mention?: boolean) {
  await axios.post(
    "https://hooks.slack.com/services/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",
    {
      text: `${message}${mention ? ` <@boxfoxsg619>` : ""}`,
      username: "Carrot",
      icon_emoji: ":carrot:",
    }
  );
}
