export async function retry<V>(fun: () => V, times: number) {
  let restTimes = 0;
  do {
    try {
      return await fun();
    } catch (e) {
      if (restTimes >= times) {
        throw e;
      }
      restTimes += 1;
    }
  } while (true);
}
