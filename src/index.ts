import fs from "fs/promises";
import path from "path";
import { load, Message, ReflectionObject, Type } from "protobufjs";
import { camelToKebab } from "./util/camel-to-kebab";

export async function convertFile(
  filepath: string,
  outDir: string
): Promise<void> {
  const root = await load(filepath);
  if (!root.nested) return;
  for (const key of Object.keys(root.nested)) {
    const type = root.lookupType(key);
    if (type) {
      await createSchema(outDir, type);
    }
  }
}

async function createSchema(outDir: string, type: Type) {
  try {
    await fs.stat(outDir);
  } catch {
    fs.mkdir(outDir);
  }

  const filename = camelToKebab(type.name) + ".json";
  await fs.writeFile(path.resolve(outDir, filename), "");
}

convertFile(
  path.resolve(__dirname, "testdata", "search.proto"),
  path.resolve(__dirname, "testdata", "json")
).then(() => {
  process.exit(0);
});
