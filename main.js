"use strict";

const BinomialProportion = require("binomial-proportion");
const { jStat } = require("jstat");

const METHODS = [
  "invbeta",
  "clopper_pearson",
  "normal",
  "wilson",
  "agresti_coull",
];

const calcInterval = (method, controlValues) => {
  const n = controlValues.trials;
  const x = controlValues.successes;
  const a = 1 - controlValues.quantile / 100;
  const pop = controlValues.population;
  const p = x / n;
  const p_pop = p * pop;
  let pbl;
  let pbu;
  switch (method) {
    case "invbeta":
      pbl = jStat.beta.inv(a / 2, x, n - x + 1);
      pbu = jStat.beta.inv(1 - a / 2, x + 1, n - x);
      break;
    case "clopper_pearson":
      // Note: for FINV in MS Office Excel,
      // jStat.centralF.inv(p,a,b) = FINV(1-p,a,b)
      const fl1 = 2 * (n - x + 1);
      const fl2 = 2 * x;
      const fl = jStat.centralF.inv(1 - a / 2, fl1, fl2);
      pbl = 1 / (1 + (fl1 * fl) / fl2);
      const fu1 = 2 * (x + 1);
      const fu2 = 2 * (n - x);
      const fu = jStat.centralF.inv(1 - a / 2, fu1, fu2);
      pbu = 1 / (1 + fu2 / (fu1 * fu));
      break;
    case "normal":
    case "wilson":
    case "agresti_coull":
      const resultOfBinomialProportion = BinomialProportion(x, n, a, method);
      pbl = resultOfBinomialProportion.lowerBound;
      pbu = resultOfBinomialProportion.upperBound;
      break;
  }
  const pbl_pop = pbl * pop;
  const pbu_pop = pbu * pop;
  return {
    method,
    pbl,
    pbl_pop,
    p,
    p_pop,
    pbu,
    pbu_pop,
  };
};

const getControlValues = (controls) => {
  const trials = Number(controls.querySelector("input[name=trials]").value);
  const successes = Number(
    controls.querySelector("input[name=successes]").value
  );
  const quantile = Number(controls.querySelector("input[name=quantile]").value);
  const population = Number(
    controls.querySelector("input[name=population]").value
  );
  return { trials, successes, quantile, population };
};

const setResultRow = (resultTable, result) => {
  const row = resultTable.querySelector(`tr[data-method=${result.method}]`);
  row.querySelector('span[data-col-type="pbl"]').textContent = result.pbl * 100;
  row.querySelector('span[data-col-type="pbl_pop"]').textContent =
    result.pbl_pop;
  row.querySelector('span[data-col-type="p"]').textContent = result.p * 100;
  row.querySelector('span[data-col-type="p_pop"]').textContent = result.p_pop;
  row.querySelector('span[data-col-type="pbu"]').textContent = result.pbu * 100;
  row.querySelector('span[data-col-type="pbu_pop"]').textContent =
    result.pbu_pop;
};

const bindEvents = (controls, resultTable) => {
  controls
    .querySelector(".controls-form")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      const controlValues = getControlValues(controls);
      METHODS.forEach((method) => {
        setResultRow(resultTable, calcInterval(method, controlValues));
      });
    });
};

const init = () => {
  const controls = document.querySelector(".controls-container");
  const resultTable = document.querySelector(".result");
  bindEvents(controls, resultTable);
};

init();
