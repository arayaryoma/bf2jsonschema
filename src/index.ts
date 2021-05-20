import fs from "fs/promises";
import path from "path";
import { Root, Type } from "protobufjs";
import { camelToKebab } from "./util/camel-to-kebab";
import { JSONSchema7 as JsonSchema, JSONSchema7TypeName } from "json-schema";
import { FieldJson, ScalarType } from "./protobuf";

export async function convertFile(
  filepath: string,
  outDir: string
): Promise<void> {
  const root = await new Root().load(filepath, { keepCase: true });
  if (!root.nested) return;
  for (const key of Object.keys(root.nested)) {
    const type = root.lookupType(key);
    if (type) {
      await createSchema(outDir, type);
    }
  }
}

async function createSchema(outDir: string, type: Type) {
  const jsonFilePath = await makeJsonFile(
    outDir,
    camelToKebab(type.name) + ".json"
  );

  const schema: JsonSchema = {
    $schema: "http://json-schema.org/draft-07/schema",
    type: "object",
    properties: {},
    additionalProperties: true,
  };

  const requiredFields = [];

  for (const key of Object.keys(type.fields)) {
    const field = type.get(key);
    if (!field) continue;
    const json = field.toJSON() as FieldJson;
    if (json.rule === "required") {
      requiredFields.push(field.name);
    }

    schema.properties![field.name] = {
      type: mapProtobufScalarTypesToJsonSchemaTypes(json.type),
    };
    schema.required = requiredFields;
  }
  console.log(schema);
  await fs.writeFile(jsonFilePath, JSON.stringify(schema));
}

async function makeJsonFile(outDir: string, fileName: string): Promise<string> {
  try {
    await fs.stat(outDir);
  } catch {
    fs.mkdir(outDir);
  }
  const filePath = path.resolve(outDir, fileName);
  await fs.writeFile(filePath, "");
  return filePath;
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
