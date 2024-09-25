import { subMinutes } from "date-fns";
import { CrossChainMessage } from "entites/index";
import { format } from "date-fns";
import { sendSlackNotify } from "remotes/slack";
import { getRepository } from "remotes/database";
import { startJob } from "utils/starJob";

const messageRepo = getRepository(CrossChainMessage);

export async function startAnomalyMonitor() {
  await sendSlackNotify("모니터 시작");
  await startJob(async () => {
    const count = await messageRepo
      .createQueryBuilder("cross_chain_message")
      .select()
      .where("cross_chain_message.status = 1")
      .andWhere("cross_chain_message.time < (:time)", {
        time: format(subMinutes(new Date(), 5), "yyyy-MM-dd HH:mm:ss"),
      })
      .getCount();
    if (count > 0) {
      await sendSlackNotify("Bridge Server 이상 발생", true);
    }
  }, 30000);
}
