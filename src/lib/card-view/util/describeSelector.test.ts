import { describeSelector } from "./describeSelector.js";

describe("describeSelector", () => {
  it("describes the root selector", () => {
    expect(describeSelector({ root: true })).toEqual({
      kind: "root",
      value: "whole document",
    });
  });

  it("describes a jsonPath selector", () => {
    expect(describeSelector({ jsonPath: "$.paths.foo" })).toEqual({
      kind: "jsonPath",
      value: "$.paths.foo",
    });
  });

  it("describes an operation selector", () => {
    expect(describeSelector({ operation: "getStars" })).toEqual({
      kind: "operation",
      value: "getStars",
    });
  });

  it("describes an operation parameter with context", () => {
    expect(
      describeSelector({ operation: "getStars", parameter: "catalogId" }),
    ).toEqual({
      kind: "parameter",
      value: "catalogId",
      context: "in operation getStars",
    });
  });

  it("describes an operation return type with context", () => {
    expect(
      describeSelector({ operation: "getStars", returnType: true }),
    ).toEqual({
      kind: "returnType",
      value: "return type",
      context: "of operation getStars",
    });
  });

  it("describes a propertyType anchored on its parent", () => {
    expect(
      describeSelector({ entityType: "Star", propertyType: "magnitude" }),
    ).toEqual({
      kind: "propertyType",
      value: "magnitude",
      context: "on Star",
    });
  });

  it("falls back to JSON string for an unrecognised selector", () => {
    expect(describeSelector({} as never)).toEqual({
      kind: "unknown",
      value: "{}",
    });
  });
});
