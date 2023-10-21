import axios from "axios";

export const carrotRequester = axios.create({
  baseURL: "https://5izb5jdhhk.execute-api.ap-northeast-2.amazonaws.com/live",
});
