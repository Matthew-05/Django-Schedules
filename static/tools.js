(function () {
  window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    console.log(`The viewport's width is ${width} and the height is ${height}.`);
  })
});
