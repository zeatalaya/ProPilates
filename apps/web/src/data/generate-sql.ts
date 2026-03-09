import { exercises } from "./exercises";

function esc(s: string) {
  return s.replace(/'/g, "''");
}

function arr(items: string[]) {
  return `ARRAY[${items.map((i) => `'${esc(i)}'`).join(",")}]`;
}

function nullable(val: string | null | undefined) {
  return val ? `'${esc(val)}'` : "NULL";
}

function nullableArr(items: string[] | null | undefined) {
  return items ? arr(items) : "NULL";
}

const values = exercises
  .map(
    (ex) =>
      `('${esc(ex.name)}','${ex.method}','${ex.category}','${ex.difficulty}',${arr(ex.muscle_groups)},'${esc(ex.description)}',${arr(ex.cues)},${ex.default_duration},${nullable(ex.objective)},${nullable(ex.apparatus)},${nullable(ex.start_position)},${nullableArr(ex.movement)},${nullable(ex.pace)},${nullable(ex.school)})`,
  )
  .join(",\n");

console.log(`INSERT INTO exercises (name, method, category, difficulty, muscle_groups, description, cues, default_duration, objective, apparatus, start_position, movement, pace, school) VALUES
${values};`);
