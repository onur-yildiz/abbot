import https from "https";

export const isUrlReachable = (url: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const req = https.get(url);

    req.on("response", (res) => {
      req.end();
      if (res.statusCode !== 200) resolve(false);
      resolve(true);
    });

    req.on("error", (err) => {
      reject(err);
    });
  });
};
