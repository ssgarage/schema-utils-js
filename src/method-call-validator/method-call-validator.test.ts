import MethodCallValidator from "./method-call-validator";
import { OpenRPC } from "@open-rpc/meta-schema";
import MethodCallParameterValidationError from "./parameter-validation-error";
import MethodCallMethodNotFoundError from "./method-not-found-error";

const getExampleSchema = (): OpenRPC => ({
  info: { title: "123", version: "1" },
  methods: [
    {
      name: "foo",
      params: [{ name: "foofoo", schema: { type: "string" } }],
      result: { name: "foofoo", schema: { type: "integer" } },
    },
  ],
  openrpc: "1.0.0-rc1",
}) as OpenRPC;

describe("MethodCallValidator", () => {
  it("can be instantiated", () => {
    const example = getExampleSchema();
    expect(new MethodCallValidator(example)).toBeInstanceOf(MethodCallValidator);
  });

  it("can validate a method call", () => {
    const example = getExampleSchema();
    const methodCallValidator = new MethodCallValidator(example);
    const result = methodCallValidator.validate("foo", ["foobar"]);
    expect(result).toEqual([]);
  });

  it("can handle having params undefined", () => {
    const example = getExampleSchema();
    delete example.methods[0].params;
    const methodCallValidator = new MethodCallValidator(example);
    const result = methodCallValidator.validate("foo", ["foobar"]);
    expect(result).toEqual([]);
  });

  it("can handle having schema undefined", () => {
    const example = getExampleSchema() as any;
    delete example.methods[0].params[0].schema;
    const methodCallValidator = new MethodCallValidator(example);
    const result = methodCallValidator.validate("foo", ["foobar"]);
    expect(result).toEqual([]);
  });

  it("returns array of errors if invalid", () => {
    const example = getExampleSchema() as any;
    const methodCallValidator = new MethodCallValidator(example);
    const result = methodCallValidator.validate("foo", [123]) as MethodCallParameterValidationError[];
    expect(result.length).toBe(1);
    expect(result[0]).toBeInstanceOf(MethodCallParameterValidationError);
  });

  it("can not error if param is optional", () => {
    const example = getExampleSchema() as any;
    const methodCallValidator = new MethodCallValidator(example);
    const result = methodCallValidator.validate("foo", []);
    expect(result).toEqual([]);
  });

  it("rpc.discover is allowed", () => {
    const example = getExampleSchema() as any;
    const methodCallValidator = new MethodCallValidator(example);
    const result = methodCallValidator.validate("rpc.discover", []);
    expect(result).toEqual([]);
  });

  it("returns method not found error when the method name is invalid", () => {
    const example = getExampleSchema() as any;
    const methodCallValidator = new MethodCallValidator(example);
    const result = methodCallValidator.validate("boo", ["123"]);
    expect(result).toBeInstanceOf(MethodCallMethodNotFoundError);
  });
});
