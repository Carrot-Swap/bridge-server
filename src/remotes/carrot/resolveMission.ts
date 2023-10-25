import { MISSION_KEY } from "constants/env";
import { carrotRequester } from "./requester";

export async function resolveMission(list: string[]) {
  const res = await carrotRequester.post<boolean>(
    `/transaction/bridge/confirm`,
    {
      list,
      key: MISSION_KEY(),
    }
  );
  return res.data;
}
