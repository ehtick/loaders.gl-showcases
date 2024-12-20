import puppeteer, { type Page } from "puppeteer";
import { clickAndNavigate } from "../../utils/testing-utils/utils";
import { configurePage } from "../../utils/testing-utils/configure-tests";

describe("Dashboard Default View", () => {
  let browser;
  let page: Page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await configurePage(page);
    await page.setViewport({ width: 1366, height: 768 });
    await page.goto("http://localhost:3000");
  });

  afterAll(() => browser.close());

  it("Should automatically redirect from '/' path", async () => {
    const currentUrl = page.url();
    expect(currentUrl).toBe("http://localhost:3000/dashboard");
  });

  it("Contains header", async () => {
    await page.waitForSelector("#header-logo");
    const text = await page.$eval("#header-logo", (e) => e.textContent);
    expect(text).toContain("I3S Explorer");
  });

  it("Contains page links", async () => {
    await page.waitForSelector("#header-links-default");

    const linksParent = await page.$("#header-links-default");
    expect(linksParent).not.toBeNull();
    if (linksParent) {
      expect(
        await linksParent.$$eval("a", (nodes) => nodes.map((n) => n.innerText))
      ).toEqual(["Home", "Viewer", "Debug", "GitHub"]);
    }

    await page.waitForSelector("#compare-default-button");
    const text = await page.$eval(
      "#compare-default-button",
      (e) => e.textContent
    );
    expect(text).toContain("Compare");
  });

  it("Contains dashboard canvas", async () => {
    await page.waitForSelector("#dashboard-app");

    const dashboardCanvas = await page.$("#dashboard-app");
    expect(dashboardCanvas).not.toBeNull();
  });

  it("Should go to the Viewer page", async () => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector("#header-links-default");

    const currentUrl = await clickAndNavigate(
      page,
      "a[href='/viewer']",
      "tileset="
    );
    expect(currentUrl).toContain(
      "http://localhost:3000/viewer?tileset=san-francisco-v1_7"
    );
    const controlPanel = await page.$("#viewer--tools-panel");
    expect(controlPanel).not.toBeNull();
  });

  it("Should go to the Debug page", async () => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector("#header-links-default");
    const currentUrl = await clickAndNavigate(
      page,
      "a[href='/debug']",
      "tileset="
    );
    expect(currentUrl).toContain(
      "http://localhost:3000/debug?tileset=san-francisco-v1_7"
    );
    const toolBar = await page.$("#debug-tools-panel");
    expect(toolBar).not.toBeNull();
  });

  it("Should go to the Comparison Across Layers Page", async () => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector("#compare-default-button");
    await page.click("#compare-default-button");
    await page.hover("a[href='/compare-across-layers']");
    const currentUrl = await clickAndNavigate(
      page,
      "a[href='/compare-across-layers']"
    );
    expect(currentUrl).toBe("http://localhost:3000/compare-across-layers");
  });

  it("Should go to the Comparison Withhin Layer Page", async () => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector("#compare-default-button");
    await page.click("#compare-default-button");
    await page.hover("a[href='/compare-within-layer']");
    const currentUrl = await clickAndNavigate(
      page,
      "a[href='/compare-within-layer']"
    );
    expect(currentUrl).toBe("http://localhost:3000/compare-within-layer");
  });

  it("Should go to the project GitHub page", async () => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector("#header-links-default");
    const currentUrl = await clickAndNavigate(
      page,
      "a[href='https://github.com/visgl/loaders.gl-showcases']"
    );

    expect(currentUrl).toBe("https://github.com/visgl/loaders.gl-showcases");
    await page.goto("http://localhost:3000");
  });

  it("Should return from viewer page to Dashboard", async () => {
    await page.goto("http://localhost:3000/viewer");
    const currentUrl = await clickAndNavigate(page, "a[href='/dashboard']");
    expect(currentUrl).toBe("http://localhost:3000/dashboard");
    const dashboardCanvas = await page.$("#dashboard-app");
    expect(dashboardCanvas).not.toBeNull();
  });

  it("Should contain help button", async () => {
    await page.waitForSelector("#help-button-default");
    const text = await page.$eval("#help-button-default", (e) => e.textContent);
    expect(text).toContain("Help");
  });

  it("Should contain theme button", async () => {
    await page.waitForSelector("#toggle-button-default");
    const themeButton = await page.$("#toggle-button-default");
    const darkButton = await page.$("#toggle-dark-default");
    const lightButton = await page.$("#toggle-light-default");

    expect(themeButton).not.toBeNull();
    expect(darkButton).not.toBeNull();
    expect(lightButton).not.toBeNull();
  });

  it("Should switch between themes", async () => {
    await page.waitForSelector("#header-container");

    // Check default theme colors of header elements
    expect(
      await page.$eval("#header-container", (el) =>
        getComputedStyle(el).getPropertyValue("background-color")
      )
    ).toEqual("rgb(35, 36, 48)");

    const linksParentDefault = await page.$("#header-links-default");
    expect(linksParentDefault).not.toBeNull();
    if (linksParentDefault) {
      expect(
        await linksParentDefault.$$eval("a", (nodes) =>
          nodes.map((n) => getComputedStyle(n).getPropertyValue("color"))
        )
      ).toEqual([
        "rgb(96, 194, 164)",
        "rgb(255, 255, 255)",
        "rgb(255, 255, 255)",
        "rgb(255, 255, 255)",
      ]);
    }

    expect(
      await page.$eval("#header-logo", (element) =>
        getComputedStyle(element).getPropertyValue("color")
      )
    ).toEqual("rgb(255, 255, 255)");

    // Check light theme colors of header elements
    await page.click("#toggle-light-default");
    await page.waitForSelector("#header-container");

    const lightColor = await page.$eval("#header-container", (el) =>
      getComputedStyle(el).getPropertyValue("background-color")
    );
    expect(lightColor).toEqual("rgb(255, 255, 255)");

    const linksParentLight = await page.$("#header-links-default");
    expect(linksParentLight).not.toBeNull();
    if (linksParentLight) {
      expect(
        await linksParentLight.$$eval("a", (nodes) =>
          nodes.map((n) => getComputedStyle(n).getPropertyValue("color"))
        )
      ).toEqual([
        "rgb(96, 194, 164)",
        "rgb(35, 36, 48)",
        "rgb(35, 36, 48)",
        "rgb(35, 36, 48)",
      ]);
    }

    expect(
      await page.$eval("#header-logo", (element) =>
        getComputedStyle(element).getPropertyValue("color")
      )
    ).toEqual("rgb(35, 36, 48)");

    // Check dark theme colors of header elements
    await page.click("#toggle-dark-default");
    await page.waitForSelector("#header-container");

    const darkColor = await page.$eval("#header-container", (el) =>
      getComputedStyle(el).getPropertyValue("background-color")
    );
    expect(darkColor).toEqual("rgb(35, 36, 48)");

    const linksParentDark = await page.$("#header-links-default");
    expect(linksParentDark).not.toBeNull();
    if (linksParentDark) {
      expect(
        await linksParentDark.$$eval("a", (nodes) =>
          nodes.map((n) => getComputedStyle(n).getPropertyValue("color"))
        )
      ).toEqual([
        "rgb(96, 194, 164)",
        "rgb(255, 255, 255)",
        "rgb(255, 255, 255)",
        "rgb(255, 255, 255)",
      ]);
    }

    expect(
      await page.$eval("#header-logo", (element) =>
        getComputedStyle(element).getPropertyValue("color")
      )
    ).toEqual("rgb(255, 255, 255)");
  }, 90000);

  it("Should contain dashboard container", async () => {
    await page.waitForSelector("#dashboard-container");

    expect(
      await page.$eval("#dashboard-container", (e) =>
        getComputedStyle(e).getPropertyValue("background-image")
      )
    ).toEqual("url(\"http://localhost:3000/tools-background.webp\")");
  });

  it("Should contain tools container", async () => {
    await page.waitForSelector("#tools-description-container");

    const toolsDescriptionContainer = await page.$("#tools-wrapper");
    const appShowcase = await page.$("#app-showcase");
    expect(toolsDescriptionContainer).not.toBeNull();
    expect(appShowcase).toBeNull();
  });

  it("Should contain tools description container", async () => {
    await page.waitForSelector("#tools-description-container");

    const toolsDescription = await page.$("#tools-description-container");
    expect(toolsDescription).not.toBeNull();
  });

  it("Should contain mac image", async () => {
    await page.waitForSelector("#mac-image");

    const macImage = await page.$("#mac-image");
    expect(macImage).not.toBeNull();
  });

  it("Should contain iphone image", async () => {
    await page.waitForSelector("#iphone-image");

    const iphoneImage = await page.$("#iphone-image");
    expect(iphoneImage).not.toBeNull();
  });

  it("Should contain tool items", async () => {
    await page.waitForSelector("#tools-item-viewer");
    await page.waitForSelector("#tools-item-debug");
    await page.waitForSelector("#tools-item-comparison");

    const viwerText = await page.$eval(
      "#tools-item-viewer",
      (e) => e.textContent
    );
    const debugText = await page.$eval(
      "#tools-item-debug",
      (e) => e.textContent
    );
    const comparisonText = await page.$eval(
      "#tools-item-comparison",
      (e) => e.textContent
    );

    expect(viwerText).toContain(
      "Visualize multiple I3S datasets and 3d scenes at once. Gain insights into data correctness and performance."
    );
    expect(debugText).toContain(
      "Validate and explore each tile individually. Catch visualization errors and debug data easily, directly in your browser."
    );
    expect(comparisonText).toContain(
      "Compare different, or one dataset before and after data conversion. Look for conversion errors and memory anomalies."
    );
  });

  it("Should go to viewer page from tools description", async () => {
    await page.waitForSelector("#viewer-link");
    const currentUrl = await clickAndNavigate(page, "#viewer-link", "tileset=");
    expect(currentUrl).toContain(
      "http://localhost:3000/viewer?tileset=san-francisco-v1_7"
    );
  });

  it("Should go to debug page from tools description", async () => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector("#debug-link");
    const currentUrl = await clickAndNavigate(page, "#debug-link", "tileset=");
    expect(currentUrl).toContain(
      "http://localhost:3000/debug?tileset=san-francisco-v1_7"
    );
  });

  it("Should go to the Comparison Across Layers Page", async () => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector("#comparison-link");
    const currentUrl = await clickAndNavigate(page, "#comparison-link");
    expect(currentUrl).toBe("http://localhost:3000/compare-across-layers");
  });
});

