import { MISSION_KEY } from "constants/env";
import { carrotRequester } from "./requester";

export async function resolveMission(
  id: number,
  payload: { discordId: string; address?: string }
) {
  const res = await carrotRequester.post<boolean>(`/mission/${id}`, {
    ...payload,
    key: MISSION_KEY(),
  });
  return res.data;
}
