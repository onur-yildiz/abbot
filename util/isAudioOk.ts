import https from "https";
// import fetch from "node-fetch";
// import createEstimator, { FetchDataReader } from "mp3-duration-estimate";
import { logger } from "../global/globals";

export const isAudioOk = async (url: string): Promise<boolean> => {
  try {
    // const estimator = createEstimator(new FetchDataReader(fetch));
    // const duration = await estimator(url);
    // if ((!duration && duration !== 0) || duration > 15) return false;
    // return true;
    return new Promise((resolve, reject) => {
      const req = https.get(url);

      req.on("response", async (res) => {
        req.end();
        if (res.statusCode !== 200) {
          resolve(false);
          return;
        }
        resolve(true);
      });

      req.on("error", (err) => {
        reject(err);
      });
    });
  } catch (error) {
    logger.error(error);
  }
};
