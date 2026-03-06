import { exercises } from "./exercises";

function esc(s: string) {
  return s.replace(/'/g, "''");
}

function arr(items: string[]) {
  return `ARRAY[${items.map((i) => `'${esc(i)}'`).join(",")}]`;
}

const values = exercises
  .map(
    (ex) =>
      `('${esc(ex.name)}','${ex.method}','${ex.category}','${ex.difficulty}',${arr(ex.muscle_groups)},'${esc(ex.description)}',${arr(ex.cues)},${ex.default_duration})`,
  )
  .join(",\n");

console.log(`INSERT INTO exercises (name, method, category, difficulty, muscle_groups, description, cues, default_duration) VALUES
${values};`);
