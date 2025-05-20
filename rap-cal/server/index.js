import express from "express";
import "dotenv/config";
import { availability } from "./utils/availability.js";
import { rank } from "./js/rankUnits.js";
import { assign } from "./js/assignTimeSlots.js";

// const units = [
//   {
//     name: "Applied Cryptography",
//     description: "",
//     level: "year 3",
//   },
//   {
//     name: "Compiler Design",
//     description: "",
//     level: "year 3",
//   },
//   {
//     name: "Computer Graphics",
//     description: "",
//     level: "year 3",
//   },
//   {
//     name: "Computer Systems Security",
//     description: "",
//     level: "year 3",
//   },
//   {
//     name: "Generic Programming",
//     description: "",
//     level: "year 3",
//   },
//   {
//     name: "Human Computer Interface",
//     description: "",
//     level: "year 3",
//   },
// ];
// const timeSlots = await availability();
// const rankedUnits = await rank(units);
// console.log("Ranked Units:", rankedUnits);
// console.log("Time Slots:", timeSlots);
// const assignment = await assign(rankedUnits, timeSlots);

// console.log("Assignment:", assignment);

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/studyPlan", async (req, res) => {
  // const units = [
  //   {
  //     name: "Mathematics 101",
  //     description: "Introduction to basic algebra and geometry",
  //     level: "year 1",
  //   },
  //   {
  //     name: "Physics 101",
  //     description: "Fundamentals of mechanics and thermodynamics",
  //     level: "year 1",
  //   },
  //   {
  //     name: "Chemistry 101",
  //     description: "Basics of chemical reactions and periodic table",
  //     level: "year 1",
  //   },
  //   {
  //     name: "Biology 101",
  //     description: "Introduction to cell biology and genetics",
  //     level: "year 1",
  //   },
  //   {
  //     name: "Computer Science 101",
  //     description: "Basics of programming and algorithms",
  //     level: "year 1",
  //   },
  //   {
  //     name: "History 101",
  //     description: "Overview of ancient civilizations",
  //     level: "year 1",
  //   },
  //   {
  //     name: "Economics 101",
  //     description: "Introduction to microeconomics and macroeconomics",
  //     level: "year 1",
  //   },
  //   {
  //     name: "Literature 101",
  //     description: "Study of classic literary works",
  //     level: "year 1",
  //   },
  //   {
  //     name: "Philosophy 101",
  //     description: "Introduction to philosophical concepts and thinkers",
  //     level: "year 1",
  //   },
  // ];
  // const timeSlots = await availability();
  // const rankedUnits = await rank(units);
  // const assignment = await assign(rankedUnits, timeSlots);
  // console.log("Assignment:", assignment);
});

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
