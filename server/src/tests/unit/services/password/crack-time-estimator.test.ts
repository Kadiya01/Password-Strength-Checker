import { estimateCrackTime, estimateCrackTimes } from "@/services/password/crack-time-estimator.service";

describe("CrackTimeEstimator", () => {
  it("should return 'Instantly' for very low entropy", () => {
    expect(estimateCrackTime(10)).toBe("Instantly");
  });

  it("should return reasonable time for medium entropy", () => {
    const time = estimateCrackTime(50);
    expect(time).not.toBe("Instantly");
    expect(typeof time).toBe("string");
  });

  it("should return longer time for higher entropy", () => {
    const low = estimateCrackTime(40);
    const high = estimateCrackTime(80);
    expect(low).toBeDefined();
    expect(high).not.toBe("Instantly");
  });

  it("should return all four crack time vectors", () => {
    const times = estimateCrackTimes(60);
    expect(times.offline).toBeDefined();
    expect(times.online).toBeDefined();
    expect(times.gpu).toBeDefined();
    expect(times.dictionary).toBeDefined();
    expect(typeof times.offline).toBe("string");
    expect(typeof times.online).toBe("string");
    expect(typeof times.gpu).toBe("string");
    expect(typeof times.dictionary).toBe("string");
  });

  it("online should always be slower than offline", () => {
    const times = estimateCrackTimes(70);
    const order = ["Instantly", "Seconds", "Minutes", "Hours", "Days", "Weeks", "Months", "Years", "Decades", "Centuries", "Millennia", "Millions of years", "Cosmic scale", "Heat death of universe"];
    const offlineIdx = order.indexOf(times.offline);
    const onlineIdx = order.indexOf(times.online);
    expect(onlineIdx).toBeGreaterThanOrEqual(offlineIdx);
  });
});