describe("Dashboard Tablet or Mobile view", () => {
  let browser;
  let page: Page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await configurePage(page);
    await page.goto("http://localhost:3000");
  });

  afterAll(() => browser.close());

  it("Should contain title", async () => {
    await page.waitForSelector("#dashboard-title");
    const text = await page.$eval("#dashboard-title", (e) => e.textContent);
    expect(text).toContain(
      "Explore and Debug I3S Data with one Simple and Easy-to-Use Tool"
    );

    await page.waitForSelector("#green-text");
    expect(
      await page.$eval("#green-text", (e) =>
        getComputedStyle(e).getPropertyValue("color")
      )
    ).toEqual("rgb(96, 194, 164)");
  });

  it("Should contain app showcase image", async () => {
    await page.waitForSelector("#app-showcase");

    const qppShowCaseImage = await page.$("#app-showcase");
    expect(qppShowCaseImage).not.toBeNull();
  });

  it("Should automatically redirect from '/' path", async () => {
    const currentUrl = page.url();
    expect(currentUrl).toBe("http://localhost:3000/dashboard");
  });

  it("Contains header items", async () => {
    await page.waitForSelector("#header-logo");
    await page.waitForSelector("#burger-menu");

    const text = await page.$eval("#header-logo", (e) => e.textContent);
    expect(text).toContain("I3S Explorer");

    expect(await page.$("#burger-menu")).not.toBeNull();

    await page.click("#burger-menu");
    await page.waitForSelector("#close-header-menu");
    expect(await page.$("#close-header-menu")).not.toBeNull();
    expect(await page.$("#tablet-or-mobile-menu")).not.toBeNull();
    await page.click("#close-header-menu");
    expect(!(await page.$("#tablet-or-mobile-menu")));
  });

  it("Should have items in header menu", async () => {
    await page.waitForSelector("#burger-menu");
    await page.click("#burger-menu");
    await page.waitForSelector("#header-links");

    const linksParent = await page.$("#header-links");
    expect(linksParent).not.toBeNull();
    if (linksParent) {
      expect(
        await linksParent.$$eval("a", (nodes) => nodes.map((n) => n.innerText))
      ).toEqual(["Home", "Viewer", "Debug", "GitHub"]);
    }

    await page.waitForSelector("#compare-tablet-or-mobile-button");
    const compareText = await page.$eval(
      "#compare-tablet-or-mobile-button",
      (e) => e.textContent
    );
    expect(compareText).toContain("Compare");

    await page.waitForSelector("#help-button-tablet-or-mobile");
    const helpText = await page.$eval(
      "#help-button-tablet-or-mobile",
      (e) => e.textContent
    );
    expect(helpText).toContain("Help");

    await page.click("#close-header-menu");
    await page.waitForSelector("#burger-menu");
  });

  it("Contains dashboard canvas", async () => {
    await page.waitForSelector("#dashboard-app");

    const dashboardCanvas = await page.$("#dashboard-app");
    expect(dashboardCanvas).not.toBeNull();
  });

  it("Should go to the Viewer page", async () => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector("#burger-menu");
    await page.click("#burger-menu");
    await page.waitForSelector("#header-links");
    const currentUrl = await clickAndNavigate(
      page,
      "a[href='/viewer']",
      "tileset="
    );
    expect(currentUrl).toContain(
      "http://localhost:3000/viewer?tileset=san-francisco-v1_7"
    );
    const controlPanel = await page.$("#viewer--tools-panel");
    expect(controlPanel).not.toBeNull();
    expect(!(await page.$("#tablet-or-mobile-menu")));
  });

  it("Should go to the Debug page", async () => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector("#burger-menu");
    await page.click("#burger-menu");
    await page.waitForSelector("#header-links");
    const currentUrl = await clickAndNavigate(
      page,
      "a[href='/debug']",
      "tileset="
    );
    expect(currentUrl).toContain(
      "http://localhost:3000/debug?tileset=san-francisco-v1_7"
    );
    const toolBar = await page.$("#debug-tools-panel");
    expect(toolBar).not.toBeNull();
    expect(!(await page.$("#tablet-or-mobile-menu")));
  });

  it("Should go to the project GitHub page", async () => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector("#burger-menu");
    await page.click("#burger-menu");
    await page.waitForSelector("#header-links");
    const currentUrl = await clickAndNavigate(
      page,
      "a[href='https://github.com/visgl/loaders.gl-showcases']"
    );

    expect(currentUrl).toBe("https://github.com/visgl/loaders.gl-showcases");
    expect(!(await page.$("#tablet-or-mobile-menu")));
  });

  it("Should return from viewer page to Dashboard", async () => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector("#burger-menu");
    await page.click("#burger-menu");
    await page.waitForSelector("#header-links");
    const currentUrl = await clickAndNavigate(page, "a[href='/dashboard']");
    expect(currentUrl).toBe("http://localhost:3000/dashboard");
    const dashboardCanvas = await page.$("#dashboard-app");
    expect(dashboardCanvas).not.toBeNull();
    expect(!(await page.$("#tablet-or-mobile-menu")));
  });

  it("Should open and close compare menu", async () => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector("#burger-menu");
    await page.click("#burger-menu");
    await page.waitForSelector("#compare-tablet-or-mobile-button");
    await page.click("#compare-tablet-or-mobile-button");
    await page.waitForSelector("#across-layers-item");
    await page.waitForSelector("#within-layer-item");

    expect(await page.$("#across-layers-item")).not.toBeNull();
    expect(await page.$("#within-layer-item")).not.toBeNull();

    expect(
      await page.$eval("#across-layers-item", (e) => e.textContent)
    ).toContain("Across Layers");
    expect(
      await page.$eval("#within-layer-item", (e) => e.textContent)
    ).toContain("Within a Layer");

    await page.click("#compare-tablet-or-mobile-button");

    expect(!(await page.$("#across-layers-item")));
    expect(!(await page.$("#within-layer-item")));
  });

  it("Should go to the Comparison Across Layers Page", async () => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector("#burger-menu");
    await page.click("#burger-menu");
    await page.waitForSelector("#compare-tablet-or-mobile-button");
    await page.click("#compare-tablet-or-mobile-button");

    await page.hover("a[href='/compare-across-layers']");
    const currentUrl = await clickAndNavigate(
      page,
      "a[href='/compare-across-layers']"
    );

    await page.waitForSelector("#left-deck-container");
    await page.waitForSelector("#right-deck-container");

    expect(await page.$("#left-deck-container")).not.toBeNull();
    expect(await page.$("#right-deck-container")).not.toBeNull();
    expect(currentUrl).toBe("http://localhost:3000/compare-across-layers");
  });

  it("Should go to the Comparison Withhin Layer Page", async () => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector("#burger-menu");
    await page.click("#burger-menu");
    await page.waitForSelector("#compare-tablet-or-mobile-button");
    await page.click("#compare-tablet-or-mobile-button");

    await page.hover("a[href='/compare-within-layer']");
    const currentUrl = await clickAndNavigate(
      page,
      "a[href='/compare-within-layer']"
    );

    await page.waitForSelector("#left-deck-container");
    await page.waitForSelector("#right-deck-container");

    expect(await page.$("#left-deck-container")).not.toBeNull();
    expect(await page.$("#right-deck-container")).not.toBeNull();
    expect(currentUrl).toBe("http://localhost:3000/compare-within-layer");
  });
});
