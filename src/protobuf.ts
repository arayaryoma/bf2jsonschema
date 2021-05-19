export type ScalarType =
  | "double"
  | "float"
  | "int32"
  | "uint32"
  | "sint32"
  | "fixed32"
  | "sfixed32"
  | "int64"
  | "uint64"
  | "sint64"
  | "fixed64"
  | "sfixed64"
  | "string"
  | "bool"
  | "bytes";

export type FieldRule = "optional" | "required" | "repeated";

export type FieldId = number;

export type FieldJson = {
  rule?: FieldRule;
  type: ScalarType;
  id: FieldId;
};
