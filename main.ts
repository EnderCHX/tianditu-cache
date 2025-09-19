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

  if (parseFloat(z) > 18) {
    data.base64 =
      "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAMAAABrrFhUAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRF////AAAAVcLTfgAAAAF0Uk5TAEDm2GYAAABYSURBVHja7MEBAQAAAICQ/q/uCAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYAAEGAAEPAAG0CHKNAAAAAElFTkSuQmCC";
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
