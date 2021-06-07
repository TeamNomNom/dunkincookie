class ForceObject {
  constructor(m, G) {
    this.m = m;
    this.G = G;
  }

  computeg(rsquared) {
    var res = (-this.G * this.m) / rsquared;
    return res;
  }
}
