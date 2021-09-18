// import https from "https";
// import { resolve } from "path";
import fetch from "node-fetch";
import createEstimator, { FetchDataReader } from "mp3-duration-estimate";
import { logger } from "../global/globals";

export const isAudioOk = async (url: string): Promise<boolean> => {
  try {
    const estimator = createEstimator(new FetchDataReader(fetch));
    const duration = await estimator(url);
    if ((!duration && duration !== 0) || duration > 15) return false;
    return true;
  } catch (error) {
    logger.error(error);
  }

  // return new Promise((resolve, reject) => {
  //   const req = https.get(url);

  //   req.on("response", async (res) => {
  //     req.end();
  //     const estimator = createEstimator(new FetchDataReader(fetch));
  //     const duration = await estimator(url);
  //     if (res.statusCode !== 200 || duration > 10) {
  //       resolve(false);
  //       return;
  //     }
  //     resolve(true);
  //   });

  //   req.on("error", (err) => {
  //     reject(err);
  //   });
  // });
};
