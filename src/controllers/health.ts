import express from "express";

export const health = async (req: express.Request, res: express.Response) => {
  console.log("App is up!");
  return res.sendStatus(200);
};
