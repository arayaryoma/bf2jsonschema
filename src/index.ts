import fs from "fs/promises";
import path from "path";
import { load, Message, ReflectionObject, Type } from "protobufjs";
import { camelToKebab } from "./util/camel-to-kebab";
import { JSONSchema7 as JsonSchema, JSONSchema7TypeName } from "json-schema";

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

function mapProtobufScalarTypesToJsonSchemaTypes(
  protbufType: ScalarType
): JSONSchema7TypeName {
  switch (protbufType) {
    case "float":
    case "double":
      return "number";

    case "int32":
    case "int64":
    case "sint32":
    case "sint64":
    case "fixed32":
    case "fixed64":
    case "sfixed32":
    case "sfixed64":
    case "uint32":
    case "uint64":
      return "integer";

    case "string":
      return "string";

    case "bytes":
      return "array";

    case "bool":
      return "boolean";
  }
}
