import axios from "axios";
import express from "express";
import fs from "fs";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

let app = express();
let port = process.env.PORT ?? 3000;
const TIANDITU_KEY = process.env.TIANDITU_KEY ?? "";
const DATA_DIR = process.env.DATA_DIR ?? "./Data";
createDataDir(DATA_DIR);

app.use(cors());
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.get("/api/data", (req, res) => {
  res.json({ message: "Data received" });
});

app.get("/api/aa", (req, res) => {
  res.json({ message: "Data received" });
});

app.get("/DataServer", async (req, res) => {
  const T = req.query.T?.toString() ?? "";
  const x = req.query.x?.toString() ?? "";
  const y = req.query.y?.toString() ?? "";
  const z = req.query.l?.toString() ?? "";
  let cacheFilePath = `${DATA_DIR}/${T}_${x}_${y}_${z}.json`;
  let data = {
    T,
    x,
    y,
    z,
    time: Date.now(),
    base64: "",
    ContentType: "",
  };

  if (
    parseFloat(z) > 18 ||
    (parseFloat(z) > 14 && (T.includes("ter") || T.includes("cta")))
  ) {
    console.log("max zoom");
    data.base64 =
      "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";
    data.ContentType = "image/png";
    res.header("Content-Type", data.ContentType);
    res.send(Buffer.from(data.base64, "base64"));
    return;
  }

  try {
    await fs.promises.access(cacheFilePath, fs.constants.F_OK);
    console.log(`File ${cacheFilePath} exists`);
    await fs.promises.readFile(cacheFilePath, "utf8").then(async (content) => {
      data = JSON.parse(content);
      // if (Date.now() - data.time > 86400000) {
      //   await reqTianditu(T, x, y, z, data)
      //     .then(async () => {
      //       console.log(`request success`);
      //       res
      //         .header("Content-Type", data.ContentType)
      //         .send(Buffer.from(data.base64, "base64"));
      //       await fs.promises
      //         .writeFile(cacheFilePath, JSON.stringify(data))
      //         .then(() => {
      //           console.log(`File ${cacheFilePath} written successfully`);
      //         })
      //         .catch((error) => {
      //           console.log(
      //             `File ${cacheFilePath} could not be written ${error}`,
      //           );
      //         });
      //     })
      //     .catch((error) => {
      //       console.log("reqest error", error.message);
      //     });
      // } else {
      //   res
      //     .header("Content-Type", data.ContentType)
      //     .send(Buffer.from(data.base64, "base64"));
      // }
      res
        .header("Content-Type", data.ContentType)
        .send(Buffer.from(data.base64, "base64"));
    });
  } catch {
    console.log(`File ${cacheFilePath} does not exist`);
    await reqTianditu(T, x, y, z, data)
      .then(async () => {
        console.log(`request success`);
        res
          .header("Content-Type", data.ContentType)
          .send(Buffer.from(data.base64, "base64"));
        await fs.promises
          .writeFile(cacheFilePath, JSON.stringify(data))
          .then(() => {
            console.log(`File ${cacheFilePath} written successfully`);
          })
          .catch((error) => {
            console.log(`File ${cacheFilePath} could not be written ${error}`);
          });
      })
      .catch((error) => {
        console.log("reqest error", error.message);
      });
  }
});

function cacheData(key: string, value: any) {}

async function createDataDir(dir: string) {
  fs.access(dir, fs.constants.F_OK, (err) => {
    if (err) {
      console.log(`Data directory ${dir} does not exist`);
      fs.mkdir(dir, (err) => {
        if (err) {
          console.error(`Failed to create data directory ${dir}: ${err}`);
        } else {
          console.log(`Data directory ${dir} created`);
        }
      });
    } else {
      console.log(`Data directory ${dir} already exists`);
    }
  });
}

async function reqTianditu(
  T: string,
  x: string,
  y: string,
  z: string,
  data: any,
) {
  await axios
    .get(
      `http://t0.tianditu.gov.cn/DataServer?T=${T}&x=${x}&y=${y}&l=${z}&tk=${TIANDITU_KEY}`,
      {
        responseType: "arraybuffer",
      },
    )
    .then((response) => {
      let base64 = Buffer.from(response.data, "binary").toString("base64");
      let contentType: string =
        response.headers["content-type"]?.toString() ?? "";
      data.base64 = base64;
      data.ContentType = contentType;
      return Promise.resolve(data);
    })
    .catch((error) => {
      console.error(error);
      return Promise.reject(error);
    });
}
