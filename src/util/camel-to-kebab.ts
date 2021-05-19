export function camelToKebab(str: string): string {
  return str
    .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2")
    .replace(/^-/g, "")
    .toLowerCase();
}

console.log(camelToKebab("HelloWorld"));
console.log(camelToKebab("helloWorld"));
