import express from "express";
import os from "os";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    uptime: `${(process.uptime() / 60).toFixed(2)} min`,
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    hostname: os.hostname(),
    uptime: `${(process.uptime() / 60).toFixed(2)} min`,
    timestamp: new Date().toISOString(),
  });
});

app.get("/info", (_req, res) => {
  const totalMem = os.totalmem() / 1024 / 1024 / 1024;
  const freeMem = os.freemem() / 1024 / 1024 / 1024;
  const usedMem = totalMem - freeMem;

  res.json({
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    pid: process.pid,
    cpu: {
      cores: os.cpus().length,
      model: os.cpus()[0].model,
      speed: `${os.cpus()[0].speed} MHz`,
    },
    memory: {
      total: `${totalMem.toFixed(2)} GB`,
      used: `${usedMem.toFixed(2)} GB`,
      free: `${freeMem.toFixed(2)} GB`,
      usagePercent: `${((usedMem / totalMem) * 100).toFixed(1)}%`,
    },
    uptime: {
      system: `${(os.uptime() / 60 / 60).toFixed(2)} hours`,
      process: `${(process.uptime() / 60).toFixed(2)} min`,
    },
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
