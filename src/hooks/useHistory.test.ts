import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useHistory } from "./useHistory";

describe("useHistory", () => {
  it("initializes with present state and empty history by default", () => {
    const { result } = renderHook(() => useHistory<number>(10));

    expect(result.current.state).toBe(10);
    expect(result.current.past).toEqual([]);
    expect(result.current.future).toEqual([]);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("pushes to history on setState when saveToHistory is true", () => {
    const { result } = renderHook(() => useHistory<number>(0));

    act(() => {
      result.current.setState(1);
      result.current.setState(2);
    });

    expect(result.current.state).toBe(2);
    expect(result.current.past).toEqual([0, 1]);
    expect(result.current.future).toEqual([]);
    expect(result.current.canUndo).toBe(true);
  });

  it("updates present without pushing history when saveToHistory is false", () => {
    const { result } = renderHook(() => useHistory<number>(0));

    act(() => {
      result.current.setState(1, false);
    });

    expect(result.current.state).toBe(1);
    expect(result.current.past).toEqual([]);
    expect(result.current.canUndo).toBe(false);
  });

  it("supports undo and redo transitions", () => {
    const { result } = renderHook(() => useHistory<number>(0));

    act(() => {
      result.current.setState(1);
      result.current.setState(2);
      result.current.undo();
    });
    expect(result.current.state).toBe(1);
    expect(result.current.past).toEqual([0]);
    expect(result.current.future).toEqual([2]);
    expect(result.current.canRedo).toBe(true);

    act(() => {
      result.current.redo();
    });
    expect(result.current.state).toBe(2);
    expect(result.current.past).toEqual([0, 1]);
    expect(result.current.future).toEqual([]);
  });

  it("enforces the configured history depth", () => {
    const { result } = renderHook(() => useHistory<number>(0, 2));

    act(() => {
      result.current.setState(1);
      result.current.setState(2);
      result.current.setState(3);
    });

    expect(result.current.state).toBe(3);
    expect(result.current.past).toEqual([1, 2]);
  });

  it("supports function updaters against the latest committed present value", () => {
    const { result } = renderHook(() => useHistory<number>(0));

    act(() => {
      result.current.setState((prev) => prev + 1);
    });
    act(() => {
      result.current.setState((prev) => prev + 1, false);
    });

    expect(result.current.state).toBe(2);
    expect(result.current.past).toEqual([0]);
  });

  it("replaces present/past/future in one operation", () => {
    const { result } = renderHook(() => useHistory<number>(0));

    act(() => {
      result.current.replace(42, [10, 20], [100]);
    });

    expect(result.current.state).toBe(42);
    expect(result.current.past).toEqual([10, 20]);
    expect(result.current.future).toEqual([100]);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(true);
  });
});
